/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Currency } from '../models/general.model';
import { UntypedFormControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatHint } from '@angular/material/form-field';
import { FormatAmountDirective } from '../../directives/format-amount.directive';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { amountValueValidator } from '../validators/amount-value.validator';

@Component({
  selector: 'mifosx-input-amount',
  templateUrl: './input-amount.component.html',
  styleUrls: ['./input-amount.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormatAmountDirective,
    MatHint,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputAmountComponent implements OnInit {
  @Input() isRequired = false;
  @Input() currency: Currency;
  @Input() inputLabel: string;
  @Input() inputFormControl: UntypedFormControl;
  @Input() minVal: number;
  @Input() maxVal: number;

  displayHint = false;

  constructor() {}

  ngOnInit(): void {
    this.inputFormControl.addValidators(amountValueValidator());
    this.inputFormControl.updateValueAndValidity({ emitEvent: false });
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode === 46) {
      const value = String(this.inputFormControl.value || '');
      if (!(value.indexOf('.') > -1)) {
        return true;
      }
      return false;
    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
