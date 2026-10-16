/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ProcessingStrategyService } from '../../services/processing-strategy.service';
import { LoanProductService } from '../../services/loan-product.service';
import { LoanProductTermsStepComponent } from './loan-product-terms-step.component';

describe('LoanProductTermsStepComponent', () => {
  function baseTemplate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      minPrincipal: 1000,
      principal: 10000,
      maxPrincipal: 50000,
      minNumberOfRepayments: 1,
      numberOfRepayments: 12,
      maxNumberOfRepayments: 36,
      isLinkedToFloatingInterestRates: false,
      minInterestRatePerPeriod: 0,
      interestRatePerPeriod: 0,
      maxInterestRatePerPeriod: 0,
      floatingRateId: null,
      interestRateDifferential: null,
      isFloatingInterestRateCalculationAllowed: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      minDifferentialLendingRate: null,
      defaultDifferentialLendingRate: null,
      maxDifferentialLendingRate: null,
      useBorrowerCycle: false,
      repaymentEvery: 1,
      minimumDaysBetweenDisbursalAndFirstRepayment: null,
      interestRecognitionOnDisbursementDate: false,
      interestRateFrequencyType: { id: 3 },
      repaymentFrequencyType: { id: 2 },
      repaymentStartDateType: { id: 1 },
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      valueConditionTypeOptions: [{ id: 1, value: 'Equal' }],
      floatingRateOptions: [],
      interestRateFrequencyTypeOptions: [{ id: 3, value: 'Per year' }],
      repaymentFrequencyTypeOptions: [{ id: 2, value: 'Months' }],
      repaymentStartDateTypeOptions: [{ id: 1, value: 'Disbursement date' }],
      fixedLength: null,
      ...overrides
    };
  }

  function createComponent(template: Record<string, unknown>): LoanProductTermsStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: jest.fn(), url: '' } },
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        {
          provide: ProcessingStrategyService,
          useValue: { advancedTransactionProcessingStrategy: of(false) }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string): string => key } }
      ]
    });

    return TestBed.runInInjectionContext(() => {
      const component = new LoanProductTermsStepComponent();
      component.loanProductsTemplate = template;
      component.ngOnInit();
      return component;
    });
  }

  it('does not keep zero max interest when editing a zero-interest product to positive interest', () => {
    const component = createComponent(baseTemplate());

    component.zeroInterest.setValue(false);
    component.loanProductTermsForm.get('interestRatePerPeriod')!.setValue(5);

    expect(component.loanProductTerms).toEqual(
      expect.objectContaining({
        minInterestRatePerPeriod: '',
        interestRatePerPeriod: 5,
        maxInterestRatePerPeriod: ''
      })
    );
  });

  it('preserves configured min and max interest values for positive-interest products', () => {
    const component = createComponent(
      baseTemplate({
        minInterestRatePerPeriod: 0,
        interestRatePerPeriod: 12,
        maxInterestRatePerPeriod: 30
      })
    );

    component.loanProductTermsForm.get('interestRatePerPeriod')!.setValue(15);

    expect(component.loanProductTerms).toEqual(
      expect.objectContaining({
        minInterestRatePerPeriod: 0,
        interestRatePerPeriod: 15,
        maxInterestRatePerPeriod: 30
      })
    );
  });

  it('keeps unchanged zero-interest products at zero interest', () => {
    const component = createComponent(baseTemplate());

    expect(component.loanProductTerms).toEqual(
      expect.objectContaining({
        minInterestRatePerPeriod: 0,
        interestRatePerPeriod: 0,
        maxInterestRatePerPeriod: 0
      })
    );
  });
});

