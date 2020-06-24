/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Shares Account Actions Component
 */
@Component({
  selector: 'mifosx-shares-account-actions',
  templateUrl: './shares-account-actions.component.html',
  styleUrls: ['./shares-account-actions.component.scss']
})
export class SharesAccountActionsComponent {

  /** Shares Account Data */
  sharesAccountData: any;
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Approve': boolean
    'Reject': boolean
    'Close': boolean
    'Activate': boolean
    'Undo Approval': boolean
    'Apply Additional Shares': boolean
    'Redeem Shares': boolean
  } = {
    'Approve': false,
    'Reject': false,
    'Close': false,
    'Activate': false,
    'Undo Approval': false,
    'Apply Additional Shares': false,
    'Redeem Shares': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
