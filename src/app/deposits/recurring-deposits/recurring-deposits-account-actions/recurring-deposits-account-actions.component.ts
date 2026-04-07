import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { ActivateRecurringDepositsAccountComponent } from './activate-recurring-deposits-account/activate-recurring-deposits-account.component';
import { UndoApprovalRecurringDepositsAccountComponent } from './undo-approval-recurring-deposits-account/undo-approval-recurring-deposits-account.component';
import { ApproveRecurringDepositsAccountComponent } from './approve-recurring-deposits-account/approve-recurring-deposits-account.component';
import { RejectRecurringDepositsAccountComponent } from './reject-recurring-deposits-account/reject-recurring-deposits-account.component';
import { WithdrawByClientRecurringDepositsAccountComponent } from './withdraw-by-client-recurring-deposits-account/withdraw-by-client-recurring-deposits-account.component';
import { AddChargeRecurringDepositsAccountComponent } from './add-charge-recurring-deposits-account/add-charge-recurring-deposits-account.component';
import { PrematureCloseRecurringDepositAccountComponent } from './premature-close-recurring-deposit-account/premature-close-recurring-deposit-account.component';
import { CloseRecurringDepositsAccountComponent } from './close-recurring-deposits-account/close-recurring-deposits-account.component';
import { DepositRecurringDepositsAccountComponent } from './deposit-recurring-deposits-account/deposit-recurring-deposits-account.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposits-account-actions',
  templateUrl: './recurring-deposits-account-actions.component.html',
  styleUrls: ['./recurring-deposits-account-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ActivateRecurringDepositsAccountComponent,
    UndoApprovalRecurringDepositsAccountComponent,
    ApproveRecurringDepositsAccountComponent,
    RejectRecurringDepositsAccountComponent,
    WithdrawByClientRecurringDepositsAccountComponent,
    AddChargeRecurringDepositsAccountComponent,
    PrematureCloseRecurringDepositAccountComponent,
    CloseRecurringDepositsAccountComponent,
    DepositRecurringDepositsAccountComponent
  ]
})
export class RecurringDepositsAccountActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Activate: boolean;
    'Undo Activation': boolean;
    'Undo Approval': boolean;
    Approve: boolean;
    Reject: boolean;
    'Withdrawn by Client': boolean;
    'Add Charge': boolean;
    'Premature Close': boolean;
    Close: boolean;
    Deposit: boolean;
    Withdrawal: boolean;
  } = {
    Activate: false,
    'Undo Activation': false,
    'Undo Approval': false,
    Approve: false,
    Reject: false,
    'Withdrawn by Client': false,
    'Add Charge': false,
    'Premature Close': false,
    Close: false,
    Deposit: false,
    Withdrawal: false
  };

  currency: Currency;

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { recurringDepositsAccountActionData: any }) => {
      if (data.recurringDepositsAccountActionData) {
        this.currency = data.recurringDepositsAccountActionData.currency;
      }
    });
    const name = this.route.snapshot.params['name'];
    if (name && name in this.actions) {
      this.actions[name as keyof typeof this.actions] = true;
    }
  }
}
