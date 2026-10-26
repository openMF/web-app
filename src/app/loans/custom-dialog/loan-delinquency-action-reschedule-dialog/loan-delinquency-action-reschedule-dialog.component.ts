/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
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
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { positiveIntegerValidator } from 'app/shared/validators/positive-integer.validator';

/**
 * Cross-field validator that mirrors the backend rules for a WC delinquency reschedule
 * so the user gets immediate feedback instead of relying on the 400 round-trip:
 *  - a value is "provided" only when it is a number greater than zero;
 *  - an entered minimum payment of exactly zero is rejected (the backend does too);
 *  - each field of the minimum payment group requires its counterpart;
 *  - when a frequency is provided, its type is mandatory;
 *  - at least one group (payment or frequency) must be provided.
 */
export function rescheduleGroupsValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const paymentValue = group.get('minimumPayment')?.value;
    const paymentEntered = paymentValue !== null && paymentValue !== undefined && paymentValue !== '';
    const hasPayment = paymentEntered && Number(paymentValue) > 0;
    const hasPaymentType = !!group.get('minimumPaymentType')?.value;
    const hasFrequency = Number(group.get('frequency')?.value) > 0;
    const hasFrequencyType = !!group.get('frequencyType')?.value;

    const errors: ValidationErrors = {};
    if (paymentEntered && Number(paymentValue) === 0) {
      errors['minimumPaymentNotPositive'] = true;
    }
    if (hasPayment && !hasPaymentType) {
      errors['minimumPaymentTypeRequired'] = true;
    }
    if (hasPaymentType && !paymentEntered) {
      errors['minimumPaymentRequired'] = true;
    }
    if (hasFrequency && !hasFrequencyType) {
      errors['frequencyTypeRequired'] = true;
    }
    if (!hasPayment && !hasFrequency) {
      errors['noGroupProvided'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  };
}

/**
 * Surfaces group-level errors under a specific field (mat-error only shows on
 * control-level errors) while still honoring the control's own validators.
 */
export class GroupErrorStateMatcher implements ErrorStateMatcher {
  private readonly errorKeys: string[];

  constructor(...errorKeys: string[]) {
    this.errorKeys = errorKeys;
  }

  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.touched && (control.invalid || this.errorKeys.some((key) => form?.form?.hasError(key))));
  }
}

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

  minimumPaymentMatcher = new GroupErrorStateMatcher('minimumPaymentRequired', 'minimumPaymentNotPositive');
  minimumPaymentTypeMatcher = new GroupErrorStateMatcher('minimumPaymentTypeRequired');
  frequencyTypeMatcher = new GroupErrorStateMatcher('frequencyTypeRequired');

  constructor() {
    this.createDelinquencyActionForm();
    this.frequencyTypeOptions = this.data.frequencyTypeOptions;
    this.minimumPaymentTypeOptions = this.data.minimumPaymentTypeOptions;
  }

  createDelinquencyActionForm() {
    this.delinquencyActionForm = this.formBuilder.group(
      {
        minimumPayment: [
          '',
          amountValueValidator()
        ],
        minimumPaymentType: [
          ''
        ],
        frequency: [
          '',
          positiveIntegerValidator()
        ],
        frequencyType: [
          ''
        ]
      },
      { validators: rescheduleGroupsValidator() }
    );
  }
}
