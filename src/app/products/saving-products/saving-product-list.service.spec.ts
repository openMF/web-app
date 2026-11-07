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
import { of, throwError } from 'rxjs';
import { ProductsService } from '../products.service';
import { SavingProductListService, SavingsProductList } from './saving-product-list.service';

const policy = (id: number, classification = 'SIGHT') => ({
  savingsProductId: id,
  revision: 1,
  status: 'DRAFT',
  operational: false,
  policy: { classification, purpose: 'GUARANTEED', interestMode: 'REFERENCE_RATE' }
});

describe('SavingProductListService', () => {
  let http: HttpTestingController;
  let service: SavingProductListService;
  let products: { getSavingProducts: jest.Mock };
  let result: SavingsProductList;

  beforeEach(() => {
    products = {
      getSavingProducts: jest.fn(() =>
        of([
          { id: 1, name: 'Main' },
          { id: 2, name: 'Legacy' }
        ])
      )
    };
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductsService, useValue: products }
      ] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SavingProductListService);
  });
  afterEach(() => http.verify());
  const template = () => http.expectOne('/savingsproducts/policy/template').flush({ classifications: ['SIGHT'] });

  it('joins policies by authoritative ID and preserves catalog order despite response order', () => {
    service.load().subscribe((value) => (result = value));
    template();
    http
      .expectOne('/savingsproducts/policy/2')
      .flush({ savingsProductId: 2, status: 'UNCONFIGURED', operational: false });
    http.expectOne('/savingsproducts/policy/1').flush(policy(1));
    expect(result.products.map((row) => row.id)).toEqual([
      1,
      2
    ]);
    expect(result.products[0]).toMatchObject({
      classification: 'SIGHT',
      purposeLabel: 'SavingsProducts.Guaranteed',
      policyStatusLabel: 'SavingsProducts.DraftPolicy'
    });
    expect(result.products[1].classification).toBe('UNCLASSIFIED');
    expect(result.warning).toBeNull();
  });

  it('does not attach a mismatched policy or hide core products after partial failure', () => {
    service.load().subscribe((value) => (result = value));
    template();
    http.expectOne('/savingsproducts/policy/1').flush(policy(2));
    http.expectOne('/savingsproducts/policy/2').flush({}, { status: 500, statusText: 'Unavailable' });
    expect(result.products.every((row) => row.classification === 'UNAVAILABLE')).toBe(true);
    expect(result.warning).toBe('unavailable');
  });

  it.each([
    403,
    404,
    503
  ])('probes capabilities once before fan-out (%s)', (status) => {
    service.load().subscribe((value) => (result = value));
    http.expectOne('/savingsproducts/policy/template').flush({}, { status, statusText: 'Failure' });
    http.expectNone('/savingsproducts/policy/1');
    expect(result.products).toHaveLength(2);
    expect(result.warning).toBe(status === 403 ? 'forbidden' : 'unavailable');
  });

  it('limits concurrent requests to four and cancels the queue on authorization failure', () => {
    products.getSavingProducts.mockReturnValue(
      of(Array.from({ length: 12 }, (_, index) => ({ id: index + 1, name: 'Product' })))
    );
    service.load().subscribe((value) => (result = value));
    template();
    const requests = http.match((request) => /policy\/\d+$/.test(request.url));
    expect(requests).toHaveLength(4);
    requests[0].flush({}, { status: 403, statusText: 'Forbidden' });
    expect(requests.slice(1).every((request) => request.cancelled)).toBe(true);
    http.expectNone('/savingsproducts/policy/5');
    expect(result.warning).toBe('forbidden');
  });

  it('handles empty catalog without policy requests', () => {
    products.getSavingProducts.mockReturnValue(of([]));
    service.load().subscribe((value) => (result = value));
    expect(result).toEqual({ products: [], warning: null });
  });

  it.each([
    null,
    {},
    [{ id: '1', name: 'Bad ID' }]
  ])('rejects malformed catalogs %s', (value) => {
    products.getSavingProducts.mockReturnValue(of(value));
    const error = jest.fn();
    service.load().subscribe({ error });
    expect(error).toHaveBeenCalled();
  });

  it('propagates core errors for the page error state', () => {
    products.getSavingProducts.mockReturnValue(throwError(() => new Error('Unavailable')));
    const error = jest.fn();
    service.load().subscribe({ error });
    expect(error).toHaveBeenCalled();
  });

  it.each([
    {},
    { classification: null },
    { classification: 1 },
    { classification: '' },
    { classification: '   ' }
  ])('marks a draft with invalid classification as unavailable, never legacy: %s', (draftPolicy) => {
    service.load().subscribe((value) => (result = value));
    template();
    http.expectOne('/savingsproducts/policy/1').flush({ ...policy(1), policy: draftPolicy });
    http.expectOne('/savingsproducts/policy/2').flush({
      savingsProductId: 2,
      status: 'UNCONFIGURED',
      operational: false
    });
    expect(result.products[0]).toMatchObject({
      classification: 'UNAVAILABLE',
      classificationLabel: 'SavingsProducts.Unavailable',
      metadataState: 'unavailable'
    });
    expect(result.products[0].policyStatusLabel).not.toBe('SavingsProducts.DraftPolicy');
    expect(result.products[1].classification).toBe('UNCLASSIFIED');
    expect(result.warning).toBe('unavailable');
  });

  it('keeps an unknown nonempty draft classification distinct from legacy products', () => {
    service.load().subscribe((value) => (result = value));
    template();
    http.expectOne('/savingsproducts/policy/1').flush(policy(1, 'FUTURE'));
    http.expectOne('/savingsproducts/policy/2').flush({
      savingsProductId: 2,
      status: 'UNCONFIGURED',
      operational: false
    });
    expect(result.products[0]).toMatchObject({
      classification: 'UNKNOWN',
      classificationLabel: 'SavingsProducts.UnknownClassification'
    });
    expect(result.products[1].classification).toBe('UNCLASSIFIED');
    expect(result.warning).toBeNull();
  });

  it('rejects missing or contradictory policy payloads', () => {
    service.load().subscribe((value) => (result = value));
    template();
    http.expectOne('/savingsproducts/policy/1').flush({ ...policy(1), policy: null });
    http.expectOne('/savingsproducts/policy/2').flush({ ...policy(2), status: 'UNCONFIGURED' });
    expect(result.warning).toBe('unavailable');
  });
});
