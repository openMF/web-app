/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ProductsComponent } from './products.component';
import { LoanProductsComponent } from './loan-products/loan-products.component';
import { CreateLoanProductComponent } from './loan-products/create-loan-product/create-loan-product.component';
import { ViewLoanProductComponent } from './loan-products/view-loan-product/view-loan-product.component';
import { EditLoanProductComponent } from './loan-products/edit-loan-product/edit-loan-product.component';
import { SavingProductsComponent } from './saving-products/saving-products.component';
import { CreateSavingProductComponent } from './saving-products/create-saving-product/create-saving-product.component';
import { ViewSavingProductComponent } from './saving-products/view-saving-product/view-saving-product.component';
import { EditSavingProductComponent } from './saving-products/edit-saving-product/edit-saving-product.component';
import { ShareProductsComponent } from './share-products/share-products.component';
import { ManageTaxConfigurationsComponent } from './manage-tax-configurations/manage-tax-configurations.component';
import { RecurringDepositProductsComponent } from './recurring-deposit-products/recurring-deposit-products.component';
import { ChargesComponent } from './charges/charges.component';
import { FixedDepositProductsComponent } from './fixed-deposit-products/fixed-deposit-products.component';
import { ProductsMixComponent } from './products-mix/products-mix.component';
import { ManageTaxComponentsComponent } from './manage-tax-components/manage-tax-components.component';

/** Custom Resolvers */
import { LoanProductsResolver } from './loan-products/loan-products.resolver';
import { LoanProductsTemplateResolver } from './loan-products/loan-products-template.resolver';
import { LoanProductResolver } from './loan-products/loan-product.resolver';
import { LoanProductAndTemplateResolver } from './loan-products/edit-loan-product/loan-product-and-template.resolver';
import { SavingProductsResolver } from './saving-products/saving-products.resolver';
import { SavingProductsTemplateResolver } from './saving-products/saving-products-template.resolver';
import { SavingProductResolver } from './saving-products/saving-product.resolver';
import { SavingProductAndTemplateResolver } from './saving-products/edit-saving-product/saving-product-and-template.resolver';
import { ShareProductsResolver } from './share-products/share-products.resolver';
import { RecurringDepositProductsResolver } from './recurring-deposit-products/recurring-deposit-products.resolver';
import { ChargesResolver } from './charges/charges.resolver';
import { FixedDepositProductsResolver } from './fixed-deposit-products/fixed-deposit-products.resolver';
import { ProductsMixResolver } from './products-mix/products-mix.resolver';
import { ManageTaxComponentsResolver } from './manage-tax-components/manage-tax-components.resolver';

/** Products Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'products',
      data: { title: extract('Products'), breadcrumb: 'Products' },
      children: [
        {
          path: '',
          component: ProductsComponent
        },
        {
          path: 'loan-products',
          data: { title: extract('Loan Products'), breadcrumb: 'Loan Products' },
          children: [
            {
              path: '',
              component: LoanProductsComponent,
              resolve: {
                loanProducts: LoanProductsResolver
              }
            },
            {
              path: 'create',
              component: CreateLoanProductComponent,
              data: { title: extract('Create Loan Product'), breadcrumb: 'Create' },
              resolve: {
                loanProductsTemplate: LoanProductsTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Loan Product'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewLoanProductComponent,
                  resolve: {
                    loanProduct: LoanProductResolver
                  },
                },
                {
                  path: 'edit',
                  component: EditLoanProductComponent,
                  data: { title: extract('Edit Loan Product'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    loanProductAndTemplate: LoanProductAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'saving-products',
          data: { title: extract('Saving Products'), breadcrumb: 'Saving Products' },
          children: [
            {
              path: '',
              component: SavingProductsComponent,
              resolve: {
                savingProducts: SavingProductsResolver
              }
            },
            {
              path: 'create',
              component: CreateSavingProductComponent,
              data: { title: extract('Create Saving Product'), breadcrumb: 'Create' },
              resolve: {
                savingProductsTemplate: SavingProductsTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Saving Product'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewSavingProductComponent,
                  resolve: {
                    savingProduct: SavingProductResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditSavingProductComponent,
                  data: { title: extract('Edit Saving Product'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    savingProductAndTemplate: SavingProductAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'share-products',
          data: { title: extract('Share Products'), breadcrumb: 'Share Products' },
          children: [
            {
              path: '',
              component: ShareProductsComponent,
              resolve: {
                shareProducts: ShareProductsResolver
              }
            }
          ]
        },
        {
          path: 'tax-configurations',
          data: { title:  extract('Manage Tax Configurations'), breadcrumb: 'Manage Tax Configurations' },
          children: [
            {
              path: '',
              component: ManageTaxConfigurationsComponent,
            },
            {
              path: 'tax-components',
              component: ManageTaxComponentsComponent,
              resolve: {
                taxComponents: ManageTaxComponentsResolver
              },
              data: { title: extract('Manage Tax Components'), breadcrumb: 'Tax Components'},
            },
          ]
        },
        {
          path: 'recurring-deposit-products',
          component: RecurringDepositProductsComponent,
          resolve: {
                recurringDepositProducts: RecurringDepositProductsResolver
          },
          data: { title:  extract('Recurring Deposit Products'), breadcrumb: 'Recurring Deposit Products' },
        },
        {
          path: 'charges',
          component: ChargesComponent,
          resolve: {
                charges: ChargesResolver
          },
          data: { title:  extract('Charges'), breadcrumb: 'Charges' },
        },
        {
          path: 'fixed-deposit-products',
          component: FixedDepositProductsComponent,
          resolve: {
                fixedDepositProducts: FixedDepositProductsResolver
          },
          data: { title:  extract('Fixed Deposit Products'), breadcrumb: 'Fixed Deposit Products' },
        },
        {
          path: 'products-mix',
          component: ProductsMixComponent,
          resolve: {
                products: ProductsMixResolver
          },
          data: { title:  extract('Products Mix'), breadcrumb: 'Products Mix' },
        },
      ]
    }
  ])
];

/**
 * Products Routing Module
 *
 * Configures the products routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LoanProductsResolver,
    LoanProductsTemplateResolver,
    LoanProductResolver,
    LoanProductAndTemplateResolver,
    SavingProductsResolver,
    SavingProductsTemplateResolver,
    SavingProductResolver,
    SavingProductAndTemplateResolver,
    ShareProductsResolver,
    RecurringDepositProductsResolver,
    ChargesResolver,
    FixedDepositProductsResolver,
    ProductsMixResolver,
    ManageTaxComponentsResolver
  ]
})
export class ProductsRoutingModule { }
