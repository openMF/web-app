import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FixedDepositProductDetailsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-details-step/fixed-deposit-product-details-step.component';
import { FixedDepositProductCurrencyStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-currency-step/fixed-deposit-product-currency-step.component';
import { FixedDepositProductTermsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-terms-step/fixed-deposit-product-terms-step.component';
import { FixedDepositProductSettingsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-settings-step/fixed-deposit-product-settings-step.component';
import { FixedDepositProductInterestRateChartStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-interest-rate-chart-step/fixed-deposit-product-interest-rate-chart-step.component';
import { FixedDepositProductChargesStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-charges-step/fixed-deposit-product-charges-step.component';
import { FixedDepositProductAccountingStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-accounting-step/fixed-deposit-product-accounting-step.component';

import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-create-fixed-deposit-product',
  templateUrl: './create-fixed-deposit-product.component.html',
  styleUrls: ['./create-fixed-deposit-product.component.scss']
})
export class CreateFixedDepositProductComponent implements OnInit {

  @ViewChild(FixedDepositProductDetailsStepComponent, { static: true }) fixedDepositProductDetailsStep: FixedDepositProductDetailsStepComponent;
  @ViewChild(FixedDepositProductCurrencyStepComponent, { static: true }) fixedDepositProductCurrencyStep: FixedDepositProductCurrencyStepComponent;
  @ViewChild(FixedDepositProductTermsStepComponent, { static: true }) fixedDepositProductTermsStep: FixedDepositProductTermsStepComponent;
  @ViewChild(FixedDepositProductSettingsStepComponent, { static: true }) fixedDepositProductSettingsStep: FixedDepositProductSettingsStepComponent;
  @ViewChild(FixedDepositProductInterestRateChartStepComponent, { static: true }) fixedDepositProductInterestRateChartStep: FixedDepositProductInterestRateChartStepComponent;
  @ViewChild(FixedDepositProductChargesStepComponent, { static: true }) fixedDepositProductChargesStep: FixedDepositProductChargesStepComponent;
  @ViewChild(FixedDepositProductAccountingStepComponent, { static: true }) fixedDepositProductAccountingStep: FixedDepositProductAccountingStepComponent;

  fixedDepositProductsTemplate: any;
  accountingRuleData = ['None', 'Cash'];

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private router: Router) {
    this.route.data.subscribe((data: { fixedDepositProductsTemplate: any }) => {
      this.fixedDepositProductsTemplate = data.fixedDepositProductsTemplate;
    });
  }

  ngOnInit() {
  }

  get fixedDepositProductDetailsForm() {
    return this.fixedDepositProductDetailsStep.fixedDepositProductDetailsForm;
  }

  get fixedDepositProductCurrencyForm() {
    return this.fixedDepositProductCurrencyStep.fixedDepositProductCurrencyForm;
  }

  get fixedDepositProductTermsForm() {
    return this.fixedDepositProductTermsStep.fixedDepositProductTermsForm;
  }

  get fixedDepositProductSettingsForm() {
    return this.fixedDepositProductSettingsStep.fixedDepositProductSettingsForm;
  }

  get fixedDepositProductInterestRateChartForm() {
    return this.fixedDepositProductInterestRateChartStep.fixedDepositProductInterestRateChartForm;
  }

  get fixedDepositProductAccountingForm() {
    return this.fixedDepositProductAccountingStep.fixedDepositProductAccountingForm;
  }

  get fixedDepositProductFormValid() {
    return (
      this.fixedDepositProductDetailsForm.valid &&
      this.fixedDepositProductCurrencyForm.valid &&
      this.fixedDepositProductTermsForm.valid &&
      this.fixedDepositProductSettingsForm.valid &&
      this.fixedDepositProductInterestRateChartForm.valid &&
      this.fixedDepositProductAccountingForm.valid
    );
  }

  get fixedDepositProduct() {
    return {
      ...this.fixedDepositProductDetailsStep.fixedDepositProductDetails,
      ...this.fixedDepositProductCurrencyStep.fixedDepositProductCurrency,
      ...this.fixedDepositProductTermsStep.fixedDepositProductTerms,
      ...this.fixedDepositProductSettingsStep.fixedDepositProductSettings,
      ...this.fixedDepositProductInterestRateChartStep.fixedDepositProductInterestRateChart,
      ...this.fixedDepositProductChargesStep.fixedDepositProductCharges,
      ...this.fixedDepositProductAccountingStep.fixedDepositProductAccounting
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const fixedDepositProduct = {
      ...this.fixedDepositProduct,
      charges: this.fixedDepositProduct.charges.map((charge: any) => ({ id: charge.id })),
      locale: 'en' // locale required for depositAmount
    };
    delete fixedDepositProduct.advancedAccountingRules;
    this.productsService.createFixedDepositProduct(fixedDepositProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
