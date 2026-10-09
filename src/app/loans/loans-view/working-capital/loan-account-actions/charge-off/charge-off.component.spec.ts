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
import { of, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { WorkingCapitalChargeOffComponent } from './charge-off.component';

describe('WorkingCapitalChargeOffComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  /** The charge-off template as the transactions endpoint returns it, amount in `expectedAmount`. */
  const chargeOffTemplate = {
    expectedAmount: 8400,
    chargeOffDate: '10 January 2026',
    currency: { code: 'EUR', displaySymbol: '€' },
    chargeOffReasonOptions: [{ id: 3, name: 'Fraud' }]
  };

  let loansServiceStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the tests exercise the real form without
   * rendering the template.
   * @param dataObject The resolved charge-off template.
   * @returns The initialised component.
   */
  function createComponent(dataObject: any = chargeOffTemplate): WorkingCapitalChargeOffComponent {
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
          useValue: { isLoanProduct: false, isWorkingCapital: true, productType: { value: 'workingCapital' } }
        },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date),
            parseDate: (value: any) => (value instanceof Date ? value : businessDate)
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new WorkingCapitalChargeOffComponent());
    component.dataObject = dataObject;
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      getWorkingCapitalLoanTransactionTemplate: jest
        .fn()
        .mockReturnValue(of({ ...chargeOffTemplate, expectedAmount: 8000 })),
      applyWorkingCapitalLoanActionCommand: jest.fn().mockReturnValue(of({}))
    };
  });

  it('reads the amount to charge off from expectedAmount, the field the endpoint actually returns', () => {
    // Every command served by the transactions template reports its amount in expectedAmount; reading anything else
    // here silently displays zero rather than failing.
    const component = createComponent();

    expect(component.chargeOffAmount).toBe(8400);
    expect(component.currency).toEqual({ code: 'EUR', displaySymbol: '€' });
  });

  it('re-quotes the outstanding balance when the charge-off date changes', () => {
    const component = createComponent();

    component.chargeOffForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledWith(
      '1',
      'chargeOff',
      '5 January 2026'
    );
    expect(component.chargeOffAmount).toBe(8000);
    expect(component.isQuoteLoading).toBe(false);
  });

  it('keeps the last good amount when a re-quote fails', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.chargeOffForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(component.chargeOffAmount).toBe(8400);
    expect(component.isQuoteLoading).toBe(false);
  });

  it('refuses to charge off an amount quoted for a different date after a failed re-quote', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValue(throwError(() => new Error('boom')));

    component.chargeOffForm.controls.transactionDate.setValue(new Date(2026, 0, 5));
    component.submit();

    expect(component.isQuoteStale).toBe(true);
    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).not.toHaveBeenCalled();
  });

  it('retries the same date after a failed re-quote instead of swallowing it as a duplicate', () => {
    const component = createComponent();
    loansServiceStub.getWorkingCapitalLoanTransactionTemplate.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.chargeOffForm.controls.transactionDate.setValue(new Date(2026, 0, 5));
    component.chargeOffForm.controls.transactionDate.setValue(new Date(2026, 0, 5));

    expect(loansServiceStub.getWorkingCapitalLoanTransactionTemplate).toHaveBeenCalledTimes(2);
    expect(component.isQuoteStale).toBe(false);
    expect(component.chargeOffAmount).toBe(8000);
  });

  it('defaults the form date to the template chargeOffDate, which stays the business date', () => {
    const component = createComponent();

    expect(component.chargeOffForm.controls.transactionDate.value).toEqual(businessDate);
  });
});
