/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
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
    MatStepperNext
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  protected loanProductService = inject(LoanProductService);
  private destroyRef = inject(DestroyRef);

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
    if (this.loanProductService.isWorkingCapital && !this.loanProductsTemplate.id) {
      decimalPlacesValue = '';
    } else {
      decimalPlacesValue =
        currency.decimalPlaces === undefined || currency.decimalPlaces === null ? '' : currency.decimalPlaces;
    }

    this.loanProductCurrencyForm.patchValue({
      currencyCode: currency.code,
      digitsAfterDecimal: decimalPlacesValue,
      inMultiplesOf:
        currency.inMultiplesOf === 0 || currency.inMultiplesOf === undefined || currency.inMultiplesOf === null
          ? 0
          : currency.inMultiplesOf
    });
    if (this.loanProductService.isLoanProduct) {
      this.loanProductCurrencyForm.patchValue({
        installmentAmountInMultiplesOf:
          this.loanProductsTemplate.installmentAmountInMultiplesOf === 0 ||
          this.loanProductsTemplate.installmentAmountInMultiplesOf === undefined ||
          this.loanProductsTemplate.installmentAmountInMultiplesOf === null
            ? 0
            : this.loanProductsTemplate.installmentAmountInMultiplesOf
      });
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
      inMultiplesOf: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });

    if (this.loanProductService.isLoanProduct) {
      this.loanProductCurrencyForm.addControl('installmentAmountInMultiplesOf', new UntypedFormControl(''));
    }
  }

  get loanProductCurrency() {
    const formValue = this.loanProductCurrencyForm.getRawValue();
    const result: any = {
      ...formValue
    };

    return result;
  }
}
