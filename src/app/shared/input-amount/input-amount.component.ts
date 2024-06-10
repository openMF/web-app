import { Component, Input, OnInit } from '@angular/core';
import { Currency } from '../models/general.model';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'mifosx-input-amount',
  templateUrl: './input-amount.component.html',
  styleUrls: ['./input-amount.component.scss']
})
export class InputAmountComponent implements OnInit {

  @Input() isRequired = false;
  @Input() currency: Currency;
  @Input() inputLabel: string;
  @Input() inputFormControl: UntypedFormControl;

  displayHint = false;

  constructor() { }

  ngOnInit(): void {
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
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

  inputBlur(): void {
    this.displayHint = false;
  }

  inputFocus(): void {
    this.displayHint = true;
  }

}
