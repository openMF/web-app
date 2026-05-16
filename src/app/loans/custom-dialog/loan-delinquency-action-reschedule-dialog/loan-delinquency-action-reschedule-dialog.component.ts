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
  selector: 'mifosx-loan-delinquency-action-reschedule-dialog',
  templateUrl: './loan-delinquency-action-reschedule-dialog.component.html',
  styleUrl: './loan-delinquency-action-reschedule-dialog.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDelinquencyActionRescheduleDialogComponent {
  dialogRef = inject<MatDialogRef<LoanDelinquencyActionRescheduleDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  delinquencyActionForm: UntypedFormGroup;

  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentTypeOptions: StringEnumOptionData[] = [];

  constructor() {
    this.createDelinquencyActionForm();
    this.frequencyTypeOptions = this.data.frequencyTypeOptions;
    this.minimumPaymentTypeOptions = this.data.minimumPaymentTypeOptions;
  }

  createDelinquencyActionForm() {
    this.delinquencyActionForm = this.formBuilder.group({
      minimumPayment: [
        ''
      ],
      minimumPaymentType: [
        ''
      ],
      frequency: [
        ''
      ],
      frequencyType: [
        ''
      ]
    });
  }
}
