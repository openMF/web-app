/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { AccountTransfersComponent, validTransferAmount } from './account-transfers.component';
import { TransferClientSearchComponent } from './client-search.component';
import { AccountTransferService } from './account-transfer.service';
import {
  TransferAccount,
  TransferClient,
  TransferContext,
  TransferPreview,
  TransferReceipt,
  TransferRequest
} from './account-transfer.models';
import { transferError } from './account-transfer-error';

const client: TransferClient = {
  clientId: 7,
  clientNumber: 'C7',
  displayName: 'Ordering Test',
  clientType: 'Person',
  status: 'Active',
  officeId: 1,
  officeName: 'Office',
  active: true
};
const beneficiary: TransferClient = { ...client, clientId: 8, clientNumber: 'C8', displayName: 'Beneficiary Test' };
const source: TransferAccount = {
  accountId: 1,
  accountNo: 'S1',
  accountType: 'SAVINGS',
  owner: client,
  productId: 1,
  productName: 'Backend product',
  currencyCode: 'ABC',
  decimalPlaces: 2,
  status: 'ACTIVE',
  withdrawableBalance: '1000.00',
  canDebit: true,
  canCredit: true
};
const own = { ...source, accountId: 2, accountNo: 'S2' };
const third = { ...own, owner: beneficiary };
const preview: TransferPreview = {
  operationType: 'BETWEEN_MY_ACCOUNTS',
  businessDate: '2026-01-01',
  orderingClient: client,
  beneficiaryClient: client,
  source,
  destination: own,
  amount: '10.00',
  withdrawalFee: '0.00',
  outflowsByCurrency: { ABC: '10.00' },
  inflowsByCurrency: { ABC: '10.00' },
  balanced: true,
  warnings: []
};
const receipt = { ...preview, transferId: 23, reference: '23', status: 'COMPLETED' } as unknown as TransferReceipt;
const context = { permissions: [
    'READ_ACCOUNTTRANSFER',
    'CREATE_ACCOUNTTRANSFER'
  ], operationTypes: [
    'BETWEEN_MY_ACCOUNTS',
    'TO_THIRD_PARTY'
  ] } as TransferContext;
