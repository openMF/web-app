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
import { AccountTransferService, parseTransferResponse, transferJson } from './account-transfer.service';
import { TransferRequest } from './account-transfer.models';

describe('AccountTransferService real API contract', () => {
  let api: AccountTransferService;
  let http: HttpTestingController;
  const root = '/v2/base-teller/account-transfers';
  const request: TransferRequest = {
    operationType: 'TO_THIRD_PARTY',
    orderingClientId: 8,
    sourceAccountId: 9,
    targetAccountType: 'LOAN',
    targetAccountId: 9,
    amount: '1234567890123.45'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    api = TestBed.inject(AccountTransferService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('preserves precise decimal JSON tokens and never changes strings or IDs', () => {
    expect(parseTransferResponse('{"amount":1234567890123.45,"accountId":9,"name":"123.45"}')).toEqual({
      amount: '1234567890123.45',
      accountId: 9,
      name: '123.45'
    });
    expect(transferJson(request)).toContain('"amount":1234567890123.45');
  });
  it.each([
    '0',
    '-1',
    '1e2',
    'NaN',
    '1.0000001',
    '01',
    '10000000000000'
  ])('rejects unsafe amount text %s', (amount) => expect(() => transferJson({ ...request, amount })).toThrow());
  it.each([
    'clientNumber',
    'name'
  ] as const)('uses bounded %s search', (method) => {
    api.clients(method, ' query ', 10).subscribe();
    const r = http.expectOne((r) => r.url === root + '/clients');
    expect(r.request.params.get(method)).toBe('query');
    expect(r.request.params.get('offset')).toBe('10');
    expect(r.request.params.get('limit')).toBe('10');
    r.flush('{"pageItems":[],"totalFilteredRecords":0}');
  });
  it('loads context, participating and source accounts', () => {
    api.context().subscribe();
    http.expectOne(root + '/context').flush('{}');
    api.accounts(8).subscribe();
    http.expectOne(root + '/clients/8/accounts').flush('[]');
    api.sources(8).subscribe();
    http.expectOne(root + '/clients/8/source-accounts').flush('[]');
  });
  it('qualifies destination discovery by operation, source and beneficiary', () => {
    api.destinations(8, 9, 'TO_THIRD_PARTY', 10).subscribe();
    const r = http.expectOne((r) => r.url.endsWith('/clients/8/destination-accounts'));
    expect(r.request.params.keys().sort()).toEqual([
      'beneficiaryClientId',
      'operationType',
      'sourceAccountId'
    ]);
    r.flush('[]');
  });
  it('resolves account numbers without accepting client-entered account types or currencies', () => {
    api.lookup(' 0009 ', 8, 9, 'TO_THIRD_PARTY').subscribe();
    const r = http.expectOne((r) => r.url.endsWith('/accounts/lookup'));
    expect(r.request.params.get('accountNumber')).toBe('0009');
    expect(r.request.params.keys()).toHaveLength(4);
    r.flush('{}');
  });
  it('sends only the exact preview and final DTO fields with a body idempotency key', () => {
    api.preview(request).subscribe();
    const p = http.expectOne(root + '/preview');
    expect(p.request.method).toBe('POST');
    expect(JSON.parse(p.request.body)).toEqual({ ...request, amount: 1234567890123.45 });
    expect(p.request.headers.get('Content-Type')).toBe('application/json');
    p.flush('{}');
    api.create({ ...request, idempotencyKey: 'stable-key' }).subscribe();
    const c = http.expectOne(root);
    expect(JSON.parse(c.request.body).idempotencyKey).toBe('stable-key');
    expect(c.request.body).toContain('"amount":1234567890123.45');
    c.flush('{}');
  });
  it('retrieves historical transfer and receipt separately', () => {
    api.retrieve(12).subscribe();
    http.expectOne(root + '/12').flush('{}');
    api.receipt(12).subscribe();
    http.expectOne(root + '/12/receipt').flush('{}');
  });
});
