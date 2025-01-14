/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

/**
 * Savings account actions component.
 */
@Component({
  selector: 'mifosx-saving-account-actions',
  templateUrl: './saving-account-actions.component.html',
  styleUrls: ['./saving-account-actions.component.scss']
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
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }
}
