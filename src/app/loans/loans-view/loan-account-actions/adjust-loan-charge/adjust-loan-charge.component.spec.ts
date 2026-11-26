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
import { OrganizationService } from 'app/organization/organization.service';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { AdjustLoanChargeComponent } from './adjust-loan-charge.component';

describe('AdjustLoanChargeComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  let loansServiceStub: any;
  let cdr: { markForCheck: jest.Mock };

  function createComponent(): AdjustLoanChargeComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ChangeDetectorRef, useValue: cdr },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { loanId: '1', id: '5' } },
            data: of({
              loansAccountCharge: { amount: 100 },
              loanDetailsData: { currency: { code: 'USD', displaySymbol: '$', decimalPlaces: 2 } }
            }),
            pathFromRoot: []
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: OrganizationService, useValue: { getPaymentTypes: jest.fn(() => of([])) } },
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
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new AdjustLoanChargeComponent());
    component.ngOnInit();
    return component;
  }

  beforeEach(() => {
    loansServiceStub = {
      executeLoansAccountChargesCommand: jest.fn(() => of({}))
    };
    cdr = { markForCheck: jest.fn() };
  });

  it('submits the adjustment payload and navigates to the charges tab', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanChargesView').mockImplementation(() => undefined);

    component.submit();

    expect(loansServiceStub.executeLoansAccountChargesCommand).toHaveBeenCalledWith(
      'loans',
      '1',
      'adjustment',
      {
        amount: 100,
        externalId: '',
        paymentTypeId: '',
        note: '',
        locale: 'en'
      },
      '5'
    );
    expect(gotoSpy).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('keeps the submit state active while the request is pending and blocks duplicates', () => {
    const component = createComponent();
    const inFlight = new Subject<any>();
    loansServiceStub.executeLoansAccountChargesCommand.mockReturnValue(inFlight.asObservable());

    component.submit();

    expect(component.isSubmitting).toBe(true);
    component.submit();
    expect(loansServiceStub.executeLoansAccountChargesCommand).toHaveBeenCalledTimes(1);

    inFlight.next({});
    expect(component.isSubmitting).toBe(true);

    inFlight.complete();
    expect(component.isSubmitting).toBe(false);
  });

  it('resets the submit state for the global notification after a failed request without navigating', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanChargesView').mockImplementation(() => undefined);
    loansServiceStub.executeLoansAccountChargesCommand.mockReturnValue(throwError(() => new Error('boom')));

    component.submit();

    expect(component.isSubmitting).toBe(false);
    expect(cdr.markForCheck).toHaveBeenCalledTimes(2);
    expect(gotoSpy).not.toHaveBeenCalled();
  });

  it('allows retrying after a failed request', () => {
    const component = createComponent();
    const gotoSpy = jest.spyOn(component, 'gotoLoanChargesView').mockImplementation(() => undefined);
    loansServiceStub.executeLoansAccountChargesCommand
      .mockReturnValueOnce(throwError(() => new Error('boom')))
      .mockReturnValueOnce(of({}));

    component.submit();
    expect(component.isSubmitting).toBe(false);

    component.submit();

    expect(loansServiceStub.executeLoansAccountChargesCommand).toHaveBeenCalledTimes(2);
    expect(gotoSpy).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });

  it('does not call the API when the form is invalid', () => {
    const component = createComponent();
    component.adjustLoanChargeForm.controls['amount'].setValue('');

    component.submit();

    expect(loansServiceStub.executeLoansAccountChargesCommand).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });
});
