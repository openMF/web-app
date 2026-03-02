/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NativeDateAdapter } from '@angular/material/core';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Determines the order of date components (day, month, year) from an Angular date format string.
 *
 * Returns an array of component identifiers in the order they appear in the format.
 * Each identifier is one of: 'day', 'month', 'year'.
 *
 * @param format Angular date format string (e.g., 'dd MMMM yyyy', 'MM-dd-yy', 'yyyy-MM-dd')
 * @returns Array of component identifiers in order, e.g. ['day', 'month', 'year']
 */
function getComponentOrder(format: string): string[] {
  const components: { type: string; index: number }[] = [];

  // Find the first occurrence of day, month, and year tokens
  const dayIndex = format.search(/d/i);
  const monthIndex = format.search(/M/);
  const yearIndex = format.search(/y/i);

  if (dayIndex >= 0) {
    components.push({ type: 'day', index: dayIndex });
  }
  if (monthIndex >= 0) {
    components.push({ type: 'month', index: monthIndex });
  }
  if (yearIndex >= 0) {
    components.push({ type: 'year', index: yearIndex });
  }

  // Sort by position in the format string
  components.sort((a, b) => a.index - b.index);

  return components.map((c) => c.type);
}

/**
 * Determines if the configured date format uses a 2-digit year (e.g., 'yy') vs 4-digit year (e.g., 'yyyy').
 *
 * @param format Angular date format string
 * @returns true if the format uses a short (2-digit) year
 */
function usesShortYear(format: string): boolean {
  // Count consecutive 'y' characters
  const match = format.match(/y+/i);
  return match ? match[0].length <= 2 : false;
}

