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
import { ManageTaxConfigurationsComponent } from './manage-tax-configurations/manage-tax-configurations.component';
import { RecurringDepositProductsComponent } from './recurring-deposit-products/recurring-deposit-products.component';
import { ChargesComponent } from './charges/charges.component';
import { FixedDepositProductsComponent } from './fixed-deposit-products/fixed-deposit-products.component';
import { ProductsMixComponent } from './products-mix/products-mix.component';
import { ManageTaxComponentsComponent } from './manage-tax-components/manage-tax-components.component';

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
    ManageTaxConfigurationsComponent,
    RecurringDepositProductsComponent,
    ChargesComponent,
    FixedDepositProductsComponent,
    ProductsMixComponent,
    ManageTaxComponentsComponent
  ],
  entryComponents: [
  ],
  providers: [DatePipe]
})
export class ProductsModule { }
