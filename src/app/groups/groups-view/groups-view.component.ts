/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { GroupsService } from '../groups.service';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { NgClass, NgIf, NgFor, LowerCasePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Groups View Component.
 */
@Component({
  selector: 'mifosx-groups-view',
  templateUrl: './groups-view.component.html',
  styleUrls: ['./groups-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatCardTitle,
    NgClass,
    MatTooltip,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatCardSubtitle,
    MatMenu,
    MatMenuItem,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    LowerCasePipe,
    StatusLookupPipe,
    DateFormatPipe
  ]
})
export class GroupsViewComponent {
  /** Group view data */
  groupViewData: any;
  /** Group datatables data */
  groupDatatables: any;

  /**
   * Fetches group data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {GroupsService} groupsService Groups Service
   * @param {Router} router Router
   * @param {MatDialog} dialog Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { groupViewData: any; groupDatatables: any }) => {
      this.groupViewData = data.groupViewData;
      this.groupDatatables = data.groupDatatables;
    });
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Assign Staff':
      case 'Close':
      case 'Activate':
      case 'Attach Meeting':
      case 'Attendance':
      case 'Manage Members':
      case 'Transfer Clients':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Edit Meeting':
        const queryParams: any = { calendarId: this.groupViewData.collectionMeetingCalendar.id };
        this.router.navigate([`actions/${name}`], { relativeTo: this.route, queryParams: queryParams });
        break;
      case 'Edit':
        this.router.navigate(['edit'], { relativeTo: this.route });
        break;
      case 'Unassign Staff':
        this.unassignStaff();
        break;
      case 'Delete':
        this.deleteGroup();
        break;
    }
  }

  /**
   * Checks if meeting is editable.
   */
  get editMeeting() {
    if (this.groupViewData.collectionMeetingCalendar) {
      const entityType = this.groupViewData.collectionMeetingCalendar.entityType.value;
      if (entityType === 'GROUPS' && this.groupViewData.hierarchy === '.' + this.groupViewData.id + '.') {
        return true;
      }
    }
    return false;
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/groups`, { skipLocationChange: true }).then(() => this.router.navigate([url]));
  }

  /**
   * Unassign's the group's staff.
   */
  private unassignStaff() {
    const unAssignStaffDialogRef = this.dialog.open(UnassignStaffDialogComponent);
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.groupsService
          .executeGroupCommand(this.groupViewData.id, 'unassignStaff', { staffId: this.groupViewData.staffId })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Deletes the group
   */
  private deleteGroup() {
    const deleteGroupDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `group with id: ${this.groupViewData.id}` }
    });
    deleteGroupDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.groupsService.deleteGroup(this.groupViewData.id).subscribe(() => {
          this.router.navigate(['/groups'], { relativeTo: this.route });
        });
      }
    });
  }
}
