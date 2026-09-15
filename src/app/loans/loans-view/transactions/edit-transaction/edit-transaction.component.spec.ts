/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { EditTransactionComponent } from './edit-transaction.component';

describe('EditTransactionComponent', () => {
  const businessDate = new Date(2026, 5, 10);

  /** A repayment as the transaction template endpoint returns it. */
  const repaymentTemplate = {
    id: 77,
    type: { id: 2, code: 'loanTransactionType.repayment', value: 'Repayment' },
    date: [
      2026,
      6,
      1
    ],
    amount: 150,
    externalId: 'original-external-id',
    paymentTypeId: 1,
    manuallyReversed: false,
    currency: { code: 'EUR', displaySymbol: '€' },
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }]
  };

  let loansServiceStub: any;
  let routerStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the
   * tests exercise the real form and payload logic without rendering the template.
   * @param template The resolved transaction template; defaults to a repayment.
   * @returns The initialised component.
   */
  function createComponent(
    template: any = repaymentTemplate,
    loanStatusCode = 'loanStatusType.active'
  ): EditTransactionComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ loansAccountTransactionTemplate: template }),
            parent: { data: of({ loanDetailsAssociationData: { status: { code: loanStatusCode } } }) },
            snapshot: { params: { loanId: '1' } }
          }
        },
        { provide: Router, useValue: routerStub },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isLoanProduct: true, isWorkingCapital: false, productType: { value: 'loan' } }
        },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '10 June 2026' } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new EditTransactionComponent());
    component.ngOnInit();
    return component;
  }

  /** Returns the request body handed to the loans service by the last submit. */
  function submittedPayload(): any {
    return loansServiceStub.executeLoansAccountTransactionsCommand.mock.calls[0][2];
  }

  beforeEach(() => {
    loansServiceStub = {
      executeLoansAccountTransactionsCommand: jest.fn().mockReturnValue(of({ resourceId: 78 }))
    };
    routerStub = { navigate: jest.fn() };
  });

  it('prefills date, amount and payment type but leaves the external id empty', () => {
    const component = createComponent();

    expect(component.editTransactionForm.controls.transactionAmount.value).toBe(150);
    expect(component.editTransactionForm.controls.paymentTypeId.value).toBe(1);
    // Re-sending the original id would collide with the row kept as reversed.
    expect(component.editTransactionForm.controls.externalId.value).toBeNull();
  });

  it('posts the adjust command against the transaction being adjusted', () => {
    const component = createComponent();

    component.submit();

    expect(loansServiceStub.executeLoansAccountTransactionsCommand).toHaveBeenCalledWith(
      '1',
      'adjust',
      expect.any(Object),
      77
    );
  });

  it('returns to the transaction list, which sits under the re-resolved loan route', () => {
    const component = createComponent();

    component.submit();

    // Going back to the transaction detail would stay inside the same parent
    // route, leaving the rewritten loan data unresolved.
    expect(routerStub.navigate).toHaveBeenCalledWith(
      [
        '../',
        '../'
      ],
      expect.any(Object)
    );
  });

  it('sends only the mandatory parameters when no optional field is filled in', () => {
    const component = createComponent();

    component.submit();

    expect(Object.keys(submittedPayload()).sort()).toEqual([
      'dateFormat',
      'locale',
      'paymentTypeId',
      'transactionAmount',
      'transactionDate'
    ]);
    expect(submittedPayload().transactionAmount).toBe(150);
    expect(submittedPayload().transactionDate).toBe('10 June 2026');
  });

  it('sends the optional fields once filled in, trimmed', () => {
    const component = createComponent();
    component.editTransactionForm.patchValue({
      externalId: ' new-external-id ',
      reversalExternalId: 'reversal-id',
      note: 'Corrected amount after reconciliation'
    });

    component.submit();

    expect(submittedPayload().externalId).toBe('new-external-id');
    expect(submittedPayload().reversalExternalId).toBe('reversal-id');
    expect(submittedPayload().note).toBe('Corrected amount after reconciliation');
  });

  it('drops the payment details the user typed and then collapsed', () => {
    const component = createComponent();
    component.addPaymentDetails();
    component.editTransactionForm.patchValue({ routingCode: 'RC-1', receiptNumber: 'RN-1' });

    component.addPaymentDetails();
    component.submit();

    expect(submittedPayload().routingCode).toBeUndefined();
    expect(submittedPayload().receiptNumber).toBeUndefined();
  });

  it('keeps the payment details while the section stays open', () => {
    const component = createComponent();
    component.addPaymentDetails();
    component.editTransactionForm.patchValue({ routingCode: 'RC-1', bankNumber: 'BN-1' });

    component.submit();

    expect(submittedPayload().routingCode).toBe('RC-1');
    expect(submittedPayload().bankNumber).toBe('BN-1');
  });

  it('rejects a zero amount, which the adjust command reads as a reversal', () => {
    const component = createComponent();

    component.editTransactionForm.controls.transactionAmount.setValue(0);

    // Reversing is what the Reverse action does, through its own dialog.
    expect(component.editTransactionForm.controls.transactionAmount.hasError('min')).toBe(true);
    expect(component.editTransactionForm.valid).toBe(false);
  });

  it('accepts the smallest amount the shared amount validator allows', () => {
    const component = createComponent();

    component.editTransactionForm.controls.transactionAmount.setValue(0.000001);

    expect(component.editTransactionForm.controls.transactionAmount.valid).toBe(true);
  });

  it('warns that the adjustment reopens a closed or overpaid loan', () => {
    expect(createComponent(repaymentTemplate, 'loanStatusType.overpaid').willReopenLoan).toBe(true);
    expect(createComponent(repaymentTemplate, 'loanStatusType.closed.obligations.met').willReopenLoan).toBe(true);
  });

  it('does not warn while the loan is still open', () => {
    expect(createComponent().willReopenLoan).toBe(false);
  });

  it('navigates away instead of offering the form for a reverse-only type', () => {
    createComponent({ ...repaymentTemplate, type: { id: 23, code: 'loanTransactionType.goodwillCredit' } });

    expect(routerStub.navigate).toHaveBeenCalled();
  });

  it('navigates away instead of offering the form for an already reversed transaction', () => {
    createComponent({ ...repaymentTemplate, manuallyReversed: true });

    expect(routerStub.navigate).toHaveBeenCalled();
  });
});
