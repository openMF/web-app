import { FormfieldBase } from './formfield-base';

export class DateTimepickerBase extends FormfieldBase {

  controlType = 'datetimepicker';
  minDate: Date;
  maxDate: Date;

  constructor(options: {} = {}) {
    super(options);
    this.minDate = options['minDate'] || new Date(2000, 0, 1);
    this.maxDate = options['maxDate'] || new Date();
  }

}
