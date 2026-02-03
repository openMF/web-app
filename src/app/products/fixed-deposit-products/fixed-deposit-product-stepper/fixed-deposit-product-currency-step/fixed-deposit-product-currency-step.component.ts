/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { MatCheckbox } from '@angular/material/checkbox';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-product-currency-step',
  templateUrl: './fixed-deposit-product-currency-step.component.html',
  styleUrls: ['./fixed-deposit-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatCheckbox
  ]
})
export class FixedDepositProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createFixedDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.fixedDepositProductsTemplate.currencyOptions;

    this.fixedDepositProductCurrencyForm.patchValue({
      currencyCode: this.fixedDepositProductsTemplate.currency?.code || this.currencyData[0].code,
      digitsAfterDecimal: this.fixedDepositProductsTemplate.digitsAfterDecimal ?? '',
      setMultiples: !!this.fixedDepositProductsTemplate.inMultiplesOf,
      inMultiplesOf: this.fixedDepositProductsTemplate.inMultiplesOf ?? ''
    });

    this.setupConditionalValidation();
  }

  createFixedDepositProductCurrencyForm() {
    this.fixedDepositProductCurrencyForm = this.formBuilder.group({
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
      inMultiplesOf: ['']
    });
  }

  setupConditionalValidation() {
    const inMultiplesOfControl = this.fixedDepositProductCurrencyForm.get('inMultiplesOf');
    const setMultiplesControl = this.fixedDepositProductCurrencyForm.get('setMultiples');

    setMultiplesControl?.valueChanges
      .pipe(startWith(setMultiplesControl.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) => {
        if (checked) {
          inMultiplesOfControl?.setValidators([
            Validators.required,
            Validators.min(1)
          ]);
        } else {
          inMultiplesOfControl?.clearValidators();
          inMultiplesOfControl?.setValue('');
        }
        inMultiplesOfControl?.updateValueAndValidity();
      });
  }

  get fixedDepositProductCurrency() {
    const formValue = this.fixedDepositProductCurrencyForm.value;
    const result: any = {
      currencyCode: formValue.currencyCode,
      digitsAfterDecimal: formValue.digitsAfterDecimal
    };

    if (formValue.inMultiplesOf !== '' && formValue.inMultiplesOf !== null && formValue.inMultiplesOf !== undefined) {
      result.inMultiplesOf = formValue.inMultiplesOf;
    }

    return result;
  }
}
