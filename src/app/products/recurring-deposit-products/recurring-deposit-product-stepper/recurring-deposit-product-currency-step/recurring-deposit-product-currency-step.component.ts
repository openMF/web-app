/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { MatCheckbox } from '@angular/material/checkbox';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mifosx-recurring-deposit-product-currency-step',
  templateUrl: './recurring-deposit-product-currency-step.component.html',
  styleUrls: ['./recurring-deposit-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatCheckbox
  ]
})
export class RecurringDepositProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createrecurringDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.recurringDepositProductsTemplate.currencyOptions;

    this.recurringDepositProductCurrencyForm.patchValue({
      currencyCode: this.recurringDepositProductsTemplate.currency?.code || this.currencyData[0].code,
      digitsAfterDecimal: this.recurringDepositProductsTemplate.digitsAfterDecimal ?? '',
      setMultiples: !!this.recurringDepositProductsTemplate.inMultiplesOf,
      inMultiplesOf: this.recurringDepositProductsTemplate.inMultiplesOf ?? ''
    });

    this.setupConditionalValidation();

    // Apply initial validators based on the patched setMultiples value
    const inMultiplesOfControl = this.recurringDepositProductCurrencyForm.get('inMultiplesOf');
    const setMultiplesControl = this.recurringDepositProductCurrencyForm.get('setMultiples');
    if (setMultiplesControl?.value) {
      inMultiplesOfControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      inMultiplesOfControl?.updateValueAndValidity();
    }
  }

  createrecurringDepositProductCurrencyForm() {
    this.recurringDepositProductCurrencyForm = this.formBuilder.group({
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
    const inMultiplesOfControl = this.recurringDepositProductCurrencyForm.get('inMultiplesOf');
    const setMultiplesControl = this.recurringDepositProductCurrencyForm.get('setMultiples');

    setMultiplesControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((checked) => {
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

  get recurringDepositProductCurrency() {
    const formValue = this.recurringDepositProductCurrencyForm.value;
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
