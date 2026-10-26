/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Serializes a datepicker value for Fineract's MakerCheckerRequest.
 * The API parses `dd MMMM yyyy` with Locale.ENGLISH and applies the
 * appropriate start/end-of-day boundary itself.
 */
export function serializeMakerCheckerDate(value: unknown): string | undefined {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return undefined;
  }

  return `${String(value.getDate()).padStart(2, '0')} ${ENGLISH_MONTH_NAMES[value.getMonth()]} ${String(value.getFullYear()).padStart(4, '0')}`;
}
