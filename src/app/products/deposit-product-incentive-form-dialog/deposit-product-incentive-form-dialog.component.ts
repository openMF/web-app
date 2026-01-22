/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TranslateService } from '@ngx-translate/core';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ConditionLabelService } from 'app/shared/common-logic/condition-label.service';

@Component({
  selector: 'mifosx-deposit-product-incentive-form-dialog',
  templateUrl: './deposit-product-incentive-form-dialog.component.html',
  styleUrls: ['./deposit-product-incentive-form-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class DepositProductIncentiveFormDialogComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  private dialogRef = inject<MatDialogRef<DepositProductIncentiveFormDialogComponent>>(MatDialogRef);

  data = inject(MAT_DIALOG_DATA);

  private formBuilder = inject(UntypedFormBuilder);

  protected conditionLabelService = inject(ConditionLabelService);

  private translateService = inject(TranslateService);

  layout: { addButtonText?: string } = {
    addButtonText: 'Add'
  };

  depositProductIncentiveForm!: UntypedFormGroup;
  title!: string;

  entityTypeData: any;
  attributeNameData: any;
  conditionTypeData: any;
  attributeValueData: any;
  incentiveTypeData: any;

  ngOnInit(): void {
    this.createDepositProductIncentiveForm();
    this.setConditionalControls();

    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('400px');

    this.entityTypeData = this.data.chartTemplate.entityTypeOptions;
    this.attributeNameData = this.data.chartTemplate.attributeNameOptions;
    this.conditionTypeData = this.data.chartTemplate.conditionTypeOptions;
    this.incentiveTypeData = this.data.chartTemplate.incentiveTypeOptions;

    if (this.data.values) {
      this.depositProductIncentiveForm.patchValue({
        entityType: this.data.values.entityType,
        attributeName: this.data.values.attributeName,
        conditionType: this.data.values.conditionType,
        attributeValue: this.data.values.attributeValue,
        incentiveType: this.data.values.incentiveType,
        amount: this.data.values.amount
      });
    } else {
      this.depositProductIncentiveForm.patchValue({
        entityType: this.data.entityType
      });
    }

    this.title = this.translateService.instant('labels.heading.Incentives');
  }

  setConditionalControls(): void {
    this.depositProductIncentiveForm
      .get('attributeName')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((attributeName: any) => {
        this.depositProductIncentiveForm.patchValue({ attributeValue: '' });

        const option = this.attributeNameData?.find((o: any) => o.id === attributeName);

        this.attributeValueData = option ? this.data.chartTemplate[`${option.code.split('.')[1]}Options`] : [];
      });
  }

  createDepositProductIncentiveForm(): void {
    this.depositProductIncentiveForm = this.formBuilder.group({
      entityType: [''],
      attributeName: [
        '',
        Validators.required
      ],
      conditionType: [
        '',
        Validators.required
      ],
      attributeValue: [
        '',
        Validators.required
      ],
      incentiveType: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ]
    });
  }
}
