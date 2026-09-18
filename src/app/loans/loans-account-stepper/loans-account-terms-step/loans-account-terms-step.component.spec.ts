/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'app/settings/settings.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoansAccountTermsStepComponent } from './loans-account-terms-step.component';

/**
 * Response of GET /working-capital-loans/{id}?associations=all for an account
 * submitted with a payment rate of 18% and a proposed discount fee of 50.
 */
const WC_LOAN_DETAILS: any = {
  id: 1,
  accountNo: '000000001',
  clientId: 3,
  loanProductId: 11,
  status: { id: 100, code: 'loanStatusType.submitted.and.pending.approval', pendingApproval: true },
  proposedPrincipal: 100,
  approvedPrincipal: 0,
  principal: 100,
  currency: { code: 'EUR', name: 'Euro', decimalPlaces: 2, displaySymbol: '€' },
  paymentRate: 18,
  repaymentEvery: 30,
  repaymentFrequencyType: { id: 'DAYS', code: 'DAYS', value: 'DAYS' },
  proposedDiscountFee: 50,
  delinquencyBucket: { id: 2, name: 'WC_DELINQUENCY_BUCKET', ranges: [] },
  breachGraceDays: 0,
  breachStartType: { id: '2', code: 'DISBURSEMENT', value: 'Disbursement' },
  totalPaymentVolume: 360
};

/**
 * Response of GET /working-capital-loans/template?clientId&productId, as reshaped by
 * EditLoansAccountComponent.setTemplate(): the `loanData` payload plus the option lists.
 */
const WC_PRODUCT_TEMPLATE: any = {
  currency: { code: 'EUR', name: 'Euro', decimalPlaces: 2, displaySymbol: '€' },
  product: {
    id: 11,
    name: 'WCLP_ACC_DEF_REV_AM',
    principal: 1000,
    allowAttributeOverrides: {
      periodPaymentFrequency: true,
      periodPaymentFrequencyType: true,
      discountDefault: true,
      delinquencyBucketClassification: true,
      breach: true
    }
  },
  options: {
    periodFrequencyTypeOptions: [],
    delinquencyStartTypeOptions: [],
    delinquencyBucketOptions: [],
    breachOptions: [],
    nearBreachOptions: []
  }
};

describe('LoansAccountTermsStepComponent — Working Capital edit mode', () => {
  let fixture: ComponentFixture<LoansAccountTermsStepComponent>;
  let component: LoansAccountTermsStepComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansAccountTermsStepComponent],
      providers: [
        { provide: LoanProductService, useValue: { isLoanProduct: false, isWorkingCapital: true } },
        { provide: Router, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: SettingsService, useValue: { maxFutureDate: new Date() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { loanId: '1' }, queryParamMap: new Map() } }
        }
      ]
    })
      .overrideComponent(LoansAccountTermsStepComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(LoansAccountTermsStepComponent);
    component = fixture.componentInstance;
  });

  /** Angular delivers the resolved account to both inputs before the first ngOnChanges. */
  function firstChange(): void {
    component.loansAccountProductTemplate = WC_LOAN_DETAILS;
    component.loansAccountTemplate = WC_LOAN_DETAILS;
    component.ngOnChanges({
      loansAccountProductTemplate: new SimpleChange(undefined, WC_LOAN_DETAILS, true)
    });
  }

  /** EditLoansAccountComponent.setTemplate() replaces the input once the async template arrives. */
  function templateArrivesChange(): void {
    const previous = component.loansAccountProductTemplate;
    component.loansAccountProductTemplate = WC_PRODUCT_TEMPLATE;
    component.ngOnChanges({
      loansAccountProductTemplate: new SimpleChange(previous, WC_PRODUCT_TEMPLATE, false)
    });
  }

  function terms() {
    return component.loansAccountTermsForm.getRawValue();
  }

  it('fills the form from the account details on the first ngOnChanges', () => {
    firstChange();

    expect(terms().discount).toBe(50);
    expect(terms().periodPaymentRate).toBe(18);
    expect(terms().principalAmount).toBe(100);
    expect(terms().totalPaymentVolume).toBe(360);
  });

  it('keeps the values after ngOnInit runs', () => {
    firstChange();
    component.ngOnInit();

    expect(terms().discount).toBe(50);
    expect(terms().periodPaymentRate).toBe(18);
    expect(terms().totalPaymentVolume).toBe(360);
  });

  it('keeps the values after the async product template arrives', () => {
    firstChange();
    component.ngOnInit();
    templateArrivesChange();

    expect(terms().discount).toBe(50);
    expect(terms().periodPaymentRate).toBe(18);
    expect(terms().totalPaymentVolume).toBe(360);
  });

  it('keeps the values when the template arrives before ngOnInit', () => {
    firstChange();
    templateArrivesChange();
    component.ngOnInit();

    expect(terms().discount).toBe(50);
    expect(terms().periodPaymentRate).toBe(18);
    expect(terms().totalPaymentVolume).toBe(360);
  });
});

