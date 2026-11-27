/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import {
  Decimal,
  addDecimal,
  atLeastPercent,
  compareDecimal,
  decimalToString,
  floorPercent,
  subtractDecimal,
  toDecimal
} from './teller-decimal';

const d = (value: number | string): Decimal => toDecimal(value) as Decimal;

describe('teller decimal arithmetic', () => {
  it.each([
    [
      0.1,
      '0.1'
    ],
    [
      48250,
      '48250'
    ],
    [
      '48250.50',
      '48250.50'
    ],
    [
      '-1500.5',
      '-1500.5'
    ],
    [
      1e-7,
      '0.0000001'
    ],
    [
      1.5e3,
      '1500'
    ],
    [
      '.5',
      '0.5'
    ],
    [
      '007.10',
      '7.10'
    ]
  ])('parses %p exactly as %s', (input, expected) => {
    expect(decimalToString(d(input))).toBe(expected);
  });

  it.each([
    null,
    undefined,
    '',
    '   ',
    'abc',
    '1,000.00',
    '1.2.3',
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '1e999'
  ])('treats %p as unknown rather than zero', (input) => {
    expect(toDecimal(input as number)).toBeNull();
  });

  it('adds without the floating point drift of 0.1 + 0.2', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(decimalToString(addDecimal(d(0.1), d(0.2)))).toBe('0.3');
  });

  it('subtracts and compares across different scales', () => {
    expect(decimalToString(subtractDecimal(d('100.005'), d('0.005')))).toBe('100.000');
    expect(compareDecimal(d('1.50'), d(1.5))).toBe(0);
    expect(compareDecimal(d('1.4999'), d(1.5))).toBeLessThan(0);
  });

  describe('percentages', () => {
    it('evaluates thresholds by cross-multiplication with no rounding at the boundary', () => {
      const limit = d(60000);
      expect(atLeastPercent(d(48000), limit, d(80))).toBe(true);
      expect(atLeastPercent(d('47999.99'), limit, d(80))).toBe(false);
      expect(atLeastPercent(d(60000), limit, d(100))).toBe(true);
      expect(atLeastPercent(d('59999.999999'), limit, d(100))).toBe(false);
    });

    it('supports fractional thresholds', () => {
      expect(atLeastPercent(d(825), d(1000), d('82.5'))).toBe(true);
      expect(atLeastPercent(d(824), d(1000), d('82.5'))).toBe(false);
    });

    it('rounds the displayed percentage down so 100% is never shown early', () => {
      expect(floorPercent(d(48250), d(60000))).toBe(80);
      expect(floorPercent(d('59999.99'), d(60000))).toBe(99);
      expect(floorPercent(d(75000), d(60000))).toBe(125);
    });

    it('clamps negative balances to 0% and refuses a non-positive base', () => {
      expect(floorPercent(d(-5), d(100))).toBe(0);
      expect(floorPercent(d(5), d(0))).toBeNull();
      expect(floorPercent(d(5), d(-10))).toBeNull();
      expect(atLeastPercent(d(5), d(0), d(1))).toBe(false);
    });
  });
});
