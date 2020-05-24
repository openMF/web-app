/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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
  constructor(private http: HttpClient,
              private alertService: AlertService,
              private authenticationInterceptor: AuthenticationInterceptor) {
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
      httpParams = httpParams.set('client_id', 'community-app');
      httpParams = httpParams.set('grant_type', 'password');
      httpParams = httpParams.set('client_secret', '123');
      return this.http.disableApiPrefix().post(`${environment.oauth.serverUrl}/oauth/token`, {}, { params: httpParams })
        .pipe(
          map((tokenResponse: OAuth2Token) => {
            this.getUserDetails(tokenResponse);
            return of(true);
          })
        );
    } else {
      return this.http.post('/authentication', { username: loginContext.username, password: loginContext.password })
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
    const httpParams = new HttpParams().set('access_token', tokenResponse.access_token);
    this.refreshTokenOnExpiry(tokenResponse.expires_in);
    this.http.get('/userdetails', { params: httpParams })
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
    const oAuthRefreshToken = JSON.parse(this.storage.getItem(this.oAuthTokenDetailsStorageKey)).refresh_token;
    this.authenticationInterceptor.removeAuthorization();
    let httpParams = new HttpParams();
    httpParams = httpParams.set('client_id', 'community-app');
    httpParams = httpParams.set('grant_type', 'refresh_token');
    httpParams = httpParams.set('client_secret', '123');
    httpParams = httpParams.set('refresh_token', oAuthRefreshToken);
    this.http.disableApiPrefix().post(`${environment.oauth.serverUrl}/oauth/token`, {}, { params: httpParams })
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
    if (environment.oauth.enabled) {
      this.authenticationInterceptor.setAuthorizationToken(credentials.accessToken);
    } else {
      this.authenticationInterceptor.setAuthorizationToken(credentials.base64EncodedAuthenticationKey);
    }
    if (credentials.isTwoFactorAuthenticationRequired) {
      this.credentials = credentials;
      this.alertService.alert({ type: 'Two Factor Authentication Required', message: 'Two Factor Authentication Required' });
    } else {
      if (credentials.shouldRenewPassword) {
        this.credentials = credentials;
        this.alertService.alert({ type: 'Password Expired', message: 'Your password has expired, please reset your password!' });
      } else {
        this.setCredentials(credentials);
        this.alertService.alert({ type: 'Authentication Success', message: `${credentials.username} successfully logged in!` });
        delete this.credentials;
      }
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
    this.authenticationInterceptor.removeAuthorization();
    this.setCredentials();
    return of(true);
  }

  /**
   * Checks if the two factor access token for authenticated user is valid.
   * @returns {boolean} True if the two factor access token is valid or two factor authentication is not required.
   */
  twoFactorAccessTokenIsValid(): boolean {
    const twoFactorAccessToken = JSON.parse(this.storage.getItem(this.twoFactorAuthenticationTokenStorageKey));
    if (twoFactorAccessToken) {
      return ((new Date()).getTime() < twoFactorAccessToken.validTo);
    }
    return true;
  }

  /**
   * Checks if the user is authenticated.
   * @returns {boolean} True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!(JSON.parse(
        sessionStorage.getItem(this.credentialsStorageKey) || localStorage.getItem(this.credentialsStorageKey)
      ) && this.twoFactorAccessTokenIsValid());
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
    return this.http.post(`/twofactor/validate`, {}, { params: httpParams })
      .pipe(
        map(response => {
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
      this.alertService.alert({ type: 'Password Expired', message: 'Your password has expired, please reset your password!' });
    } else {
      this.setCredentials(this.credentials);
      this.alertService.alert({ type: 'Authentication Success', message: `${this.credentials.username} successfully logged in!` });
      delete this.credentials;
      this.storage.setItem(this.twoFactorAuthenticationTokenStorageKey, JSON.stringify(response));
    }
  }

  /**
   * Resets the user's password and authenticates the user.
   * @param {any} passwordDetails New password.
   */
  resetPassword(passwordDetails: any) {
    return this.http.put(`/users/${this.credentials.userId}`, passwordDetails).
    pipe(
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

}
