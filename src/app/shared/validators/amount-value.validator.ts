/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function amountValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const maxTotalDigits = 19;
    const maxDecimals = 6;

    // Regex breakdown:
    // ^ - Start of string
    // (?=.{1,14}$) - Lookahead to ensure total length (including potential dot)
    // [0-9]+ - One or more digits
    // (\.[0-9]{1,6})? - Optional dot followed by 1 to 6 digits
    // $ - End of string
    const regex = new RegExp(`^\\d{1,${maxTotalDigits - maxDecimals}}(\\.\\d{1,${maxDecimals}})?$`);

    const valid = regex.test(control.value.toString());
    return valid ? null : { highAmountValue: true };
  };
}
