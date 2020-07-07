import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-recurring-deposits-account-actions',
  templateUrl: './recurring-deposits-account-actions.component.html',
  styleUrls: ['./recurring-deposits-account-actions.component.scss']
})
export class RecurringDepositsAccountActionsComponent {

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Activate': boolean
  } = {
      'Activate': false,
    };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
