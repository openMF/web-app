/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

/**
 * Create Center View
 */
@Component({
  selector: 'mifosx-centers-view',
  templateUrl: './centers-view.component.html',
  styleUrls: ['./centers-view.component.scss']
})
export class CentersViewComponent implements OnInit {

  /** Stores Center View Data */
  centerViewData: any;
  /** Center datatable */
  centerDatatables: any;
  /** Meeting data */
  meetingData: boolean;

  /**
   * Retrieves the data for center
   * @param route route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
      this.route.data.subscribe((data: {
        centerViewData: any,
        centerDatatables: any
      }) => {
        this.centerViewData = data.centerViewData;
        this.centerDatatables = data.centerDatatables;
      });
    }

  ngOnInit() {
    if (this.centerViewData.collectionMeetingCalendar) {
      this.meetingData = true;
    } else { this.meetingData = false; }
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Activate':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
    }
  }

}
