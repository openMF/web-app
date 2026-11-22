/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { DepositReceiptContext } from './deposit-receipt.model';
import { DepositSubmissionStateService } from './deposit-submission-state.service';

const context: DepositReceiptContext = {
  accountId: 77,
  account: {
    id: 77,
    accountNo: 'SA-77',
    currency: { code: 'USD', decimalPlaces: 2 },
    summary: { accountBalance: 100 },
    transactions: [{ id: 1 }]
  },
  customer: { id: 10, displayName: 'Test client', mobileNo: 'private', externalId: 'private' },
  amount: 50,
  date: [
    2026,
    11,
    11
  ],
  receiptReference: 'original-reference',
  depositType: 'CASH',
  paymentMethod: 'Cash',
  note: ''
};

describe('DepositSubmissionStateService', () => {
  let storage: Map<string, string>;
  let userId: number;
  let settings: { baseServerUrl: string; tenantIdentifier: string };
  let service: DepositSubmissionStateService;
  beforeEach(() => {
    storage = new Map();
    userId = 1;
    settings = { baseServerUrl: 'https://test.invalid/api', tenantIdentifier: 'test-tenant' };
    jest.spyOn(sessionStorage, 'getItem').mockImplementation((key) => storage.get(key) ?? null);
    jest.spyOn(sessionStorage, 'setItem').mockImplementation((key, value) => {
      storage.set(key, value);
    });
    jest.spyOn(sessionStorage, 'removeItem').mockImplementation((key) => {
      storage.delete(key);
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: settings },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ userId }) } }
      ]
    });
    service = TestBed.inject(DepositSubmissionStateService);
  });
  afterEach(() => jest.restoreAllMocks());

  it('restores the original reference across service recreation without storing credentials or account history', () => {
    expect(service.begin(context)).toBe(true);
    const restored = TestBed.runInInjectionContext(() => new DepositSubmissionStateService());
    expect(restored.pending?.context).toMatchObject({
      accountId: 77,
      receiptReference: 'original-reference',
      amount: 50
    });
    const saved = [...storage.values()][0];
    expect(saved).not.toMatch(/accountBalance|transactions|mobileNo|externalId|permissions|accessToken/);
    expect(service.begin({ ...context, receiptReference: 'another-reference' })).toBe(false);
  });

  it('isolates server, tenant and operator while preserving the original scope', () => {
    service.begin(context);
    userId = 2;
    expect(service.pending).toBeNull();
    userId = 1;
    settings.tenantIdentifier = 'other';
    expect(service.pending).toBeNull();
    settings.tenantIdentifier = 'test-tenant';
    settings.baseServerUrl = 'https://other.invalid';
    expect(service.pending).toBeNull();
    settings.baseServerUrl = 'https://test.invalid/api';
    expect(service.pending?.context?.receiptReference).toBe(context.receiptReference);
  });

  it('only releases the matching reference after a definite result', () => {
    service.begin(context);
    service.resolve('stale-reference');
    expect(service.pending).not.toBeNull();
    service.resolve(context.receiptReference);
    expect(service.pending).toBeNull();
    expect(storage.size).toBe(0);
    expect(service.begin({ ...context, receiptReference: 'next-reference' })).toBe(true);
  });

  it('fails before financial dispatch if session storage cannot preserve the request', () => {
    jest.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('Unavailable');
    });
    expect(service.begin(context)).toBe(false);
  });

  it('keeps damaged or unreadable records blocked instead of discarding financial uncertainty', () => {
    service.begin(context);
    const key = [...storage.keys()][0];
    storage.set(key, '{broken');
    const restored = TestBed.runInInjectionContext(() => new DepositSubmissionStateService());
    expect(restored.pending).toEqual({ context: null });
    expect(restored.begin(context)).toBe(false);
  });
  it('does not persist a new financial request without actual account currency and precision', () => {
    expect(service.begin({ ...context, account: { id: 77 } })).toBe(false);
    expect(service.begin({ ...context, account: { id: 77, currency: { code: 'USD' } } })).toBe(false);
    expect(storage.size).toBe(0);
  });
});
