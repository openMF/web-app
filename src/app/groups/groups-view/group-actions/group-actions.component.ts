/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  } = {
    'Assign Staff': false,
    'Close': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    const name = this.route.snapshot.params['name'];
    this.actions[name] = true;
  }

}
