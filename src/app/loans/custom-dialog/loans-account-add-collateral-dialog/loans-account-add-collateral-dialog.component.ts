import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loans-account-add-collateral-dialog',
  templateUrl: './loans-account-add-collateral-dialog.component.html',
  styleUrls: ['./loans-account-add-collateral-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class LoansAccountAddCollateralDialogComponent implements OnInit {
  layout: {
    addButtonText?: string;
  } = {
    addButtonText: 'Add'
  };

  addCollateralForm: UntypedFormGroup;
  /** All Collateral Options */
  collateralTypeData: any;
  /** Selected Collateral */
  collateralData: any;
  /** Maximum ALlowed Quantity of selected collateral  */
  maxQuantity: any = 0;

  constructor(
    public dialogRef: MatDialogRef<LoansAccountAddCollateralDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder
  ) {
    this.createAddCollateralForm();
  }

  ngOnInit() {
    this.dialogRef.updateSize('400px');
    this.collateralTypeData = this.data.collateralOptions;
    this.buildDependencies();
  }

  createAddCollateralForm() {
    this.addCollateralForm = this.formBuilder.group({
      collateral: [
        '',
        Validators.required
      ],
      quantity: [
        '',
        Validators.required
      ],
      totalValue: [{ value: '', disabled: true }],
      totalCollateralValue: [{ value: '', disabled: true }]
    });
  }

  /**
   * Subscribe to Form controls value changes
   */
  buildDependencies() {
    this.addCollateralForm.controls.collateral.valueChanges.subscribe((collateral: any) => {
      this.collateralData = collateral;
      this.maxQuantity = collateral.quantity;
    });

    this.addCollateralForm.controls.quantity.valueChanges.subscribe((quantity: any) => {
      this.addCollateralForm.patchValue({
        totalValue: this.collateralData.basePrice * quantity,
        totalCollateralValue: (this.collateralData.basePrice * this.collateralData.pctToBase * quantity) / 100
      });
    });
  }
}
