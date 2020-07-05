/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../../core/i18n/i18n.service';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';
import { InterestRateChartTabComponent } from './recurring-deposits-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { TransactionsTabComponent } from './recurring-deposits-account-view/transactions-tab/transactions-tab.component';

/** Custom Resolvers */
import { RecurringDepositsAccountViewResolver } from './common-resolvers/recurring-deposits-account-view.resolver';
import { RecurringDepositsAccountDataResolver } from './common-resolvers/recurring-deposits-account-data.resolver';
import { StandingInstructionsTabComponent } from './recurring-deposits-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { ChargesTabComponent } from './recurring-deposits-account-view/charges-tab/charges-tab.component';
import { DatatableTabsComponent } from './recurring-deposits-account-view/datatable-tabs/datatable-tabs.component';
import { SavingsDatatableResolver } from 'app/savings/common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from 'app/savings/common-resolvers/savings-datatables.resolver';
import { CreateRecurringDepositsAccountComponent } from './create-recurring-deposits-account/create-recurring-deposits-account.component';
import { RecurringDepositsAccountTemplateResolver } from './common-resolvers/recurring-deposits-account-template.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All RecurringDeposits'), breadcrumb: 'RecurringDeposits', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create-recurring-deposits-account',
        data: { title: extract('Create Recurring Deposits Account'), breadcrumb: 'Create Recurring Deposits Account' },
        component: CreateRecurringDepositsAccountComponent,
        resolve: {
          recurringDepositsAccountTemplate: RecurringDepositsAccountTemplateResolver
        }
      },
      {
        path: ':recurringDepositAccountId',
        data: { title: extract('RecurringDeposit Account View'), routeParamBreadcrumb: 'recurringDepositAccountId' },
        component: RecurringDepositsAccountViewComponent,
        resolve: {
          recurringDepositsAccountData: RecurringDepositsAccountViewResolver,
          savingsDatatables: SavingsDatatablesResolver
        },
        children: [
          {
            path: 'interest-rate-chart',
            component: InterestRateChartTabComponent,
            data: { title: extract('Recurring Deposit Account Interest Rate Chart'), breadcrumb: 'Interest Rate Chart', routeParamBreadcrumb: false },
            resolve: {
              recurringDepositsAccountData: RecurringDepositsAccountDataResolver
            }
          },
          {
            path: 'transactions',
            component: TransactionsTabComponent,
            data: { title: extract('Recurring Deposit Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
            resolve: {
              recurringDepositsAccountData: RecurringDepositsAccountDataResolver
            }
          },
          {
            path: 'charges',
            component: ChargesTabComponent,
            data: { title: extract('Recurring Deposit Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false }
          },
          {
            path: 'standing-instructions',
            component: StandingInstructionsTabComponent,
            data: { title: extract('Recurring Deposit Account Standing Instructions'), breadcrumb: 'Standing Instructions', routeParamBreadcrumb: false },
            resolve: {
              recurringDepositsAccountData: RecurringDepositsAccountDataResolver
            }
          },
          {
            path: 'datatables',
            children: [
              {
                path: ':datatableName',
                component: DatatableTabsComponent,
                data: { title: extract('View Data Table'), routeParamBreadcrumb: 'datatableName' },
                resolve: {
                  savingsDatatable: SavingsDatatableResolver
                }
              }
            ]
          }
        ]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    RecurringDepositsAccountViewResolver,
    RecurringDepositsAccountDataResolver,
    SavingsDatatableResolver,
    SavingsDatatablesResolver,
    RecurringDepositsAccountTemplateResolver
  ]
})
export class RecurringDepositsRoutingModule {}
