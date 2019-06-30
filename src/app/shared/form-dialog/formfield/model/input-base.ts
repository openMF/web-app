import { FormfieldBase } from './formfield-base';

export class InputBase extends FormfieldBase {

  controlType = 'input';
  type: string;

  constructor(options: any) {
    super(options);
    this.type = options['type'] || 'text';
  }

}
