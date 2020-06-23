/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SharesAccountViewComponent } from './shares-account-view/shares-account-view.component';
import { TransactionsTabComponent } from './shares-account-view/transactions-tab/transactions-tab.component';
import { ChargesTabComponent } from './shares-account-view/charges-tab/charges-tab.component';
import { DividendsTabComponent } from './shares-account-view/dividends-tab/dividends-tab.component';
import { CreateSharesAccountComponent } from './create-shares-account/create-shares-account.component';
import { EditSharesAccountComponent } from './edit-shares-account/edit-shares-account.component';
import { SharesAccountActionsComponent } from './shares-account-actions/shares-account-actions.component';

/** Custom Resolvers */
import { SharesAccountViewResolver } from './common-resolvers/share-account-view.resolver';
import { SharesAccountTemplateResolver } from './common-resolvers/shares-account-template.resolver';
import { SharesAccountAndTemplateResolver } from './common-resolvers/share-account-and-template.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('Shares'), breadcrumb: 'Shares', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create-shares-account',
        data: { title: extract('Create Shares Account'), breadcrumb: 'Create Shares Account' },
        component: CreateSharesAccountComponent,
        resolve: {
          sharesAccountTemplate: SharesAccountTemplateResolver
        }
      },
      {
        path: ':shareAccountId',
        data: { title: extract('Shares Account View'), routeParamBreadcrumb: 'shareAccountId' },
        children: [
          {
            path: '',
            component: SharesAccountViewComponent,
            resolve: {
              sharesAccountData: SharesAccountViewResolver
            },
            children: [
              {
                path: 'transactions',
                component: TransactionsTabComponent,
                data: { title: extract('Shares Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false }
              },
              {
                path: 'charges',
                component: ChargesTabComponent,
                data: { title: extract('Shares Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false }
              },
              {
                path: 'dividends',
                component: DividendsTabComponent,
                data: { title: extract('Shares Account Dividends'), breadcrumb: 'Dividends', routeParamBreadcrumb: false }
              }
            ]
          },
          {
            path: 'edit-shares-account',
            data: { title: extract('Edit Shares Account'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
            component: EditSharesAccountComponent,
            resolve: {
              sharesAccountAndTemplate: SharesAccountAndTemplateResolver
            }
          },
          {
            path: 'actions/:name',
            data: { title: extract('Shares Account Actions'), breadcrumb: 'Actions', routeParamBreadcrumb: 'name' },
            component: SharesAccountActionsComponent
          }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    SharesAccountViewResolver,
    SharesAccountTemplateResolver,
    SharesAccountAndTemplateResolver
  ]
})
export class SharesRoutingModule { }
