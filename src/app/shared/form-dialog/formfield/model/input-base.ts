import { FormfieldBase } from './formfield-base';

interface InputBaseOptions extends FormfieldBaseOptions {
  type?: string;
  [key: string]: any;
}

interface FormfieldBaseOptions {
  controlType?: string;
  controlName?: string;
  label?: string;
  value?: any;
  required?: boolean;
  order?: number;
}

export class InputBase extends FormfieldBase {
  controlType = 'input';
  type: string;

  constructor(options: InputBaseOptions = {}) {
    super(options);
    this.type = options.type || 'text';
  }
}