describe('LoansAccountTermsStepComponent — nominal interest rate', () => {
  let fixture: ComponentFixture<LoansAccountTermsStepComponent>;
  let component: LoansAccountTermsStepComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansAccountTermsStepComponent],
      providers: [
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        { provide: Router, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: SettingsService, useValue: { maxFutureDate: new Date() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {}, queryParamMap: new Map() } }
        }
      ]
    })
      .overrideComponent(LoansAccountTermsStepComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(LoansAccountTermsStepComponent);
    component = fixture.componentInstance;
    component.loansAccountTermsData = { product: {}, interestRatePerPeriod: 5 };
    component.setAdvancedPaymentStrategyControls();
  });

  function interestRate() {
    return component.loansAccountTermsForm.get('interestRatePerPeriod')!;
  }

  it('accepts decimal rates', () => {
    interestRate().setValue(1202.53);
    expect(interestRate().valid).toBe(true);

    interestRate().setValue(0.53);
    expect(interestRate().valid).toBe(true);
  });

  it('accepts a rate with six decimal places', () => {
    interestRate().setValue(1.123456);

    expect(interestRate().valid).toBe(true);
  });

  it('rejects a rate with seven decimal places', () => {
    interestRate().setValue(1.1234567);

    expect(interestRate().hasError('pattern')).toBe(true);
  });

  it('rejects a negative rate', () => {
    interestRate().setValue(-1);

    expect(interestRate().hasError('min')).toBe(true);
  });

  it('requires a rate', () => {
    interestRate().setValue(null);

    expect(interestRate().hasError('required')).toBe(true);
  });

  it('does not rewrite rates below 0.01 while typing', () => {
    component.setNumericFieldListeners();
    interestRate().setValue(0.005);

    expect(interestRate().value).toBe(0.005);
    expect(interestRate().valid).toBe(true);
  });
});

/** Response of GET /loans/template?templateType=individual for a plain 800,000 INR loan product. */
const LOAN_PRODUCT_TEMPLATE: any = {
  currency: { code: 'INR', name: 'Indian Rupee', decimalPlaces: 2, displaySymbol: '₹' },
  principal: 800000,
  termFrequency: 12,
  termPeriodFrequencyType: { id: 2 },
  numberOfRepayments: 12,
  repaymentEvery: 1,
  repaymentFrequencyType: { id: 2 },
  amortizationType: { id: 1 },
  isEqualAmortization: false,
  interestType: { id: 0 },
  isLoanProductLinkedToFloatingRate: false,
  interestCalculationPeriodType: { id: 1 },
  allowPartialPeriodInterestCalculation: false,
  interestRateFrequencyType: { id: 3 },
  interestRatePerPeriod: 12,
  loanScheduleType: { code: 'loanScheduleType.cumulative' },
  interestRateFrequencyTypeOptions: [],
  transactionProcessingStrategyOptions: [],
  product: { id: 1, principal: 800000, allowAttributeOverrides: {} }
};

describe('LoansAccountTermsStepComponent — principal decimals', () => {
  let component: LoansAccountTermsStepComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansAccountTermsStepComponent],
      providers: [
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } },
        { provide: Router, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: SettingsService, useValue: { maxFutureDate: new Date() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {}, queryParamMap: new Map() } }
        }
      ]
    })
      .overrideComponent(LoansAccountTermsStepComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    component = TestBed.createComponent(LoansAccountTermsStepComponent).componentInstance;
    component.loansAccountProductTemplate = LOAN_PRODUCT_TEMPLATE;
    component.loansAccountTemplate = {};
    component.ngOnChanges({
      loansAccountProductTemplate: new SimpleChange(undefined, LOAN_PRODUCT_TEMPLATE, true)
    });
  });

  function principal() {
    return component.loansAccountTermsForm.get('principalAmount')!;
  }

  /**
   * `loansAccountFormValid` is an input that tracks this very form's validity, so it flips
   * while the user types — a half-entered amount like `800000.` is momentarily invalid. The
   * re-seed that used to run on every ngOnChanges put the product default back and swallowed
   * the decimal point the user had just typed.
   */
  it('keeps a half-typed amount when an unrelated input flips', () => {
    principal().setValue('800000.');

    component.loansAccountFormValid = false;
    component.ngOnChanges({ loansAccountFormValid: new SimpleChange(true, false, false) });

    expect(principal().value).toBe('800000.');
  });

  it('keeps the finished decimal amount when validity flips back', () => {
    principal().setValue('800000.90');

    component.loansAccountFormValid = true;
    component.ngOnChanges({ loansAccountFormValid: new SimpleChange(false, true, false) });

    expect(principal().value).toBe('800000.90');
  });

  it('still seeds the form from the product template', () => {
    expect(principal().value).toBe(800000);
  });

  it('still re-seeds the form when a new product template arrives', () => {
    principal().setValue('1');
    const nextTemplate = { ...LOAN_PRODUCT_TEMPLATE, principal: 50000 };

    component.loansAccountProductTemplate = nextTemplate;
    component.ngOnChanges({
      loansAccountProductTemplate: new SimpleChange(LOAN_PRODUCT_TEMPLATE, nextTemplate, false)
    });

    expect(principal().value).toBe(50000);
  });
});
