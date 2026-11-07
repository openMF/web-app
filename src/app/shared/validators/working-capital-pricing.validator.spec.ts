/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl } from '@angular/forms';
import {
  MAX_CALCULABLE_ANNUAL_EIR,
  annualEirValidators,
  greaterThanZeroValidator,
  withinBoundsValidator
} from './working-capital-pricing.validator';

describe('working-capital-pricing.validator', () => {
  describe('greaterThanZeroValidator', () => {
    const control = new FormControl<number | string | null>(null, greaterThanZeroValidator());

    it('leaves empty values to the required validator', () => {
      control.setValue(null);
      expect(control.errors).toBeNull();
      control.setValue('');
      expect(control.errors).toBeNull();
    });

    it('rejects zero and negatives', () => {
      control.setValue(0);
      expect(control.errors).toEqual({ greaterThanZero: true });
      control.setValue(-1);
      expect(control.errors).toEqual({ greaterThanZero: true });
    });

    it('accepts positive values, including comma decimals', () => {
      control.setValue('0,5');
      expect(control.errors).toBeNull();
      control.setValue(43.756245);
      expect(control.errors).toBeNull();
    });
  });

  describe('withinBoundsValidator', () => {
    it('reads the bounds lazily and reports the window that was violated', () => {
      let min: number | null = 10;
      let max: number | null = 20;
      const control = new FormControl<number | null>(
        null,
        withinBoundsValidator(
          () => min,
          () => max
        )
      );

      control.setValue(15);
      expect(control.errors).toBeNull();
      control.setValue(5);
      expect(control.errors).toEqual({ outOfBounds: { min: 10, max: 20 } });
      control.setValue(25);
      expect(control.errors).toEqual({ outOfBounds: { min: 10, max: 20 } });

      min = null;
      max = null;
      control.updateValueAndValidity();
      expect(control.errors).toBeNull();
    });

    it('ignores empty values', () => {
      const control = new FormControl<number | null>(
        null,
        withinBoundsValidator(
          () => 1,
          () => 2
        )
      );
      expect(control.errors).toBeNull();
    });
  });

  describe('annualEirValidators', () => {
    const control = new FormControl<number | string | null>(null, annualEirValidators());

    it('caps the rate at the engine maximum', () => {
      control.setValue(MAX_CALCULABLE_ANNUAL_EIR + 1);
      expect(control.hasError('max')).toBe(true);
      control.setValue(MAX_CALCULABLE_ANNUAL_EIR);
      expect(control.errors).toBeNull();
    });

    it('allows at most six decimals', () => {
      control.setValue('43.756245');
      expect(control.errors).toBeNull();
      control.setValue('43.7562451');
      expect(control.hasError('pattern')).toBe(true);
    });
  });
});
