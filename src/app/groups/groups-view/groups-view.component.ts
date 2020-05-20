/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Groups View Component.
 */
@Component({
  selector: 'mifosx-groups-view',
  templateUrl: './groups-view.component.html',
  styleUrls: ['./groups-view.component.scss']
})
export class GroupsViewComponent {

  /** Group view data */
  groupViewData: any;

  /**
   * Fetches group data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { groupViewData: any }) => {
      this.groupViewData = data.groupViewData;
    });
  }

}
