/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';

/**
 * Edit charge dialog component.
 */
@Component({
  selector: 'mifosx-edit-charge-dialog',
  templateUrl: './edit-charge-dialog.component.html',
  styleUrls: ['./edit-charge-dialog.component.scss']
})
export class EditChargeDialogComponent implements OnInit {

  /** Edit charge data form. */
  editChargeDataForm: FormGroup;
  /** Charge data. */
  charge: any;
  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides charge data.
   */
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditChargeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Sets charge value.
   * Creates edit charge data form.
   */
  ngOnInit() {
    this.charge = this.data.chargeData;
    this.createEditChargeDataForm();
  }

  /**
   * Creates edit charge data form.
   */
  createEditChargeDataForm() {
    this.editChargeDataForm = this.formBuilder.group({
      'amount': [''],
      'date': [''],
      'repayments': ['']
    });
    this.setInitialValues();
  }

  /**
   * Patch initial values in edit charge data form fields.
   */
  setInitialValues() {
    let repayments: any = '';
    let date: any = '';

    if (this.charge.chargeTimeType.value === 'Annual Fee' || this.charge.chargeTimeType.value === 'Monthly Fee') {
      date = this.charge.feeOnMonthDay;
    } else if (
      this.charge.chargeTimeType.value === 'Specified due date' ||
      this.charge.chargeTimeType.code === 'chargeTimeType.weeklyFee'
    ) {
      date = this.charge.dueDate;
    }
    if (
      this.charge.chargeTimeType.value === 'Monthly Fee' ||
      this.charge.chargeTimeType.code === 'chargeTimeType.weeklyFee'
    ) {
      repayments = this.charge.feeInterval;
    }

    this.editChargeDataForm.patchValue({
      'amount': this.charge.amount,
      'date': date,
      'repayments': repayments
    });
  }
}
