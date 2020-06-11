/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SavingsAccountViewComponent } from './savings-account-view/savings-account-view.component';
import { TransactionsTabComponent } from './savings-account-view/transactions-tab/transactions-tab.component';
import { SavingAccountActionsComponent } from './saving-account-actions/saving-account-actions.component';
import { AddSavingsChargeComponent } from './add-savings-charge/add-savings-charge.component';
import { ChargesTabComponent } from './savings-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './savings-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { DatatableTabsComponent } from './savings-account-view/datatable-tabs/datatable-tabs.component';

/** Custom Resolvers */
import { SavingAccountTransactionTemplateResolver } from './common-resolvers/saving-transaction-template.resolver';
import { SavingsChargeTemplateResolver } from './common-resolvers/savings-charge-template.resolver';
import { SavingsAccountViewResolver } from './common-resolvers/savings-account-view.resolver';
import { SavingsDatatableResolver } from './common-resolvers/savings-datatable.resolver';
import { SavingsDatatablesResolver } from './common-resolvers/savings-datatables.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All Savings'), breadcrumb: 'Savings', routeParamBreadcrumb: false },
    children: [
      {
        path: ':savingAccountId',
        data: { title: extract('Saving Account View'), routeParamBreadcrumb: 'savingAccountId' },
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
          },
          {
            path: 'add-savings-charge',
            component: AddSavingsChargeComponent,
            data: { title: extract('Add Savings Charge'), breadcrumb: 'Add Savings Charge', routeParamBreadcrumb: false },
            resolve: {
              savingsChargeTemplate: SavingsChargeTemplateResolver
            }
          },
          {
            path: ':action',
            component: SavingAccountActionsComponent,
            data: { title: extract('Saving Account Actions'), routeParamBreadcrumb: 'action' },
            resolve: {
              savingAccountTransactionTemplate: SavingAccountTransactionTemplateResolver
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
  providers: [SavingAccountTransactionTemplateResolver,
              SavingsChargeTemplateResolver,
              SavingsAccountViewResolver,
              SavingsDatatablesResolver,
              SavingsDatatableResolver]
})
export class SavingsRoutingModule {}
