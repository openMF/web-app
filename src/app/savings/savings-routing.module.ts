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
import { ViewTransactionComponent } from './savings-account-view/view-transaction/view-transaction.component';
import { ViewChargeComponent } from './savings-account-view/view-charge/view-charge.component';

/** Custom Resolvers */
import { SavingsAccountViewResolver } from './common-resolvers/savings-account-view.resolver';
import { SavingsDatatableResolver } from './common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from './common-resolvers/savings-datatables.resolver';
import { SavingsAccountTemplateResolver } from './common-resolvers/savings-account-template.resolver';
import { SavingsAccountAndTemplateResolver } from './common-resolvers/savings-account-and-template.resolver';
import { SavingsAccountTransactionResolver } from './common-resolvers/savings-account-transaction.resolver';
import { SavingsAccountChargeResolver } from './common-resolvers/savings-account-charge.resolver';
import { SavingsAccountActionsResolver } from './common-resolvers/savings-account-actions.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All Savings'), breadcrumb: 'Savings', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create-savings-account',
        data: { title: extract('Create Savings Account'), breadcrumb: 'Create Savings Account' },
        component: CreateSavingsAccountComponent,
        resolve: {
          savingsAccountTemplate: SavingsAccountTemplateResolver
        }
      },
      {
        path: ':savingAccountId',
        data: { title: extract('Saving Account View'), routeParamBreadcrumb: 'savingAccountId' },
        resolve: {
          savingsAccountData: SavingsAccountViewResolver
        },
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
                component: TransactionsTabComponent,
                data: { title: extract('Savings Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false }
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
            path: 'edit-savings-account',
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
                path: ':id',
                data: { routeParamBreadcrumb: 'id' },
                component: ViewTransactionComponent,
                resolve: {
                  savingsAccountTransaction: SavingsAccountTransactionResolver
                }
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
  providers: [SavingsAccountViewResolver,
              SavingsDatatablesResolver,
              SavingsDatatableResolver,
              SavingsAccountTemplateResolver,
              SavingsAccountAndTemplateResolver,
              SavingsAccountTransactionResolver,
              SavingsAccountChargeResolver,
              SavingsAccountActionsResolver]
})
export class SavingsRoutingModule {}
