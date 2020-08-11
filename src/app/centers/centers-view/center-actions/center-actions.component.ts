/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Center actions component.
 */
@Component({
  selector: 'mifosx-center-actions',
  templateUrl: './center-actions.component.html',
  styleUrls: ['./center-actions.component.scss']
})
export class CenterActionsComponent {

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Activate': boolean,
    'Assign Staff': boolean,
    'Close': boolean,
    'Attendance': boolean,
    'Attach Meeting': boolean,
    'Edit Meeting': boolean,
    'Edit Meeting Schedule': boolean,
    'Manage Groups': boolean,
    'Staff Assignment History': boolean
  } = {
    'Activate': false,
    'Assign Staff': false,
    'Close': false,
    'Attendance': false,
    'Attach Meeting': false,
    'Edit Meeting': false,
    'Edit Meeting Schedule': false,
    'Manage Groups': false,
    'Staff Assignment History': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
