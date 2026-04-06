/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minNumberValueValidator(minControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const minControl = control.parent?.get(minControlName);
    if (!minControl || !control.value) {
      return null;
    }

    let minValue = minControl.value;
    if (typeof minValue === 'undefined') {
      return null;
    }
    if (typeof minValue !== 'number') {
      minValue = minValue * 1;
    }
    let controlValue = control.value;
    if (typeof controlValue !== 'number') {
      controlValue = controlValue * 1;
    }
    if (controlValue < minValue) {
      return { minValue: { requiredMin: minValue, actual: controlValue } };
    }
    return null;
  };
}
