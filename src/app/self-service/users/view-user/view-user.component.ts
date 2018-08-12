/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * View self service user component.
 *
 * TODO: Complete functionality once API is available.
 */
@Component({
  selector: 'mifosx-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {

  /** Self service user. */
  user: any;

  /**
   * Retrieves the user data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { user: any }) => {
      this.user = data.user;
    });
  }

  ngOnInit() {
  }

  openDialog() {
    // TODO: Open change password dialog.
  }

}
