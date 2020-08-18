/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SavingsRoutingModule } from './savings-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { SavingAccountActionsComponent } from './saving-account-actions/saving-account-actions.component';
import { SavingsAccountTransactionsComponent } from './saving-account-actions/savings-account-transactions/savings-account-transactions.component';
import { TransactionsTabComponent } from './savings-account-view/transactions-tab/transactions-tab.component';
import { SavingsAccountViewComponent } from './savings-account-view/savings-account-view.component';
import { ChargesTabComponent } from './savings-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './savings-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { DatatableTabsComponent } from './savings-account-view/datatable-tabs/datatable-tabs.component';
import { MultiRowComponent } from './savings-account-view/datatable-tabs/multi-row/multi-row.component';
import { SingleRowComponent } from './savings-account-view/datatable-tabs/single-row/single-row.component';
import { CreateSavingsAccountComponent } from './create-savings-account/create-savings-account.component';
import { SavingsAccountDetailsStepComponent } from './savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountChargesStepComponent } from './savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';
import { SavingsAccountTermsStepComponent } from './savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountPreviewStepComponent } from './savings-account-stepper/savings-account-preview-step/savings-account-preview-step.component';
import { EditSavingsAccountComponent } from './edit-savings-account/edit-savings-account.component';
import { ApproveSavingsAccountComponent } from './saving-account-actions/approve-savings-account/approve-savings-account.component';
import { RejectSavingsAccountComponent } from './saving-account-actions/reject-savings-account/reject-savings-account.component';
import { ActivateSavingsAccountComponent } from './saving-account-actions/activate-savings-account/activate-savings-account.component';
import { UndoApprovalSavingsAccountComponent } from './saving-account-actions/undo-approval-savings-account/undo-approval-savings-account.component';
import { PostInterestAsOnSavingsAccountComponent } from './saving-account-actions/post-interest-as-on-savings-account/post-interest-as-on-savings-account.component';
import { SavingsAccountAssignStaffComponent } from './saving-account-actions/savings-account-assign-staff/savings-account-assign-staff.component';
import { SavingsAccountUnassignStaffComponent } from './saving-account-actions/savings-account-unassign-staff/savings-account-unassign-staff.component';
import { CalculateInterestDialogComponent } from './savings-account-view/custom-dialogs/calculate-interest-dialog/calculate-interest-dialog.component';
import { PostInterestDialogComponent } from './savings-account-view/custom-dialogs/post-interest-dialog/post-interest-dialog.component';
import { ViewTransactionComponent } from './savings-account-view/transactions/view-transaction/view-transaction.component';
import { UndoTransactionDialogComponent } from './savings-account-view/custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';
import { ViewChargeComponent } from './savings-account-view/view-charge/view-charge.component';
import { WaiveChargeDialogComponent } from './savings-account-view/custom-dialogs/waive-charge-dialog/waive-charge-dialog.component';
import { InactivateChargeDialogComponent } from './savings-account-view/custom-dialogs/inactivate-charge-dialog/inactivate-charge-dialog.component';
import { WithdrawByClientSavingsAccountComponent } from './saving-account-actions/withdraw-by-client-savings-account/withdraw-by-client-savings-account.component';
import { AddChargeSavingsAccountComponent } from './saving-account-actions/add-charge-savings-account/add-charge-savings-account.component';
import { CloseSavingsAccountComponent } from './saving-account-actions/close-savings-account/close-savings-account.component';
import { ToggleWithholdTaxDialogComponent } from './savings-account-view/custom-dialogs/toggle-withhold-tax-dialog/toggle-withhold-tax-dialog.component';
import { ViewRecieptComponent } from './savings-account-view/transactions/view-reciept/view-reciept.component';
import { ExportTransactionsComponent } from './savings-account-view/transactions-tab/export-transactions/export-transactions.component';
import { EditTransactionComponent } from './savings-account-view/transactions/edit-transaction/edit-transaction.component';
import { ApplyAnnualFeesSavingsAccountComponent } from './saving-account-actions/apply-annual-fees-savings-account/apply-annual-fees-savings-account.component';


/**
 * Savings Module
 *
 * All components related to Savings functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    SavingsRoutingModule
  ],
  declarations: [
    SavingAccountActionsComponent,
    SavingsAccountTransactionsComponent,
    TransactionsTabComponent,
    SavingsAccountViewComponent,
    ChargesTabComponent,
    StandingInstructionsTabComponent,
    DatatableTabsComponent,
    MultiRowComponent,
    SingleRowComponent,
    CreateSavingsAccountComponent,
    SavingsAccountDetailsStepComponent,
    SavingsAccountChargesStepComponent,
    SavingsAccountTermsStepComponent,
    SavingsAccountPreviewStepComponent,
    EditSavingsAccountComponent,
    ApproveSavingsAccountComponent,
    RejectSavingsAccountComponent,
    ActivateSavingsAccountComponent,
    UndoApprovalSavingsAccountComponent,
    PostInterestAsOnSavingsAccountComponent,
    SavingsAccountAssignStaffComponent,
    SavingsAccountUnassignStaffComponent,
    CalculateInterestDialogComponent,
    PostInterestDialogComponent,
    ViewTransactionComponent,
    UndoTransactionDialogComponent,
    ViewChargeComponent,
    WaiveChargeDialogComponent,
    InactivateChargeDialogComponent,
    WithdrawByClientSavingsAccountComponent,
    AddChargeSavingsAccountComponent,
    CloseSavingsAccountComponent,
    ToggleWithholdTaxDialogComponent,
    ViewRecieptComponent,
    ExportTransactionsComponent,
    EditTransactionComponent,
    ApplyAnnualFeesSavingsAccountComponent
  ],
  providers: [DatePipe]
})
export class SavingsModule {}
