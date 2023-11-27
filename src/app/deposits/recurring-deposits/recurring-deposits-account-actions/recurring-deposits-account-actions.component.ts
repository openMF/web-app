import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-recurring-deposits-account-actions',
  templateUrl: './recurring-deposits-account-actions.component.html',
  styleUrls: ['./recurring-deposits-account-actions.component.scss']
})
export class RecurringDepositsAccountActionsComponent {

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Activate': boolean
    'Undo Approval': boolean
    'Approve': boolean
    'Reject': boolean
    'Withdrawn by client': boolean
    'Add Charge': boolean
    'Premature Close': boolean
    'Close': boolean
    'Deposit': boolean
  } = {
      'Activate': false,
      'Undo Approval': false,
      'Approve': false,
      'Reject': false,
      'Withdrawn by client': false,
      'Add Charge': false,
      'Premature Close': false,
      'Close': false,
      'Deposit': false
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
    this.actions[name] = true;
  }

}
