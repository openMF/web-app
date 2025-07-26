import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';

@Injectable({
  providedIn: 'root'
})
export class FormGroupService {
  constructor() {}

  createFormGroup(formfields: FormfieldBase[]) {
    const group: any = {};

    formfields.forEach((formfield) => {
      group[formfield.controlName] = formfield.required
        ? new UntypedFormControl(formfield.value, this.buildValidators(formfield))
        : new UntypedFormControl(formfield.value, this.buildValidators(formfield));
    });

    return new UntypedFormGroup(group);
  }

  buildValidators(formfield: FormfieldBase): ValidatorFn[] {
    let validators: ValidatorFn[] = [];
    if (formfield.required) {
      validators.push(Validators.required);
    }
    if (formfield.validators) {
      formfield.validators.forEach((validator: ValidatorFn) => validators.push(validator));
    }
    return validators;
  }
}
