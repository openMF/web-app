/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';
import { PipesModule } from 'app/pipes/pipes.module';

/** Custom Components */
import { ProductsComponent } from './products.component';
import { LoanProductsComponent } from './loan-products/loan-products.component';
import { LoanProductDetailsStepComponent } from './loan-products/loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
import { LoanProductCurrencyStepComponent } from './loan-products/loan-product-stepper/loan-product-currency-step/loan-product-currency-step.component';
import { LoanProductTermsStepComponent } from './loan-products/loan-product-stepper/loan-product-terms-step/loan-product-terms-step.component';
import { LoanProductSettingsStepComponent } from './loan-products//loan-product-stepper/loan-product-settings-step/loan-product-settings-step.component';
import { LoanProductChargesStepComponent } from './loan-products/loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductAccountingStepComponent } from './loan-products/loan-product-stepper/loan-product-accounting-step/loan-product-accounting-step.component';
import { LoanProductPreviewStepComponent } from './loan-products/loan-product-stepper/loan-product-preview-step/loan-product-preview-step.component';
import { CreateLoanProductComponent } from './loan-products/create-loan-product/create-loan-product.component';
import { ManageTaxConfigurationsComponent } from './manage-tax-configurations/manage-tax-configurations.component';
import { RecurringDepositProductsComponent } from './recurring-deposit-products/recurring-deposit-products.component';
import { ChargesComponent } from './charges/charges.component';
import { FixedDepositProductsComponent } from './fixed-deposit-products/fixed-deposit-products.component';
import { ProductsMixComponent } from './products-mix/products-mix.component';
import { ManageTaxComponentsComponent } from './manage-tax-components/manage-tax-components.component';
import { ViewLoanProductComponent } from './loan-products/view-loan-product/view-loan-product.component';
import { EditLoanProductComponent } from './loan-products/edit-loan-product/edit-loan-product.component';
import { SavingProductsComponent } from './saving-products/saving-products.component';
import { SavingProductDetailsStepComponent } from './saving-products/saving-product-stepper/saving-product-details-step/saving-product-details-step.component';
import { SavingProductCurrencyStepComponent } from './saving-products/saving-product-stepper/saving-product-currency-step/saving-product-currency-step.component';
import { SavingProductTermsStepComponent } from './saving-products/saving-product-stepper/saving-product-terms-step/saving-product-terms-step.component';
import { SavingProductSettingsStepComponent } from './saving-products/saving-product-stepper/saving-product-settings-step/saving-product-settings-step.component';
import { SavingProductChargesStepComponent } from './saving-products/saving-product-stepper/saving-product-charges-step/saving-product-charges-step.component';
import { SavingProductAccountingStepComponent } from './saving-products/saving-product-stepper/saving-product-accounting-step/saving-product-accounting-step.component';
import { SavingProductPreviewStepComponent } from './saving-products/saving-product-stepper/saving-product-preview-step/saving-product-preview-step.component';
import { CreateSavingProductComponent } from './saving-products/create-saving-product/create-saving-product.component';
import { ViewSavingProductComponent } from './saving-products/view-saving-product/view-saving-product.component';
import { EditSavingProductComponent } from './saving-products/edit-saving-product/edit-saving-product.component';
import { ShareProductsComponent } from './share-products/share-products.component';
import { ShareProductDetailsStepComponent } from './share-products/share-product-stepper/share-product-details-step/share-product-details-step.component';
import { ShareProductCurrencyStepComponent } from './share-products/share-product-stepper/share-product-currency-step/share-product-currency-step.component';
import { ShareProductTermsStepComponent } from './share-products/share-product-stepper/share-product-terms-step/share-product-terms-step.component';
import { ShareProductSettingsStepComponent } from './share-products/share-product-stepper/share-product-settings-step/share-product-settings-step.component';
import { ShareProductMarketPriceStepComponent } from './share-products/share-product-stepper/share-product-market-price-step/share-product-market-price-step.component';
import { ShareProductChargesStepComponent } from './share-products/share-product-stepper/share-product-charges-step/share-product-charges-step.component';
import { ShareProductAccountingStepComponent } from './share-products/share-product-stepper/share-product-accounting-step/share-product-accounting-step.component';
import { ShareProductPreviewStepComponent } from './share-products/share-product-stepper/share-product-preview-step/share-product-preview-step.component';
import { CreateShareProductComponent } from './share-products/create-share-product/create-share-product.component';

/**
 * Products Module
 *
 * All components related to product functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ProductsRoutingModule,
    PipesModule
  ],
  declarations: [
    ProductsComponent,
    LoanProductsComponent,
    LoanProductDetailsStepComponent,
    LoanProductCurrencyStepComponent,
    LoanProductTermsStepComponent,
    LoanProductSettingsStepComponent,
    LoanProductChargesStepComponent,
    LoanProductAccountingStepComponent,
    LoanProductPreviewStepComponent,
    CreateLoanProductComponent,
    ManageTaxConfigurationsComponent,
    RecurringDepositProductsComponent,
    ChargesComponent,
    FixedDepositProductsComponent,
    ProductsMixComponent,
    ManageTaxComponentsComponent,
    ViewLoanProductComponent,
    EditLoanProductComponent,
    SavingProductsComponent,
    SavingProductDetailsStepComponent,
    SavingProductCurrencyStepComponent,
    SavingProductTermsStepComponent,
    SavingProductSettingsStepComponent,
    SavingProductChargesStepComponent,
    SavingProductAccountingStepComponent,
    SavingProductPreviewStepComponent,
    CreateSavingProductComponent,
    ViewSavingProductComponent,
    EditSavingProductComponent,
    ShareProductsComponent,
    ShareProductDetailsStepComponent,
    ShareProductCurrencyStepComponent,
    ShareProductTermsStepComponent,
    ShareProductSettingsStepComponent,
    ShareProductMarketPriceStepComponent,
    ShareProductChargesStepComponent,
    ShareProductAccountingStepComponent,
    ShareProductPreviewStepComponent,
    CreateShareProductComponent
  ],
  entryComponents: [
  ],
  providers: [DatePipe]
})
export class ProductsModule { }
