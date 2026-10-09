/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountAddCollateralDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  dialogRef = inject<MatDialogRef<LoansAccountAddCollateralDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

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

  constructor() {
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
    this.addCollateralForm.controls.collateral.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((collateral: any) => {
        this.collateralData = collateral;
        this.maxQuantity = collateral.quantity;
      });

    this.addCollateralForm.controls.quantity.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((quantity: any) => {
        if (!this.collateralData || quantity === null || quantity === '') {
          this.addCollateralForm.patchValue({ totalValue: '', totalCollateralValue: '' }, { emitEvent: false });
          return;
        }

        const basePrice = Number(this.collateralData.basePrice) || 0;
        const pctToBase = Number(this.collateralData.pctToBase) || 0;
        const qty = Number(quantity) || 0;
        this.addCollateralForm.patchValue({
          totalValue: basePrice * qty,
          totalCollateralValue: (basePrice * pctToBase * qty) / 100
        });
      });
  }
}
