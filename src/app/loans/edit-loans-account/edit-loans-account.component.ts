/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoansService } from '../loans.service';
import { LoansAccountDetailsStepComponent } from '../loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansAccountTermsStepComponent } from '../loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from '../loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoansAccountScheduleStepComponent } from '../loans-account-stepper/loans-account-schedule-step/loans-account-schedule-step.component';
import { LoansAccountPreviewStepComponent } from '../loans-account-stepper/loans-account-preview-step/loans-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBasicDetails } from '../models/loan-product.model';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';

/**
 * Edit Loans
 */
@Component({
  selector: 'mifosx-edit-loans-account',
  templateUrl: './edit-loans-account.component.html',
  styleUrls: ['./edit-loans-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    LoansAccountDetailsStepComponent,
    LoansAccountTermsStepComponent,
    LoansAccountChargesStepComponent,
    LoansAccountScheduleStepComponent,
    LoansAccountPreviewStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditLoansAccountComponent extends LoanProductBaseComponent {
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private loansService = inject(LoansService);
  private settingsService = inject(SettingsService);

  @ViewChild(LoansAccountDetailsStepComponent, { static: true })
  loansAccountDetailsStep: LoansAccountDetailsStepComponent;
  @ViewChild(LoansAccountTermsStepComponent, { static: true }) loansAccountTermsStep: LoansAccountTermsStepComponent;
  @ViewChild(LoansAccountChargesStepComponent, { static: true })
  loansAccountChargesStep: LoansAccountChargesStepComponent;

  loansAccountAndTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any;
  /** Collateral Options */
  collateralOptions: any;
  /** Loan Id */
  loanId: any;
  /** Currency Code */
  currencyCode: string;

  productId: number | null = null;
  productDetails: any;

  loanProductsBasicDetails: LoanProductBasicDetails[] | null = null;
  productType: string | null = null;

  constructor() {
    super();
    this.loanProductService.initialize(LoanProductBaseComponent.resolveProductTypeDefault(this.route, 'loan'));

    this.loanId = this.route.snapshot.params['loanId'];
    this.route.data.subscribe(
      (data: { loansAccountAndTemplate: any; loanProductsBasicDetails: LoanProductBasicDetails[] }) => {
        this.loansAccountAndTemplate = data.loansAccountAndTemplate;
        if (this.loanProductService.isLoanProduct) {
          this.loansAccountProductTemplate = data.loansAccountAndTemplate;
        } else if (this.loanProductService.isWorkingCapital) {
          this.loansAccountProductTemplate = data.loansAccountAndTemplate;
          this.getWorkingCapitalLoanProductTemplate(
            this.loansAccountProductTemplate.client.id,
            this.loansAccountProductTemplate.product.id
          );
        }
        this.loanProductsBasicDetails = data.loanProductsBasicDetails;
      }
    );
  }

  /**
   * Sets loans account product template and collateral template
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    const templateData: any = $event;
    this.loansAccountProductTemplate = templateData.loanData ? templateData.loanData : templateData;
    this.currencyCode = this.loansAccountProductTemplate.currency.code;
    this.productDetails = this.loansAccountProductTemplate.product;
    if (templateData.loanData) {
      this.loansAccountProductTemplate = templateData.loanData;
      this.loansAccountProductTemplate.options = {
        breachOptions: templateData.breachOptions,
        nearBreachOptions: templateData.nearBreachOptions,
        delinquencyBucketOptions: templateData.delinquencyBucketOptions,
        fundOptions: templateData.fundOptions,
        periodFrequencyTypeOptions: templateData.periodFrequencyTypeOptions,
        delinquencyStartTypeOptions: templateData.delinquencyStartTypeOptions
      };
    }
    if (this.loansAccountProductTemplate.loanProductId) {
      this.loansService
        .getLoansCollateralTemplateResource(this.loansAccountProductTemplate.loanProductId)
        .subscribe((response: any) => {
          this.collateralOptions = response.loanCollateralOptions;
        });
    }
  }

  getWorkingCapitalLoanProductTemplate(clientId: number, productId: number) {
    this.loansService.getWorkingCapitalLoansAccountTemplate(clientId, productId).subscribe((response: any) => {
      this.setTemplate(response);
    });
  }

  setProductType($event: any): void {
    this.productType = $event;
    this.loanProductService.initialize(this.productType);
  }

  /** Get Loans Account Details Form Data */
  get loansAccountDetailsForm() {
    return this.loansAccountDetailsStep.loansAccountDetailsForm;
  }

  /** Get Loans Account Terms Form Data */
  get loansAccountTermsForm() {
    return this.loansAccountTermsStep.loansAccountTermsForm;
  }

  /** Checks wheter all the forms in different steps are valid and not pristine */
  get loansAccountFormValidAndNotPristine() {
    if (this.loanProductService.isLoanProduct) {
      return (
        this.loansAccountDetailsForm.valid &&
        this.loansAccountTermsForm.valid &&
        (!this.loansAccountDetailsForm.pristine ||
          !this.loansAccountTermsForm.pristine ||
          !this.loansAccountTermsStep.pristine ||
          !this.loansAccountChargesStep?.pristine)
      );
    } else if (this.loanProductService.isWorkingCapital) {
      return (
        this.loansAccountDetailsForm.valid &&
        this.loansAccountTermsForm.valid &&
        (!this.loansAccountDetailsForm.pristine || !this.loansAccountTermsForm.pristine)
      );
    }
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get loansAccount() {
    if (this.loanProductService.isLoanProduct) {
      return {
        ...this.loansAccountDetailsStep.loansAccountDetails,
        ...this.loansAccountTermsStep.loansAccountTerms,
        ...this.loansAccountChargesStep?.loansAccountCharges,
        ...this.loansAccountTermsStep.loanCollateral,
        ...this.loansAccountTermsStep.disbursementData
      };
    } else if (this.loanProductService.isWorkingCapital) {
      return {
        ...this.loansAccountDetailsStep.loansAccountDetails,
        ...this.loansAccountTermsStep.loansAccountTerms
      };
    }
    console.warn('Unexpected product type in loansAccount getter');
    return {};
  }

  submit(): void {
    if (this.loanProductService.isLoanProduct) {
      this.submitLoanProduct();
    } else if (this.loanProductService.isWorkingCapital) {
      this.submitWorkingCapitalProduct();
    }
  }

  /**
   * Submits Data to create loan account
   */
  submitLoanProduct() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const loanType = 'individual';
    const uniqueCharges = new Map<number | string, any>();
    (this.loansAccount.charges ?? []).forEach((charge: any) => {
      const chargeId = charge.chargeId;
      if (chargeId == null) {
        return;
      } // Skip malformed entries
      uniqueCharges.set(chargeId, charge);
    });

    const loansAccountData = {
      ...this.loansAccount,
      clientId: this.loansAccountAndTemplate.clientId,
      charges: Array.from(uniqueCharges.values()).map((charge: any) => {
        const result: any = {
          chargeId: charge.chargeId,
          amount: charge.amount,
          dueDate: charge.dueDate && this.dateUtils.formatDate(charge.dueDate, dateFormat)
        };
        if (charge.id && charge.id !== charge.chargeId) {
          result.id = charge.id;
        }
        return result;
      }),
      collateral: this.loansAccount.collateral.map((collateralEle: any) => ({
        type: collateralEle.type,
        value: collateralEle.value,
        description: collateralEle.description
      })),
      disbursementData: this.loansAccount.disbursementData.map((item: any) => ({
        expectedDisbursementDate: this.dateUtils.formatDate(item.expectedDisbursementDate, dateFormat),
        principal: item.principal
      })),
      interestChargedFromDate: this.dateUtils.formatDate(this.loansAccount.interestChargedFromDate, dateFormat),
      repaymentsStartingFromDate: this.dateUtils.formatDate(this.loansAccount.repaymentsStartingFromDate, dateFormat),
      submittedOnDate: this.dateUtils.formatDate(this.loansAccount.submittedOnDate, dateFormat),
      expectedDisbursementDate: this.dateUtils.formatDate(this.loansAccount.expectedDisbursementDate, dateFormat),
      dateFormat,
      locale,
      loanType
    };
    delete loansAccountData.isValid;
    if (loansAccountData.syncRepaymentsWithMeeting) {
      loansAccountData.calendarId = this.loansAccountProductTemplate.calendarOptions[0].id;
      delete loansAccountData.syncRepaymentsWithMeeting;
    }

    if (loansAccountData.recalculationRestFrequencyDate) {
      loansAccountData.recalculationRestFrequencyDate = this.dateUtils.formatDate(
        this.loansAccount.recalculationRestFrequencyDate,
        dateFormat
      );
    }

    if (loansAccountData.interestCalculationPeriodType === 0) {
      loansAccountData.allowPartialPeriodInterestCalculation = false;
    }
    if (
      !loansAccountData.isLoanProductLinkedToFloatingRate ||
      loansAccountData.isLoanProductLinkedToFloatingRate === false
    ) {
      delete loansAccountData.isFloatingInterestRate;
    }
    loansAccountData.principal = loansAccountData.principalAmount;
    delete loansAccountData.principalAmount;
    delete loansAccountData.multiDisburseLoan;

    // In Fineract, the POST and PUT endpoints for /v1/loans have a typo in the field
    // allowPartialPeriodInterestCalculation. Until that is fixed, we need to replace the field name in the payload.
    loansAccountData.allowPartialPeriodInterestCalculation = loansAccountData.allowPartialPeriodInterestCalculation;
    delete loansAccountData.allowPartialPeriodInterestCalculation;

    this.loansService
      .updateLoansAccount(this.loanProductService.loanAccountPath, this.loanId, loansAccountData)
      .subscribe((response: any) => {
        this.router.navigate(['../'], {
          queryParams: {
            productType: this.loanProductService.productType.value
          },
          relativeTo: this.route
        });
      });
  }

  submitWorkingCapitalProduct(): void {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const payload = {
      ...this.loansAccount,
      clientId: this.loansAccountProductTemplate.client.id,
      submittedOnDate: this.dateUtils.formatDate(this.loansAccount.submittedOnDate, dateFormat),
      expectedDisbursementDate: this.dateUtils.formatDate(this.loansAccount.expectedDisbursementDate, dateFormat),
      locale,
      dateFormat
    };

    if (this.productDetails.allowAttributeOverrides) {
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'periodPaymentFrequency') ||
        this.productDetails.allowAttributeOverrides.periodPaymentFrequency === false
      ) {
        delete payload['repaymentEvery'];
      }
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'periodPaymentFrequencyType') ||
        this.productDetails.allowAttributeOverrides.periodPaymentFrequencyType === false
      ) {
        delete payload['repaymentFrequencyType'];
      }
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'discountDefault') ||
        this.productDetails.allowAttributeOverrides.discountDefault === false
      ) {
        delete payload['discount'];
      }
    }

    // No Empty values to be sent
    [
      'delinquencyGraceDays',
      'delinquencyStartType'
    ].forEach((attr: string) => {
      if (payload[attr] === null || payload[attr] === '') {
        delete payload[attr];
      }
    });

    this.loansService
      .updateLoansAccount(this.loanProductService.loanAccountPath, this.loanId, payload)
      .subscribe((response: any) => {
        this.router.navigate(['../'], {
          queryParams: {
            productType: this.loanProductService.productType.value
          },
          relativeTo: this.route
        });
      });
  }
}
