/** Angular Imports */
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Create savings account actions component.
 */
@Component({
  selector: 'mifosx-saving-account-actions',
  templateUrl: './saving-account-actions.component.html',
  styleUrls: ['./saving-account-actions.component.scss']
})
export class SavingAccountActionsComponent {

  /** flag object to store possible actions and render appropriate UI to the user */
  actions: { transaction: boolean } = { transaction: false };

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.actions[params['action']] = true;
    });
  }


}
