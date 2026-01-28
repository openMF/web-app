/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { GroupsService } from '../groups.service';
import { DataReloadService } from 'app/core/services/data-reload.service';
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardSubtitle
} from '@angular/material/card';
import { NgClass, LowerCasePipe } from '@angular/common';
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
export class GroupsViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private groupsService = inject(GroupsService);
  private dataReloadService = inject(DataReloadService);

  groupViewData: any;
  groupDatatables: any;

  private reloadContext!: string;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data: { groupViewData: any; groupDatatables: any }) => {
      this.groupViewData = data.groupViewData;
      this.groupDatatables = data.groupDatatables;
      this.reloadContext = `group-${this.groupViewData.id}`;

      // Subscribe to reload events after we have the group ID
      this.dataReloadService
        .getReloadObservable(this.reloadContext)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.refreshData();
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.reloadContext) {
      this.dataReloadService.cleanup(this.reloadContext);
    }
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
        if (name === 'Activate') {
          const generalTab = this.getGeneralTabComponent();
          if (generalTab) {
            generalTab.refreshAccounts(this.groupViewData.id);
          }
        }
        break;
      case 'Edit Meeting':
        this.router.navigate([`actions/${name}`], {
          relativeTo: this.route,
          queryParams: {
            calendarId: this.groupViewData.collectionMeetingCalendar.id
          }
        });
        break;
      case 'Edit':
        this.router.navigate(['edit'], { relativeTo: this.route });
        break;
      case 'Unassign Staff':
        this.unassignStaff();
        break;
      case 'Delete':
        if (!this.canDeleteGroup()) {
          return;
        }
        this.deleteGroup();
        break;
    }
  }
  getGeneralTabComponent(): any {
    return null;
  }
  /**
   * Checks if meeting is editable.
   */
  get editMeeting(): boolean {
    if (!this.groupViewData?.collectionMeetingCalendar) {
      return false;
    }

    const entityType = this.groupViewData.collectionMeetingCalendar.entityType.value;
    return entityType === 'GROUPS' && this.groupViewData.hierarchy === `.${this.groupViewData.id}.`;
  }
  /**
   * Triggers a reload event for this group.
   */
  reload(): void {
    this.dataReloadService.triggerReload(this.reloadContext);
  }

  /**
   * Refreshes the group data when reload is triggered.
   */
  private refreshData(): void {
    this.groupsService
      .getGroupData(this.groupViewData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.groupViewData = data;
      });
  }

  /**
   * Unassign's the group's staff.
   */
  private unassignStaff(): void {
    const dialogRef = this.dialog.open(UnassignStaffDialogComponent);
    dialogRef.afterClosed().subscribe((response: { confirm: boolean }) => {
      if (response?.confirm) {
        this.groupsService
          .executeGroupCommand(this.groupViewData.id, 'unassignStaff', { staffId: this.groupViewData.staffId })
          .subscribe(() => this.reload());
      }
    });
  }
  /**
   * Checks if the group can be deleted.
   * Only groups in Pending state are allowed to be deleted.
   */
  canDeleteGroup(): boolean {
    return this.groupViewData?.status?.value === 'Pending';
  }

  /**
   * Deletes the group
   */
  private deleteGroup(): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: `group with id: ${this.groupViewData.id}`
      }
    });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.groupsService.deleteGroup(this.groupViewData.id).subscribe(() => {
          this.router.navigate(['/groups']);
        });
      }
    });
  }
}
