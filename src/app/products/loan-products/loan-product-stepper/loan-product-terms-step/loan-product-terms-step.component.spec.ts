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

describe('LoanProductTermsStepComponent — Working Capital pricing strategy', () => {
  function wcTemplate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      minPrincipal: 100,
      principal: 1000,
      maxPrincipal: 5000,
      repaymentEvery: 1,
      repaymentFrequencyType: { id: 'DAYS' },
      periodFrequencyTypeOptions: [{ id: 'DAYS', value: 'Days' }],
      paymentAmountCalculationStrategyOptions: [
        { id: 'TPV', code: 'TPV', value: 'Total Payment Volume' },
        { id: 'ANNUAL_EIR', code: 'ANNUAL_EIR', value: 'Annual EIR' },
        { id: 'PAYMENT_AMOUNT', code: 'PAYMENT_AMOUNT', value: 'Payment Amount' }
      ],
      ...overrides
    };
  }

  function createComponent(template: Record<string, unknown>): LoanProductTermsStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: jest.fn(), url: '' } },
        { provide: LoanProductService, useValue: { isLoanProduct: false, isWorkingCapital: true } },
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

  it('defaults to TPV and only sends the period payment rate group', () => {
    const component = createComponent(wcTemplate({ periodPaymentRate: 18, discount: 0 }));

    expect(component.paymentAmountCalculationStrategy).toBe('TPV');
    expect(component.loanProductTermsForm.valid).toBe(true);
    const terms = component.loanProductTerms;
    expect(terms.periodPaymentRate).toBe(18);
    expect(terms).not.toHaveProperty('annualEir');
    expect(terms).not.toHaveProperty('minAnnualEir');
    expect(terms).not.toHaveProperty('paymentAmount');
  });

  it('loads an ANNUAL_EIR product and keeps its rate window', () => {
    const component = createComponent(
      wcTemplate({
        paymentAmountCalculationStrategy: { id: 'ANNUAL_EIR', code: 'ANNUAL_EIR', value: 'Annual EIR' },
        minAnnualEir: 10,
        annualEir: 43.756245,
        maxAnnualEir: 60,
        discount: 50
      })
    );

    expect(component.paymentAmountCalculationStrategy).toBe('ANNUAL_EIR');
    expect(component.loanProductTermsForm.valid).toBe(true);
    const terms = component.loanProductTerms;
    expect(terms.annualEir).toBe(43.756245);
    expect(terms.minAnnualEir).toBe(10);
    expect(terms.maxAnnualEir).toBe(60);
    expect(terms).not.toHaveProperty('periodPaymentRate');
    expect(terms).not.toHaveProperty('paymentAmount');
  });

  it('clears the TPV inputs and requires annual EIR and a positive discount when switching to ANNUAL_EIR', () => {
    const component = createComponent(wcTemplate({ periodPaymentRate: 18, discount: 0 }));

    component.loanProductTermsForm.get('paymentAmountCalculationStrategy')!.setValue('ANNUAL_EIR');

    const form = component.loanProductTermsForm;
    expect(form.get('periodPaymentRate')!.value).toBeNull();
    expect(form.get('annualEir')!.hasError('required')).toBe(true);
    expect(form.get('discount')!.hasError('greaterThanZero')).toBe(true);

    form.get('annualEir')!.setValue(0);
    expect(form.get('annualEir')!.hasError('greaterThanZero')).toBe(true);

    form.get('minAnnualEir')!.setValue(10);
    form.get('maxAnnualEir')!.setValue(20);
    form.get('annualEir')!.setValue(25);
    expect(form.get('annualEir')!.hasError('outOfBounds')).toBe(true);

    form.get('annualEir')!.setValue(15);
    form.get('discount')!.setValue(50);
    expect(form.valid).toBe(true);
    expect(component.loanProductTerms).not.toHaveProperty('periodPaymentRate');
  });

  it('switching back to TPV drops the annual EIR group and requires the period payment rate again', () => {
    const component = createComponent(
      wcTemplate({
        paymentAmountCalculationStrategy: { id: 'ANNUAL_EIR', code: 'ANNUAL_EIR', value: 'Annual EIR' },
        annualEir: 43.756245,
        discount: 50
      })
    );

    component.loanProductTermsForm.get('paymentAmountCalculationStrategy')!.setValue('TPV');

    const form = component.loanProductTermsForm;
    expect(form.get('annualEir')!.value).toBeNull();
    expect(form.get('periodPaymentRate')!.hasError('required')).toBe(true);
    expect(form.get('discount')!.valid).toBe(true);
    expect(component.loanProductTerms).not.toHaveProperty('annualEir');
  });

  it('PAYMENT_AMOUNT requires a positive daily payment amount and discount', () => {
    const component = createComponent(wcTemplate({ periodPaymentRate: 18 }));

    component.loanProductTermsForm.get('paymentAmountCalculationStrategy')!.setValue('PAYMENT_AMOUNT');
    const form = component.loanProductTermsForm;
    expect(form.get('paymentAmount')!.hasError('required')).toBe(true);
    form.get('paymentAmount')!.setValue(12.5);
    form.get('discount')!.setValue(30);

    expect(form.valid).toBe(true);
    const terms = component.loanProductTerms;
    expect(terms.paymentAmount).toBe(12.5);
    expect(terms).not.toHaveProperty('periodPaymentRate');
    expect(terms).not.toHaveProperty('annualEir');
  });
});
