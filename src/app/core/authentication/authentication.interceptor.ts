/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Imports */
import { environment } from '../../../environments/environment';
import { SettingsService } from 'app/settings/settings.service';

/** Http request (default) options headers. */
const httpOptions = {
  headers: {
    'Fineract-Platform-TenantId': environment.fineractPlatformTenantId
  }
};

/** Authorization header. */
const authorizationHeader = 'Authorization';
/** Two factor access token header. */
const twoFactorAccessTokenHeader = 'Fineract-Platform-TFA-Token';

/**
 * Http Request interceptor to set the request headers.
 */
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private settingsService: SettingsService) {}

  /**
   * Intercepts a Http request and sets the request headers.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.settingsService.tenantIdentifier) {
      httpOptions.headers['Fineract-Platform-TenantId'] = this.settingsService.tenantIdentifier;
    }
    request = request.clone({ setHeaders: httpOptions.headers });
    return next.handle(request);
  }

  /**
   * Sets the basic/oauth authorization header depending on the configuration.
   * @param {string} authenticationKey Authentication key.
   */
  setAuthorizationToken(authenticationKey: string) {
    if (environment.oauth.enabled) {
      httpOptions.headers[authorizationHeader] = `Bearer ${authenticationKey}`;
    } else {
      httpOptions.headers[authorizationHeader] = `Basic ${authenticationKey}`;
    }
  }

  /**
   * Sets the two factor access token header.
   * @param {string} twoFactorAccessToken Two factor access token.
   */
  setTwoFactorAccessToken(twoFactorAccessToken: string) {
    httpOptions.headers[twoFactorAccessTokenHeader] = twoFactorAccessToken;
  }

  /**
   * Removes the authorization header.
   */
  removeAuthorization() {
    delete httpOptions.headers[authorizationHeader];
  }

  /**
   * Removes the two factor access token header.
   */
  removeTwoFactorAuthorization() {
    delete httpOptions.headers[twoFactorAccessTokenHeader];
  }

}
