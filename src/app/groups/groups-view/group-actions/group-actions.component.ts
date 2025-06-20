/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupAssignStaffComponent } from './group-assign-staff/group-assign-staff.component';
import { CloseGroupComponent } from './close-group/close-group.component';
import { ActivateGroupComponent } from './activate-group/activate-group.component';
import { AttachGroupMeetingComponent } from './attach-group-meeting/attach-group-meeting.component';
import { GroupAttendanceComponent } from './group-attendance/group-attendance.component';
import { ManageGroupMembersComponent } from './manage-group-members/manage-group-members.component';
import { EditGroupMeetingComponent } from './edit-group-meeting/edit-group-meeting.component';
import { EditGroupMeetingScheduleComponent } from './edit-group-meeting-schedule/edit-group-meeting-schedule.component';
import { GroupTransferClientsComponent } from './group-transfer-clients/group-transfer-clients.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Group actions component.
 */
@Component({
  selector: 'mifosx-group-actions',
  templateUrl: './group-actions.component.html',
  styleUrls: ['./group-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    GroupAssignStaffComponent,
    CloseGroupComponent,
    ActivateGroupComponent,
    AttachGroupMeetingComponent,
    GroupAttendanceComponent,
    ManageGroupMembersComponent,
    EditGroupMeetingComponent,
    EditGroupMeetingScheduleComponent,
    GroupTransferClientsComponent
  ]
})
export class GroupActionsComponent {
  /** Flag object to store possible actions and render appropriate UI to the user */
  actions: {
    'Assign Staff': boolean;
    Close: boolean;
    Activate: boolean;
    'Attach Meeting': boolean;
    Attendance: boolean;
    'Manage Members': boolean;
    'Edit Meeting': boolean;
    'Edit Meeting Schedule': boolean;
    'Transfer Clients': boolean;
  } = {
    'Assign Staff': false,
    Close: false,
    Activate: false,
    'Attach Meeting': false,
    Attendance: false,
    'Manage Members': false,
    'Edit Meeting': false,
    'Edit Meeting Schedule': false,
    'Transfer Clients': false
  };

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const action = this.route.snapshot.params['action'];
    if (action && action in this.actions) {
      this.actions[action as keyof typeof this.actions] = true;
    }
  }
}
