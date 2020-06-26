/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SavingsService } from '../savings.service';

/**
 * Savings account actions component.
 */
@Component({
  selector: 'mifosx-saving-account-actions',
  templateUrl: './saving-account-actions.component.html',
  styleUrls: ['./saving-account-actions.component.scss']
})
export class SavingAccountActionsComponent {

  /** Savings Account Data */
  savingsAccountData: any;
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Approve': boolean
    'Reject': boolean
    'Withdraw': boolean
    'Activate': boolean
    'Undo Approval': boolean
    'Post Interest As On': boolean
    'Assign Staff': boolean
    'Unassign Staff': boolean
  } = {
    'Approve': false,
    'Reject': false,
    'Withdraw': false,
    'Activate': false,
    'Undo Approval': false,
    'Post Interest As On': false,
    'Assign Staff': false,
    'Unassign Staff': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(private route: ActivatedRoute,
              private savingsService: SavingsService) {
    const name = this.route.snapshot.params['name'];
    const accountId = this.route.parent.snapshot.params['savingAccountId'];
    this.savingsService.getSavingsAccountAndTemplate(accountId, true).subscribe((response: any) => {
      this.savingsAccountData = response;
      this.actions[name] = true;
    });
  }

}
