/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { ViewTransactionComponent } from './view-transaction.component';

describe('ViewTransactionComponent', () => {
  let loansServiceStub: any;
  let dialogStub: any;
  let routerStub: any;
  let dialogResult: any;

  /**
   * Builds the resolved transaction with only the fields the actions read.
   * @param typeId Loan transaction type id
   * @param overrides Extra fields, e.g. `manuallyReversed` or relations
   */
  function transaction(typeId: number, overrides: any = {}): any {
    return {
      id: 77,
      amount: 150,
      date: [
        2026,
        6,
        1
      ],
      type: { id: typeId, code: 'loanTransactionType.any', value: 'Any' },
      manuallyReversed: false,
      transactionRelations: [],
      ...overrides
    };
  }

  /**
   * Builds the component against stubbed collaborators. The gates run in the
   * constructor, so they are already resolved when it returns.
   * @param transactionData The resolved transaction
   * @param options Loan status code and product flavour
   */
  function createComponent(
    transactionData: any = transaction(2),
    options: { loanStatusCode?: string; isWorkingCapital?: boolean } = {}
  ): ViewTransactionComponent {
    const { loanStatusCode = 'loanStatusType.active', isWorkingCapital = false } = options;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ loansAccountTransaction: transactionData }),
            parent: { data: of({ loanDetailsAssociationData: { status: { code: loanStatusCode } } }) },
            snapshot: { params: { loanId: '1', clientId: '5' } }
          }
        },
        { provide: Router, useValue: routerStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: OrganizationService, useValue: { getPaymentTypesWithCode: () => of([]) } },
        { provide: AlertService, useValue: { alert: jest.fn() } },
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
          useValue: { businessDate: new Date(2026, 5, 10), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '01 June 2026' } }
      ]
    });

    return TestBed.runInInjectionContext(() => new ViewTransactionComponent());
  }

  beforeEach(() => {
    dialogResult = { data: { value: { note: ' Wrong amount ', reversalExternalId: '' } } };
    loansServiceStub = {
      executeLoansAccountTransactionsCommand: jest.fn().mockReturnValue(of({ resourceId: 77 }))
    };
    dialogStub = { open: jest.fn().mockReturnValue({ afterClosed: () => of(dialogResult) }) };
    routerStub = { navigate: jest.fn() };
  });

  describe('action availability', () => {
    it('offers both actions on a repayment', () => {
      const component = createComponent(transaction(2));

      expect(component.allowUndo).toBe(true);
      expect(component.allowEdition).toBe(true);
    });

    it('offers the adjustment on types the previous chargeback rule hid', () => {
      // Waive interest, charge adjustment and accrual clear the backend gate but
      // were never offered, because edition was tied to the chargeback rule.
      [
        4,
        26,
        10
      ].forEach((typeId) => {
        expect(createComponent(transaction(typeId)).allowEdition).toBe(true);
      });
    });

    it('offers only the reversal on a reverse-only type', () => {
      const component = createComponent(transaction(21));

      expect(component.allowUndo).toBe(true);
      expect(component.allowEdition).toBe(false);
    });

    it('offers no action on an interest refund', () => {
      const component = createComponent(transaction(33));

      expect(component.allowUndo).toBe(false);
      expect(component.allowEdition).toBe(false);
    });

    it('offers no action on a disbursement', () => {
      const component = createComponent(transaction(1, { type: { id: 1, disbursement: true } }));

      expect(component.allowUndo).toBe(false);
      expect(component.allowEdition).toBe(false);
    });

    it('offers no action on a transaction linked to a chargeback', () => {
      const component = createComponent(
        transaction(2, { transactionRelations: [{ relationType: 'CHARGEBACK', amount: 10 }] })
      );

      expect(component.allowUndo).toBe(false);
      expect(component.allowEdition).toBe(false);
    });

    it('never offers the adjustment on Working Capital', () => {
      const component = createComponent(
        transaction(2, { transactionDate: [
            2026,
            6,
            1
          ] }),
        {
          isWorkingCapital: true
        }
      );

      expect(component.allowEdition).toBe(false);
    });
  });

  describe('reversal', () => {
    it('posts the adjust command with a zero amount and the trimmed note', () => {
      const component = createComponent(transaction(2));

      component.undoTransaction();

      const [
        loanId,
        command,
        payload,
        transactionId
      ] = loansServiceStub.executeLoansAccountTransactionsCommand.mock.calls[0];
      expect(loanId).toBe('1');
      expect(command).toBe('adjust');
      expect(transactionId).toBe(77);
      expect(payload.transactionAmount).toBe(0);
      expect(payload.note).toBe('Wrong amount');
      expect(payload.reversalExternalId).toBeUndefined();
    });

    it('undoes a Term Loan charge-off on the loan instead of the transaction', () => {
      dialogResult = { confirm: true };
      const component = createComponent(transaction(27, { type: { id: 27, chargeoff: true } }));

      component.undoTransaction();

      const [
        ,
        command,
        ,
        transactionId
      ] = loansServiceStub.executeLoansAccountTransactionsCommand.mock.calls[0];
      expect(command).toBe('undo-charge-off');
      expect(transactionId).toBeUndefined();
    });

    it('gates the button with the permission of the command it posts', () => {
      // The charge-off is undone with its own command, so requiring ADJUST_LOAN
      // would hide the action from the users the backend does authorise.
      expect(createComponent(transaction(27, { type: { id: 27, chargeoff: true } })).undoPermission).toBe(
        'UNDOCHARGEOFF_LOAN'
      );
      expect(
        createComponent(transaction(27, { type: { id: 27, chargeoff: true } }), { isWorkingCapital: true })
          .undoPermission
      ).toBe('UNDOCHARGEOFF_WORKINGCAPITALLOAN');
      expect(createComponent(transaction(2)).undoPermission).toBe('ADJUST_LOAN');
    });

    it('names the button after the command that performs the action', () => {
      expect(createComponent(transaction(2)).undoButtonLabelKey).toBe('labels.buttons.Reverse');
      expect(createComponent(transaction(27, { type: { id: 27, chargeoff: true } })).undoButtonLabelKey).toBe(
        'labels.buttons.Undo'
      );
    });
  });

  describe('reopening warning', () => {
    it('warns in the dialog when the loan is closed or overpaid', () => {
      const component = createComponent(transaction(2), { loanStatusCode: 'loanStatusType.overpaid' });

      expect(component.willReopenLoan).toBe(true);
      component.undoTransaction();
      expect(dialogStub.open.mock.calls[0][1].data.warning).toBe(
        'labels.dialogContext.This will reopen the loan account'
      );
    });

    it('shows no warning while the loan is still open', () => {
      const component = createComponent(transaction(2));

      expect(component.willReopenLoan).toBe(false);
      component.undoTransaction();
      expect(dialogStub.open.mock.calls[0][1].data.warning).toBeUndefined();
    });
  });
});
