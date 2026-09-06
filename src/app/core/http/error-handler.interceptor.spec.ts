/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { AlertService } from '../alert/alert.service';
import { ErrorHandlerInterceptor } from './error-handler.interceptor';
import { BRANDING_API_PATH } from 'app/shared/theme-picker/theme.model';

describe('ErrorHandlerInterceptor', () => {
  let interceptor: ErrorHandlerInterceptor;
  let alert: jest.Mock;

  /**
   * Drives the interceptor's error path for the given URL.
   * @returns 'errored' when the failure is passed through silently, 'threw'
   * when the interceptor rethrows after alerting.
   */
  function intercept(url: string, status: number, method: 'GET' | 'PUT' = 'GET'): string {
    const request = method === 'PUT' ? new HttpRequest('PUT', url, {}) : new HttpRequest('GET', url);
    const response = new HttpErrorResponse({ status, url, error: { defaultUserMessage: 'boom' } });
    try {
      let outcome = 'none';
      (interceptor as any).handleError(response, request).subscribe({ error: () => (outcome = 'errored') });
      return outcome;
    } catch {
      return 'threw';
    }
  }

  beforeEach(() => {
    alert = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerInterceptor,
        { provide: AlertService, useValue: { alert } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    interceptor = TestBed.inject(ErrorHandlerInterceptor);
  });

  it('does not alert when the branding endpoint is absent', () => {
    // Deployment without the self-service plugin.
    const result = intercept(`/fineract-provider/api/v1${BRANDING_API_PATH}`, 404);
    expect(alert).not.toHaveBeenCalled();
    expect(result).toBe('errored');
  });

  it('does not alert when reading branding is forbidden', () => {
    const result = intercept(`/fineract-provider/api/v1${BRANDING_API_PATH}`, 403);
    expect(alert).not.toHaveBeenCalled();
    expect(result).toBe('errored');
  });

  it('still alerts when saving branding fails', () => {
    // An administrator pressing Save must be told it did not work.
    intercept(`/fineract-provider/api/v1${BRANDING_API_PATH}`, 403, 'PUT');
    expect(alert).toHaveBeenCalled();
  });

  it('still alerts for other failing configuration lookups', () => {
    intercept('/fineract-provider/api/v1/configurations/name/enable-business-date', 404);
    expect(alert).toHaveBeenCalled();
  });

  it('does not alert when no business date has been set on the instance', () => {
    // Configuration enabled but the date was never created: the footer falls back to the system date.
    const result = intercept('/fineract-provider/api/v1/businessdate/BUSINESS_DATE', 404);
    expect(alert).not.toHaveBeenCalled();
    expect(result).toBe('errored');
  });

  it('still alerts when the business date list is missing', () => {
    intercept('/fineract-provider/api/v1/businessdate', 404);
    expect(alert).toHaveBeenCalled();
  });
});
