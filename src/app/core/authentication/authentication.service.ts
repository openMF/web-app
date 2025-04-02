/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { AlertService } from '../alert/alert.service';

/** Custom Interceptors */
import { AuthenticationInterceptor } from './authentication.interceptor';

/** Environment Configuration */
import { environment } from '../../../environments/environment';

/** Custom Models */
import { LoginContext } from './login-context.model';
import { Credentials } from './credentials.model';
import { OAuth2Token } from './o-auth2-token.model';

/**
 * Authentication workflow.
 */
@Injectable()
export class AuthenticationService {
  changePassword(userId: string, passwordObj: any) {
    return this.http.put(`/users/${userId}`, passwordObj);
  }
  // User logged in boolean
  private userLoggedIn: boolean;

  /** Denotes whether the user credentials should persist through sessions. */
  private rememberMe: boolean;
  /**
   * Denotes the type of storage:
   *
   * Session Storage: User credentials should not persist through sessions.
   *
   * Local Storage: User credentials should persist through sessions.
   */
  private storage: any;
  /** User credentials. */

  private credentials: Credentials;
  private dialogShown = false;
  /** Key to store credentials in storage. */
  private credentialsStorageKey = 'mifosXCredentials';
  /** Key to store oauth token details in storage. */
  private oAuthTokenDetailsStorageKey = 'mifosXOAuthTokenDetails';
  /** Key to store two factor authentication token in storage. */
  private twoFactorAuthenticationTokenStorageKey = 'mifosXTwoFactorAuthenticationToken';

