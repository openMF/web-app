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
import { ErrorHandlerService } from '../error-handler/error-handler.service';

/** Initialize Logger */
const log = new Logger('ErrorHandlerInterceptor');

/**
 * Http Request interceptor to add a default error handler to requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private alertService = inject(AlertService);
  private translate = inject(TranslateService);
  private errorHandlerService = inject(ErrorHandlerService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError((error) => this.handleError(error, request)));
  }

  /**
   * Parses the error body from an HttpErrorResponse.
   * When a request uses responseType 'arraybuffer' or 'blob', Angular stores the
   * raw binary data in response.error instead of a parsed JSON object. This method
   * decodes it so the rest of the error handler can read structured fields like
   * userMessageGlobalisationCode.
   */
  private parseErrorBody(error: any): any {
    if (error instanceof ArrayBuffer) {
      try {
        return JSON.parse(new TextDecoder().decode(error));
      } catch {
        return null;
      }
    }
    return error;
  }

  private handleError(response: HttpErrorResponse, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const status = response.status;
    const errorBody: any = response.error;
    const translatedErrorMessage = this.errorHandlerService.translateFineractError(errorBody);
    const developerMessage: string | undefined = errorBody?.developerMessage;
    const errorMessage = translatedErrorMessage || errorBody?.defaultUserMessage || response.message;

    const isClientImage404 = status === 404 && request.url.includes('/clients/') && request.url.includes('/images');

    if (!environment.production && !isClientImage404) {
      if (developerMessage) {
        log.error(`Request Error (developerMessage): ${developerMessage}`);
      }
      log.error(`Request Error: ${errorMessage}`);
    }

    // OAuth2 errors for invalid grants are returned as 400, so we need to check the URL.
    if (status === 401 || (environment.oauth.enabled && status === 400 && request.url.includes('/oauth/token'))) {
      this.alertService.alert({
        type: this.translate.instant('error.resource.authenticationError.type'),
        message: this.translate.instant('error.resource.authenticationError.message')
      });
    } else if (status === 400) {
      const fallback = this.translate.instant('errors.interceptor.invalidParams');
      const message = parameterName ? `[${parameterName}] ${errorMessage || fallback}` : `${errorMessage || fallback}`;
      this.alertService.alert({
        type: this.translate.instant('error.resource.badRequest.type'),
        message: errorMessage || this.translate.instant('error.resource.badRequest.message')
      });
    } else if (status === 403) {
      // The token check must use a stable identifier, not the translated message.
      const isInvalidToken =
        errorBody?.userMessageGlobalisationCode === 'error.msg.invalid.onetime.token' ||
        errorBody?.defaultUserMessage === 'The provided one time token is invalid' ||
        errorMessage === 'The provided one time token is invalid';

      if (isInvalidToken) {
        this.alertService.alert({
          type: this.translate.instant('error.resource.invalidToken.type'),
          message: this.translate.instant('error.resource.invalidToken.message')
        });
      } else {
        this.alertService.alert({
          type: this.translate.instant('error.resource.unauthorizedRequest.type'),
          message: errorMessage || this.translate.instant('error.resource.unauthorizedRequest.message')
        });
      }
    } else if (status === 404) {
      if (isClientImage404) {
        return throwError(() => response);
      } else {
        this.alertService.alert({
          type: this.translate.instant('error.resource.not.found'),
          message: errorMessage || this.translate.instant('error.resource.notFound.message')
        });
      }
    } else if (status === 500) {
      this.alertService.alert({
        type: this.translate.instant('error.resource.internalServerError.type'),
        message: this.translate.instant('error.resource.internalServerError.message')
      });
    } else if (status === 501) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.resource.notImplemented.type'),
        message: this.translate.instant('errors.error.resource.notImplemented.message')
      });
    } else {
      this.alertService.alert({
        type: this.translate.instant('error.resource.unknownError.type'),
        message: errorMessage || this.translate.instant('error.resource.unknownError.message')
      });
    }

    throw response;
  }
}
