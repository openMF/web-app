/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { CentersService } from '../centers.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, NgIf, NgFor, LowerCasePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Create Center View
 */
@Component({
  selector: 'mifosx-centers-view',
  templateUrl: './centers-view.component.html',
  styleUrls: ['./centers-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatCardTitle,
    MatTooltip,
    NgClass,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatCardSubtitle,
    ExternalIdentifierComponent,
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public centersService: CentersService,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { centerViewData: any; centerDatatables: any }) => {
      this.centerViewData = data.centerViewData;
      this.centerDatatables = data.centerDatatables;
    });
  }

  ngOnInit() {
    if (this.centerViewData.collectionMeetingCalendar) {
      this.meetingData = true;
    } else {
      this.meetingData = false;
    }
  }

  /**
   * Checks if meeting is editable.
   */
  get editMeeting() {
    if (this.centerViewData.collectionMeetingCalendar) {
      const entityType = this.centerViewData.collectionMeetingCalendar.entityType.value;
      if (entityType === 'CENTERS' && this.centerViewData.hierarchy === '.' + this.centerViewData.id + '.') {
        return true;
      }
    }
    return false;
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Activate':
      case 'Assign Staff':
      case 'Close':
      case 'Attendance':
      case 'Attach Meeting':
      case 'Manage Groups':
      case 'Staff Assignment History':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Edit Meeting':
        const queryParams: any = { calendarId: this.centerViewData.collectionMeetingCalendar.id };
        this.router.navigate([`actions/${name}`], { relativeTo: this.route, queryParams: queryParams });
        break;
      case 'Unassign Staff':
        this.centersUnassignStaff();
        break;
      case 'Delete':
        this.deleteCenter();
        break;
      case 'Edit':
        this.router.navigate(['edit'], { relativeTo: this.route });
    }
  }

  /**
   * Unassign's the centers's staff.
   */
  private centersUnassignStaff() {
    const unAssignStaffDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Unassign Staff'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want Unassign Staff')
      }
    });
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.centersService
          .executeGroupActionCommand(this.centerViewData.id, 'unassignStaff', { staffId: this.centerViewData.staffId })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Deletes the center
   */
  private deleteCenter() {
    const deleteGroupDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `center with id: ${this.centerViewData.id}` }
    });
    deleteGroupDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.centersService.deleteCenter(this.centerViewData.id).subscribe(() => {
          this.router.navigate(['/centers'], { relativeTo: this.route });
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
    this.router.navigateByUrl(`/centers`, { skipLocationChange: true }).then(() => this.router.navigate([url]));
  }
}
