/** TODO: Separate routing into feature modules for cleaner accounting module. */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { AccountingComponent } from './accounting.component';
import { FrequentPostingsComponent } from './frequent-postings/frequent-postings.component';
import { CreateJournalEntryComponent } from './create-journal-entry/create-journal-entry.component';
import { SearchJournalEntryComponent } from './search-journal-entry/search-journal-entry.component';
import { ViewTransactionComponent } from './view-transaction/view-transaction.component';
import { FinancialActivityMappingsComponent } from './financial-activity-mappings/financial-activity-mappings.component';
import { CreateFinancialActivityMappingComponent } from './financial-activity-mappings/create-financial-activity-mapping/create-financial-activity-mapping.component';
import { ViewFinancialActivityMappingComponent } from './financial-activity-mappings/view-financial-activity-mapping/view-financial-activity-mapping.component';
import { EditFinancialActivityMappingComponent } from './financial-activity-mappings/edit-financial-activity-mapping/edit-financial-activity-mapping.component';
import { MigrateOpeningBalancesComponent } from './migrate-opening-balances/migrate-opening-balances.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { CreateGlAccountComponent } from './chart-of-accounts/create-gl-account/create-gl-account.component';
import { ViewGlAccountComponent } from './chart-of-accounts/view-gl-account/view-gl-account.component';
import { EditGlAccountComponent } from './chart-of-accounts/edit-gl-account/edit-gl-account.component';
import { ClosingEntriesComponent } from './closing-entries/closing-entries.component';
import { CreateClosureComponent } from './closing-entries/create-closure/create-closure.component';
import { ViewClosureComponent } from './closing-entries/view-closure/view-closure.component';
import { EditClosureComponent } from './closing-entries/edit-closure/edit-closure.component';
import { AccountingRulesComponent } from './accounting-rules/accounting-rules.component';
import { CreateRuleComponent } from './accounting-rules/create-rule/create-rule.component';
import { ViewRuleComponent } from './accounting-rules/view-rule/view-rule.component';
import { EditRuleComponent } from './accounting-rules/edit-rule/edit-rule.component';
import { PeriodicAccrualsComponent } from './periodic-accruals/periodic-accruals.component';
import { ProvisioningEntriesComponent } from './provisioning-entries/provisioning-entries.component';
import { CreateProvisioningEntryComponent } from './provisioning-entries/create-provisioning-entry/create-provisioning-entry.component';
import { ViewProvisioningEntryComponent } from './provisioning-entries/view-provisioning-entry/view-provisioning-entry.component';
import { ViewProvisioningJournalEntriesComponent } from './provisioning-entries/view-provisioning-journal-entries/view-provisioning-journal-entries.component';

/** Custom Resolvers */
import { OfficesResolver } from './common-resolvers/offices.resolver';
import { AccountingRulesAssociationsResolver } from './common-resolvers/accounting-rules-associations.resolver';
import { CurrenciesResolver } from './common-resolvers/currencies.resolver';
import { PaymentTypesResolver } from './common-resolvers/payment-types.resolver';
import { GlAccountsResolver } from './common-resolvers/gl-accounts.resolver';
import { TransactionResolver } from './view-transaction/transaction.resolver';
import { FinancialActivityMappingsResolver } from './financial-activity-mappings/financial-activity-mappings.resolver';
import { FinancialActivityMappingsTemplateResolver } from './financial-activity-mappings/create-financial-activity-mapping/financial-activity-mappings-template.resolver';
import { FinancialActivityMappingResolver } from './financial-activity-mappings/view-financial-activity-mapping/financial-activity-mapping.resolver';
import { FinancialActivityMappingAndTemplateResolver } from './financial-activity-mappings/edit-financial-activity-mapping/financial-activity-mapping-and-template.resolver';
import { ChartOfAccountsResolver } from './chart-of-accounts/chart-of-accounts.resolver';
import { ChartOfAccountsTemplateResolver } from './chart-of-accounts/create-gl-account/chart-of-accounts-template.resolver';
import { GlAccountAndChartOfAccountsTemplateResolver } from './chart-of-accounts/gl-account-and-chart-of-accounts-template.resolver';
import { ClosingEntriesResolver } from './closing-entries/closing-entries.resolver';
import { ClosingEntryResolver } from './closing-entries/closing-entry.resolver';
import { AccountingRulesResolver } from './accounting-rules/accounting-rules.resolver';
import { AccountingRulesTemplateResolver } from './accounting-rules/accounting-rules-template.resolver';
import { AccountingRuleResolver } from './accounting-rules/accounting-rule.resolver';
import { ProvisioningEntriesResolver } from './provisioning-entries/provisioning-entries.resolver';
import { ProvisioningEntryResolver } from './provisioning-entries/view-provisioning-entry/provisioning-entry.resolver';
import { ProvisioningEntryEntriesResolver } from './provisioning-entries/view-provisioning-entry/provisioning-entry-entries.resolver';
import { LoanProductsResolver } from './common-resolvers/loan-products.resolver';
import { ProvisioningCategoriesResolver } from './common-resolvers/provisioning-categories.resolver';
import { ProvisioningJournalEntriesResolver } from './provisioning-entries/view-provisioning-journal-entries/provisioning-journal-entries.resolver';

