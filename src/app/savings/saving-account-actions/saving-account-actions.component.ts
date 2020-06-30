/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
    'Approve': boolean
    'Reject': boolean
    'Withdrawal': boolean
    'Deposit': boolean
    'Activate': boolean
    'Close': boolean
    'Undo Approval': boolean
    'Post Interest As On': boolean
    'Assign Staff': boolean
    'Add Charge': boolean
    'Unassign Staff': boolean
    'Withdraw By Client': boolean
    'Apply Annual Fees': boolean
  } = {
    'Approve': false,
    'Reject': false,
    'Withdrawal': false,
    'Deposit': false,
    'Activate': false,
    'Close': false,
    'Undo Approval': false,
    'Post Interest As On': false,
    'Assign Staff': false,
    'Add Charge': false,
    'Unassign Staff': false,
    'Withdraw By Client': false,
    'Apply Annual Fees': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
