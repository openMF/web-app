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
    SavingProductsComponent
  ],
  entryComponents: [
  ],
  providers: [DatePipe]
})
export class ProductsModule { }
