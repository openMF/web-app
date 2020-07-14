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
    'Close': boolean
  } = {
    'Activate': false,
    'Assign Staff': false,
    'Close': false
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
