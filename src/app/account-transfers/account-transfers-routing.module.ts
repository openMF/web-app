/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ViewStandingInstructionsComponent } from './view-standing-instructions/view-standing-instructions.component';
import { EditStandingInstructionsComponent } from './edit-standing-instructions/edit-standing-instructions.component';
import { CreateStandingInstructionsComponent } from './create-standing-instructions/create-standing-instructions.component';
import { MakeAccountTransfersComponent } from './make-account-transfers/make-account-transfers.component';
import { ListStandingInstructionsComponent } from './list-standing-instructions/list-standing-instructions.component';
import { ListTransactionsComponent } from './list-transactions/list-transactions.component';
import { ViewAccountTransferComponent } from './view-account-transfer/view-account-transfer.component';

/** Custom Resolvers */
import { ViewStandingInstructionsResolver } from './common-resolvers/view-standing-instructions.resolver';
import { StandingInstructionsDataAndTemplateResolver } from './common-resolvers/standing-instructions-data-and-template.resolver';
import { StandingInstructionsTemplateResolver } from './common-resolvers/standing-instructions-template.resolver';
import { MakeAccountTransferTemplateResolver } from './common-resolvers/make-account-transfer-template.resolver';
import { ListTransactionsResolver } from './common-resolvers/list-transactions.resolver';
import { ViewAccountTransferResolver } from './common-resolvers/view-account-transfer.resolver';

/** Loans Route. */
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-standing-instructions',
        data: { title: extract('Create Standing Instructions'), breadcrumb: 'Create Standing Instructions', routeParamBreadcrumb: 'Create Standing Instructions' },
        component: CreateStandingInstructionsComponent,
        resolve: {
          standingIntructionsTemplate: StandingInstructionsTemplateResolver
        }
      },
      {
        path: 'make-account-transfer',
        data: { title: extract('Account Transfer'), breadcrumb: 'Account Transfer', routeParamBreadcrumb: 'Account Transfer' },
        component: MakeAccountTransfersComponent,
        resolve: {
          accountTransferTemplate: MakeAccountTransferTemplateResolver
        }
      },
      {
        path: 'list-standing-instructions',
        data: { title: extract('List Standing Instructions'), breadcrumb: 'List Standing Instructions', routeParamBreadcrumb: 'List Standing Instructions' },
        component: ListStandingInstructionsComponent,
        resolve: {
          standingIntructionsTemplate: StandingInstructionsTemplateResolver
        }
      },
      {
        path: 'account-transfers',
        data: { title: extract('View Account Transfer'), breadcrumb: 'Account Transfers', routeParamBreadcrumb: false },
        children: [
          {
            path: ':transferid',
            data: { routeParamBreadcrumb: 'transferid' },
            component: ViewAccountTransferComponent,
            resolve: {
              viewAccountTransferData: ViewAccountTransferResolver
            }
          }
        ]
      },
      {
        path: ':standingInstructionsId',
        data: { title: extract('Standing Instructions'), routeParamBreadcrumb: 'standingInstructionsId' },
        children: [
          {
            path: 'view',
            data: { title: extract('View Standing Instructions'), breadcrumb: 'view', routeParamBreadcrumb: false },
            component: ViewStandingInstructionsComponent,
            resolve: {
              standingInstructionsData: ViewStandingInstructionsResolver,
            },
          },
          {
            path: 'edit',
            data: { title: extract('Edit Standing Instructions'), breadcrumb: 'edit', routeParamBreadcrumb: false },
            component: EditStandingInstructionsComponent,
            resolve: {
              standingInstructionsDataAndTemplate: StandingInstructionsDataAndTemplateResolver,
            },
          },
          {
            path: 'list-account-transactions',
            data: { title: extract('List Account Transactions'), breadcrumb: 'List Account Transactions', routeParamBreadcrumb: 'List Account Transactions' },
            component: ListTransactionsComponent,
            resolve: {
              listTransactionData: ListTransactionsResolver
            }
          },
        ]
      },
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    ViewStandingInstructionsResolver,
    StandingInstructionsDataAndTemplateResolver,
    StandingInstructionsTemplateResolver,
    MakeAccountTransferTemplateResolver,
    ListTransactionsResolver,
    ViewAccountTransferResolver
  ]
})

export class AccountTransfersRoutingModule { }
