/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import {
  getCoordinatePair,
  hasCoordinateValue,
  hasValidCoordinatePair,
  normalizeAddressCoordinates,
  parseCoordinate
} from './address-coordinate.util';

describe('address coordinate utilities', () => {
  it('should parse valid latitude and longitude values', () => {
    expect(parseCoordinate('12.9716', 'latitude')).toBe(12.9716);
    expect(parseCoordinate('77.5946', 'longitude')).toBe(77.5946);
    expect(parseCoordinate(0, 'latitude')).toBe(0);
    expect(parseCoordinate('0', 'longitude')).toBe(0);
    expect(parseCoordinate('0E-8', 'latitude')).toBe(0);
  });

  it('should reject unavailable or non-finite coordinates', () => {
    expect(parseCoordinate(null, 'latitude')).toBeNull();
    expect(parseCoordinate(undefined, 'longitude')).toBeNull();
    expect(parseCoordinate('', 'latitude')).toBeNull();
    expect(parseCoordinate('   ', 'longitude')).toBeNull();
    expect(parseCoordinate(Number.NaN, 'latitude')).toBeNull();
    expect(parseCoordinate(Number.POSITIVE_INFINITY, 'longitude')).toBeNull();
    expect(parseCoordinate('not-a-number', 'latitude')).toBeNull();
  });

  it('should reject out-of-range coordinates', () => {
    expect(parseCoordinate(-91, 'latitude')).toBeNull();
    expect(parseCoordinate(91, 'latitude')).toBeNull();
    expect(parseCoordinate(-181, 'longitude')).toBeNull();
    expect(parseCoordinate(181, 'longitude')).toBeNull();
  });

  it('should require a valid latitude and longitude pair', () => {
    expect(getCoordinatePair(0, '0')).toEqual([
      0,
      0
    ]);
    expect(hasValidCoordinatePair('12.9716', '77.5946')).toBe(true);
    expect(hasValidCoordinatePair('12.9716', '')).toBe(false);
  });

  it('should normalize only unavailable coordinate fields from address data', () => {
    expect(
      normalizeAddressCoordinates({
        street: 'MG Road',
        latitude: 0,
        longitude: ''
      })
    ).toEqual({
      street: 'MG Road',
      latitude: 0
    });

    expect(hasCoordinateValue('0E-8', 'latitude')).toBe(true);
  });

  it('should remove coordinate fields when coordinate support is disabled', () => {
    expect(
      normalizeAddressCoordinates(
        {
          street: 'MG Road',
          latitude: 0,
          longitude: '77.5946'
        },
        false
      )
    ).toEqual({
      street: 'MG Road'
    });
  });
});
