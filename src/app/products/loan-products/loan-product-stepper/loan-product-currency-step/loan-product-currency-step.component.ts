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
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-currency-step',
  templateUrl: './loan-product-currency-step.component.html',
  styleUrls: ['./loan-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class LoanProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() loanProductsTemplate: any;

  loanProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createLoanProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.loanProductsTemplate.currencyOptions;
    this.loanProductCurrencyForm.patchValue({
      currencyCode: this.loanProductsTemplate.currency.code || this.currencyData[0].code,
      digitsAfterDecimal: this.loanProductsTemplate.currency.decimalPlaces
        ? this.loanProductsTemplate.currency.decimalPlaces
        : 2,
      inMultiplesOf: this.loanProductsTemplate.currency.inMultiplesOf ?? 1,
      installmentAmountInMultiplesOf: this.loanProductsTemplate.installmentAmountInMultiplesOf ?? 1
    });
  }

  createLoanProductCurrencyForm() {
    this.loanProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        2,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      inMultiplesOf: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      installmentAmountInMultiplesOf: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  get loanProductCurrency() {
    return this.loanProductCurrencyForm.value;
  }
}
