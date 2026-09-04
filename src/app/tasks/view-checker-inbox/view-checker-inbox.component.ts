/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

/** Custom Services */
import { TasksService } from '../tasks.service';

/** Dialog Components */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { KeyValuePipe } from '@angular/common';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { finalize, Observable } from 'rxjs';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewCheckerInboxComponent {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private tasksService = inject(TasksService);
  private destroyRef = inject(DestroyRef);
  private errorHandler = inject(ErrorHandlerService);

  /** Checker Inbox Details Data */
  checkerInboxDetail: any;
  /** JsonData */
  jsondata: any;
  /** Checks if there is any object or not in jsondata */
  displayJSONData = false;
  processing = false;

  /**
   * Retrieves the maker checker id data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {router} router Router.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { checkerInboxDetail: any }) => {
      this.checkerInboxDetail = data.checkerInboxDetail;
      this.jsondata = JSON.parse(this.checkerInboxDetail.commandAsJson);
      this.displayJSONData = !_.isEmpty(this.jsondata);
    });
  }

  /**
   * Approve Checker
   */
  approveChecker() {
    this.confirmAndProcess('approve');
  }

  /**
   * Reject checker
   */
  rejectChecker() {
    this.confirmAndProcess('reject');
  }

  /**
   * Delete Checker
   */
  deleteChecker() {
    const deleteCheckerDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Delete Checker'),
        dialogContext:
          'This removes the pending checker item. Unlike approval or rejection, deletion does not retain equivalent maker-checker audit information.'
      }
    });
    deleteCheckerDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm) {
        this.process(() => this.tasksService.deleteMakerChecker(this.checkerInboxDetail.id), 'Checker item deleted');
      }
    });
  }

  checkerPermission(): string {
    return `${this.checkerInboxDetail.actionName}_${this.checkerInboxDetail.entityName}_CHECKER`
      .replace(/[^A-Za-z0-9_]/g, '_')
      .toUpperCase();
  }

  private confirmAndProcess(action: 'approve' | 'reject'): void {
    const actionLabel = action === 'approve' ? 'Approve Checker' : 'Reject Checker';
    const context =
      action === 'approve' ? 'Are you sure you want to approve checker' : 'Are you sure you want to reject checker';
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant(`labels.heading.${actionLabel}`),
        dialogContext: this.translateService.instant(`labels.dialogContext.${context}`)
      }
    });
    dialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response?.confirm) {
        this.process(
          () => this.tasksService.executeMakerCheckerAction(this.checkerInboxDetail.id, action),
          `Checker item ${action}d`
        );
      }
    });
  }

  private process(request: () => Observable<unknown>, successMessage: string): void {
    if (this.processing) return;
    this.processing = true;
    request()
      .pipe(finalize(() => (this.processing = false)))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess(successMessage);
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: (error: HttpErrorResponse) => this.errorHandler.handleError(error).subscribe({ error: () => undefined })
      });
  }
}
