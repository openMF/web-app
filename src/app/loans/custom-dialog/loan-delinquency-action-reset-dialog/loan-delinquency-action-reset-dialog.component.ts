/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { MatTooltip } from '@angular/material/tooltip';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';

@Component({
  selector: 'mifosx-loan-delinquency-action-reset-dialog',
  templateUrl: './loan-delinquency-action-reset-dialog.component.html',
  styleUrl: './loan-delinquency-action-reset-dialog.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDelinquencyActionResetDialogComponent {
  dialogRef = inject<MatDialogRef<LoanDelinquencyActionResetDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  delinquencyActionForm: UntypedFormGroup;

  constructor() {
    this.createDelinquencyActionForm();
  }

  createDelinquencyActionForm() {
    this.delinquencyActionForm = this.formBuilder.group({
      startNewPeriod: [
        false
      ]
    });
  }
}
