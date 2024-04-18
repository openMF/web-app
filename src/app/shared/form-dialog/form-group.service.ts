import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';

@Injectable({
  providedIn: 'root'
})
export class FormGroupService {

  constructor() { }

  createFormGroup(formfields: FormfieldBase[]) {
    const group: any = {};

    formfields.forEach(formfield => {
      group[formfield.controlName] = formfield.required ? new UntypedFormControl(formfield.value, Validators.required) : new UntypedFormControl(formfield.value);
    });

    return new UntypedFormGroup(group);
  }

}
