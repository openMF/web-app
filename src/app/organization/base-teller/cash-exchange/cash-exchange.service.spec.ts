/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { CashExchangeService, parseExchangeResponse } from './cash-exchange.service';
import { ExchangeRequest, fromUnits, toUnits } from './cash-exchange.models';

describe('CashExchangeService', () => {
  let service: CashExchangeService;
  let http: HttpTestingController;
  const path = '/v2/base-teller/cash-exchanges';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(CashExchangeService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads context from the exact backend endpoint', () => {
    service.context().subscribe();
    const req = http.expectOne(path + '/context');
    expect(req.request.method).toBe('GET');
    req.flush({ tellers: [], currencies: [] });
  });
  it('uses cashierId and currencyCode for inventory', () => {
    service.denominations(7, 'EUR').subscribe();
    const req = http.expectOne(path + '/denominations?cashierId=7&currencyCode=EUR');
    expect(req.request.method).toBe('GET');
    req.flush('{}');
  });
  it('posts only quantities, catalog IDs and the idempotency key to preview and create', () => {
    const body: ExchangeRequest = {
      cashierId: 7,
      currencyCode: 'EUR',
      receivedDenominations: [{ denominationId: 'a', quantity: 1 }],
      deliveredDenominations: [{ denominationId: 'b', quantity: 2 }],
      idempotencyKey: 'same-key'
    };
    service.preview(body).subscribe();
    let req = http.expectOne(path + '/preview');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush('{}');
    service.create(body).subscribe();
    req = http.expectOne(path);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush('{}');
  });
  it('retrieves stored exchange and authoritative receipt', () => {
    service.retrieve(42).subscribe();
    http.expectOne(path + '/42').flush('{"id":42}');
    service.receipt(42).subscribe();
    http.expectOne(path + '/42/receipt').flush('{"id":42}');
  });
  it('preserves backend decimals without changing IDs or text', () => {
    expect(
      parseExchangeResponse('{"value":9999999999999.999999,"id":42,"receiptNumber":"CE-123.456","quantity":2}')
    ).toEqual({ value: '9999999999999.999999', id: 42, receiptNumber: 'CE-123.456', quantity: 2 });
  });
  it('calculates exact display totals without float tolerance', () => {
    expect(toUnits('0.1', 2) + toUnits('0.2', 2)).toBe(toUnits('0.3', 2));
    expect(fromUnits(30n, 2)).toBe('0.30');
    expect(toUnits('1e-6', 6)).toBe(1n);
    expect(() => toUnits('0.001', 2)).toThrow();
  });
});