describe('LoanProductTermsStepComponent — semi-monthly repayment frequency', () => {
  const SEMI_MONTHLY = 6;
  const MONTHS = 2;

  function baseTemplate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      minPrincipal: 1000,
      principal: 10000,
      maxPrincipal: 50000,
      minNumberOfRepayments: 1,
      numberOfRepayments: 12,
      maxNumberOfRepayments: 36,
      isLinkedToFloatingInterestRates: false,
      minInterestRatePerPeriod: 0,
      interestRatePerPeriod: 12,
      maxInterestRatePerPeriod: 30,
      allowApprovedDisbursedAmountsOverApplied: false,
      useBorrowerCycle: false,
      repaymentEvery: 1,
      interestRateFrequencyType: { id: 3 },
      repaymentFrequencyType: { id: MONTHS },
      repaymentStartDateType: { id: 1 },
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      valueConditionTypeOptions: [{ id: 1, value: 'Equal' }],
      floatingRateOptions: [],
      interestRateFrequencyTypeOptions: [{ id: 3, value: 'Per year' }],
      repaymentFrequencyTypeOptions: [
        { id: MONTHS, value: 'Months' },
        { id: SEMI_MONTHLY, value: 'Semi Monthly' }
      ],
      repaymentStartDateTypeOptions: [{ id: 1, value: 'Disbursement date' }],
      fixedLength: null,
      ...overrides
    };
  }

  function createComponent(template: Record<string, unknown>): LoanProductTermsStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: jest.fn(), url: '' } },
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        {
          provide: ProcessingStrategyService,
          useValue: { advancedTransactionProcessingStrategy: of(false) }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string): string => key } }
      ]
    });

    return TestBed.runInInjectionContext(() => {
      const component = new LoanProductTermsStepComponent();
      component.loanProductsTemplate = template;
      component.ngOnInit();
      return component;
    });
  }

  it('prefills both days, locks "repaid every" to 1 and requires both days for a semi-monthly product', () => {
    const component = createComponent(
      baseTemplate({
        repaymentFrequencyType: { id: SEMI_MONTHLY },
        repaymentEvery: 1,
        firstRepaymentDayOfMonth: 10,
        secondRepaymentDayOfMonth: 25
      })
    );
    const form = component.loanProductTermsForm;

    expect(component.isSemiMonthly()).toBe(true);
    expect(form.get('firstRepaymentDayOfMonth')!.value).toBe(10);
    expect(form.get('secondRepaymentDayOfMonth')!.value).toBe(25);
    expect(form.get('repaymentEvery')!.disabled).toBe(true);
    expect(form.get('repaymentEvery')!.value).toBe(1);

    form.get('firstRepaymentDayOfMonth')!.setValue(null);
    expect(form.get('firstRepaymentDayOfMonth')!.hasError('required')).toBe(true);
    form.get('secondRepaymentDayOfMonth')!.setValue(null);
    expect(form.get('secondRepaymentDayOfMonth')!.hasError('required')).toBe(true);
  });

  it('offers only second days after the first and clears a second day the new first day overtakes', () => {
    const component = createComponent(
      baseTemplate({
        repaymentFrequencyType: { id: SEMI_MONTHLY },
        firstRepaymentDayOfMonth: 10,
        secondRepaymentDayOfMonth: 20
      })
    );
    const form = component.loanProductTermsForm;

    form.get('firstRepaymentDayOfMonth')!.setValue(25);

    expect(component.secondRepaymentDayOptions()).toEqual([
      26,
      27,
      28,
      29,
      30,
      31
    ]);
    expect(form.get('secondRepaymentDayOfMonth')!.value).toBeNull();

    form.get('secondRepaymentDayOfMonth')!.setValue(31);
    form.get('firstRepaymentDayOfMonth')!.setValue(15);
    expect(form.get('secondRepaymentDayOfMonth')!.value).toBe(31);
  });

  it('sends both days and repaidEvery 1 for a semi-monthly product even though the input is disabled', () => {
    const component = createComponent(baseTemplate({ repaymentEvery: 3 }));
    component.loanProductTermsForm.get('repaymentFrequencyType')!.setValue(SEMI_MONTHLY);
    component.loanProductTermsForm.get('firstRepaymentDayOfMonth')!.setValue(15);
    component.loanProductTermsForm.get('secondRepaymentDayOfMonth')!.setValue(31);

    expect(component.loanProductTerms).toEqual(
      expect.objectContaining({
        repaymentFrequencyType: SEMI_MONTHLY,
        repaymentEvery: 1,
        firstRepaymentDayOfMonth: 15,
        secondRepaymentDayOfMonth: 31
      })
    );
  });

  it('never sends only one of the two days', () => {
    const component = createComponent(baseTemplate());
    component.loanProductTermsForm.get('repaymentFrequencyType')!.setValue(SEMI_MONTHLY);
    component.loanProductTermsForm.get('firstRepaymentDayOfMonth')!.setValue(10);

    expect(component.loanProductTerms).not.toHaveProperty('firstRepaymentDayOfMonth');
    expect(component.loanProductTerms).not.toHaveProperty('secondRepaymentDayOfMonth');
  });

  it('clears and omits both days, and re-enables "repaid every", when switching to another frequency', () => {
    const component = createComponent(
      baseTemplate({
        repaymentFrequencyType: { id: SEMI_MONTHLY },
        firstRepaymentDayOfMonth: 10,
        secondRepaymentDayOfMonth: 25
      })
    );
    const form = component.loanProductTermsForm;

    form.get('repaymentFrequencyType')!.setValue(MONTHS);

    expect(component.isSemiMonthly()).toBe(false);
    expect(form.get('firstRepaymentDayOfMonth')!.value).toBeNull();
    expect(form.get('secondRepaymentDayOfMonth')!.value).toBeNull();
    expect(form.get('firstRepaymentDayOfMonth')!.valid).toBe(true);
    expect(form.get('secondRepaymentDayOfMonth')!.valid).toBe(true);
    expect(form.get('repaymentEvery')!.enabled).toBe(true);
    expect(component.loanProductTerms).not.toHaveProperty('firstRepaymentDayOfMonth');
    expect(component.loanProductTerms).not.toHaveProperty('secondRepaymentDayOfMonth');
  });

  it('ignores days a monthly product kept from an earlier semi-monthly configuration', () => {
    const component = createComponent(baseTemplate({ firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 25 }));

    expect(component.isSemiMonthly()).toBe(false);
    expect(component.loanProductTermsForm.get('firstRepaymentDayOfMonth')!.value).toBeNull();
    expect(component.loanProductTerms).not.toHaveProperty('firstRepaymentDayOfMonth');
    expect(component.loanProductTerms).not.toHaveProperty('secondRepaymentDayOfMonth');
    expect(component.loanProductTermsForm.get('repaymentEvery')!.enabled).toBe(true);
  });
});
