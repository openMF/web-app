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
  actions: { close: boolean,
            undo_approval: boolean,
            write_off: boolean,
            assign_loan_officer: boolean,
            foreclosure: boolean,
            prepay_loan: boolean,
            make_repayment: boolean,
            waive_interest: boolean } = {
              close: false,
              undo_approval: false,
              write_off: false,
              assign_loan_officer: false,
              foreclosure: false,
              prepay_loan: false,
              make_repayment: false,
              waive_interest: false };
  actionButtonData: any;
  actionName: any;

  /**
   * @param router Router.
   * @param route Activated Route.
   */
  constructor(private router: Router,
    private route: ActivatedRoute) {
      this.route.data.subscribe(( data: { actionButtonData: any }) => {
        this.actionButtonData = data.actionButtonData;
      });

    this.route.params.subscribe(params => {
      this.actionName = params['action'];
      if (this.actionName === 'change-loan-officer') {
        this.actionName = 'assign-loan-officer';
      }
      this.actions[this.actionName.replace(/-/g, '_')] = true;
    });
  }

}
