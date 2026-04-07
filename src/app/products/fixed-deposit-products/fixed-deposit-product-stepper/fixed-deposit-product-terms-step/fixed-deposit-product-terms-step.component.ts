/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-product-terms-step',
  templateUrl: './fixed-deposit-product-terms-step.component.html',
  styleUrls: ['./fixed-deposit-product-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class FixedDepositProductTermsStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductTermsForm: UntypedFormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor() {
    this.createFixedDepositProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.fixedDepositProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.fixedDepositProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.fixedDepositProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData =
      this.fixedDepositProductsTemplate.interestCalculationDaysInYearTypeOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductTermsForm.patchValue({
        minDepositAmount: this.fixedDepositProductsTemplate.minDepositAmount,
        depositAmount: this.fixedDepositProductsTemplate.depositAmount,
        maxDepositAmount: this.fixedDepositProductsTemplate.maxDepositAmount
      });
    }

    this.fixedDepositProductTermsForm.patchValue({
      interestCompoundingPeriodType: this.fixedDepositProductsTemplate.interestCompoundingPeriodType.id,
      interestPostingPeriodType: this.fixedDepositProductsTemplate.interestPostingPeriodType.id,
      interestCalculationType: this.fixedDepositProductsTemplate.interestCalculationType.id,
      interestCalculationDaysInYearType: this.fixedDepositProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createFixedDepositProductTermsForm() {
    this.fixedDepositProductTermsForm = this.formBuilder.group({
      minDepositAmount: [
        '',
        Validators.min(0)
      ],
      depositAmount: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      maxDepositAmount: [
        '',
        Validators.min(0)
      ],
      interestCompoundingPeriodType: [
        '',
        Validators.required
      ],
      interestPostingPeriodType: [
        '',
        Validators.required
      ],
      interestCalculationType: [
        '',
        Validators.required
      ],
      interestCalculationDaysInYearType: [
        '',
        Validators.required
      ]
    });
  }

  get fixedDepositProductTerms() {
    const fixedDepositProductTerms = this.fixedDepositProductTermsForm.value;
    for (const key in fixedDepositProductTerms) {
      if (fixedDepositProductTerms[key] === '') {
        delete fixedDepositProductTerms[key];
      }
    }
    return fixedDepositProductTerms;
  }
}
