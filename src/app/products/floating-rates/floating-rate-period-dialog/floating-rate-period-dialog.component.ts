/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
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
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Floating Rate Period Dialog Component.
 */
@Component({
  selector: 'mifosx-floating-rate-period-dialog',
  templateUrl: './floating-rate-period-dialog.component.html',
  styleUrls: ['./floating-rate-period-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose
  ]
})
export class FloatingRatePeriodDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<FloatingRatePeriodDialogComponent>>(MatDialogRef);
  formBuilder = inject(UntypedFormBuilder);
  private settingsService = inject(SettingsService);
  data = inject(MAT_DIALOG_DATA);

  /** Floating Rate Period Form. */
  floatingRatePeriodForm: UntypedFormGroup;
  /** Minimum floating rate period date allowed. */
  minDate = new Date();

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
