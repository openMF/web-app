/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type CoordinateType = 'latitude' | 'longitude';

export type CoordinatePair = [
  number,
  number
];

const COORDINATE_RANGES: Record<CoordinateType, { min: number; max: number }> = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 }
};

export function parseCoordinate(value: any, type: CoordinateType): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const coordinate = Number(value);
  const range = COORDINATE_RANGES[type];

  if (!Number.isFinite(coordinate) || coordinate < range.min || coordinate > range.max) {
    return null;
  }

  return coordinate;
}

export function hasCoordinateValue(value: any, type: CoordinateType): boolean {
  return parseCoordinate(value, type) !== null;
}

export function getCoordinatePair(latitude: any, longitude: any): CoordinatePair | null {
  const parsedLatitude = parseCoordinate(latitude, 'latitude');
  const parsedLongitude = parseCoordinate(longitude, 'longitude');

  if (parsedLatitude === null || parsedLongitude === null) {
    return null;
  }

  return [
    parsedLatitude,
    parsedLongitude
  ];
}

export function hasValidCoordinatePair(latitude: any, longitude: any): boolean {
  return getCoordinatePair(latitude, longitude) !== null;
}

export function normalizeAddressCoordinates<T extends Record<string, any>>(
  addressData: T,
  coordinatesEnabled = true
): T {
  const normalizedAddressData = { ...addressData };

  if (!coordinatesEnabled || !hasCoordinateValue(normalizedAddressData.latitude, 'latitude')) {
    delete normalizedAddressData.latitude;
  }

  if (!coordinatesEnabled || !hasCoordinateValue(normalizedAddressData.longitude, 'longitude')) {
    delete normalizedAddressData.longitude;
  }

  return normalizedAddressData;
}
