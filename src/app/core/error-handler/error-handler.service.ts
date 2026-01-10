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
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
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
  constructor(
    // eslint-disable-next-line @angular-eslint/prefer-inject
    private snackBar: MatSnackBar,
    // eslint-disable-next-line @angular-eslint/prefer-inject
    private router: Router
  ) {}

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
      // Client-side or network error
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'OK'
      };
    }

    // Server-side error - Extract Fineract-specific error messages
    const fineractError = error.error?.errors?.[0]?.defaultUserMessage;
    const defaultMessage = error.error?.defaultUserMessage;

    switch (error.status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: fineractError || defaultMessage || 'Please check your input and try again.',
          action: 'OK'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'Your session has expired. Please log in again.',
          action: 'Login'
        };
      case 403:
        return {
          title: 'Access Denied',
          message: fineractError || defaultMessage || 'You do not have permission to perform this action.',
          action: 'OK'
        };
      case 404:
        return {
          title: 'Not Found',
          message: context
            ? `${context} not found.`
            : fineractError || defaultMessage || 'The requested resource was not found.',
          action: 'OK'
        };
      case 409:
        return {
          title: 'Conflict',
          message: fineractError || defaultMessage || 'The resource already exists or there is a conflict.',
          action: 'OK'
        };
      case 500:
        return {
          title: 'Server Error',
          message: fineractError || defaultMessage || 'An unexpected error occurred. Please try again later.',
          action: 'OK'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          action: 'OK'
        };
      default:
        return {
          title: 'Error',
          message: fineractError || defaultMessage || 'An unexpected error occurred.',
          action: 'OK'
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
      errorMessage.action || 'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      }
    );

    // Handle action button clicks (e.g., "Login" for 401 errors)
    if (errorMessage.action === 'Login') {
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
