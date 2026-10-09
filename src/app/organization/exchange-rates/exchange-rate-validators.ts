/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const differentCurrenciesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const sourceCurrencyCode = control.get('sourceCurrencyCode')?.value || control.get('sourceCurrency')?.value;
  const targetCurrencyCode = control.get('targetCurrencyCode')?.value || control.get('targetCurrency')?.value;

  return sourceCurrencyCode && targetCurrencyCode && sourceCurrencyCode === targetCurrencyCode
    ? { sameCurrencies: true }
    : null;
};
