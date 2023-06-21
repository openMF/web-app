/** Angular Imports */
import { NgModule } from '@angular/core';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Modules */
import { LoansRoutingModule } from './loans-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { AddLoanChargeComponent } from './loans-view/loan-account-actions/add-loan-charge/add-loan-charge.component';
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
import { UndoApprovalComponent } from './loans-view/loan-account-actions/undo-approval/undo-approval.component';
import { AssignLoanOfficerComponent } from './loans-view/loan-account-actions/assign-loan-officer/assign-loan-officer.component';
import { ForeclosureComponent } from './loans-view/loan-account-actions/foreclosure/foreclosure.component';
import { PrepayLoanComponent } from './loans-view/loan-account-actions/prepay-loan/prepay-loan.component';
import { MakeRepaymentComponent } from './loans-view/loan-account-actions/make-repayment/make-repayment.component';
import { WaiveInterestComponent } from './loans-view/loan-account-actions/waive-interest/waive-interest.component';
import { FloatingInterestRatesComponent } from './loans-view/floating-interest-rates/floating-interest-rates.component';
import { WriteOffPageComponent } from './loans-view/loan-account-actions/write-off-page/write-off-page.component';
import { LoanTrancheDetailsComponent } from './loans-view/loan-tranche-details/loan-tranche-details.component';
import { CloseAsRescheduledComponent } from './loans-view/loan-account-actions/close-as-rescheduled/close-as-rescheduled.component';
import { LoanRescheduleComponent } from './loans-view/loan-account-actions/loan-reschedule/loan-reschedule.component';
import { LoanCollateralTabComponent } from './loans-view/loan-collateral-tab/loan-collateral-tab.component';
import { CreateLoansAccountComponent } from './create-loans-account/create-loans-account.component';
import { LoansAccountDetailsStepComponent } from './loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansAccountTermsStepComponent } from './loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from './loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';
import { LoansAccountPreviewStepComponent } from './loans-account-stepper/loans-account-preview-step/loans-account-preview-step.component';
import { RecoveryRepaymentComponent } from './loans-view/loan-account-actions/recovery-repayment/recovery-repayment.component';
import { ViewGuarantorsComponent } from './loans-view/loan-account-actions/view-guarantors/view-guarantors.component';
import { CreateGuarantorComponent } from './loans-view/loan-account-actions/create-guarantor/create-guarantor.component';
import { DisburseComponent } from './loans-view/loan-account-actions/disburse/disburse.component';
import { RejectLoanComponent } from './loans-view/loan-account-actions/reject-loan/reject-loan.component';
import { WithdrawnByClientComponent } from './loans-view/loan-account-actions/withdrawn-by-client/withdrawn-by-client.component';
import { UndoDisbursalComponent } from './loans-view/loan-account-actions/undo-disbursal/undo-disbursal.component';
import { AddCollateralComponent } from './loans-view/loan-account-actions/add-collateral/add-collateral.component';
import { LoanDocumentsTabComponent } from './loans-view/loan-documents-tab/loan-documents-tab.component';
import { ViewChargeComponent } from './loans-view/view-charge/view-charge.component';
import { StandingInstructionsTabComponent } from './loans-view/standing-instructions-tab/standing-instructions-tab.component';
import { EditLoansAccountComponent } from './edit-loans-account/edit-loans-account.component';
import { LoanScreenReportsComponent } from './loans-view/loan-account-actions/loan-screen-reports/loan-screen-reports.component';
import { ApproveLoanComponent } from './loans-view/loan-account-actions/approve-loan/approve-loan.component';
import { ViewRecieptComponent } from './loans-view/transactions/view-reciept/view-reciept.component';
import { ExportTransactionsComponent } from './loans-view/transactions/export-transactions/export-transactions.component';
import { ViewTransactionComponent } from './loans-view/transactions/view-transaction/view-transaction.component';
import { EditTransactionComponent } from './loans-view/transactions/edit-transaction/edit-transaction.component';
import { GlimAccountComponent } from './glim-account/glim-account.component';
import { CreateGlimAccountComponent } from './glim-account/create-glim-account/create-glim-account.component';
import { GlimDetailsStepComponent } from './glim-account/create-glim-account/glim-account-stepper/glim-details-step/glim-details-step.component';
import { GlimChargesStepComponent } from './glim-account/create-glim-account/glim-account-stepper/glim-charges-step/glim-charges-step.component';
import { GlimTermsStepComponent } from './glim-account/create-glim-account/glim-account-stepper/glim-terms-step/glim-terms-step.component';
import { GlimPreviewStepComponent } from './glim-account/create-glim-account/glim-account-stepper/glim-preview-step/glim-preview-step.component';

