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
import { of, Subject } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { PrepayLoanComponent } from './prepay-loan.component';

describe.each([
  { actionName: 'Contract Termination', command: 'contractTermination' },
  { actionName: 'Loan Withdrawal', command: 'loanWithdrawal' }
])('PrepayLoanComponent - $actionName', ({ actionName, command: earlyTerminationCommand }) => {
  const businessDate = new Date(2024, 2, 1);
  const maxFutureDate = new Date(2100, 0, 1);

  /** The payoff quote the early termination template returns for the business date. */
  const earlyTerminationTemplate = {
    actionName,
    currency: { code: 'EUR', displaySymbol: '€' },
    amount: 84.06,
    principalPortion: 83.57,
    interestPortion: 0.49,
    feeChargesPortion: 0,
    penaltyChargesPortion: 0
  };

  /** The quote for 31 March 2024: same principal, interest accrued to the later date. */
  const futureDatedTemplate = {
    ...earlyTerminationTemplate,
    amount: 84.53,
    interestPortion: 0.96
  };

  let loansServiceStub: any;
  let routerStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the tests exercise the real form,
   * date bounds and payload logic without rendering the template.
   * @param dataObject The resolved action template; defaults to the early termination quote.
   * @returns The initialised component.
   */
  function createComponent(dataObject: any = earlyTerminationTemplate): PrepayLoanComponent {
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
          useValue: { isLoanProduct: true, isWorkingCapital: false, productType: { value: 'loan' } }
        },
        {
          provide: SettingsService,
          useValue: { businessDate, maxFutureDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        // Real date helpers, not constants: the bound and the re-quote below both depend on actual date maths.
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date, _format: string) => (date instanceof Date ? `${date.getDate()} ${[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December'
                    ][date.getMonth()]} ${date.getFullYear()}` : String(date)),
            parseDate: (value: any) =>
              value instanceof Array ? new Date(value[0], value[1] - 1, value[2]) : new Date(value),
            isBefore: (date1: Date, date2: Date) =>
              Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()) <
              Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new PrepayLoanComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getLoanAccountDetails: jest.fn().mockReturnValue(
        of({ timeline: { actualMaturityDate: [
              2024,
              4,
              1
            ] } })
      ),
      getLoanEarlyTerminationTemplate: jest.fn().mockReturnValue(of(futureDatedTemplate)),
      getLoanPrepayLoanActionTemplate: jest.fn().mockReturnValue(of(earlyTerminationTemplate)),
      loanActionButtons: jest.fn().mockReturnValue(of({}))
    };
    routerStub = { navigate: jest.fn() };
  });

  it('defaults the termination date to the business date', () => {
    const component = createComponent();

    expect(component.earlyTerminationCommand).toBe(earlyTerminationCommand);
    expect(component.isEarlyTermination).toBe(true);
    expect(component.prepayLoanForm.controls.transactionDate.value).toBe(businessDate);
    expect(component.minDate).toBe(businessDate);
  });

  it('gates submit with the permission of the command it posts', () => {
    expect(createComponent().submitPermission).toBe(
      earlyTerminationCommand === 'loanWithdrawal' ? 'LOAN_WITHDRAWAL_LOAN' : 'CONTRACT_TERMINATION_LOAN'
    );
    expect(createComponent({ ...earlyTerminationTemplate, actionName: 'Prepay Loan' }).submitPermission).toBe(
      'REPAYMENT_LOAN'
    );
  });

  it('bounds the picker one day before the maturity date', () => {
    const component = createComponent();

    expect(loansServiceStub.getLoanAccountDetails).toHaveBeenCalledWith('1');
    expect(component.maturityDate).toEqual(new Date(2024, 3, 1));
    expect(component.maxDate).toEqual(new Date(2024, 2, 31));
  });

  it('keeps the business date selectable when the loan has already matured', () => {
    loansServiceStub.getLoanAccountDetails.mockReturnValue(
      of({ timeline: { actualMaturityDate: [
            2024,
            1,
            1
          ] } })
    );

    const component = createComponent();

    expect(component.maxDate).toBe(businessDate);
  });

  it('leaves the date unbounded when the loan has no maturity date', () => {
    loansServiceStub.getLoanAccountDetails.mockReturnValue(of({ timeline: {} }));

    const component = createComponent();

    expect(component.maturityDate).toBeNull();
    expect(component.maxDate).toBe(maxFutureDate);
  });

  it('re-quotes the payoff when the termination date changes', () => {
    const component = createComponent();

    component.prepayLoanForm.patchValue({ transactionDate: new Date(2024, 2, 31) });

    expect(loansServiceStub.getLoanEarlyTerminationTemplate).toHaveBeenCalledWith(
      '1',
      earlyTerminationCommand,
      '31 March 2024'
    );
    expect(component.prepayData.amount).toBe(84.53);
    expect(component.prepayData.interestPortion).toBe(0.96);
  });

  it('does not re-quote when the typed date cannot be read', () => {
    const component = createComponent();
    loansServiceStub.getLoanEarlyTerminationTemplate.mockClear();

    component.prepayLoanForm.patchValue({ transactionDate: null });

    expect(loansServiceStub.getLoanEarlyTerminationTemplate).not.toHaveBeenCalled();
    expect(component.prepayData.interestPortion).toBe(0.49);
  });

  it('shows the latest date quote even when an earlier response arrives last', () => {
    const firstQuote = new Subject<any>();
    const secondQuote = new Subject<any>();
    loansServiceStub.getLoanEarlyTerminationTemplate = jest
      .fn()
      .mockReturnValueOnce(firstQuote)
      .mockReturnValueOnce(secondQuote);
    const component = createComponent();

    component.prepayLoanForm.patchValue({ transactionDate: new Date(2024, 2, 20) });
    component.prepayLoanForm.patchValue({ transactionDate: new Date(2024, 2, 31) });
    secondQuote.next(futureDatedTemplate);
    firstQuote.next({ ...earlyTerminationTemplate, amount: 84.2, interestPortion: 0.63 });

    expect(component.prepayData.amount).toBe(84.53);
    expect(component.prepayData.interestPortion).toBe(0.96);
  });

  it('posts the termination date with the locale and date format', () => {
    const component = createComponent();
    component.prepayLoanForm.patchValue({
      transactionDate: new Date(2024, 2, 31),
      externalId: 'ct-ext-1',
      note: 'settled early'
    });

    component.submit();

    expect(loansServiceStub.loanActionButtons).toHaveBeenCalledTimes(1);
    const [
      loanId,
      command,
      payload
    ] = loansServiceStub.loanActionButtons.mock.calls[0];
    expect(loanId).toBe('1');
    expect(command).toBe(earlyTerminationCommand);
    expect(payload).toEqual({
      transactionDate: '31 March 2024',
      externalId: 'ct-ext-1',
      note: 'settled early',
      locale: 'en',
      dateFormat: 'dd MMMM yyyy'
    });
    expect(routerStub.navigate).toHaveBeenCalledTimes(1);
  });

  it('leaves the prepay flow on the business date bound and asks for no loan details', () => {
    const component = createComponent({ ...earlyTerminationTemplate, actionName: 'Prepay Loan' });

    expect(component.earlyTerminationCommand).toBeNull();
    expect(component.isEarlyTermination).toBe(false);
    expect(component.maxDate).toBe(businessDate);
    expect(loansServiceStub.getLoanAccountDetails).not.toHaveBeenCalled();
    expect(loansServiceStub.getLoanEarlyTerminationTemplate).not.toHaveBeenCalled();
  });
});
