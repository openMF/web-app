import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { TasksRoutingModule } from './tasks-routing.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks/checker-inbox-and-tasks.component';
import { CheckerInboxComponent } from './checker-inbox-and-tasks-tabs/checker-inbox/checker-inbox.component';
import { ClientApprovalComponent } from './checker-inbox-and-tasks-tabs/client-approval/client-approval.component';
import { LoanApprovalComponent } from './checker-inbox-and-tasks-tabs/loan-approval/loan-approval.component';
import { LoanDisbursalComponent } from './checker-inbox-and-tasks-tabs/loan-disbursal/loan-disbursal.component';
import { RescheduleLoanComponent } from './checker-inbox-and-tasks-tabs/reschedule-loan/reschedule-loan.component';
import { ViewCheckerInboxComponent } from './view-checker-inbox/view-checker-inbox.component';

/**
 * Tasks Module
 */
@NgModule({
  imports: [
    SharedModule,
    TasksRoutingModule,
    DirectivesModule,
    PipesModule
  ],
  declarations: [
    CheckerInboxAndTasksComponent,
    CheckerInboxComponent,
    ClientApprovalComponent,
    LoanApprovalComponent,
    LoanDisbursalComponent,
    RescheduleLoanComponent,
    ViewCheckerInboxComponent
  ],
  providers: [DatePipe]
})
export class TasksModule { }
