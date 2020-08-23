/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { GroupsRoutingModule } from './groups-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { GroupsComponent } from './groups.component';
import { GroupsViewComponent } from './groups-view/groups-view.component';
import { GeneralTabComponent } from './groups-view/general-tab/general-tab.component';
import { NotesTabComponent } from './groups-view/notes-tab/notes-tab.component';
import { CommitteeTabComponent } from './groups-view/committee-tab/committee-tab.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DatatableTabsComponent } from './groups-view/datatable-tabs/datatable-tabs.component';
import { SingleRowComponent } from './groups-view/datatable-tabs/single-row/single-row.component';
import { MultiRowComponent } from './groups-view/datatable-tabs/multi-row/multi-row.component';
import { AddRoleComponent } from './groups-view/add-role/add-role.component';
import { UnassignRoleDialogComponent } from './groups-view/custom-dialogs/unassign-role-dialog/unassign-role-dialog.component';
import { GroupActionsComponent } from './groups-view/group-actions/group-actions.component';
import { GroupAssignStaffComponent } from './groups-view/group-actions/group-assign-staff/group-assign-staff.component';
import { UnassignStaffDialogComponent } from './groups-view/custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { CloseGroupComponent } from './groups-view/group-actions/close-group/close-group.component';
import { ActivateGroupComponent } from './groups-view/group-actions/activate-group/activate-group.component';
import { EditGroupComponent } from './edit-group/edit-group.component';
import { AttachGroupMeetingComponent } from './groups-view/group-actions/attach-group-meeting/attach-group-meeting.component';
import { GroupAttendanceComponent } from './groups-view/group-actions/group-attendance/group-attendance.component';
import { ManageGroupMembersComponent } from './groups-view/group-actions/manage-group-members/manage-group-members.component';
import { EditGroupMeetingComponent } from './groups-view/group-actions/edit-group-meeting/edit-group-meeting.component';
import { EditGroupMeetingScheduleComponent } from './groups-view/group-actions/edit-group-meeting-schedule/edit-group-meeting-schedule.component';
import { GroupTransferClientsComponent } from './groups-view/group-actions/group-transfer-clients/group-transfer-clients.component';

/**
 * Groups Module
 *
 * All components related to Groups should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    GroupsRoutingModule
  ],
  declarations: [
    GroupsComponent,
    GroupsViewComponent,
    GeneralTabComponent,
    NotesTabComponent,
    CommitteeTabComponent,
    CreateGroupComponent,
    DatatableTabsComponent,
    SingleRowComponent,
    MultiRowComponent,
    AddRoleComponent,
    UnassignRoleDialogComponent,
    GroupActionsComponent,
    GroupAssignStaffComponent,
    UnassignStaffDialogComponent,
    CloseGroupComponent,
    ActivateGroupComponent,
    EditGroupComponent,
    AttachGroupMeetingComponent,
    GroupAttendanceComponent,
    ManageGroupMembersComponent,
    EditGroupMeetingComponent,
    EditGroupMeetingScheduleComponent,
    GroupTransferClientsComponent
  ],
  providers: [DatePipe]
})
export class GroupsModule { }
