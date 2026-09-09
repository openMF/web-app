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
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { WorkingCapitalPrepayLoanComponent } from './prepay-loan.component';

describe('WorkingCapitalPrepayLoanComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  /** The payoff quote as the prepayment template returns it, options included. */
  const prepayFormData = {
    wcLoanId: 1,
    currency: { code: 'EUR', displaySymbol: '€' },
    transactionDate: '10 January 2026',
    transactionAmount: 9055,
    principalPortion: 9000,
    feeChargesPortion: 35,
    penaltyChargesPortion: 20,
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }],
    classificationOptions: [{ id: 7, name: 'D00' }]
  };

  let loansServiceStub: any;
  let routerStub: any;

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
          useValue: { snapshot: { params: { loanId: '1' } } }
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
        { provide: Dates, useValue: { formatDate: () => '10 January 2026' } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new WorkingCapitalPrepayLoanComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      applyWorkingCapitalLoanActionCommand: jest.fn().mockReturnValue(of({}))
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
    expect(routerStub.navigate.mock.calls[0][0]).toEqual(['../../transactions']);
  });

  // A settled loan is Closed (obligations met) or Overpaid, and neither status
  // offers Prepay Loan, so the screen is not reachable with a zero payoff. The
  // amount validator is what stops a zero being posted if it ever were.
  it('never posts a zero amount, which the repayment endpoint would reject', () => {
    const component = createComponent({
      ...prepayFormData,
      transactionAmount: 0,
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
});
