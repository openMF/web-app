/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Largest annual EIR the backend engine can solve (ProjectedAmortizationScheduleModel.MAX_CALCULABLE_ANNUAL_EIR). */
export const MAX_CALCULABLE_ANNUAL_EIR = 9999999999999.999999;

/** Percentages travel with up to 6 decimals; comma is accepted because the terms step normalizes it to a dot. */
export const SIX_DECIMALS_PATTERN = /^\d+([.,]\d{1,6})?$/;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(typeof value === 'string' ? value.replace(',', '.') : value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Fails with `greaterThanZero` for 0 or negative values; empty values are left to `required`. */
export function greaterThanZeroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = toNumber(control.value);
    return value !== null && value <= 0 ? { greaterThanZero: true } : null;
  };
}

/**
 * Fails with `outOfBounds` when the value leaves the [min, max] window. The bounds are read lazily
 * so the same validator works for sibling controls (product form) and product constants (loan form).
 */
export function withinBoundsValidator(min: () => unknown, max: () => unknown): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = toNumber(control.value);
    if (value === null) {
      return null;
    }
    const lower = toNumber(min());
    const upper = toNumber(max());
    return (lower !== null && value < lower) || (upper !== null && value > upper)
      ? { outOfBounds: { min: lower, max: upper } }
      : null;
  };
}

/** Validators shared by the annual EIR inputs: > 0, 6 decimals at most and below the engine cap. */
export function annualEirValidators(): ValidatorFn[] {
  return [
    greaterThanZeroValidator(),
    Validators.pattern(SIX_DECIMALS_PATTERN),
    Validators.max(MAX_CALCULABLE_ANNUAL_EIR)
  ];
}
