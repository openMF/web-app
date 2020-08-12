/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Group actions component.
 */
@Component({
  selector: 'mifosx-group-actions',
  templateUrl: './group-actions.component.html',
  styleUrls: ['./group-actions.component.scss']
})
export class GroupActionsComponent {

  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Assign Staff': boolean
    'Close': boolean
    'Activate': boolean
    'Attach Meeting': boolean
    'Attendance': boolean
    'Manage Members': boolean
    'Edit Meeting': boolean
    'Edit Meeting Schedule': boolean
    'Transfer Clients': boolean
  } = {
    'Assign Staff': false,
    'Close': false,
    'Activate': false,
    'Attach Meeting': false,
    'Attendance': false,
    'Manage Members': false,
    'Edit Meeting': false,
    'Edit Meeting Schedule': false,
    'Transfer Clients': false
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
