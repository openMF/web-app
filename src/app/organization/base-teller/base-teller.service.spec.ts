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
import { CashierClosingRequest, CashOperationRequest } from './cash-management/cash-management.models';

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

  it('uses the authoritative WEB-1253 context, customer, and loan endpoints', async () => {
    const contextPromise = firstValueFrom(service.getCreditPaymentContext());
    httpMock.expectOne('/v2/base-teller/credit-payments/context').flush({ businessDate: '2026-09-27' });
    expect((await contextPromise).businessDate).toBe('2026-09-27');

    const customersPromise = firstValueFrom(service.searchCreditPaymentCustomers('Ada'));
    const customersRequest = httpMock.expectOne(
      (request) => request.url === '/v2/base-teller/credit-payments/customers'
    );
    expect(customersRequest.request.params.get('q')).toBe('Ada');
    expect(customersRequest.request.params.get('limit')).toBe('20');
    customersRequest.flush([{ clientId: 7 }]);
    expect((await customersPromise)[0].clientId).toBe(7);

    const loansPromise = firstValueFrom(service.getCreditPaymentLoans(7));
    httpMock.expectOne('/v2/base-teller/credit-payments/customers/7/loans').flush([{ id: 8 }]);
    expect((await loansPromise)[0].id).toBe(8);

    const loanPromise = firstValueFrom(service.getCreditPaymentLoan(8));
    httpMock.expectOne('/v2/base-teller/credit-payments/loans/8').flush({ id: 8, totalOutstanding: 95 });
    expect((await loanPromise).totalOutstanding).toBe(95);
  });

  it('uses the exact WEB-1253 preview, create, receipt, clear, and return contracts', async () => {
    const payment = {
      idempotencyKey: 'pay-1',
      clientId: 7,
      loanId: 8,
      paymentMethod: 'CASH' as const,
      amount: '20',
      currencyCode: 'USD',
      paymentTypeId: 5,
      transactionDate: '2026-09-27',
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
      denominations: [{ denominationId: 'USD-10', value: '10', quantity: 2 }]
    };

    const previewPromise = firstValueFrom(service.previewCreditPayment(payment));
    const previewRequest = httpMock.expectOne('/v2/base-teller/credit-payments/preview');
    expect(previewRequest.request.method).toBe('POST');
    expect(previewRequest.request.body).toEqual(payment);
    previewRequest.flush({ loanId: 8, paymentMethod: 'CASH' });
    expect((await previewPromise).loanId).toBe(8);

    const createPromise = firstValueFrom(service.createCreditPayment(payment));
    const createRequest = httpMock.expectOne('/v2/base-teller/credit-payments');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body.idempotencyKey).toBe('pay-1');
    createRequest.flush({ receiptNumber: 'CP-1', status: 'COMPLETED' });
    expect((await createPromise).receiptNumber).toBe('CP-1');

    const receiptPromise = firstValueFrom(service.getCreditPaymentReceipt('CP/1'));
    httpMock.expectOne('/v2/base-teller/credit-payments/CP%2F1').flush({ receiptNumber: 'CP/1' });
    expect((await receiptPromise).receiptNumber).toBe('CP/1');

    const transition = {
      idempotencyKey: 'transition-1',
      transactionDate: '2026-09-27',
      dateFormat: 'yyyy-MM-dd',
      locale: 'en'
    };
    const clearPromise = firstValueFrom(service.clearCreditPaymentCheck(11, transition));
    const clearRequest = httpMock.expectOne('/v2/base-teller/credit-payments/checks/11/clear');
    expect(clearRequest.request.body).toEqual(transition);
    clearRequest.flush({ status: 'CLEARED' });
    expect((await clearPromise).status).toBe('CLEARED');

    const returnPromise = firstValueFrom(service.returnCreditPaymentCheck(11, { ...transition, reason: 'NSF' }));
    const returnRequest = httpMock.expectOne('/v2/base-teller/credit-payments/checks/11/return');
    expect(returnRequest.request.body.reason).toBe('NSF');
    returnRequest.flush({ status: 'RETURNED' });
    expect((await returnPromise).status).toBe('RETURNED');
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
  it('uses the exact WEB-1236 endpoints and contracts', async () => {
    const servicesPromise = firstValueFrom(service.getServicePaymentServices());
    const servicesRequest = httpMock.expectOne('/v2/base-teller/service-payments/services');
    expect(servicesRequest.request.method).toBe('GET');
    servicesRequest.flush([{ id: 5, code: 'POWER', name: 'Power', active: true, denominations: [] }]);
    expect((await servicesPromise)[0].code).toBe('POWER');

    const clientPromise = firstValueFrom(service.getServicePaymentClient(42));
    const clientRequest = httpMock.expectOne('/v2/base-teller/service-payments/clients/42');
    expect(clientRequest.request.method).toBe('GET');
    clientRequest.flush({ clientId: 42, displayName: 'Ada' });
    expect((await clientPromise).clientId).toBe(42);

    const quote = {
      payerType: 'NON_CLIENT' as const,
      payerName: 'Ada',
      serviceId: 5,
      serviceReference: 'INV-1',
      baseAmount: '100.00',
      currencyCode: 'USD'
    };
    const quotePromise = firstValueFrom(service.quoteServicePayment(quote));
    const quoteRequest = httpMock.expectOne('/v2/base-teller/service-payments/quote');
    expect(quoteRequest.request.method).toBe('POST');
    expect(quoteRequest.request.body).toEqual(quote);
    quoteRequest.flush({ ...quote, commission: 2, commissionVat: 0.26, totalToPay: 102.26 });
    expect((await quotePromise).totalToPay).toBe(102.26);

    const payment = {
      ...quote,
      idempotencyKey: 'stable-key',
      businessDate: '2026-09-25',
      paymentTypeId: 1,
      denominations: [{ denominationId: '100', value: 100, quantity: 2 }]
    };
    const paymentPromise = firstValueFrom(service.createServicePayment(payment));
    const paymentRequest = httpMock.expectOne('/v2/base-teller/service-payments');
    expect(paymentRequest.request.method).toBe('POST');
    expect(paymentRequest.request.body).toEqual(payment);
    paymentRequest.flush({ transactionId: 77, receiptNumber: 'SP-77' });
    expect((await paymentPromise).transactionId).toBe(77);

    const receiptPromise = firstValueFrom(service.getServicePaymentReceipt(77));
    const receiptRequest = httpMock.expectOne('/v2/base-teller/service-payments/77/receipt');
    expect(receiptRequest.request.method).toBe('GET');
    receiptRequest.flush({ transactionId: 77, receiptNumber: 'SP-77' });
    expect((await receiptPromise).receiptNumber).toBe('SP-77');
  });

  it('searches only clients for the service-payment payer lookup', async () => {
    const resultPromise = firstValueFrom(service.searchServicePaymentClients('Ada'));
    const request = httpMock.expectOne((candidate) => candidate.url === '/search');
    expect(request.request.params.get('query')).toBe('Ada');
    expect(request.request.params.get('resource')).toBe('clients');
    expect(request.request.params.get('exactMatch')).toBe('false');
    request.flush([{ entityId: 42, entityName: 'Ada' }]);
    expect(await resultPromise).toEqual([{ entityId: 42, entityName: 'Ada' }]);
  });

  it('loads the exact WEB-1232 cashier-closing context URL and query', async () => {
    const resultPromise = firstValueFrom(service.getCashierClosingContext(9, 'USD', '2026-09-23'));
    const req = httpMock.expectOne((request) => request.url === '/v2/base-teller/closings/context');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('cashierId')).toBe('9');
    expect(req.request.params.get('currencyCode')).toBe('USD');
    expect(req.request.params.get('businessDate')).toBe('2026-09-23');
    req.flush({ cashierId: 9, currencyCode: 'USD', eligibleChecks: [], status: 'OPEN' });
    expect((await resultPromise).status).toBe('OPEN');
  });

  it('serializes the exact WEB-1232 closing DTO to the closing URL', async () => {
    const payload: CashierClosingRequest = {
      idempotencyKey: 'close-1',
      cashierId: 9,
      businessDate: '2026-09-23',
      currencyCode: 'USD',
      denominations: [{ denominationId: '20', value: 20, quantity: 2 }],
      checkIds: [4]
    };
    const resultPromise = firstValueFrom(service.closeCashier(payload));
    const req = httpMock.expectOne('/v2/base-teller/closings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, status: 'COMPLETED', differenceType: 'BALANCED' });
    expect((await resultPromise).differenceType).toBe('BALANCED');
  });

  it('loads the global cash count from the exact WEB-1232 URL', async () => {
    const resultPromise = firstValueFrom(service.getGlobalCashCount('2026-09-23', 'USD'));
    const req = httpMock.expectOne((request) => request.url === '/v2/base-teller/closings/global');
    expect(req.request.params.get('businessDate')).toBe('2026-09-23');
    expect(req.request.params.get('currencyCode')).toBe('USD');
    req.flush({ businessDate: '2026-09-23', cashierClosings: [] });
    expect((await resultPromise).cashierClosings).toEqual([]);
  });

  it.each([
    'DEPOSIT_IN_TRANSIT',
    'BANK_DEPOSIT'
  ] as const)('posts %s to the single authoritative cash-operation endpoint', async (transactionType) => {
    const payload: CashOperationRequest = {
      idempotencyKey: `operation-${transactionType}`,
      transactionType,
      cashierId: 9,
      businessDate: '2026-09-23',
      currencyCode: 'USD',
      denominations: [{ denominationId: '10', value: 10, quantity: 1 }],
      checkIds: [],
      description: null
    };
    const resultPromise = firstValueFrom(service.createCashOperation(payload));
    const req = httpMock.expectOne('/v2/base-teller/cash-operations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.transactionType).toBe(transactionType);
    req.flush({ id: 2, transactionType, status: 'COMPLETED' });
    expect((await resultPromise).transactionType).toBe(transactionType);
  });

  it('sends supported filters and pagination to WEB-1232 transaction history', async () => {
    const resultPromise = firstValueFrom(
      service.getCashOperationHistory({
        fromDate: '2026-09-01',
        cashierId: 9,
        transactionType: 'BANK_DEPOSIT',
        q: 'safe',
        offset: 25,
        limit: 25
      })
    );
    const req = httpMock.expectOne((request) => request.url === '/v2/base-teller/cash-operations');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('transactionType')).toBe('BANK_DEPOSIT');
    expect(req.request.params.get('offset')).toBe('25');
    expect(req.request.params.get('limit')).toBe('25');
    req.flush({ pageItems: [], totalFilteredRecords: 0 });
    expect((await resultPromise).totalFilteredRecords).toBe(0);
  });

  it('loads authoritative cash holdings from the exact WEB-1232 URL', async () => {
    const resultPromise = firstValueFrom(
      service.getCashHoldings({ businessDate: '2026-09-23', cashierId: 9, currencyCode: 'USD' })
    );
    const req = httpMock.expectOne(
      '/v2/base-teller/cash-operations/holdings?businessDate=2026-09-23&cashierId=9&currencyCode=USD'
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ cashierId: 9, currentBalance: 40 }]);
    expect((await resultPromise)[0].currentBalance).toBe(40);
  });

  it('uses the exact WEB-1221 context, preview, create, retrieve, and reprint endpoints', async () => {
    const contextPromise = firstValueFrom(service.getCashAllocationContext(1, 'CRC'));
    const contextRequest = httpMock.expectOne(
      (request) => request.url === '/v2/base-teller/cash-allocations/context' && request.method === 'GET'
    );
    expect(contextRequest.request.params.get('officeId')).toBe('1');
    expect(contextRequest.request.params.get('currencyCode')).toBe('CRC');
    contextRequest.flush({ businessDate: '2026-09-26', currencies: [], cashiers: [] });
    expect((await contextPromise).businessDate).toBe('2026-09-26');

    const payload = {
      idempotencyKey: 'stable-key',
      operationType: 'SAFE_VAULT_OPENING' as const,
      officeId: 1,
      businessDate: '2026-09-26',
      currencyCode: 'CRC',
      amount: '100.00',
      denominations: [{ denominationId: 'note-100', quantity: 1 }]
    };
    const previewPromise = firstValueFrom(service.previewCashAllocation(payload));
    const previewRequest = httpMock.expectOne('/v2/base-teller/cash-allocations/preview');
    expect(previewRequest.request.method).toBe('POST');
    expect(previewRequest.request.body).toEqual(payload);
    previewRequest.flush({ authoritativeTotal: '100.00' });
    expect((await previewPromise).authoritativeTotal).toBe('100.00');

    const createPromise = firstValueFrom(service.createCashAllocation(payload));
    const createRequest = httpMock.expectOne('/v2/base-teller/cash-allocations');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body.idempotencyKey).toBe('stable-key');
    createRequest.flush({ id: 77, reference: 'CA-77' });
    expect((await createPromise).id).toBe(77);

    const retrievePromise = firstValueFrom(service.getCashAllocation(77));
    const retrieveRequest = httpMock.expectOne('/v2/base-teller/cash-allocations/77');
    expect(retrieveRequest.request.method).toBe('GET');
    retrieveRequest.flush({ id: 77, reference: 'CA-77' });
    expect((await retrievePromise).reference).toBe('CA-77');

    const reprintPromise = firstValueFrom(service.reprintCashAllocationReceipt(77));
    const reprintRequest = httpMock.expectOne('/v2/base-teller/cash-allocations/77/receipt');
    expect(reprintRequest.request.method).toBe('GET');
    reprintRequest.flush({ id: 77, reference: 'CA-77' });
    expect((await reprintPromise).reference).toBe('CA-77');
  });
});
