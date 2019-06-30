import { FormfieldBase } from './formfield-base';

export class SelectBase extends FormfieldBase {

  controlType = 'select';
  options: {
    label: string,
    value: string,
    data: {}[]
  };

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'];
  }

}
