/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks/checker-inbox-and-tasks.component';
import { CheckerInboxComponent } from './checker-inbox-and-tasks-tabs/checker-inbox/checker-inbox.component';
import { ClientApprovalComponent } from './checker-inbox-and-tasks-tabs/client-approval/client-approval.component';
import { LoanApprovalComponent } from './checker-inbox-and-tasks-tabs/loan-approval/loan-approval.component';
import { LoanDisbursalComponent } from './checker-inbox-and-tasks-tabs/loan-disbursal/loan-disbursal.component';
import { RescheduleLoanComponent } from './checker-inbox-and-tasks-tabs/reschedule-loan/reschedule-loan.component';
import { ViewCheckerInboxComponent } from './view-checker-inbox/view-checker-inbox.component';

/** Custom Resolvers */
import { GetMakerCheckers } from './common-resolvers/getmakercheckers.resolver';
import { GetGroupedClientsData } from './common-resolvers/getGroupedClientsData.resolver';
import { GetOffices } from './common-resolvers/getOffices.resolver';
import { GetLoans } from './common-resolvers/getLoans.resolver';
import { GetRescheduleLoans } from './common-resolvers/getRescheduleLoans.resolver';
import { MakerCheckerTemplate } from './common-resolvers/makerCheckerTemplate.resolver';
import { GetCheckerInboxDetailResolver } from './common-resolvers/getCheckerInboxDetail.resolver';

/** Tasks Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'checker-inbox-and-tasks',
      component: CheckerInboxAndTasksComponent,
      data: { title: extract('Checker Inbox & Tasks'), breadcrumb: 'Checker Inbox & Tasks' },
      children: [
        {
          path: 'checker-inbox',
          component: CheckerInboxComponent,
          data: { title: extract('Checker Inbox') },
          resolve: {
            makerCheckerResource: GetMakerCheckers,
            makerCheckerTemplate: MakerCheckerTemplate
          }
        },
        {
          path: 'client-approval',
          component: ClientApprovalComponent,
          data: { title: extract('Client Approval') },
          resolve: {
            groupedClientData: GetGroupedClientsData
          },
        },
        {
          path: 'loan-approval',
          component: LoanApprovalComponent,
          data: { title: extract('Laon Approval') },
          resolve: {
            officesData: GetOffices,
            loansData: GetLoans
          },
        },
        {
          path: 'loan-disbursal',
          component: LoanDisbursalComponent,
          data: { title: extract('Loan Disbursal') },
          resolve: {
            loansData: GetLoans
          }
        },
        {
          path: 'reschedule-loan',
          component: RescheduleLoanComponent,
          data: { title: extract('Reschedule Loan') },
          resolve: {
            recheduleLoansData: GetRescheduleLoans
          }
        }
      ]
    },
    {
      path: 'checker-inbox-and-tasks/checker-inbox',
      children: [
        {
          path: ':id/view',
          component: ViewCheckerInboxComponent,
          data: { title: extract('View Checker Inbox Component'), routeParamBreadcrumb: 'clientId' },
          resolve: {
            checkerInboxDetail: GetCheckerInboxDetailResolver
          }
        }
      ]
    },
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GetMakerCheckers,
    GetGroupedClientsData,
    GetOffices,
    GetLoans,
    GetRescheduleLoans,
    MakerCheckerTemplate,
    GetCheckerInboxDetailResolver
  ]
})
export class TasksRoutingModule { }
