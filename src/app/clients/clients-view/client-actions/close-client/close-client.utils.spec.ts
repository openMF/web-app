/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { buildCloseClientPayload, CloseClientFormValue, isValidDate } from './close-client.utils';

describe('buildCloseClientPayload', () => {
  const DEFAULT_LOCALE = 'en';
  const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';
  const MOCK_FORMATTED_DATE = '03 November 2025';

  let formatDateSpy: jest.MockedFunction<(date: Date, format: string) => string>;

  const mockDateUtils = {
    formatDate: (date: Date, format: string) => formatDateSpy(date, format)
  };

  beforeEach(() => {
    formatDateSpy = jest.fn(() => MOCK_FORMATTED_DATE);
  });

  const makeValidForm = (overrides: Partial<CloseClientFormValue> = {}): CloseClientFormValue => ({
    closureDate: new Date(2025, 10, 3),
    closureReasonId: 1,
    ...overrides
  });

  const callBuildPayload = (
    formValue: CloseClientFormValue,
    options?: {
      locale?: string;
      dateFormat?: string;
    }
  ) =>
    buildCloseClientPayload(
      formValue,
      mockDateUtils,
      options?.locale ?? DEFAULT_LOCALE,
      options?.dateFormat ?? DEFAULT_DATE_FORMAT
    );

  describe('Valid inputs', () => {
    it('formats Date closureDate', () => {
      const date = new Date(2025, 10, 3);

      const result = callBuildPayload(makeValidForm({ closureDate: date }));

      expect(formatDateSpy).toHaveBeenCalledWith(date, DEFAULT_DATE_FORMAT);
      expect(formatDateSpy).toHaveBeenCalledTimes(1);
      expect(result.closureDate).toBe(MOCK_FORMATTED_DATE);
    });

    it('passes through pre-formatted string closureDate', () => {
      const preFormattedDate = '03 November 2025';

      const result = callBuildPayload(makeValidForm({ closureDate: preFormattedDate }));

      expect(formatDateSpy).not.toHaveBeenCalled();
      expect(result.closureDate).toBe(preFormattedDate);
    });

    it('supports custom locale', () => {
      const result = callBuildPayload(makeValidForm(), {
        locale: 'fr'
      });

      expect(result.locale).toBe('fr');
    });

    it('supports custom dateFormat', () => {
      const customFormat = 'yyyy-MM-dd';

      const result = callBuildPayload(makeValidForm(), {
        dateFormat: customFormat
      });

      expect(result.dateFormat).toBe(customFormat);
    });

    it('preserves closureReasonId', () => {
      const result = callBuildPayload(makeValidForm({ closureReasonId: 42 }));

      expect(result.closureReasonId).toBe(42);
    });
  });

  describe('Immutability', () => {
    it('does not mutate input object', () => {
      const formValue = makeValidForm();
      const originalDate = new Date(formValue.closureDate as Date);
      const originalReasonId = formValue.closureReasonId;

      callBuildPayload(formValue);

      expect(formValue.closureDate).toEqual(originalDate);
      expect(formValue.closureReasonId).toBe(originalReasonId);
    });
  });

  describe('closureDate validation', () => {
    it('rejects invalid Date object', () => {
      const invalidDate = new Date('invalid');

      expect(isValidDate(invalidDate)).toBe(false);

      expect(() => callBuildPayload(makeValidForm({ closureDate: invalidDate }))).toThrow(TypeError);
      expect(() => callBuildPayload(makeValidForm({ closureDate: invalidDate }))).toThrow(
        /Invalid closureDate.*Expected a valid Date or valid date string/
      );

      expect(formatDateSpy).not.toHaveBeenCalled();
    });

    it.each([
      null,
      undefined,
      12345,
      {} as unknown as Date,
      ''
    ])('rejects invalid closureDate: %p', (value) => {
      const callWithValue = () => callBuildPayload(makeValidForm({ closureDate: value as unknown as Date }));
      expect(callWithValue).toThrow(TypeError);
      expect(callWithValue).toThrow(/Invalid closureDate.*Expected a valid Date or valid date string/);
    });

    it('rejects whitespace-only closureDate string', () => {
      const callWithWhitespace = () => callBuildPayload(makeValidForm({ closureDate: '   ' as unknown as Date }));
      expect(callWithWhitespace).toThrow(TypeError);
      expect(callWithWhitespace).toThrow(/Invalid closureDate.*Expected a valid Date or valid date string/);

      expect(formatDateSpy).not.toHaveBeenCalled();
    });

    it('rejects malformed closureDate string', () => {
      const callWithMalformed = () => callBuildPayload(makeValidForm({ closureDate: 'not-a-date' as unknown as Date }));
      expect(callWithMalformed).toThrow(TypeError);
      expect(callWithMalformed).toThrow(/Invalid closureDate.*Expected a valid Date or valid date string/);

      expect(formatDateSpy).not.toHaveBeenCalled();
    });
  });

  describe('closureReasonId validation', () => {
    it.each([
      0,
      -1,
      1.5,
      Number.NaN
    ])('rejects invalid closureReasonId: %p', (value) => {
      const callWithReasonId = () => callBuildPayload(makeValidForm({ closureReasonId: value }));
      expect(callWithReasonId).toThrow(TypeError);
      expect(callWithReasonId).toThrow(/Invalid closureReasonId.*expected a positive integer/);
    });

    it('accepts valid boundary values', () => {
      expect(() => callBuildPayload(makeValidForm({ closureReasonId: 1 }))).not.toThrow();

      expect(() =>
        callBuildPayload(
          makeValidForm({
            closureReasonId: Number.MAX_SAFE_INTEGER
          })
        )
      ).not.toThrow();
    });

    it('rejects missing closureReasonId', () => {
      const callWithMissingReasonId = () =>
        callBuildPayload({ closureDate: new Date(), closureReasonId: undefined as unknown as number });
      expect(callWithMissingReasonId).toThrow(TypeError);
      expect(callWithMissingReasonId).toThrow(/Invalid closureReasonId.*expected a positive integer/);
    });

    it('converts closureReasonId string to number', () => {
      const result = callBuildPayload(
        makeValidForm({
          closureReasonId: '42' as unknown as number
        })
      );

      expect(result.closureReasonId).toBe(42);
      expect(typeof result.closureReasonId).toBe('number');
    });

    it('converts stringified boundary values correctly', () => {
      const result = callBuildPayload(
        makeValidForm({
          closureReasonId: '1' as unknown as number
        })
      );

      expect(result.closureReasonId).toBe(1);
    });

    it.each([
      '0',
      '-1',
      '1.5',
      'not-a-number'
    ])('converts string %p to number and validates', (value) => {
      const testValue = value as unknown as number;
      const callWithStringReasonId = () => callBuildPayload(makeValidForm({ closureReasonId: testValue }));
      expect(callWithStringReasonId).toThrow(TypeError);
      expect(callWithStringReasonId).toThrow(/Invalid closureReasonId.*expected a positive integer/);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date(2025, 10, 3))).toBe(true);
      expect(isValidDate(new Date('2025-03-24'))).toBe(true);
    });

    it('returns false for invalid Date objects', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(new Date(Number.NaN))).toBe(false);
    });

    it.each([
      '2025-03-24',
      123456,
      null,
      undefined,
      {}
    ])('returns false for non-Date values: %p', (value) => {
      expect(isValidDate(value)).toBe(false);
    });
  });
});
