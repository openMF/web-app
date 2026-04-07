/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-product-terms-step',
  templateUrl: './recurring-deposit-product-terms-step.component.html',
  styleUrls: ['./recurring-deposit-product-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class RecurringDepositProductTermsStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductTermsForm: UntypedFormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor() {
    this.createrecurringDepositProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.recurringDepositProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.recurringDepositProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.recurringDepositProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData =
      this.recurringDepositProductsTemplate.interestCalculationDaysInYearTypeOptions;
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductTermsForm.patchValue({
        minDepositAmount: this.recurringDepositProductsTemplate.minDepositAmount,
        depositAmount: this.recurringDepositProductsTemplate.depositAmount,
        maxDepositAmount: this.recurringDepositProductsTemplate.maxDepositAmount
      });
    }
    this.recurringDepositProductTermsForm.patchValue({
      interestCompoundingPeriodType: this.recurringDepositProductsTemplate.interestCompoundingPeriodType.id,
      interestPostingPeriodType: this.recurringDepositProductsTemplate.interestPostingPeriodType.id,
      interestCalculationType: this.recurringDepositProductsTemplate.interestCalculationType.id,
      interestCalculationDaysInYearType: this.recurringDepositProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createrecurringDepositProductTermsForm() {
    this.recurringDepositProductTermsForm = this.formBuilder.group({
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

  get recurringDepositProductTerms() {
    const recurringDepositProductTerms = this.recurringDepositProductTermsForm.value;
    for (const key in recurringDepositProductTerms) {
      if (recurringDepositProductTerms[key] === '') {
        delete recurringDepositProductTerms[key];
      }
    }
    return recurringDepositProductTerms;
  }
}
