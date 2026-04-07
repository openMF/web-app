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
  selector: 'mifosx-share-product-currency-step',
  templateUrl: './share-product-currency-step.component.html',
  styleUrls: ['./share-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatCheckbox
  ]
})
export class ShareProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private destroyRef = inject(DestroyRef);

  @Input() shareProductsTemplate: any;

  shareProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createShareProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.shareProductsTemplate.currencyOptions;

    this.shareProductCurrencyForm.patchValue({
      currencyCode: this.shareProductsTemplate.currency?.code || this.currencyData[0].code,
      digitsAfterDecimal: this.shareProductsTemplate.digitsAfterDecimal ?? '',
      setMultiples: !!this.shareProductsTemplate.inMultiplesOf,
      inMultiplesOf: this.shareProductsTemplate.inMultiplesOf ?? ''
    });

    this.setupConditionalValidation();
  }

  createShareProductCurrencyForm() {
    this.shareProductCurrencyForm = this.formBuilder.group({
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
    const inMultiplesOfControl = this.shareProductCurrencyForm.get('inMultiplesOf');
    const setMultiplesControl = this.shareProductCurrencyForm.get('setMultiples');

    const applyInMultiplesValidators = (checked: boolean) => {
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
    };

    // Apply validators based on initial value
    applyInMultiplesValidators(setMultiplesControl?.value);

    // Listen for changes
    setMultiplesControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((checked) => {
      applyInMultiplesValidators(checked);
    });
  }

  get shareProductCurrency() {
    const formValue = this.shareProductCurrencyForm.value;
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
