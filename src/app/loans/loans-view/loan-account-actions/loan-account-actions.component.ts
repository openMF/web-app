/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Loan Account Actions component.
 */
@Component({
  selector: 'mifosx-loan-account-actions',
  templateUrl: './loan-account-actions.component.html',
  styleUrls: ['./loan-account-actions.component.scss']
})
export class LoanAccountActionsComponent {

  /** flag object to store possible actions and render appropriate UI to the user */
  actions: { close: boolean, undo_approval: boolean } = { close: false, undo_approval: false };

  /**
   * @param router Router.
   * @param route Activated Route.
   */
  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      if (params['action'].indexOf('-') > 0) {
        this.actions[params['action'].replace('-', '_')] = true;
      }
      this.actions[params['action']] = true;
    });
  }

}
