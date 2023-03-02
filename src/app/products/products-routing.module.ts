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
import { ViewRecurringDepositProductComponent } from './recurring-deposit-products/view-recurring-deposit-product/view-recurring-deposit-product.component';
import { ChargesComponent } from './charges/charges.component';
import { ViewChargeComponent } from './charges/view-charge/view-charge.component';
import { CreateChargeComponent } from './charges/create-charge/create-charge.component';
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
import { CreateRecurringDepositProductComponent } from './recurring-deposit-products/create-recurring-deposit-product/create-recurring-deposit-product.component';
import { CreateDividendComponent } from './share-products/create-dividend/create-dividend.component';
import { ViewFixedDepositProductComponent } from './fixed-deposit-products/view-fixed-deposit-product/view-fixed-deposit-product.component';
import { ViewDividendComponent } from './share-products/view-dividend/view-dividend.component';
import { CreateTaxGroupComponent } from './manage-tax-groups/create-tax-group/create-tax-group.component';
import { EditTaxGroupComponent } from './manage-tax-groups/edit-tax-group/edit-tax-group.component';
import { CreateProductMixComponent } from './products-mix/create-product-mix/create-product-mix.component';
import { CollateralsComponent } from './collaterals/collaterals.component';
import { CreateCollateralComponent } from './collaterals/create-collateral/create-collateral.component';
import { EditCollateralComponent } from './collaterals/edit-collateral/edit-collateral.component';
import { ViewCollateralComponent } from './collaterals/view-collateral/view-collateral.component';

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
import { RecurringDepositProductResolver } from './recurring-deposit-products/recurring-deposit-product.resolver';
import { ChargesResolver } from './charges/charges.resolver';
import { ChargeResolver } from './charges/charge.resolver';
import { ChargesTemplateResolver } from './charges/charges-template.resolver';
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
import { TaxGroupResolver } from './manage-tax-groups/tax-group.resolver';
import { DividendsResolver } from './share-products/dividends-share-product/dividends.resolver';
import { RecurringDepositProductsTemplateResolver } from './recurring-deposit-products/recurring-deposit-products-template.resolver';
import { EditRecurringDepositProductComponent } from './recurring-deposit-products/edit-recurring-deposit-product/edit-recurring-deposit-product.component';
import { RecurringDepositProductAndTemplateResolver } from './recurring-deposit-products/edit-recurring-deposit-product/recurring-deposit-product-and-template.resolver';
import { ViewDividendDataResolver } from './share-products/view-dividend/view-dividend-data.resolver';
import { FixedDepositProductResolver } from './fixed-deposit-products/fixed-deposit-product.resolver';
import { ManageTaxGroupTemplateResolver } from './manage-tax-groups/create-tax-group/manage-tax-group-template.resolver';
import { EditTaxGroupResolver } from './manage-tax-groups/edit-tax-group/edit-tax-group.resolver';
import { ProductsMixTemplateResolver } from './products-mix/products-mix-template.resolver';
import { EditProductMixComponent } from './products-mix/edit-product-mix/edit-product-mix.component';
import { ChargesTemplateAndResolver } from './charges/charges-template-and-resolver';
import { EditFixedDepositProductComponent } from './fixed-deposit-products/edit-fixed-deposit-product/edit-fixed-deposit-product.component';
import { FixedDepositProductAndTemplateResolver } from './fixed-deposit-products/edit-fixed-deposit-product/fixed-deposit-product-and-template.resolver';
import { CollateralResolver } from './collaterals/collateral.resolver';
import { CollateralsResolver } from './collaterals/collaterals.resolver';
import { CollateralTemplateResolver } from './collaterals/collaterals-template.resolver';
import { ManageDelinquencyBucketsComponent } from './manage-delinquency-buckets/manage-delinquency-buckets.component';
import { DelinquencyBucketComponent } from './manage-delinquency-buckets/delinquency-bucket/delinquency-bucket.component';
import { DelinquencyRangeComponent } from './manage-delinquency-buckets/delinquency-range/delinquency-range.component';
import { DelinquencyBucketComponentsResolver } from './manage-delinquency-buckets/delinquency-bucket/delinquency-bucket.component.resolver';
import { DelinquencyRangeComponentsResolver } from './manage-delinquency-buckets/delinquency-range/delinquency-range.component.resolver';
import { ViewRangeComponent } from './manage-delinquency-buckets/delinquency-range/view-range/view-range.component';
import { EditRangeComponent } from './manage-delinquency-buckets/delinquency-range/edit-range/edit-range.component';
import { CreateRangeComponent } from './manage-delinquency-buckets/delinquency-range/create-range/create-range.component';
import { CreateBucketComponent } from './manage-delinquency-buckets/delinquency-bucket/create-bucket/create-bucket.component';
import { EditBucketComponent } from './manage-delinquency-buckets/delinquency-bucket/edit-bucket/edit-bucket.component';
import { ViewBucketComponent } from './manage-delinquency-buckets/delinquency-bucket/view-bucket/view-bucket.component';
import { LoanProductDatatablesResolver } from './loan-products/loan-product-datatables.resolver';
import { GeneralTabComponent } from './loan-products/view-loan-product/general-tab/general-tab.component';
import { DatatableTabComponent } from './loan-products/view-loan-product/datatable-tab/datatable-tab.component';
import { LoanProductDatatableResolver } from './loan-products/loan-product-datatable.resolver';
import { SavingProductDatatableResolver } from './saving-products/saving-product-datatable.resolver';
import { SavingProductDatatablesResolver } from './saving-products/saving-product-datatables.resolver';
import { SavingProductGeneralTabComponent } from './saving-products/view-saving-product/saving-product-general-tab/saving-product-general-tab.component';
import { SavingProductDatatableTabComponent } from './saving-products/view-saving-product/saving-product-datatable-tab/saving-product-datatable-tab.component';
import { FixedDepositGeneralTabComponent } from './fixed-deposit-products/view-fixed-deposit-product/fixed-deposit-general-tab/fixed-deposit-general-tab.component';
import { FixedDepositDatatableTabComponent } from './fixed-deposit-products/view-fixed-deposit-product/fixed-deposit-datatable-tab/fixed-deposit-datatable-tab.component';
import { RecurringDepositGeneralTabComponent } from './recurring-deposit-products/view-recurring-deposit-product/recurring-deposit-general-tab/recurring-deposit-general-tab.component';
import { RecurringDepositDatatableTabComponent } from './recurring-deposit-products/view-recurring-deposit-product/recurring-deposit-datatable-tab/recurring-deposit-datatable-tab.component';

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
              path: ':productId',
              component: ViewLoanProductComponent,
              resolve: {
                loanProductDatatables: LoanProductDatatablesResolver
              },
              data: { title: extract('View Loan Product'), breadcrumb: 'productId', routeParamBreadcrumb: 'productId' },
              children: [
                {
                  path: '',
                  redirectTo: 'general',
                  pathMatch: 'full'
                },
                {
                  path: 'general',
                  data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
                  component: GeneralTabComponent,
                  resolve: {
                    loanProduct: LoanProductResolver
                  },
                },
                {
                  path: 'datatables',
                  children: [{
                    path: ':datatableName',
                    component: DatatableTabComponent,
                    data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
                    resolve: {
                      loanProductDatatable: LoanProductDatatableResolver
                    }
                  }]
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
              path: ':productId',
              data: { title: extract('View Saving Product'), breadcrumb: 'productId', routeParamBreadcrumb: 'productId' },
              resolve: {
                savingProductDatatables: SavingProductDatatablesResolver
              },
              children: [
                {
                  path: '',
                  component: ViewSavingProductComponent,

                  children: [
                    {
                      path: '',
                      redirectTo: 'general',
                      pathMatch: 'full'
                    },
                    {
                      path: 'general',
                      data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
                      component: SavingProductGeneralTabComponent,
                      resolve: {
                        savingProduct: SavingProductResolver
                      },
                    },
                    {
                      path: 'datatables',
                      children: [{
                        path: ':datatableName',
                        component: SavingProductDatatableTabComponent,
                        data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
                        resolve: {
                          savingProductDatatable: SavingProductDatatableResolver
                        }
                      }]
                    }
                  ]
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
            },
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
              resolve: {
                shareProduct: ShareProductResolver
              },
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
                  data: { title: extract('Share Products Dividends'), breadcrumb: 'Dividends', routeParamBreadcrumb: false },
                  children: [
                    {
                      path: '',
                      component: ShareProductsDividendsComponent,
                      resolve: {
                        dividends: DividendsResolver
                      }
                    },
                    {
                      path: 'create',
                      component: CreateDividendComponent,
                      data: { title: extract('Create Dividend'), breadcrumb: 'Create', routeParamBreadcrumb: false },
                      resolve: {
                        shareProduct: ShareProductResolver
                      }
                    },
                    {
                      path: ':dividendId',
                      component: ViewDividendComponent,
                      data: { title: extract('View Dividend'), routeParamBreadcrumb: 'dividendId' },
                      resolve: {
                        dividendData: ViewDividendDataResolver
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          path: 'tax-configurations',
          data: { title: extract('Manage Tax Configurations'), breadcrumb: 'Manage Tax Configurations' },
          children: [
            {
              path: '',
              component: ManageTaxConfigurationsComponent,
            },
            {
              path: 'tax-components',
              data: { title: extract('Manage Tax Components'), breadcrumb: 'Tax Components' },
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
                  resolve: {
                    taxComponent: TaxComponentResolver
                  },
                  children: [
                    {
                      path: '',
                      component: ViewTaxComponentComponent,
                      resolve: {
                        taxComponent: TaxComponentResolver
                      },
                    },
                    {
                      path: 'edit',
                      data: { title: extract('Edit Tax Component'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
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
              data: { title: extract('Manage Tax Groups'), breadcrumb: 'Tax Groups' },
              children: [
                {
                  path: '',
                  component: ManageTaxGroupsComponent,
                  resolve: {
                    taxGroups: ManageTaxGroupsResolver
                  }
                },
                {
                  path: 'create',
                  component: CreateTaxGroupComponent,
                  data: { title: extract('Create Tax Group'), breadcrumb: 'Create' },
                  resolve: {
                    taxGroupTemplate: ManageTaxGroupTemplateResolver
                  }
                },
                {
                  path: ':id',
                  data: { title: extract('View Tax Group'), routeParamBreadcrumb: 'id' },
                  resolve: {
                    taxGroup: TaxGroupResolver
                  },
                  children: [
                    {
                      path: '',
                      component: ViewTaxGroupComponent,
                      resolve: {
                        taxGroup: TaxGroupResolver
                      },
                    },
                    {
                      path: 'edit',
                      data: { title: extract('Edit Tax Group'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                      component: EditTaxGroupComponent,
                      resolve: {
                        taxGroup: EditTaxGroupResolver
                      }
                    },
                  ]
                }
              ]
            },
          ]
        },
        {
          path: 'delinquency-bucket-configurations',
          data: { title: extract('Manage Delinquency Bucket Configurations'), breadcrumb: 'Manage Delinquency Bucket Configurations' },
          children: [
            {
              path: '',
              component: ManageDelinquencyBucketsComponent,
            },
            {
              path: 'ranges',
              data: { title: extract('Manage Delinquency Ranges'), breadcrumb: 'Delinquency Ranges' },
              children: [
                {
                  path: '',
                  component: DelinquencyRangeComponent,
                  resolve: {
                    delinquencyRanges: DelinquencyRangeComponentsResolver
                  }
                },
                {
                  path: 'create',
                  component: CreateRangeComponent,
                  data: { title: extract('Create Delinquency Range'), breadcrumb: 'Create' }
                },
                {
                  path: ':rangeId',
                  data: { title: extract('View Delinquency Range'), routeParamBreadcrumb: 'id' },
                  resolve: {
                    delinquencyRange: DelinquencyRangeComponentsResolver
                  },
                  children: [
                    {
                      path: '',
                      component: ViewRangeComponent,
                      resolve: {
                        delinquencyRange: DelinquencyRangeComponentsResolver
                      },
                    },
                    {
                      path: 'edit',
                      data: { title: extract('Edit Delinquency Range'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                      component: EditRangeComponent,
                      resolve: {
                        delinquencyRange: DelinquencyRangeComponentsResolver
                      }
                    },
                  ]
                }
              ]
            },
            {
              path: 'buckets',
              data: { title: extract('Manage Delinquency Bucket'), breadcrumb: 'Delinquency Buckets' },
              children: [
                {
                  path: '',
                  component: DelinquencyBucketComponent,
                  resolve: {
                    delinquencyBuckets: DelinquencyBucketComponentsResolver
                  }
                },
                {
                  path: 'create',
                  component: CreateBucketComponent,
                  data: { title: extract('Create Delinquency Bucket'), breadcrumb: 'Create' },
                  resolve: {
                    delinquencyRanges: DelinquencyRangeComponentsResolver
                  }
                },
                {
                  path: ':bucketId',
                  data: { title: extract('View Delinquency Bucket'), routeParamBreadcrumb: 'id' },
                  resolve: {
                    delinquencyBucket: DelinquencyBucketComponentsResolver
                  },
                  children: [
                    {
                      path: '',
                      component: ViewBucketComponent,
                      resolve: {
                        delinquencyBucket: DelinquencyBucketComponentsResolver
                      },
                    },
                    {
                      path: 'edit',
                      data: { title: extract('Edit Delinquency Bucket'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                      component: EditBucketComponent,
                      resolve: {
                        delinquencyBucket: DelinquencyBucketComponentsResolver,
                        delinquencyRanges: DelinquencyRangeComponentsResolver
                      }
                    },
                  ]
                }
              ]
            },
          ]
        },
        {
          path: 'recurring-deposit-products',
          data: { title: extract('Recurring Deposit Products'), breadcrumb: 'Recurring Deposit Products' },
          children: [
            {
              path: 'create',
              component: CreateRecurringDepositProductComponent,
              data: { title: extract('Create Recurring Deposit Product'), breadcrumb: 'Create' },
              resolve: {
                recurringDepositProductsTemplate: RecurringDepositProductsTemplateResolver
              }
            },
            {
              path: '',
              component: RecurringDepositProductsComponent,
              resolve: {
                recurringDepositProducts: RecurringDepositProductsResolver
              }
            },
            {
              path: ':productId',
              data: { title: extract('View Recurring Deposit Product'), breadcrumb: 'productId', routeParamBreadcrumb: 'productId' },
              component: ViewRecurringDepositProductComponent,
              resolve: {
                recurringDepositDatatables: SavingProductDatatablesResolver
              },
              children: [
                {
                  path: '',
                  redirectTo: 'general',
                  pathMatch: 'full'
                },
                {
                  path: 'general',
                  component: RecurringDepositGeneralTabComponent,
                  resolve: {
                    recurringDepositProduct: RecurringDepositProductResolver
                  }
                },
                {
                  path: 'datatables',
                  children: [{
                    path: ':datatableName',
                    component: RecurringDepositDatatableTabComponent,
                    data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
                    resolve: {
                      recurringDepositDatatable: SavingProductDatatableResolver
                    }
                  }]
                },
                {
                  path: 'edit',
                  data: { title: extract('Edit Recurring Deposit Product'), breadcrumb: 'edit', routeParamBreadcrumb: false },
                  component: EditRecurringDepositProductComponent,
                  resolve: {
                    recurringDepositProductAndTemplate: RecurringDepositProductAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'fixed-deposit-products',
          data: { title: extract('Fixed Deposit Products'), breadcrumb: 'Fixed Deposit Products' },
          children: [
            {
              path: 'create',
              component: CreateFixedDepositProductComponent,
              data: { title: extract('Create Fixed Deposit Product'), breadcrumb: 'Create' },
              resolve: {
                fixedDepositProductsTemplate: FixedDepositProductsTemplateResolver
              }
            },
            {
              path: '',
              component: FixedDepositProductsComponent,
              resolve: {
                fixedDepositProducts: FixedDepositProductsResolver
              },
            },
            {
              path: ':productId',
              data: { title: extract('View Fixed Deposit Product'), breadcrumb: 'productId', routeParamBreadcrumb: 'productId' },
              component: ViewFixedDepositProductComponent,
              resolve: {
                fixedDepositDatatables: SavingProductDatatablesResolver
              },
              children: [
                {
                  path: '',
                  redirectTo: 'general',
                  pathMatch: 'full'
                },
                {
                  path: 'general',
                  component: FixedDepositGeneralTabComponent,
                  resolve: {
                    fixedDepositProduct: FixedDepositProductResolver
                  }
                },
                {
                  path: 'datatables',
                  children: [{
                    path: ':datatableName',
                    component: FixedDepositDatatableTabComponent,
                    data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
                    resolve: {
                      fixedDepositDatatable: SavingProductDatatableResolver
                    }
                  }]
                },
                {
                  path: 'edit',
                  data: { title: extract('Edit Fixed Deposit Product'), breadcrumb: 'edit', routeParamBreadcrumb: false },
                  component: EditFixedDepositProductComponent,
                  resolve: {
                    fixedDepositProductAndTemplate: FixedDepositProductAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'products-mix',
          data: { title: extract('Products Mix'), breadcrumb: 'Products Mix' },
          children: [
            {
              path: 'create',
              component: CreateProductMixComponent,
              data: { title: extract('Create Product Mix'), breadcrumb: 'Create' },
              resolve: {
                productsMixTemplate: ProductsMixTemplateResolver
              }
            },
            {
              path: '',
              component: ProductsMixComponent,
              resolve: {
                products: ProductsMixResolver
              },
            },
            {
              path: ':id',
              data: { title: extract('View Product Mix'), routeParamBreadcrumb: 'id' },
              resolve: {
                productMix: ViewProductMixResolver
              },
              children: [
                {
                  path: '',
                  component: ViewProductMixComponent,
                  resolve: {
                    productMix: ViewProductMixResolver
                  },
                },
                {
                  path: 'edit',
                  data: { title: extract('Edit Product Mix'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  component: EditProductMixComponent,
                  resolve: {
                    productMix: ViewProductMixResolver
                  }
                },
              ]
            },
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
              resolve: {
                floatingRate: FloatingRateResolver
              },
              children: [
                {
                  path: '',
                  component: ViewFloatingRateComponent,
                  resolve: {
                    floatingRate: FloatingRateResolver
                  },
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
              path: 'create',
              component: CreateChargeComponent,
              data: { title: extract('Create Charge'), breadcrumb: 'Create Charge' },
              resolve: {
                chargesTemplate: ChargesTemplateResolver
              }
            },
            {
              path: '',
              component: ChargesComponent,
              resolve: {
                charges: ChargesResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Charges'), breadcrumb: 'id', routeParamBreadcrumb: 'id' },
              resolve: {
                charge: ChargeResolver
              },
              children: [
                {
                  path: '',
                  component: ViewChargeComponent,
                  resolve: {
                    charge: ChargeResolver
                  },
                },
                {
                  path: 'edit',
                  component: EditChargeComponent,
                  data: { title: extract('Edit Charge'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    chargesTemplate: ChargesTemplateAndResolver
                  }
                },
              ]
            },
          ]
        },
        {
          path: 'collaterals',
          data: { title: extract('Collaterals'), breadcrumb: 'Collaterals' },
          children: [
            {
              path: 'create',
              component: CreateCollateralComponent,
              data: { title: extract('Create Collateral'), breadcrumb: 'Create Collateral' },
              resolve: {
                collateralTemplate: CollateralTemplateResolver
              }
            },
            {
              path: '',
              component: CollateralsComponent,
              resolve: {
                collaterals: CollateralsResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Collateral'), routeParamBreadcrumb: 'id' },
              resolve: {
                collateral: CollateralResolver
              },
              children: [
                {
                  path: '',
                  component: ViewCollateralComponent,
                  resolve: {
                    collateral: CollateralResolver
                  },
                },
                {
                  path: 'edit',
                  component: EditCollateralComponent,
                  data: { title: extract('Edit Collateral'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    collateralTemplate: CollateralTemplateResolver,
                    collateral: CollateralResolver
                  }
                },
              ]
            },
          ]
        }
      ]
    }
  ]
  )
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
    RecurringDepositProductResolver,
    ChargesResolver,
    ChargeResolver,
    ChargesTemplateAndResolver,
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
    DividendsResolver,
    RecurringDepositProductsTemplateResolver,
    RecurringDepositProductAndTemplateResolver,
    ViewDividendDataResolver,
    FixedDepositProductResolver,
    ManageTaxGroupTemplateResolver,
    EditTaxGroupResolver,
    ProductsMixTemplateResolver,
    FixedDepositProductAndTemplateResolver,
    FloatingRatesResolver,
    CollateralResolver,
    CollateralsResolver,
    CollateralTemplateResolver,
    DelinquencyRangeComponentsResolver,
    DelinquencyBucketComponentsResolver
  ]
})
export class ProductsRoutingModule { }
