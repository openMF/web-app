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
    'Close': boolean,
    'Survey': boolean
  } = {
    'Assign Staff': false,
    'Close': false,
    'Survey': false
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
