/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxNumberValueValidator(maxControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const maxControl = control.parent?.get(maxControlName);
    if (!maxControl || !control.value) {
      return null;
    }

    let maxValue = maxControl.value;
    if (maxValue == null) {
      return null;
    }
    if (typeof maxValue === 'undefined') {
      return null;
    }
    if (typeof maxValue !== 'number') {
      maxValue = maxValue * 1;
    }
    let controlValue = control.value;
    if (typeof controlValue !== 'number') {
      controlValue = controlValue * 1;
    }
    if (controlValue > maxValue) {
      return { maxValue: { requiredMax: maxValue, actual: controlValue } };
    }
    return null;
  };
}
