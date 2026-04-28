/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

<<<<<<< HEAD
import { Component, OnInit, Input, inject } from '@angular/core';
=======
import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
>>>>>>> origin/dev
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { MatCheckbox } from '@angular/material/checkbox';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from '../../services/loan-product.service';

@Component({
  selector: 'mifosx-loan-product-currency-step',
  templateUrl: './loan-product-currency-step.component.html',
  styleUrls: ['./loan-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatCheckbox
  ]
})
export class LoanProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  protected loanProductService = inject(LoanProductService);
<<<<<<< HEAD
=======
  private destroyRef = inject(DestroyRef);
>>>>>>> origin/dev

  @Input() loanProductsTemplate: any;

  loanProductCurrencyForm!: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createLoanProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.loanProductsTemplate.currencyOptions;
    const currency = this.loanProductsTemplate.currency ? this.loanProductsTemplate.currency : this.currencyData[0];

    let decimalPlacesValue = '';
<<<<<<< HEAD
    if (this.loanProductService.isWorkingCapital && !this.loanProductsTemplate.id) {
      decimalPlacesValue = '';
    } else {
=======
    // Only populate decimal places for existing products (when editing)
    if (this.loanProductsTemplate.id) {
>>>>>>> origin/dev
      decimalPlacesValue =
        currency.decimalPlaces === undefined || currency.decimalPlaces === null ? '' : currency.decimalPlaces;
    }

    this.loanProductCurrencyForm.patchValue({
      currencyCode: currency.code,
      digitsAfterDecimal: decimalPlacesValue,
<<<<<<< HEAD
      inMultiplesOf:
        currency.inMultiplesOf === 0 || currency.inMultiplesOf === undefined || currency.inMultiplesOf === null
          ? ''
          : currency.inMultiplesOf,
      installmentAmountInMultiplesOf:
        this.loanProductsTemplate.installmentAmountInMultiplesOf === 0 ||
        this.loanProductsTemplate.installmentAmountInMultiplesOf === undefined ||
        this.loanProductsTemplate.installmentAmountInMultiplesOf === null
          ? ''
          : this.loanProductsTemplate.installmentAmountInMultiplesOf
=======
      setMultiples: !!(this.loanProductsTemplate.inMultiplesOf || this.loanProductsTemplate.installmentInMultiplesOf),
      inMultiplesOf: this.loanProductsTemplate.inMultiplesOf ?? '',
      installmentInMultiplesOf: this.loanProductsTemplate.installmentInMultiplesOf ?? ''
>>>>>>> origin/dev
    });

    this.setupConditionalValidation();
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
<<<<<<< HEAD
      inMultiplesOf: ['']
=======
      setMultiples: [false],
      inMultiplesOf: [''],
      installmentInMultiplesOf: ['']
    });
  }

  setupConditionalValidation() {
    const inMultiplesOfControl = this.loanProductCurrencyForm.get('inMultiplesOf');
    const installmentInMultiplesOfControl = this.loanProductCurrencyForm.get('installmentInMultiplesOf');
    const setMultiplesControl = this.loanProductCurrencyForm.get('setMultiples');

    if (setMultiplesControl?.value) {
      inMultiplesOfControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      inMultiplesOfControl?.updateValueAndValidity();
      installmentInMultiplesOfControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      installmentInMultiplesOfControl?.updateValueAndValidity();
    }

    setMultiplesControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((checked) => {
      if (checked) {
        inMultiplesOfControl?.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
        installmentInMultiplesOfControl?.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
      } else {
        inMultiplesOfControl?.clearValidators();
        inMultiplesOfControl?.setValue('');
        installmentInMultiplesOfControl?.clearValidators();
        installmentInMultiplesOfControl?.setValue('');
      }
      inMultiplesOfControl?.updateValueAndValidity();
      installmentInMultiplesOfControl?.updateValueAndValidity();
>>>>>>> origin/dev
    });

    if (this.loanProductService.isLoanProduct) {
      this.loanProductCurrencyForm.addControl('installmentAmountInMultiplesOf', new UntypedFormControl(''));
    }
  }

  get loanProductCurrency() {
    const formValue = this.loanProductCurrencyForm.value;
    const result: any = {
<<<<<<< HEAD
      ...formValue
    };

=======
      currencyCode: formValue.currencyCode,
      digitsAfterDecimal: formValue.digitsAfterDecimal
    };

    // Always include inMultiplesOf: null when unchecked to explicitly clear server value
    if (formValue.setMultiples) {
      result.inMultiplesOf =
        formValue.inMultiplesOf !== '' && formValue.inMultiplesOf !== null && formValue.inMultiplesOf !== undefined
          ? formValue.inMultiplesOf
          : null;
      result.installmentInMultiplesOf =
        formValue.installmentInMultiplesOf !== '' &&
        formValue.installmentInMultiplesOf !== null &&
        formValue.installmentInMultiplesOf !== undefined
          ? formValue.installmentInMultiplesOf
          : null;
    } else {
      result.inMultiplesOf = null;
      result.installmentInMultiplesOf = null;
    }

>>>>>>> origin/dev
    return result;
  }
}
