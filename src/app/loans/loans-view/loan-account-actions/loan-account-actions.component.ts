import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mifosx-loan-account-actions',
  templateUrl: './loan-account-actions.component.html',
  styleUrls: ['./loan-account-actions.component.scss']
})
export class LoanAccountActionsComponent {

  /** flag object to store possible actions and render appropriate UI to the user */
  actions: { close: boolean } = { close: false };

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.actions[params['action']] = true;
    });
  }

}
