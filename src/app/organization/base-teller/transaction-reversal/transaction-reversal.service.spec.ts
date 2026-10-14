/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReversalRequest, TransactionReversalService } from './transaction-reversal.service';

describe('TransactionReversalService', () => {
  let service: TransactionReversalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(TransactionReversalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads backend context', () => {
    service.context().subscribe();
    const request = http.expectOne('/v2/base-teller/transaction-reversals/context');
    expect(request.request.method).toBe('GET');
    request.flush({
      businessDate: '2026-10-14',
      cashiers: [],
      currencies: [],
      banks: [],
      denominations: [],
      canCreate: false,
      canAuthorize: false
    });
  });

  it('uses the ISO business date and backend pagination', () => {
    service.search('2026-10-14', 25, 25).subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === '/v2/base-teller/transaction-reversals/transactions'
    );
    expect(request.request.params.get('transactionDate')).toBe('2026-10-14');
    expect(request.request.params.get('offset')).toBe('25');
    expect(request.request.params.get('limit')).toBe('25');
    request.flush({ items: [], totalFilteredRecords: 0, offset: 25, limit: 25 });
  });

  it('loads authoritative detail by encoded history ID', () => {
    service.detail('SAVINGS_DEPOSIT:7').subscribe();
    const request = http.expectOne('/v2/base-teller/transaction-reversals/SAVINGS_DEPOSIT%3A7');
    expect(request.request.method).toBe('GET');
    request.flush({ historyId: 'SAVINGS_DEPOSIT:7' });
  });

  it('posts only the backend request fields to preview and final reversal', () => {
    const body: ReversalRequest = {
      historyId: 'CASH_EXCHANGE:7',
      idempotencyKey: 'test-key',
      authorizationNumber: 'supervisor-issued-value',
      cashDenominations: [{ denominationId: 'catalog-value', quantity: 1 }],
      returnedCashDenominations: [{ denominationId: 'other-catalog-value', quantity: 1 }],
      checks: []
    };
    service.preview(body).subscribe();
    const preview = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(preview.request.method).toBe('POST');
    expect(preview.request.body).toEqual(body);
    expect(preview.request.body.amount).toBeUndefined();
    preview.flush({
      original: {},
      cashDenominations: [],
      returnedCashDenominations: [],
      cashDirection: 'SWAP',
      cashEffect: 0,
      checkEffect: 0,
      accountingStrategy: ''
    });

    service.reverse(body).subscribe();
    const reversal = http.expectOne('/v2/base-teller/transaction-reversals');
    expect(reversal.request.method).toBe('POST');
    expect(reversal.request.body).toEqual(body);
    reversal.flush({ id: 1, originalHistoryId: body.historyId, status: 'COMPLETED' });
  });
});
