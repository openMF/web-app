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
