/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { LoanProductDetailsStepComponent } from '../loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
import { LoanProductCurrencyStepComponent } from '../loan-product-stepper/loan-product-currency-step/loan-product-currency-step.component';
import { LoanProductTermsStepComponent } from '../loan-product-stepper/loan-product-terms-step/loan-product-terms-step.component';
import { LoanProductSettingsStepComponent } from '../loan-product-stepper/loan-product-settings-step/loan-product-settings-step.component';
import { LoanProductChargesStepComponent } from '../loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductAccountingStepComponent } from '../loan-product-stepper/loan-product-accounting-step/loan-product-accounting-step.component';
import { LoanProductInterestRefundStepComponent } from '../loan-product-stepper/loan-product-interest-refund-step/loan-product-interest-refund-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { LoanProducts } from '../loan-products';
import {
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  BuyDownFee,
  CapitalizedIncome,
  DeferredIncomeRecognition,
  PaymentAllocation
} from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { Accounting } from 'app/core/utils/accounting';
import { StringEnumOptionData } from '../../../shared/models/option-data.model';
import { LoanProductDeferredIncomeRecognitionStepComponent } from '../loan-product-stepper/loan-product-capitalized-income-step/loan-product-deferred-income-recognition-step.component';
import { UntypedFormGroup } from '@angular/forms';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoanProductPaymentStrategyStepComponent } from '../loan-product-stepper/loan-product-payment-strategy-step/loan-product-payment-strategy-step.component';
import { StepperButtonsComponent } from '../../../shared/steppers/stepper-buttons/stepper-buttons.component';
import { LoanProductPreviewStepComponent } from '../loan-product-stepper/loan-product-preview-step/loan-product-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-create-loan-product',
  templateUrl: './create-loan-product.component.html',
  styleUrls: ['./create-loan-product.component.scss'],
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
    LoanProductPaymentStrategyStepComponent,
    StepperButtonsComponent,
    LoanProductTermsStepComponent,
    LoanProductChargesStepComponent,
    LoanProductDeferredIncomeRecognitionStepComponent,
    LoanProductAccountingStepComponent,
    LoanProductPreviewStepComponent
  ]
})
export class CreateLoanProductComponent implements OnInit {
  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent, { static: true })
  loanProductCurrencyStep: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductInterestRefundStepComponent, { static: true })
  loanProductInterestRefundStep: LoanProductInterestRefundStepComponent;
  @ViewChild(LoanProductDeferredIncomeRecognitionStepComponent, { static: true })
  loanProductDeferredIncomeRecognitionStep: LoanProductDeferredIncomeRecognitionStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true })
  loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true })
  loanProductAccountingStep: LoanProductAccountingStepComponent;

  loanProductsTemplate: any;
  accountingRuleData: string[] = [];
  itemsByDefault: any[] = [];

  isAdvancedPaymentStrategy = false;
  paymentAllocation: PaymentAllocation[] = [];
  creditAllocation: PaymentAllocation[] = [];
  supportedInterestRefundTypes: StringEnumOptionData[] = [];
  advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  advancedCreditAllocations: AdvancedPaymentAllocation[] = [];

  deferredIncomeRecognition: DeferredIncomeRecognition | null = null;
  loanIncomeCapitalizationForm: UntypedFormGroup | null = null;

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Product Service.
   * @param {LoanProducts} loanProducts LoanProducts
   * @param {Router} router Router for navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private loanProducts: LoanProducts,
    private router: Router,
    private accounting: Accounting,
    private advancedPaymentStrategy: AdvancedPaymentStrategy
  ) {
    this.route.data.subscribe((data: { loanProductsTemplate: any; configurations: any }) => {
      this.loanProductsTemplate = data.loanProductsTemplate;
      const assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
      const liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
      this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions =
        assetAccountData.concat(liabilityAccountData);

      this.itemsByDefault = loanProducts.setItemsByDefault(data.configurations);
      this.loanProductsTemplate['itemsByDefault'] = this.itemsByDefault;
      this.loanProductsTemplate = loanProducts.updateLoanProductDefaults(this.loanProductsTemplate, false);
    });
  }

  ngOnInit() {
    this.accountingRuleData = this.accounting.getAccountingRulesForLoans();
    this.buildAdvancedPaymentAllocation();
  }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
  }

  get loanProductCurrencyForm() {
    if (this.loanProductCurrencyStep != null) {
      return this.loanProductCurrencyStep.loanProductCurrencyForm;
    }
  }

  get loanProductInterestRefundForm() {
    if (this.loanProductInterestRefundStep != null) {
      return this.loanProductInterestRefundStep.loanProductInterestRefundForm;
    }
  }

  get loanProductTermsForm() {
    return this.loanProductTermsStep.loanProductTermsForm;
  }

  advancePaymentStrategy(value: string) {
    this.isAdvancedPaymentStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(value);
    if (this.isAdvancedPaymentStrategy) {
      if (this.deferredIncomeRecognition == null) {
        this.deferredIncomeRecognition = {};
      }
      if (this.loanProductsTemplate.enableIncomeCapitalization) {
        this.deferredIncomeRecognition.capitalizedIncome = {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: this.loanProductsTemplate.capitalizedIncomeCalculationTypeOptions[0],
          capitalizedIncomeStrategy: this.loanProductsTemplate.capitalizedIncomeStrategyOptions[0],
          capitalizedIncomeType: this.loanProductsTemplate.capitalizedIncomeTypeOptions[0]
        };
      } else {
        this.deferredIncomeRecognition.capitalizedIncome = {
          enableIncomeCapitalization: false
        };
      }
      if (this.loanProductsTemplate.enableBuyDownFee) {
        this.deferredIncomeRecognition.buyDownFee = {
          enableBuyDownFee: true,
          buyDownFeeCalculationType: this.loanProductsTemplate.buyDownFeeCalculationTypeOptions[0],
          buyDownFeeStrategy: this.loanProductsTemplate.buyDownFeeStrategyOptions[0],
          buyDownFeeIncomeType: this.loanProductsTemplate.buyDownFeeIncomeTypeOptions[0],
          merchantBuyDownFee: true
        };
      } else {
        this.deferredIncomeRecognition.buyDownFee = {
          enableBuyDownFee: false
        };
      }
    }
  }

  buildAdvancedPaymentAllocation(): void {
    this.advancedPaymentAllocations = this.advancedPaymentStrategy.buildAdvancedPaymentAllocationList(
      this.loanProductsTemplate
    );
  }

  setPaymentAllocation(paymentAllocation: PaymentAllocation[]): void {
    this.paymentAllocation = paymentAllocation;
  }

  setCreditAllocation(paymentAllocation: PaymentAllocation[]): void {
    this.creditAllocation = paymentAllocation;
  }

  setSupportedInterestRefundTypes(supportedInterestRefundTypes: StringEnumOptionData[]): void {
    this.supportedInterestRefundTypes = supportedInterestRefundTypes;
  }

  setDeferredIncomeRecognition(deferredIncomeRecognition: DeferredIncomeRecognition): void {
    if (this.isAdvancedPaymentStrategy) {
      this.deferredIncomeRecognition = deferredIncomeRecognition;
    }
  }

  setViewChildForm(viewChildForm: UntypedFormGroup): void {
    const formValues: any = viewChildForm.getRawValue();
    this.loanIncomeCapitalizationForm = viewChildForm;
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

  get loanProductSettingsForm() {
    return this.loanProductSettingsStep.loanProductSettingsForm;
  }

  get loanProductAccountingForm() {
    return this.loanProductAccountingStep.loanProductAccountingForm;
  }

  get loanProductFormValid() {
    if (this.isAdvancedPaymentStrategy) {
      return (
        this.loanProductDetailsForm.valid &&
        this.loanProductCurrencyForm.valid &&
        this.loanProductTermsForm.valid &&
        this.loanProductSettingsForm.valid &&
        this.loanIncomeCapitalizationForm.valid &&
        this.loanProductAccountingForm.valid
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

  get loanProduct() {
    const loanProduct = {
      ...this.loanProductDetailsStep.loanProductDetails,
      ...this.loanProductCurrencyStep.loanProductCurrency,
      ...this.loanProductTermsStep.loanProductTerms,
      ...this.loanProductSettingsStep.loanProductSettings,
      ...this.loanProductChargesStep.loanProductCharges,
      ...this.loanProductAccountingStep.loanProductAccounting
    };
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['paymentAllocation'] = this.paymentAllocation;
      loanProduct['creditAllocation'] = this.creditAllocation;
      loanProduct['supportedInterestRefundTypes'] = this.supportedInterestRefundTypes;
      if (this.deferredIncomeRecognition.capitalizedIncome != null) {
        loanProduct['enableIncomeCapitalization'] =
          this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization;
        if (this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization) {
          loanProduct['capitalizedIncomeCalculationType'] =
            this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType;
          loanProduct['capitalizedIncomeStrategy'] =
            this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy;
          loanProduct['capitalizedIncomeType'] = this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType;
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
    return loanProduct;
  }

  submit() {
    const loanProduct = this.loanProducts.buildPayload(this.loanProduct, this.itemsByDefault);
    if (loanProduct['useDueForRepaymentsConfigurations'] === true) {
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

    this.productsService.createLoanProduct(loanProduct).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }

  mapStringEnumOptionToIdList(incomingValues: StringEnumOptionData[]): string[] {
    if (!incomingValues) {
      return [];
    }
    return incomingValues.map((v) => v.id);
  }
}
