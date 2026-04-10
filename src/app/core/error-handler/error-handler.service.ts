/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  actionType?: string;
}

/**
 * Centralized error handler service for consistent error messaging
 * across the application. Converts HTTP errors into user-friendly
 * messages and displays them through snackbar notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  /**
   * Handle HTTP errors and show user-friendly messages
   * @param error The HTTP error response
   * @param context Optional context to provide more specific error messages
   * @returns Observable that throws the original error
   */
  handleError(error: HttpErrorResponse, context?: string): Observable<never> {
    const errorMessage = this.getErrorMessage(error, context);
    this.showError(errorMessage);
    return throwError(() => error);
  }

  /**
   * Get user-friendly error message based on HTTP status
   * @param error The HTTP error response
   * @param context Optional context for more specific messages
   * @returns ErrorMessage object with title, message, and action
   */
  private getErrorMessage(error: HttpErrorResponse, context?: string): ErrorMessage {
    if (error.error instanceof ErrorEvent) {
      return {
        title: this.translateService.instant('errors.http.connection.title'),
        message: this.translateService.instant('errors.http.connection.message'),
        action: this.translateService.instant('labels.buttons.OK')
      };
    }

    const fineractError = error.error?.errors?.[0]?.defaultUserMessage;
    const defaultMessage = error.error?.defaultUserMessage;

    switch (error.status) {
      case 400:
        return {
          title: this.translateService.instant('errors.http.badRequest.title'),
          message: fineractError || defaultMessage || this.translateService.instant('errors.http.badRequest.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      case 401:
        return {
          title: this.translateService.instant('errors.http.unauthorized.title'),
          message: this.translateService.instant('errors.http.unauthorized.message'),
          action: this.translateService.instant('errors.http.unauthorized.action'),
          actionType: 'login'
        };
      case 403:
        return {
          title: this.translateService.instant('errors.http.forbidden.title'),
          message: fineractError || defaultMessage || this.translateService.instant('errors.http.forbidden.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      case 404:
        return {
          title: this.translateService.instant('errors.http.notFound.title'),
          message: context
            ? this.translateService.instant('errors.http.notFound.contextMessage', { context })
            : fineractError || defaultMessage || this.translateService.instant('errors.http.notFound.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      case 409:
        return {
          title: this.translateService.instant('errors.http.conflict.title'),
          message: fineractError || defaultMessage || this.translateService.instant('errors.http.conflict.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      case 500:
        return {
          title: this.translateService.instant('errors.http.serverError.title'),
          message: fineractError || defaultMessage || this.translateService.instant('errors.http.serverError.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      case 503:
        return {
          title: this.translateService.instant('errors.http.serviceUnavailable.title'),
          message: this.translateService.instant('errors.http.serviceUnavailable.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
      default:
        return {
          title: this.translateService.instant('errors.http.default.title'),
          message: fineractError || defaultMessage || this.translateService.instant('errors.http.default.message'),
          action: this.translateService.instant('labels.buttons.OK')
        };
    }
  }

  /**
   * Show error message to user via snackbar
   * @param errorMessage The error message object to display
   */
  private showError(errorMessage: ErrorMessage): void {
    const snackBarRef = this.snackBar.open(
      `${errorMessage.title}: ${errorMessage.message}`,
      errorMessage.action || this.translateService.instant('labels.buttons.Close'),
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      }
    );

    if (errorMessage.actionType === 'login') {
      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  /**
   * Show success message to user via snackbar
   * @param message The success message to display
   * @param action Optional action button text (defaults to 'OK')
   */
  showSuccess(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show info message to user via snackbar
   * @param message The info message to display
   * @param action Optional action button text (defaults to 'OK')
   */
  showInfo(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }
}
