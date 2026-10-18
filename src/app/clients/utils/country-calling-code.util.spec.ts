/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';

import {
  COUNTRY_CALLING_CODES,
  composeMobileNumber,
  dialCodeForIsoCode,
  splitMobileNumber
} from './country-calling-code.util';

describe('country-calling-code util', () => {
  it('exposes the well-known calling codes for India, the United States and the United Kingdom', () => {
    expect(dialCodeForIsoCode('IN')).toBe('+91');
    expect(dialCodeForIsoCode('US')).toBe('+1');
    expect(dialCodeForIsoCode('GB')).toBe('+44');
  });

  it('deduplicates countries that appear more than once in the source dataset', () => {
    const isoCodes = COUNTRY_CALLING_CODES.map((country) => country.isoCode);
    const uniqueIsoCodes = new Set(isoCodes);
    expect(isoCodes.length).toBe(uniqueIsoCodes.size);
    expect(isoCodes.filter((isoCode) => isoCode === 'SV')).toHaveLength(1);
  });

  it('keeps calling codes that are shared by several countries distinct by ISO code', () => {
    const northAmerican = COUNTRY_CALLING_CODES.filter((country) => country.dialCode === '+1');
    expect(northAmerican.map((country) => country.isoCode).sort()).toEqual([
      'CA',
      'US'
    ]);
  });

  it('returns an empty dial code for an unknown ISO code', () => {
    expect(dialCodeForIsoCode('ZZ')).toBe('');
    expect(dialCodeForIsoCode('')).toBe('');
    expect(dialCodeForIsoCode(undefined)).toBe('');
  });

  describe('composeMobileNumber', () => {
    it('prefixes the selected calling code to the local number', () => {
      expect(composeMobileNumber('IN', '9876543210')).toBe('+919876543210');
      expect(composeMobileNumber('GB', '7700900123')).toBe('+447700900123');
    });

    it('keeps the local number unchanged when no calling code is selected', () => {
      expect(composeMobileNumber('', '9876543210')).toBe('9876543210');
      expect(composeMobileNumber(undefined, '555-0100')).toBe('555-0100');
    });

    it('does not double-prefix a number that is already international', () => {
      expect(composeMobileNumber('IN', '+919876543210')).toBe('+919876543210');
    });

    it('drops the national trunk prefix before adding the dialing code', () => {
      expect(composeMobileNumber('GB', '07700900123')).toBe('+447700900123');
      expect(composeMobileNumber('US', '14165550100')).toBe('+14165550100');
      expect(composeMobileNumber('RU', '89991234567')).toBe('+79991234567');
    });

    it('keeps a local number that does not carry a trunk prefix unchanged', () => {
      expect(composeMobileNumber('IN', '9876543210')).toBe('+919876543210');
    });

    it('does not strip digits for countries without a national trunk prefix', () => {
      // Spain has no trunk prefix, so the number is stored exactly as entered.
      expect(composeMobileNumber('ES', '612345678')).toBe('+34612345678');
      expect(composeMobileNumber('ES', '0612345678')).toBe('+340612345678');
    });

    it('returns an empty string when no number was entered', () => {
      expect(composeMobileNumber('IN', '')).toBe('');
      expect(composeMobileNumber('IN', null)).toBe('');
      expect(composeMobileNumber('IN', undefined)).toBe('');
      expect(composeMobileNumber('IN', '   ')).toBe('');
    });
  });

  describe('splitMobileNumber', () => {
    it('splits an international number into its ISO calling code and local number', () => {
      expect(splitMobileNumber('+919876543210')).toEqual({ isoCode: 'IN', localNumber: '9876543210' });
      expect(splitMobileNumber('+447700900123')).toEqual({ isoCode: 'GB', localNumber: '7700900123' });
    });

    it('matches the longest dial code so country codes do not overlap incorrectly', () => {
      // +420 (Czechia) must win over the shorter +42 prefix, which is not a valid calling code.
      expect(splitMobileNumber('+420123456789')).toEqual({ isoCode: 'CZ', localNumber: '123456789' });
    });

    it('preserves legacy numbers that are not in international format', () => {
      expect(splitMobileNumber('555-0100')).toEqual({ isoCode: '', localNumber: '555-0100' });
      expect(splitMobileNumber('9876543210')).toEqual({ isoCode: '', localNumber: '9876543210' });
    });

    it('preserves numbers whose calling code is not recognized', () => {
      expect(splitMobileNumber('+999123456')).toEqual({ isoCode: '', localNumber: '+999123456' });
    });

    it('selects no country when the dial code is shared by several countries', () => {
      // +1 is used by both US and CA, so the stored number cannot say which of the two it belongs to.
      expect(splitMobileNumber('+14165550100')).toEqual({ isoCode: '', localNumber: '+14165550100' });
    });

    it('keeps a number that is only a dialing code instead of splitting it empty', () => {
      expect(splitMobileNumber('+91')).toEqual({ isoCode: '', localNumber: '+91' });
      expect(splitMobileNumber('+44')).toEqual({ isoCode: '', localNumber: '+44' });
    });

    it('handles empty values', () => {
      expect(splitMobileNumber('')).toEqual({ isoCode: '', localNumber: '' });
      expect(splitMobileNumber(null)).toEqual({ isoCode: '', localNumber: '' });
      expect(splitMobileNumber(undefined)).toEqual({ isoCode: '', localNumber: '' });
    });

    it('round-trips through composeMobileNumber for supported countries', () => {
      const composed = composeMobileNumber('IN', '9876543210');
      expect(splitMobileNumber(composed)).toEqual({ isoCode: 'IN', localNumber: '9876543210' });
    });

    it('round-trips a national-format number with its trunk prefix stripped', () => {
      const composed = composeMobileNumber('GB', '07700900123');
      expect(composed).toBe('+447700900123');
      expect(splitMobileNumber(composed)).toEqual({ isoCode: 'GB', localNumber: '7700900123' });
    });

    it('round-trips a dialing-code-only number unchanged', () => {
      // A number submitted as "+91" with no country selected is preserved when the form reopens.
      expect(splitMobileNumber('+91')).toEqual({ isoCode: '', localNumber: '+91' });
      expect(composeMobileNumber('', '+91')).toBe('+91');
    });
  });
});
