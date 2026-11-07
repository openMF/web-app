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
import { ProductPolicyService } from './product-policy.service';
import { InterestMatrixService } from './interest-matrix.service';
import { ReferenceRateService } from './reference-rate.service';
import { policy, capabilities } from './product-policy.fixtures';
import { matrix, formula } from './interest-rate.fixtures';
import { parseExactJson, validateMatrix } from './interest-rate.model';

describe('BE-03/BE-04 exact HTTP contracts', () => {
  let matrices: InterestMatrixService,
    rates: ReferenceRateService,
    policies: ProductPolicyService,
    http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        { provide: SettingsService, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    matrices = TestBed.inject(InterestMatrixService);
    rates = TestBed.inject(ReferenceRateService);
    policies = TestBed.inject(ProductPolicyService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const root = '/savingsproducts/policy/42';
  function config(revision = 5) {
    return {
      savingsProductId: 42,
      revision,
      status: 'DRAFT',
      policy: { ...policy, interestMatrix: matrix, referenceRate: formula },
      capabilities
    };
  }
  it('reads and validates matrix metadata and normalizes omitted unbounded upper', () => {
    matrices.configuration(42).subscribe((c) => expect(c.matrix.brackets[0].upperBalance).toBeNull());
    http
      .expectOne(root + '/interest-matrix')
      .flush(
        '{"savingsProductId":42,"revision":5,"financialOperational":false,"matrix":{"calculationMethod":"UNAPPROVED","brackets":[{"lowerBalance":0,"annualRatePercent":1.123456}]}}'
      );
  });
  it.each([
    true,
    false
  ])('uses correct matrix %s endpoint and shared revision', (validate) => {
    matrices.write(42, 5, matrix, validate).subscribe();
    const r = http.expectOne(root + '/interest-matrix' + (validate ? '/validate' : ''));
    expect(r.request.method).toBe(validate ? 'POST' : 'PUT');
    expect(r.request.body).toContain('"expectedRevision":5');
    expect(r.request.body).toContain('"lowerBalance":1000.01');
    expect(r.request.body).toContain('"annualRatePercent":1.123456');
    expect(r.request.headers.get('Content-Type')).toBe('application/json');
    r.flush('{}');
  });
  it('sends deliberate date and exact balance query parameters for review only', () => {
    matrices.selection(42, '9999999999999.99', '2026-11-06').subscribe();
    const r = http.expectOne((r) => r.url.endsWith('/interest-matrix/selection'));
    expect(r.request.params.get('balance')).toBe('9999999999999.99');
    expect(r.request.params.get('businessDate')).toBe('2026-11-06');
    r.flush('{}');
  });
  it('writes exact formula parameters without erasing another aggregate field', () => {
    rates.saveFormula(42, 5, formula).subscribe();
    const r = http.expectOne(root + '/reference-rate');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toContain('"spreadPercentagePoints":-0.123456789012');
    expect(JSON.parse(r.request.body)).toMatchObject({ expectedRevision: 5, formula: { multiplier: null } });
    expect(r.request.body).not.toContain('interestMatrix');
    r.flush('{}');
  });
  it('serializes multiplicative factors as dimensionless numeric literals', () => {
    rates
      .saveFormula(42, 5, {
        ...formula,
        formulaMode: 'MULTIPLICATIVE_FACTOR',
        multiplier: '1.200000000001',
        spreadPercentagePoints: null
      })
      .subscribe();
    const r = http.expectOne(root + '/reference-rate');
    expect(r.request.body).toContain('"multiplier":1.200000000001');
    r.flush('{}');
  });
  it('keeps approved preview decimals exact and always sends the requested date', () => {
    rates.preview(42, '2026-11-06').subscribe((p) => expect(p.calculatedAnnualRatePercent).toBe('1000.0000000001'));
    const r = http.expectOne((r) => r.url.endsWith('/reference-rate/preview'));
    expect(r.request.params.get('businessDate')).toBe('2026-11-06');
    r.flush('{"calculatedAnnualRatePercent":1000.0000000001,"financialOperational":false}');
  });
  it('does not retry missing fixing, forbidden, or conflict responses', () => {
    const error = jest.fn();
    rates.preview(42, '2026-11-06').subscribe({ error });
    http
      .expectOne((r) => r.url.endsWith('/preview'))
      .flush({ errors: [{ parameterName: 'benchmarkFixing' }] }, { status: 400, statusText: 'Bad Request' });
    expect(error).toHaveBeenCalledTimes(1);
    rates.saveFormula(42, 5, formula).subscribe({ error });
    http.expectOne(root + '/reference-rate').flush({}, { status: 409, statusText: 'Conflict' });
    rates.definitions().subscribe({ error });
    http.expectOne('/savingsproducts/reference-rates').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(error).toHaveBeenCalledTimes(3);
  });
  it('uses definition revision for capture and fixing revision for independent actions', () => {
    rates
      .capture('CETES_TEST', {
        expectedRevision: 9,
        tenor: 'D28',
        annualRatePercent: '1.000000000001',
        publicationDate: '2026-11-06',
        effectiveDate: '2026-11-06',
        sourceReference: 'Test-only contract fixture',
        note: null
      })
      .subscribe();
    const r = http.expectOne('/savingsproducts/reference-rates/CETES_TEST/fixings');
    expect(r.request.body).toContain('"annualRatePercent":1.000000000001');
    expect(JSON.parse(r.request.body).expectedRevision).toBe(9);
    expect(r.request.body).not.toMatch(/makerId|checkerId/);
    r.flush('{}');
    for (const action of [
      'submit',
      'approve',
      'reject'
    ] as const) {
      rates
        .action({ referenceId: 'CETES_TEST', version: 10, revision: 2 } as any, action, 'Independent reason')
        .subscribe();
      const request = http.expectOne('/savingsproducts/reference-rates/CETES_TEST/fixings/10/' + action);
      expect(JSON.parse(request.request.body)).toEqual({ expectedRevision: 2, reason: 'Independent reason' });
      request.flush('{}');
    }
  });
  it('uses exact-date effective fixing and separate audit/history reads', () => {
    rates.effective('CETES_TEST', 'D28', '2026-11-06').subscribe();
    const r = http.expectOne((r) => r.url.endsWith('/CETES_TEST/effective'));
    expect(r.request.params.get('businessDate')).toBe('2026-11-06');
    expect(r.request.params.get('tenor')).toBe('D28');
    r.flush('{}');
    rates.history('CETES_TEST').subscribe();
    http.expectOne('/savingsproducts/reference-rates/CETES_TEST/fixings').flush('[]');
    rates.audit('CETES_TEST').subscribe();
    http.expectOne('/savingsproducts/reference-rates/CETES_TEST/audit').flush('[]');
  });
  it('preflights full-policy saves, preserving advanced data for an older caller', () => {
    const { interestMatrix, referenceRate, ...basic } = policy;
    policies.save(42, 5, basic).subscribe();
    http.expectOne(root).flush(JSON.stringify(config()));
    const r = http.expectOne(root);
    const body = parseExactJson<any>(r.request.body);
    expect(body.policy.interestMatrix).toEqual(matrix);
    expect(body.policy.referenceRate).toEqual(formula);
    r.flush('{}');
  });
  it('never upgrades the revision or resubmits after discovering another administrator write', () => {
    const error = jest.fn();
    policies.save(42, 5, policy).subscribe({ error });
    http.expectOne(root).flush(JSON.stringify(config(6)));
    expect(error.mock.calls[0][0].status).toBe(409);
    http.expectNone(root);
  });
  it('rejects unknown advanced fields before any full-policy write', () => {
    const error = jest.fn();
    policies.save(42, 5, policy).subscribe({ error });
    const c = config();
    (c.policy.interestMatrix as any).newSemantics = 'UNKNOWN';
    http.expectOne(root).flush(JSON.stringify(c));
    delete (matrix as any).newSemantics;
    expect(error).toHaveBeenCalled();
    http.expectNone(root);
  });
  it.each([
    0,
    -1,
    Number.NaN,
    Number.MAX_SAFE_INTEGER + 1
  ])('reports matrix revision %s through the subscriber without an HTTP request', (revision) => {
    let request: ReturnType<InterestMatrixService['write']>;
    expect(() => (request = matrices.write(42, revision, matrix))).not.toThrow();
    const error = jest.fn();
    request.subscribe({ error });
    expect(error).toHaveBeenCalledTimes(1);
    http.expectNone(() => true);
  });
  it('delivers overlong insignificant decimal precision to the error channel for both validate and save', () => {
    const value = {
      ...matrix,
      brackets: [{ lowerBalance: '0.0000000000000', upperBalance: '10000', annualRatePercent: '1' }]
    };
    expect(validateMatrix(value, 2, '10000')).toEqual([]);
    for (const validate of [
      true,
      false
    ]) {
      let request: ReturnType<InterestMatrixService['write']>;
      expect(() => (request = matrices.write(42, 5, value, validate))).not.toThrow();
      const error = jest.fn();
      request.subscribe({ error });
      expect(error).toHaveBeenCalledTimes(1);
    }
    http.expectNone(() => true);
  });
  it.each([
    0,
    -1,
    Number.NaN,
    Number.MAX_SAFE_INTEGER + 1
  ])('reports formula revision %s through the subscriber without an HTTP request', (revision) => {
    let request: ReturnType<ReferenceRateService['saveFormula']>;
    expect(() => (request = rates.saveFormula(42, revision, formula))).not.toThrow();
    const error = jest.fn();
    request.subscribe({ error });
    expect(error).toHaveBeenCalledTimes(1);
    http.expectNone(() => true);
  });
  it('defers invalid formula parameter parsing until subscription', () => {
    let request: ReturnType<ReferenceRateService['saveFormula']>;
    expect(() => (request = rates.saveFormula(42, 5, { ...formula, spreadPercentagePoints: '1e2' }))).not.toThrow();
    const error = jest.fn();
    request.subscribe({ error });
    expect(error).toHaveBeenCalledTimes(1);
    http.expectNone(() => true);
  });
  it.each([
    '1e2',
    '0.00000000000001'
  ])('defers invalid capture decimal %s until subscription', (annualRatePercent) => {
    let request: ReturnType<ReferenceRateService['capture']>;
    expect(
      () =>
        (request = rates.capture('CETES_TEST', {
          expectedRevision: 0,
          tenor: 'D28',
          annualRatePercent,
          publicationDate: '2026-11-06',
          effectiveDate: '2026-11-09',
          sourceReference: 'Contract fixture',
          note: null
        }))
    ).not.toThrow();
    const error = jest.fn();
    request.subscribe({ error });
    expect(error).toHaveBeenCalledTimes(1);
    http.expectNone(() => true);
  });
  it('defers invalid fixing action revisions until subscription', () => {
    let request: ReturnType<ReferenceRateService['action']>;
    expect(
      () =>
        (request = rates.action({ referenceId: 'CETES_TEST', version: 1, revision: Number.NaN } as any, 'submit', ''))
    ).not.toThrow();
    const error = jest.fn();
    request.subscribe({ error });
    expect(error).toHaveBeenCalledTimes(1);
    http.expectNone(() => true);
  });
});
