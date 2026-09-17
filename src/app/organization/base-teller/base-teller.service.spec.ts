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
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

import { BaseTellerService } from './base-teller.service';

describe('BaseTellerService', () => {
  let service: BaseTellerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseTellerService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(BaseTellerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('searches customers and savings accounts through the platform search endpoint', async () => {
    const resultPromise = firstValueFrom(service.searchDepositCustomersAndAccounts('amina'));

    const req = httpMock.expectOne((request) => request.url === '/search' && request.method === 'GET');
    expect(req.request.params.get('query')).toBe('amina');
    expect(req.request.params.get('resource')).toBe('clients,savings');
    expect(req.request.params.get('exactMatch')).toBe('false');
    req.flush([{ entityId: 9 }]);

    expect(await resultPromise).toEqual([{ entityId: 9 }]);
  });

  it('loads customer savings accounts', async () => {
    const resultPromise = firstValueFrom(service.getDepositClientAccounts(22));

    const req = httpMock.expectOne((request) => request.url === '/clients/22/accounts' && request.method === 'GET');
    req.flush({ savingsAccounts: [{ id: 7 }] });

    expect(await resultPromise).toEqual({ savingsAccounts: [{ id: 7 }] });
  });

  it('loads the savings transaction template payment types', async () => {
    const resultPromise = firstValueFrom(service.getSavingsDepositTemplate(7));

    const req = httpMock.expectOne(
      (request) => request.url === '/savingsaccounts/7/transactions/template' && request.method === 'GET'
    );
    req.flush({ paymentTypeOptions: [{ id: 3, isCashPayment: true }] });

    expect(await resultPromise).toEqual({ paymentTypeOptions: [{ id: 3, isCashPayment: true }] });
  });

  it('posts a cash deposit payload to the savings transaction deposit command', async () => {
    const payload = {
      transactionDate: '16 September 2026',
      transactionAmount: 100,
      paymentTypeId: 3,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    };
    const resultPromise = firstValueFrom(service.depositToSavingsAccount(7, payload));

    const req = httpMock.expectOne((request) => request.url === '/savingsaccounts/7/transactions');
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('command')).toBe('deposit');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 55 });

    expect(await resultPromise).toEqual({ resourceId: 55 });
  });

  it('posts a check deposit payload using backend payment detail fields', async () => {
    const payload = {
      transactionDate: '16 September 2026',
      transactionAmount: 250,
      paymentTypeId: 4,
      accountNumber: 'CHK-ACCOUNT',
      checkNumber: 'CHK-009',
      routingCode: 'RT-1',
      receiptNumber: 'RC-1',
      bankNumber: 'BANK-1',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    };
    const resultPromise = firstValueFrom(service.depositToSavingsAccount(7, payload));

    const req = httpMock.expectOne((request) => request.url === '/savingsaccounts/7/transactions');
    expect(req.request.params.get('command')).toBe('deposit');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 56 });

    expect(await resultPromise).toEqual({ resourceId: 56 });
  });

  it('propagates backend errors from deposit submission', async () => {
    const payload = {
      transactionDate: '16 September 2026',
      transactionAmount: 100,
      paymentTypeId: 3,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    };
    const resultPromise = firstValueFrom(service.depositToSavingsAccount(7, payload)).catch((error) => error);

    const req = httpMock.expectOne((request) => request.url === '/savingsaccounts/7/transactions');
    req.flush({ defaultUserMessage: 'paymentTypeId is required' }, { status: 400, statusText: 'Bad Request' });

    expect((await resultPromise).status).toBe(400);
  });

  it('searches returned checks with the exact backend filter parameters', async () => {
    const resultPromise = firstValueFrom(
      service.searchReturnedChecks({
        date: '2026-09-16',
        customerName: 'Ada',
        tellerId: 7,
        currencyCode: 'USD',
        offset: 0,
        limit: 25
      })
    );

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/base-teller/returned-checks' && request.method === 'GET'
    );
    expect(req.request.params.keys().sort()).toEqual([
      'currencyCode',
      'customerName',
      'date',
      'limit',
      'offset',
      'tellerId'
    ]);
    expect(req.request.params.get('date')).toBe('2026-09-16');
    expect(req.request.params.get('customerName')).toBe('Ada');
    expect(req.request.params.get('tellerId')).toBe('7');
    expect(req.request.params.get('currencyCode')).toBe('USD');
    req.flush({ pageItems: [], totalFilteredRecords: 0 });

    expect(await resultPromise).toEqual({ pageItems: [], totalFilteredRecords: 0 });
  });

  it('retrieves a returned check detail', async () => {
    const resultPromise = firstValueFrom(service.getReturnedCheck(99));
    const req = httpMock.expectOne('/v2/base-teller/returned-checks/99');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 99, status: 'RETURNED' });
    expect((await resultPromise).id).toBe(99);
  });

  it('posts the exact returned check settlement payload and returns the receipt', async () => {
    const payload = {
      idempotencyKey: 'operation-1',
      locale: 'en',
      dateFormat: 'dd MMMM yyyy',
      transactionDate: '16 September 2026',
      cashReceived: 110,
      currencyCode: 'USD',
      paymentTypeId: 3,
      denominations: [{ denominationId: '10', value: 10, quantity: 11 }]
    };
    const resultPromise = firstValueFrom(service.settleReturnedCheck(99, payload));
    const req = httpMock.expectOne('/v2/base-teller/returned-checks/99/settle');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ receiptNumber: 'RCP-1', status: 'SETTLED' });
    expect((await resultPromise).receiptNumber).toBe('RCP-1');
  });

  it('retrieves a returned check receipt', async () => {
    const resultPromise = firstValueFrom(service.getReturnedCheckReceipt('RCP-1'));
    const req = httpMock.expectOne('/v2/base-teller/returned-checks/receipts/RCP-1');
    expect(req.request.method).toBe('GET');
    req.flush({ receiptNumber: 'RCP-1', status: 'SETTLED' });
    expect((await resultPromise).status).toBe('SETTLED');
  });

  it('propagates returned check settlement domain errors', async () => {
    const resultPromise = firstValueFrom(
      service.settleReturnedCheck(99, {
        idempotencyKey: 'operation-1',
        locale: 'en',
        dateFormat: 'dd MMMM yyyy',
        transactionDate: '16 September 2026',
        cashReceived: 100,
        currencyCode: 'USD',
        paymentTypeId: 3,
        denominations: [{ denominationId: '100', value: 100, quantity: 1 }]
      })
    ).catch((error) => error);
    const req = httpMock.expectOne('/v2/base-teller/returned-checks/99/settle');
    req.flush(
      { defaultUserMessage: 'Returned check has already been settled.' },
      { status: 400, statusText: 'Bad Request' }
    );
    expect((await resultPromise).error.defaultUserMessage).toBe('Returned check has already been settled.');
  });
});
