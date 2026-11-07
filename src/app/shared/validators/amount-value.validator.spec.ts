/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl } from '@angular/forms';
import { amountValueValidator } from './amount-value.validator';

describe('amountValueValidator', () => {
  /** Runs the validator on a value and returns whether it passed. */
  function accepts(value: unknown, allowNegative = false): boolean {
    return amountValueValidator(allowNegative)(new FormControl(value)) === null;
  }

  it('accepts an unsigned amount with up to six decimals', () => {
    expect(accepts(150)).toBe(true);
    expect(accepts('0.000001')).toBe(true);
    expect(accepts('1234567890123.123456')).toBe(true);
  });

  it('rejects too many digits or decimals', () => {
    expect(accepts('12345678901234')).toBe(false);
    expect(accepts('1.1234567')).toBe(false);
  });

  it('leaves an empty value to the required validator', () => {
    expect(accepts(null)).toBe(true);
    expect(accepts('')).toBe(true);
    expect(accepts(0)).toBe(true);
  });

  it('rejects a negative amount unless negatives are allowed', () => {
    expect(accepts(-40)).toBe(false);
    expect(accepts('-40.5')).toBe(false);
    expect(accepts(-40, true)).toBe(true);
    expect(accepts('-40.5', true)).toBe(true);
  });

  it('still rejects a malformed sign when negatives are allowed', () => {
    expect(accepts('--40', true)).toBe(false);
    expect(accepts('40-', true)).toBe(false);
    expect(accepts('-', true)).toBe(false);
  });
});
