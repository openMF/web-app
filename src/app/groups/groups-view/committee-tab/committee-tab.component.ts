/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Groups Committee Tab Component
 */
@Component({
  selector: 'mifosx-committee-tab',
  templateUrl: './committee-tab.component.html',
  styleUrls: ['./committee-tab.component.scss']
})
export class CommitteeTabComponent {

  /** Group Status */
  groupStatus: any;
  /** Group Roles Data */
  groupRolesData: any;
  /** Columns to be Displayed for client members table */
  groupRolesColumns: string[] = ['Name', 'Role', 'Client Id', 'Actions'];

  /**
   * Fetches groups data from parent's `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { groupViewData: any }) => {
      this.groupRolesData = data.groupViewData.groupRoles;
      this.groupStatus = data.groupViewData.status.value;
    });
  }

}
