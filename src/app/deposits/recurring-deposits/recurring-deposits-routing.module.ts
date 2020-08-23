/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../../core/i18n/i18n.service';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';
import { InterestRateChartTabComponent } from './recurring-deposits-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { TransactionsTabComponent } from './recurring-deposits-account-view/transactions-tab/transactions-tab.component';
import { StandingInstructionsTabComponent } from './recurring-deposits-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { ChargesTabComponent } from './recurring-deposits-account-view/charges-tab/charges-tab.component';
import { DatatableTabsComponent } from './recurring-deposits-account-view/datatable-tabs/datatable-tabs.component';
import { CreateRecurringDepositsAccountComponent } from './create-recurring-deposits-account/create-recurring-deposits-account.component';
import { RecurringDepositsAccountActionsComponent } from './recurring-deposits-account-actions/recurring-deposits-account-actions.component';
import { ViewTransactionComponent } from './recurring-deposits-account-view/transactions-tab/view-transaction/view-transaction.component';
import { EditTransactionComponent } from './recurring-deposits-account-view/transactions-tab/edit-transaction/edit-transaction.component';

/** Custom Resolvers */
import { RecurringDepositsAccountViewResolver } from './common-resolvers/recurring-deposits-account-view.resolver';
import { RecurringDepositsAccountDataResolver } from './common-resolvers/recurring-deposits-account-data.resolver';
import { SavingsDatatableResolver } from 'app/savings/common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from 'app/savings/common-resolvers/savings-datatables.resolver';
import { RecurringDepositsAccountTemplateResolver } from './common-resolvers/recurring-deposits-account-template.resolver';
import { RecurringDepositsAccountActionsResolver } from './common-resolvers/recurring-deposit-account-actions.resolver';
import { EditRecurringDepositAccountComponent } from './edit-recurring-deposit-account/edit-recurring-deposit-account.component';
import { RecurringDepositsAccountAndTemplateResolver } from './common-resolvers/recurring-deposit-account-and-template.resolver';
import { RecurringDepositsAccountTransactionResolver } from './common-resolvers/recurring-deposit-account-transaction.resolver';
import { RecurringDepositsAccountTransactionTemplateResolver } from './common-resolvers/recurring-deposit-account-transaction-template.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('Recurring Deposits'), breadcrumb: 'Recurring Deposits', routeParamBreadcrumb: false },
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
        children: [
          {
            path: '',
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
                path: 'standing-instructions-tab',
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
              },
            ]
          },
          {
            path: 'edit-recurring-deposit-account',
            data: { title: extract('Edit Recurring Deposit Account'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
            component: EditRecurringDepositAccountComponent,
            resolve: {
              recurringDepositsAccountAndTemplate: RecurringDepositsAccountAndTemplateResolver
            }
          },
          {
            path: 'transactions',
            data: { title: extract('Recurring Deposits Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
            children: [
              {
                path: '',
                redirectTo: '../transactions', pathMatch: 'prefix'
              },
              {
                path: ':id',
                data: { routeParamBreadcrumb: 'id' },
                children: [
                  {
                    path: '',
                    component: ViewTransactionComponent,
                    resolve: {
                      recurringDepositsAccountTransaction: RecurringDepositsAccountTransactionResolver
                    }
                  },
                  {
                    path: 'edit',
                    component: EditTransactionComponent,
                    resolve: {
                      recurringDepositsAccountTransactionTemplate: RecurringDepositsAccountTransactionTemplateResolver
                    }
                  },
                  {
                    path: 'account-transfers',
                    loadChildren: () => import('../../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
                  }
                ]
              }
            ]
          },
          {
            path: 'actions/:name',
            data: { title: extract('Recurring Deposits Account Actions'), routeParamBreadcrumb: 'name' },
            component: RecurringDepositsAccountActionsComponent,
            resolve: {
              recurringDepositsAccountActionData: RecurringDepositsAccountActionsResolver
            }
          }
        ]
      }
    ]
  },
  {
    path: '',
    data: { title: extract('All Recurring Deposits'), breadcrumb: 'Recurring Deposits', routeParamBreadcrumb: false },
    children: [
      {
        path: ':recurringDepositAccountId',
        data: { title: extract('RecurringDeposit Account View'), routeParamBreadcrumb: 'recurringDepositAccountId' },
        children: [
          {
            path: 'standing-instructions',
            loadChildren: () => import('../../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
          },
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
    RecurringDepositsAccountTemplateResolver,
    RecurringDepositsAccountActionsResolver,
    RecurringDepositsAccountAndTemplateResolver,
    RecurringDepositsAccountTransactionResolver,
    RecurringDepositsAccountTransactionTemplateResolver
  ]
})
export class RecurringDepositsRoutingModule {}
