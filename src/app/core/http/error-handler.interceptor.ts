/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

/** rxjs Imports */
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Environment Configuration */
import { environment } from '../../../environments/environment';

/** Custom Services */
import { Logger } from '../logger/logger.service';
import { AlertService } from '../alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

/** Initialize Logger */
const log = new Logger('ErrorHandlerInterceptor');

/**
 * Http Request interceptor to add a default error handler to requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private alertService = inject(AlertService);
  private translate = inject(TranslateService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError((error) => this.handleError(error, request)));
  }

  private handleError(response: HttpErrorResponse, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const status = response.status;

    let errorMessage = response.error?.developerMessage || response.message;
    let globalisationCode: string | null = null;

    // Nested errors take priority over top-level
    if (response.error?.errors?.[0]) {
      globalisationCode = response.error.errors[0].userMessageGlobalisationCode || null;
      errorMessage =
        response.error.errors[0].defaultUserMessage || response.error.errors[0].developerMessage || errorMessage;
    }

    // Only use top-level code if nested did not provide one
    if (!globalisationCode && response.error?.userMessageGlobalisationCode) {
      globalisationCode = response.error.userMessageGlobalisationCode;
    }

    // Translate globalisation code if key exists
    if (globalisationCode) {
      const translated = this.translate.instant(globalisationCode, response.error?.errors?.[0] || response.error || {});
      if (translated !== globalisationCode) {
        errorMessage = translated;
      }
    }

    // Extract parameterName if present
    let parameterName: string | null = null;
    if (response.error?.errors?.[0] && 'parameterName' in response.error.errors[0]) {
      parameterName = response.error.errors[0].parameterName;
    }

    const isClientImage404 = status === 404 && request.url.includes('/clients/') && request.url.includes('/images');

    if (!environment.production && !isClientImage404) {
      log.error(`Request Error: ${errorMessage}`);
    }

    // OAuth 400 only for auth/token endpoints, not all 400s
    if (
      status === 401 ||
      (environment.oauth.enabled &&
        status === 400 &&
        (request.url.includes('/oauth/token') || request.url.includes('/authentication')))
    ) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.auth.type'),
        message: this.translate.instant('errors.error.auth.message')
      });
    } else if (
      status === 403 &&
      (response.error?.errors?.[0]?.userMessageGlobalisationCode === 'error.msg.otp.token.invalid' ||
        response.error?.userMessageGlobalisationCode === 'error.msg.otp.token.invalid')
    ) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.token.invalid.type'),
        message: this.translate.instant('errors.error.token.invalid.message')
      });
    } else if (status === 400) {
      const message = parameterName
        ? `[${parameterName}] ${errorMessage || 'Invalid parameters were passed in the request!'}`
        : `${errorMessage || 'Invalid parameters were passed in the request!'}`;
      this.alertService.alert({
        type: this.translate.instant('errors.error.bad.request.type'),
        message: message || this.translate.instant('errors.error.bad.request.message')
      });
    } else if (status === 403) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.unauthorized.type'),
        message: errorMessage || this.translate.instant('errors.error.unauthorized.message')
      });
    } else if (status === 404) {
      if (isClientImage404) {
        return throwError(() => response);
      } else {
        this.alertService.alert({
          type: this.translate.instant('errors.error.resource.not.found.type'),
          message: errorMessage || this.translate.instant('errors.error.resource.not.found.message')
        });
      }
    } else if (status === 500) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.server.internal.type'),
        message: this.translate.instant('errors.error.server.internal.message')
      });
    } else if (status === 501) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.resource.notImplemented.type'),
        message: this.translate.instant('errors.error.resource.notImplemented.message')
      });
    } else {
      this.alertService.alert({
        type: this.translate.instant('errors.error.unknown.type'),
        message: errorMessage || this.translate.instant('errors.error.unknown.message')
      });
    }

    throw response;
  }
}
