/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { WithdrawalComponent } from './withdrawal.component';
import { WithdrawalService, withdrawalJson } from './withdrawal.service';
import {
  WithdrawalAccount,
  WithdrawalContext,
  WithdrawalCustomer,
  WithdrawalRecord,
  validWithdrawalAmount
} from './withdrawal.models';
import { withdrawalError } from './withdrawal-error';
import { canReadWithdrawals, withdrawalGuard } from './withdrawal.guard';
import { Router } from '@angular/router';

const customer: WithdrawalCustomer = {
  clientId: 31,
  clientNumber: 'C31',
  displayName: 'Customer',
  clientType: 'Person',
  status: 'Active',
  officeId: 2,
  officeName: 'Office',
  eligible: true
};
const account: WithdrawalAccount = {
  accountId: 42,
  accountNumber: 'S42',
  productId: 8,
  productName: 'Savings',
  currencyCode: 'TST',
  decimalPlaces: 2,
  status: 'ACTIVE',
  availableAmount: '9007199254740.99',
  withdrawalEligible: true,
  restrictions: []
};
const context: WithdrawalContext = {
  businessDate: '2026-10-18',
  cashier: {
    cashierId: 3,
    cashierName: 'Cashier',
    tellerId: 4,
    tellerName: 'Teller',
    officeId: 2,
    officeName: 'Office',
    staffId: 5
  },
  supportedMethods: ['CASH'],
  supportedCurrencies: ['TST'],
  permissions: [
    'CREATE_BASE_TELLER_WITHDRAWAL',
    'WITHDRAWAL_SAVINGSACCOUNT'
  ],
  identificationTypes: [{ id: 9, name: 'Registered ID' }],
  cashPaymentTypes: [{ id: 7, name: 'Cash' }],
  checkCapabilities: { supported: false, reason: 'No issuer lifecycle' },
  accountOwnerOnly: true,
  denominations: [
    {
      denominationId: 'note',
      currencyCode: 'TST',
      denominationType: 'BANKNOTE',
      denominationValue: '0.20',
      availableQuantity: 4
    },
    {
      denominationId: 'coin',
      currencyCode: 'TST',
      denominationType: 'COIN',
      denominationValue: '0.10',
      availableQuantity: 3
    },
    {
      denominationId: 'other',
      currencyCode: 'OTH',
      denominationType: 'COIN',
      denominationValue: 1,
      availableQuantity: 5
    }
  ]
};
const preview: WithdrawalRecord = {
  id: null,
  reference: null,
  status: 'PREVIEW',
  businessDate: context.businessDate,
  completedAt: null,
  customer,
  account,
  cashier: context.cashier,
  operatorId: 1,
  operatorName: 'Operator',
  method: 'CASH',
  amount: '0.30',
  currencyCode: 'TST',
  denominations: [
    {
      denominationId: 'note',
      currencyCode: 'TST',
      denominationType: 'BANKNOTE',
      denominationValue: '0.20',
      quantity: 1,
      lineAmount: '0.20'
    },
    {
      denominationId: 'coin',
      currencyCode: 'TST',
      denominationType: 'COIN',
      denominationValue: '0.10',
      quantity: 1,
      lineAmount: '0.10'
    }
  ],
  recipient: {
    identifierId: 1,
    identificationTypeId: 9,
    identificationType: 'Registered ID',
    maskedReference: '****1234'
  },
  accountDebit: '0.30',
  physicalCashOutflow: '0.30',
  inflowsByCurrency: {},
  outflowsByCurrency: { TST: '0.30' },
  savingsTransactionId: null,
  cashierTransactionId: null,
  reversible: false
};
const completed: WithdrawalRecord = {
  ...preview,
  id: 67,
  reference: 'WD-reference',
  status: 'COMPLETED',
  completedAt: '2026-10-18T12:00:00Z',
  savingsTransactionId: 89
};

