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
            add_collateral: boolean,
            assign_loan_officer: boolean,
            foreclosure: boolean,
            prepay_loan: boolean,
            reject: boolean,
            disburse_to_savings: boolean,
            make_repayment: boolean,
            waive_interest: boolean,
            close_as_rescheduled: boolean,
            reschedule: boolean,
            recovery_payment: boolean,
            view_guarantors: boolean,
            create_guarantor: boolean,
            disburse: boolean,
            withdrawn_by_client: boolean,
            undo_disbursal: boolean,
            loan_screen_reports: boolean,
            approve: boolean,
            add_loan_charge: boolean } = {
              close: false,
              undo_approval: false,
              write_off: false,
              add_collateral: false,
              assign_loan_officer: false,
              foreclosure: false,
              prepay_loan: false,
              reject: false,
              disburse_to_savings: false,
              make_repayment: false,
              waive_interest: false,
              close_as_rescheduled: false,
              reschedule: false,
              recovery_payment: false,
              view_guarantors: false,
              create_guarantor: false,
              disburse: false,
              withdrawn_by_client: false,
              undo_disbursal: false,
              loan_screen_reports: false,
              approve: false,
              add_loan_charge: false };

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
      for (const key of Object.keys(this.actions)) {
        this.actions[key] = false;
      }
      this.actions[this.actionName.replace(/-/g, '_')] = true;
    });
  }

}
