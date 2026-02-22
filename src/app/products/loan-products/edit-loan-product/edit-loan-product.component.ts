/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { LoanProductDetailsStepComponent } from '../loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
import { LoanProductCurrencyStepComponent } from '../loan-product-stepper/loan-product-currency-step/loan-product-currency-step.component';
import { LoanProductTermsStepComponent } from '../loan-product-stepper/loan-product-terms-step/loan-product-terms-step.component';
import { LoanProductSettingsStepComponent } from '../loan-product-stepper/loan-product-settings-step/loan-product-settings-step.component';
import { LoanProductChargesStepComponent } from '../loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductAccountingStepComponent } from '../loan-product-stepper/loan-product-accounting-step/loan-product-accounting-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { LoanProducts } from '../loan-products';
import {
  AdvancedCreditAllocation,
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  DeferredIncomeRecognition,
  CreditAllocation,
  PaymentAllocation,
  CapitalizedIncome,
  BuyDownFee
} from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { Accounting } from 'app/core/utils/accounting';
import { LoanProductInterestRefundStepComponent } from '../loan-product-stepper/loan-product-interest-refund-step/loan-product-interest-refund-step.component';
import { StringEnumOptionData } from '../../../shared/models/option-data.model';
import { LoanProductDeferredIncomeRecognitionStepComponent } from '../loan-product-stepper/loan-product-capitalized-income-step/loan-product-deferred-income-recognition-step.component';
import { UntypedFormGroup } from '@angular/forms';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StepperButtonsComponent } from '../../../shared/steppers/stepper-buttons/stepper-buttons.component';
import { LoanProductPaymentStrategyStepComponent } from '../loan-product-stepper/loan-product-payment-strategy-step/loan-product-payment-strategy-step.component';
import { LoanProductPreviewStepComponent } from '../loan-product-stepper/loan-product-preview-step/loan-product-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-loan-product',
  templateUrl: './edit-loan-product.component.html',
  styleUrls: ['./edit-loan-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    LoanProductDetailsStepComponent,
    LoanProductCurrencyStepComponent,
    LoanProductSettingsStepComponent,
    LoanProductInterestRefundStepComponent,
    StepperButtonsComponent,
    LoanProductPaymentStrategyStepComponent,
    LoanProductTermsStepComponent,
    LoanProductChargesStepComponent,
    LoanProductDeferredIncomeRecognitionStepComponent,
    LoanProductAccountingStepComponent,
    LoanProductPreviewStepComponent
  ]
})
export class EditLoanProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private loanProducts = inject(LoanProducts);
  private router = inject(Router);
  private accounting = inject(Accounting);
  private advancedPaymentStrategy = inject(AdvancedPaymentStrategy);

  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent, { static: true })
  loanProductCurrencyStep: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductInterestRefundStepComponent, { static: true })
  loanProductInterestRefundStep: LoanProductInterestRefundStepComponent;
  @ViewChild(LoanProductDeferredIncomeRecognitionStepComponent, { static: true })
  loanProductCapitalizedIncomeStep: LoanProductDeferredIncomeRecognitionStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true })
  loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true })
  loanProductAccountingStep: LoanProductAccountingStepComponent;

  loanProductAndTemplate: any;
  accountingRuleData: string[] = [];
  itemsByDefault: GlobalConfiguration[] = [];

  isAdvancedPaymentStrategy = false;
  wasPaymentAllocationChanged = false;
  paymentAllocation: PaymentAllocation[] = [];
  creditAllocation: CreditAllocation[] = [];
  advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  advancedCreditAllocations: AdvancedCreditAllocation[] = [];
  supportedInterestRefundTypes: StringEnumOptionData[] = [];

  deferredIncomeRecognition: DeferredIncomeRecognition | null = null;
  loanIncomeCapitalizationForm: UntypedFormGroup | null = null;

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Product Service.
   * @param {LoanProducts} loanProducts LoanProducts
   * @param {Router} router Router for navigation.
   */

  constructor() {
    const loanProducts = this.loanProducts;

    this.route.data.subscribe((data: { loanProductAndTemplate: any; configurations: any }) => {
      this.loanProductAndTemplate = data.loanProductAndTemplate;
      const assetAccountData = this.loanProductAndTemplate.accountingMappingOptions.assetAccountOptions || [];
      const liabilityAccountData = this.loanProductAndTemplate.accountingMappingOptions.liabilityAccountOptions || [];
      this.loanProductAndTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions =
        assetAccountData.concat(liabilityAccountData);

      this.itemsByDefault = loanProducts.setItemsByDefault(data.configurations);
      this.loanProductAndTemplate['itemsByDefault'] = this.itemsByDefault;
    });
  }

  ngOnInit() {
    this.accountingRuleData = this.accounting.getAccountingRulesForLoans();
    this.buildAdvancedPaymentAllocation();
    this.advancePaymentStrategy(this.loanProductAndTemplate.transactionProcessingStrategyCode);
    if (this.deferredIncomeRecognition == null) {
      this.deferredIncomeRecognition = {};
    }
    if (this.isAdvancedPaymentStrategy) {
      this.paymentAllocation = this.loanProductAndTemplate.paymentAllocation;
      this.creditAllocation = this.loanProductAndTemplate.creditAllocation;
      this.supportedInterestRefundTypes = this.loanProductAndTemplate.supportedInterestRefundTypes;
      if (this.loanProductAndTemplate.enableIncomeCapitalization) {
        this.deferredIncomeRecognition.capitalizedIncome = {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: this.loanProductAndTemplate.capitalizedIncomeCalculationType.id,
          capitalizedIncomeStrategy: this.loanProductAndTemplate.capitalizedIncomeStrategy.id,
          capitalizedIncomeType: this.loanProductAndTemplate.capitalizedIncomeType.id
        };
      } else {
        this.deferredIncomeRecognition.capitalizedIncome = {
          enableIncomeCapitalization: false
        };
      }
      if (this.loanProductAndTemplate.enableBuyDownFee) {
        this.deferredIncomeRecognition.buyDownFee = {
          enableBuyDownFee: true,
          buyDownFeeCalculationType: this.loanProductAndTemplate.buyDownFeeCalculationType.id,
          buyDownFeeStrategy: this.loanProductAndTemplate.buyDownFeeStrategy.id,
          buyDownFeeIncomeType: this.loanProductAndTemplate.buyDownFeeIncomeType.id,
          merchantBuyDownFee: this.loanProductAndTemplate.merchantBuyDownFee
        };
      } else {
        this.deferredIncomeRecognition.buyDownFee = {
          enableBuyDownFee: false
        };
      }
    }
  }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
  }

  get loanProductCurrencyForm() {
    return this.loanProductCurrencyStep.loanProductCurrencyForm;
  }

  get loanProductTermsForm() {
    return this.loanProductTermsStep.loanProductTermsForm;
  }

  get loanProductSettingsForm() {
    return this.loanProductSettingsStep.loanProductSettingsForm;
  }

  get loanProductInterestRefundForm() {
    if (this.loanProductInterestRefundStep != null) {
      return this.loanProductInterestRefundStep.loanProductInterestRefundForm;
    }
  }

  setViewChildForm(viewChildForm: UntypedFormGroup): void {
    this.loanIncomeCapitalizationForm = viewChildForm;
    const formValues: any = this.loanIncomeCapitalizationForm.getRawValue();
    const capitalizedIncome: CapitalizedIncome = formValues.enableIncomeCapitalization
      ? {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: formValues.capitalizedIncomeCalculationType,
          capitalizedIncomeStrategy: formValues.capitalizedIncomeStrategy,
          capitalizedIncomeType: formValues.capitalizedIncomeType
        }
      : { enableIncomeCapitalization: false };
    const buyDownFee: BuyDownFee = formValues.enableBuyDownFee
      ? {
          enableBuyDownFee: true,
          buyDownFeeCalculationType: formValues.buyDownFeeCalculationType,
          buyDownFeeStrategy: formValues.buyDownFeeStrategy,
          buyDownFeeIncomeType: formValues.buyDownFeeIncomeType,
          merchantBuyDownFee: formValues.merchantBuyDownFee
        }
      : { enableBuyDownFee: false };
    this.setDeferredIncomeRecognition({
      capitalizedIncome: capitalizedIncome,
      buyDownFee: buyDownFee
    });
  }

  advancePaymentStrategy(value: string): void {
    this.isAdvancedPaymentStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(value);
  }

  buildAdvancedPaymentAllocation(): void {
    this.advancedPaymentAllocations = this.advancedPaymentStrategy.buildAdvancedPaymentAllocationList(
      this.loanProductAndTemplate
    );
    this.advancedCreditAllocations = this.advancedPaymentStrategy.buildAdvancedCreditAllocationList(
      this.loanProductAndTemplate
    );
  }

  setPaymentAllocation(paymentAllocation: PaymentAllocation[]): void {
    this.paymentAllocation = paymentAllocation;
    this.wasPaymentAllocationChanged = true;
  }

  setCreditAllocation(creditAllocation: CreditAllocation[]): void {
    this.creditAllocation = creditAllocation;
    this.wasPaymentAllocationChanged = true;
  }

  setSupportedInterestRefundTypes(supportedInterestRefundTypes: StringEnumOptionData[]): void {
    this.supportedInterestRefundTypes = supportedInterestRefundTypes;
  }

  paymentAllocationChanged(value: boolean): void {
    this.wasPaymentAllocationChanged = value;
  }

  setDeferredIncomeRecognition(deferredIncomeRecognition: DeferredIncomeRecognition): void {
    if (this.isAdvancedPaymentStrategy) {
      this.deferredIncomeRecognition = deferredIncomeRecognition;
    }
  }

  get loanProductAccountingForm() {
    return this.loanProductAccountingStep.loanProductAccountingForm;
  }

  get loanProductFormValid(): boolean {
    if (this.isAdvancedPaymentStrategy) {
      return (
        this.loanProductDetailsForm.valid &&
        this.loanProductCurrencyForm.valid &&
        this.loanProductTermsForm.valid &&
        this.loanProductSettingsForm.valid &&
        this.loanProductAccountingForm.valid &&
        this.loanIncomeCapitalizationForm != null &&
        this.loanIncomeCapitalizationForm.valid
      );
    } else {
      return (
        this.loanProductDetailsForm.valid &&
        this.loanProductCurrencyForm.valid &&
        this.loanProductTermsForm.valid &&
        this.loanProductSettingsForm.valid &&
        this.loanProductAccountingForm.valid
      );
    }
  }

  get loanProductFormDirty(): boolean {
    if (this.isAdvancedPaymentStrategy) {
      return (
        !this.loanProductDetailsForm.pristine ||
        !this.loanProductCurrencyForm.pristine ||
        !this.loanProductTermsForm.pristine ||
        !this.loanProductSettingsForm.pristine ||
        !this.loanProductChargesStep.pristine ||
        !this.loanProductAccountingForm.pristine ||
        !(this.loanIncomeCapitalizationForm?.pristine ?? true) ||
        this.wasPaymentAllocationChanged
      );
    } else {
      return (
        !this.loanProductDetailsForm.pristine ||
        !this.loanProductCurrencyForm.pristine ||
        !this.loanProductTermsForm.pristine ||
        !this.loanProductSettingsForm.pristine ||
        !this.loanProductChargesStep.pristine ||
        !this.loanProductAccountingForm.pristine ||
        this.wasPaymentAllocationChanged
      );
    }
  }

  get loanProductFormValidAndNotPristine(): boolean {
    return this.loanProductFormValid && this.loanProductFormDirty;
  }

  get loanProduct() {
    const loanProduct = {
      ...this.loanProductDetailsStep.loanProductDetails,
      ...this.loanProductCurrencyStep.loanProductCurrency,
      ...this.loanProductTermsStep.loanProductTerms,
      ...this.loanProductSettingsStep.loanProductSettings,
      ...this.loanProductChargesStep.loanProductCharges,
      ...this.loanProductAccountingStep.loanProductAccounting
    };
    // Default empty array
    loanProduct['paymentAllocation'] = [];
    loanProduct['creditAllocation'] = [];
    loanProduct['supportedInterestRefundTypes'] = [];
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['paymentAllocation'] = this.paymentAllocation;
      loanProduct['creditAllocation'] = this.creditAllocation;
      loanProduct['supportedInterestRefundTypes'] = this.supportedInterestRefundTypes;
      if (this.deferredIncomeRecognition != null) {
        if (this.deferredIncomeRecognition.capitalizedIncome != null) {
          loanProduct['enableIncomeCapitalization'] =
            this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization;
          if (this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization) {
            loanProduct['capitalizedIncomeCalculationType'] =
              this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType;
            loanProduct['capitalizedIncomeStrategy'] =
              this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy;
            loanProduct['capitalizedIncomeType'] =
              this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType;
          }
        }
        if (this.deferredIncomeRecognition.buyDownFee != null) {
          loanProduct['enableBuyDownFee'] = this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee;
          if (this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee) {
            loanProduct['buyDownFeeCalculationType'] =
              this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType;
            loanProduct['buyDownFeeStrategy'] = this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy;
            loanProduct['buyDownFeeIncomeType'] = this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType;
            loanProduct['merchantBuyDownFee'] = this.deferredIncomeRecognition.buyDownFee.merchantBuyDownFee;
          }
        }
      }
    }
    return loanProduct;
  }

  submit() {
    const loanProduct = this.loanProducts.buildPayload(this.loanProduct, this.itemsByDefault);
    if (loanProduct['useDueForRepaymentsConfigurations']) {
      loanProduct['dueDaysForRepaymentEvent'] = null;
      loanProduct['overDueDaysForRepaymentEvent'] = null;
    }
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['supportedInterestRefundTypes'] = this.mapStringEnumOptionToIdList(
        loanProduct['supportedInterestRefundTypes']
      );
    } else {
      delete loanProduct['supportedInterestRefundTypes'];
      delete loanProduct['daysInYearCustomStrategy'];
    }
    delete loanProduct['useDueForRepaymentsConfigurations'];

    this.productsService.updateLoanProduct(this.loanProductAndTemplate.id, loanProduct).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }

  mapStringEnumOptionToIdList(incomingValues: StringEnumOptionData[]): string[] {
    return incomingValues.map((v) => v.id);
  }
}
