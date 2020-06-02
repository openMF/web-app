/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Modules */
import { LoansRoutingModule } from './loans-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { LoansViewComponent } from './loans-view/loans-view.component';
import { GeneralTabComponent } from './loans-view/general-tab/general-tab.component';
import { AccountDetailsComponent } from './loans-view/account-details/account-details.component';
import { NotesTabComponent } from './loans-view/notes-tab/notes-tab.component';
import { ChargesTabComponent } from './loans-view/charges-tab/charges-tab.component';
import { OverdueChargesTabComponent } from './loans-view/overdue-charges-tab/overdue-charges-tab.component';
import { OriginalScheduleTabComponent } from './loans-view/original-schedule-tab/original-schedule-tab.component';
import { RepaymentScheduleTabComponent } from './loans-view/repayment-schedule-tab/repayment-schedule-tab.component';
import { TransactiosTabComponent } from './loans-view/transactios-tab/transactios-tab.component';

/**
 * Loans Module
 *
 * All components related to loan functions should be declared here.
 */
@NgModule({
  imports: [SharedModule, LoansRoutingModule, DirectivesModule, PipesModule],
  declarations: [
    AddLoanChargeComponent,
    LoansViewComponent,
    GeneralTabComponent,
    AccountDetailsComponent,
    NotesTabComponent,
    ChargesTabComponent,
    OverdueChargesTabComponent,
    OriginalScheduleTabComponent,
    RepaymentScheduleTabComponent,
    TransactiosTabComponent,
  ],
  providers: [DatePipe],
})
export class LoansModule {}
