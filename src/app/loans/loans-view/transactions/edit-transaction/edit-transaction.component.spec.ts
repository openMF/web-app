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

  /**
   * A Working Capital repayment as the template resolver assembles it: the
   * transaction itself plus the payment type options of the repayment template.
   */
  const workingCapitalRepayment = {
    id: 77,
    type: { id: 2, code: 'loanTransactionType.repayment', value: 'Repayment' },
    transactionDate: [
      2026,
      6,
      1
    ],
    transactionAmount: 150,
    externalId: 'original-external-id',
    reversed: false,
    paymentDetailData: { id: 9, paymentType: { id: 1, name: 'Money Transfer' } },
    currency: { code: 'EUR', displaySymbol: '€' },
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }]
  };

  let loansServiceStub: any;
  let routerStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the
   * tests exercise the real form and payload logic without rendering the template.
   * @param template The resolved transaction template; defaults to a repayment.
   * @param loanStatusCode Status code of the loan the transaction belongs to.
   * @param isWorkingCapital Whether the loan is a Working Capital one.
   * @returns The initialised component.
   */
  function createComponent(
    template: any = repaymentTemplate,
    loanStatusCode = 'loanStatusType.active',
    isWorkingCapital = false
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
          useValue: {
            isLoanProduct: !isWorkingCapital,
            isWorkingCapital,
            productType: { value: isWorkingCapital ? 'workingCapital' : 'loan' }
          }
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

  /** Returns the request body handed to the Working Capital command by the last submit. */
  function submittedWorkingCapitalPayload(): any {
    return loansServiceStub.applyWorkingCapitalLoanActionCommand.mock.calls[0][1];
  }

  /** Builds a Working Capital component with the form filled in the same way across tests. */
  function createFilledWorkingCapitalComponent(): EditTransactionComponent {
    const component = createComponent(workingCapitalRepayment, 'loanStatusType.active', true);
    component.editTransactionForm.patchValue({
      externalId: 'must-not-be-sent',
      reversalExternalId: ' rev-1 ',
      note: ' Wrong amount ',
      accountNumber: 1234,
      receiptNumber: ' R-1 '
    });
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      executeLoansAccountTransactionsCommand: jest.fn().mockReturnValue(of({ resourceId: 78 })),
      applyWorkingCapitalLoanActionCommand: jest.fn().mockReturnValue(of({ resourceId: 78 }))
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

  describe('Working Capital', () => {
    it('prefills date, amount and payment type from the transaction fields', () => {
      const component = createComponent(workingCapitalRepayment, 'loanStatusType.active', true);

      expect(component.editTransactionForm.controls.transactionDate.value).toEqual(new Date(2026, 5, 1));
      expect(component.editTransactionForm.controls.transactionAmount.value).toBe(150);
      expect(component.editTransactionForm.controls.paymentTypeId.value).toBe(1);
      expect(component.paymentTypeOptions).toEqual([{ id: 1, name: 'Money Transfer' }]);
    });

    it('leaves the payment type empty when the transaction carries no payment detail', () => {
      const component = createComponent({ ...workingCapitalRepayment, paymentDetailData: null }, undefined, true);

      expect(component.editTransactionForm.controls.paymentTypeId.value).toBeNull();
    });

    it('posts the adjust command on the Working Capital resource', () => {
      const component = createComponent(workingCapitalRepayment, 'loanStatusType.active', true);

      component.submit();

      expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).toHaveBeenCalledWith(
        '1',
        expect.any(Object),
        'adjust',
        77
      );
      expect(loansServiceStub.executeLoansAccountTransactionsCommand).not.toHaveBeenCalled();
    });

    it('nests the payment details and never sends the external id', () => {
      const component = createFilledWorkingCapitalComponent();

      component.submit();

      expect(submittedWorkingCapitalPayload()).toEqual({
        transactionDate: '10 June 2026',
        transactionAmount: 150,
        dateFormat: 'dd MMMM yyyy',
        locale: 'en',
        reversalExternalId: 'rev-1',
        note: 'Wrong amount',
        paymentDetails: { paymentTypeId: 1, accountNumber: 1234, receiptNumber: 'R-1' }
      });
    });

    it('leaves the payment details out entirely when none is filled in', () => {
      const component = createComponent(
        { ...workingCapitalRepayment, paymentDetailData: null },
        'loanStatusType.active',
        true
      );

      component.submit();

      expect(submittedWorkingCapitalPayload()).toEqual({
        transactionDate: '10 June 2026',
        transactionAmount: 150,
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      });
    });

    it('navigates away instead of offering the form for a type the command only reverses', () => {
      [
        22,
        23,
        26
      ].forEach((typeId) => {
        routerStub.navigate.mockClear();
        createComponent({ ...workingCapitalRepayment, type: { id: typeId } }, 'loanStatusType.active', true);

        expect(routerStub.navigate).toHaveBeenCalled();
      });
    });

    it('navigates away instead of offering the form for an already reversed repayment', () => {
      createComponent({ ...workingCapitalRepayment, reversed: true }, 'loanStatusType.active', true);

      expect(routerStub.navigate).toHaveBeenCalled();
    });
  });
});
