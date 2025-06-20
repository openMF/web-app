/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { FixedDepositProductDetailsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-details-step/fixed-deposit-product-details-step.component';
import { FixedDepositProductCurrencyStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-currency-step/fixed-deposit-product-currency-step.component';
import { FixedDepositProductTermsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-terms-step/fixed-deposit-product-terms-step.component';
import { FixedDepositProductSettingsStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-settings-step/fixed-deposit-product-settings-step.component';
import { FixedDepositProductInterestRateChartStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-interest-rate-chart-step/fixed-deposit-product-interest-rate-chart-step.component';
import { FixedDepositProductChargesStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-charges-step/fixed-deposit-product-charges-step.component';
import { FixedDepositProductAccountingStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-accounting-step/fixed-deposit-product-accounting-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Accounting } from 'app/core/utils/accounting';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FixedDepositProductPreviewStepComponent } from '../fixed-deposit-product-stepper/fixed-deposit-product-preview-step/fixed-deposit-product-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-fixed-deposit-product',
  templateUrl: './edit-fixed-deposit-product.component.html',
  styleUrls: ['./edit-fixed-deposit-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    FixedDepositProductDetailsStepComponent,
    FixedDepositProductCurrencyStepComponent,
    FixedDepositProductTermsStepComponent,
    FixedDepositProductSettingsStepComponent,
    FixedDepositProductInterestRateChartStepComponent,
    FixedDepositProductChargesStepComponent,
    FixedDepositProductAccountingStepComponent,
    FixedDepositProductPreviewStepComponent
  ]
})
export class EditFixedDepositProductComponent {
  @ViewChild(FixedDepositProductDetailsStepComponent, { static: true })
  fixedDepositProductDetailsStep: FixedDepositProductDetailsStepComponent;
  @ViewChild(FixedDepositProductCurrencyStepComponent, { static: true })
  fixedDepositProductCurrencyStep: FixedDepositProductCurrencyStepComponent;
  @ViewChild(FixedDepositProductTermsStepComponent, { static: true })
  fixedDepositProductTermsStep: FixedDepositProductTermsStepComponent;
  @ViewChild(FixedDepositProductSettingsStepComponent, { static: true })
  fixedDepositProductSettingsStep: FixedDepositProductSettingsStepComponent;
  @ViewChild(FixedDepositProductInterestRateChartStepComponent, { static: true })
  fixedDepositProductInterestRateChartStep: FixedDepositProductInterestRateChartStepComponent;
  @ViewChild(FixedDepositProductChargesStepComponent, { static: true })
  fixedDepositProductChargesStep: FixedDepositProductChargesStepComponent;
  @ViewChild(FixedDepositProductAccountingStepComponent, { static: true })
  fixedDepositProductAccountingStep: FixedDepositProductAccountingStepComponent;

  fixedDepositProductsTemplate: any;
  accountingRuleData: string[] = [];

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Products Service.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private settingsService: SettingsService,
    private accounting: Accounting
  ) {
    this.route.data.subscribe((data: { fixedDepositProductAndTemplate: any }) => {
      this.fixedDepositProductsTemplate = data.fixedDepositProductAndTemplate;
    });
    this.accountingRuleData = this.accounting.getAccountingRulesForSavings();
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

  get fixedDepositProductFormValidAndNotPrinstine() {
    return (
      this.fixedDepositProductDetailsForm.valid &&
      this.fixedDepositProductCurrencyForm.valid &&
      this.fixedDepositProductTermsForm.valid &&
      this.fixedDepositProductSettingsForm.valid &&
      this.fixedDepositProductInterestRateChartForm.valid &&
      this.fixedDepositProductAccountingForm.valid &&
      (this.fixedDepositProductDetailsForm.pristine ||
        this.fixedDepositProductCurrencyForm.pristine ||
        this.fixedDepositProductTermsForm.pristine ||
        this.fixedDepositProductSettingsForm.pristine ||
        this.fixedDepositProductInterestRateChartForm.pristine ||
        this.fixedDepositProductAccountingForm.pristine)
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
    const fixedDepositProduct = {
      ...this.fixedDepositProduct,
      charges: this.fixedDepositProduct.charges.map((charge: any) => ({ id: charge.id })),
      locale: this.settingsService.language.code // locale required for depositAmount
    };
    if (!fixedDepositProduct.description) {
      fixedDepositProduct.description = '';
    }
    const charts: any[] = [];
    fixedDepositProduct.charts.forEach((chart: any) => {
      if (chart['amountRangeFrom'] === '') {
        delete chart['amountRangeFrom'];
      }
      if (chart['amountRangeTo'] === '') {
        delete chart['amountRangeTo'];
      }
      charts.push(chart);
    });
    fixedDepositProduct.charts = charts;

    delete fixedDepositProduct.advancedAccountingRules;
    this.productsService
      .updateFixedDepositProduct(this.fixedDepositProductsTemplate.id, fixedDepositProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
