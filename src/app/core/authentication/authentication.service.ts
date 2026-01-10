/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
/** rxjs Imports */
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/** 3rd party Imports */
import { OAuthService } from 'angular-oauth2-oidc';
/** Custom Services */
import { AlertService } from '../alert/alert.service';

/** Custom Interceptors */
import { AuthenticationInterceptor } from './authentication.interceptor';

/** Environment Configuration */
import { environment } from '../../../environments/environment';

/** Custom Models */
import { LoginContext } from './login-context.model';
import { Credentials } from './credentials.model';
import { getOAuthConfig, getActiveAuthMode, AuthMode } from './oauth.config';

/**
 * Authentication workflow.
 */
@Injectable()
export class AuthenticationService {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private authenticationInterceptor = inject(AuthenticationInterceptor);
  private oauthService = inject(OAuthService);

  /**
   * Updates the password for the specified user.
   * @param {string} userId Target user identifier.
   * @param {*} passwordObj Payload containing the new password fields.
   * @returns Updated user response observable.
   */
  changePassword(userId: string, passwordObj: any) {
    return this.http.put(`/users/${userId}`, passwordObj);
  }

  private userLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /** Observable that emits authentication state changes. */
  public readonly isAuthenticated$ = this.userLoggedIn$.asObservable();

  /** Denotes whether the user credentials should persist through sessions. */
  private rememberMe = false;
  /**
   * Denotes the type of storage:
   *
   * Session Storage: User credentials should not persist through sessions.
   *
   * Local Storage: User credentials should persist through sessions.
   */
  private storage: Storage = sessionStorage;
  private credentials: Credentials;
  private dialogShown = false;
  private authMode: AuthMode = AuthMode.Basic;

  /** Key to store credentials in storage. */
  private readonly credentialsStorageKey = 'mifosXCredentials';
  /** Key to store two factor authentication token in storage. */
  private readonly twoFactorAuthenticationTokenStorageKey = 'mifosXTwoFactorAuthenticationToken';

  /**
   * Initializes the type of storage and authorization headers depending on whether
   * credentials are presently in storage or not.
   * @param {HttpClient} http Http Client to send requests.
   * @param {AlertService} alertService Alert Service.
   * @param {AuthenticationInterceptor} authenticationInterceptor Authentication Interceptor.
   * @param {OAuthService} oauthService OAuth Service.
   */
  constructor() {
    this.authMode = getActiveAuthMode();

    if (this.authMode !== AuthMode.Basic) {
      this.initializeOAuthService();
    }

    this.restoreSession();
  }

