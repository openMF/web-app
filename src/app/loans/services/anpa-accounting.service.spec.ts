/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnpaAccountingService } from './anpa-accounting.service';
import { ProposalRequest } from '../models/anpa-accounting.model';

describe('AnpaAccountingService', () => {
  let service: AnpaAccountingService;
  let http: HttpTestingController;
  const base = '/v1/loans/anpa-writeoff';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });

    service = TestBed.inject(AnpaAccountingService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('reads the live template without a hostname or duplicate API prefix', () => {
    service.getCapabilities().subscribe();
    http.expectOne(base + '/template').flush({});
  });
  it.each([
    [
      'getEligibility',
      'eligibility'
    ],
    [
      'getHistory',
      'history'
    ],
    [
      'getReceivables',
      'receivables'
    ],
    [
      'getAccountingPolicy',
      'accounting-policy'
    ],
    [
      'getReclassificationHistory',
      'reclassification-history'
    ]
  ] as const)('%s scopes reads to the selected loan', (method, path) => {
    (service[method](42) as Observable<object>).subscribe();
    http.expectOne(base + '/loans/42/' + path).flush({});
  });
  it('sends ISO asOf with HttpParams', () => {
    service.getPreview(42, '2026-11-15').subscribe();
    const req = http.expectOne(base + '/loans/42/preview?asOf=2026-11-15');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
  it.each([
    [
      'getAssessments',
      'assessments'
    ],
    [
      'getAccountingPolicies',
      'accounting-policies'
    ],
    [
      'getReconciliationAssessments',
      'reconciliation-assessments'
    ],
    [
      'getAdjustments',
      'adjustments'
    ]
  ] as const)('%s uses sequence cursor pagination', (method, path) => {
    (service[method](42, 19, 20) as Observable<object>).subscribe();
    http.expectOne(base + '/loans/42/' + path + '?after=19&limit=20').flush([]);
  });
  it.each([
    [
      'getAssessment',
      'assessments'
    ],
    [
      'getAccountingPolicyEvent',
      'accounting-policies'
    ],
    [
      'getReconciliationAssessment',
      'reconciliation-assessments'
    ],
    [
      'getAdjustment',
      'adjustments'
    ]
  ] as const)('%s uses a scoped record URL', (method, path) => {
    (service[method](42, 'record/id') as Observable<object>).subscribe();
    http.expectOne(base + '/loans/42/' + path + '/record%2Fid').flush({});
  });
  it('passes an optional original assessment reference', () => {
    service.getWriteOffReconciliation(42, 'record').subscribe();
    http.expectOne(base + '/loans/42/writeoff-reconciliation?assessmentId=record').flush({});
  });
  it('does not add an empty assessmentId', () => {
    service.getWriteOffReconciliation(42).subscribe();
    http.expectOne(base + '/loans/42/writeoff-reconciliation').flush({});
  });
  it('serializes only assessment evidence fields', () => {
    const body = { idempotencyKey: 'key', asOf: '2026-11-15' };
    service.saveAssessment(42, body).subscribe();
    const req = http.expectOne(base + '/loans/42/assessments');
    expect(req.request.body).toEqual(body);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
  it('records reconciliation without an unsolicited correction reason', () => {
    const body = { idempotencyKey: 'key', assessmentId: 'saved' };
    service.saveReconciliationAssessment(42, body).subscribe();
    const req = http.expectOne(base + '/loans/42/reconciliation-assessments');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });
  it('posts a policy wrapper and explicit approval reference', () => {
    service
      .createAccountingPolicyDraft(42, {
        idempotencyKey: 'key',
        policy: {
          version: 1,
          accountingRule: 4,
          currency: 'USD',
          effectiveFrom: '2026-01-01',
          effectiveThrough: null,
          approvalReference: 'test',
          rules: []
        }
      })
      .subscribe();
    const req = http.expectOne(base + '/loans/42/accounting-policies');
    expect(req.request.body.policy.version).toBe(1);
    req.flush({});
    service
      .approveAccountingPolicy(42, 'draft', { idempotencyKey: 'approval', approvalReference: 'checker' })
      .subscribe();
    http.expectOne(base + '/loans/42/accounting-policies/draft/approvals').flush({});
  });
  it.each([
    400,
    401,
    403,
    404,
    409,
    422,
    500,
    502,
    503
  ])('propagates HTTP %s without retrying a proposal', (status) => {
    const body: ProposalRequest = {
      idempotencyKey: 'key',
      reconciliationId: 'saved',
      reason: 'review',
      operation: 'NPA_RECLASSIFICATION_REVERSAL'
    };
    const failure = jest.fn();
    service.createAdjustmentProposal(42, body).subscribe({ error: failure });
    const req = http.expectOne(base + '/loans/42/adjustment-proposals');
    expect(req.request.body).toEqual(body);
    req.flush({}, { status, statusText: 'Rejected' });
    expect(failure).toHaveBeenCalledTimes(1);
    http.expectNone(base + '/loans/42/adjustment-proposals');
  });
  it('rejects invalid loan IDs and pagination without sending a request', () => {
    expect(() => service.getEligibility(0)).toThrow();
    expect(() => service.getAssessments(42, -1, 201)).toThrow();
  });
});
