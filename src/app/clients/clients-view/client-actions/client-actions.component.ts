/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Client actions component.
 */
@Component({
  selector: 'mifosx-client-actions',
  templateUrl: './client-actions.component.html',
  styleUrls: ['./client-actions.component.scss']
})
export class ClientActionsComponent {

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Assign Staff': boolean
    'Close': boolean
    'Reject': boolean
    'Survey': boolean
    'Withdraw': boolean
    'Update Default Savings': boolean
    'Transfer Client': boolean
    'Undo Transfer': boolean
    'Accept Transfer': boolean
    'Reject Transfer': boolean
    'Reactivate': boolean
    'Undo Rejection': boolean
    'Add Charge': boolean
    'Take Survey': boolean
    'Client Screen Reports': boolean
  } = {
    'Assign Staff': false,
    'Close': false,
    'Reject': false,
    'Survey': false,
    'Withdraw': false,
    'Update Default Savings': false,
    'Transfer Client': false,
    'Undo Transfer': false,
    'Accept Transfer': false,
    'Reject Transfer': false,
    'Reactivate': false,
    'Undo Rejection': false,
    'Add Charge': false,
    'Take Survey': false,
    'Client Screen Reports': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
