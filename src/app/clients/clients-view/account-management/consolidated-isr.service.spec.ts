/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SettingsService } from 'app/settings/settings.service';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConsolidatedIsrService, validIsrPeriod } from './consolidated-isr.service';
import { AccountManagementAccess } from './account-management-access.service';
import { IsrContractError, isrIsoDate } from './consolidated-isr.model';
import { ACCOUNT_MANAGEMENT_REQUEST } from 'app/core/http/account-management-request';
import {
  isrCapabilities,
  isrId,
  isrPeriod,
  isrEligibility,
  isrSources,
  isrPreview,
  isrCalculation,
  isrReconciliation,
  isrWireJson
} from '../../../../../playwright/fixtures/consolidated-isr-data';

const root = '/savings/consolidated-isr';
describe('BE-11 ISR read contracts', () => {
  let http: HttpTestingController;
  let api: ConsolidatedIsrService;
  let denied: Set<string>;
  beforeEach(() => {
    denied = new Set();
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: { server: 'test-server', tenantIdentifier: 'default' } },
        { provide: AccountManagementAccess, useValue: { has: (key: string) => !denied.has(key) } }
      ] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(ConsolidatedIsrService);
  });
  afterEach(() => http.verify());
  it('reads the live capability template; absent flags remain unknown', () => {
    api.template().subscribe((data) => {
      expect(data.eligibilityDiagnostics).toBe(true);
      expect(data.withholdingExecution).toBeUndefined();
    });
    const request = http.expectOne(root + '/template');
    expect(request.request.context.get(ACCOUNT_MANAGEMENT_REQUEST)).toBe(true);
    request.flush('{"eligibilityDiagnostics":true}');
  });
  it.each([
    {},
    { calculation: 'true' },
    { ...isrCapabilities, nativeBalanceObservations: 1 }
  ])('rejects incompatible capabilities %j', (response) => {
    const error = jest.fn();
    api.template().subscribe({ error });
    http.expectOne(root + '/template').flush(JSON.stringify(response));
    expect(error.mock.calls[0][0]).toBeInstanceOf(IsrContractError);
  });
  it.each([
    0,
    400,
    401,
    403,
    404,
    409,
    422,
    500
  ])('preserves HTTP %s without fallback or retry', (status) => {
    const error = jest.fn();
    api.template().subscribe({ error });
    http.expectOne(root + '/template').flush('{}', { status, statusText: 'Rejected' });
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0].status).toBe(status);
  });
  it('sends ISO periods and the actual customer on all diagnostic reads', () => {
    api.eligibility(7, isrPeriod).subscribe((data) => expect(data.accounts[0].eligible).toBe(false));
    api.accounts(7, isrPeriod).subscribe((data) => {
      expect(data.observations.map((row) => row.currency)).toEqual([
        'MXN',
        'USD'
      ]);
      expect(data.observations[0].nativeWithheldTax).toBe('0.25');
    });
    api.preview(7, isrPeriod).subscribe((data) => {
      expect(data.taxableBase).toBeNull();
      expect(data.calculatedIsr).toBeNull();
      expect(data.actualWithheldAmount).toBeNull();
    });
    for (const [
      name,
      data
    ] of [
      [
        'eligibility',
        isrEligibility()
      ],
      [
        'accounts',
        isrSources()
      ],
      [
        'preview',
        isrPreview()
      ]
    ] as const) {
      const request = http.expectOne((r) => r.url === `${root}/clients/7/${name}`);
      expect(request.request.method).toBe('GET');
      expect(request.request.params.keys().sort()).toEqual([
        'from',
        'through'
      ]);
      expect(request.request.params.get('from')).toBe(isrPeriod.from);
      expect(request.request.params.get('through')).toBe(isrPeriod.through);
      request.flush(isrWireJson(data));
    }
  });
  it.each([
    null,
    [],
    { currency: null },
    { currency: 'usd' },
    { currencyDigits: -1 },
    { currencyDigits: 7 },
    { currencyDigits: 1.5 },
    { accountCount: -1 },
    { accountCount: Number.MAX_SAFE_INTEGER + 1 },
    { nativeWithheldTax: 'NaN' },
    { nativePostedInterest: {} },
    { observedLedgerBalance: true }
  ])('rejects invalid observation rows as incompatible: %j', (invalid) => {
    const data = isrSources();
    const row = invalid === null || Array.isArray(invalid) ? invalid : { ...data.observations[0], ...invalid };
    const error = jest.fn();
    api.accounts(7, isrPeriod).subscribe({ error });
    http.expectOne((r) => r.url.endsWith('/accounts')).flush(isrWireJson({ ...data, observations: [row] }));
    expect(error.mock.calls[0][0]).toBeInstanceOf(IsrContractError);
  });
  it('accepts nullable observation amounts without coercing them to zero', () => {
    const data = isrSources();
    data.observations[0].nativeWithheldTax = null;
    api.accounts(7, isrPeriod).subscribe((value) => expect(value.observations[0].nativeWithheldTax).toBeNull());
    http.expectOne((r) => r.url.endsWith('/accounts')).flush(isrWireJson(data));
  });
  it('retains exact decimal digits from numeric JSON', () => {
    const data = isrSources();
    data.accounts[0].observedLedgerBalance = '9999999999999.123456';
    api
      .accounts(7, isrPeriod)
      .subscribe((response) => expect(response.accounts[0].observedLedgerBalance).toBe('9999999999999.123456'));
    http.expectOne((r) => r.url.endsWith('/accounts')).flush(isrWireJson(data));
  });
  it.each([
    'eligibility',
    'accounts',
    'preview',
    'calculation',
    'history'
  ] as const)('rejects cross-customer %s data', (kind) => {
    const error = jest.fn();
    const responses = {
      eligibility: isrEligibility(8),
      accounts: isrSources(8),
      preview: isrPreview(8),
      calculation: isrCalculation(8),
      history: [{ sequence: 1, calculation: isrCalculation(8) }]
    };
    if (kind === 'calculation') api.calculation(7, isrId).subscribe({ error });
    else if (kind === 'history') api.history(7).subscribe({ error });
    else if (kind === 'eligibility') api.eligibility(7, isrPeriod).subscribe({ error });
    else if (kind === 'accounts') api.accounts(7, isrPeriod).subscribe({ error });
    else api.preview(7, isrPeriod).subscribe({ error });
    http.expectOne(() => true).flush(isrWireJson(responses[kind]));
    expect(error.mock.calls[0][0]).toBeInstanceOf(IsrContractError);
  });
  it('rejects an incorrect response period', () => {
    const data = isrPreview();
    data.taxPeriod.from = '2026-10-01';
    const error = jest.fn();
    api.preview(7, isrPeriod).subscribe({ error });
    http.expectOne((r) => r.url.endsWith('/preview')).flush(isrWireJson(data));
    expect(error).toHaveBeenCalled();
  });
  it('rejects a forged snapshot tenant and a tenant change during a pending read', () => {
    const error = jest.fn();
    const value = isrCalculation();
    value.tenant = 'other-tenant';
    api.calculation(7, isrId).subscribe({ error });
    http.expectOne((r) => r.url.endsWith(isrId)).flush(isrWireJson(value));
    expect(error).toHaveBeenCalledTimes(1);
    api.preview(7, isrPeriod).subscribe({ error });
    Object.assign(TestBed.inject(SettingsService), { tenantIdentifier: 'other-tenant' });
    http.expectOne((r) => r.url.endsWith('/preview')).flush(isrWireJson(isrPreview()));
    expect(error).toHaveBeenCalledTimes(2);
  });
  it('rejects contradictory nonnull financial values in a policy-blocked response', () => {
    const error = jest.fn();
    const value = isrPreview();
    value.calculatedIsr = '1.00';
    api.preview(7, isrPeriod).subscribe({ error });
    http.expectOne((r) => r.url.endsWith('/preview')).flush(isrWireJson(value));
    expect(error.mock.calls[0][0]).toBeInstanceOf(IsrContractError);
  });
  it('paginates history by sequence with after and limit; empty pages remain empty', () => {
    api.history(7, 12, 1).subscribe((data) => expect(data[0].sequence).toBe(30));
    const request = http.expectOne((r) => r.url.endsWith('/calculations'));
    expect(request.request.params.keys().sort()).toEqual([
      'after',
      'limit'
    ]);
    expect(request.request.params.get('after')).toBe('12');
    expect(request.request.params.get('limit')).toBe('1');
    request.flush(isrWireJson([{ sequence: 30, calculation: isrCalculation() }]));
    api.history(7, 30).subscribe((data) => expect(data).toEqual([]));
    http.expectOne((r) => r.params.get('after') === '30').flush('[]');
  });
  it('reads immutable detail, audit cursor and read-only reconciliation', () => {
    api.calculation(7, isrId).subscribe((data) => expect(data.result.state).toBe('BLOCKED_PENDING_POLICY'));
    http.expectOne(`${root}/clients/7/calculations/${isrId}`).flush(isrWireJson(isrCalculation()));
    api.audit(7, isrId, 21, 10).subscribe();
    const request = http.expectOne((r) => r.url.endsWith('/audit'));
    expect(request.request.params.get('after')).toBe('21');
    expect(request.request.params.get('limit')).toBe('10');
    request.flush('[]');
    api.reconciliation(7, isrId).subscribe((data) => expect(data.financialRetryAllowed).toBe(false));
    const check = http.expectOne(`${root}/clients/7/calculations/${isrId}/reconciliation`);
    expect(check.request.method).toBe('GET');
    check.flush(JSON.stringify(isrReconciliation));
  });
  it('rejects a reconciliation or detail for a different calculation', () => {
    const error = jest.fn();
    api.reconciliation(7, isrId).subscribe({ error });
    http
      .expectOne((r) => r.url.endsWith('/reconciliation'))
      .flush(JSON.stringify({ ...isrReconciliation, calculationId: 'other' }));
    expect(error).toHaveBeenCalled();
  });
  it.each([
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1
  ])('rejects invalid after %s before HTTP', (after) => expect(() => api.history(7, after)).toThrow());
  it.each([
    0,
    101,
    1.5
  ])('rejects invalid limit %s before HTTP', (limit) => expect(() => api.history(7, 0, limit)).toThrow());
  it('rejects malformed UUIDs, customer IDs and periods before HTTP', () => {
    expect(() => api.calculation(7, '../other')).toThrow();
    expect(() => api.accounts(0, isrPeriod)).toThrow();
    expect(() => api.eligibility(7, { from: '2026-02-30', through: '2026-03-01' })).toThrow();
  });
  it.each([
    [
      'READ_CONSOLIDATED_ISR_ELIGIBILITY',
      'template'
    ],
    [
      'READ_CONSOLIDATED_ISR_ELIGIBILITY',
      'eligibility'
    ],
    [
      'READ_CONSOLIDATED_ISR',
      'accounts'
    ],
    [
      'PREVIEW_CONSOLIDATED_ISR',
      'preview'
    ],
    [
      'READ_CONSOLIDATED_ISR',
      'history'
    ],
    [
      'READ_CONSOLIDATED_ISR',
      'calculation'
    ],
    [
      'READ_CONSOLIDATED_ISR_AUDIT',
      'audit'
    ],
    [
      'RECONCILE_CONSOLIDATED_ISR',
      'reconciliation'
    ]
  ])('requires exact %s for %s', (permission, method) => {
    denied.add(permission);
    const call = () => {
      switch (method) {
        case 'template':
          return api.template();
        case 'eligibility':
          return api.eligibility(7, isrPeriod);
        case 'accounts':
          return api.accounts(7, isrPeriod);
        case 'preview':
          return api.preview(7, isrPeriod);
        case 'history':
          return api.history(7);
        case 'calculation':
          return api.calculation(7, isrId);
        case 'audit':
          return api.audit(7, isrId);
        default:
          return api.reconciliation(7, isrId);
      }
    };
    expect(call).toThrow(HttpErrorResponse);
    http.expectNone(() => true);
  });
});
describe('ISR diagnostic calendar validation', () => {
  it('serializes local calendar dates without a UTC day shift', () => {
    expect(isrIsoDate(new Date(2026, 10, 1))).toBe('2026-11-01');
    expect(isrIsoDate(new Date(NaN))).toBeNull();
  });
  it('allows exactly 367 inclusive days and rejects 368, reversed, future and pre-1900 dates', () => {
    expect(validIsrPeriod({ from: '2025-11-11', through: '2026-11-12' }, '2026-11-12')).toBe(true);
    for (const p of [
      { from: '2025-11-10', through: '2026-11-12' },
      { from: '2026-11-12', through: '2026-11-11' },
      { from: '2026-11-12', through: '2026-11-13' },
      { from: '1899-12-31', through: '1900-01-01' }
    ])
      expect(validIsrPeriod(p, '2026-11-12')).toBe(false);
  });
});
