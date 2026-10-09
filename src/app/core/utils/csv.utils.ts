/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Sanitizes a value for safe inclusion in a CSV file to prevent CSV injection (formula injection) attacks.
 *
 * Spreadsheet applications (Excel, LibreOffice, etc.) may execute cell values that begin
 * with formula trigger characters (=, +, -, @, |, %) as formulas, enabling data exfiltration
 * or arbitrary command execution on the client machine.
 *
 * This function prefixes such values with a single quote (') to force plain-text treatment
 * in all major spreadsheet applications, per OWASP CSV Injection prevention guidance.
 *
 * @param {any} value The raw cell value to sanitize.
 * @returns {string} The sanitized string value safe for CSV output.
 */
export function sanitizeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // Prefix formula-injection trigger characters with a single quote so spreadsheets
  // treat the value as plain text rather than a formula.
  if (/^[=+\-@|%\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
