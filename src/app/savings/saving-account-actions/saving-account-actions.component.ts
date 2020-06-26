/** Angular Imports */
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Savings account actions component.
 */
@Component({
  selector: 'mifosx-saving-account-actions',
  templateUrl: './saving-account-actions.component.html',
  styleUrls: ['./saving-account-actions.component.scss']
})
export class SavingAccountActionsComponent {

  /** Shares Account Data */
  sharesAccountData: any;
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Approve': boolean
    'Reject': boolean
    'Withdraw': boolean
    'Activate': boolean
    'Undo Approval': boolean
  } = {
    'Approve': false,
    'Reject': false,
    'Withdraw': false,
    'Activate': false,
    'Undo Approval': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
