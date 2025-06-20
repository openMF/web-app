/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Components */
import { ShareProductDetailsStepComponent } from '../share-product-stepper/share-product-details-step/share-product-details-step.component';
import { ShareProductCurrencyStepComponent } from '../share-product-stepper/share-product-currency-step/share-product-currency-step.component';
import { ShareProductTermsStepComponent } from '../share-product-stepper/share-product-terms-step/share-product-terms-step.component';
import { ShareProductSettingsStepComponent } from '../share-product-stepper/share-product-settings-step/share-product-settings-step.component';
import { ShareProductMarketPriceStepComponent } from '../share-product-stepper/share-product-market-price-step/share-product-market-price-step.component';
import { ShareProductChargesStepComponent } from '../share-product-stepper/share-product-charges-step/share-product-charges-step.component';
import { ShareProductAccountingStepComponent } from '../share-product-stepper/share-product-accounting-step/share-product-accounting-step.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Accounting } from 'app/core/utils/accounting';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ShareProductPreviewStepComponent } from '../share-product-stepper/share-product-preview-step/share-product-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-share-product',
  templateUrl: './edit-share-product.component.html',
  styleUrls: ['./edit-share-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    ShareProductDetailsStepComponent,
    ShareProductCurrencyStepComponent,
    ShareProductTermsStepComponent,
    ShareProductSettingsStepComponent,
    ShareProductMarketPriceStepComponent,
    ShareProductChargesStepComponent,
    ShareProductAccountingStepComponent,
    ShareProductPreviewStepComponent
  ]
})
export class EditShareProductComponent {
  @ViewChild(ShareProductDetailsStepComponent, { static: true })
  shareProductDetailsStep: ShareProductDetailsStepComponent;
  @ViewChild(ShareProductCurrencyStepComponent, { static: true })
  shareProductCurrencyStep: ShareProductCurrencyStepComponent;
  @ViewChild(ShareProductTermsStepComponent, { static: true }) shareProductTermsStep: ShareProductTermsStepComponent;
  @ViewChild(ShareProductSettingsStepComponent, { static: true })
  shareProductSettingsStep: ShareProductSettingsStepComponent;
  @ViewChild(ShareProductMarketPriceStepComponent, { static: true })
  shareProductMarketPriceStep: ShareProductMarketPriceStepComponent;
  @ViewChild(ShareProductChargesStepComponent, { static: true })
  shareProductChargesStep: ShareProductChargesStepComponent;
  @ViewChild(ShareProductAccountingStepComponent, { static: true })
  shareProductAccountingStep: ShareProductAccountingStepComponent;

  shareProductAndTemplate: any;
  accountingRuleData: string[] = [];

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ProductsService} productsService Products Service.
   * @param {Router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   */

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
    private settingsService: SettingsService,
    private accounting: Accounting
  ) {
    this.route.data.subscribe((data: { shareProductAndTemplate: any }) => {
      this.shareProductAndTemplate = data.shareProductAndTemplate;
    });
    this.accountingRuleData = this.accounting.getAccountingRulesForShares();
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
      (!this.shareProductDetailsForm.pristine ||
        !this.shareProductCurrencyForm.pristine ||
        !this.shareProductTermsForm.pristine ||
        !this.shareProductSettingsForm.pristine ||
        !this.shareProductMarketPriceForm.pristine ||
        !this.shareProductChargesStep.pristine ||
        !this.shareProductAccountingForm.pristine)
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
      locale: this.settingsService.language.code // locale required for digitsAfterDecimal
    };
    this.productsService
      .updateShareProduct(this.shareProductAndTemplate.id, shareProduct)
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      });
  }
}
