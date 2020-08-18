/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

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
import { ViewTaxGroupComponent } from './manage-tax-groups/view-tax-group/view-tax-group.component';
import { ShareProductsDividendsComponent } from './share-products/dividends-share-product/dividends.components';
import { ViewRecurringDepositProductComponent } from './recurring-deposit-products/view-recurring-deposit-product/view-recurring-deposit-product.component';
import { CreateRecurringDepositProductComponent } from './recurring-deposit-products/create-recurring-deposit-product/create-recurring-deposit-product.component';
import { RecurringDepositProductAccountingStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-accounting-step/recurring-deposit-product-accounting-step.component';
import { RecurringDepositProductChargesStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-charges-step/recurring-deposit-product-charges-step.component';
import { RecurringDepositProductCurrencyStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-currency-step/recurring-deposit-product-currency-step.component';
import { RecurringDepositProductDetailsStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-details-step/recurring-deposit-product-details-step.component';
import { RecurringDepositProductInterestRateChartStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-interest-rate-chart-step/recurring-deposit-product-interest-rate-chart-step.component';
import { RecurringDepositProductPreviewStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-preview-step/recurring-deposit-product-preview-step.component';
import { RecurringDepositProductSettingsStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-settings-step/recurring-deposit-product-settings-step.component';
import { RecurringDepositProductTermsStepComponent } from './recurring-deposit-products/recurring-deposit-product-stepper/recurring-deposit-product-terms-step/recurring-deposit-product-terms-step.component';
import { EditRecurringDepositProductComponent } from './recurring-deposit-products/edit-recurring-deposit-product/edit-recurring-deposit-product.component';
import { CreateDividendComponent } from './share-products/create-dividend/create-dividend.component';
import { ViewDividendComponent } from './share-products/view-dividend/view-dividend.component';
import { ViewFixedDepositProductComponent } from './fixed-deposit-products/view-fixed-deposit-product/view-fixed-deposit-product.component';
import { CreateTaxGroupComponent } from './manage-tax-groups/create-tax-group/create-tax-group.component';
import { EditTaxGroupComponent } from './manage-tax-groups/edit-tax-group/edit-tax-group.component';
import { CreateProductMixComponent } from './products-mix/create-product-mix/create-product-mix.component';
import { EditProductMixComponent } from './products-mix/edit-product-mix/edit-product-mix.component';
import { CreateChargeComponent } from './charges/create-charge/create-charge.component';
import { EditFixedDepositProductComponent } from './fixed-deposit-products/edit-fixed-deposit-product/edit-fixed-deposit-product.component';

/**
 * Products Module
 *
 * All components related to product functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ProductsRoutingModule,
    PipesModule,
    DirectivesModule
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
    ManageTaxGroupsComponent,
    ViewTaxComponentComponent,
    CreateTaxComponentComponent,
    EditTaxComponentComponent,
    EditChargeComponent,
    ViewTaxGroupComponent,
    ShareProductsDividendsComponent,
    DepositProductIncentiveFormDialogComponent,
    ViewRecurringDepositProductComponent,
    CreateRecurringDepositProductComponent,
    RecurringDepositProductAccountingStepComponent,
    RecurringDepositProductChargesStepComponent,
    RecurringDepositProductCurrencyStepComponent,
    RecurringDepositProductDetailsStepComponent,
    RecurringDepositProductInterestRateChartStepComponent,
    RecurringDepositProductPreviewStepComponent,
    RecurringDepositProductSettingsStepComponent,
    RecurringDepositProductTermsStepComponent,
    EditRecurringDepositProductComponent,
    CreateDividendComponent,
    ViewDividendComponent,
    ViewFixedDepositProductComponent,
    CreateTaxGroupComponent,
    EditTaxGroupComponent,
    CreateProductMixComponent,
    EditProductMixComponent,
    ManageTaxGroupsComponent,
    CreateChargeComponent,
    EditFixedDepositProductComponent
  ],
  providers: [DatePipe]
})
export class ProductsModule { }
