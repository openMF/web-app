import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ShareProductDetailsStepComponent } from '../share-product-stepper/share-product-details-step/share-product-details-step.component';
import { ShareProductCurrencyStepComponent } from '../share-product-stepper/share-product-currency-step/share-product-currency-step.component';
import { ShareProductTermsStepComponent } from '../share-product-stepper/share-product-terms-step/share-product-terms-step.component';
import { ShareProductSettingsStepComponent } from '../share-product-stepper/share-product-settings-step/share-product-settings-step.component';
import { ShareProductMarketPriceStepComponent } from '../share-product-stepper/share-product-market-price-step/share-product-market-price-step.component';
import { ShareProductChargesStepComponent } from '../share-product-stepper/share-product-charges-step/share-product-charges-step.component';
import { ShareProductAccountingStepComponent } from '../share-product-stepper/share-product-accounting-step/share-product-accounting-step.component';

import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-edit-share-product',
  templateUrl: './edit-share-product.component.html',
  styleUrls: ['./edit-share-product.component.scss']
})
export class EditShareProductComponent implements OnInit {

  @ViewChild(ShareProductDetailsStepComponent, { static: true }) shareProductDetailsStep: ShareProductDetailsStepComponent;
  @ViewChild(ShareProductCurrencyStepComponent, { static: true }) shareProductCurrencyStep: ShareProductCurrencyStepComponent;
  @ViewChild(ShareProductTermsStepComponent, { static: true }) shareProductTermsStep: ShareProductTermsStepComponent;
  @ViewChild(ShareProductSettingsStepComponent, { static: true }) shareProductSettingsStep: ShareProductSettingsStepComponent;
  @ViewChild(ShareProductMarketPriceStepComponent, { static: true }) shareProductMarketPriceStep: ShareProductMarketPriceStepComponent;
  @ViewChild(ShareProductChargesStepComponent, { static: true }) shareProductChargesStep: ShareProductChargesStepComponent;
  @ViewChild(ShareProductAccountingStepComponent, { static: true }) shareProductAccountingStep: ShareProductAccountingStepComponent;

  shareProductAndTemplate: any;
  accountingRuleData = ['None', 'Cash'];

  constructor(private route: ActivatedRoute,
              private productsService: ProductsService,
              private router: Router) {
    this.route.data.subscribe((data: { shareProductAndTemplate: any }) => {
      this.shareProductAndTemplate = data.shareProductAndTemplate;
    });
  }

  ngOnInit() {
  }

  get shareProductDetailsForm() {
    return this.shareProductDetailsStep.shareProductDetailsForm;
  }

  get shareProductCurrencyForm() {
    return this.shareProductCurrencyStep.shareProductCurrencyForm;
  }

  get shareProductTermsForm() {
    return this.shareProductTermsStep.shareProductTermsForm;
  }

  get shareProductSettingsForm() {
    return this.shareProductSettingsStep.shareProductSettingsForm;
  }

  get shareProductMarketPriceForm() {
    return this.shareProductMarketPriceStep.shareProductMarketPriceForm;
  }

  get shareProductAccountingForm() {
    return this.shareProductAccountingStep.shareProductAccountingForm;
  }

  get shareProductFormValidAndNotPristine() {
    return (
      this.shareProductDetailsForm.valid &&
      this.shareProductCurrencyForm.valid &&
      this.shareProductTermsForm.valid &&
      this.shareProductSettingsForm.valid &&
      this.shareProductMarketPriceForm.valid &&
      this.shareProductAccountingForm.valid &&
      (
        !this.shareProductDetailsForm.pristine ||
        !this.shareProductCurrencyForm.pristine ||
        !this.shareProductTermsForm.pristine ||
        !this.shareProductSettingsForm.pristine ||
        !this.shareProductMarketPriceForm.pristine ||
        !this.shareProductChargesStep.pristine ||
        !this.shareProductAccountingForm.pristine
      )
    );
  }

  get shareProduct() {
    return {
      ...this.shareProductDetailsStep.shareProductDetails,
      ...this.shareProductCurrencyStep.shareProductCurrency,
      ...this.shareProductTermsStep.shareProductTerms,
      ...this.shareProductSettingsStep.shareProductSettings,
      ...this.shareProductMarketPriceStep.shareProductMarketPrice,
      ...this.shareProductChargesStep.shareProductCharges,
      ...this.shareProductAccountingStep.shareProductAccounting
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const shareProduct = {
      ...this.shareProduct,
      chargesSelected: this.shareProduct.chargesSelected.map((charge: any) => ({ id: charge.id })),
      locale: 'en' // locale required for digitsAfterDecimal
    };
    this.productsService.updateShareProduct(this.shareProductAndTemplate.id, shareProduct)
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
