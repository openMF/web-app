/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';
import NepaliDate from 'nepali-date-converter';

const BS_MONTHS = [
  'Baishakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra'
];

/**
 * Converts an AD date (from the Mifos API) to a Nepali BS date string.
 *
 * Accepts:
 *   number[]  – API tuple [year, month, day] with 1-indexed month
 *   Date      – JS Date object
 *   string    – ISO or locale date string
 *
 * Returns "D MonthName YYYY" (e.g. "12 Shrawan 2056") or '' if conversion fails.
 */
@Pipe({ name: 'adToBs', standalone: true, pure: true })
export class AdToBsPipe implements PipeTransform {
  transform(value: number[] | Date | string | null | undefined): string {
    if (!value) return '';
    try {
      let jsDate: Date;

      if (Array.isArray(value)) {
        // API format: [year, month(1-indexed), day]
        jsDate = new Date(value[0], value[1] - 1, value[2]);
      } else if (value instanceof Date) {
        jsDate = value;
      } else {
        jsDate = new Date(value);
      }

      if (isNaN(jsDate.getTime())) return '';

      const nd = new NepaliDate(jsDate);
      return `${nd.getDate()} ${BS_MONTHS[nd.getMonth()]} ${nd.getYear()}`;
    } catch {
      return '';
    }
  }
}
