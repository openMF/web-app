/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Custom Components */
import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view/fixed-deposit-account-view.component';
import { InterestRateChartTabComponent } from './fixed-deposit-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { TransactionsTabComponent } from './fixed-deposit-account-view/transactions-tab/transactions-tab.component';
import { ChargesTabComponent } from './fixed-deposit-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './fixed-deposit-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { DatatableTabsComponent } from './fixed-deposit-account-view/datatable-tabs/datatable-tabs.component';
import { FixedDepositsAccountActionsComponent } from './fixed-deposits-account-actions/fixed-deposits-account-actions.component';
import { ViewTransactionComponent } from './fixed-deposit-account-view/view-transaction/view-transaction.component';
import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account/create-fixed-deposit-account.component';
import { EditFixedDepositAccountComponent } from './edit-fixed-deposit-account/edit-fixed-deposit-account.component';

/** Custom Resolvers */
import { FixedDepositsAccountViewResolver } from './common-resolvers/fixed-deposit-account-view.resolver';
import { SavingsDatatableResolver } from 'app/savings/common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from 'app/savings/common-resolvers/savings-datatables.resolver';
import { FixedDepositsAccountTransactionResolver } from './common-resolvers/fixed-deposit-account-transaction.resolver';
import { FixedDepositsAccountActionsResolver } from './common-resolvers/fixed-deposit-account-actions.resolver';
import { FixedDepositsAccountTemplateResolver } from './common-resolvers/fixed-deposit-account-template.resolver';
import { FixedDepositsAccountAndTemplateResolver } from './common-resolvers/fixed-deposit-account-and-template.resolver';
import { GeneralTabComponent } from './fixed-deposit-account-view/general-tab/general-tab.component';

const routes: Routes = [
  {
    path: '',
    data: { title: 'All Fixed Deposits', breadcrumb: 'Fixed Deposits', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create',
        data: { title: 'Create Fixed Deposit Account', breadcrumb: 'Create Fixed Deposit Account' },
        component: CreateFixedDepositAccountComponent,
        resolve: {
          fixedDepositsAccountTemplate: FixedDepositsAccountTemplateResolver
        }
      },
      {
        path: ':fixedDepositAccountId',
        data: { title: 'Fixed Deposit Account View', routeParamBreadcrumb: 'fixedDepositAccountId' },
        resolve: {
          fixedDepositsAccountData: FixedDepositsAccountViewResolver
        },
        children: [
          {
            path: '',
            component: FixedDepositAccountViewComponent,
            resolve: {
              fixedDepositsAccountData: FixedDepositsAccountViewResolver,
              savingsDatatables: SavingsDatatablesResolver
            },
            children: [
              {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
              },
              {
                path: 'general',
                component: GeneralTabComponent,
                data: { title: 'Fixed Deposit Account Details', breadcrumb: 'General', routeParamBreadcrumb: false }
              },
              {
                path: 'interest-rate-chart',
                component: InterestRateChartTabComponent,
                data: {
                  title: 'Fixed Deposit Account Interest Rate Chart',
                  breadcrumb: 'Interest Rate Chart',
                  routeParamBreadcrumb: false
                }
              },
              {
                path: 'transactions',
                component: TransactionsTabComponent,
                data: {
                  title: 'Fixed Deposit Account Transactions',
                  breadcrumb: 'Transactions',
                  routeParamBreadcrumb: false
                }
              },
              {
                path: 'charges',
                component: ChargesTabComponent,
                data: { title: 'Fixed Deposit Account Charges', breadcrumb: 'Charges', routeParamBreadcrumb: false }
              },
              {
                path: 'standing-instructions',
                component: StandingInstructionsTabComponent,
                data: {
                  title: 'Fixed Deposit Account Standing Instructions',
                  breadcrumb: 'Standing Instructions',
                  routeParamBreadcrumb: false
                }
              },
              {
                path: 'datatables',
                children: [
                  {
                    path: ':datatableName',
                    component: DatatableTabsComponent,
                    data: { title: 'View Data Table', routeParamBreadcrumb: 'datatableName' },
                    resolve: {
                      savingsDatatable: SavingsDatatableResolver
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'edit',
            data: { title: 'Edit Fixed Deposit Account', breadcrumb: 'Edit', routeParamBreadcrumb: false },
            component: EditFixedDepositAccountComponent,
            resolve: {
              fixedDepositsAccountAndTemplate: FixedDepositsAccountAndTemplateResolver
            }
          },
          {
            path: 'transactions',
            data: {
              title: 'Fixed Deposits Account Transactions',
              breadcrumb: 'Transactions',
              routeParamBreadcrumb: false
            },
            children: [
              {
                path: '',
                redirectTo: '../transactions',
                pathMatch: 'prefix'
              },
              {
                path: 'account-transfers',
                loadChildren: () =>
                  import('../../account-transfers/account-transfers.module').then((m) => m.AccountTransfersModule)
              },
              {
                path: ':id',
                data: { routeParamBreadcrumb: 'id' },
                children: [
                  {
                    path: '',
                    component: ViewTransactionComponent,
                    resolve: {
                      fixedDepositsAccountTransaction: FixedDepositsAccountTransactionResolver
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'actions/:name',
            data: { title: 'Fixed Deposits Account Actions', routeParamBreadcrumb: 'name' },
            component: FixedDepositsAccountActionsComponent,
            resolve: {
              fixedDepositsAccountActionData: FixedDepositsAccountActionsResolver
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    FixedDepositsAccountViewResolver,
    SavingsDatatableResolver,
    SavingsDatatablesResolver,
    FixedDepositsAccountTransactionResolver,
    FixedDepositsAccountActionsResolver,
    FixedDepositsAccountTemplateResolver,
    FixedDepositsAccountAndTemplateResolver
  ]
})
export class FixedDepositsRoutingModule {}
