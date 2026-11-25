/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { FormControl } from '@angular/forms';

import {
  coordinateValidator,
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

  it.each([
    true,
    false,
    [],
    [0],
    {},
    [
      1,
      2
    ]
  ])('rejects nonnumeric JSON coordinate %p', (value) => {
    expect(parseCoordinate(value, 'latitude')).toBeNull();
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
  it.each([
    '28.6139123456789',
    '-77.2090123456789',
    '0',
    '0E-8',
    '2.86139e1',
    '.5',
    '-.5',
    '',
    '   ',
    null,
    undefined
  ])('accepts optional decimal coordinate input %s without rewriting it', (value) => {
    const control = new FormControl(value, coordinateValidator('latitude'));
    expect(control.valid).toBe(true);
    expect(control.value).toBe(value === undefined ? null : value);
  });

  it.each([
    'abc',
    '12junk',
    'NaN',
    'Infinity',
    '0x10',
    '1e',
    '1,5',
    true,
    {},
    91,
    -91
  ])('rejects invalid latitude input %s', (value) => {
    expect(coordinateValidator('latitude')(new FormControl(value))).toEqual({ invalidNumber: true });
  });

  it('respects independently disabled backend fields without mutating address metadata or decimal strings', () => {
    const data = {
      addressId: 11,
      street: 'Synthetic Street',
      createdBy: 'fixture',
      latitude: '28.6139123456789',
      longitude: '77.2090123456789'
    };
    expect(normalizeAddressCoordinates(data, true, { latitude: true, longitude: false })).toEqual({
      addressId: 11,
      street: 'Synthetic Street',
      createdBy: 'fixture',
      latitude: '28.6139123456789'
    });
    expect(data.longitude).toBe('77.2090123456789');
    expect(normalizeAddressCoordinates(data, true, { latitude: false, longitude: false })).toEqual({
      addressId: 11,
      street: 'Synthetic Street',
      createdBy: 'fixture'
    });
  });
  it.each([
    'latitude',
    'longitude'
  ] as const)('requires nonblank %s only when configured as mandatory', (coordinate) => {
    for (const blank of [
      null,
      undefined,
      '',
      '   ',
      '\t\n',
      '\u00a0'
    ]) {
      const control = new FormControl(blank);
      expect(coordinateValidator(coordinate, true)(control)).toEqual({ required: true });
      expect(coordinateValidator(coordinate, false)(control)).toBeNull();
    }
    for (const value of [
      0,
      '0',
      '0E-8',
      '-28.6139123456789',
      '2.86139e1'
    ]) {
      const control = new FormControl(value);
      expect(coordinateValidator(coordinate, true)(control)).toBeNull();
      expect(control.value).toBe(value);
    }
  });
});
