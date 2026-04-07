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

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Services */
import { CentersService } from '../centers.service';
import { DataReloadService } from 'app/core/services/data-reload.service';
import { TranslateService } from '@ngx-translate/core';

/** UI Imports */
import {
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardSubtitle
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, LowerCasePipe } from '@angular/common';
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
 * Centers View Component
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
export class CentersViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private centersService = inject(CentersService);
  private translateService = inject(TranslateService);
  private dataReloadService = inject(DataReloadService);

  centerViewData: any;
  centerDatatables: any;
  meetingData = false;

  private reloadContext!: string;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data: { centerViewData: any; centerDatatables: any }) => {
      this.centerViewData = data.centerViewData;
      this.centerDatatables = data.centerDatatables;
      this.meetingData = !!this.centerViewData?.collectionMeetingCalendar;
      this.reloadContext = `center-${this.centerViewData.id}`;

      // Subscribe to reload events after we have the center ID
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
   * Checks if meeting is editable.
   */
  get editMeeting(): boolean {
    if (!this.centerViewData?.collectionMeetingCalendar) {
      return false;
    }

    const entityType = this.centerViewData.collectionMeetingCalendar.entityType.value;
    return entityType === 'CENTERS' && this.centerViewData.hierarchy === `.${this.centerViewData.id}.`;
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string): void {
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
        this.router.navigate([`actions/${name}`], {
          relativeTo: this.route,
          queryParams: {
            calendarId: this.centerViewData.collectionMeetingCalendar.id
          }
        });
        break;

      case 'Unassign Staff':
        this.unassignStaff();
        break;

      case 'Delete':
        this.deleteCenter();
        break;

      case 'Edit':
        this.router.navigate(['edit'], { relativeTo: this.route });
        break;
    }
  }

  /**
   * Unassign's the centers's staff.
   */
  private unassignStaff(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Unassign Staff'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want Unassign Staff')
      }
    });

    dialogRef.afterClosed().subscribe((response: { confirm: boolean }) => {
      if (response?.confirm) {
        this.centersService
          .executeGroupActionCommand(this.centerViewData.id, 'unassignStaff', { staffId: this.centerViewData.staffId })
          .subscribe(() => this.reload());
      }
    });
  }

  /**
   * Deletes the center
   */
  private deleteCenter(): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: `center with id: ${this.centerViewData.id}`
      }
    });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.centersService.deleteCenter(this.centerViewData.id).subscribe(() => {
          this.router.navigate(['/centers']);
        });
      }
    });
  }

  /**
   * Triggers a reload event for this center.
   */
  reload(): void {
    this.dataReloadService.triggerReload(this.reloadContext);
  }

  /**
   * Refreshes the center data when reload is triggered.
   */
  private refreshData(): void {
    this.centersService
      .getCenterData(this.centerViewData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.centerViewData = data;
        this.meetingData = !!data?.collectionMeetingCalendar;
      });
  }
}
