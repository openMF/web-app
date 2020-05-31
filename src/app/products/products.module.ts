/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';

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
import { ViewChargeComponent } from './charges/view-charge/view-charge.component';
import { FixedDepositProductsComponent } from './fixed-deposit-products/fixed-deposit-products.component';
import { ProductsMixComponent } from './products-mix/products-mix.component';
import { ViewProductMixComponent } from './products-mix/view-product-mix/view-product-mix.component';
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
import { ViewShareProductComponent } from './share-products/view-share-product/view-share-product.component';
import { EditShareProductComponent } from './share-products/edit-share-product/edit-share-product.component';
import { CreateFixedDepositProductComponent } from './fixed-deposit-products/create-fixed-deposit-product/create-fixed-deposit-product.component';
import { FixedDepositProductDetailsStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-details-step/fixed-deposit-product-details-step.component';
import { FixedDepositProductCurrencyStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-currency-step/fixed-deposit-product-currency-step.component';
import { FixedDepositProductTermsStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-terms-step/fixed-deposit-product-terms-step.component';
import { FixedDepositProductSettingsStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-settings-step/fixed-deposit-product-settings-step.component';
import { FixedDepositProductInterestRateChartStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-interest-rate-chart-step/fixed-deposit-product-interest-rate-chart-step.component';
import { FixedDepositProductChargesStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-charges-step/fixed-deposit-product-charges-step.component';
import { FixedDepositProductAccountingStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-accounting-step/fixed-deposit-product-accounting-step.component';
import { FixedDepositProductPreviewStepComponent } from './fixed-deposit-products/fixed-deposit-product-stepper/fixed-deposit-product-preview-step/fixed-deposit-product-preview-step.component';
import { DepositProductIncentiveFormDialogComponent } from './deposit-product-incentive-form-dialog/deposit-product-incentive-form-dialog.component';
import { ManageTaxGroupsComponent } from './manage-tax-groups/manage-tax-groups.component';
import { ViewTaxComponentComponent } from './manage-tax-components/view-tax-component/view-tax-component.component';
import { FloatingRatesComponent } from './floating-rates/floating-rates.component';
import { CreateFloatingRateComponent } from './floating-rates/create-floating-rate/create-floating-rate.component';
import { ViewFloatingRateComponent } from './floating-rates/view-floating-rate/view-floating-rate.component';
import { EditFloatingRateComponent } from './floating-rates/edit-floating-rate/edit-floating-rate.component';
import { FloatingRatePeriodDialogComponent } from './floating-rates/floating-rate-period-dialog/floating-rate-period-dialog.component';
import { CreateTaxComponentComponent } from './manage-tax-components/create-tax-component/create-tax-component.component';
import { EditTaxComponentComponent } from './manage-tax-components/edit-tax-component/edit-tax-component.component';
import { EditChargeComponent } from './charges/edit-charge/edit-charge.component';
import { MatFormFieldModule, MatSelectModule, MatOptionModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewTaxGroupComponent } from './manage-tax-groups/view-tax-group/view-tax-group.component';
import { ShareProductsDividendsComponent } from './share-products/dividends-share-product/dividends.components';

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
    ViewChargeComponent,
    FixedDepositProductsComponent,
    ManageTaxComponentsComponent,
    ProductsMixComponent,
    FloatingRatesComponent,
    CreateFloatingRateComponent,
    ViewFloatingRateComponent,
    EditFloatingRateComponent,
    FloatingRatePeriodDialogComponent,
    ViewProductMixComponent,
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
    CreateShareProductComponent,
    ViewShareProductComponent,
    EditShareProductComponent,
    CreateFixedDepositProductComponent,
    FixedDepositProductDetailsStepComponent,
    FixedDepositProductCurrencyStepComponent,
    FixedDepositProductTermsStepComponent,
    FixedDepositProductSettingsStepComponent,
    FixedDepositProductInterestRateChartStepComponent,
    FixedDepositProductChargesStepComponent,
    FixedDepositProductAccountingStepComponent,
    FixedDepositProductPreviewStepComponent,
    DepositProductIncentiveFormDialogComponent,
    ManageTaxGroupsComponent,
    ViewTaxComponentComponent,
    CreateTaxComponentComponent,
    EditTaxComponentComponent,
    EditChargeComponent,
    ViewTaxGroupComponent,
    ShareProductsDividendsComponent
  ],
  entryComponents: [
    FloatingRatePeriodDialogComponent
  ],
  providers: [DatePipe]
})
export class ProductsModule { }
