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
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import {
  TransactionReversalComponent,
  TransactionReversalConfirmDialogComponent
} from './transaction-reversal.component';
import { ReversalCandidate, ReversalContext, ReversalDetail, ReversalPreview } from './transaction-reversal.service';

describe('TransactionReversalComponent', () => {
  const context: ReversalContext = {
    businessDate: '2026-10-14',
    cashiers: [{ id: 1, name: 'Cashier' }],
    currencies: [{ code: 'USD', name: 'US Dollar', decimalPlaces: 2 }],
    banks: [{ id: 2, code: 'BANK', name: 'Bank' }],
    denominations: [{ id: 'one', value: 1, type: 'NOTE', currencyCode: 'USD' }],
    canCreate: true,
    canAuthorize: false
  };
  const row: ReversalCandidate = {
    original: {
      historyId: 'SOURCE:7',
      transactionDate: '2026-10-14T12:00:00Z',
      operation: 'DEPOSIT',
      currencyCode: 'USD',
      status: 'COMPLETED'
    },
    user: 'cashier',
    sourceType: 'SOURCE',
    operationType: 'CASH',
    amount: 1,
    businessDate: '2026-10-14',
    eligibility: { reversible: true, reason: null }
  };
  const detail: ReversalDetail = {
    historyId: row.original.historyId,
    sourceType: row.sourceType,
    businessDate: row.businessDate,
    operation: row.original.operation,
    currencyCode: 'USD',
    amount: 1,
    cashAmount: 1,
    checkAmount: 0,
    originalDirection: 'IN',
    eligibility: { reversible: true, reason: null },
    checks: [],
    denominations: context.denominations,
    returnedCashDenominations: [],
    reversalId: null
  };
  let http: HttpTestingController;
  let component: TransactionReversalComponent;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TransactionReversalComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    dialog = TestBed.inject(MatDialog);
    const fixture = TestBed.createComponent(TransactionReversalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne('/v2/base-teller/transaction-reversals/context').flush(context);
    fixture.detectChanges();
  });

  afterEach(() => {
    dialog.closeAll();
    http.verify();
  });

  it('searches the context business date and pages through backend results', () => {
    expect(component.form.controls.transactionDate.value).toBe(context.businessDate);
    component.search();
    const first = http.expectOne((candidate) => candidate.url.endsWith('/transactions'));
    expect(first.request.params.get('transactionDate')).toBe(context.businessDate);
    expect(first.request.params.get('offset')).toBe('0');
    first.flush({ items: [row], totalFilteredRecords: 26, offset: 0, limit: 25 });
    expect(component.rows).toEqual([row]);
    component.page({ pageIndex: 1, pageSize: 25, length: 26 });
    const second = http.expectOne((candidate) => candidate.url.endsWith('/transactions'));
    expect(second.request.params.get('offset')).toBe('25');
    second.flush({ items: [], totalFilteredRecords: 26, offset: 25, limit: 25 });
  });

  it('refuses ineligible selection and loads eligible detail before enabling cash preview', () => {
    component.select({ ...row, eligibility: { reversible: false, reason: 'Already reversed' } });
    http.expectNone((candidate) => candidate.url.includes('/SOURCE'));
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    expect(component.canPreview()).toBe(false);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    expect(component.canPreview()).toBe(false);
    component.quantities.get('one')?.setValue(1);
    expect(component.totalFor(false)).toBe(1);
    expect(component.difference(false)).toBe(0);
    expect(component.canPreview()).toBe(true);
  });

  it('supports check and mixed components from detail without substituting original checks', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush({
      ...detail,
      checkAmount: 2,
      amount: 3,
      checks: [
        { id: 9, bankId: 2, bank: 'Bank', checkNumber: 'original', amount: 2, currencyCode: 'USD', eligible: true }
      ]
    });
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(1);
    expect(component.canPreview()).toBe(true);
    component.showPreview();
    const preview = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(preview.request.body.checks).toEqual([{ id: 9, bankId: 2, checkNumber: 'original', amount: 2 }]);
    expect(preview.request.body.cashDenominations).toEqual([{ denominationId: 'one', quantity: 1 }]);
    expect(preview.request.body.idempotencyKey).toHaveLength(24);
    preview.flush({
      original: detail,
      cashDenominations: [{ denominationId: 'one', value: 1, quantity: 1 }],
      returnedCashDenominations: [],
      cashDirection: 'OUT',
      cashEffect: -1,
      checkEffect: -2,
      accountingStrategy: ''
    });
    expect(dialog.openDialogs).toHaveLength(1);
  });

  it('uses the backend direction for cash returned to the drawer', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush({ ...detail, originalDirection: 'OUT' });
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.returnedQuantities.get('one')?.setValue(1);
    expect(component.needsRemoval()).toBe(false);
    expect(component.needsReturn()).toBe(true);
    expect(component.canPreview()).toBe(true);
    component.showPreview();
    const preview = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(preview.request.body.cashDenominations).toEqual([]);
    expect(preview.request.body.returnedCashDenominations).toEqual([{ denominationId: 'one', quantity: 1 }]);
    preview.flush({
      original: detail,
      cashDenominations: [],
      returnedCashDenominations: [{ denominationId: 'one', value: 1, quantity: 1 }],
      cashDirection: 'IN',
      cashEffect: 1,
      checkEffect: 0,
      accountingStrategy: ''
    });
  });

  it('shows fractional denomination totals using currency minor units in the confirmation dialog', () => {
    const fractionalDetail: ReversalDetail = {
      ...detail,
      amount: 0.3,
      cashAmount: 0.3,
      denominations: [{ ...context.denominations[0], value: 0.1 }]
    };
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(fractionalDetail);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(3);
    expect(component.canPreview()).toBe(true);

    component.showPreview();
    http.expectOne('/v2/base-teller/transaction-reversals/preview').flush({
      original: fractionalDetail,
      cashDenominations: [{ denominationId: 'one', value: 0.1, quantity: 3 }],
      returnedCashDenominations: [],
      cashDirection: 'OUT',
      cashEffect: -0.3,
      checkEffect: 0,
      accountingStrategy: ''
    });

    const confirmation = dialog.openDialogs[0].componentInstance as TransactionReversalConfirmDialogComponent;
    expect(confirmation.total(confirmation.data.cashDenominations)).toBe(0.3);
  });

  it('prevents duplicate submission, clears authorization, and reloads search after success', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(1);
    component.showPreview();
    http.expectOne('/v2/base-teller/transaction-reversals/preview').flush({
      original: detail,
      cashDenominations: [],
      returnedCashDenominations: [],
      cashDirection: 'OUT',
      cashEffect: -1,
      checkEffect: 0,
      accountingStrategy: ''
    });
    component.confirm();
    component.confirm();
    const reversal = http.expectOne('/v2/base-teller/transaction-reversals');
    expect(reversal.request.body.authorizationNumber).toBe('supervisor-issued');
    reversal.flush({
      id: 10,
      historyId: 'TRANSACTION_REVERSAL:10',
      originalHistoryId: detail.historyId,
      amount: 1,
      currencyCode: 'USD',
      status: 'COMPLETED'
    });
    expect(component.form.controls.authorizationNumber.value).toBe('');
    expect(component.result?.status).toBe('COMPLETED');
    const refresh = http.expectOne((candidate) => candidate.url.endsWith('/transactions'));
    refresh.flush({
      items: [{ ...row, eligibility: { reversible: false, reason: 'Already reversed' } }],
      totalFilteredRecords: 1,
      offset: 0,
      limit: 25
    });
    expect(component.rows[0].eligibility.reversible).toBe(false);
  });

  it('reuses the idempotency key when a failed submission is retried unchanged', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(1);
    const preview: ReversalPreview = {
      original: detail,
      cashDenominations: [{ denominationId: 'one', value: 1, quantity: 1 }],
      returnedCashDenominations: [],
      cashDirection: 'OUT',
      cashEffect: -1,
      checkEffect: 0,
      accountingStrategy: ''
    };

    component.showPreview();
    const firstPreview = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    const key = firstPreview.request.body.idempotencyKey;
    firstPreview.flush(preview);
    dialog.closeAll();
    component.confirm();
    const firstSubmission = http.expectOne('/v2/base-teller/transaction-reversals');
    expect(firstSubmission.request.body.idempotencyKey).toBe(key);
    firstSubmission.flush({}, { status: 500, statusText: 'Server Error' });

    component.showPreview();
    const retryPreview = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(retryPreview.request.body.idempotencyKey).toBe(key);
    retryPreview.flush(preview);
    dialog.closeAll();
    component.confirm();
    const retrySubmission = http.expectOne('/v2/base-teller/transaction-reversals');
    expect(retrySubmission.request.body.idempotencyKey).toBe(key);
    retrySubmission.flush({
      id: 10,
      historyId: 'TRANSACTION_REVERSAL:10',
      originalHistoryId: detail.historyId,
      amount: 1,
      currencyCode: 'USD',
      status: 'COMPLETED'
    });
    http
      .expectOne((candidate) => candidate.url.endsWith('/transactions'))
      .flush({
        items: [],
        totalFilteredRecords: 0,
        offset: 0,
        limit: 25
      });
  });

  it('creates a new idempotency key after authorization or cash quantities change', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(1);

    component.showPreview();
    const first = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    const firstKey = first.request.body.idempotencyKey;
    first.flush({
      original: detail,
      cashDenominations: [{ denominationId: 'one', value: 1, quantity: 1 }],
      returnedCashDenominations: [],
      cashDirection: 'OUT',
      cashEffect: -1,
      checkEffect: 0,
      accountingStrategy: ''
    });
    dialog.closeAll();

    component.form.controls.authorizationNumber.setValue('another-issued');
    expect(component.preview).toBeUndefined();
    component.showPreview();
    const changedAuthorization = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(changedAuthorization.request.body.idempotencyKey).not.toBe(firstKey);
    const secondKey = changedAuthorization.request.body.idempotencyKey;
    changedAuthorization.flush({}, { status: 500, statusText: 'Server Error' });

    component.quantities.get('one')?.setValue(0);
    component.quantities.get('one')?.setValue(1);
    component.showPreview();
    const changedQuantity = http.expectOne('/v2/base-teller/transaction-reversals/preview');
    expect(changedQuantity.request.body.idempotencyKey).not.toBe(secondKey);
    changedQuantity.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('identifies invalid authorization even when the backend returns HTTP 403', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    component.form.controls.authorizationNumber.setValue('invalid');
    component.quantities.get('one')?.setValue(1);
    component.showPreview();
    http.expectOne('/v2/base-teller/transaction-reversals/preview').flush(
      {
        errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.transaction.reversal.authorization.invalid' }]
      },
      { status: 403, statusText: 'Forbidden' }
    );
    expect(component.error).toBe('transactionReversal.errors.invalidAuthorization');
    expect(component.detail?.eligibility.reversible).toBe(true);
  });

  it('shows insufficient inventory without changing the selected detail', () => {
    component.select(row);
    http.expectOne('/v2/base-teller/transaction-reversals/SOURCE%3A7').flush(detail);
    component.form.controls.authorizationNumber.setValue('supervisor-issued');
    component.quantities.get('one')?.setValue(1);
    component.showPreview();
    http
      .expectOne('/v2/base-teller/transaction-reversals/preview')
      .flush(
        { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.transaction.reversal.cash.insufficient' }] },
        { status: 403, statusText: 'Forbidden' }
      );
    expect(component.error).toBe('transactionReversal.errors.insufficientCash');
    expect(component.detail?.eligibility.reversible).toBe(true);
  });
});
