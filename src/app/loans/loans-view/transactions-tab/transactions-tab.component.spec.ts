/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanTransaction } from 'app/products/loan-products/models/loan-account.model';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { TransactionsTabComponent } from './transactions-tab.component';

describe('TransactionsTabComponent', () => {
  let loansServiceStub: any;
  let dialogStub: any;
  let routerStub: any;
  let dialogResult: any;

  /**
   * Builds a transaction row with only the fields the row actions read.
   * @param typeId Loan transaction type id
   * @param overrides Extra fields, e.g. `manuallyReversed` or relations
   */
  function transaction(typeId: number, overrides: any = {}): LoanTransaction {
    return {
      id: 77,
      date: [
        2026,
        6,
        1
      ],
      type: { id: typeId, code: 'loanTransactionType.any', value: 'Any' },
      manuallyReversed: false,
      transactionRelations: [],
      ...overrides
    } as unknown as LoanTransaction;
  }

  /**
   * Builds the component against stubbed collaborators without running ngOnInit,
   * so the tests exercise the row action rules rather than the table setup.
   * @param isWorkingCapital Whether the loan is a Working Capital one
   */
  function createComponent(
    isWorkingCapital = false,
    loanStatusCode = 'loanStatusType.active'
  ): TransactionsTabComponent {
    TestBed.resetTestingModule();
    const loanRoute = {
      snapshot: { params: { loanId: '1' } },
      data: of({
        loanDetailsData: { status: { code: loanStatusCode, value: 'Active' }, transactions: [] }
      })
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { parent: { parent: loanRoute }, data: of({ loanTransactionData: { content: [] } }) }
        },
        { provide: Router, useValue: routerStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
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
        {
          provide: Dates,
          useValue: { parseDate: () => new Date(2026, 5, 1), formatDate: () => '01 June 2026' }
        }
      ]
    });

    return TestBed.runInInjectionContext(() => new TransactionsTabComponent());
  }

  beforeEach(() => {
    dialogResult = { data: { value: { note: ' Wrong amount ', reversalExternalId: ' rev-1 ' } } };
    loansServiceStub = {
      executeLoansAccountTransactionsCommand: jest.fn().mockReturnValue(of({ resourceId: 77 }))
    };
    dialogStub = { open: jest.fn().mockReturnValue({ afterClosed: () => of(dialogResult) }) };
    routerStub = {
      url: '/clients/1/loans-accounts/1/transactions',
      navigate: jest.fn(),
      navigateByUrl: jest.fn().mockResolvedValue(true)
    };
  });

  describe('Term Loan row actions', () => {
    it('offers both actions on a repayment', () => {
      const component = createComponent();

      expect(component.allowUndoTransaction(transaction(2))).toBe(true);
      expect(component.allowAdjustTransaction(transaction(2))).toBe(true);
    });

    it('offers only the reversal on a goodwill credit', () => {
      const component = createComponent();

      expect(component.allowUndoTransaction(transaction(23))).toBe(true);
      expect(component.allowAdjustTransaction(transaction(23))).toBe(false);
    });

    it('offers no action on types the adjust command rejects', () => {
      const component = createComponent();

      // Chargeback, charge payment, income posting and interest refund used to
      // be offered by the previous blacklist and failed on submit.
      [
        25,
        17,
        19,
        33
      ].forEach((typeId) => {
        expect(component.allowUndoTransaction(transaction(typeId))).toBe(false);
        expect(component.allowAdjustTransaction(transaction(typeId))).toBe(false);
      });
    });

    it('keeps the reversal on a write-off, which has its own command', () => {
      const component = createComponent();

      expect(component.allowUndoTransaction(transaction(6, { type: { id: 6, writeOff: true } }))).toBe(true);
    });

    it('offers no action on an already reversed transaction', () => {
      const component = createComponent();

      expect(component.allowUndoTransaction(transaction(2, { manuallyReversed: true }))).toBe(false);
      expect(component.allowAdjustTransaction(transaction(2, { manuallyReversed: true }))).toBe(false);
    });

    it('offers no action on a transaction linked to a chargeback', () => {
      const component = createComponent();
      const linked = transaction(2, { transactionRelations: [{ relationType: 'CHARGEBACK', amount: 10 }] });

      expect(component.allowUndoTransaction(linked)).toBe(false);
      expect(component.allowAdjustTransaction(linked)).toBe(false);
    });

    it('names the reversal after the command that performs it', () => {
      const component = createComponent();

      expect(component.undoLabelKey(transaction(2))).toBe('labels.buttons.Reverse');
      expect(component.undoLabelKey(transaction(6, { type: { id: 6, writeOff: true } }))).toBe(
        'tooltips.Undo Transaction'
      );
    });
  });

  describe('Term Loan reversal', () => {
    it('posts the adjust command with a zero amount and the trimmed dialog fields', () => {
      const component = createComponent();

      component.undoTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

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
      expect(payload.reversalExternalId).toBe('rev-1');
    });

    it('omits the optional fields when the dialog is submitted empty', () => {
      dialogResult = { data: { value: { note: '', reversalExternalId: '' } } };
      const component = createComponent();

      component.undoTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

      const payload = loansServiceStub.executeLoansAccountTransactionsCommand.mock.calls[0][2];
      expect(Object.keys(payload).sort()).toEqual([
        'dateFormat',
        'locale',
        'transactionAmount',
        'transactionDate'
      ]);
    });

    it('warns in the dialog that the reversal reopens an overpaid loan', () => {
      const component = createComponent(false, 'loanStatusType.overpaid');

      component.undoTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

      expect(dialogStub.open.mock.calls[0][1].data.warning).toBe(
        'labels.dialogContext.This will reopen the loan account'
      );
    });

    it('shows no warning while the loan is still open', () => {
      const component = createComponent();

      component.undoTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

      expect(dialogStub.open.mock.calls[0][1].data.warning).toBeUndefined();
    });

    it('sends nothing when the dialog is dismissed', () => {
      dialogResult = undefined;
      const component = createComponent();

      component.undoTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

      expect(loansServiceStub.executeLoansAccountTransactionsCommand).not.toHaveBeenCalled();
    });
  });

  describe('Working Capital row actions', () => {
    it('keeps its own reversal rules instead of the adjust command gate', () => {
      const component = createComponent(true);

      // Charge payment is rejected by the Term Loan adjust command but stays
      // available on Working Capital, which reverses through its own endpoint.
      expect(component.allowUndoTransaction(transaction(17))).toBe(true);
      expect(component.allowUndoTransaction(transaction(1, { type: { id: 1, disbursement: true } }))).toBe(false);
    });

    it('offers the adjust action on a repayment', () => {
      const component = createComponent(true);

      expect(component.allowAdjustTransaction(transaction(2))).toBe(true);
    });

    it('offers no adjust action on the types its adjust command only reverses', () => {
      const component = createComponent(true);

      // The Working Capital adjust command accepts these only with a zero
      // amount, which is what the undo entry already does.
      [
        22,
        23,
        26
      ].forEach((typeId) => {
        expect(component.allowAdjustTransaction(transaction(typeId))).toBe(false);
      });
    });

    it('offers no adjust action on a disbursement, a waived charge or a discount fee', () => {
      const component = createComponent(true);

      [
        1,
        9,
        44
      ].forEach((typeId) => {
        expect(component.allowAdjustTransaction(transaction(typeId))).toBe(false);
      });
    });

    it('offers no adjust action on an already reversed repayment', () => {
      const component = createComponent(true);

      expect(component.allowAdjustTransaction(transaction(2, { reversed: true }))).toBe(false);
    });

    it('gates the adjust action with the Working Capital permission', () => {
      expect(createComponent(true).adjustPermission).toBe('ADJUST_WORKINGCAPITALLOAN');
      expect(createComponent(false).adjustPermission).toBe('ADJUST_LOAN');
    });

    it('opens the adjust form with the product type the resolvers read', () => {
      const component = createComponent(true);

      component.adjustTransaction(transaction(2), { stopPropagation: jest.fn() } as unknown as MouseEvent);

      expect(routerStub.navigate).toHaveBeenCalledWith(
        [
          77,
          'edit'
        ],
        expect.objectContaining({ queryParams: { productType: 'workingCapital' } })
      );
    });
  });
});
