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
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loans-account-add-collateral-dialog',
  templateUrl: './loans-account-add-collateral-dialog.component.html',
  styleUrls: ['./loans-account-add-collateral-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatError,
    MatInput,
    NgIf,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
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
