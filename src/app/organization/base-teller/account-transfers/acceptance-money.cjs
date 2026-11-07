/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const assert = require('node:assert/strict');

/** Preserve native balance tokens before JSON.parse can round them. */
function parseAccountResponse(text) {
  return JSON.parse(text.replace(/("accountBalance"\s*:\s*)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, '$1"$2"'));
}

/** Convert decimal text to exact currency minor units, including native exponent notation. */
function toMinorUnits(value, decimalPlaces) {
  assert(typeof value === 'string', 'Balance must be preserved decimal text');
  assert(Number.isSafeInteger(decimalPlaces) && decimalPlaces >= 0, 'Invalid currency precision');
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(value);
  assert(match, 'Invalid balance decimal');
  const fraction = match[3] || '';
  const shift = decimalPlaces + Number(match[4] || 0) - fraction.length;
  assert(Number.isSafeInteger(shift), 'Invalid decimal exponent');
  const units = BigInt(match[2] + fraction) * (match[1] ? -1n : 1n);
  if (shift >= 0) return units * 10n ** BigInt(shift);
  const divisor = 10n ** BigInt(-shift);
  assert.equal(units % divisor, 0n, 'Balance exceeds currency precision');
  return units / divisor;
}

module.exports = { parseAccountResponse, toMinorUnits };