/** Accounting Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'accounting',
      data: { title: extract('Accounting'), breadcrumb: 'Accounting' },
      children: [
        {
          path: '',
          component: AccountingComponent
        },
        {
          path: 'journal-entries',
          data: { title: extract('Search Journal Entry'), breadcrumb: 'Journal Entries' },
          children: [
            {
              path: '',
              component: SearchJournalEntryComponent,
              resolve: {
                offices: OfficesResolver,
                glAccounts: GlAccountsResolver
              },
            },
            {
              path: 'frequent-postings',
              component: FrequentPostingsComponent,
              data: { title: extract('Frequent Postings'), breadcrumb: 'Frequent Postings' },
              resolve: {
                offices: OfficesResolver,
                accountingRules: AccountingRulesAssociationsResolver,
                currencies: CurrenciesResolver,
                paymentTypes: PaymentTypesResolver
              }
            },
            {
              path: 'create',
              component: CreateJournalEntryComponent,
              data: { title: extract('Create Journal Entry'), breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver,
                currencies: CurrenciesResolver,
                paymentTypes: PaymentTypesResolver,
                glAccounts: GlAccountsResolver
              }
            },
            {
              path: 'transactions',
              data: { title: extract('Transactions'), breadcrumb: 'Transactions', addBreadcrumbLink: false },
              children: [
                {
                  path: 'view/:id',
                  component: ViewTransactionComponent,
                  data: { title: extract('View Transaction'), routeParamBreadcrumb: 'id' },
                  resolve: {
                    transaction: TransactionResolver
                  }
                }
              ]
            },
          ]
        },
        {
          path: 'financial-activity-mappings',
          data: { title: extract('Financial Activity Mappings'), breadcrumb: 'Financial Activity Mappings' },
          children: [
            {
              path: '',
              component: FinancialActivityMappingsComponent,
              resolve: {
                financialActivityAccounts: FinancialActivityMappingsResolver
              }
            },
            {
              path: 'create',
              component: CreateFinancialActivityMappingComponent,
              data: { title: extract('Create Financial Activity Mapping'), breadcrumb: 'Create' },
              resolve: {
                financialActivityAccountsTemplate: FinancialActivityMappingsTemplateResolver
              }
            },
            {
              path: 'view/:id',
              data: { title: extract('View Financial Activity Mapping'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewFinancialActivityMappingComponent,
                  resolve: {
                    financialActivityAccount: FinancialActivityMappingResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditFinancialActivityMappingComponent,
                  data: { title: extract('Edit Financial Activity Mapping'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    financialActivityAccountAndTemplate: FinancialActivityMappingAndTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'migrate-opening-balances',
          component: MigrateOpeningBalancesComponent,
          data: { title:  extract('Migrate Opening Balances'), breadcrumb: 'Migrate Opening Balances' },
          resolve: {
            offices: OfficesResolver,
            currencies: CurrenciesResolver
          }
        },
        {
          path: 'chart-of-accounts',
          data: { title: extract('Chart of Accounts'), breadcrumb: 'Chart of Accounts' },
          children: [
            {
              path: '',
              component: ChartOfAccountsComponent,
              resolve: {
                chartOfAccounts: ChartOfAccountsResolver
              }
            },
            {
              path: 'gl-accounts',
              children: [
                {
                  path: 'create',
                  component: CreateGlAccountComponent,
                  data: { title: extract('Create GL Account'), breadcrumb: 'Create GL Account' },
                  resolve: {
                    chartOfAccountsTemplate: ChartOfAccountsTemplateResolver
                  }
                },
                {
                  path: 'view/:id',
                  data: { title: extract('View GL Account'), routeResolveBreadcrumb: ['glAccountAndChartOfAccountsTemplate', 'name'] },
                  resolve: {
                    glAccountAndChartOfAccountsTemplate: GlAccountAndChartOfAccountsTemplateResolver
                  },
                  runGuardsAndResolvers: 'always',
                  children: [
                    {
                      path: '',
                      component: ViewGlAccountComponent
                    },
                    {
                      path: 'edit',
                      component: EditGlAccountComponent,
                      data: { title: extract('Edit GL Account'), breadcrumb: 'Edit', routeResolveBreadcrumb: false }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          path: 'closing-entries',
          data: { title: extract('Accounting Closures'), breadcrumb: 'Closing Entries' },
          children: [
            {
              path: '',
              component: ClosingEntriesComponent,
              resolve: {
                offices: OfficesResolver,
                glAccountClosures: ClosingEntriesResolver
              }
            },
            {
              path: 'create',
              component: CreateClosureComponent,
              data: { title: extract('Create Accounting Closure'), breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: 'view/:id',
              data: { title: extract('View Accounting Closure'), routeParamBreadcrumb: 'id' },
              resolve: {
                glAccountClosure: ClosingEntryResolver
              },
              runGuardsAndResolvers: 'always',
              children: [
                {
                  path: '',
                  component: ViewClosureComponent
                },
                {
                  path: 'edit',
                  component: EditClosureComponent,
                  data: { title: extract('Edit Accounting Closure'), breadcrumb: 'Edit', routeParamBreadcrumb: false }
                }
              ]
            }
          ]
        },
        {
          path: 'accounting-rules',
          data: { title: extract('Accounting Rules'), breadcrumb: 'Rules' },
          children: [
            {
              path: '',
              component: AccountingRulesComponent,
              resolve: {
                accountingRules: AccountingRulesResolver
              }
            },
            {
              path: 'create',
              component: CreateRuleComponent,
              data: { title: extract('Create Accounting Rule'), breadcrumb: 'Create' },
              resolve: {
                accountingRulesTemplate: AccountingRulesTemplateResolver
              }
            },
            {
              path: 'view/:id',
              data: { title: extract('View Accounting Rule'), routeResolveBreadcrumb: ['accountingRule', 'name'] },
              resolve: {
                accountingRule: AccountingRuleResolver
              },
              runGuardsAndResolvers: 'always',
              children: [
                {
                  path: '',
                  component: ViewRuleComponent
                },
                {
                  path: 'edit',
                  component: EditRuleComponent,
                  data: { title: extract('Edit Accounting Rules'), breadcrumb: 'Edit', routeResolveBreadcrumb: false },
                  resolve: {
                    accountingRulesTemplate: AccountingRulesTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'periodic-accruals',
          component: PeriodicAccrualsComponent,
          data: { title: extract('Periodic Accrual Accounting'), breadcrumb: 'Execute Periodic Accrual Accounting' }
        },
        {
          path: 'provisioning-entries',
          data: { title: extract('Provisioning Entries'), breadcrumb: 'Provisioning Entries' },
          children: [
            {
              path: '',
              component: ProvisioningEntriesComponent,
              resolve: {
                provisioningEntries: ProvisioningEntriesResolver
              }
            },
            {
              path: 'create',
              component: CreateProvisioningEntryComponent,
              data: { title: extract('Create Provisioning Entry'), breadcrumb: 'Create' }
            },
            {
              path: 'view/:id',
              component: ViewProvisioningEntryComponent,
              data: { title: extract('View Provisioning Entry'), routeParamBreadcrumb: 'id' },
              resolve: {
                provisioningEntry: ProvisioningEntryResolver,
                provisioningEntryEntries: ProvisioningEntryEntriesResolver,
                office: OfficesResolver,
                loanProducts: LoanProductsResolver,
                provisioningCategories: ProvisioningCategoriesResolver
              }
            },
            {
              path: 'journal-entries',
              data: { breadcrumb: 'Journal Entries', addBreadcrumbLink: false },
              children: [
                {
                  path: 'view/:id',
                  component: ViewProvisioningJournalEntriesComponent,
                  data: { title: extract('View Provisioning Journal Entry'), routeParamBreadcrumb: 'id' },
                  resolve: {
                    provisioningJournalEntries: ProvisioningJournalEntriesResolver
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
];

/**
 * Accounting Routing Module
 *
 * Configures the accounting routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    OfficesResolver,
    AccountingRulesAssociationsResolver,
    CurrenciesResolver,
    PaymentTypesResolver,
    GlAccountsResolver,
    TransactionResolver,
    FinancialActivityMappingsResolver,
    FinancialActivityMappingsTemplateResolver,
    FinancialActivityMappingResolver,
    FinancialActivityMappingAndTemplateResolver,
    ChartOfAccountsResolver,
    ChartOfAccountsTemplateResolver,
    GlAccountAndChartOfAccountsTemplateResolver,
    ClosingEntriesResolver,
    ClosingEntryResolver,
    AccountingRulesResolver,
    AccountingRulesTemplateResolver,
    AccountingRuleResolver,
    ProvisioningEntriesResolver,
    ProvisioningEntryResolver,
    ProvisioningEntryEntriesResolver,
    LoanProductsResolver,
    ProvisioningCategoriesResolver,
    ProvisioningJournalEntriesResolver
  ]
})
export class AccountingRoutingModule { }
