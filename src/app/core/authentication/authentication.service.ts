import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlertService } from '../alert.service';
import { AuthenticationInterceptor } from './authentication.interceptor';

import { environment } from '../../../environments/environment';

export interface LoginContext {
  username: string;
  password: string;
  remember: boolean;
}

export interface Credentials {
  accessToken?: string;
  authenticated: boolean;
  base64EncodedAuthenticationKey?: string;
  isTwoFactorAuthenticationRequired?: boolean;
  officeId: number;
  officeName: string;
  staffId?: number;
  staffDisplayName?: string;
  organisationalRole?: any;
  permissions: string[];
  roles: any;
  userId: number;
  username: string;
  shouldRenewPassword: boolean;
  rememberMe?: boolean;
}

export interface OAuth2Token {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

const credentialsStorageKey = 'mifosXCredentials';
const oAuthTokenDetailsStorageKey = 'mifosXOAuthTokenDetails';
const twoFactorAuthenticationTokenStorageKey = 'mifosXTwoFactorAuthenticationToken';

/**
 * Authentication workflow
 */
@Injectable()
export class AuthenticationService {

  private rememberMe: boolean;
  private storage: any;

  private credentials: Credentials;

  constructor(private http: HttpClient,
              private alertService: AlertService,
              private authenticationInterceptor: AuthenticationInterceptor) {
    this.rememberMe = false;
    this.storage = sessionStorage;
    const savedCredentials = JSON.parse(
      sessionStorage.getItem(credentialsStorageKey) || localStorage.getItem(credentialsStorageKey)
    );
    if (savedCredentials) {
      if (savedCredentials.rememberMe) {
        this.rememberMe = true;
        this.storage = localStorage;
      }
      const twoFactorAccessToken = JSON.parse(this.storage.getItem(twoFactorAuthenticationTokenStorageKey));
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
   * @param {LoginContext} loginContext The login parameters.
   * @return {Observable<any>}
   */
  login(loginContext: LoginContext) {
    this.alertService.alert({ type: 'Authentication Start', message: 'Please wait...' });
    this.rememberMe = loginContext.remember;
    this.storage = this.rememberMe ? localStorage : sessionStorage;

    if (environment.oauth.enabled) {
      return this.http.disableApiPrefix().post(`${environment.oauth.serverUrl}/oauth/token?username=${loginContext.username}&password=${loginContext.password}&client_id=community-app&grant_type=password&client_secret=123`, {})
        .pipe(
          map((tokenResponse: OAuth2Token) => {
            this.getUserDetails(tokenResponse);
            return of(true);
          })
        );
    } else {
      return this.http.post(`/authentication?username=${loginContext.username}&password=${loginContext.password}`, {})
        .pipe(
          map((credentials: Credentials) => {
            this.onLoginSuccess(credentials);
            return of(true);
          })
        );
    }
  }

  getUserDetails(tokenResponse: OAuth2Token) {
    this.refreshTokenOnExpiry(tokenResponse.expires_in);
    this.http.get(`/userdetails?access_token=${tokenResponse.access_token}`)
      .subscribe((credentials: Credentials) => {
          this.onLoginSuccess(credentials);
          if (!credentials.shouldRenewPassword) {
            this.storage.setItem(oAuthTokenDetailsStorageKey, JSON.stringify(tokenResponse));
          }
        });
  }

  refreshTokenOnExpiry(expiresInTime: number) {
    setTimeout(() => this.refreshOAuthAccessToken(), expiresInTime * 1000);
  }

  refreshOAuthAccessToken() {
    const oAuthRefreshToken = JSON.parse(this.storage.getItem(oAuthTokenDetailsStorageKey)).refresh_token;
    this.authenticationInterceptor.removeAuthorization();
    this.http.disableApiPrefix().post(`${environment.oauth.serverUrl}/oauth/token?client_id=community-app&grant_type=refresh_token&client_secret=123&refresh_token=${oAuthRefreshToken}`, {})
      .subscribe((tokenResponse: OAuth2Token) => {
          this.storage.setItem(oAuthTokenDetailsStorageKey, JSON.stringify(tokenResponse));
          this.authenticationInterceptor.setAuthorizationToken(tokenResponse.access_token);
          this.refreshTokenOnExpiry(tokenResponse.expires_in);
          const credentials = JSON.parse(this.storage.getItem(credentialsStorageKey));
          credentials.accessToken = tokenResponse.access_token;
          this.storage.setItem(credentialsStorageKey, JSON.stringify(credentials));
        });
  }

  /**
   * Logs out the user and clear credentials.
   * @return {Observable<boolean>} True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    const twoFactorToken = JSON.parse(this.storage.getItem(twoFactorAuthenticationTokenStorageKey));
    if (twoFactorToken) {
      this.http.post('/twofactor/invalidate', { token: twoFactorToken.token }).subscribe();
      this.authenticationInterceptor.removeTwoFactorAuthorization();
    }
    this.authenticationInterceptor.removeAuthorization();
    this.setCredentials();
    return of(true);
  }

  /**
   * Checks is the user is authenticated.
   * @return {boolean} True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!(JSON.parse(
        sessionStorage.getItem(credentialsStorageKey) || localStorage.getItem(credentialsStorageKey)
      ) && this.twoFactorAccessTokenIsValid());
  }

  twoFactorAccessTokenIsValid(): boolean {
    const twoFactorAccessToken = JSON.parse(this.storage.getItem(twoFactorAuthenticationTokenStorageKey));
    if (twoFactorAccessToken) {
      return ((new Date()).getTime() < twoFactorAccessToken.validTo);
    }
    return true;
  }

  /**
   * Gets the user credentials.
   * @return {Credentials} The user credentials or null if the user is not authenticated.
   */
  getCredentials(): Credentials {
    return JSON.parse(this.storage.getItem(credentialsStorageKey));
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param {Credentials=} credentials The user credentials.
   */
  private setCredentials(credentials?: Credentials) {
    if (credentials) {
      credentials.rememberMe = this.rememberMe;
      this.storage.setItem(credentialsStorageKey, JSON.stringify(credentials));
    } else {
      this.storage.removeItem(credentialsStorageKey);
      this.storage.removeItem(oAuthTokenDetailsStorageKey);
      this.storage.removeItem(twoFactorAuthenticationTokenStorageKey);
    }
  }

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


  //  Following functions require first level authorization headers to be setup

  getDeliveryMethods() {
    return this.http.get('/twofactor').pipe(map(response => {
      return response;
    }));
  }

  requestOTP(deliveryMethod: any) {
    return this.http.post(`/twofactor?deliveryMethod=${deliveryMethod.name}&extendedToken=${this.rememberMe}`, {});
  }

  validateOTP(otp: string) {
    return this.http.post(`/twofactor/validate?token=${otp}`, {})
      .pipe(
        map(response => {
          this.onOTPValidateSuccess(response);
        })
      );
  }

  private onOTPValidateSuccess(response: any) {
    this.authenticationInterceptor.setTwoFactorAccessToken(response.token);
    if (this.credentials.shouldRenewPassword) {
      this.alertService.alert({ type: 'Password Expired', message: 'Your password has expired, please reset your password!' });
    } else {
      this.setCredentials(this.credentials);
      this.alertService.alert({ type: 'Authentication Success', message: `${this.credentials.username} successfully logged in!` });
      delete this.credentials;
      this.storage.setItem(twoFactorAuthenticationTokenStorageKey, JSON.stringify(response));
    }
  }

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
