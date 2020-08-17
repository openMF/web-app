import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SavingProductDetailsStepComponent } from '../saving-product-stepper/saving-product-details-step/saving-product-details-step.component';
import { SavingProductCurrencyStepComponent } from '../saving-product-stepper/saving-product-currency-step/saving-product-currency-step.component';
import { SavingProductTermsStepComponent } from '../saving-product-stepper/saving-product-terms-step/saving-product-terms-step.component';
import { SavingProductSettingsStepComponent } from '../saving-product-stepper/saving-product-settings-step/saving-product-settings-step.component';
import { SavingProductChargesStepComponent } from '../saving-product-stepper/saving-product-charges-step/saving-product-charges-step.component';
import { SavingProductAccountingStepComponent } from '../saving-product-stepper/saving-product-accounting-step/saving-product-accounting-step.component';

import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-edit-saving-product',
  templateUrl: './edit-saving-product.component.html',
  styleUrls: ['./edit-saving-product.component.scss']
})
export class EditSavingProductComponent implements OnInit {

  @ViewChild(SavingProductDetailsStepComponent, { static: true }) savingProductDetailsStep: SavingProductDetailsStepComponent;
  @ViewChild(SavingProductCurrencyStepComponent, { static: true }) savingProductCurrencyStep: SavingProductCurrencyStepComponent;
  @ViewChild(SavingProductTermsStepComponent, { static: true }) savingProductTermsStep: SavingProductTermsStepComponent;
  @ViewChild(SavingProductSettingsStepComponent, { static: true }) savingProductSettingsStep: SavingProductSettingsStepComponent;
  @ViewChild(SavingProductChargesStepComponent, { static: true }) savingProductChargesStep: SavingProductChargesStepComponent;
  @ViewChild(SavingProductAccountingStepComponent, { static: true }) savingProductAccountingStep: SavingProductAccountingStepComponent;

  savingProductAndTemplate: any;
  accountingRuleData = ['None', 'Cash'];

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private router: Router) {
    this.route.data.subscribe((data: { savingProductAndTemplate: any }) => {
      this.savingProductAndTemplate = data.savingProductAndTemplate;
    });
  }

  ngOnInit() {
  }

  get savingProductDetailsForm() {
    return this.savingProductDetailsStep.savingProductDetailsForm;
  }

  get savingProductCurrencyForm() {
    return this.savingProductCurrencyStep.savingProductCurrencyForm;
  }

  get savingProductTermsForm() {
    return this.savingProductTermsStep.savingProductTermsForm;
  }

  get savingProductSettingsForm() {
    return this.savingProductSettingsStep.savingProductSettingsForm;
  }

  get savingProductAccountingForm() {
    return this.savingProductAccountingStep.savingProductAccountingForm;
  }

  get savingProductFormValidAndNotPristine() {
    return (
      this.savingProductDetailsForm.valid &&
      this.savingProductCurrencyForm.valid &&
      this.savingProductTermsForm.valid &&
      this.savingProductSettingsForm.valid &&
      this.savingProductAccountingForm.valid &&
      (
        !this.savingProductDetailsForm.pristine ||
        !this.savingProductCurrencyForm.pristine ||
        !this.savingProductTermsForm.pristine ||
        !this.savingProductSettingsForm.pristine ||
        !this.savingProductChargesStep.pristine ||
        !this.savingProductAccountingForm.pristine
      )
    );
  }

  get savingProduct() {
    return {
      ...this.savingProductDetailsStep.savingProductDetails,
      ...this.savingProductCurrencyStep.savingProductCurrency,
      ...this.savingProductTermsStep.savingProductTerms,
      ...this.savingProductSettingsStep.savingProductSettings,
      ...this.savingProductChargesStep.savingProductCharges,
      ...this.savingProductAccountingStep.savingProductAccounting
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const savingProduct = {
      ...this.savingProduct,
      charges: this.savingProduct.charges.map((charge: any) => ({ id: charge.id })),
      locale: 'en' // locale required for nominalAnnualInterestRate
    };
    delete savingProduct.advancedAccountingRules;
    this.productsService.updateSavingProduct(this.savingProductAndTemplate.id, savingProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