/** Dialog Components */
import { LoansAccountViewGuarantorDetailsDialogComponent } from './custom-dialog/loans-account-view-guarantor-details-dialog/loans-account-view-guarantor-details-dialog.component';
import { LoansAccountAddCollateralDialogComponent } from './custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';
import { LoanCreditBalanceRefundComponent } from './loans-view/loan-account-actions/loan-credit-balance-refund/loan-credit-balance-refund.component';
import { LoanDelinquencyTagsTabComponent } from './loans-view/loan-delinquency-tags-tab/loan-delinquency-tags-tab.component';
import { LoansAccountScheduleStepComponent } from './loans-account-stepper/loans-account-schedule-step/loans-account-schedule-step.component';
import { EditRepaymentScheduleComponent } from './loans-view/loan-account-actions/edit-repayment-schedule/edit-repayment-schedule.component';
import { DisburseToSavingsAccountComponent } from './loans-view/loan-account-actions/disburse-to-savings-account/disburse-to-savings-account.component';
import { LoansAccountDatatableStepComponent } from './loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';
import { RescheduleLoanTabComponent } from './loans-view/reschedule-loan-tab/reschedule-loan-tab.component';
import { AdjustLoanChargeComponent } from './loans-view/loan-account-actions/adjust-loan-charge/adjust-loan-charge.component';
import { ChargeOffComponent } from './loans-view/loan-account-actions/charge-off/charge-off.component';
import { AssetTransferLoanComponent } from './loans-view/loan-account-actions/asset-transfer-loan/asset-transfer-loan.component';
import { ExternalAssetOwnerTabComponent } from './loans-view/external-asset-owner-tab/external-asset-owner-tab.component';

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
    UndoApprovalComponent,
    AssignLoanOfficerComponent,
    ForeclosureComponent,
    PrepayLoanComponent,
    MakeRepaymentComponent,
    WaiveInterestComponent,
    FloatingInterestRatesComponent,
    WriteOffPageComponent,
    LoanTrancheDetailsComponent,
    CloseAsRescheduledComponent,
    LoanRescheduleComponent,
    LoanCollateralTabComponent,
    CreateLoansAccountComponent,
    LoansAccountDetailsStepComponent,
    LoansAccountTermsStepComponent,
    LoansAccountChargesStepComponent,
    LoansAccountPreviewStepComponent,
    LoansAccountAddCollateralDialogComponent,
    RecoveryRepaymentComponent,
    ViewGuarantorsComponent,
    CreateGuarantorComponent,
    LoansAccountViewGuarantorDetailsDialogComponent,
    RejectLoanComponent,
    DisburseComponent,
    WithdrawnByClientComponent,
    AddCollateralComponent,
    UndoDisbursalComponent,
    LoanDocumentsTabComponent,
    StandingInstructionsTabComponent,
    EditLoansAccountComponent,
    LoanScreenReportsComponent,
    ApproveLoanComponent,
    ViewChargeComponent,
    ViewTransactionComponent,
    EditTransactionComponent,
    ViewRecieptComponent,
    ExportTransactionsComponent,
    LoanCreditBalanceRefundComponent,
    GlimAccountComponent,
    CreateGlimAccountComponent,
    GlimDetailsStepComponent,
    GlimChargesStepComponent,
    GlimTermsStepComponent,
    GlimPreviewStepComponent,
    LoanDelinquencyTagsTabComponent,
    LoansAccountScheduleStepComponent,
    EditRepaymentScheduleComponent,
    DisburseToSavingsAccountComponent,
    LoansAccountDatatableStepComponent,
    RescheduleLoanTabComponent,
    AdjustLoanChargeComponent,
    ChargeOffComponent,
    AssetTransferLoanComponent,
    ExternalAssetOwnerTabComponent
  ],
  providers: [ ],
})
export class LoansModule {}