/**
 * Custom DateAdapter that extends NativeDateAdapter to support compact numeric date input.
 *
 * When a user types a purely numeric string (e.g., '08042002' or '080402') into a date picker,
 * this adapter parses it according to the globally configured date format from SettingsService.
 *
 * Supported compact formats:
 * - 8 digits with 4-digit year (e.g., 08042002 for dd-MM-yyyy → April 8, 2002)
 * - 6 digits with 2-digit year (e.g., 080402 for dd-MM-yy → April 8, 2002)
 *
 * The component order (day/month/year) is derived from the user's configured date format,
 * so no hardcoded format is introduced.
 */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  private settingsService = inject(SettingsService);

  /**
   * Formats a date according to the user's configured date format from SettingsService.
   * This overrides the NativeDateAdapter's default format which uses the browser locale.
   */
  override format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('CustomDateAdapter: Cannot format invalid date.');
    }

    const dateFormat = this.settingsService.dateFormat;
    const langCode = this.settingsService.language?.code || 'en';

    try {
      const datePipe = new DatePipe(langCode);
      const formatted = datePipe.transform(date, dateFormat);
      if (formatted) {
        return formatted;
      }
    } catch (e) {
      // Fall back to native formatting if DatePipe fails
    }

    return super.format(date, displayFormat);
  }

  override parse(value: any): Date | null {
    // If value is already a number (timestamp), let the parent handle it
    if (typeof value === 'number') {
      return super.parse(value);
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return super.parse(value);
    }

    const trimmed = value.trim();

    // 1. Purely numeric input (compact format like "06042006" or "060406")
    //    Must be handled BEFORE native parsing — Date.parse() misinterprets numeric strings as years.
    if (/^\d+$/.test(trimmed)) {
      const compactResult = this.parseCompactNumeric(trimmed);
      if (compactResult) {
        return compactResult;
      }
      return null;
    }

    // 2. Numeric input with separators (e.g., "06 04 2006", "06-04-2006", "06/04/2006")
    //    Must be handled BEFORE native parsing — Date.parse() uses browser locale (US: MM/DD/YYYY)
    //    which may not match the user's configured format.
    if (this.isNumericWithSeparators(trimmed)) {
      const separatedResult = this.parseSeparatedNumeric(trimmed);
      if (separatedResult) {
        return separatedResult;
      }
      // Fall through to native parsing if separated parsing fails
    }

    // 3. Non-numeric input (contains letters, e.g., "April 6, 2006", "6 April 2006")
    //    Let the native parser handle these.
    const nativeResult = super.parse(value);
    if (nativeResult && !isNaN(nativeResult.getTime())) {
      return nativeResult;
    }

    return nativeResult;
  }

  /**
   * Checks if the input consists only of digits and common date separators (no letters).
   * Examples: "06 04 2006", "06-04-2006", "06/04/2006", "06.04.2006"
   */
  private isNumericWithSeparators(value: string): boolean {
    // Must contain at least one separator and at least one digit
    return /\d/.test(value) && /^[\d\s\-\/\.]+$/.test(value) && /[\s\-\/\.]/.test(value);
  }

  /**
   * Parses a separator-based numeric date string (e.g., "06 04 2006", "06-04-2006")
   * according to the configured date format's component order.
   *
   * @param value A string of digits separated by spaces, dashes, slashes, or dots
   * @returns A valid Date object, or null if parsing fails
   */
  private parseSeparatedNumeric(value: string): Date | null {
    // Split by common date separators
    const parts = value.split(/[\s\-\/\.]+/).filter((p) => p.length > 0);

    // Expect exactly 3 parts (day, month, year)
    if (parts.length !== 3) {
      return null;
    }

    // All parts must be numeric
    if (!parts.every((p) => /^\d+$/.test(p))) {
      return null;
    }

    const dateFormat = this.settingsService.dateFormat;
    const order = getComponentOrder(dateFormat);
    const shortYear = usesShortYear(dateFormat);

    let day = 0;
    let month = 0;
    let year = 0;

    for (let i = 0; i < order.length; i++) {
      const num = parseInt(parts[i], 10);
      switch (order[i]) {
        case 'day':
          day = num;
          break;
        case 'month':
          month = num;
          break;
        case 'year':
          year = num;
          break;
      }
    }

    // Handle 2-digit year
    if (shortYear || (year >= 0 && year <= 99 && parts[order.indexOf('year')]?.length <= 2)) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }

    // Validate
    if (month < 1 || month > 12) {
      return null;
    }
    if (day < 1 || day > 31) {
      return null;
    }
    if (year < 1) {
      return null;
    }

    const date = this.createDate(year, month - 1, day);

    // Verify the date components match (catches invalid dates like Feb 31)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  }

  /**
   * Parses a compact numeric string (all digits, no separators) into a Date
   * based on the configured date format from SettingsService.
   *
   * @param digits A string of only digits (e.g., '08042002' or '080402')
   * @returns A valid Date object, or null if parsing fails
   */
  private parseCompactNumeric(digits: string): Date | null {
    const dateFormat = this.settingsService.dateFormat;
    const order = getComponentOrder(dateFormat);
    const shortYear = usesShortYear(dateFormat);

    // Determine expected digit length
    const expectedLength = shortYear ? 6 : 8;

    if (digits.length !== expectedLength) {
      // Also try to handle 8 digits even if format says short year, and vice versa
      if (digits.length === 8) {
        return this.extractDate(digits, order, false);
      } else if (digits.length === 6) {
        return this.extractDate(digits, order, true);
      }
      return null;
    }

    return this.extractDate(digits, order, shortYear);
  }

  /**
   * Extracts day, month, year from a digit string based on component order and year length.
   *
   * @param digits The digit string
   * @param order Array of component identifiers in order (e.g., ['day', 'month', 'year'])
   * @param shortYear Whether to use 2-digit year parsing
   * @returns A valid Date object, or null if the extracted values are invalid
   */
  private extractDate(digits: string, order: string[], shortYear: boolean): Date | null {
    const yearLen = shortYear ? 2 : 4;
    let pos = 0;
    let day = 0;
    let month = 0;
    let year = 0;

    for (const component of order) {
      switch (component) {
        case 'day': {
          day = parseInt(digits.substring(pos, pos + 2), 10);
          pos += 2;
          break;
        }
        case 'month': {
          month = parseInt(digits.substring(pos, pos + 2), 10);
          pos += 2;
          break;
        }
        case 'year': {
          year = parseInt(digits.substring(pos, pos + yearLen), 10);
          pos += yearLen;
          break;
        }
      }
    }

    // Handle 2-digit year: assume 00-49 → 2000-2049, 50-99 → 1950-1999
    if (shortYear) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }

    // Validate the extracted values
    if (month < 1 || month > 12) {
      return null;
    }
    if (day < 1 || day > 31) {
      return null;
    }
    if (year < 1) {
      return null;
    }

    // Create the date and validate it (e.g., Feb 30 should be invalid)
    const date = this.createDate(year, month - 1, day);

    // Verify the date components match what we extracted (catches invalid dates like Feb 31)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  }
}
