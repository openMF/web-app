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
import { LoanAccountActionsComponent } from './loans-view/loan-account-actions/loan-account-actions.component';
import { LoansAccountCloseComponent } from './loans-view/loan-account-actions/loans-account-close/loans-account-close.component';
import { TransactionsTabComponent } from './loans-view/transactions-tab/transactions-tab.component';
import { DatatableTabComponent } from './loans-view/datatable-tab/datatable-tab.component';
import { MultiRowComponent } from './loans-view/datatable-tab/multi-row/multi-row.component';
import { SingleRowComponent } from './loans-view/datatable-tab/single-row/single-row.component';
import { UndoApprovalComponent } from './loans-view/loan-account-actions/undo-approval/undo-approval.component';
import { AssignLoanOfficerComponent } from './loans-view/loan-account-actions/assign-loan-officer/assign-loan-officer.component';
import { ForeclosureComponent } from './loans-view/loan-account-actions/foreclosure/foreclosure.component';
import { PrepayLoanComponent } from './loans-view/loan-account-actions/prepay-loan/prepay-loan.component';
import { MakeRepaymentComponent } from './loans-view/loan-account-actions/make-repayment/make-repayment.component';
import { WaiveInterestComponent } from './loans-view/loan-account-actions/waive-interest/waive-interest.component';
import { FloatingInterestRatesComponent } from './loans-view/floating-interest-rates/floating-interest-rates.component';
import { WriteOffPageComponent } from './loans-view/loan-account-actions/write-off-page/write-off-page.component';
import { LoanTrancheDetailsComponent } from './loans-view/loan-tranche-details/loan-tranche-details.component';

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
    LoanAccountActionsComponent,
    LoansAccountCloseComponent,
    TransactionsTabComponent,
    DatatableTabComponent,
    MultiRowComponent,
    SingleRowComponent,
    UndoApprovalComponent,
    AssignLoanOfficerComponent,
    ForeclosureComponent,
    PrepayLoanComponent,
    MakeRepaymentComponent,
    WaiveInterestComponent,
    FloatingInterestRatesComponent,
    WriteOffPageComponent,
    LoanTrancheDetailsComponent,
  ],
  providers: [DatePipe],
})
export class LoansModule {}
