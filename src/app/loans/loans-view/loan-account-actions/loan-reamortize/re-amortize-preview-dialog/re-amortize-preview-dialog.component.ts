/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { RepaymentSchedule } from 'app/loans/models/loan-account.model';
import { RepaymentScheduleTabComponent } from '../../../repayment-schedule-tab/repayment-schedule-tab.component';

export interface ReAmortizePreviewDialogData {
  repaymentSchedule: RepaymentSchedule;
  currencyCode: string;
}

@Component({
  selector: 'mifosx-re-amortize-preview-dialog',
  templateUrl: './re-amortize-preview-dialog.component.html',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    RepaymentScheduleTabComponent
  ]
})
export class ReAmortizePreviewDialogComponent {
  // inject() replaces constructor injection
  private readonly dialogRef = inject<MatDialogRef<ReAmortizePreviewDialogComponent>>(MatDialogRef);

  private readonly data = inject<ReAmortizePreviewDialogData>(MAT_DIALOG_DATA);

  // public fields used in template
  readonly repaymentSchedule: RepaymentSchedule = this.data.repaymentSchedule;
  readonly currencyCode: string = this.data.currencyCode;

  close(): void {
    this.dialogRef.close();
  }
}