describe('WEB-1263 withdrawal workflow', () => {
  let component: WithdrawalComponent;
  let api: any;
  let dialog: any;
  beforeEach(() => {
    api = {
      pending: null,
      context: jest.fn(() => of(context)),
      banks: jest.fn(() => of([])),
      checkTypes: jest.fn(() => of([])),
      customers: jest.fn(() => of({ pageItems: [customer], totalFilteredRecords: 11 })),
      accounts: jest.fn(() => of([account])),
      account: jest.fn(() => of(account)),
      preview: jest.fn(() => of(preview)),
      create: jest.fn(() => of(completed)),
      remember: jest.fn(() => Promise.resolve()),
      clearPending: jest.fn(),
      recover: jest.fn(() => Promise.resolve(null)),
      retrieve: jest.fn(() => of(completed)),
      receipt: jest.fn(() => of(completed))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(true) })) };
    TestBed.configureTestingModule({ providers: [
        FormBuilder,
        { provide: WithdrawalService, useValue: api },
        { provide: MatDialog, useValue: dialog },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ] });
    component = TestBed.runInInjectionContext(() => new WithdrawalComponent());
    component.ngOnInit();
    Object.defineProperty(globalThis.crypto, 'randomUUID', { configurable: true, value: jest.fn(() => 'test-key') });
  });
  afterEach(() => component.ngOnDestroy());
  function fill() {
    component.selectCustomer(customer);
    component.selectAccount(account.accountId);
    component.form.patchValue({
      method: 'CASH',
      amount: '0.30',
      paymentTypeId: 7,
      identificationTypeId: 9,
      identificationReference: 'registered-1234'
    });
    component.quantities.at(0).setValue(1);
    component.quantities.at(1).setValue(1);
  }
  it('loads real capability and catalogs without enabling unsupported checks', () => {
    expect(api.banks).toHaveBeenCalled();
    expect(api.checkTypes).toHaveBeenCalled();
    expect(component.context?.supportedMethods).toEqual(['CASH']);
  });
  it('searches by name and paginates with the exact contract', () => {
    component.search.setValue({ field: 'name', value: ' Customer ' });
    component.searchCustomers(10);
    expect(api.customers).toHaveBeenCalledWith('name', 'Customer', 10, 10);
    expect(component.customers).toEqual([customer]);
    expect(component.offset).toBe(10);
  });
  it('searches by client number and displays empty results', () => {
    api.customers.mockReturnValue(of({ pageItems: [], totalFilteredRecords: 0 }));
    component.search.setValue({ field: 'clientNumber', value: 'C31' });
    component.searchCustomers();
    expect(api.customers).toHaveBeenCalledWith('clientNumber', 'C31', 0, 10);
    expect(component.searched).toBe(true);
    expect(component.customers).toEqual([]);
  });
  it('rejects blank and overly long searches', () => {
    component.search.controls.value.setValue('  ');
    component.searchCustomers();
    expect(api.customers).not.toHaveBeenCalled();
    component.search.controls.value.setValue('x'.repeat(101));
    expect(component.search.invalid).toBe(true);
  });
  it('clears previous account and preview when the customer changes', () => {
    fill();
    component.previewWithdrawal();
    component.selectCustomer({ ...customer, clientId: 32 });
    expect(component.account).toBeNull();
    expect(component.preview).toBeNull();
    expect(component.form.controls.identificationReference.value).toBe('');
  });
  it('only selects an account returned for the selected customer', () => {
    component.selectCustomer(customer);
    component.selectAccount(999);
    expect(api.account).not.toHaveBeenCalled();
    component.selectAccount(42);
    expect(api.account).toHaveBeenCalledWith(42);
    expect(component.account?.currencyCode).toBe('TST');
  });
  it('blocks an ineligible account using backend eligibility', () => {
    api.account.mockReturnValue(of({ ...account, withdrawalEligible: false, restrictions: ['DEBITS_BLOCKED'] }));
    fill();
    component.previewWithdrawal();
    expect(api.preview).not.toHaveBeenCalled();
    expect(component.account?.restrictions).toEqual(['DEBITS_BLOCKED']);
  });
  it('loads only account currency denominations and calculates exact decimal totals', () => {
    fill();
    expect(component.denominations).toHaveLength(2);
    expect(component.total('BANKNOTE')).toBe('0.20');
    expect(component.total('COIN')).toBe('0.10');
    expect(component.total()).toBe('0.30');
    expect(component.balanced).toBe(true);
  });
  it.each([
    -1,
    0.5,
    5,
    NaN,
    Infinity
  ])('rejects invalid or unavailable quantity %s', (q) => {
    fill();
    component.quantities.at(0).setValue(q);
    expect(component.ready).toBe(false);
  });
  it('rejects denomination mismatch, missing identity and invalid precision', () => {
    fill();
    component.form.controls.amount.setValue('0.31');
    expect(component.ready).toBe(false);
    component.form.controls.amount.setValue('0.300');
    expect(component.ready).toBe(false);
    component.form.controls.identificationReference.setValue('');
    expect(component.form.invalid).toBe(true);
  });
  it('method switching clears cash and invalidates preview', () => {
    fill();
    component.previewWithdrawal();
    component.form.controls.method.setValue('CHECK');
    component.switchMethod();
    expect(component.preview).toBeNull();
    expect(component.total()).toBe('0.00');
    expect(component.ready).toBe(false);
  });
  it('sends only real user input to preview and preserves masked backend confirmation', () => {
    fill();
    component.previewWithdrawal();
    expect(api.preview).toHaveBeenCalledWith({
      clientId: 31,
      accountId: 42,
      method: 'CASH',
      amount: '0.30',
      paymentTypeId: 7,
      identificationTypeId: 9,
      identificationReference: 'registered-1234',
      denominations: [
        { denominationId: 'note', quantity: 1 },
        { denominationId: 'coin', quantity: 1 }
      ]
    });
    expect(component.preview?.recipient.maskedReference).toBe('****1234');
    expect(api.create).not.toHaveBeenCalled();
  });
  it('invalidates stale previews on every material edit', async () => {
    fill();
    component.previewWithdrawal();
    component.form.controls.identificationReference.setValue('changed');
    await component.confirmWithdrawal();
    expect(api.create).not.toHaveBeenCalled();
  });
  it('ignores an outdated asynchronous preview', () => {
    const response = new Subject<WithdrawalRecord>();
    api.preview.mockReturnValue(response);
    fill();
    component.previewWithdrawal();
    component.form.controls.amount.setValue('0.60');
    response.next(preview);
    response.complete();
    expect(component.preview).toBeNull();
  });
  it('prevents confirmation without successful preview', async () => {
    fill();
    await component.confirmWithdrawal();
    expect(api.create).not.toHaveBeenCalled();
  });
  it('persists recovery before submitting once and clears secrets on success', async () => {
    fill();
    component.previewWithdrawal();
    const first = component.confirmWithdrawal();
    await component.confirmWithdrawal();
    await first;
    expect(api.remember).toHaveBeenCalledTimes(1);
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.create.mock.calls[0][0].idempotencyKey).toBe('test-key');
    expect(component.completed?.status).toBe('COMPLETED');
    expect(component.form.controls.identificationReference.value).toBe('');
    expect(api.clearPending).toHaveBeenCalledTimes(1);
  });
  it('keeps account balance untouched until backend completion', async () => {
    const response = new Subject<WithdrawalRecord>();
    api.create.mockReturnValue(response);
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    expect(component.account?.availableAmount).toBe(account.availableAmount);
    expect(component.completed).toBeNull();
    response.next(completed);
    response.complete();
  });
  it('retries an ambiguous create using exactly the same key and payload', async () => {
    api.create.mockReturnValueOnce(throwError(() => ({ status: 0 }))).mockReturnValueOnce(of(completed));
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    expect(component.uncertain).toBe(true);
    component.reset();
    expect(component.customer).toEqual(customer);
    await component.retryWithdrawal();
    expect(api.create.mock.calls[1][0]).toEqual(api.create.mock.calls[0][0]);
    expect(component.completed).toEqual(completed);
  });
  it.each([
    400,
    403,
    409
  ])('keeps an ambiguous withdrawal recoverable after a retry returns %s', async (status) => {
    api.create.mockReturnValue(throwError(() => ({ status })));
    api.pending = { request: {}, identityDigest: 'digest' };
    component.uncertain = true;
    api.recover.mockResolvedValue({
      amount: '0.30',
      identificationReference: 'original',
      idempotencyKey: 'original-key'
    });
    await component.retryWithdrawal();
    expect(component.uncertain).toBe(true);
    expect(api.clearPending).not.toHaveBeenCalled();
  });
  it('requires reconciliation acknowledgement before discarding recovery', () => {
    component.uncertain = true;
    component.discardRecovery();
    expect(component.uncertain).toBe(true);
    expect(api.clearPending).not.toHaveBeenCalled();
  });
  it('discards a reconciled request and clears the previous customer, preview and identity', async () => {
    api.create.mockReturnValue(throwError(() => ({ status: 0 })));
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    component.recoveryIdentity.setValue('original-identity');
    component.recoveryReviewed.setValue(true);
    component.discardRecovery();
    expect(api.clearPending).toHaveBeenCalledTimes(1);
    expect(component.uncertain).toBe(false);
    expect(component).toMatchObject({ pending: null });
    expect(component.customer).toBeNull();
    expect(component.account).toBeNull();
    expect(component.preview).toBeNull();
    expect(component.form.controls.identificationReference.value).toBe('');
    expect(component.quantities.length).toBe(0);
    expect(component.recoveryIdentity.value).toBe('');
    expect(component.recoveryReviewed.value).toBe(false);
    expect(api.context).toHaveBeenCalledTimes(2);
    await component.retryWithdrawal();
    expect(api.create).toHaveBeenCalledTimes(1);
    component.search.controls.value.setValue('Customer');
    component.searchCustomers();
    expect(api.customers).toHaveBeenCalledTimes(1);
  });
  it('allows reviewed discard after reload without the original identity reference', () => {
    api.pending = { request: {}, identityDigest: 'digest' };
    component.ngOnInit();
    expect(component.uncertain).toBe(true);
    component.recoveryReviewed.setValue(true);
    component.discardRecovery();
    expect(api.clearPending).toHaveBeenCalledTimes(1);
    expect(component.uncertain).toBe(false);
    expect(api.recover).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
  });
  it('allows reviewed discard when a corrupt saved marker cannot be read', () => {
    Object.defineProperty(api, 'pending', {
      get: () => {
        throw new Error('invalid marker');
      }
    });
    component.ngOnInit();
    expect(component.uncertain).toBe(true);
    component.recoveryReviewed.setValue(true);
    component.discardRecovery();
    expect(api.clearPending).toHaveBeenCalledTimes(1);
    expect(component.uncertain).toBe(false);
    expect(api.create).not.toHaveBeenCalled();
  });
  it('keeps the same request recoverable when reviewed discard cannot clear storage', async () => {
    api.create.mockReturnValueOnce(throwError(() => ({ status: 0 }))).mockReturnValueOnce(of(completed));
    api.clearPending.mockImplementationOnce(() => {
      throw new Error('storage disabled');
    });
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    component.recoveryReviewed.setValue(true);
    component.discardRecovery();
    expect(component.uncertain).toBe(true);
    expect(component.error).toBe('withdrawal.recoveryUnavailable');
    expect(component.customer).toEqual(customer);
    await component.retryWithdrawal();
    expect(api.create.mock.calls[1][0]).toEqual(api.create.mock.calls[0][0]);
    expect(component.completed).toEqual(completed);
    expect(component.recoveryReviewed.value).toBe(false);
  });
  it('resets the acknowledgement for retries and does not discard while a retry is in flight', async () => {
    const response = new Subject<WithdrawalRecord>();
    api.create.mockReturnValueOnce(throwError(() => ({ status: 0 }))).mockReturnValueOnce(response);
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    component.recoveryReviewed.setValue(true);
    await component.retryWithdrawal();
    expect(component.recoveryReviewed.value).toBe(false);
    expect(component.recoveryReviewed.disabled).toBe(true);
    component.recoveryReviewed.setValue(true);
    component.discardRecovery();
    expect(api.clearPending).not.toHaveBeenCalled();
    response.error({ status: 403 });
    expect(component.uncertain).toBe(true);
    expect(component.recoveryReviewed.enabled).toBe(true);
  });
  it('requires the original identity after reload before replay', async () => {
    component.uncertain = true;
    await component.retryWithdrawal();
    expect(api.create).not.toHaveBeenCalled();
    expect(component.error).toBe('withdrawal.identityMismatch');
  });
  it('does not submit when recovery cannot be saved', async () => {
    api.remember.mockRejectedValue(new Error('storage disabled'));
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    expect(api.create).not.toHaveBeenCalled();
    expect(component.busy).toBe(false);
  });
  it('requires another preview after a definitive rejected create', async () => {
    api.create.mockReturnValue(throwError(() => ({ status: 400 })));
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    expect(component.uncertain).toBe(false);
    expect(component.preview).toBeNull();
    expect(api.clearPending).toHaveBeenCalled();
  });
  it('invalidates rejected requests even if clearing recovery storage fails', async () => {
    api.create.mockReturnValue(throwError(() => ({ status: 400 })));
    api.clearPending.mockImplementation(() => {
      throw new Error('storage disabled');
    });
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    expect(component.busy).toBe(false);
    expect(component.uncertain).toBe(false);
    expect(component.preview).toBeNull();
    expect(component.error).toBe('withdrawal.recoveryUnavailable');
    expect(component).toMatchObject({ pending: null });
    await component.confirmWithdrawal();
    expect(api.create).toHaveBeenCalledTimes(1);
  });
  it('reloads fresh balances and inventory while continuing with the same customer', async () => {
    fill();
    component.previewWithdrawal();
    await component.confirmWithdrawal();
    component.continueWithCustomer();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.customer?.clientId).toBe(31);
    expect(api.accounts).toHaveBeenCalledTimes(2);
    expect(api.context).toHaveBeenCalledTimes(2);
    expect(component.account).toBeNull();
    expect(component.completed).toBeNull();
    expect(component.form.controls.amount.value).toBe('');
    expect(component.quantities.length).toBe(0);
  });
  it('resets fully for a new customer', () => {
    fill();
    component.reset();
    expect(component.customer).toBeNull();
    expect(component.account).toBeNull();
    expect(component.search.controls.value.value).toBe('');
  });
  it('retrieves historical records and retrieves backend receipt before printing', () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    component.receiptId.setValue('67');
    component.retrieve();
    component.printReceipt();
    expect(api.retrieve).toHaveBeenCalledWith(67);
    expect(api.receipt).toHaveBeenCalledWith(67);
    expect(component.printedReceipt).toEqual(completed);
    expect(print).toHaveBeenCalled();
    print.mockRestore();
  });
  it('shows a drawer setup message for backend source-assignment errors, including HTTP 403', () => {
    expect(
      withdrawalError({
        status: 403,
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.withdrawal.source.assignment' }] }
      })
    ).toBe('withdrawal.drawerRequired');
  });

  it('maps safe translated errors without exposing backend messages', () => {
    expect(withdrawalError({ status: 403, error: 'SQL password' })).toBe('withdrawal.forbidden');
    expect(
      withdrawalError({
        status: 400,
        error: JSON.stringify({ userMessageGlobalisationCode: 'error.msg.base.teller.withdrawal.funds.insufficient' })
      })
    ).toBe('withdrawal.insufficientFunds');
    expect(
      withdrawalError({
        status: 403,
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.withdrawal.inventory.insufficient' }] }
      })
    ).toBe('withdrawal.insufficientCash');
    expect(withdrawalError({ status: 500, error: 'stack trace' })).toBe('withdrawal.unavailable');
  });
  it('enforces CREATE and native withdrawal permissions for preview', () => {
    fill();
    component.context = { ...context, permissions: ['CREATE_BASE_TELLER_WITHDRAWAL'] };
    component.previewWithdrawal();
    expect(api.preview).not.toHaveBeenCalled();
  });
});
describe('withdrawal contract and route permission safety', () => {
  it('requires feature and dependent read permissions even with legacy RBAC disabled', () => {
    expect(canReadWithdrawals([])).toBe(false);
    expect(canReadWithdrawals(['READ_BASE_TELLER_WITHDRAWAL'])).toBe(false);
    expect(
      canReadWithdrawals([
        'READ_BASE_TELLER_WITHDRAWAL',
        'READ_CLIENT',
        'READ_SAVINGSACCOUNT'
      ])
    ).toBe(true);
    expect(canReadWithdrawals(['ALL_FUNCTIONS_READ'])).toBe(true);
    expect(canReadWithdrawals(['ALL_FUNCTIONS'])).toBe(true);
  });
  it('redirects denied direct navigation to Base Teller', () => {
    const router = { createUrlTree: jest.fn(() => 'denied') };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [] as string[] }) } },
        { provide: Router, useValue: router }
      ]
    });
    expect(TestBed.runInInjectionContext(() => withdrawalGuard({} as any, {} as any))).toBe('denied');
  });
  it('sends exact decimal JSON number tokens without floating point conversion', () => {
    expect(withdrawalJson({ amount: '9007199254740.99' } as any)).toBe('{"amount":9007199254740.99}');
    expect(() => withdrawalJson({ amount: '1e3' } as any)).toThrow();
  });
  it.each([
    '0',
    '-1',
    '1e3',
    '1.001',
    'NaN',
    '10000000000000',
    '1.'
  ])('rejects invalid monetary input %s', (value) => expect(validWithdrawalAmount(value, 2)).toBe(false));
});
