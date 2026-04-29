/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const value = Number(control.value);
    if (!Number.isInteger(value) || value < 0) {
      return { positiveInteger: true };
    }
    if (!Number.isInteger(value) || value > 2147483647) {
      return { positiveInteger: true };
    }

    return null;
  };
}