function setup() {
  const api = {
    context: jest.fn(() => of(context)),
    clients: jest.fn(() => of({ pageItems: [client], totalFilteredRecords: 1 })),
    sources: jest.fn(() => of([source])),
    destinations: jest.fn(() =>
      of([
        source,
        own
      ])
    ),
    lookup: jest.fn(() => of(third)),
    preview: jest.fn(() => of(preview)),
    create: jest.fn((_request: TransferRequest) => of(receipt)),
    receipt: jest.fn(() => of(receipt)),
    retrieve: jest.fn(() => of(receipt))
  };
  TestBed.configureTestingModule({ providers: [
      FormBuilder,
      { provide: AccountTransferService, useValue: api },
      { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } }
    ] });
  const component = TestBed.runInInjectionContext(() => new AccountTransfersComponent());
  component.ngOnInit();
  return { api, component };
}
function chooseOwn(c: AccountTransfersComponent) {
  c.selectClient(client);
  c.form.controls.operation.setValue('BETWEEN_MY_ACCOUNTS');
  c.changeOperation();
  c.form.controls.source.setValue(c.accountKey(source));
  c.changeSource();
  c.form.controls.target.setValue(c.accountKey(own));
  c.selectTarget();
  c.form.controls.amount.setValue('10.00');
}
describe('WEB-1261 transfer workflow', () => {
  it('loads only backend eligible sources and own destinations, excluding source by qualified type', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    expect(api.sources).toHaveBeenCalledWith(7);
    expect(api.destinations).toHaveBeenCalledWith(7, 1, 'BETWEEN_MY_ACCOUNTS', undefined);
    expect(c.targets).toEqual([own]);
    expect(c.target).toEqual(own);
    expect(c.sameAccount({ ...source, accountType: 'LOAN' })).toBe(false);
  });
  it('clears beneficiary, account lookup and preview when switching operation', () => {
    const { component: c } = setup();
    chooseOwn(c);
    c.beneficiary = beneficiary;
    c.lookup.setValue('stale');
    c.showPreview();
    c.back();
    c.form.controls.operation.setValue('TO_THIRD_PARTY');
    c.changeOperation();
    expect(c.target).toBeNull();
    expect(c.beneficiary).toBeNull();
    expect(c.lookup.value).toBe('');
    expect(c.preview).toBeNull();
    expect(c.targets).toEqual([]);
  });
  it('resolves third-party account number into the same authoritative model', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.form.controls.operation.setValue('TO_THIRD_PARTY');
    c.changeOperation();
    c.lookup.setValue('S2');
    c.lookupAccount();
    expect(api.lookup).toHaveBeenCalledWith('S2', 7, 1, 'TO_THIRD_PARTY');
    expect(c.target).toEqual(third);
    expect(c.beneficiary).toEqual(beneficiary);
  });
  it.each([
    'clientNumber',
    'name'
  ])('resolves third-party %s through client selection and eligible destination discovery', (method) => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.form.controls.operation.setValue('TO_THIRD_PARTY');
    c.changeOperation();
    c.form.controls.method.setValue(method);
    c.changeMethod();
    api.destinations.mockReturnValue(of([third]));
    c.selectBeneficiary(beneficiary);
    expect(api.destinations).toHaveBeenLastCalledWith(7, 1, 'TO_THIRD_PARTY', 8);
    c.form.controls.target.setValue(c.accountKey(third));
    c.selectTarget();
    expect(c.target).toEqual(third);
  });
  it('clears incompatible results and ignores stale requests when source changes', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    const late = new Subject<TransferAccount[]>();
    api.destinations.mockReturnValue(late);
    c.changeSource();
    c.changeClient();
    late.next([own]);
    expect(c.targets).toEqual([]);
    expect(c.source).toBeNull();
  });
  it('sends exact preview data and renders only authoritative preview values', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.showPreview();
    expect(api.preview).toHaveBeenCalledWith({
      operationType: 'BETWEEN_MY_ACCOUNTS',
      orderingClientId: 7,
      sourceAccountId: 1,
      targetAccountType: 'SAVINGS',
      targetAccountId: 2,
      amount: '10.00'
    });
    expect(c.preview).toBe(preview);
    expect(c.source?.withdrawableBalance).toBe('1000.00');
  });
  it('does not preview the same account or an invalid amount', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.target = source;
    c.showPreview();
    expect(api.preview).not.toHaveBeenCalled();
    c.target = own;
    c.form.controls.amount.setValue('0');
    c.showPreview();
    expect(api.preview).not.toHaveBeenCalled();
  });
  it.each([
    '',
    '0',
    '-1',
    '1.001',
    '1e2',
    '10000000000000'
  ])('rejects invalid amount %s', (value) => expect(validTransferAmount(value, 2)).toBe(false));
  it.each([
    '0.01',
    '10',
    '9999999999999.99'
  ])('accepts valid decimal amount %s', (value) => expect(validTransferAmount(value, 2)).toBe(true));
  it('prevents duplicate confirmation and performs no optimistic balance mutation', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.showPreview();
    const pending = new Subject<TransferReceipt>();
    api.create.mockReturnValue(pending);
    c.confirm();
    c.confirm();
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(c.busy).toBe('submit');
    expect(c.source?.withdrawableBalance).toBe('1000.00');
    pending.next(receipt);
    pending.complete();
    expect(c.receipt).toBe(receipt);
    expect(c.preview).toBeNull();
    expect(c.busy).toBe('');
  });
  it('retains the exact body key and prevents edits after an ambiguous network failure', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.showPreview();
    api.create.mockReturnValue(throwError(() => ({ status: 0 })));
    c.confirm();
    const first = api.create.mock.calls[0][0];
    expect(c.uncertain).toBe(true);
    c.back();
    c.reset();
    expect(c.preview).toBe(preview);
    api.create.mockReturnValue(of(receipt));
    c.confirm();
    expect(api.create.mock.calls[1][0]).toEqual(first);
    expect(first.idempotencyKey).toBeTruthy();
    expect(c.receipt).toBe(receipt);
  });
  it.each([
    [
      0,
      409
    ],
    [
      500,
      409
    ],
    [
      0,
      400
    ],
    [
      0,
      401
    ],
    [
      0,
      403
    ],
    [
      0,
      422
    ],
    [
      0,
      500
    ],
    [
      500,
      0
    ],
    [
      0,
      undefined
    ]
  ])('keeps an ambiguous HTTP %s outcome locked after failed HTTP %s retry', (initialStatus, retryStatus) => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.showPreview();
    api.create.mockReturnValue(throwError(() => ({ status: initialStatus })));
    c.confirm();
    const originalRequest = { ...api.create.mock.calls[0][0] };
    expect(c.uncertain).toBe(true);
    api.create.mockReturnValue(throwError(() => ({ status: retryStatus })));
    c.confirm();
    expect(c.uncertain).toBe(true);
    expect(c.error).toBe('accountTransfer.uncertain');
    expect(c.busy).toBe('');
    c.back();
    c.reset();
    expect(c.preview).toBe(preview);
    expect(c.client).toBe(client);
    expect(api.preview).toHaveBeenCalledTimes(1);
    expect(c.source?.withdrawableBalance).toBe('1000.00');
    api.create.mockReturnValue(of(receipt));
    c.confirm();
    expect(api.create.mock.calls.map(([request]) => request)).toEqual([
      originalRequest,
      originalRequest,
      originalRequest
    ]);
    expect(originalRequest.idempotencyKey).toBeTruthy();
    expect(c.receipt).toBe(receipt);
    expect(c.uncertain).toBe(false);
    c.reset();
    expect(c.receipt).toBeNull();
    expect(c.client).toBeNull();
  });
  it('keeps the form for insufficient funds and permits a new preview', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.showPreview();
    api.create.mockReturnValue(
      throwError(() => ({
        status: 403,
        error: {
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.account.transfer.insufficient.funds' }]
        }
      }))
    );
    c.confirm();
    expect(c.error).toBe('accountTransfer.insufficient');
    expect(c.uncertain).toBe(false);
    expect(c.source?.withdrawableBalance).toBe('1000.00');
    c.back();
    expect(c.client).toBe(client);
  });
  it('blocks posting for read-only permission and unbalanced previews', () => {
    const { component: c, api } = setup();
    chooseOwn(c);
    c.context = { ...context, permissions: ['READ_ACCOUNTTRANSFER'] };
    c.showPreview();
    expect(api.preview).not.toHaveBeenCalled();
    c.context = context;
    c.showPreview();
    c.preview = { ...preview, balanced: false };
    c.confirm();
    expect(api.create).not.toHaveBeenCalled();
  });
  it('fetches historical receipt every time before print and reprint and handles failures', () => {
    jest.useFakeTimers();
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    const { component: c, api } = setup();
    c.receipt = receipt;
    c.printReceipt();
    jest.runAllTimers();
    expect(api.receipt).toHaveBeenCalledWith(23);
    expect(print).toHaveBeenCalledTimes(1);
    c.printReceipt();
    jest.runAllTimers();
    expect(api.receipt).toHaveBeenCalledTimes(2);
    api.receipt.mockReturnValue(throwError(() => ({ status: 500 })));
    c.printReceipt();
    jest.runAllTimers();
    expect(print).toHaveBeenCalledTimes(2);
    expect(c.error).toBe('accountTransfer.unavailable');
    print.mockRestore();
    jest.useRealTimers();
  });
});
describe('ordering and beneficiary client search', () => {
  it.each([
    'clientNumber',
    'name'
  ] as const)('searches by %s with bounded pagination and emits selection', (method) => {
    const { api } = setup();
    const s = TestBed.runInInjectionContext(() => new TransferClientSearchComponent());
    s.form.setValue({ method, query: 'Test' });
    const selected = jest.fn();
    s.selected.subscribe(selected);
    s.search();
    expect(api.clients).toHaveBeenCalledWith(method, 'Test', 0);
    s.choose(client);
    expect(selected).toHaveBeenCalledWith(client);
    expect(s.clients).toEqual([client]);
    s.ngOnDestroy();
  });
  it('clears old results, refuses empty searches and shows no result and error states', () => {
    const { api } = setup();
    const s = TestBed.runInInjectionContext(() => new TransferClientSearchComponent());
    s.search();
    expect(api.clients).not.toHaveBeenCalled();
    s.form.controls.query.setValue('missing');
    api.clients.mockReturnValue(of({ pageItems: [], totalFilteredRecords: 0 }));
    s.search();
    expect(s.searched).toBe(true);
    expect(s.clients).toEqual([]);
    api.clients.mockReturnValue(throwError(() => ({ status: 500 })));
    s.search();
    expect(s.error).toBe('accountTransfer.unavailable');
    expect(s.loading).toBe(false);
    s.ngOnDestroy();
  });
});
describe('safe backend error mapping', () => {
  it.each([
    [
      'insufficient.funds',
      'insufficient'
    ],
    [
      'same.account',
      'sameAccount'
    ],
    [
      'currency',
      'currencyMismatch'
    ],
    [
      'ineligible',
      'ineligible'
    ],
    [
      'ownership',
      'ownership'
    ],
    [
      'account.lookup',
      'accountNotFound'
    ],
    [
      'amount.scale',
      'invalidAmount'
    ],
    [
      'request',
      'unsupported'
    ],
    [
      'idempotency.conflict',
      'duplicate'
    ]
  ])('maps %s to localized %s', (code, label) =>
    expect(
      transferError({
        status: 403,
        error: JSON.stringify({
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.account.transfer.' + code }]
        })
      })
    ).toBe('accountTransfer.' + label)
  );
  it('does not expose raw Java or SQL messages', () =>
    expect(transferError({ status: 500, error: 'java.sql sensitive stack trace' })).toBe(
      'accountTransfer.unavailable'
    ));
});
