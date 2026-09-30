/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { WorkingCapitalPrepayLoanComponent } from './prepay-loan.component';

describe('WorkingCapitalPrepayLoanComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  /**
   * The action route as the router activates it: `:loanId/actions/:action`, the
   * route the base component walks up to when it navigates to a loan tab.
   */
  function actionRouteStub(): any {
    const loansContainerRoute: any = {};
    const route: any = {
      routeConfig: { path: ':loanId/actions/:action' },
      parent: loansContainerRoute,
      snapshot: { params: { loanId: '1' } }
    };
    route.pathFromRoot = [
      loansContainerRoute,
      route
    ];
    return route;
  }

  /** The payoff quote as the prepayment template returns it, options included. */
  const prepayFormData = {
    wcLoanId: 1,
    currency: { code: 'EUR', displaySymbol: '€' },
    transactionDate: '10 January 2026',
    expectedAmount: 9055,
    principalPortion: 9000,
    feeChargesPortion: 35,
    penaltyChargesPortion: 20,
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }],
    classificationOptions: [{ id: 7, name: 'D00' }]
  };

  let loansServiceStub: any;
  let routerStub: any;

  /** The quote the server returns for an earlier date, once the later charge drops out of scope. */
  const requotedTemplate = {
    ...prepayFormData,
    expectedAmount: 9000,
    principalPortion: 9000,
    feeChargesPortion: 0,
    penaltyChargesPortion: 0
  };

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the tests exercise the real form and
   * payload logic without rendering the template.
   * @param dataObject The resolved prepayment template; defaults to a quote with a full breakdown and options.
   * @returns The initialised component, ready for its form to be patched and submitted.
   */
  function createComponent(dataObject: any = prepayFormData): WorkingCapitalPrepayLoanComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: actionRouteStub()
        },
        { provide: Router, useValue: routerStub },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: { isLoanProduct: false, isWorkingCapital: true, productType: { value: 'workingCapital' } }
        },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        // A real formatter, not a constant: a constant would make every date look identical to distinctUntilChanged,
        // and the re-quote tests below would pass without a single request being made.
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date)
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new WorkingCapitalPrepayLoanComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      applyWorkingCapitalLoanActionCommand: jest.fn().mockReturnValue(of({})),
      getWorkingCapitalLoanTransactionTemplate: jest.fn().mockReturnValue(of(requotedTemplate))
    };
    routerStub = { navigate: jest.fn() };
  });

  it('prefills the transaction amount with the quoted payoff and exposes its breakdown', () => {
    const component = createComponent();

    expect(component.prepayLoanForm.controls.transactionAmount.value).toBe(9055);
    expect(component.payoffAmount).toBe(9055);
    expect(component.principalPortion).toBe(9000);
    expect(component.feeChargesPortion).toBe(35);
    expect(component.penaltyChargesPortion).toBe(20);
    expect(component.prepayLoanForm.controls.transactionDate.value).toBe(businessDate);
  });

  it('carries the dropdown options and currency straight from the prepayment template', () => {
    const component = createComponent();

    expect(component.paymentTypes).toEqual([{ id: 1, name: 'Money Transfer' }]);
    expect(component.classificationOptions).toEqual([{ id: 7, name: 'D00' }]);
    expect(component.currency).toEqual({ code: 'EUR', displaySymbol: '€' });
  });

  it('posts the prepayment through the repayment command', () => {
    const component = createComponent();

    component.submit();

    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).toHaveBeenCalledTimes(1);
    const [
      loanId,
      payload,
      command
    ] = loansServiceStub.applyWorkingCapitalLoanActionCommand.mock.calls[0];
    expect(loanId).toBe('1');
    expect(command).toBe('repayment');
    expect(payload).toEqual({
      transactionDate: '10 January 2026',
      transactionAmount: 9055,
      locale: 'en',
      dateFormat: 'dd MMMM yyyy'
    });
  });

  it('omits the optional fields the user left blank', () => {
    const component = createComponent();

    component.submit();

    const [
      ,
      payload
    ] = loansServiceStub.applyWorkingCapitalLoanActionCommand.mock.calls[0];
    expect(payload).not.toHaveProperty('classificationId');
    expect(payload).not.toHaveProperty('note');
    expect(payload).not.toHaveProperty('externalId');
    expect(payload).not.toHaveProperty('paymentDetails');
  });

  it('nests the payment type and payment details the way Working Capital expects', () => {
    const component = createComponent();
    component.prepayLoanForm.patchValue({
      paymentTypeId: 1,
      classificationId: 7,
      note: '  paid in full  ',
      externalId: ' prepay-ext-1 '
    });
    component.togglePaymentDetails();
    component.prepayLoanForm.patchValue({ accountNumber: '12345', checkNumber: '  ' });

    component.submit();

    const [
      ,
      payload
    ] = loansServiceStub.applyWorkingCapitalLoanActionCommand.mock.calls[0];
    expect(payload.classificationId).toBe(7);
    expect(payload.note).toBe('paid in full');
    expect(payload.externalId).toBe('prepay-ext-1');
    expect(payload.paymentDetails).toEqual({ paymentTypeId: 1, accountNumber: '12345' });
  });

  it('navigates to the transactions tab once the prepayment is accepted', () => {
    const component = createComponent();

    component.submit();

    expect(routerStub.navigate).toHaveBeenCalledTimes(1);
    expect(routerStub.navigate.mock.calls[0][0]).toEqual([
      '1',
      'transactions'
    ]);
  });

  // A settled loan is Closed (obligations met) or Overpaid, and neither status
  // offers Prepay Loan, so the screen is not reachable with a zero payoff. The
  // amount validator is what stops a zero being posted if it ever were.
  it('never posts a zero amount, which the repayment endpoint would reject', () => {
    const component = createComponent({
      ...prepayFormData,
      expectedAmount: 0,
      principalPortion: 0,
      feeChargesPortion: 0,
      penaltyChargesPortion: 0
    });

    expect(component.prepayLoanForm.valid).toBe(false);
    component.submit();
    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).not.toHaveBeenCalled();
  });

  it('does not submit twice while a request is in flight', () => {
    const component = createComponent();

    component.submit();
    component.submit();

    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).toHaveBeenCalledTimes(1);
  });

  it('falls back to zero when the template omits the payoff figures', () => {
    const component = createComponent({ currency: { code: 'EUR' } });

    expect(component.payoffAmount).toBe(0);
    expect(component.principalPortion).toBe(0);
    expect(component.paymentTypes).toEqual([]);
    expect(component.classificationOptions).toEqual([]);
  });

  it('re-quotes the payoff when the transaction date changes, patching the breakdown with the total', () => {
    const component = createComponent();

    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledWith(
      '1',
      'prepayLoan',
      '5 January 2026'
    );
    expect(component.prepayLoanForm.controls.transactionAmount.value).toBe(9000);
    // A fresh total beside a stale breakdown would be worse than either alone.
    expect(component.principalPortion).toBe(9000);
    expect(component.feeChargesPortion).toBe(0);
    expect(component.penaltyChargesPortion).toBe(0);
    expect(component.isQuoteLoading).toBe(false);
    expect(component.isQuoteStale).toBe(false);
  });

  it('keeps the last good quote when a re-quote fails, rather than blanking the amount', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(component.prepayLoanForm.controls.transactionAmount.value).toBe(9055);
    expect(component.isQuoteLoading).toBe(false);
  });

  it('refuses to submit a payoff quoted for a different date after a failed re-quote', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));
    component.submit();

    // 9055 was the payoff on 10 January; posting it against 5 January would not close the loan.
    expect(component.isQuoteStale).toBe(true);
    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).not.toHaveBeenCalled();
  });

  it('retries the same date after a failed re-quote instead of swallowing it as a duplicate', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));
    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledTimes(2);
    expect(component.isQuoteStale).toBe(false);
    expect(component.prepayLoanForm.controls.transactionAmount.value).toBe(9000);

    component.submit();
    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).toHaveBeenCalled();
  });

  it('takes the last response when the date is changed repeatedly, not whichever returns first', () => {
    const component = createComponent();
    const slow = new Subject<any>();
    const fast = new Subject<any>();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate
      .mockReturnValueOnce(slow.asObservable())
      .mockReturnValueOnce(fast.asObservable());

    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 5));
    component.prepayLoanForm.controls.transactionDate.setValue(new Date(2026, 0, 7));
    fast.next({ ...requotedTemplate, expectedAmount: 7777, principalPortion: 7777 });
    slow.next({ ...requotedTemplate, expectedAmount: 1111, principalPortion: 1111 });

    // switchMap unsubscribed from the first request, so its late answer is discarded.
    expect(component.prepayLoanForm.controls.transactionAmount.value).toBe(7777);
  });

  it('does not re-quote on init, because the resolver already fetched the opening quote', () => {
    createComponent();

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).not.toHaveBeenCalled();
  });
});
