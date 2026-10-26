/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeCsvValue } from './csv.utils';

describe('sanitizeCsvValue', () => {
  describe('null/undefined handling', () => {
    it('should return an empty string for null', () => {
      expect(sanitizeCsvValue(null)).toBe('');
    });

    it('should return an empty string for undefined', () => {
      expect(sanitizeCsvValue(undefined)).toBe('');
    });
  });

  describe('formula-injection trigger characters', () => {
    const triggers = [
      { name: 'equals', value: '=1+1', expected: "'=1+1" },
      { name: 'plus', value: '+1', expected: "'+1" },
      { name: 'minus', value: '-1', expected: "'-1" },
      { name: 'at', value: '@SUM(A1)', expected: "'@SUM(A1)" },
      { name: 'pipe', value: '|cmd', expected: "'|cmd" },
      { name: 'percent', value: '%value', expected: "'%value" },
      { name: 'tab', value: '\tvalue', expected: "'\tvalue" },
      { name: 'carriage return', value: '\rvalue', expected: "'\rvalue" }
    ];

    triggers.forEach((t) => {
      it(`should prefix a value starting with a leading ${t.name} character with a single quote`, () => {
        expect(sanitizeCsvValue(t.value)).toBe(t.expected);
      });
    });

    it('should prefix a classic DDE payload', () => {
      expect(sanitizeCsvValue('=cmd|"/C calc"!A0')).toBe('\'=cmd|"/C calc"!A0');
    });

    it('should only trigger on the leading character, not interior occurrences', () => {
      expect(sanitizeCsvValue('a=1')).toBe('a=1');
      expect(sanitizeCsvValue('value@domain')).toBe('value@domain');
    });
  });

  describe('safe values', () => {
    it('should leave a plain string untouched', () => {
      expect(sanitizeCsvValue('John Doe')).toBe('John Doe');
    });

    it('should leave an empty string untouched', () => {
      expect(sanitizeCsvValue('')).toBe('');
    });

    it('should leave a numeric string untouched', () => {
      expect(sanitizeCsvValue('12345')).toBe('12345');
    });
  });

  describe('value coercion', () => {
    it('should stringify a number', () => {
      expect(sanitizeCsvValue(42)).toBe('42');
    });

    it('should stringify zero', () => {
      expect(sanitizeCsvValue(0)).toBe('0');
    });

    it('should stringify a negative number by prefixing the leading minus', () => {
      expect(sanitizeCsvValue(-5)).toBe("'-5");
    });

    it('should stringify a boolean', () => {
      expect(sanitizeCsvValue(true)).toBe('true');
      expect(sanitizeCsvValue(false)).toBe('false');
    });

    it('should stringify an object', () => {
      expect(sanitizeCsvValue({ a: 1 })).toBe('[object Object]');
    });

    it('should stringify an object whose toString begins with a trigger character', () => {
      const value = { toString: () => '=danger' };
      expect(sanitizeCsvValue(value)).toBe("'=danger");
    });
  });
});
