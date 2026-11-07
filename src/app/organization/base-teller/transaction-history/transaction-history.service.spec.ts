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
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { TransactionHistoryFilters } from './transaction-history.models';
import { TransactionHistoryService } from './transaction-history.service';

describe('TransactionHistoryService', () => {
  let service: TransactionHistoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransactionHistoryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TransactionHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the authoritative context', async () => {
    const response = firstValueFrom(service.getContext());
    const request = httpMock.expectOne('/v2/base-teller/transaction-history/context');
    expect(request.request.method).toBe('GET');
    request.flush({ tellers: [], currencies: [], statuses: [], types: [], operations: [], concepts: [] });
    expect((await response).tellers).toEqual([]);
  });

  it.each([
    [
      'no filters',
      {},
      {}
    ],
    [
      'dates',
      { fromDate: '2026-10-01', toDate: '2026-10-07' },
      { fromDate: '2026-10-01', toDate: '2026-10-07' }
    ],
    [
      'teller',
      { tellerId: 9 },
      { tellerId: '9' }
    ],
    [
      'currency',
      { currencyCode: 'CRC' },
      { currencyCode: 'CRC' }
    ],
    [
      'status',
      { status: 'COMPLETED' },
      { status: 'COMPLETED' }
    ],
    [
      'type',
      { type: 'CASH' },
      { type: 'CASH' }
    ],
    [
      'operation',
      { operation: 'PAY_SERVICE' },
      { operation: 'PAY_SERVICE' }
    ],
    [
      'concept',
      { concept: 'POWER' },
      { concept: 'POWER' }
    ],
    [
      'reference',
      { reference: ' receipt-1 ' },
      { reference: 'receipt-1' }
    ],
    [
      'combined pagination and sorting',
      {
        fromDate: '2026-10-01',
        tellerId: 9,
        currencyCode: 'CRC',
        status: 'COMPLETED',
        type: 'CASH',
        operation: 'PAY_SERVICE',
        concept: 'POWER',
        reference: 'UTILITY',
        offset: 25,
        limit: 25,
        sort: 'reference',
        order: 'ASC'
      },
      {
        fromDate: '2026-10-01',
        tellerId: '9',
        currencyCode: 'CRC',
        status: 'COMPLETED',
        type: 'CASH',
        operation: 'PAY_SERVICE',
        concept: 'POWER',
        reference: 'UTILITY',
        offset: '25',
        limit: '25',
        sort: 'reference',
        order: 'ASC'
      }
    ]
  ] as [
    string,
    TransactionHistoryFilters,
    Record<string, string>
  ][])('sends %s exactly', async (_name, filters, expected) => {
    const response = firstValueFrom(service.search(filters));
    const request = httpMock.expectOne((candidate) => candidate.url === '/v2/base-teller/transaction-history');
    expect(request.request.method).toBe('GET');
    expect(
      Object.fromEntries(
        request.request.params.keys().map((key) => [
          key,
          request.request.params.get(key)!
        ])
      )
    ).toEqual(expected);
    request.flush({ items: [], totalFilteredRecords: 0, offset: 0, limit: 25, totalsByCurrency: [] });
    await response;
  });

  it('uses historyId for detail, denominations, and receipt', async () => {
    const detail = firstValueFrom(service.getDetail('SERVICE_PAYMENT:7'));
    httpMock
      .expectOne('/v2/base-teller/transaction-history/SERVICE_PAYMENT%3A7')
      .flush({ historyId: 'SERVICE_PAYMENT:7' });
    await detail;

    const denominations = firstValueFrom(service.getDenominations('SERVICE_PAYMENT:7'));
    httpMock
      .expectOne('/v2/base-teller/transaction-history/SERVICE_PAYMENT%3A7/denominations')
      .flush({ historyId: 'SERVICE_PAYMENT:7' });
    await denominations;

    const receipt = firstValueFrom(service.getReceipt('SERVICE_PAYMENT:7'));
    httpMock
      .expectOne('/v2/base-teller/transaction-history/SERVICE_PAYMENT%3A7/receipt')
      .flush({ historyId: 'SERVICE_PAYMENT:7' });
    await receipt;
  });

  it('omits paging and empty values from the complete report request', async () => {
    const response = firstValueFrom(
      service.getReport({
        reference: ' ',
        currencyCode: '',
        offset: 50,
        limit: 25,
        sort: 'transactionDate',
        order: 'DESC'
      })
    );
    const request = httpMock.expectOne('/v2/base-teller/transaction-history/report?sort=transactionDate&order=DESC');
    expect(request.request.method).toBe('GET');
    request.flush({ generatedAt: '2026-10-07T00:00:00Z', items: [], totalFilteredRecords: 0, totalsByCurrency: [] });
    await response;
  });
});
