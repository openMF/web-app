/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoansService } from '../loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { CreateLoansAccountComponent } from './create-loans-account.component';

// The stepper pulls in the schedule tab, whose PDF export imports these ES-module-only packages.
jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('jspdf-autotable', () => ({ __esModule: true, default: jest.fn() }));

/**
 * Terms as LoansAccountTermsStepComponent.loansAccountTerms returns them: getRawValue() keeps
 * the values of the controls locked by the product, so every gated key is present here.
 */
const RAW_TERMS = {
  principalAmount: 1000,
  totalPaymentVolume: 5000,
  periodPaymentRate: 18,
  discount: 10,
  repaymentEvery: 30,
  repaymentFrequencyType: 'DAYS',
  delinquencyBucketId: 2,
  delinquencyGraceDays: 0,
  delinquencyStartType: 'LOAN_CREATION',
  breachId: 3,
  nearBreachId: 4,
  breachGraceDays: 5,
  breachStartType: 'DISBURSEMENT'
};

const DELINQUENCY_KEYS = [
  'delinquencyBucketId',
  'delinquencyGraceDays',
  'delinquencyStartType'
];
const BREACH_KEYS = [
  'breachId',
  'nearBreachId',
  'breachGraceDays',
  'breachStartType'
];

describe('CreateLoansAccountComponent — Working Capital override gating', () => {
  let component: CreateLoansAccountComponent;
  let createLoansAccount: jest.Mock;

  beforeEach(async () => {
    createLoansAccount = jest.fn().mockReturnValue(of({ resourceId: 1 }));
    await TestBed.configureTestingModule({
      imports: [CreateLoansAccountComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({}), snapshot: { params: {}, queryParamMap: new Map() } } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: false,
            isWorkingCapital: true,
            loanAccountPath: 'working-capital-loans',
            productType: { value: 'working-capital' }
          }
        },
        { provide: LoansService, useValue: { createLoansAccount } },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        { provide: ClientsService, useValue: {} },
        { provide: Dates, useValue: { formatDate: (value: string) => value } }
      ]
    })
      .overrideComponent(CreateLoansAccountComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    component = TestBed.createComponent(CreateLoansAccountComponent).componentInstance;
    component.loansAccountDetailsStep = {
      loansAccountDetails: {
        productId: 11,
        submittedOnDate: '01 January 2026',
        expectedDisbursementDate: '01 January 2026'
      }
    } as any;
    component.loansAccountTermsStep = { loansAccountTerms: { ...RAW_TERMS } } as any;
    component.loansAccountProductTemplate = { client: { id: 3 } };
  });

  function submittedPayload(allowAttributeOverrides: Record<string, boolean>): Record<string, unknown> {
    component.productDetails = { allowAttributeOverrides };
    component.submitWorkingCapitalProduct();
    return createLoansAccount.mock.calls[0][1];
  }

  it('omits every gated key when the product allows no override', () => {
    const payload = submittedPayload({
      delinquencyBucketClassification: false,
      breach: false,
      discountDefault: false,
      periodPaymentFrequency: false,
      periodPaymentFrequencyType: false
    });

    [
      ...DELINQUENCY_KEYS,
      ...BREACH_KEYS,
      'discount',
      'repaymentEvery',
      'repaymentFrequencyType'
    ].forEach((key) => expect(payload).not.toHaveProperty(key));
  });

  it('gates breach and delinquency settings independently', () => {
    const payload = submittedPayload({ delinquencyBucketClassification: false, breach: true });

    DELINQUENCY_KEYS.forEach((key) => expect(payload).not.toHaveProperty(key));
    expect(payload).toMatchObject({
      breachId: 3,
      nearBreachId: 4,
      breachGraceDays: 5,
      breachStartType: 'DISBURSEMENT'
    });
  });

  it('sends grace days and start types when both switches allow overriding', () => {
    const payload = submittedPayload({ delinquencyBucketClassification: true, breach: true });

    expect(payload).toMatchObject({
      delinquencyGraceDays: 0,
      delinquencyStartType: 'LOAN_CREATION',
      breachGraceDays: 5,
      breachStartType: 'DISBURSEMENT'
    });
  });
});
