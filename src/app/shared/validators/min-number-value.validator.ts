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

export function minNumberValueValidator(minControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const minControl = control.parent?.get(minControlName);
    if (!minControl || isEmpty(control.value) || isEmpty(minControl.value)) {
      return null;
    }
    const minValue = Number(minControl.value);
    const controlValue = Number(control.value);
    if (controlValue < minValue) {
      return { minValue: { requiredMin: minValue, actual: controlValue } };
    }
    return null;
  };
}
