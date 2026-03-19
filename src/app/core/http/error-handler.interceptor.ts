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
import { Observable } from 'rxjs';
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
 * Supports localisation of error messages using Fineract's userMessageGlobalisationCode.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private alertService = inject(AlertService);
  private translate = inject(TranslateService);

  /**
   * Intercepts a Http request and adds a default error handler.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError((error) => this.handleError(error, request)));
  }

  /**
   * Error handler.
   * Uses userMessageGlobalisationCode from Fineract error response to localise error messages.
   */
  private handleError(response: HttpErrorResponse, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const status = response.status;
    let errorMessage = response.error?.developerMessage || response.message;
    let globalisationCode: string | null = null;

    // Extract globalisation code and message from Fineract error response
    if (response.error?.errors) {
      if (response.error.errors[0]) {
        globalisationCode = response.error.errors[0].userMessageGlobalisationCode || null;
        errorMessage = response.error.errors[0].defaultUserMessage || response.error.errors[0].developerMessage;
      }
    }

    // Also check top-level userMessageGlobalisationCode
    if (response.error?.userMessageGlobalisationCode) {
      globalisationCode = response.error.userMessageGlobalisationCode;
    }

    // If we have a globalisation code, try to translate it with variable substitution
    if (globalisationCode) {
      const translated = this.translate.instant(globalisationCode, response.error?.errors?.[0] || response.error || {});
      // Only use translation if the key actually exists (translate returns the key itself if not found)
      if (translated !== globalisationCode) {
        errorMessage = translated;
      }
    }

    const isClientImage404 = status === 404 && request.url.includes('/clients/') && request.url.includes('/images');

    if (!environment.production && !isClientImage404) {
      log.error(`Request Error: ${errorMessage}`);
    }

    // Check specific 403 error (invalid token) BEFORE generic 403 (higher priority)
    if (status === 403 && globalisationCode === 'error.token.invalid') {
      this.alertService.alert({
        type: this.translate.instant('error.token.invalid.type'),
        message: this.translate.instant('error.token.invalid.message')
      });
    } else if (status === 401) {
      // Allow Fineract translations for 401 errors
      this.alertService.alert({
        type: this.translate.instant('error.auth.type'),
        message: errorMessage || this.translate.instant('error.auth.message')
      });
    } else if (environment.oauth.enabled && status === 400) {
      this.alertService.alert({
        type: this.translate.instant('error.auth.type'),
        message: this.translate.instant('error.auth.message')
      });
    } else if (status === 400) {
      this.alertService.alert({
        type: this.translate.instant('error.bad.request.type'),
        message: errorMessage || this.translate.instant('error.bad.request.message')
      });
    } else if (status === 403) {
      this.alertService.alert({
        type: this.translate.instant('error.unauthorized.type'),
        message: errorMessage || this.translate.instant('error.unauthorized.message')
      });
    } else if (status === 404) {
      if (isClientImage404) {
        // Return observable of null for missing client images so imaging service can handle gracefully
        return new Observable((observer) => {
          observer.next(null);
          observer.complete();
        });
      } else {
        this.alertService.alert({
          type: this.translate.instant('error.resource.not.found.type'),
          message: errorMessage || this.translate.instant('error.resource.not.found.message')
        });
      }
    } else if (status === 500) {
      // Allow Fineract translations for 500 errors
      this.alertService.alert({
        type: this.translate.instant('error.server.internal.type'),
        message: errorMessage || this.translate.instant('error.server.internal.message')
      });
    } else if (status === 501) {
      // Allow Fineract translations for 501 errors
      this.alertService.alert({
        type: this.translate.instant('error.resource.notImplemented.type'),
        message: errorMessage || this.translate.instant('error.resource.notImplemented.message')
      });
    } else {
      this.alertService.alert({
        type: this.translate.instant('error.unknown.type'),
        message: this.translate.instant('error.unknown.message')
      });
    }

    throw response;
  }
}
