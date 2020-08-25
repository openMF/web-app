/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SavingsAccountViewComponent } from './savings-account-view/savings-account-view.component';
import { TransactionsTabComponent } from './savings-account-view/transactions-tab/transactions-tab.component';
import { SavingAccountActionsComponent } from './saving-account-actions/saving-account-actions.component';
import { ChargesTabComponent } from './savings-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './savings-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { DatatableTabsComponent } from './savings-account-view/datatable-tabs/datatable-tabs.component';
import { CreateSavingsAccountComponent } from './create-savings-account/create-savings-account.component';
import { EditSavingsAccountComponent } from './edit-savings-account/edit-savings-account.component';
import { ViewTransactionComponent } from './savings-account-view/transactions/view-transaction/view-transaction.component';
import { ViewChargeComponent } from './savings-account-view/view-charge/view-charge.component';
import { ViewRecieptComponent } from './savings-account-view/transactions/view-reciept/view-reciept.component';
import { ExportTransactionsComponent } from './savings-account-view/transactions-tab/export-transactions/export-transactions.component';
import { EditTransactionComponent } from './savings-account-view/transactions/edit-transaction/edit-transaction.component';

/** Custom Resolvers */
import { SavingsAccountViewResolver } from './common-resolvers/savings-account-view.resolver';
import { SavingsDatatableResolver } from './common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from './common-resolvers/savings-datatables.resolver';
import { SavingsAccountTemplateResolver } from './common-resolvers/savings-account-template.resolver';
import { SavingsAccountAndTemplateResolver } from './common-resolvers/savings-account-and-template.resolver';
import { SavingsAccountTransactionResolver } from './common-resolvers/savings-account-transaction.resolver';
import { SavingsAccountChargeResolver } from './common-resolvers/savings-account-charge.resolver';
import { SavingsAccountActionsResolver } from './common-resolvers/savings-account-actions.resolver';
import { SavingsTransactionRecieptResolver } from './common-resolvers/savings-transaction-reciept.resolver';
import { SavingsAccountTransactionTemplateResolver } from './common-resolvers/savings-account-transaction-template.resolver';

/** Savings Routes */
const routes: Routes = [
  {
    path: '',
    data: { title: extract('All Savings'), breadcrumb: 'Savings', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create',
        data: { title: extract('Create Savings Account'), breadcrumb: 'Create Savings Account' },
        component: CreateSavingsAccountComponent,
        resolve: {
          savingsAccountTemplate: SavingsAccountTemplateResolver
        }
      },
      {
        path: ':savingAccountId',
        data: { title: extract('Saving Account View'), routeParamBreadcrumb: 'savingAccountId' },
        children: [
          {
            path: '',
            component: SavingsAccountViewComponent,
            resolve: {
              savingsAccountData: SavingsAccountViewResolver,
              savingsDatatables: SavingsDatatablesResolver
            },
            children: [
              {
                path: 'transactions',
                data: { title: extract('Savings Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
                children: [
                  {
                    path: '',
                    component: TransactionsTabComponent

                  },
                  {
                    path: 'export',
                    component: ExportTransactionsComponent
                  }
                ]
              },
              {
                path: 'charges',
                component: ChargesTabComponent,
                data: { title: extract('Savings Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false }
              },
              {
                path: 'standing-instructions',
                component: StandingInstructionsTabComponent,
                data: { title: extract('Savings Account SIH'), breadcrumb: 'Standing Instructions', routeParamBreadcrumb: false }
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
          },
          {
            path: 'edit',
            data: { title: extract('Edit Savings Account'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
            component: EditSavingsAccountComponent,
            resolve: {
              savingsAccountAndTemplate: SavingsAccountAndTemplateResolver
            }
          },
          {
            path: 'transactions',
            data: { title: extract('Savings Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
            children: [
              {
                path: '',
                redirectTo: '../transactions', pathMatch: 'prefix'
              },
              {
                path: 'account-transfers',
                loadChildren: () => import('../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
              },
              {
                path: ':id',
                data: { routeParamBreadcrumb: 'id' },
                children: [
                  {
                    path: '',
                    component: ViewTransactionComponent,
                    resolve: {
                      savingsAccountTransaction: SavingsAccountTransactionResolver
                    }
                  },
                  {
                    path: 'edit',
                    component: EditTransactionComponent,
                    data: { breadcrumb: 'Edit', routeParamBreadcrumb: false },
                    resolve: {
                      savingsAccountTransactionTemplate: SavingsAccountTransactionTemplateResolver
                    }
                  },
                  {
                    path: 'reciept',
                    component: ViewRecieptComponent,
                    data: { breadcrumb: 'Reciept', routeParamBreadcrumb: false },
                    resolve: {
                      savingsTransactionReciept: SavingsTransactionRecieptResolver
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'charges',
            data: { title: extract('Savings Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false },
            children: [
              {
                path: '',
                redirectTo: '../charges', pathMatch: 'prefix'
              },
              {
                path: ':id',
                data: { routeParamBreadcrumb: 'id' },
                component: ViewChargeComponent,
                resolve: {
                  savingsAccountData: SavingsAccountViewResolver,
                  savingsAccountCharge: SavingsAccountChargeResolver
                }
              }
            ]
          },
          {
            path: 'actions/:name',
            data: { title: extract('Savings Account Actions'), routeParamBreadcrumb: 'name' },
            component: SavingAccountActionsComponent,
            resolve: {
              savingsAccountActionData: SavingsAccountActionsResolver
            }
          },
          {
            path: 'transfer-funds',
            loadChildren: () => import('../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
          }
        ]
      }
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [SavingsAccountViewResolver,
              SavingsDatatablesResolver,
              SavingsDatatableResolver,
              SavingsAccountTemplateResolver,
              SavingsAccountAndTemplateResolver,
              SavingsAccountTransactionResolver,
              SavingsAccountChargeResolver,
              SavingsAccountActionsResolver,
              SavingsTransactionRecieptResolver,
              SavingsAccountTransactionTemplateResolver]
})
export class SavingsRoutingModule {}
