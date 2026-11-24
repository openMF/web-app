/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { LoansAccountCloseComponent } from './loans-account-close.component';

describe('LoansAccountCloseComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  let loansServiceStub: any;
  let cdr: { markForCheck: jest.Mock };

  function createComponent(): LoansAccountCloseComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ChangeDetectorRef, useValue: cdr },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { loanId: '1' } },
            data: of({}),
            pathFromRoot: []
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: true,
            isWorkingCapital: false,
            loanAccountPath: 'loans',
            productType: { value: 'loan' }
          }
        },
        {
          provide: SettingsService,
          useValue: {
            businessDate,
            maxAllowedDate: new Date(2100, 0, 1),
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en' }
          }
        },
        {
          provide: Dates,
          useValue: {
            parseDate: jest.fn(() => new Date(2026, 0, 10)),
            formatDate: (date: Date) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date)
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new LoansAccountCloseComponent());
    component.dataObject = { date: '10 January 2026' };
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      submitLoanActionButton: jest.fn(() => of({}))
    };
    cdr = { markForCheck: jest.fn() };
  });

  it('submits the close payload and navigates to the loan view', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanDefaultView').mockImplementation(() => undefined);
    component.closeLoanForm.controls['note'].setValue('Closed by test');

    component.submit();

    expect(loansServiceStub.submitLoanActionButton).toHaveBeenCalledWith(
      '1',
      {
        transactionDate: '10 January 2026',
        note: 'Closed by test',
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      },
      'close'
    );
    expect(gotoSpy).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('keeps the submit state active while the request is pending and blocks duplicates', () => {
    const component = createComponent();
    const inFlight = new Subject<any>();
    loansServiceStub.submitLoanActionButton.mockReturnValue(inFlight.asObservable());

    component.submit();

    expect(component.isSubmitting).toBe(true);
    component.submit();
    expect(loansServiceStub.submitLoanActionButton).toHaveBeenCalledTimes(1);

    inFlight.next({});
    expect(component.isSubmitting).toBe(true);

    inFlight.complete();
    expect(component.isSubmitting).toBe(false);
  });

  it('resets the submit state for the global notification after a failed request without navigating', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanDefaultView').mockImplementation(() => undefined);
    loansServiceStub.submitLoanActionButton.mockReturnValue(throwError(() => new Error('boom')));

    component.submit();

    expect(component.isSubmitting).toBe(false);
    expect(cdr.markForCheck).toHaveBeenCalledTimes(2);
    expect(gotoSpy).not.toHaveBeenCalled();
  });

  it('allows retrying after a failed request', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanDefaultView').mockImplementation(() => undefined);
    loansServiceStub.submitLoanActionButton
      .mockReturnValueOnce(throwError(() => new Error('boom')))
      .mockReturnValueOnce(of({}));

    component.submit();
    expect(component.isSubmitting).toBe(false);

    component.submit();

    expect(loansServiceStub.submitLoanActionButton).toHaveBeenCalledTimes(2);
    expect(gotoSpy).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('does not call the API when the form is invalid', () => {
    const component = createComponent();
    component.closeLoanForm.controls['transactionDate'].setValue(null);

    component.submit();

    expect(loansServiceStub.submitLoanActionButton).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });
});
