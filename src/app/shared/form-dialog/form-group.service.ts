/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
    if (formfield.min !== null && formfield.min !== undefined) {
      validators.push(Validators.min(formfield.min));
    }
    if (formfield.max !== null && formfield.max !== undefined) {
      validators.push(Validators.max(formfield.max));
    }
    if (formfield.validators) {
      formfield.validators.forEach((validator: ValidatorFn) => validators.push(validator));
    }
    return validators;
  }
}
