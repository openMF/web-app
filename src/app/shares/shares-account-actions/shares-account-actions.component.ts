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

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Approve: boolean
    Reject: boolean
    Close: boolean
  } = {
    Approve: false,
    Reject: false,
    Close: false
  };

  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
