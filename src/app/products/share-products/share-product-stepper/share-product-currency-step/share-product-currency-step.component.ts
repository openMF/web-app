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
  selector: 'mifosx-share-product-currency-step',
  templateUrl: './share-product-currency-step.component.html',
  styleUrls: ['./share-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class ShareProductCurrencyStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() shareProductsTemplate: any;

  shareProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor() {
    this.createShareProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.shareProductsTemplate.currencyOptions;

    if (this.shareProductsTemplate.currency) {
      this.shareProductCurrencyForm.patchValue({
        currencyCode: this.shareProductsTemplate.currency.code,
        digitsAfterDecimal: this.shareProductsTemplate.currency.decimalPlaces,
        inMultiplesOf: this.shareProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.shareProductCurrencyForm.patchValue({
        currencyCode: this.currencyData[0].code,
        digitsAfterDecimal: 2
      });
    }
  }

  createShareProductCurrencyForm() {
    this.shareProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        '',
        Validators.required
      ],
      inMultiplesOf: [
        '',
        Validators.required
      ]
    });
  }

  get shareProductCurrency() {
    return this.shareProductCurrencyForm.value;
  }
}
