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
import { CreateShareProductComponent } from './share-products/create-share-product/create-share-product.component';
import { ViewShareProductComponent } from './share-products/view-share-product/view-share-product.component';
import { EditShareProductComponent } from './share-products/edit-share-product/edit-share-product.component';
import { ManageTaxConfigurationsComponent } from './manage-tax-configurations/manage-tax-configurations.component';
import { RecurringDepositProductsComponent } from './recurring-deposit-products/recurring-deposit-products.component';
import { ChargesComponent } from './charges/charges.component';
import { ViewChargeComponent } from './charges/view-charge/view-charge.component';
import { FixedDepositProductsComponent } from './fixed-deposit-products/fixed-deposit-products.component';
import { CreateFixedDepositProductComponent } from './fixed-deposit-products/create-fixed-deposit-product/create-fixed-deposit-product.component';
import { ProductsMixComponent } from './products-mix/products-mix.component';
import { FloatingRatesComponent } from './floating-rates/floating-rates.component';
import { CreateFloatingRateComponent } from './floating-rates/create-floating-rate/create-floating-rate.component';
import { ViewFloatingRateComponent } from './floating-rates/view-floating-rate/view-floating-rate.component';
import { EditFloatingRateComponent } from './floating-rates/edit-floating-rate/edit-floating-rate.component';
import { ViewProductMixComponent } from './products-mix/view-product-mix/view-product-mix.component';
import { ManageTaxComponentsComponent } from './manage-tax-components/manage-tax-components.component';
import { ManageTaxGroupsComponent } from './manage-tax-groups/manage-tax-groups.component';
import { ViewTaxComponentComponent } from './manage-tax-components/view-tax-component/view-tax-component.component';
import { CreateTaxComponentComponent } from './manage-tax-components/create-tax-component/create-tax-component.component';
import { EditTaxComponentComponent } from './manage-tax-components/edit-tax-component/edit-tax-component.component';
import { ViewTaxGroupComponent } from './manage-tax-groups/view-tax-group/view-tax-group.component';
import { ShareProductsDividendsComponent } from './share-products/dividends-share-product/dividends.components';

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
import { ShareProductsTemplateResolver } from './share-products/share-products-template.resolver';
import { ShareProductResolver } from './share-products/share-product-resolver';
import { ShareProductAndTemplateResolver } from './share-products/edit-share-product/share-product-and-template.resolver';
import { RecurringDepositProductsResolver } from './recurring-deposit-products/recurring-deposit-products.resolver';
import { ChargesResolver } from './charges/charges.resolver';
import { ChargeResolver } from './charges/charge.resolver';
import { FixedDepositProductsResolver } from './fixed-deposit-products/fixed-deposit-products.resolver';
import { FixedDepositProductsTemplateResolver } from './fixed-deposit-products/fixed-deposit-products-template.resolver';
import { ProductsMixResolver } from './products-mix/products-mix.resolver';
import { FloatingRatesResolver } from './floating-rates/floating-rates.resolver';
import { FloatingRateResolver } from './floating-rates/floating-rate.resolver';
import { ViewProductMixResolver } from './products-mix/view-product-mix/view-product-mix.resolver';
import { ManageTaxComponentsResolver } from './manage-tax-components/manage-tax-components.resolver';
import { ManageTaxGroupsResolver } from './manage-tax-groups/manage-tax-groups.resolver';
import { TaxComponentResolver } from './manage-tax-components/tax-component.resolver';
import { TaxComponentTemplateResolver } from './manage-tax-components/tax-component-template.resolver';
import { EditChargeComponent } from './charges/edit-charge/edit-charge.component';
import { ChargesTemplateResolver } from './charges/charges-template.resolver';
import { TaxGroupResolver } from './manage-tax-groups/tax-group.resolver';
import { DividendsResolver } from './share-products/dividends-share-product/dividends.resolver';

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
            },
            {
              path: 'create',
              component: CreateShareProductComponent,
              data: { title: extract('Create Share Product'), breadcrumb: 'Create' },
              resolve: {
                shareProductsTemplate: ShareProductsTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Share Product'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewShareProductComponent,
                  resolve: {
                    shareProduct: ShareProductResolver
                  },
                },
                {
                  path: 'edit',
                  component: EditShareProductComponent,
                  data: { title: extract('Edit Share Product'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    shareProductAndTemplate: ShareProductAndTemplateResolver
                  }
                },
                {
                  path: 'dividends',
                  data: { title: extract('Share Products Dividends'), breadcrumb: 'Dividends', routeParamBreadcrumb: false},
                  component: ShareProductsDividendsComponent,
                  resolve: {
                    dividends: DividendsResolver
                  }
                }
              ]
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
              data: { title: extract('Manage Tax Components'), breadcrumb: 'Tax Components'},
              children: [
                {
                  path: '',
                  component: ManageTaxComponentsComponent,
                  resolve: {
                    taxComponents: ManageTaxComponentsResolver
                  }
                },
                {
                  path: 'create',
                  component: CreateTaxComponentComponent,
                  data: { title: extract('Create Tax Component'), breadcrumb: 'Create' },
                  resolve: {
                    taxComponentTemplate: TaxComponentTemplateResolver
                  }
                },
                {
                  path: ':id',
                  data: { title: extract('View Tax Component'), routeParamBreadcrumb: 'id' },
                  children: [
                    {
                      path: '',
                      component: ViewTaxComponentComponent,
                      resolve: {
                        taxComponent: TaxComponentResolver
                      }
                    },
                    {
                      path: 'edit',
                      data: { title: extract('Edit Tax Component'), breadcrumb: 'Edit', routeParamBreadcrumb: false  },
                      component: EditTaxComponentComponent,
                      resolve: {
                        taxComponent: TaxComponentResolver
                      }
                    },
                  ]
                }
              ]
            },
            {
              path: 'tax-groups',
              data: { title: extract('Manage Tax Groups'), breadcrumb: 'Tax Groups'},
              children: [
                {
                  path: '',
                  component: ManageTaxGroupsComponent,
                  resolve: {
                  taxGroups: ManageTaxGroupsResolver
                  }
                },
                {
                  path: ':id',
                  data: { title: extract('View Tax Group'), routeParamBreadcrumb: 'id' },
                  children: [
                    {
                      path: '',
                      component: ViewTaxGroupComponent,
                      resolve: {
                        taxGroup: TaxGroupResolver
                      }
                    }
                  ]
                }
              ]
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
          path: 'fixed-deposit-products',
          data: { title:  extract('Fixed Deposit Products'), breadcrumb: 'Fixed Deposit Products' },
          children: [
            {
              path: '',
              component: FixedDepositProductsComponent,
              resolve: {
                    fixedDepositProducts: FixedDepositProductsResolver
              },
            },
            {
              path: 'create',
              component: CreateFixedDepositProductComponent,
              data: { title: extract('Create Fixed Deposit Product'), breadcrumb: 'Create' },
              resolve: {
                fixedDepositProductsTemplate: FixedDepositProductsTemplateResolver
              }
            }
          ]
        },
        {
          path: 'products-mix',
          data: { title:  extract('Products Mix'), breadcrumb: 'Products Mix' },
          children: [
            {
              path: '',
              component: ProductsMixComponent,
              resolve: {
                    products: ProductsMixResolver
              }
            },
            {
              path: ':id',
              component: ViewProductMixComponent,
              data: { title: extract('View Product Mix'), routeParamBreadcrumb: 'id'},
              resolve: {
                productMix: ViewProductMixResolver
              },
            }
          ]
        },
        {
          path: 'floating-rates',
          data: { title: extract('Floating Rates'), breadcrumb: 'Floating Rates' },
          children: [
            {
              path: '',
              component: FloatingRatesComponent,
              resolve: {
                floatingrates: FloatingRatesResolver
              }
            },
            {
              path: 'create',
              component: CreateFloatingRateComponent,
              data: { title: extract('Create Floating Rate'), breadcrumb: 'Create' }
            },
            {
              path: ':id',
              data: { title: extract('View Floating Rate'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewFloatingRateComponent,
                  resolve: {
                    floatingRate: FloatingRateResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditFloatingRateComponent,
                  data: { title: extract('Edit Floating Rate'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    floatingRate: FloatingRateResolver
                  }
                }
              ]
            }
          ]
        },

        {
          path: 'charges',
          data: { title: extract('Charges'), breadcrumb: 'Charges' },
          children: [
            {
              path: '',
              component: ChargesComponent,
              resolve: {
                charges: ChargesResolver
              }
            },

            {
              path: ':id',
              data: { title: extract('View Charges'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewChargeComponent,
                  resolve: {
                    charge: ChargeResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditChargeComponent,
                  data: { title: extract('Edit Charge'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    chargesTemplate: ChargesTemplateResolver
                  }
                },
              ]
            },
          ]
        }
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
    ShareProductsTemplateResolver,
    ShareProductResolver,
    ShareProductAndTemplateResolver,
    RecurringDepositProductsResolver,
    ChargesResolver,
    ChargeResolver,
    ChargesTemplateResolver,
    FixedDepositProductsResolver,
    FixedDepositProductsTemplateResolver,
    ProductsMixResolver,
    ViewProductMixResolver,
    ManageTaxComponentsResolver,
    ManageTaxGroupsResolver,
    TaxComponentResolver,
    FloatingRateResolver,
    FloatingRatesResolver,
    TaxComponentTemplateResolver,
    EditTaxComponentComponent,
    TaxGroupResolver,
    DividendsResolver
  ]
})
export class ProductsRoutingModule { }
