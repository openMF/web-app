import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Logger } from '../logger.service';
import { AlertService } from '../alert.service';

const log = new Logger('ErrorHandlerInterceptor');

/**
 * Adds a default error handler to all requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

  constructor(private alertService: AlertService) {  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(error => this.handleError(error)));
  }

  // Customize the default error handler here if needed
  private handleError(response: HttpErrorResponse): Observable<HttpEvent<any>> {
    const status = response.status;
    let errorMessage = (response.error.developerMessage || response.message);
    if (response.error.errors) {
      if (response.error.errors[0]) {
        errorMessage = response.error.errors[0].developerMessage;
      }
    }

    if (!environment.production) {
      log.error(`Request Error: ${errorMessage}`);
    }

    if (status === 401 || (environment.oauth.enabled && status === 400)) {
      this.alertService.alert({ type: 'Authentication Error', message: 'Invalid User Details. Please try again!' });
    } else if (status === 403 && errorMessage === 'The provided one time token is invalid') {
      this.alertService.alert({ type: 'Invalid Token', message: 'Invalid Token. Please try again!' });
    } else if (status === 400) {
      this.alertService.alert({ type: 'Bad Request', message: 'Invalid parameters were passed in the request!' });
    } else if (status === 403) {
      this.alertService.alert({ type: 'Unauthorized Request', message: 'You are not authorized for this request!' });
    } else if (status === 404) {
      this.alertService.alert({ type: 'Resource does not exist', message: 'Resource does not exist!' });
    }  else if (status === 500) {
      this.alertService.alert({ type: 'Internal Server Error', message: 'Internal Server Error. Please try again later.' });
    } else {
      this.alertService.alert({ type: 'Unknown Error', message: 'Unknown Error. Please try again later.' });
    }

    throw response;
  }

}
