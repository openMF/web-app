/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl } from '@angular/forms';
import {
  SEMI_MONTHLY_DUE_DAY_ERROR,
  applyRepaymentDaysToPayload,
  firstRepaymentDayOptions,
  isSemiMonthly,
  isSemiMonthlyDueDate,
  isValidFirstRepaymentDay,
  isValidRepaymentDayPair,
  secondDayIn,
  secondRepaymentDayOptions,
  semiMonthlyDueDateValidator
} from './semi-monthly';

describe('semi-monthly helpers', () => {
  describe('isSemiMonthly', () => {
    it('recognises the frequency id as number, string and option object', () => {
      expect(isSemiMonthly(6)).toBe(true);
      expect(isSemiMonthly('6')).toBe(true);
      expect(isSemiMonthly({ id: 6, code: 'repaymentFrequency.periodFrequencyType.semiMonthly' })).toBe(true);
    });

    it('rejects other frequencies and blanks', () => {
      expect(isSemiMonthly(2)).toBe(false);
      expect(isSemiMonthly({ id: 2 })).toBe(false);
      expect(isSemiMonthly(null)).toBe(false);
      expect(isSemiMonthly('')).toBe(false);
    });
  });

  describe('isValidFirstRepaymentDay', () => {
    it('accepts integers from 1 to 27 only', () => {
      expect(isValidFirstRepaymentDay(1)).toBe(true);
      expect(isValidFirstRepaymentDay(27)).toBe(true);
      expect(isValidFirstRepaymentDay(0)).toBe(false);
      expect(isValidFirstRepaymentDay(28)).toBe(false);
      expect(isValidFirstRepaymentDay(7.5)).toBe(false);
      expect(isValidFirstRepaymentDay(null)).toBe(false);
    });
  });

  describe('isValidRepaymentDayPair', () => {
    it('accepts any second day after the first, up to 31, with no minimum gap', () => {
      expect(isValidRepaymentDayPair(1, 15)).toBe(true);
      expect(isValidRepaymentDayPair(10, 25)).toBe(true);
      expect(isValidRepaymentDayPair(1, 25)).toBe(true);
      expect(isValidRepaymentDayPair(10, 11)).toBe(true);
      expect(isValidRepaymentDayPair(15, 31)).toBe(true);
    });

    it('rejects a second day on or before the first, above 31, or missing', () => {
      expect(isValidRepaymentDayPair(10, 10)).toBe(false);
      expect(isValidRepaymentDayPair(10, 5)).toBe(false);
      expect(isValidRepaymentDayPair(10, 32)).toBe(false);
      expect(isValidRepaymentDayPair(10, null)).toBe(false);
      expect(isValidRepaymentDayPair(28, 31)).toBe(false);
    });
  });

  describe('day options', () => {
    it('offers 1–27 for the first day', () => {
      const options = firstRepaymentDayOptions();
      expect(options[0]).toBe(1);
      expect(options[options.length - 1]).toBe(27);
      expect(options).toHaveLength(27);
    });

    it('offers only the days after the first one, up to 31, for the second day', () => {
      expect(secondRepaymentDayOptions(25)).toEqual([
        26,
        27,
        28,
        29,
        30,
        31
      ]);
      expect(secondRepaymentDayOptions(1)[0]).toBe(2);
      expect(secondRepaymentDayOptions(null)[0]).toBe(2);
      expect(secondRepaymentDayOptions(null)).toHaveLength(30);
    });
  });

  describe('secondDayIn', () => {
    it('caps the configured day at the length of the month', () => {
      expect(secondDayIn(31, 2023, 2)).toBe(28);
      expect(secondDayIn(31, 2024, 2)).toBe(29);
      expect(secondDayIn(31, 2025, 4)).toBe(30);
      expect(secondDayIn(29, 2023, 2)).toBe(28);
    });

    it('keeps a day the month has', () => {
      expect(secondDayIn(25, 2023, 2)).toBe(25);
      expect(secondDayIn(31, 2025, 7)).toBe(31);
    });
  });

  describe('isSemiMonthlyDueDate', () => {
    const tenAndTwenty = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 20 };
    const fifteenAndLast = { firstRepaymentDayOfMonth: 15, secondRepaymentDayOfMonth: 31 };

    it('accepts the first day and the configured second day', () => {
      expect(isSemiMonthlyDueDate(new Date(2026, 2, 10), tenAndTwenty)).toBe(true);
      expect(isSemiMonthlyDueDate(new Date(2026, 2, 20), tenAndTwenty)).toBe(true);
    });

    it('accepts the capped second day in a short month', () => {
      expect(isSemiMonthlyDueDate(new Date(2026, 1, 28), fifteenAndLast)).toBe(true);
      expect(isSemiMonthlyDueDate(new Date(2026, 3, 30), fifteenAndLast)).toBe(true);
      expect(isSemiMonthlyDueDate(new Date(2026, 2, 31), fifteenAndLast)).toBe(true);
    });

    it('rejects any other day', () => {
      expect(isSemiMonthlyDueDate(new Date(2026, 2, 25), tenAndTwenty)).toBe(false);
      expect(isSemiMonthlyDueDate(new Date(2026, 2, 30), fifteenAndLast)).toBe(false);
    });
  });

  describe('semiMonthlyDueDateValidator', () => {
    const days = { firstRepaymentDayOfMonth: 5, secondRepaymentDayOfMonth: 20 };

    it('passes when the loan is not semi-monthly or the date is blank', () => {
      expect(semiMonthlyDueDateValidator(() => null)(new FormControl(new Date(2026, 2, 12)))).toBeNull();
      expect(semiMonthlyDueDateValidator(() => days)(new FormControl(null))).toBeNull();
      expect(semiMonthlyDueDateValidator(() => days)(new FormControl(''))).toBeNull();
    });

    it('flags a date that is not a configured due day', () => {
      const validator = semiMonthlyDueDateValidator(() => days);
      expect(validator(new FormControl(new Date(2026, 2, 12)))).toEqual({ [SEMI_MONTHLY_DUE_DAY_ERROR]: true });
      expect(validator(new FormControl(new Date(2026, 2, 20)))).toBeNull();
    });

    it('accepts ISO strings and skips values it cannot parse', () => {
      const validator = semiMonthlyDueDateValidator(() => ({
        firstRepaymentDayOfMonth: 10,
        secondRepaymentDayOfMonth: 25
      }));
      expect(validator(new FormControl('2026-03-25T00:00:00'))).toBeNull();
      expect(validator(new FormControl('2026-03-26T00:00:00'))).toEqual({ [SEMI_MONTHLY_DUE_DAY_ERROR]: true });
      expect(validator(new FormControl('not a date'))).toBeNull();
    });
  });

  describe('applyRepaymentDaysToPayload', () => {
    it('keeps both days for a semi-monthly payload', () => {
      const payload = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 25 };
      applyRepaymentDaysToPayload(payload, 6);
      expect(payload).toEqual({ firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 25 });
    });

    it('never sends only one of the two days', () => {
      const onlyFirst: Record<string, unknown> = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: null };
      applyRepaymentDaysToPayload(onlyFirst, 6);
      expect(onlyFirst).not.toHaveProperty('firstRepaymentDayOfMonth');
      expect(onlyFirst).not.toHaveProperty('secondRepaymentDayOfMonth');
    });

    it('drops both days on any other frequency', () => {
      const payload: Record<string, unknown> = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 25 };
      applyRepaymentDaysToPayload(payload, 2);
      expect(payload).toEqual({});
    });

    it('drops an unchanged pair so the backend keeps the stored days', () => {
      const baseline = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 25 };
      const unchanged: Record<string, unknown> = { ...baseline };
      applyRepaymentDaysToPayload(unchanged, 6, baseline);
      expect(unchanged).toEqual({});

      const changed: Record<string, unknown> = { firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 31 };
      applyRepaymentDaysToPayload(changed, 6, baseline);
      expect(changed).toEqual({ firstRepaymentDayOfMonth: 10, secondRepaymentDayOfMonth: 31 });
    });
  });
});
