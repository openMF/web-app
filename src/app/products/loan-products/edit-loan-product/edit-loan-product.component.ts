/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { LoanProductDetailsStepComponent } from '../loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
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
  selector: 'mifosx-edit-loan-product',
  templateUrl: './edit-loan-product.component.html',
  styleUrls: ['./edit-loan-product.component.scss']
})
export class EditLoanProductComponent implements OnInit {

  @ViewChild(LoanProductDetailsStepComponent, { static: true }) loanProductDetailsStep: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductTermsStepComponent, { static: true }) loanProductTermsStep: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent, { static: true }) loanProductSettingsStep: LoanProductSettingsStepComponent;
  @ViewChild(LoanProductChargesStepComponent, { static: true }) loanProductChargesStep: LoanProductChargesStepComponent;
  @ViewChild(LoanProductAccountingStepComponent, { static: true }) loanProductAccountingStep: LoanProductAccountingStepComponent;
  @ViewChild(LoanProductOrganizationUnitStepComponent, { static: true }) loanProductOrganizationStep: LoanProductOrganizationUnitStepComponent;
  @ViewChild(LoanProductClientEligibilityStepComponent, { static: true }) loanProductClientEligibilityStep: LoanProductClientEligibilityStepComponent;
  @ViewChild(LoanProductAppsComponent, { static: true }) loanProductAppsStep: LoanProductAppsComponent;

  loanProductAndTemplate: any;
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
    this.route.data.subscribe((data: { loanProductAndTemplate: any }) => {
      this.loanProductAndTemplate = data.loanProductAndTemplate;
    });
  }

  ngOnInit() {
  }

  get loanProductDetailsForm() {
    return this.loanProductDetailsStep.loanProductDetailsForm;
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

  get loanProductOrganizationForm() {
    return this.loanProductOrganizationStep.loanProductOrganizationForm;
  }

  get loanProductClientEligibilityForm() {
    return this.loanProductClientEligibilityStep?.loanProductClientEligibilityForm;
  }

  get loanProductAppsForm() {
    return this.loanProductAppsStep?.loanProductAppsForm;
  }

  get loanProductFormValidAndNotPristine() {
    return (
      this.loanProductDetailsForm.valid &&
      this.loanProductOrganizationForm.valid &&
      this.loanProductAppsForm.valid &&
      this.loanProductTermsForm.valid &&
      this.loanProductSettingsForm.valid &&
      this.loanProductAccountingForm.valid &&
      this.loanProductClientEligibilityForm.valid &&
      (
        !this.loanProductDetailsForm.pristine ||
        !this.loanProductTermsForm.pristine ||
        !this.loanProductSettingsForm.pristine ||
        !this.loanProductChargesStep.pristine ||
        !this.loanProductAccountingForm.pristine ||
        !this.loanProductOrganizationForm.pristine ||
        !this.loanProductClientEligibilityForm.pristine ||
        !this.loanProductAppsForm.pristine
      )
    );
  }

  get loanProduct() {
    return {
      ...this.loanProductDetailsStep.loanProductDetails,
      ...this.loanProductOrganizationStep.loanProductOrganization,
      ...this.loanProductTermsStep.loanProductTerms,
      ...this.loanProductSettingsStep.loanProductSettings,
      ...this.loanProductChargesStep.loanProductCharges,
      ...this.loanProductAccountingStep.loanProductAccounting,
      ...this.loanProductClientEligibilityStep.loanProductClientEligibility,
      ...this.loanProductAppsStep.loanProductApps
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
    this.productsService.updateLoanProduct(this.loanProductAndTemplate.id, loanProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
      });
  }


}
