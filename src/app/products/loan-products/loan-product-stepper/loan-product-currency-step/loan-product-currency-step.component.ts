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
import { MatCheckbox } from '@angular/material/checkbox';
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
    MatCheckbox,
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
      digitsAfterDecimal:
        this.loanProductsTemplate.currency.decimalPlaces === 0 ||
        this.loanProductsTemplate.currency.decimalPlaces === undefined ||
        this.loanProductsTemplate.currency.decimalPlaces === null
          ? ''
          : this.loanProductsTemplate.currency.decimalPlaces,
      setMultiples: !!(
        (this.loanProductsTemplate.currency.inMultiplesOf && this.loanProductsTemplate.currency.inMultiplesOf !== 0) ||
        (this.loanProductsTemplate.installmentAmountInMultiplesOf &&
          this.loanProductsTemplate.installmentAmountInMultiplesOf !== 0)
      ),
      inMultiplesOf:
        this.loanProductsTemplate.currency.inMultiplesOf === 0 ||
        this.loanProductsTemplate.currency.inMultiplesOf === undefined ||
        this.loanProductsTemplate.currency.inMultiplesOf === null
          ? ''
          : this.loanProductsTemplate.currency.inMultiplesOf,
      installmentAmountInMultiplesOf:
        this.loanProductsTemplate.installmentAmountInMultiplesOf === 0 ||
        this.loanProductsTemplate.installmentAmountInMultiplesOf === undefined ||
        this.loanProductsTemplate.installmentAmountInMultiplesOf === null
          ? ''
          : this.loanProductsTemplate.installmentAmountInMultiplesOf
    });

    this.setupConditionalValidation();
  }

  setupConditionalValidation() {
    this.loanProductCurrencyForm.get('setMultiples')?.valueChanges.subscribe((setMultiples: boolean) => {
      const inMultiplesOfControl = this.loanProductCurrencyForm.get('inMultiplesOf');
      const installmentControl = this.loanProductCurrencyForm.get('installmentAmountInMultiplesOf');

      if (setMultiples) {
        inMultiplesOfControl?.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
        installmentControl?.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
      } else {
        inMultiplesOfControl?.clearValidators();
        installmentControl?.clearValidators();
        inMultiplesOfControl?.setValue('');
        installmentControl?.setValue('');
      }

      inMultiplesOfControl?.updateValueAndValidity();
      installmentControl?.updateValueAndValidity();
    });

    const initialSetMultiples = this.loanProductCurrencyForm.get('setMultiples')?.value;
    if (initialSetMultiples) {
      const inMultiplesOfControl = this.loanProductCurrencyForm.get('inMultiplesOf');
      const installmentControl = this.loanProductCurrencyForm.get('installmentAmountInMultiplesOf');
      inMultiplesOfControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      installmentControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      inMultiplesOfControl?.updateValueAndValidity();
      installmentControl?.updateValueAndValidity();
    }
  }

  createLoanProductCurrencyForm() {
    this.loanProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      setMultiples: [false],
      inMultiplesOf: [''],
      installmentAmountInMultiplesOf: ['']
    });
  }

  get loanProductCurrency() {
    const formValue = this.loanProductCurrencyForm.value;
    const result: any = {
      currencyCode: formValue.currencyCode,
      digitsAfterDecimal: formValue.digitsAfterDecimal
    };

    if (formValue.setMultiples) {
      if (formValue.inMultiplesOf !== '' && formValue.inMultiplesOf !== null && formValue.inMultiplesOf !== undefined) {
        result.inMultiplesOf = formValue.inMultiplesOf;
      }

      if (
        formValue.installmentAmountInMultiplesOf !== '' &&
        formValue.installmentAmountInMultiplesOf !== null &&
        formValue.installmentAmountInMultiplesOf !== undefined
      ) {
        result.installmentAmountInMultiplesOf = formValue.installmentAmountInMultiplesOf;
      }
    }

    return result;
  }
}
