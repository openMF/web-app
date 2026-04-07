/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services. */
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Add Collateral component.
 */
@Component({
  selector: 'mifosx-add-collateral',
  templateUrl: './add-collateral.component.html',
  styleUrls: ['./add-collateral.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class AddCollateralComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  /** Collateral form. */
  collateralForm: UntypedFormGroup;

  constructor() {
    super();
  }

  ngOnInit() {
    this.createAddCollateralForm();
  }

  /**
   * Set Collateral form.
   */
  createAddCollateralForm() {
    this.collateralForm = this.formBuilder.group({
      collateralTypeId: [
        '',
        Validators.required
      ],
      value: [
        '',
        Validators.required
      ],
      description: ['']
    });
  }

  /**
   * Submits collateral form.
   */
  submit() {
    const collateralTypeId = this.collateralForm.value.collateralTypeId;
    this.collateralForm.patchValue({
      collateralTypeId: collateralTypeId
    });
    const collateralForm = this.collateralForm.value;
    collateralForm.locale = this.settingsService.language.code;
    this.loanService.createLoanCollateral(this.loanId, collateralForm).subscribe((response: any) => {
      this.gotoLoanView('loan-collateral');
    });
  }
}
