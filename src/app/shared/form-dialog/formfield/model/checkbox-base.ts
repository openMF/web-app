import { FormfieldBase } from './formfield-base';

export class CheckboxBase extends FormfieldBase {
    controlType = 'checkbox';

    constructor(options: any) {
        super(options);
    }

}
