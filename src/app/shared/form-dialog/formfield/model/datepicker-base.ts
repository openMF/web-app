import { FormfieldBase } from './formfield-base';

interface DatepickerOptions {
  minDate?: Date;
  maxDate?: Date;
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
  type?: string;
}

export class DatepickerBase extends FormfieldBase {
  controlType = 'datepicker';
  minDate: Date;
  maxDate: Date;

  constructor(options: DatepickerOptions = {}) {
    super(options);
    this.minDate = options.minDate || new Date(2000, 0, 1);
    this.maxDate = options.maxDate || new Date();
  }
}
