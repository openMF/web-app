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

  describe('domain rule violations', () => {
    const REVERSE_ONLY_CODE = 'error.msg.loan.transaction.error.msg.loan.transaction.update.not.allowed';

    /**
     * Encodes the error body the way the browser delivers it to a request that
     * asked for an ArrayBuffer response. The buffer is filled byte by byte
     * instead of through `TextEncoder`, whose output belongs to another realm
     * under jsdom and would therefore fail the interceptor's `instanceof` check.
     * @param body Error body sent by the backend
     */
    function encodeBody(body: unknown): ArrayBuffer {
      const json = JSON.stringify(body);
      const buffer = new ArrayBuffer(json.length);
      const bytes = new Uint8Array(buffer);
      for (let index = 0; index < json.length; index++) {
        bytes[index] = json.charCodeAt(index);
      }
      return buffer;
    }

    /**
     * Drives the interceptor with the envelope the backend sends for a domain
     * rule violation: a generic code on the envelope and the meaningful one on
     * the nested error.
     * @param nestedCode Globalisation code of the nested error
     * @param translations Keys the translate service knows about
     * @param asArrayBuffer Sends the body encoded, as requests that ask for an
     * ArrayBuffer response receive it
     */
    function interceptDomainRuleViolation(
      nestedCode: string,
      translations: { [key: string]: string } = {},
      asArrayBuffer = false
    ): void {
      TestBed.resetTestingModule();
      alert = jest.fn();
      TestBed.configureTestingModule({
        providers: [
          ErrorHandlerInterceptor,
          { provide: AlertService, useValue: { alert } },
          {
            provide: TranslateService,
            useValue: { instant: (key: string) => translations[key] ?? key }
          }
        ]
      });
      const localInterceptor = TestBed.inject(ErrorHandlerInterceptor);
      const body = {
        userMessageGlobalisationCode: 'validation.msg.domain.rule.violation',
        defaultUserMessage: 'Request was understood but caused a domain rule violation.',
        errors: [
          {
            userMessageGlobalisationCode: nestedCode,
            defaultUserMessage: 'Loan transaction: 77 update not allowed as loan transaction is a goodwillCredit'
          }
        ]
      };
      const response = new HttpErrorResponse({
        status: 403,
        url: '/fineract-provider/api/v1/loans/1/transactions/77',
        error: asArrayBuffer ? encodeBody(body) : body
      });
      try {
        (localInterceptor as any).handleError(response, new HttpRequest('POST', response.url, {})).subscribe({
          error: (): void => undefined
        });
      } catch {
        // The interceptor rethrows after alerting, which is the path under test.
      }
    }

    it('shows the translated message for the backend code', () => {
      interceptDomainRuleViolation(REVERSE_ONLY_CODE, {
        [`errors.${REVERSE_ONLY_CODE}`]: 'This transaction type can only be reversed.'
      });

      expect(alert).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'This transaction type can only be reversed.' })
      );
    });

    it('shows the translated message when the body arrives as an ArrayBuffer', () => {
      interceptDomainRuleViolation(
        REVERSE_ONLY_CODE,
        { [`errors.${REVERSE_ONLY_CODE}`]: 'This transaction type can only be reversed.' },
        true
      );

      expect(alert).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'This transaction type can only be reversed.' })
      );
    });

    it('falls back to the server message when the code has no translation', () => {
      interceptDomainRuleViolation(REVERSE_ONLY_CODE);

      expect(alert).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Loan transaction: 77 update not allowed as loan transaction is a goodwillCredit'
        })
      );
    });
  });
});
