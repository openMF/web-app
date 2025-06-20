/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { TasksService } from '../tasks.service';

/** Dialog Components */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { NgIf, NgFor, KeyValuePipe } from '@angular/common';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-checker-inbox',
  templateUrl: './view-checker-inbox.component.html',
  styleUrls: ['./view-checker-inbox.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatDivider,
    KeyValuePipe,
    DateFormatPipe
  ]
})
export class ViewCheckerInboxComponent {
  /** Checker Inbox Details Data */
  checkerInboxDetail: any;
  /** JsonData */
  jsondata: any;
  /** Checks if there is any object or not in jsondata */
  displayJSONData = false;

  /**
   * Retrieves the maker checker id data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {router} router Router.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private tasksService: TasksService
  ) {
    this.route.data.subscribe((data: { checkerInboxDetail: any }) => {
      this.checkerInboxDetail = data.checkerInboxDetail;
      this.jsondata = JSON.parse(this.checkerInboxDetail.commandAsJson);
      this.displayJSONData = !_.isEmpty(this.jsondata);
    });
  }

  /**
   * Approve Checker
   */
  approveChecker() {
    const approveCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Approve Checker'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to approve checker')
      }
    });
    approveCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.tasksService.executeMakerCheckerAction(this.checkerInboxDetail.id, 'approve').subscribe((res: any) => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Reject checker
   */
  rejectChecker() {
    const rejectCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Reject Checker'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to reject checker')
      }
    });
    rejectCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.tasksService.executeMakerCheckerAction(this.checkerInboxDetail.id, 'reject').subscribe((res: any) => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Delete Checker
   */
  deleteChecker() {
    const deleteCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Delete Checker'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to delete checker')
      }
    });
    deleteCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.tasksService.deleteMakerChecker(this.checkerInboxDetail.id).subscribe((res: any) => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }
}
