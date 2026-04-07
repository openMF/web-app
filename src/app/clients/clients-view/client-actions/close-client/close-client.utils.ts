/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Form values submitted by the close client form.
 * Allows flexibility in closureDate type (Date object or pre-formatted string).
 */
export interface CloseClientFormValue {
  closureDate: Date | string;
  closureReasonId: number | string;
  [key: string]: unknown;
}

/**
 * Validated payload structure sent to the Apache Fineract API.
 * All date values are guaranteed to be properly formatted strings.
 */
export interface CloseClientPayload {
  closureDate: string;
  closureReasonId: number;
  dateFormat: string;
  locale: string;
  [key: string]: unknown;
}

/**
 * Type guard to validate if a value is a valid Date object.
 * Rejects invalid Date instances (e.g., `new Date('invalid')`).
 *
 * @param value - The value to check
 * @returns True if value is a valid Date object with a valid time value
 * @example
 * const date = new Date('2025-03-24');
 * if (isValidDate(date)) {
 *   // safely use date
 * }
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Validates if a string represents a valid date.
 * Rejects malformed date strings like "not-a-date" or whitespace-only strings.
 *
 * @param dateString - The string to validate as a date
 * @returns True if the string can be parsed into a valid date
 * @example
 * isValidDateString('2025-03-24') // true
 * isValidDateString('not-a-date') // false
 * isValidDateString('   ') // false
 */
function isValidDateString(dateString: string): boolean {
  const trimmed = dateString.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // Try to parse as Date - if it results in Invalid Date, reject it
  const parsedDate = new Date(trimmed);
  return !Number.isNaN(parsedDate.getTime());
}

/**
 * Builds a validated payload for the close client API request.
 *
 * Ensures the closureDate is properly formatted as a string:
 * - Valid Date objects are formatted using the provided dateUtils
 * - String values are passed through (assumes pre-formatted)
 * - Invalid types throw a TypeError for early error detection
 *
 * @param formValue - The form data from the close client form
 * @param dateUtils - Utility object with formatDate function
 * @param locale - ISO locale code (e.g., 'en', 'fr')
 * @param dateFormat - Date format pattern (e.g., 'dd MMMM yyyy')
 * @returns Validated payload ready for API submission
 * @throws {TypeError} If closureDate is not a valid Date or string
 * @example
 * const payload = buildCloseClientPayload(
 *   { closureDate: new Date(2025, 10, 3), closureReasonId: 1 },
 *   dateUtils,
 *   'en',
 *   'dd MMMM yyyy'
 * );
 */
export function buildCloseClientPayload(
  formValue: CloseClientFormValue,
  dateUtils: { formatDate: (date: Date, format: string) => string },
  locale: string,
  dateFormat: string
): CloseClientPayload {
  const closureReasonId =
    typeof formValue.closureReasonId === 'string' ? Number(formValue.closureReasonId) : formValue.closureReasonId;

  validateClosureReasonId(closureReasonId);

  let closureDate: string;

  if (isValidDate(formValue.closureDate)) {
    closureDate = dateUtils.formatDate(formValue.closureDate, dateFormat);
  } else if (typeof formValue.closureDate === 'string' && isValidDateString(formValue.closureDate)) {
    closureDate = formValue.closureDate.trim();
  } else {
    throw new TypeError(
      `Invalid closureDate: received ${typeof formValue.closureDate} with value "${formValue.closureDate}". Expected a valid Date or valid date string.`
    );
  }

  return {
    ...formValue,
    closureDate,
    closureReasonId,
    dateFormat,
    locale
  };
}

/**
 * Validates that closureReasonId is a positive integer.
 *
 * @param closureReasonId - The closure reason ID to validate
 * @throws {TypeError} If closureReasonId is not a valid positive integer
 * @internal
 */
function validateClosureReasonId(closureReasonId: number): void {
  if (!Number.isInteger(closureReasonId) || closureReasonId <= 0) {
    throw new TypeError(`Invalid closureReasonId: expected a positive integer, received ${closureReasonId}`);
  }
}
