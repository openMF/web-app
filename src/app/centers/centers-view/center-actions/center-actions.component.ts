/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivateCenterComponent } from './activate-center/activate-center.component';
import { CenterAssignStaffComponent } from './center-assign-staff/center-assign-staff.component';
import { CloseCenterComponent } from './close-center/close-center.component';
import { CenterAttendanceComponent } from './center-attendance/center-attendance.component';
import { AttachCenterMeetingComponent } from './attach-center-meeting/attach-center-meeting.component';
import { EditCenterMeetingComponent } from './edit-center-meeting/edit-center-meeting.component';
import { EditCenterMeetingScheduleComponent } from './edit-center-meeting-schedule/edit-center-meeting-schedule.component';
import { ManageGroupsComponent } from './manage-groups/manage-groups.component';
import { StaffAssignmentHistoryComponent } from './staff-assignment-history/staff-assignment-history.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Center actions component.
 */
@Component({
  selector: 'mifosx-center-actions',
  templateUrl: './center-actions.component.html',
  styleUrls: ['./center-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ActivateCenterComponent,
    CenterAssignStaffComponent,
    CloseCenterComponent,
    CenterAttendanceComponent,
    AttachCenterMeetingComponent,
    EditCenterMeetingComponent,
    EditCenterMeetingScheduleComponent,
    ManageGroupsComponent,
    StaffAssignmentHistoryComponent
  ]
})
export class CenterActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    Activate: boolean;
    'Assign Staff': boolean;
    Close: boolean;
    Attendance: boolean;
    'Attach Meeting': boolean;
    'Edit Meeting': boolean;
    'Edit Meeting Schedule': boolean;
    'Manage Groups': boolean;
    'Staff Assignment History': boolean;
  } = {
    Activate: false,
    'Assign Staff': false,
    Close: false,
    Attendance: false,
    'Attach Meeting': false,
    'Edit Meeting': false,
    'Edit Meeting Schedule': false,
    'Manage Groups': false,
    'Staff Assignment History': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const name = this.route.snapshot.params['action'];

    if (name && name in this.actions) {
      this.actions[name as keyof typeof this.actions] = true;
    }
  }
}
