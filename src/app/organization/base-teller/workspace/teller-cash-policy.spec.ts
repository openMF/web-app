/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_TELLER_CASH_THRESHOLDS,
  evaluateCashLimit,
  findCashLimit,
  resolveThresholds
} from './teller-cash-policy';
import { Decimal, toDecimal } from './teller-decimal';

const cash = (value: number | string): Decimal => toDecimal(value) as Decimal;
const evaluate = (balance: number | string, limit: number | string | null | undefined = 60000) =>
  evaluateCashLimit(cash(balance), limit);

describe('teller cash-limit policy', () => {
  describe('progress bar thresholds (70% / 90%)', () => {
    it.each([
      [
        0,
        'normal'
      ],
      [
        41999.99,
        'normal'
      ],
      [
        42000,
        'warning'
      ],
      [
        53999.99,
        'warning'
      ],
      [
        54000,
        'danger'
      ],
      [
        60000,
        'danger'
      ],
      [
        90000,
        'danger'
      ]
    ])('cash on hand %p of 60000 is %s', (balance, level) => {
      expect(evaluate(balance)).toMatchObject({ state: 'available', barLevel: level });
    });
  });

  describe('warning card thresholds (80% / 100%)', () => {
    it.each([
      [
        47999.99,
        'none'
      ],
      [
        48000,
        'near'
      ],
      [
        59999.99,
        'near'
      ],
      [
        60000,
        'exceeded'
      ],
      [
        60000.01,
        'exceeded'
      ]
    ])('cash on hand %p of 60000 raises %s', (balance, alert) => {
      expect(evaluate(balance)).toMatchObject({ state: 'available', alert });
    });

    it('keeps bar colour and warning card independent (75% is amber with no card)', () => {
      expect(evaluate(45000)).toMatchObject({ barLevel: 'warning', alert: 'none', percent: 75 });
    });

    it('reports the screenshot scenario as 80% of the limit', () => {
      expect(evaluate('48250.00')).toMatchObject({ percent: 80, barLevel: 'warning', alert: 'near' });
    });

    it('reports more than 100% when the limit is exceeded', () => {
      expect(evaluate(75000)).toMatchObject({ percent: 125, alert: 'exceeded' });
    });
  });

  describe('missing or invalid configuration is never treated as unlimited', () => {
    it.each([
      [
        null,
        'no-limit'
      ],
      [
        undefined,
        'no-limit'
      ],
      [
        '',
        'no-limit'
      ],
      [
        0,
        'invalid-limit'
      ],
      [
        '0.00',
        'invalid-limit'
      ],
      [
        -100,
        'invalid-limit'
      ],
      [
        'abc',
        'invalid-limit'
      ]
    ])('limit %p is unavailable (%s) and yields no percentage or alert', (limit, reason) => {
      // Called directly: the `evaluate` helper would replace an undefined limit with its default.
      const status = evaluateCashLimit(cash(1_000_000), limit as number);
      expect(status).toEqual({ state: 'unavailable', reason });
    });

    it('is unavailable when the balance itself is unknown instead of assuming zero', () => {
      expect(evaluateCashLimit(null, 60000)).toEqual({ state: 'unavailable', reason: 'no-balance' });
    });

    it('clamps a negative balance to 0% without raising a warning', () => {
      expect(evaluate(-50)).toMatchObject({ percent: 0, barLevel: 'normal', alert: 'none' });
    });
  });

  describe('institution thresholds', () => {
    it('uses valid overrides', () => {
      const thresholds = resolveThresholds({ barWarning: 50, barDanger: 75, alertNear: 60, alertExceeded: 90 });
      const status = evaluateCashLimit(cash(45000), 60000, thresholds);
      expect(status).toMatchObject({ barLevel: 'danger', alert: 'near' });
    });

    it.each([
      { barWarning: 95 },
      { alertNear: 100 },
      { barDanger: 0 },
      { alertExceeded: Number.NaN },
      { barWarning: -1 }
    ])('falls back to the defaults for the invalid override %j', (override) => {
      expect(resolveThresholds(override)).toEqual(DEFAULT_TELLER_CASH_THRESHOLDS);
    });

    it('uses the documented defaults when nothing is configured', () => {
      expect(resolveThresholds(undefined)).toEqual({
        barWarning: 70,
        barDanger: 90,
        alertNear: 80,
        alertExceeded: 100
      });
    });
  });

  describe('currencies are independent', () => {
    const policy = {
      limits: [
        { currencyCode: 'mxn', limit: '60000' },
        { currencyCode: 'USD', limit: 5000 }
      ]
    };

    it('finds limits case-insensitively per currency', () => {
      expect(findCashLimit(policy, 'MXN')).toBe('60000');
      expect(findCashLimit(policy, 'usd')).toBe(5000);
    });

    it('returns null for a currency with no configured limit instead of borrowing another currency limit', () => {
      expect(findCashLimit(policy, 'EUR')).toBeNull();
      expect(findCashLimit({ limits: [] }, 'MXN')).toBeNull();
    });
  });
});
