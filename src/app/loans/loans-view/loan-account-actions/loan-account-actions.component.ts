/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansAccountCloseComponent } from './loans-account-close/loans-account-close.component';
import { UndoApprovalComponent } from './undo-approval/undo-approval.component';
import { AssignLoanOfficerComponent } from './assign-loan-officer/assign-loan-officer.component';
import { ForeclosureComponent } from './foreclosure/foreclosure.component';
import { PrepayLoanComponent } from './prepay-loan/prepay-loan.component';
import { MakeRepaymentComponent } from './make-repayment/make-repayment.component';
import { LoanCreditBalanceRefundComponent } from './loan-credit-balance-refund/loan-credit-balance-refund.component';
import { WaiveInterestComponent } from './waive-interest/waive-interest.component';
import { WriteOffPageComponent } from './write-off-page/write-off-page.component';
import { CloseAsRescheduledComponent } from './close-as-rescheduled/close-as-rescheduled.component';
import { LoanRescheduleComponent } from './loan-reschedule/loan-reschedule.component';
import { RecoveryRepaymentComponent } from './recovery-repayment/recovery-repayment.component';
import { ViewGuarantorsComponent } from './view-guarantors/view-guarantors.component';
import { CreateGuarantorComponent } from './create-guarantor/create-guarantor.component';
import { DisburseToSavingsAccountComponent } from './disburse-to-savings-account/disburse-to-savings-account.component';
import { RejectLoanComponent } from './reject-loan/reject-loan.component';
import { DisburseComponent } from './disburse/disburse.component';
import { WithdrawnByClientComponent } from './withdrawn-by-client/withdrawn-by-client.component';
import { AddCollateralComponent } from './add-collateral/add-collateral.component';
import { UndoDisbursalComponent } from './undo-disbursal/undo-disbursal.component';
import { LoanScreenReportsComponent } from './loan-screen-reports/loan-screen-reports.component';
import { ApproveLoanComponent } from './approve-loan/approve-loan.component';
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { EditRepaymentScheduleComponent } from './edit-repayment-schedule/edit-repayment-schedule.component';
import { ChargeOffComponent } from './charge-off/charge-off.component';
import { AssetTransferLoanComponent } from './asset-transfer-loan/asset-transfer-loan.component';
import { LoanReagingComponent } from './loan-reaging/loan-reaging.component';
import { LoanReamortizeComponent } from './loan-reamortize/loan-reamortize.component';
import { AddInterestPauseComponent } from './add-interest-pause/add-interest-pause.component';
import { UndoWriteOffComponent } from './undo-write-off/undo-write-off.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AttachOriginatorComponent } from './attach-originator/attach-originator.component';

/**
 * Loan Account Actions component.
 */
@Component({
  selector: 'mifosx-loan-account-actions',
  templateUrl: './loan-account-actions.component.html',
  styleUrls: ['./loan-account-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    LoansAccountCloseComponent,
    UndoApprovalComponent,
    AssignLoanOfficerComponent,
    ForeclosureComponent,
    PrepayLoanComponent,
    MakeRepaymentComponent,
    LoanCreditBalanceRefundComponent,
    WaiveInterestComponent,
    WriteOffPageComponent,
    CloseAsRescheduledComponent,
    LoanRescheduleComponent,
    RecoveryRepaymentComponent,
    ViewGuarantorsComponent,
    CreateGuarantorComponent,
    DisburseToSavingsAccountComponent,
    RejectLoanComponent,
    DisburseComponent,
    WithdrawnByClientComponent,
    AddCollateralComponent,
    UndoDisbursalComponent,
    LoanScreenReportsComponent,
    ApproveLoanComponent,
    AddLoanChargeComponent,
    EditRepaymentScheduleComponent,
    ChargeOffComponent,
    AssetTransferLoanComponent,
    LoanReagingComponent,
    LoanReamortizeComponent,
    AddInterestPauseComponent,
    UndoWriteOffComponent,
    AttachOriginatorComponent
  ]
})
export class LoanAccountActionsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Loan Details Data */
  navigationData: any;

  /** flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Close: boolean;
    'Undo Approval': boolean;
    'Write Off': boolean;
    'Add Collateral': boolean;
    'Assign Loan Officer': boolean;
    Foreclosure: boolean;
    'Prepay Loan': boolean;
    Reject: boolean;
    'Disburse to Savings': boolean;
    'Make Repayment': boolean;
    'Waive Interest': boolean;
    'Close (as Rescheduled)': boolean;
    Reschedule: boolean;
    'Recovery Payment': boolean;
    'View Guarantors': boolean;
    'Create Guarantor': boolean;
    Disburse: boolean;
    'Withdrawn by Client': boolean;
    'Undo Disbursal': boolean;
    'Undo Last Disbursal': boolean;
    'Loan Screen Reports': boolean;
    Approve: boolean;
    'Add Loan Charge': boolean;
    'Goodwill Credit': boolean;
    'Merchant Issued Refund': boolean;
    'Payout Refund': boolean;
    'Credit Balance Refund': boolean;
    'Edit Repayment Schedule': boolean;
    'Charge-Off': boolean;
    'Sell Loan': boolean;
    'Buy Back Loan': boolean;
    'Re-Age': boolean;
    'Re-Amortize': boolean;
    'Interest Payment Waiver': boolean;
    'Add Interest Pause': boolean;
    'Capitalized Income': boolean;
    'Contract Termination': boolean;
    'Buy Down Fee': boolean;
    'Undo Write-off': boolean;
    'Attach Loan Originator': boolean;
  } = {
    Close: false,
    'Undo Approval': false,
    'Write Off': false,
    'Add Collateral': false,
    'Assign Loan Officer': false,
    Foreclosure: false,
    'Prepay Loan': false,
    Reject: false,
    'Disburse to Savings': false,
    'Make Repayment': false,
    'Waive Interest': false,
    'Close (as Rescheduled)': false,
    Reschedule: false,
    'Recovery Payment': false,
    'View Guarantors': false,
    'Create Guarantor': false,
    Disburse: false,
    'Withdrawn by Client': false,
    'Undo Disbursal': false,
    'Undo Last Disbursal': false,
    'Loan Screen Reports': false,
    Approve: false,
    'Add Loan Charge': false,
    'Goodwill Credit': false,
    'Merchant Issued Refund': false,
    'Payout Refund': false,
    'Credit Balance Refund': false,
    'Edit Repayment Schedule': false,
    'Charge-Off': false,
    'Sell Loan': false,
    'Buy Back Loan': false,
    'Re-Age': false,
    'Re-Amortize': false,
    'Interest Payment Waiver': false,
    'Add Interest Pause': false,
    'Capitalized Income': false,
    'Contract Termination': false,
    'Buy Down Fee': false,
    'Undo Write-off': false,
    'Attach Loan Originator': false
  };

  actionButtonData: any;
  actionName: any;

  /**
   * @param route Activated Route.
   */
  constructor() {
    const currentNavigation = this.router.currentNavigation();
    // Safely access data with optional chaining
    this.navigationData = currentNavigation?.extras?.state?.data;

    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.actionButtonData = data.actionButtonData ? data.actionButtonData : {};
    });

    this.route.params.subscribe((params) => {
      this.actionName = params['action'];
      if (this.actionName === 'Change Loan Officer') {
        this.actionName = 'Assign Loan Officer';
      }
      for (const key of Object.keys(this.actions)) {
        this.actions[key as keyof typeof this.actions] = false;
      }
      this.actions[this.actionName as keyof typeof this.actions] = true;
    });

    this.actionButtonData['actionName'] = this.actionName;
  }
}
