import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

const httpOptions = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Fineract-Platform-TenantId': environment.fineractPlatformTenantId
  }
};

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({ setHeaders: httpOptions.headers });
    return next.handle(request);
  }

  setAuthorizationToken(authenticationKey: string) {
    if (environment.oauth.enabled) {
      httpOptions.headers['Authorization'] = `Bearer ${authenticationKey}`;
    } else {
      httpOptions.headers['Authorization'] = `Basic ${authenticationKey}`;
    }
  }

  setTwoFactorAccessToken(twoFactorAccessToken: string) {
    httpOptions.headers['Fineract-Platform-TFA-Token'] = twoFactorAccessToken;
  }

  removeAuthorization() {
    delete httpOptions.headers['Authorization'];
  }

  removeTwoFactorAuthorization() {
    delete httpOptions.headers['Fineract-Platform-TFA-Token'];
  }

}
