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
import { Dates } from 'app/core/utils/dates';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { EditLoansAccountComponent } from './edit-loans-account.component';

// The stepper pulls in the schedule tab, whose PDF export imports these ES-module-only packages.
jest.mock('jspdf', () => ({ jsPDF: jest.fn() }));
jest.mock('jspdf-autotable', () => ({ __esModule: true, default: jest.fn() }));

/** GET /working-capital-loans/{id} serializes client and product as flat ids. */
const WC_LOAN_DETAILS = { id: 1, accountNo: '000000001', clientId: 3, loanProductId: 11 };

/** GET /working-capital-loans/template for a product that allows no override. */
const WC_TEMPLATE_NO_OVERRIDES = {
  loanData: {
    currency: { code: 'EUR' },
    product: {
      id: 11,
      allowAttributeOverrides: {
        delinquencyBucketClassification: false,
        breach: false,
        discountDefault: false,
        periodPaymentFrequency: false,
        periodPaymentFrequencyType: false
      }
    }
  }
};

describe('EditLoansAccountComponent — Working Capital override gating', () => {
  let component: EditLoansAccountComponent;
  let updateLoansAccount: jest.Mock;
  let getWorkingCapitalLoansAccountTemplate: jest.Mock;

  beforeEach(async () => {
    updateLoansAccount = jest.fn().mockReturnValue(of({}));
    getWorkingCapitalLoansAccountTemplate = jest.fn().mockReturnValue(of(WC_TEMPLATE_NO_OVERRIDES));
    await TestBed.configureTestingModule({
      imports: [EditLoansAccountComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ loansAccountAndTemplate: WC_LOAN_DETAILS, loanProductsBasicDetails: [] }),
            snapshot: { params: { loanId: '1' }, queryParamMap: new Map() }
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: LoanProductService,
          useValue: {
            initialize: jest.fn(),
            isLoanProduct: false,
            isWorkingCapital: true,
            loanAccountPath: 'working-capital-loans',
            productType: { value: 'working-capital' }
          }
        },
        { provide: LoansService, useValue: { updateLoansAccount, getWorkingCapitalLoansAccountTemplate } },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        { provide: Dates, useValue: { formatDate: (value: string) => value } }
      ]
    })
      .overrideComponent(EditLoansAccountComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    component = TestBed.createComponent(EditLoansAccountComponent).componentInstance;
  });

  it('reads the override switches from the template it already loads, without an extra call', () => {
    expect(getWorkingCapitalLoansAccountTemplate).toHaveBeenCalledTimes(1);
    expect(getWorkingCapitalLoansAccountTemplate).toHaveBeenCalledWith(3, 11);
    expect(component.productDetails.allowAttributeOverrides.breach).toBe(false);
  });

  it('does not resend the loaded gated values when only the external id changes', () => {
    component.loansAccountDetailsStep = {
      loansAccountDetails: {
        productId: 11,
        externalId: 'changed-external-id',
        submittedOnDate: '01 January 2026',
        expectedDisbursementDate: '01 January 2026'
      }
    } as any;
    // getRawValue() still carries the values loaded from the account into the locked controls.
    component.loansAccountTermsStep = {
      loansAccountTerms: {
        principalAmount: 1000,
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
      }
    } as any;

    component.submitWorkingCapitalProduct();

    const payload = updateLoansAccount.mock.calls[0][2];
    expect(payload.externalId).toBe('changed-external-id');
    [
      'delinquencyBucketId',
      'delinquencyGraceDays',
      'delinquencyStartType',
      'breachId',
      'nearBreachId',
      'breachGraceDays',
      'breachStartType',
      'discount',
      'repaymentEvery',
      'repaymentFrequencyType'
    ].forEach((key) => expect(payload).not.toHaveProperty(key));
  });
});
