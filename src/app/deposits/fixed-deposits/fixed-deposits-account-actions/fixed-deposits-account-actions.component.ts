/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApproveFixedDepositsAccountComponent } from './approve-fixed-deposits-account/approve-fixed-deposits-account.component';
import { RejectFixedDepositsAccountComponent } from './reject-fixed-deposits-account/reject-fixed-deposits-account.component';
import { ActivateFixedDepositsAccountComponent } from './activate-fixed-deposits-account/activate-fixed-deposits-account.component';
import { UndoApprovalFixedDepositsAccountComponent } from './undo-approval-fixed-deposits-account/undo-approval-fixed-deposits-account.component';
import { WithdrawByClientFixedDepositsAccountComponent } from './withdraw-by-client-fixed-deposits-account/withdraw-by-client-fixed-deposits-account.component';
import { AddChargeFixedDepositsAccountComponent } from './add-charge-fixed-deposits-account/add-charge-fixed-deposits-account.component';
import { PrematureCloseFixedDepositsAccountComponent } from './premature-close-fixed-deposits-account/premature-close-fixed-deposits-account.component';
import { CloseFixedDepositsAccountComponent } from './close-fixed-deposits-account/close-fixed-deposits-account.component';
import { FixedDepositsCashTransactionComponent } from './fixed-deposits-cash-transaction/fixed-deposits-cash-transaction.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed deposits account actions component.
 */
@Component({
  selector: 'mifosx-fixed-deposits-account-actions',
  templateUrl: './fixed-deposits-account-actions.component.html',
  styleUrls: ['./fixed-deposits-account-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ApproveFixedDepositsAccountComponent,
    RejectFixedDepositsAccountComponent,
    ActivateFixedDepositsAccountComponent,
    UndoApprovalFixedDepositsAccountComponent,
    WithdrawByClientFixedDepositsAccountComponent,
    AddChargeFixedDepositsAccountComponent,
    PrematureCloseFixedDepositsAccountComponent,
    CloseFixedDepositsAccountComponent,
    FixedDepositsCashTransactionComponent
  ]
})
export class FixedDepositsAccountActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Approve: boolean;
    Reject: boolean;
    Activate: boolean;
    Close: boolean;
    'Undo Approval': boolean;
    'Undo Activation': boolean;
    'Add Charge': boolean;
    'Premature Close': boolean;
    'Withdrawn by Client': boolean;
    Withdrawal: boolean;
  } = {
    Approve: false,
    Reject: false,
    Activate: false,
    Close: false,
    'Undo Approval': false,
    'Undo Activation': false,
    'Add Charge': false,
    'Premature Close': false,
    'Withdrawn by Client': false,
    Withdrawal: false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    if (name && name in this.actions) {
      this.actions[name as keyof typeof this.actions] = true;
    }
  }
}
