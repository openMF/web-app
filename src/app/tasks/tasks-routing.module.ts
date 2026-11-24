/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks/checker-inbox-and-tasks.component';
import { CheckerInboxComponent } from './checker-inbox-and-tasks-tabs/checker-inbox/checker-inbox.component';
import { ClientApprovalComponent } from './checker-inbox-and-tasks-tabs/client-approval/client-approval.component';
import {
  loanApprovalReadGuard,
  loanApprovalBatchGuard
} from './checker-inbox-and-tasks-tabs/loan-approval/loan-approval.guard';
import { LoanApprovalComponent } from './checker-inbox-and-tasks-tabs/loan-approval/loan-approval.component';
import { CreditApplicationsComponent } from './checker-inbox-and-tasks-tabs/credit-applications/credit-applications.component';
import {
  CREDIT_APPLICATIONS_PERMISSION,
  creditApplicationsGuard,
  creditApplicationBatchGuard
} from './checker-inbox-and-tasks-tabs/credit-applications/credit-applications.guard';
import { pendingProspectsGuard } from './checker-inbox-and-tasks-tabs/pending-prospects/pending-prospects.guard';
import { PendingProspectsComponent } from './checker-inbox-and-tasks-tabs/pending-prospects/pending-prospects.component';
import { CouncilApprovalComponent } from './checker-inbox-and-tasks-tabs/council-approval/council-approval.component';
import { LoanDisbursalComponent } from './checker-inbox-and-tasks-tabs/loan-disbursal/loan-disbursal.component';
import { RescheduleLoanComponent } from './checker-inbox-and-tasks-tabs/reschedule-loan/reschedule-loan.component';

/** Custom Resolvers */
import { GetMakerCheckers } from './common-resolvers/getmakercheckers.resolver';
import { GetGroupedClientsData } from './common-resolvers/getGroupedClientsData.resolver';
import {
  clientApprovalBatchGuard,
  clientApprovalReadGuard
} from './checker-inbox-and-tasks-tabs/client-approval/client-approval.guard';
import { GetOffices } from './common-resolvers/getOffices.resolver';
import { GetLoansToBeApproved } from './common-resolvers/getLoansToBeApproved.resolver';
import { GetLoansToBeDisbursed } from './common-resolvers/getLoansToBeDisbursed.resolver';
import { GetRescheduleLoans } from './common-resolvers/getRescheduleLoans.resolver';
import { MakerCheckerTemplate } from './common-resolvers/makerCheckerTemplate.resolver';
import { GetCheckerInboxDetailResolver } from './common-resolvers/getCheckerInboxDetail.resolver';

/** Tasks Routes */
export const routes: Routes = [
  Route.withShell([
    {
      path: 'checker-inbox/:id/view',
      redirectTo: ({ params }) => '/checker-inbox-and-tasks/checker-inbox?request=' + encodeURIComponent(params['id'])
    },
    {
      path: '',
      component: CheckerInboxAndTasksComponent,
      data: { title: 'Checker Inbox & Tasks', breadcrumb: 'Checker Inbox & Tasks' },
      children: [
        {
          path: 'checker-inbox',
          component: CheckerInboxComponent,
          canDeactivate: [(component: CheckerInboxComponent) => component.canLeave],
          data: { title: 'Checker Inbox' },
          resolve: {
            makerCheckerResource: GetMakerCheckers,
            makerCheckerTemplate: MakerCheckerTemplate
          }
        },
        {
          path: 'client-approval',
          component: ClientApprovalComponent,
          data: { title: 'Client Approval' },
          canActivate: [clientApprovalReadGuard],
          canDeactivate: [clientApprovalBatchGuard]
        },
        {
          path: 'loan-approval',
          component: LoanApprovalComponent,
          data: { title: 'Loan Approval' },
          canActivate: [loanApprovalReadGuard],
          canDeactivate: [loanApprovalBatchGuard]
        },
        {
          path: 'requests',
          component: CreditApplicationsComponent,
          canActivate: [creditApplicationsGuard],
          canDeactivate: [creditApplicationBatchGuard],
          data: { title: 'Requests', permissions: [CREDIT_APPLICATIONS_PERMISSION] }
        },
        {
          path: 'credit',
          component: CreditApplicationsComponent,
          canActivate: [creditApplicationsGuard],
          canDeactivate: [creditApplicationBatchGuard],
          data: { title: 'Credit', permissions: [CREDIT_APPLICATIONS_PERMISSION] }
        },
        {
          path: 'mass-rejection',
          component: CreditApplicationsComponent,
          canActivate: [creditApplicationsGuard],
          canDeactivate: [creditApplicationBatchGuard],
          data: { title: 'Mass Rejection', permissions: [CREDIT_APPLICATIONS_PERMISSION] }
        },
        {
          path: 'pending-prospects',
          component: PendingProspectsComponent,
          canActivate: [pendingProspectsGuard],
          data: { title: 'Pending Prospects', permissions: ['READ_PROSPECT'] }
        },
        {
          path: 'council-approval',
          component: CouncilApprovalComponent,
          data: { title: 'Council Approval' },
          resolve: {
            officesData: GetOffices,
            loansData: GetLoansToBeApproved
          }
        },
        {
          path: 'loan-disbursal',
          component: LoanDisbursalComponent,
          data: { title: 'Loan Disbursal' },
          resolve: {
            loansData: GetLoansToBeDisbursed
          }
        },
        {
          path: 'reschedule-loan',
          component: RescheduleLoanComponent,
          data: { title: 'Reschedule Loan' },
          resolve: {
            rescheduleLoansData: GetRescheduleLoans
          }
        }
      ]
    },
    {
      path: 'checker-inbox-and-tasks/checker-inbox',
      children: [
        {
          path: ':id/view',
          redirectTo: ({ params }) =>
            '/checker-inbox-and-tasks/checker-inbox?request=' + encodeURIComponent(params['id'])
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GetMakerCheckers,
    GetGroupedClientsData,
    GetOffices,
    GetLoansToBeApproved,
    GetLoansToBeDisbursed,
    GetRescheduleLoans,
    MakerCheckerTemplate,
    GetCheckerInboxDetailResolver
  ]
})
export class TasksRoutingModule {}
