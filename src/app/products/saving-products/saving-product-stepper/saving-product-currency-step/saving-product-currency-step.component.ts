/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { MatCheckbox } from '@angular/material/checkbox';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-product-currency-step',
  templateUrl: './saving-product-currency-step.component.html',
  styleUrls: ['./saving-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatCheckbox
  ]
})
export class SavingProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  @Input() savingProductsTemplate: any;

  savingProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createSavingProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.savingProductsTemplate.currencyOptions;

    this.savingProductCurrencyForm.patchValue({
      currencyCode: this.savingProductsTemplate.currency.code || this.currencyData[0].code,
      digitsAfterDecimal: this.savingProductsTemplate.digitsAfterDecimal ?? '',
      setMultiples: !!this.savingProductsTemplate.inMultiplesOf,
      inMultiplesOf: this.savingProductsTemplate.inMultiplesOf ?? ''
    });

    this.setupConditionalValidation();
  }

  createSavingProductCurrencyForm() {
    this.savingProductCurrencyForm = this.formBuilder.group({
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
    const inMultiplesOfControl = this.savingProductCurrencyForm.get('inMultiplesOf');
    const setMultiplesControl = this.savingProductCurrencyForm.get('setMultiples');
    if (setMultiplesControl?.value) {
      inMultiplesOfControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
      inMultiplesOfControl?.updateValueAndValidity();
    }

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

  get savingProductCurrency() {
    const formValue = this.savingProductCurrencyForm.value;
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
