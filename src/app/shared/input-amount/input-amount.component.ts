import { Component, Input } from '@angular/core';
import { Currency } from '../models/general.model';
import { UntypedFormControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatHint } from '@angular/material/form-field';
import { FormatAmountDirective } from '../../directives/format-amount.directive';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-input-amount',
  templateUrl: './input-amount.component.html',
  styleUrls: ['./input-amount.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormatAmountDirective,
    MatHint,
    CurrencyPipe
  ]
})
export class InputAmountComponent {
  @Input() isRequired = false;
  @Input() currency: Currency;
  @Input() inputLabel: string;
  @Input() inputFormControl: UntypedFormControl;
  @Input() minVal: number;
  @Input() maxVal: number;

  displayHint = false;

  constructor() {}

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode === 46) {
      if (!(this.inputFormControl.value.indexOf('.') > -1)) {
        return true;
      }
      return false;
    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
