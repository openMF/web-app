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

/** Custom Models */
import { BRANDING_API_PATH } from 'app/shared/theme-picker/theme.model';

/** Initialize Logger */
const log = new Logger('ErrorHandlerInterceptor');

/**
 * Http Request interceptor to add a default error handler to requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private alertService = inject(AlertService);
  private translate = inject(TranslateService);
  private databaseErrorCodes: string[] = [
    'error.msg.data.integrity.issue.entity.duplicated',
    'error.msg.data.integrity.issue'
  ];

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

  /**
   * Resolves a backend globalisation code against the `errors` section, where
   * the codes are stored as flat dotted keys. Returns null when the code has no
   * translation, so the caller can fall back to the server message.
   * @param code Globalisation code sent by the backend
   */
  private translateErrorCode(code: string | undefined): string | null {
    if (!code) {
      return null;
    }
    const key = `errors.${code}`;
    const translated = this.translate.instant(key);
    return translated && translated !== key ? translated : null;
  }

  private handleError(response: HttpErrorResponse, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    // Tenant branding is cosmetic and optional: the endpoint is absent on
    // deployments without the self-service plugin. Let the caller fall back to
    // the default colour silently instead of interrupting the user with an
    // alert. Only reads are suppressed, so a failed save still surfaces.
    // Checked before the error body is parsed, since none of that work is
    // needed here.
    const isTenantThemeLookup = request.method === 'GET' && request.url.endsWith(BRANDING_API_PATH);
    if (isTenantThemeLookup) {
      return throwError(() => response);
    }

    const status = response.status;
    const errorBody = this.parseErrorBody(response.error);

    // Translate top-level globalisation code if present
    const rawTopLevelMessage = errorBody?.defaultUserMessage || errorBody?.developerMessage;
    let topLevelMessage = rawTopLevelMessage || response.message;
    if (errorBody?.userMessageGlobalisationCode) {
      const topCode = errorBody.userMessageGlobalisationCode;
      const translated = this.translate.instant(topCode, errorBody || {});
      if (translated !== topCode) {
        topLevelMessage = translated;
      }
    }

    // Translate nested globalisation code if present
    let nestedMessage: string | null = null;
    if (errorBody?.errors?.[0]?.userMessageGlobalisationCode) {
      const nestedCode = errorBody.errors[0].userMessageGlobalisationCode;
      const translated = this.translate.instant(nestedCode, errorBody.errors[0] || {});
      nestedMessage = translated !== nestedCode ? translated : errorBody.errors[0].defaultUserMessage || null;
    }

    // Combine both messages if both exist and are distinct.
    // Prefer translated messages; only fall back to raw defaultUserMessage when no translation was resolved.
    const hasTopLevelPayload = Boolean(rawTopLevelMessage || errorBody?.userMessageGlobalisationCode);

    let errorMessage = nestedMessage
      ? hasTopLevelPayload && nestedMessage !== topLevelMessage
        ? `${topLevelMessage} ${nestedMessage}`
        : nestedMessage
      : topLevelMessage;
    let parameterName: string | null = null;
    // Read the nested error from the parsed body rather than from the raw
    // response, so a body delivered as an ArrayBuffer goes through the same
    // lookup instead of falling back to the untranslated server message.
    const nestedError = errorBody?.errors?.[0];
    if (nestedError) {
      const nestedCode = nestedError.userMessageGlobalisationCode;
      if (nestedCode && this.databaseErrorCodes.indexOf(nestedCode) > -1) {
        errorMessage = this.translate.instant('errors.error.msg.data.integrity.issue');
      } else {
        // A domain rule violation carries the meaningful code on the nested
        // error, not on the envelope, so it is looked up here before falling
        // back to the raw message the server sent.
        errorMessage =
          this.translateErrorCode(nestedCode) ||
          nestedError.defaultUserMessage?.replace(/\\./g, ' ') ||
          nestedError.developerMessage?.replace(/\\./g, ' ');
      }
      if ('parameterName' in nestedError) {
        parameterName = nestedError.parameterName;
      }
    }
    const isClientImage404 = status === 404 && request.url.includes('/clients/') && request.url.includes('/images');
    // Analytics dashboard reports that don't exist on this server are silently handled by the data service fallbacks
    const isAnalyticsReport404 = status === 404 && request.url.includes('/runreports/');
    // A business date exists only once it has been set on this instance, so its absence is a valid
    // state: the footer falls back to the system date instead of interrupting the user with an
    // alert. The trailing slash keeps the business date list lookup out of this exception.
    const isBusinessDate404 = status === 404 && request.method === 'GET' && request.url.includes('/businessdate/');

    if (!environment.production && !isClientImage404 && !isAnalyticsReport404 && !isBusinessDate404) {
      log.error(`Request Error: ${errorMessage}`);
    }

    if (status === 401 || (environment.oauth.enabled && status === 400)) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.auth.type'),
        message: this.translate.instant('errors.error.auth.message')
      });
    } else if (
      status === 403 &&
      errorBody?.errors?.[0]?.defaultUserMessage === 'The provided one time token is invalid'
    ) {
      this.alertService.alert({
        type: this.translate.instant('errors.error.token.invalid.type'),
        message: this.translate.instant('errors.error.token.invalid.message')
      });
    } else if (status === 400) {
      const fallback = this.translate.instant('errors.interceptor.invalidParams');
      const message = parameterName ? `[${parameterName}] ${errorMessage || fallback}` : `${errorMessage || fallback}`;
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
      if (isClientImage404 || isAnalyticsReport404 || isBusinessDate404) {
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
        message: errorMessage || this.translate.instant('errors.error.server.internal.message')
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
