/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Confirmation dialog for the working capital loan `disable`/`enable` delinquency actions.
 *
 * The action's start date is fixed to the current business date (no backdating allowed), so the
 * datepicker is rendered read-only/disabled and the dialog only asks the user to confirm the effect.
 */
@Component({
  selector: 'mifosx-loan-delinquency-action-disable-dialog',
  templateUrl: './loan-delinquency-action-disable-dialog.component.html',
  styleUrl: './loan-delinquency-action-disable-dialog.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDelinquencyActionDisableDialogComponent {
  dialogRef = inject<MatDialogRef<LoanDelinquencyActionDisableDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  delinquencyActionForm: UntypedFormGroup;

  constructor() {
    this.delinquencyActionForm = this.formBuilder.group({
      startDate: [
        { value: this.data.businessDate, disabled: true }
      ]
    });
  }
}
