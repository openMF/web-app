import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-loans-account-add-collateral-dialog',
  templateUrl: './loans-account-add-collateral-dialog.component.html',
  styleUrls: ['./loans-account-add-collateral-dialog.component.scss']
})
export class LoansAccountAddCollateralDialogComponent implements OnInit {

  layout: {
    addButtonText?: string
  } = {
      addButtonText: 'Add'
    };

  addCollateralForm: FormGroup;
  collateralTypeData: any;

  constructor(public dialogRef: MatDialogRef<LoansAccountAddCollateralDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder) {
    this.createAddCollateralForm();
  }

  ngOnInit() {
    this.dialogRef.updateSize('400px');
    this.collateralTypeData = this.data.collateralTypeOptions;
  }

  createAddCollateralForm() {
    this.addCollateralForm = this.formBuilder.group({
      'type': ['', Validators.required],
      'value': ['', Validators.required],
      'description': ['', Validators.required]
    });
  }

}
