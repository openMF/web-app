/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SettingsService } from 'app/settings/settings.service';
import { FormatNumberPipe } from './format-number.pipe';

describe('FormatNumberPipe', () => {
  let pipe: FormatNumberPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormatNumberPipe,
        { provide: DecimalPipe, useValue: new DecimalPipe('en-US') },
        { provide: SettingsService, useValue: { decimals: 2 } }
      ]
    });
    pipe = TestBed.inject(FormatNumberPipe);
  });

  it('formats amounts with the configured decimal places', () => {
    expect(pipe.transform(1075.6)).toBe('1,075.60');
  });

  it('formats counts such as past due days without decimals', () => {
    expect(pipe.transform(133, '', 0)).toBe('133');
    expect(pipe.transform(1200, '', 0)).toBe('1,200');
  });

  it('returns the default value when the value is undefined', () => {
    expect(pipe.transform(undefined, '-', 0)).toBe('-');
  });

  it('returns the default value when the value is null', () => {
    expect(pipe.transform(null as any, '-', 0)).toBe('-');
  });

  it('returns the default value when the value is an empty string', () => {
    expect(pipe.transform('', '-', 0)).toBe('-');
  });

  it('returns empty string when value is null or undefined and no defaultValue is provided', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('preserves numeric 0 as defaultValue when value is null or undefined', () => {
    expect(pipe.transform(null as any, 0)).toBe('0');
    expect(pipe.transform(undefined, 0)).toBe('0');
  });

  it('correctly formats number 0 as a valid value', () => {
    expect(pipe.transform(0)).toBe('0.00');
    expect(pipe.transform(0, '-', 0)).toBe('0');
  });
});
