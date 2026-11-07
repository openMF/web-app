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
import { policy, capabilities } from './product-policy.fixtures';

describe('ProductPolicyService HTTP contracts', () => {
  let service: ProductPolicyService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        { provide: SettingsService, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(ProductPolicyService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('normalizes omitted null configuration fields from the real JSON provider', () => {
    service.configuration(42).subscribe((config) => {
      expect(config.revision).toBeNull();
      expect(config.policy).toBeNull();
    });
    http
      .expectOne('/savingsproducts/policy/42')
      .flush('{"savingsProductId":42,"status":"UNCONFIGURED","operational":false}');
  });
  it('writes the full DTO using numeric monetary literals', () => {
    service.save(42, 3, policy).subscribe((result) => expect(result.revision).toBe(4));
    http
      .expectOne('/savingsproducts/policy/42')
      .flush(JSON.stringify({ savingsProductId: 42, revision: 3, status: 'DRAFT', policy, capabilities }));
    const req = http.expectOne('/savingsproducts/policy/42');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toContain('"maximumBalance":9999999999999.99');
    expect(JSON.parse(req.request.body).expectedRevision).toBe(3);
    req.flush('{"revision":4}');
  });
  it('treats active HTTP 204 as legitimate absence', () => {
    service.active(42).subscribe((result) => expect(result).toBeNull());
    http.expectOne('/savingsproducts/policy/42/active').flush(null, { status: 204, statusText: 'No Content' });
  });
  it('submits expected revision and explicit effective date; does not send actor IDs', () => {
    service.submit(42, 4, '2026-11-05').subscribe();
    const req = http.expectOne('/savingsproducts/policy/42/submit');
    expect(req.request.body).toEqual({ expectedRevision: 4, effectiveDate: '2026-11-05' });
    req.flush('{}');
  });
  it.each([
    true,
    false
  ])('uses the correct checker endpoint for approve=%s', (approve) => {
    service.decide(42, 4, approve, 'Review reason').subscribe();
    const req = http.expectOne(`/savingsproducts/policy/42/versions/4/${approve ? 'approve' : 'reject'}`);
    expect(req.request.body).toEqual({ reason: 'Review reason' });
    req.flush('{}');
  });
  it('propagates 409 and 403 errors without retrying', () => {
    const error = jest.fn();
    service.save(42, 3, policy).subscribe({ error });
    http.expectOne('/savingsproducts/policy/42').flush({}, { status: 409, statusText: 'Conflict' });
    expect(error).toHaveBeenCalledTimes(1);
  });
  it('loads an authoritative business date only when enabled and never substitutes a browser date', () => {
    service.businessDate().subscribe((date) => expect(date).toBe('2026-10-31'));
    http.expectOne('/configurations/name/enable-business-date').flush({ enabled: true });
    http.expectOne('/businessdate/BUSINESS_DATE').flush({ date: [
        2026,
        10,
        31
      ] });
    service.businessDate().subscribe((date) => expect(date).toBeNull());
    http.expectOne('/configurations/name/enable-business-date').flush({ enabled: false });
  });
});
