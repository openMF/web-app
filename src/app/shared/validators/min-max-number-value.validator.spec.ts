/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl, FormGroup } from '@angular/forms';
import { maxNumberValueValidator } from './max-number-value.validator';
import { minNumberValueValidator } from './min-number-value.validator';
import { revalidateEachOther } from './revalidate-each-other';

/** Builds the min/max cap pair the same way the create and edit charge forms do. */
function capForm(linked = true): FormGroup {
  const form = new FormGroup({
    minCap: new FormControl<string | number | null>(null, [maxNumberValueValidator('maxCap')]),
    maxCap: new FormControl<string | number | null>(null, [minNumberValueValidator('minCap')])
  });
  if (linked) {
    revalidateEachOther(form, 'minCap', 'maxCap');
  }
  return form;
}

describe('min/max number value validators', () => {
  it('flags a min above the max and a max below the min', () => {
    const form = capForm();
    form.patchValue({ maxCap: '100' });
    form.patchValue({ minCap: '200' });
    expect(form.get('minCap').hasError('maxValue')).toBe(true);
    expect(form.get('maxCap').hasError('minValue')).toBe(true);
  });

  it('accepts a valid range and equal values', () => {
    const form = capForm();
    form.patchValue({ minCap: '50', maxCap: '100' });
    expect(form.valid).toBe(true);
    form.patchValue({ minCap: '100' });
    expect(form.valid).toBe(true);
  });

  it('treats a cleared or untouched partner as no limit', () => {
    const form = capForm();
    form.patchValue({ maxCap: '100' });
    form.get('maxCap').setValue('');
    form.get('minCap').setValue('50');
    expect(form.get('minCap').errors).toBeNull();

    form.get('maxCap').setValue(null);
    form.get('minCap').setValue('-5');
    expect(form.get('minCap').errors).toBeNull();
  });

  it('compares numerically, not as strings', () => {
    const form = capForm();
    form.patchValue({ minCap: '9', maxCap: '10' });
    expect(form.valid).toBe(true);
  });

  it('clears the max error once the min is lowered', () => {
    const form = capForm();
    form.get('minCap').setValue('200');
    form.get('maxCap').setValue('100');
    expect(form.get('maxCap').hasError('minValue')).toBe(true);

    form.get('minCap').setValue('50');
    expect(form.get('maxCap').errors).toBeNull();
    expect(form.valid).toBe(true);
  });

  it('clears the min error once the max is raised', () => {
    const form = capForm();
    form.get('maxCap').setValue('100');
    form.get('minCap').setValue('200');
    expect(form.get('minCap').hasError('maxValue')).toBe(true);

    form.get('maxCap').setValue('300');
    expect(form.get('minCap').errors).toBeNull();
    expect(form.valid).toBe(true);
  });

  it('keeps the stale error without revalidateEachOther', () => {
    const form = capForm(false);
    form.get('minCap').setValue('200');
    form.get('maxCap').setValue('100');
    form.get('minCap').setValue('50');
    expect(form.get('maxCap').hasError('minValue')).toBe(true);
  });
});