  /**
   * Configures the OAuth service with runtime settings and hooks up token listeners.
   */
  private initializeOAuthService(): void {
    this.oauthService.configure(getOAuthConfig());
    const oauthStorage = environment.enableRememberMe ? localStorage : sessionStorage;
    this.oauthService.setStorage(oauthStorage);
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received' || event.type === 'token_refreshed') {
        this.updateCredentialsToken();
      }
    });

    this.cleanupLegacyStorage();
  }

  /**
   * Restores persisted credentials/tokens from storage and rehydrates the session state.
   */
  private restoreSession(): void {
    const savedCredentials = this.getSavedCredentials();
    if (!savedCredentials) return;

    if (savedCredentials.rememberMe) {
      this.rememberMe = true;
      this.storage = localStorage;
      this.oauthService.setStorage(this.storage);
    }

    if (this.authMode !== AuthMode.Basic) {
      // OAuth2/OIDC: Use angular-oauth2-oidc library for token management
      if (this.oauthService.hasValidAccessToken()) {
        this.authenticationInterceptor.setAuthorizationToken(this.oauthService.getAccessToken());
        this.userLoggedIn$.next(true);
      } else if (this.oauthService.getRefreshToken()) {
        this.oauthService
          .refreshToken()
          .then(() => this.userLoggedIn$.next(true))
          .catch(() => this.logout().subscribe());
      }
    } else {
      // Basic Auth
      this.authenticationInterceptor.setAuthorizationToken(savedCredentials.base64EncodedAuthenticationKey);

      const twoFactorToken = JSON.parse(this.storage.getItem(this.twoFactorAuthenticationTokenStorageKey));
      if (twoFactorToken) {
        this.authenticationInterceptor.setTwoFactorAccessToken(twoFactorToken.token);
      }

      this.userLoggedIn$.next(true);
    }
  }

  /**
   * Persists the latest OAuth access token in both the interceptor and stored credentials.
   */
  private updateCredentialsToken(): void {
    const accessToken = this.oauthService.getAccessToken();
    if (!accessToken) return;

    this.authenticationInterceptor.setAuthorizationToken(accessToken);

    const credentials = this.getCredentials();
    if (credentials) {
      credentials.accessToken = accessToken;
      this.storage.setItem(this.credentialsStorageKey, JSON.stringify(credentials));
    }
  }

  /**
   * Reads the cached credentials from session or local storage, if present.
   * @returns {Credentials | null} Stored credentials or null when absent.
   */
  private getSavedCredentials(): Credentials | null {
    const stored =
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Authenticates the user.
   * @param {LoginContext} loginContext Login parameters.
   * @returns {Observable<boolean>} True if authentication is successful.
   */
  login(loginContext?: LoginContext): Observable<boolean> {
    this.alertService.alert({ type: 'Authentication Start', message: 'Please wait...' });

    if (this.authMode !== AuthMode.Basic) {
      // OAuth2/OIDC: Redirect to authorization server with PKCE
      this.oauthService.initCodeFlow();
      return of(true);
    }

    if (!loginContext) {
      throw new Error('loginContext is required when using Basic authentication');
    }

    this.rememberMe = environment.enableRememberMe ? (loginContext?.remember ?? false) : false;
    this.storage = this.rememberMe ? localStorage : sessionStorage;

    // Basic Auth: Direct authentication with Fineract
    return this.http
      .post('/authentication', {
        username: loginContext.username,
        password: loginContext.password,
        remember: this.rememberMe
      })
      .pipe(
        map((credentials: Credentials) => {
          this.onLoginSuccess(credentials);
          return true;
        })
      );
  }

  /**
   * Fetches user details from the server.
   * @returns {Promise<void>} Promise that resolves when user details are fetched.
   */
  private async getUserDetails(): Promise<void> {
    const accessToken = this.oauthService.getAccessToken();

    return new Promise((resolve, reject) => {
      if (this.authMode === AuthMode.OIDC) {
        const url = `${environment.OIDC.oidcApiUrl}authentication/userdetails`;
        this.http.post<{ object: Credentials }>(url, { token: accessToken }).subscribe({
          next: (response) => {
            const credentials = response.object;
            credentials.accessToken = accessToken;
            this.onLoginSuccess(credentials);
            resolve();
          },
          error: (error) => {
            console.error('Failed to fetch user details:', error);
            reject(error);
          }
        });
      } else if (this.authMode === AuthMode.OAuth2) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
        const url = `${environment.oauth.serverUrl}/userdetails`;
        this.http.get<Credentials>(url, { headers }).subscribe({
          next: (credentials) => {
            credentials.accessToken = accessToken;
            this.onLoginSuccess(credentials);
            resolve();
          },
          error: (error) => {
            console.error('Failed to fetch user details:', error);
            reject(error);
          }
        });
      }
    });
  }

  /**
   * Sets the authorization token followed by one of the following:
   *
   * Sends an alert if two factor authentication is required.
   *
   * Sends an alert if password has expired and requires a reset.
   *
   * Sends an alert on successful login.
   * @param {Credentials} credentials Authenticated user credentials.
   */
  private onLoginSuccess(credentials: Credentials): void {
    this.userLoggedIn$.next(true); // ✅ notify observers
    // Ensure the rememberMe value is preserved in credentials
    credentials.rememberMe = this.rememberMe;

    if (this.authMode !== AuthMode.Basic) {
      this.authenticationInterceptor.setAuthorizationToken(credentials.accessToken);
    } else {
      this.authenticationInterceptor.setAuthorizationToken(credentials.base64EncodedAuthenticationKey);
    }
    if (credentials.isTwoFactorAuthenticationRequired) {
      this.credentials = credentials;
      this.alertService.alert({
        type: 'Two Factor Authentication Required',
        message: 'Two Factor Authentication Required'
      });
    } else {
      if (credentials.shouldRenewPassword) {
        this.credentials = credentials;
        this.alertService.alert({
          type: 'Password Expired',
          message: 'Your password has expired, please reset your password!'
        });
      } else {
        this.setCredentials(credentials);
        this.alertService.alert({
          type: 'Authentication Success',
          message: `${credentials.username} successfully logged in!`
        });
        delete this.credentials;
      }
    }
  }

  /**
   * Handles the OAuth callback.
   * @returns {Promise<boolean>} True if the OAuth callback was successful.
   */
  async handleOAuthCallback(): Promise<boolean> {
    try {
      // index.html preserves the OAuth callback query string in sessionStorage before redirecting to /#/callback, since Angular routing consumes query params before the OAuth library can process them.
      let queryString = sessionStorage.getItem('oauth_callback_query');

      if (queryString) {
        sessionStorage.removeItem('oauth_callback_query');
        await this.oauthService.tryLoginCodeFlow({ customHashFragment: queryString });
      } else {
        await this.oauthService.tryLoginCodeFlow();
      }

      if (this.oauthService.hasValidAccessToken()) {
        await this.getUserDetails();
        return true;
      }

      return false;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return false;
    }
  }

  /**
   * Logs out the authenticated user and clears the credentials from storage.
   * @returns {Observable<boolean>} True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    const twoFactorToken = JSON.parse(this.storage.getItem(this.twoFactorAuthenticationTokenStorageKey));
    if (twoFactorToken) {
      this.http.post('/twofactor/invalidate', { token: twoFactorToken.token }).subscribe();
      this.authenticationInterceptor.removeTwoFactorAuthorization();
    }

    // Clear any pending OAuth callback data
    sessionStorage.removeItem('oauth_callback_query');

    this.authenticationInterceptor.removeAuthorization();
    this.setCredentials();
    this.resetDialog();
    this.userLoggedIn$.next(false);

    if (this.authMode === AuthMode.OIDC) {
      // OIDC: Use library to handle logout (redirects to OIDC provider)
      this.oauthService.logOut();
    } else if (this.authMode === AuthMode.OAuth2) {
      // OAuth2 (Fineract): Clear library tokens and server session
      this.oauthService.logOut(true); // true = don't redirect
      // Call Fineract logout endpoint in a popup to clear server session (includes JSESSIONID cookie)
      // Then close the popup and navigate to login page
      const logoutWindow = window.open(environment.oauth.logoutUrl, '_blank', 'width=100,height=100');
      setTimeout(() => {
        if (logoutWindow) {
          logoutWindow.close();
        }
        window.location.href = `${window.location.origin}/#/login`;
      }, 500);
    }
    return of(true);
  }

  /**
   * Checks if the two factor access token for authenticated user is valid.
   * @returns {boolean} True if the two factor access token is valid or two factor authentication is not required.
   */
  twoFactorAccessTokenIsValid(): boolean {
    const twoFactorAccessToken = JSON.parse(this.storage.getItem(this.twoFactorAuthenticationTokenStorageKey));
    if (twoFactorAccessToken) {
      return new Date().getTime() < twoFactorAccessToken.validTo;
    }
    return true;
  }

  /**
   * Checks if the user is authenticated.
   * @returns {boolean} True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    if (this.authMode !== AuthMode.Basic) {
      return this.oauthService.hasValidAccessToken();
    }
    return !!(this.getSavedCredentials() && this.twoFactorAccessTokenIsValid());
  }

  /**
   * Gets the user credentials.
   * @returns {Credentials} The user credentials if the user is authenticated otherwise null.
   */
  getCredentials(): Credentials | null {
    return JSON.parse(this.storage.getItem(this.credentialsStorageKey));
  }

  /**
   * Sets the user credentials.
   *
   * The credentials may be persisted across sessions by setting the `rememberMe` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   *
   * @param {Credentials} credentials Authenticated user credentials.
   */
  private setCredentials(credentials?: Credentials): void {
    if (credentials) {
      credentials.rememberMe = this.rememberMe;
      // Make sure we're using the correct storage based on rememberMe value
      this.storage = credentials.rememberMe ? localStorage : sessionStorage;
      this.oauthService.setStorage(this.storage);
      this.storage.setItem(this.credentialsStorageKey, JSON.stringify(credentials));
    } else {
      // Clear credentials from both storage types to ensure complete logout
      [
        localStorage,
        sessionStorage
      ].forEach((store) => {
        store.removeItem(this.credentialsStorageKey);
        store.removeItem(this.twoFactorAuthenticationTokenStorageKey);
      });
      this.cleanupLegacyStorage();
    }
  }

  private cleanupLegacyStorage(): void {
    const legacyKeys = [
      'mifosXZitadelTokenDetails',
      'mifosXOAuthTokenDetails',
      'token_start_time',
      'refresh_expires_in',
      'mifosXZitadel',
      'auth_code'
      // Note: Do NOT remove 'PKCE_verifier' here - it's needed by angular-oauth2-oidc for the callback
    ];
    legacyKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Following functions are for two factor authentication and require
   * first level authorization headers to be setup for the requests.
   */

  /**
   * Gets the two factor authentication delivery methods available for the user.
   */
  getDeliveryMethods() {
    return this.http.get('/twofactor');
  }

  showDialog() {
    this.dialogShown = true;
  }

  resetDialog() {
    this.dialogShown = false;
  }

  hasDialogBeenShown() {
    return this.dialogShown;
  }

  /**
   * Requests OTP to be sent via the given delivery method.
   * @param {any} deliveryMethod Delivery method for the OTP.
   */
  requestOTP(deliveryMethod: any) {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('deliveryMethod', deliveryMethod.name);
    httpParams = httpParams.set('extendedToken', this.rememberMe.toString());
    return this.http.post(`/twofactor`, {}, { params: httpParams });
  }

  /**
   * Validates the OTP and authenticates the user on success.
   * @param {string} otp
   */
  validateOTP(otp: string) {
    const httpParams = new HttpParams().set('token', otp);
    return this.http.post(`/twofactor/validate`, {}, { params: httpParams }).pipe(
      map((response) => {
        this.onOTPValidateSuccess(response);
      })
    );
  }

  /**
   * Sets the two factor authorization token followed by one of the following:
   *
   * Sends an alert if password has expired and requires a reset.
   *
   * Sends an alert on successful login.
   * @param {any} response Two factor authentication token details.
   */
  private onOTPValidateSuccess(response: any): void {
    this.authenticationInterceptor.setTwoFactorAccessToken(response.token);
    if (this.credentials.shouldRenewPassword) {
      this.alertService.alert({
        type: 'Password Expired',
        message: 'Your password has expired, please reset your password!'
      });
    } else {
      this.setCredentials(this.credentials);
      this.alertService.alert({
        type: 'Authentication Success',
        message: `${this.credentials.username} successfully logged in!`
      });
      delete this.credentials;
      this.storage.setItem(this.twoFactorAuthenticationTokenStorageKey, JSON.stringify(response));
    }
  }

  /**
   * Resets the user's password and authenticates the user.
   * @param {any} passwordDetails New password.
   */
  resetPassword(passwordDetails: any) {
    return this.http.put(`/users/${this.credentials.userId}`, passwordDetails).pipe(
      map(() => {
        this.alertService.alert({ type: 'Password Reset Success', message: `Your password was sucessfully reset!` });
        this.authenticationInterceptor.removeAuthorization();
        this.authenticationInterceptor.removeTwoFactorAuthorization();
        const loginContext: LoginContext = {
          username: this.credentials.username,
          password: passwordDetails.password,
          remember: this.rememberMe
        };
        this.login(loginContext).subscribe();
      })
    );
  }

  /*
   * Get user logged in
   */
  getUserLoggedIn(): boolean {
    return this.userLoggedIn$.value;
  }
}
