/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { MakeRepaymentComponent } from './make-repayment.component';

/**
 * This screen is shared by term, progressive and Working Capital loans, so the tests that matter most here are the
 * ones proving the Working Capital re-quote stays off the other two product types entirely.
 */
describe('MakeRepaymentComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  const template = {
    actionName: 'Make Repayment',
    expectedAmount: 8000,
    currency: { code: 'EUR', displaySymbol: '€' },
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }],
    classificationOptions: [{ id: 7, name: 'D00' }]
  };

  let loansServiceStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, without rendering the template.
   * @param isWorkingCapital Which product type the screen is serving.
   * @param dataObject The resolved template.
   * @returns The initialised component.
   */
  function createComponent(isWorkingCapital: boolean, dataObject: any = template): MakeRepaymentComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { loanId: '1' } } } },
        { provide: Router, useValue: { navigate: jest.fn() } },
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
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date)
          }
        },
        { provide: PenaltyManagementService, useValue: { loadPenalties: jest.fn(() => of([])) } },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new MakeRepaymentComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getWorkingCapitalLoanTransactionTemplate: jest.fn().mockReturnValue(of({ ...template, expectedAmount: 9000 }))
    };
  });

  it('re-quotes the amount for Working Capital when the transaction date changes', () => {
    const component = createComponent(true);

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledWith(
      '1',
      'repayment',
      '5 January 2026'
    );
    expect(component.repaymentLoanForm.value.transactionAmount).toBe(9000);
    expect(component.isQuoteLoading).toBe(false);
  });

  it('issues no template request for a term or progressive loan, whatever the date is set to', () => {
    // The re-quote is gated on the product type rather than on the shape of the payload, so the two other product
    // types this screen serves keep issuing no request at all.
    const component = createComponent(false);

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).not.toHaveBeenCalled();
  });

  it('blocks submitting while a re-quote is in flight, so a stale amount cannot be posted', () => {
    const component = createComponent(true);
    const inFlight = new Subject<any>();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(inFlight.asObservable());

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(component.isQuoteLoading).toBe(true);
    component.submit();
    expect(component.isSubmitting).toBe(false);

    inFlight.next({ ...template, expectedAmount: 9000 });
    expect(component.isQuoteLoading).toBe(false);
  });

  it('keeps the previous amount when a re-quote fails', () => {
    const component = createComponent(true);
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(component.repaymentLoanForm.value.transactionAmount).toBe(8000);
    expect(component.isQuoteLoading).toBe(false);
  });

  it('refuses to submit an amount quoted for a different date after a failed re-quote', () => {
    const component = createComponent(true);
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));
    component.submit();

    expect(component.isQuoteStale).toBe(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('retries the same date after a failed re-quote instead of swallowing it as a duplicate', () => {
    const component = createComponent(true);
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));
    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledTimes(2);
    expect(component.isQuoteStale).toBe(false);
    expect(component.repaymentLoanForm.value.transactionAmount).toBe(9000);
  });

  it('quotes the goodwill credit template rather than the repayment one for a goodwill credit', () => {
    // Working Capital serves a goodwill credit from its own template; asking for the repayment one would prefill an
    // amount from a different command.
    const component = createComponent(true, { ...template, actionName: 'Goodwill Credit' });

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledWith(
      '1',
      'goodwillCredit',
      '5 January 2026'
    );
    expect(component).toBeTruthy();
  });

  it('quotes the repayment template for a payout refund, which has no template of its own', () => {
    const component = createComponent(true, { ...template, actionName: 'Payout Refund' });

    component.repaymentLoanForm.controls['transactionDate'].setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledWith(
      '1',
      'repayment',
      '5 January 2026'
    );
  });
});
