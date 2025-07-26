import { ValidatorFn } from '@angular/forms';

export class FormfieldBase {
  controlType: string;
  controlName: string;
  type: string;
  label: string;
  value: any;
  required: boolean;
  order: number;
  validators?: ValidatorFn[];
  min?: number | null;
  max?: number | null;

  constructor(
    options: {
      controlType?: string;
      controlName?: string;
      label?: string;
      value?: any;
      required?: boolean;
      order?: number;
      validators?: ValidatorFn[];
      min?: number | null;
      max?: number | null;
    } = {}
  ) {
    this.controlType = options.controlType || '';
    this.controlName = options.controlName || '';
    this.label = options.label || '';
    this.value = options.value === undefined ? '' : options.value;
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.validators = options.validators === undefined ? [] : options.validators;
    this.min = options.min === undefined ? null : options.min;
    this.max = options.max === undefined ? null : options.max;
  }
}
