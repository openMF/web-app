/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { ApproveSavingsAccountComponent } from './approve-savings-account/approve-savings-account.component';
import { RejectSavingsAccountComponent } from './reject-savings-account/reject-savings-account.component';
import { ActivateSavingsAccountComponent } from './activate-savings-account/activate-savings-account.component';
import { UndoApprovalSavingsAccountComponent } from './undo-approval-savings-account/undo-approval-savings-account.component';
import { PostInterestAsOnSavingsAccountComponent } from './post-interest-as-on-savings-account/post-interest-as-on-savings-account.component';
import { SavingsAccountAssignStaffComponent } from './savings-account-assign-staff/savings-account-assign-staff.component';
import { SavingsAccountUnassignStaffComponent } from './savings-account-unassign-staff/savings-account-unassign-staff.component';
import { WithdrawByClientSavingsAccountComponent } from './withdraw-by-client-savings-account/withdraw-by-client-savings-account.component';
import { AddChargeSavingsAccountComponent } from './add-charge-savings-account/add-charge-savings-account.component';
import { SavingsAccountTransactionsComponent } from './savings-account-transactions/savings-account-transactions.component';
import { CloseSavingsAccountComponent } from './close-savings-account/close-savings-account.component';
import { ApplyAnnualFeesSavingsAccountComponent } from './apply-annual-fees-savings-account/apply-annual-fees-savings-account.component';
import { ManageSavingsAccountComponent } from './manage-savings-account/manage-savings-account.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings account actions component.
 */
@Component({
  selector: 'mifosx-saving-account-actions',
  templateUrl: './saving-account-actions.component.html',
  styleUrls: ['./saving-account-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ApproveSavingsAccountComponent,
    RejectSavingsAccountComponent,
    ActivateSavingsAccountComponent,
    UndoApprovalSavingsAccountComponent,
    PostInterestAsOnSavingsAccountComponent,
    SavingsAccountAssignStaffComponent,
    SavingsAccountUnassignStaffComponent,
    WithdrawByClientSavingsAccountComponent,
    AddChargeSavingsAccountComponent,
    SavingsAccountTransactionsComponent,
    CloseSavingsAccountComponent,
    ApplyAnnualFeesSavingsAccountComponent,
    ManageSavingsAccountComponent
  ]
})
export class SavingAccountActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Approve: boolean;
    Reject: boolean;
    Withdrawal: boolean;
    Deposit: boolean;
    Activate: boolean;
    Close: boolean;
    'Undo Approval': boolean;
    'Post Interest As On': boolean;
    'Assign Staff': boolean;
    'Add Charge': boolean;
    'Unassign Staff': boolean;
    'Withdrawn by Client': boolean;
    'Apply Annual Fees': boolean;
    'Hold Amount': boolean;
    'Block Account': boolean;
    'Unblock Account': boolean;
    'Block Deposit': boolean;
    'Unblock Deposit': boolean;
    'Block Withdrawal': boolean;
    'Unblock Withdrawal': boolean;
  } = {
    Approve: false,
    Reject: false,
    Withdrawal: false,
    Deposit: false,
    Activate: false,
    Close: false,
    'Undo Approval': false,
    'Post Interest As On': false,
    'Assign Staff': false,
    'Add Charge': false,
    'Unassign Staff': false,
    'Withdrawn by Client': false,
    'Apply Annual Fees': false,
    'Hold Amount': false,
    'Block Account': false,
    'Unblock Account': false,
    'Block Deposit': false,
    'Unblock Deposit': false,
    'Block Withdrawal': false,
    'Unblock Withdrawal': false
  };

  currency: Currency;

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      if (data.savingsAccountActionData) {
        this.currency = data.savingsAccountActionData.currency;
      }
    });
    const name = this.route.snapshot.params['name'] as string;
    if (name in this.actions) {
      this.actions[name as keyof typeof this.actions] = true;
    }
  }
}
