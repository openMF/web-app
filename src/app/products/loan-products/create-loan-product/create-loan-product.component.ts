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
import { LoanProductOrganizationUnitStepComponent } from '../loan-product-stepper/loan-product-organization-unit-step/loan-product-organization-unit-step.component';
import { LoanProductClientEligibilityStepComponent } from '../loan-product-stepper/loan-product-client-eligibility-step/loan-product-client-eligibility-step.component';
import { LoanProductAppsComponent } from '../loan-product-stepper/loan-product-apps/loan-product-apps.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-create-loan-product',
  templateUrl: './create-loan-product.component.html',
  styleUrls: ['./create-loan-product.component.scss']
})
export class CreateLoanProductComponent implements OnInit {

  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent, { static: true }) loanProductCurrencyStep: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductOrganizationUnitStepComponent, { static: true }) loanProductOrganizationStep: LoanProductOrganizationUnitStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true }) loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true }) loanProductAccountingStep: LoanProductAccountingStepComponent;
  @ViewChild(LoanProductClientEligibilityStepComponent, { static: true }) loanProductClientEligibilityStep: LoanProductClientEligibilityStepComponent;
  @ViewChild(LoanProductAppsComponent, { static: true }) loanProductAppsStep: LoanProductAppsComponent;

  loanProductsTemplate: any;
  accountingRuleData = ['None', 'Cash', 'Accrual (periodic)', 'Accrual (upfront)'];

   /**
    * @param {ActivatedRoute} route Activated Route.
    * @param {ProductsService} productsService Product Service.
    * @param {SettingsService} settingsService Settings Service
    * @param {Router} router Router for navigation.
    */

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private settingsService: SettingsService,
              private router: Router) {
    this.route.data.subscribe((data: { loanProductsTemplate: any }) => {
      this.loanProductsTemplate = data.loanProductsTemplate;
    });
  }

  ngOnInit() {
  }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
  }

  get loanProductCurrencyForm() {
    return this.loanProductCurrencyStep.loanProductCurrencyForm;
  }

  get loanProductOrganizationForm() {
    return this.loanProductOrganizationStep.loanProductOrganizationForm;
  }

  get loanProductTermsForm() {
    return this.loanProductTermsStep.loanProductTermsForm;
  }

  get loanProductSettingsForm() {
    return this.loanProductSettingsStep.loanProductSettingsForm;
  }

  get loanProductAccountingForm() {
    return this.loanProductAccountingStep.loanProductAccountingForm;
  }

  get loanProductClientEligibilityForm() {
    return this.loanProductClientEligibilityStep?.loanProductClientEligibilityForm;
  }

  get loanProductAppsForm() {
    return this.loanProductAppsStep?.loanProductAppsForm;
  }

  get loanProductFormValid() {
    return (
      this.loanProductDetailsForm.valid &&
      this.loanProductCurrencyForm.valid &&
      this.loanProductOrganizationForm.valid &&
      this.loanProductAppsForm.valid &&
      this.loanProductTermsForm.valid &&
      this.loanProductClientEligibilityForm.valid &&
      this.loanProductSettingsForm.valid &&
      this.loanProductAccountingForm.valid
    );
  }

  get loanProduct() {
    return {
      ...this.loanProductDetailsStep.loanProductDetails,
      ...this.loanProductCurrencyStep.loanProductCurrency,
      ...this.loanProductOrganizationStep.loanProductOrganization,
      ...this.loanProductAppsStep.loanProductApps,
      ...this.loanProductTermsStep.loanProductTerms,
      ...this.loanProductClientEligibilityStep.loanProductClientEligibility,
      ...this.loanProductSettingsStep.loanProductSettings,
      ...this.loanProductChargesStep.loanProductCharges,
      ...this.loanProductAccountingStep.loanProductAccounting
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const dateFormat = this.settingsService.dateFormat;
    const loanProduct = {
      ...this.loanProduct,
      charges: this.loanProduct.charges.map((charge: any) => ({ id: charge.id })),
      dateFormat,
      locale: this.settingsService.language.code
    };
    delete loanProduct.allowAttributeConfiguration;
    delete loanProduct.advancedAccountingRules;
    this.productsService.createLoanProduct(loanProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
      });
  }

}
