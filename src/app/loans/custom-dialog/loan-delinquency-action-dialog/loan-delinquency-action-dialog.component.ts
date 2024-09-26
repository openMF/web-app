import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mifosx-loan-delinquency-action-dialog',
  templateUrl: './loan-delinquency-action-dialog.component.html',
  styleUrls: ['./loan-delinquency-action-dialog.component.scss']
})
export class LoanDelinquencyActionDialogComponent {

  delinquencyActionForm: UntypedFormGroup;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);

  constructor(public dialogRef: MatDialogRef<LoanDelinquencyActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder) {
      this.createDelinquencyActionForm();
  }

  createDelinquencyActionForm() {
    this.delinquencyActionForm = this.formBuilder.group({
      'startDate': [new Date(), Validators.required],
      'endDate': ['', Validators.required],
    });
  }

}
