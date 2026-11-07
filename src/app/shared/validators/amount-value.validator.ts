/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates the shape of an amount: up to 13 integer digits and up to 6
 * decimals. Amounts are unsigned unless `allowNegative` is set, which is only
 * the case for signed differences such as a delta based adjustment.
 * @param allowNegative Whether a leading minus sign is accepted
 */
export function amountValueValidator(allowNegative = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const maxTotalDigits = 19;
    const maxDecimals = 6;

    // Regex breakdown:
    // ^ - Start of string
    // -? - Optional minus sign, only when negatives are allowed
    // [0-9]{1,13} - One to thirteen integer digits
    // (\.[0-9]{1,6})? - Optional dot followed by 1 to 6 digits
    // $ - End of string
    const sign = allowNegative ? '-?' : '';
    const regex = new RegExp(`^${sign}\\d{1,${maxTotalDigits - maxDecimals}}(\\.\\d{1,${maxDecimals}})?$`);

    const valid = regex.test(control.value.toString());
    return valid ? null : { highAmountValue: true };
  };
}
