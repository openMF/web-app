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

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { LoanProducts } from '../loan-products';
import { PaymentAllocation, PaymentAllocationTransactionType, PaymentAllocationTransactionTypes, PaymentAllocationTypes } from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';

@Component({
  selector: 'mifosx-create-loan-product',
  templateUrl: './create-loan-product.component.html',
  styleUrls: ['./create-loan-product.component.scss']
})
export class CreateLoanProductComponent implements OnInit {

  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent, { static: true }) loanProductCurrencyStep: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true }) loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true }) loanProductAccountingStep: LoanProductAccountingStepComponent;

  loanProductsTemplate: any;
  accountingRuleData = ['None', 'Cash', 'Accrual (periodic)', 'Accrual (upfront)'];
  itemsByDefault: any[] = [];

  isAdvancedPaymentStrategy = false;
  paymentAllocation: PaymentAllocation[] = [];
  transactionTypes: PaymentAllocationTransactionType[] = [
    PaymentAllocationTransactionTypes.DEFAULT_TRANSACTION
  ];

   /**
    * @param {ActivatedRoute} route Activated Route.
    * @param {ProductsService} productsService Product Service.
    * @param {LoanProducts} loanProducts LoanProducts
    * @param {Router} router Router for navigation.
    */

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private loanProducts: LoanProducts,
              private router: Router) {
    this.route.data.subscribe((data: { loanProductsTemplate: any, configurations: any }) => {
      this.loanProductsTemplate = data.loanProductsTemplate;
      const assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
      const liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
      this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions = assetAccountData.concat(liabilityAccountData);

      this.itemsByDefault = loanProducts.setItemsByDefault(data.configurations);
      this.loanProductsTemplate['itemsByDefault'] = this.itemsByDefault;
      this.loanProductsTemplate = loanProducts.updateLoanProductDefaults(this.loanProductsTemplate, false);
    });
  }

  ngOnInit() { }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
  }

  get loanProductCurrencyForm() {
    if (this.loanProductCurrencyStep != null) {
      return this.loanProductCurrencyStep.loanProductCurrencyForm;
    }
  }

  get loanProductTermsForm() {
    return this.loanProductTermsStep.loanProductTermsForm;
  }

  advancePaymentStrategy(value: string) {
    this.isAdvancedPaymentStrategy = (value === 'advanced-payment-allocation-strategy');
  }

  setPaymentAllocation(paymentAllocation: PaymentAllocation[]) {
    this.paymentAllocation = paymentAllocation;
  }

  get loanProductSettingsForm() {
    return this.loanProductSettingsStep.loanProductSettingsForm;
  }

  get loanProductAccountingForm() {
    return this.loanProductAccountingStep.loanProductAccountingForm;
  }

  get loanProductFormValid() {
    return (
      this.loanProductDetailsForm.valid &&
      this.loanProductCurrencyForm.valid &&
      this.loanProductTermsForm.valid &&
      this.loanProductSettingsForm.valid &&
      this.loanProductAccountingForm.valid
    );
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
    }
    return loanProduct;
  }

  submit() {
    const loanProduct = this.loanProducts.buildPayload(this.loanProduct, this.itemsByDefault);

    this.productsService.createLoanProduct(loanProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
      });
  }

}
