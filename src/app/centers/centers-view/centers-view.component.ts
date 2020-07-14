/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { CentersService } from '../centers.service';

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
              public dialog: MatDialog,
              public centersService: CentersService) {
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
      case 'Assign Staff':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Unassign Staff':
        this.centersUnassignStaff();
        break;
    }
  }

  /**
   * Unassign's the centers's staff.
   */
  private centersUnassignStaff() {
    const unAssignStaffDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Unassign Staff', dialogContext: 'Are you sure you want Unassign Staff ?' }
    });
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.centersService.executeGroupActionCommand(this.centerViewData.id, 'unassignStaff', { staffId: this.centerViewData.staffId })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/centers`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

}
