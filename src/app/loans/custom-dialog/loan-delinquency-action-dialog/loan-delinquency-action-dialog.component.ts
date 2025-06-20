import { Component, Inject } from '@angular/core';
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

@Component({
  selector: 'mifosx-loan-delinquency-action-dialog',
  templateUrl: './loan-delinquency-action-dialog.component.html',
  styleUrls: ['./loan-delinquency-action-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class LoanDelinquencyActionDialogComponent {
  delinquencyActionForm: UntypedFormGroup;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);

  constructor(
    public dialogRef: MatDialogRef<LoanDelinquencyActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder
  ) {
    this.createDelinquencyActionForm();
  }

  createDelinquencyActionForm() {
    this.delinquencyActionForm = this.formBuilder.group({
      startDate: [
        new Date(),
        Validators.required
      ],
      endDate: [
        '',
        Validators.required
      ]
    });
  }
}
