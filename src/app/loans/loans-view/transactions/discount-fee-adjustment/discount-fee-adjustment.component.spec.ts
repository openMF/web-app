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
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { DiscountFeeAdjustmentComponent } from './discount-fee-adjustment.component';

describe('DiscountFeeAdjustmentComponent', () => {
  const businessDate = new Date(2026, 5, 10);

  /** A Working Capital discount fee as the transaction endpoint returns it. */
  const discountFeeTransaction = {
    id: 1213,
    type: { id: 44, code: 'loanTransactionType.discountFee', value: 'Discount Fee' },
    transactionDate: [
      2026,
      1,
      1
    ],
    transactionAmount: 1000,
    reversed: false,
    currency: { code: 'EUR', displaySymbol: '€' }
  };

  /** The template as the resolver assembles it from its three calls. */
  const resolvedTemplate = {
    transaction: discountFeeTransaction,
    currency: { code: 'EUR', displaySymbol: '€' },
    classificationOptions: [{ id: 5, name: 'Commercial' }],
    paymentTypeOptions: [{ id: 1, name: 'Money Transfer' }]
  };

  let loansServiceStub: any;
  let routerStub: any;

  /**
   * Builds the component against stubbed collaborators and runs ngOnInit, so the
   * tests exercise the real form and payload logic without rendering the template.
   * @param template The resolved discount fee adjustment template.
   * @param loanDetails The loan as the parent route resolves it.
   * @returns The initialised component.
   */
  function createComponent(
    template: any = resolvedTemplate,
    loanDetails: any = { status: { active: true }, discountFee: 1000 }
  ): DiscountFeeAdjustmentComponent {
    TestBed.resetTestingModule();
    // The component sits on `:loanId/transactions/:id/discount-fee-adjustment`,
    // one level below the route that declares the loan id, which is what the
    // base component walks up to when it navigates to a loan tab.
    const loansContainerRoute: any = {};
    const transactionRoute: any = {
      data: of({ loanDetailsAssociationData: loanDetails }),
      routeConfig: { path: ':loanId/transactions/:id' },
      parent: loansContainerRoute,
      snapshot: { params: { loanId: '1', id: '1213' } }
    };
    const adjustmentRoute: any = {
      data: of({ discountFeeAdjustmentTemplate: template }),
      routeConfig: { path: 'discount-fee-adjustment' },
      parent: transactionRoute,
      snapshot: { params: { loanId: '1', id: '1213' } }
    };
    adjustmentRoute.pathFromRoot = [
      loansContainerRoute,
      transactionRoute,
      adjustmentRoute
    ];
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: adjustmentRoute },
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
        { provide: Dates, useValue: { formatDate: () => '01 January 2026', parseDate: () => new Date(2026, 0, 1) } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new DiscountFeeAdjustmentComponent());
    component.ngOnInit();
    return component;
  }

  /** Returns the request body handed to the Working Capital command by the last submit. */
  function submittedPayload(): any {
    return loansServiceStub.applyWorkingCapitalLoanActionCommand.mock.calls[0][1];
  }

  beforeEach(() => {
    loansServiceStub = {
      applyWorkingCapitalLoanActionCommand: jest.fn().mockReturnValue(of({ resourceId: 1300 }))
    };
    routerStub = { navigate: jest.fn() };
  });

  it('defaults the date to the discount fee date and bounds it by that date', () => {
    const component = createComponent();

    expect(component.discountFeeAdjustmentForm.controls.transactionDate.value).toEqual(new Date(2026, 0, 1));
    expect(component.minDate).toEqual(new Date(2026, 0, 1));
    expect(component.maxDate).toBe(businessDate);
  });

  it('caps the amount at the discount still available rather than the original fee', () => {
    const component = createComponent(resolvedTemplate, { status: { active: true }, discountFee: 400 });

    component.discountFeeAdjustmentForm.controls.transactionAmount.setValue(401);
    expect(component.discountFeeAdjustmentForm.controls.transactionAmount.valid).toBe(false);

    component.discountFeeAdjustmentForm.controls.transactionAmount.setValue(400);
    expect(component.discountFeeAdjustmentForm.controls.transactionAmount.valid).toBe(true);
  });

  it('posts the discount fee adjustment command against the discount fee transaction', () => {
    const component = createComponent();
    component.discountFeeAdjustmentForm.patchValue({ transactionAmount: 250 });

    component.submit();

    expect(loansServiceStub.applyWorkingCapitalLoanActionCommand).toHaveBeenCalledWith(
      '1',
      expect.any(Object),
      'discountFeeAdjustment',
      '1213'
    );
  });

  it('nests the payment details and leaves the related resource id out of the body', () => {
    const component = createComponent();
    component.discountFeeAdjustmentForm.patchValue({
      transactionAmount: 250,
      classificationId: 5,
      externalId: ' adj-1 ',
      note: ' Fee overstated ',
      paymentTypeId: 1,
      receiptNumber: ' R-1 '
    });

    component.submit();

    const payload = submittedPayload();
    expect(payload.transactionAmount).toBe(250);
    expect(payload.classificationId).toBe(5);
    expect(payload.externalId).toBe('adj-1');
    expect(payload.note).toBe('Fee overstated');
    expect(payload.paymentDetails).toEqual({ paymentTypeId: 1, receiptNumber: 'R-1' });
    // The transaction is named in the URL, and the backend rejects a body that
    // carries it as well.
    expect(payload.relatedResourceId).toBeUndefined();
    // Nothing is reversed, so there is no reversal to name.
    expect(payload.reversalExternalId).toBeUndefined();
  });

  it('omits the payment details entirely when none are filled in', () => {
    const component = createComponent();
    component.discountFeeAdjustmentForm.patchValue({ transactionAmount: 250 });

    component.submit();

    expect(submittedPayload().paymentDetails).toBeUndefined();
  });

  it('surfaces the backend message when the adjustment is rejected', () => {
    loansServiceStub.applyWorkingCapitalLoanActionCommand.mockReturnValue(
      throwError(() => ({ error: { errors: [{ defaultUserMessage: 'Amount cannot be more than discount fee' }] } }))
    );
    const component = createComponent();
    component.discountFeeAdjustmentForm.patchValue({ transactionAmount: 250 });

    component.submit();

    expect(component.submitErrorMessage).toBe('Amount cannot be more than discount fee');
    expect(component.isSubmitting).toBe(false);
  });

  it('leaves for the transactions tab instead of opening on a loan that is no longer active', () => {
    const component = createComponent(resolvedTemplate, { status: { active: false }, discountFee: 1000 });

    expect(component.discountFeeAdjustmentForm).toBeUndefined();
    expect(routerStub.navigate).toHaveBeenCalled();
  });

  it('leaves for the transactions tab once the discount pool is exhausted', () => {
    const component = createComponent(resolvedTemplate, { status: { active: true }, discountFee: 0 });

    expect(component.discountFeeAdjustmentForm).toBeUndefined();
    expect(routerStub.navigate).toHaveBeenCalled();
  });
});