  /**
   * Initializes the type of storage and authorization headers depending on whether
   * credentials are presently in storage or not.
   * @param {HttpClient} http Http Client to send requests.
   * @param {AlertService} alertService Alert Service.
   * @param {AuthenticationInterceptor} authenticationInterceptor Authentication Interceptor.
   */
  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private authenticationInterceptor: AuthenticationInterceptor
  ) {
    this.userLoggedIn = false;
    this.rememberMe = false;
    this.storage = sessionStorage;
    const savedCredentials = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
    );
    if (savedCredentials) {
      if (savedCredentials.rememberMe) {
        this.rememberMe = true;
        this.storage = localStorage;
      }
      const twoFactorAccessToken = JSON.parse(this.storage.getItem(this.twoFactorAuthenticationTokenStorageKey));
      if (environment.oauth.enabled) {
        this.refreshOAuthAccessToken();
      } else {
        authenticationInterceptor.setAuthorizationToken(savedCredentials.base64EncodedAuthenticationKey);
      }
      if (twoFactorAccessToken) {
        authenticationInterceptor.setTwoFactorAccessToken(twoFactorAccessToken.token);
      }
    }
  }

  /**
   * Authenticates the user.
   * @param {LoginContext} loginContext Login parameters.
   * @returns {Observable<boolean>} True if authentication is successful.
   */
  login(loginContext: LoginContext) {
    this.alertService.alert({ type: 'Authentication Start', message: 'Please wait...' });
    this.rememberMe = loginContext.remember;
    this.storage = this.rememberMe ? localStorage : sessionStorage;

    if (environment.oauth.enabled) {
      let httpParams = new HttpParams();
      httpParams = httpParams.set('username', loginContext.username);
      httpParams = httpParams.set('password', loginContext.password);
      httpParams = httpParams.set('client_id', `${environment.oauth.appId}`);
      httpParams = httpParams.set('grant_type', 'password');
      let headers = new HttpHeaders();
      headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
      return this.http
        .disableApiPrefix()
        .post(`${environment.oauth.serverUrl}/token`, httpParams.toString(), { headers: headers })
        .pipe(
          map((tokenResponse: OAuth2Token) => {
            this.getUserDetails(tokenResponse);
            return of(true);
          })
        );
    } else {
      return this.http
        .post('/authentication', { username: loginContext.username, password: loginContext.password })
        .pipe(
          map((credentials: Credentials) => {
            this.onLoginSuccess(credentials);
            return of(true);
          })
        );
    }
  }

  /**
   * Retrieves the user details after oauth2 authentication.
   *
   * Sets the oauth2 token refresh time.
   * @param {OAuth2Token} tokenResponse OAuth2 Token details.
   */
  private getUserDetails(tokenResponse: OAuth2Token) {
    this.refreshTokenOnExpiry(tokenResponse.expires_in);
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'bearer ' + tokenResponse.access_token);
    this.http
      .disableApiPrefix()
      .get(`${environment.serverUrl}/userdetails`, { headers: headers })
      .subscribe((credentials: Credentials) => {
        this.onLoginSuccess(credentials);
        if (!credentials.shouldRenewPassword) {
          this.storage.setItem(this.oAuthTokenDetailsStorageKey, JSON.stringify(tokenResponse));
        }
      });
  }

  /**
   * Sets the oauth2 token to refresh on expiry.
   * @param {number} expiresInTime OAuth2 token expiry time in seconds.
   */
  private refreshTokenOnExpiry(expiresInTime: number) {
    setTimeout(() => this.refreshOAuthAccessToken(), expiresInTime * 1000);
  }

  /**
   * Refreshes the oauth2 authorization token.
   */
  private refreshOAuthAccessToken() {
    var oAuthRefreshToken = JSON.parse(this.storage.getItem(this.oAuthTokenDetailsStorageKey));
    if (oAuthRefreshToken == null) {
      return;
    }
    oAuthRefreshToken = JSON.parse(this.storage.getItem(this.oAuthTokenDetailsStorageKey)).refresh_token;
    this.authenticationInterceptor.removeAuthorization();
    const credentials = JSON.parse(this.storage.getItem(this.credentialsStorageKey));
    let httpParams = new HttpParams();
    httpParams = httpParams.set('username', credentials.username);
    httpParams = httpParams.set('client_id', `${environment.oauth.appId}`);
    httpParams = httpParams.set('refresh_token', oAuthRefreshToken);
    httpParams = httpParams.set('grant_type', 'refresh_token');
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .disableApiPrefix()
      .post(`${environment.oauth.serverUrl}/token`, httpParams.toString(), { headers: headers })
      .subscribe((tokenResponse: OAuth2Token) => {
        this.storage.setItem(this.oAuthTokenDetailsStorageKey, JSON.stringify(tokenResponse));
        this.authenticationInterceptor.setAuthorizationToken(tokenResponse.access_token);
        this.refreshTokenOnExpiry(tokenResponse.expires_in);
        const credentials = JSON.parse(this.storage.getItem(this.credentialsStorageKey));
        credentials.accessToken = tokenResponse.access_token;
        this.storage.setItem(this.credentialsStorageKey, JSON.stringify(credentials));
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
  private onLoginSuccess(credentials: Credentials) {
    this.userLoggedIn = true;
    if (environment.oauth.enabled) {
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
   * Logout ongoing Oauth2 session.
   */
  private logoutAuthSession() {
    const oAuthRefreshToken = JSON.parse(this.storage.getItem(this.oAuthTokenDetailsStorageKey)).refresh_token;
    const credentials = JSON.parse(this.storage.getItem(this.credentialsStorageKey));
    this.authenticationInterceptor.removeAuthorizationTenant();
    let httpParams = new HttpParams();
    httpParams = httpParams.set('username', credentials.username);
    httpParams = httpParams.set('client_id', `${environment.oauth.appId}`);
    httpParams = httpParams.set('refresh_token', oAuthRefreshToken);
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .disableApiPrefix()
      .post(`${environment.oauth.serverUrl}/logout`, httpParams.toString(), { headers: headers })
      .subscribe();
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
    const oAuthRefreshToken = JSON.parse(this.storage.getItem(this.oAuthTokenDetailsStorageKey));
    if (oAuthRefreshToken) {
      this.logoutAuthSession();
    }
    this.authenticationInterceptor.removeAuthorization();
    this.setCredentials();
    this.resetDialog();
    this.userLoggedIn = false;
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
    return !!(
      JSON.parse(
        sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
      ) && this.twoFactorAccessTokenIsValid()
    );
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
  private setCredentials(credentials?: Credentials) {
    if (credentials) {
      credentials.rememberMe = this.rememberMe;
      this.storage.setItem(this.credentialsStorageKey, JSON.stringify(credentials));
    } else {
      this.storage.removeItem(this.credentialsStorageKey);
      this.storage.removeItem(this.oAuthTokenDetailsStorageKey);
      this.storage.removeItem(this.twoFactorAuthenticationTokenStorageKey);
    }
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
  private onOTPValidateSuccess(response: any) {
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
    return this.userLoggedIn;
  }
}
