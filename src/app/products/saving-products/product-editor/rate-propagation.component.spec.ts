/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { RatePropagationComponent } from './rate-propagation.component';

describe('BE-05 capability-aware read-only review', () => {
  let c: RatePropagationComponent, http: HttpTestingController, permissions: string[];
  const root = '/savingsproducts/policy/rate-propagation';
  beforeEach(() => {
    permissions = ['READ_SAVINGS_RATE_PROPAGATION'];
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ] });
    c = TestBed.runInInjectionContext(() => new RatePropagationComponent());
    c.productId = 42;
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('reads actual fail-closed capabilities and does not execute a batch', () => {
    c.ngOnInit();
    http.expectOne(root + '/template').flush({ planningSupported: true, financialExecutionSupported: false });
    expect(c.capabilities.financialExecutionSupported).toBe(false);
    http.expectNone((r) => r.method !== 'GET');
  });
  it('denies unauthorized reads and actions without making requests', () => {
    permissions = [];
    c.ngOnInit();
    c.form.controls.batchId.setValue('batch-1');
    c.inspect();
    c.planPreview();
    http.expectNone(() => true);
  });
  it('inspects a persisted batch without inventing counters or changing its status', () => {
    c.form.controls.batchId.setValue('batch-1');
    c.inspect();
    const r = http.expectOne(root + '/batches/batch-1');
    expect(r.request.method).toBe('GET');
    r.flush(
      '{"id":"batch-1","savingsProductId":42,"status":"APPROVED","counters":{"totalApplied":0,"totalDiscovered":7}}'
    );
    expect(c.batch.status).toBe('APPROVED');
    expect(c.batch.counters).toEqual({ totalApplied: 0, totalDiscovered: 7 });
  });
  it('does not show another product’s batch', () => {
    c.form.controls.batchId.setValue('other');
    c.inspect();
    http.expectOne(root + '/batches/other').flush('{"savingsProductId":43}');
    expect(c.batch).toBeNull();
    expect(c.error).toBe('InterestManagement.WrongProduct');
  });
  it('uses only the real read-only POST preview endpoint with the selected version/date', () => {
    c.capabilities = { planningSupported: true, financialExecutionSupported: false } as any;
    c.form.patchValue({ policyVersion: '5', effectiveDate: '2026-11-09' });
    c.planPreview();
    const r = http.expectOne(root + '/42/preview');
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual({ policyVersion: 5, effectiveDate: '2026-11-09' });
    r.flush('{"population":{"totalMatching":0}}');
    expect(c.preview.population.totalMatching).toBe(0);
    http.expectNone((r) => /start|assess|approve|submit/.test(r.url));
  });
  it('distinguishes unsupported backend and denied reads and retains requested input', () => {
    c.form.controls.batchId.setValue('batch-1');
    c.loadCapabilities();
    http.expectOne(root + '/template').flush({}, { status: 404, statusText: 'Not Found' });
    expect(c.error).toBe('InterestManagement.PropagationUnavailable');
    c.inspect();
    http.expectOne(root + '/batches/batch-1').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(c.error).toBe('SavingsEditor.Denied');
    expect(c.form.value.batchId).toBe('batch-1');
  });
});
