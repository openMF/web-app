/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Floating Rate Period Dialog Component.
 */
@Component({
  selector: 'mifosx-floating-rate-period-dialog',
  templateUrl: './floating-rate-period-dialog.component.html',
  styleUrls: ['./floating-rate-period-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    MatCheckbox,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class FloatingRatePeriodDialogComponent implements OnInit {
  /** Floating Rate Period Form. */
  floatingRatePeriodForm: UntypedFormGroup;
  /** Minimum floating rate period date allowed. */
  minDate = new Date();

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {any} data Provides values for the form (if available).
   */
  constructor(
    public dialogRef: MatDialogRef<FloatingRatePeriodDialogComponent>,
    public formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Creates the floating rate period form.
   */
  ngOnInit() {
    this.minDate = this.settingsService.businessDate;
    let rowDisabled = false;
    if (this.data && new Date(this.data.fromDate) < this.minDate) {
      rowDisabled = true;
    }
    if (this.data.isNew) {
      rowDisabled = false;
    }
    this.floatingRatePeriodForm = this.formBuilder.group({
      fromDate: [
        { value: this.data ? new Date(this.data.fromDate) : '', disabled: rowDisabled },
        Validators.required
      ],
      interestRate: [
        { value: this.data ? this.data.interestRate : '', disabled: rowDisabled },
        Validators.required
      ],
      isDifferentialToBaseLendingRate: [
        { value: this.data ? this.data.isDifferentialToBaseLendingRate : false, disabled: rowDisabled }]
    });
  }

  /**
   * Closes the dialog and returns value of the form.
   */
  submit() {
    this.dialogRef.close(this.floatingRatePeriodForm.value);
  }
}
