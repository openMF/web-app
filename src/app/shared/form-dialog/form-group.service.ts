import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';

@Injectable({
  providedIn: 'root'
})
export class FormGroupService {

  constructor() { }

  createFormGroup(formfields: FormfieldBase[]) {
    const group: any = {};

    formfields.forEach(formfield => {
      group[formfield.controlName] = formfield.required ? new FormControl(formfield.value, Validators.required) : new FormControl(formfield.value);
    });

    return new FormGroup(group);
  }

}
