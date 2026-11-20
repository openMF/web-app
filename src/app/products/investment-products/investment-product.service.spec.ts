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
import { of } from 'rxjs';
import { ProductsService } from '../products.service';
import { InvestmentAccessService } from './investment-access.service';
import { InvestmentProductService, investmentError } from './investment-product.service';
import { CatalogEntry } from './investment-product.models';
import { configurationFixture, rateWriteFixture } from './investment-product.fixtures';
import { serializeInvestmentJson } from './investment-json';
describe('InvestmentProductService', () => {
  let service: InvestmentProductService;
  let http: HttpTestingController;
  const access = { has: jest.fn(() => true) };
  const products = { getFixedDepositProducts: jest.fn(() => of([{ id: 41, name: 'A native product' }])) };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InvestmentProductService,
        { provide: ProductsService, useValue: products },
        { provide: InvestmentAccessService, useValue: access }
      ] });
    service = TestBed.inject(InvestmentProductService);
    http = TestBed.inject(HttpTestingController);
    access.has.mockReturnValue(true);
  });
  afterEach(() => http.verify());
  it('uses version-prefixed BE01 and BE02 paths', () => {
    service.getInvestmentTemplate().subscribe();
    http.expectOne('/v1/investment-products/configuration/template').flush('{}');
    service.getRateTemplate(41).subscribe();
    http.expectOne('/v1/investment-products/41/rates/template').flush('{}');
    service.getCurrentRate(41).subscribe();
    http.expectOne('/v1/investment-products/41/rates').flush('null');
  });
  it('writes exact numeric decimals and revision, without stringifying decimal values', () => {
    service.saveRateDraft(41, rateWriteFixture).subscribe();
    const request = http.expectOne('/v1/investment-products/41/rates/draft');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('Content-Type')).toBe('application/json');
    expect(request.request.body).toContain('"annualRatePercent":14.000001');
    expect(request.request.body).toContain('"expectedRevision":0');
    request.flush('{}');
  });
  it('sends only the revision for publication', () => {
    service.publishRate(41, 3).subscribe();
    const request = http.expectOne('/v1/investment-products/41/rates/publish');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe('{"expectedRevision":3}');
    request.flush('{}');
  });
  it('uses bounded pagination', () => {
    service.getRateVersions(41, 25, 900).subscribe();
    const request = http.expectOne((req) => req.url.endsWith('/versions'));
    expect(request.request.params.get('offset')).toBe('25');
    expect(request.request.params.get('limit')).toBe('200');
    request.flush('[]');
  });
  it('omits unsupported campaign context and blank effective instant in selection', () => {
    service.selectRate(41, { amount: '999999999999.99', termDays: 60 }).subscribe();
    const request = http.expectOne((req) => req.url.endsWith('/selection'));
    expect(request.request.params.get('amount')).toBe('999999999999.99');
    expect(request.request.params.has('campaignId')).toBe(false);
    expect(request.request.params.has('asOfInstant')).toBe(false);
    request.flush('{}');
  });
  it('preserves decimals in native snapshots read from the backend', () => {
    let minimum: string;
    service.getInvestmentConfiguration(41).subscribe((config) => (minimum = config.nativeProduct.minimumDepositAmount));
    http.expectOne('/v1/investment-products/configuration/41').flush(
      serializeInvestmentJson({
        ...configurationFixture,
        nativeProduct: { ...configurationFixture.nativeProduct, minimumDepositAmount: '999999999999.99' }
      })
    );
    expect(minimum).toBe('999999999999.99');
  });
  it('associates unconfigured native products without inventing a classification', () => {
    let result: CatalogEntry[] = [];
    service.catalog().subscribe((entries) => (result = entries));
    http
      .expectOne('/v1/investment-products/configuration/41')
      .flush(serializeInvestmentJson({ ...configurationFixture, status: 'UNCONFIGURED', policy: null, revision: 0 }));
    expect(result[0].native.id).toBe(41);
    expect(result[0].configuration.policy).toBeNull();
    expect(result[0].rateStatus).toBeUndefined();
  });
  it('does not request policies without permission', () => {
    access.has.mockReturnValue(false);
    let result: CatalogEntry[] = [];
    service.catalog().subscribe((entries) => (result = entries));
    http.expectNone('/v1/investment-products/configuration/41');
    expect(result[0].error).toBe('Investment.forbidden');
  });
  it('distinguishes inaccessible policies from unavailable backend errors', () => {
    let result: CatalogEntry[] = [];
    service.catalog().subscribe((entries) => (result = entries));
    http.expectOne('/v1/investment-products/configuration/41').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(result[0].error).toBe('Investment.forbidden');
  });
  it('preserves revision conflicts without retrying writes', () => {
    let error;
    service.saveRateDraft(41, rateWriteFixture).subscribe({ error: (value) => (error = value) });
    http
      .expectOne('/v1/investment-products/41/rates/draft')
      .flush('{"blockers":[]}', { status: 409, statusText: 'Conflict' });
    expect(investmentError(error)).toBe('Investment.conflict');
    http.expectNone('/v1/investment-products/41/rates/draft');
  });
});
