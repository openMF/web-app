/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Fineract LocalTime arrays and ISO local times have no date or timezone. */
export function normalizeOfficeTime(value: unknown): string {
  let parts: number[];
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isInteger)) {
    parts = value;
  } else if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    parts = value.trim().split(':').map(Number);
  } else {
    return '';
  }

  const [
    hour,
    minute,
    second = 0
  ] = parts;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return '';
  }

  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  // Keep nonzero seconds so editing another weekday cannot truncate saved hours.
  return second === 0 ? time : `${time}:${String(second).padStart(2, '0')}`;
}

export function officeTimeSeconds(value: string): number {
  const [
    hour,
    minute,
    second = 0
  ] = value.split(':').map(Number);
  return hour * 3600 + minute * 60 + second;
}
