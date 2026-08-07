/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Input of the mark as fraud dialog. */
export interface WorkingCapitalMarkAsFraudDialogData {
  /** Value the fraud flag will be set to when the user confirms. */
  fraud: boolean;
}

/** Result emitted when the user confirms the mark as fraud dialog. */
export interface WorkingCapitalMarkAsFraudDialogResult {
  confirm: boolean;
}

/**
 * Confirmation dialog for setting the fraud flag on a Working Capital loan.
 *
 * The flag has no immediate effect: it only changes which expense account a
 * later charge-off posts the principal to, so the dialog states that
 * consequence instead of asking a bare "are you sure".
 */
@Component({
  selector: 'mifosx-wc-mark-as-fraud-dialog',
  templateUrl: './mark-as-fraud-dialog.component.html',
  styleUrls: ['./mark-as-fraud-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalMarkAsFraudDialogComponent {
  private dialogRef =
    inject<MatDialogRef<WorkingCapitalMarkAsFraudDialogComponent, WorkingCapitalMarkAsFraudDialogResult>>(MatDialogRef);
  protected data = inject<WorkingCapitalMarkAsFraudDialogData>(MAT_DIALOG_DATA);

  /** True when the dialog is marking the loan, false when it is clearing the flag. */
  get isMarking(): boolean {
    return this.data.fraud;
  }

  confirm(): void {
    this.dialogRef.close({ confirm: true });
  }
}
