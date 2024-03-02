/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { RecurringDepositProductDetailsStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-details-step/recurring-deposit-product-details-step.component';
import { RecurringDepositProductCurrencyStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-currency-step/recurring-deposit-product-currency-step.component';
import { RecurringDepositProductTermsStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-terms-step/recurring-deposit-product-terms-step.component';
import { RecurringDepositProductSettingsStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-settings-step/recurring-deposit-product-settings-step.component';
import { RecurringDepositProductInterestRateChartStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-interest-rate-chart-step/recurring-deposit-product-interest-rate-chart-step.component';
import { RecurringDepositProductChargesStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-charges-step/recurring-deposit-product-charges-step.component';
import { RecurringDepositProductAccountingStepComponent } from '../recurring-deposit-product-stepper/recurring-deposit-product-accounting-step/recurring-deposit-product-accounting-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Accounting } from 'app/core/utils/accounting';

@Component({
  selector: 'mifosx-edit-recurring-deposit-product',
  templateUrl: './edit-recurring-deposit-product.component.html',
  styleUrls: ['./edit-recurring-deposit-product.component.scss']
})
export class EditRecurringDepositProductComponent implements OnInit {

  @ViewChild(RecurringDepositProductDetailsStepComponent, { static: true }) recurringDepositProductDetailsStep: RecurringDepositProductDetailsStepComponent;
  @ViewChild(RecurringDepositProductCurrencyStepComponent, { static: true }) recurringDepositProductCurrencyStep: RecurringDepositProductCurrencyStepComponent;
  @ViewChild(RecurringDepositProductTermsStepComponent, { static: true }) recurringDepositProductTermsStep: RecurringDepositProductTermsStepComponent;
  @ViewChild(RecurringDepositProductSettingsStepComponent, { static: true }) recurringDepositProductSettingsStep: RecurringDepositProductSettingsStepComponent;
  @ViewChild(RecurringDepositProductInterestRateChartStepComponent, { static: true }) recurringDepositProductInterestRateChartStep: RecurringDepositProductInterestRateChartStepComponent;
  @ViewChild(RecurringDepositProductChargesStepComponent, { static: true }) recurringDepositProductChargesStep: RecurringDepositProductChargesStepComponent;
  @ViewChild(RecurringDepositProductAccountingStepComponent, { static: true }) recurringDepositProductAccountingStep: RecurringDepositProductAccountingStepComponent;

  recurringDepositProductsTemplate: any;
  accountingRuleData: string[] = [];

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Products Service.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service.
   */

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private router: Router,
              private settingsService: SettingsService,
              private accounting: Accounting) {
    this.route.data.subscribe((data: { recurringDepositProductAndTemplate: any }) => {
      this.recurringDepositProductsTemplate = data.recurringDepositProductAndTemplate;
    });
    this.accountingRuleData = this.accounting.getAccountingRulesForSavings();
  }

  ngOnInit() {
  }

  get recurringDepositProductDetailsForm() {
    return this.recurringDepositProductDetailsStep.recurringDepositProductDetailsForm;
  }

  get recurringDepositProductCurrencyForm() {
    return this.recurringDepositProductCurrencyStep.recurringDepositProductCurrencyForm;
  }

  get recurringDepositProductTermsForm() {
    return this.recurringDepositProductTermsStep.recurringDepositProductTermsForm;
  }

  get recurringDepositProductSettingsForm() {
    return this.recurringDepositProductSettingsStep.recurringDepositProductSettingsForm;
  }

  get recurringDepositProductInterestRateChartForm() {
    return this.recurringDepositProductInterestRateChartStep.recurringDepositProductInterestRateChartForm;
  }

  get recurringDepositProductAccountingForm() {
    return this.recurringDepositProductAccountingStep.recurringDepositProductAccountingForm;
  }

  get recurringDepositProductFormValidAndNotPrinstine() {
    return (
      this.recurringDepositProductDetailsForm.valid &&
      this.recurringDepositProductCurrencyForm.valid &&
      this.recurringDepositProductTermsForm.valid &&
      this.recurringDepositProductSettingsForm.valid &&
      this.recurringDepositProductInterestRateChartForm.valid &&
      this.recurringDepositProductAccountingForm.valid &&
      (
        this.recurringDepositProductDetailsForm.pristine ||
        this.recurringDepositProductCurrencyForm.pristine ||
        this.recurringDepositProductTermsForm.pristine ||
        this.recurringDepositProductSettingsForm.pristine ||
        this.recurringDepositProductInterestRateChartForm.pristine ||
        this.recurringDepositProductAccountingForm.pristine
      )
    );
  }

  get recurringDepositProduct() {
    return {
      ...this.recurringDepositProductDetailsStep.recurringDepositProductDetails,
      ...this.recurringDepositProductCurrencyStep.recurringDepositProductCurrency,
      ...this.recurringDepositProductTermsStep.recurringDepositProductTerms,
      ...this.recurringDepositProductSettingsStep.recurringDepositProductSettings,
      ...this.recurringDepositProductInterestRateChartStep.recurringDepositProductInterestRateChart,
      ...this.recurringDepositProductChargesStep.recurringDepositProductCharges,
      ...this.recurringDepositProductAccountingStep.recurringDepositProductAccounting
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const recurringDepositProduct = {
      ...this.recurringDepositProduct,
      charges: this.recurringDepositProduct.charges.map((charge: any) => ({ id: charge.id })),
      locale: this.settingsService.language.code // locale required for depositAmount
    };
    if (!recurringDepositProduct.description) {
      recurringDepositProduct.description = '';
    }
    delete recurringDepositProduct.advancedAccountingRules;
    this.productsService.updateRecurringDepositProduct(this.recurringDepositProductsTemplate.id, recurringDepositProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
