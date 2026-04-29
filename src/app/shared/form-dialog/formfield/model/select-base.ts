import { FormfieldBase } from './formfield-base';

interface SelectOption {
  label: string;
  value: string;
  data: {}[];
}

interface SelectBaseOptions {
  options?: SelectOption;
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
}

export class SelectBase extends FormfieldBase {
  controlType = 'select';
  options: SelectOption;

  constructor(options: SelectBaseOptions = {}) {
    super(options);
    this.options = options.options || { label: '', value: '', data: [] };
  }
}
