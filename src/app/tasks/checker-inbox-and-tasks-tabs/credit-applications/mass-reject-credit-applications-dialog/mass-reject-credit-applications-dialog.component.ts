/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

/** Angular Material Imports */
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface MassRejectCreditApplicationsDialogData {
  selectedCount: number;
  rejectedOnDate: Date;
}

@Component({
  selector: 'mifosx-mass-reject-credit-applications-dialog',
  templateUrl: './mass-reject-credit-applications-dialog.component.html',
  styleUrls: ['./mass-reject-credit-applications-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassRejectCreditApplicationsDialogComponent {
  private formBuilder = inject(UntypedFormBuilder);
  private dialogRef = inject<MatDialogRef<MassRejectCreditApplicationsDialogComponent>>(MatDialogRef);
  data = inject<MassRejectCreditApplicationsDialogData>(MAT_DIALOG_DATA);

  maxDate = this.data.rejectedOnDate || new Date();
  rejectForm: UntypedFormGroup = this.formBuilder.group({
    rejectedOnDate: [
      this.data.rejectedOnDate || new Date(),
      Validators.required
    ],
    note: ['']
  });

  confirm(): void {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      confirm: true,
      data: this.rejectForm.value
    });
  }
}
