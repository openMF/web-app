/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService } from 'app/settings/settings.service';
import { MonthlyFeeService } from './monthly-fee.service';
import {
  diagnosticPeriod,
  parseMonthlyFeeJson,
  readFeeCapabilities,
  readFeePage,
  readFeeRun,
  validFeePeriod
} from './monthly-fee.model';
import { feeCapabilities, feePage, feeRun } from './monthly-fee.fixtures';
import { financialCodeLabel } from './financial-controls.messages';

const root = '/savings/monthly-fees';
describe('BE-07 exact diagnostic API contract', () => {
  let service: MonthlyFeeService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        { provide: SettingsService, useValue: { tenantIdentifier: 'default' } },
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(MonthlyFeeService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('rejects cross-tenant runs and a response arriving after a tenant change', () => {
    const failed = jest.fn();
    service.run(feeRun.id).subscribe({ error: failed });
    http.expectOne(`${root}/runs/${feeRun.id}`).flush(JSON.stringify({ ...feeRun, tenant: 'other' }));
    expect(failed).toHaveBeenCalledTimes(1);
    service.capabilities().subscribe({ error: failed });
    Object.assign(TestBed.inject(SettingsService), { tenantIdentifier: 'other' });
    http.expectOne(root + '/template').flush(JSON.stringify(feeCapabilities));
    expect(failed).toHaveBeenCalledTimes(2);
  });
  it('loads every separate capability without promoting diagnostic support to posting', () => {
    service.capabilities().subscribe((caps) => expect(caps).toEqual(feeCapabilities));
    http.expectOne(root + '/template').flush(JSON.stringify(feeCapabilities));
    expect(() => readFeeCapabilities({ ...feeCapabilities, postingSupported: 'true' })).toThrow();
  });
  it('preserves numeric wire amounts and identifiers before JSON.parse rounds them', () => {
    service.assessments(feeRun.id, '9007199254740992', 1).subscribe((page) => {
      expect(page.items[0].accountId).toBe('9007199254740993');
      expect(page.items[0].minimumMonthlyAverageBalance).toBe('9999999999999.999999');
      expect(page.items[0].configuredFeeAmount).toBe('100.000001');
      expect(page.nextAfterId).toBe('9007199254740993');
    });
    const req = http.expectOne((r) => r.url === `${root}/runs/${feeRun.id}/assessments`);
    expect(req.request.params.get('afterId')).toBe('9007199254740992');
    expect(req.request.params.get('limit')).toBe('1');
    req.flush(JSON.stringify(feePage).replace(/"(9007199254740993|9999999999999.999999|100.000001)"/g, '$1'));
  });
  it('uses the server period cursor and only the supported history query', () => {
    service.runs('2026-10', 2).subscribe((history) => expect(history.items).toHaveLength(1));
    const req = http.expectOne((r) => r.url === root + '/runs');
    expect(req.request.params.keys().sort()).toEqual([
      'beforePeriod',
      'limit'
    ]);
    req.flush(JSON.stringify({ items: [feeRun], nextBeforePeriod: feeRun.period, hasMore: true }));
  });
  it('creates a diagnostic run with period in the query and no caller financial data', () => {
    service.createDiagnosticRun('2026-10').subscribe((run) => expect(run.id).toBe(feeRun.id));
    const req = http.expectOne(root + '/runs?period=2026-10');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(JSON.stringify(feeRun));
  });
  it('processes one bounded chunk without retrying failed durable writes', () => {
    const failed = jest.fn();
    service.assessDiagnosticChunk(feeRun.id, 100).subscribe({ error: failed });
    const req = http.expectOne(`${root}/runs/${feeRun.id}/assess?limit=100`);
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 503, statusText: 'Unavailable' });
    expect(failed).toHaveBeenCalledTimes(1);
    http.expectNone((r) => r.method === 'POST');
  });
  it('keeps reconciliation read-only and preserves false accounting evidence', () => {
    service.reconciliation(feeRun.id).subscribe((r) => expect(r.nativeAccountingVerified).toBe(false));
    const req = http.expectOne(`${root}/runs/${feeRun.id}/reconciliation`);
    expect(req.request.method).toBe('GET');
    req.flush(
      JSON.stringify({
        runId: feeRun.id,
        status: 'NOT_ATTEMPTED',
        unknownOutcomes: 0,
        nativeAccountingVerified: false,
        financialRetryAllowed: false
      })
    );
  });
  it.each([
    0,
    -1,
    101,
    1.5,
    NaN
  ])('rejects invalid batch sizes before transport (%s)', (size) => {
    expect(() => service.assessDiagnosticChunk(feeRun.id, size)).toThrow();
  });
  it.each([
    '../bad',
    '',
    'a/b',
    'a?tenant=other'
  ])('rejects invalid run identifiers (%s)', (id) => {
    expect(() => service.run(id)).toThrow();
  });
  it.each([
    '-1',
    '1.1',
    '9223372036854775808',
    'x'
  ])('rejects invalid long cursors (%s)', (id) => {
    expect(() => service.assessments(feeRun.id, id)).toThrow();
  });
  it.each([
    '2026-00',
    '2026-13',
    '1899-12',
    '9999-01',
    '2026-1'
  ])('rejects unsupported month %s', (period) => {
    expect(validFeePeriod(period)).toBe(false);
    expect(() => service.createDiagnosticRun(period)).toThrow();
  });
  it('derives a completed month from backend date across year boundaries', () => {
    expect(diagnosticPeriod('2026-01-01')).toBe('2025-12');
    expect(diagnosticPeriod(null)).toBeNull();
    expect(diagnosticPeriod('2026-02-30')).toBeNull();
    expect(validFeePeriod('9998-12')).toBe(true);
  });
  it('rejects malformed data and nonadvancing or inconsistent pages', () => {
    expect(() => readFeeRun({ ...feeRun, evaluated: 9007199254740992 })).toThrow();
    expect(() => readFeePage({ ...feePage, nextAfterId: '0' })).toThrow();
    expect(() => readFeePage({ ...feePage, items: [] })).toThrow();
    expect(() =>
      readFeePage({ ...feePage, items: [{ ...feePage.items[0], configuredFeeAmount: '10', feeChargeId: null }] })
    ).toThrow();
    expect(() => parseMonthlyFeeJson('not json')).toThrow();
  });
  it('does not substitute zero for absent monetary evidence and never interprets unknown outcomes as success', () => {
    const page = readFeePage({
      ...feePage,
      items: [{ ...feePage.items[0], configuredFeeAmount: undefined, outcome: 'NEW_STATUS' }]
    });
    expect(page.items[0].configuredFeeAmount).toBeNull();
    expect(financialCodeLabel(page.items[0].outcome)).toBe('FinancialControls.Unknown');
  });
});
