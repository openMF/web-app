/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidatorFn } from '@angular/forms';

/** A cleared input holds '' and an untouched one null; neither sets a limit. */
const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === '';

export function maxNumberValueValidator(maxControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const maxControl = control.parent?.get(maxControlName);
    if (!maxControl || isEmpty(control.value) || isEmpty(maxControl.value)) {
      return null;
    }
    const maxValue = Number(maxControl.value);
    const controlValue = Number(control.value);
    if (controlValue > maxValue) {
      return { maxValue: { requiredMax: maxValue, actual: controlValue } };
    }
    return null;
  };
}
