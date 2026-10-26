/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';

/**
 * Validation codes the breach-actions resource returns as
 * "Failed data validation due to: <code>", mapped to translation keys.
 */
const BREACH_ERROR_KEYS: Record<string, string> = {
  'breach.already.disabled': 'errors.breach.alreadyDisabled',
  'no.active.breach.disable.to.enable': 'errors.breach.noActiveDisableToEnable',
  'must.be.current.business.date': 'errors.breach.mustBeCurrentBusinessDate',
  'must.not.be.provided.for.disable.or.enable': 'errors.breach.endDateNotAllowed',
  'no.breach.configuration': 'errors.breach.noBreachConfiguration',
  'loan.is.not.active': 'errors.breach.loanIsNotActive',
  'breach.is.disabled': 'errors.breach.breachIsDisabled'
};

/**
 * Resolves the translation key for a breach validation error.
 *
 * The code shows up in different places depending on how the backend wraps the
 * failure, so every text-bearing field of the payload is scanned rather than
 * relying on one shape. Returns null when the error is not a known breach
 * validation, letting the caller fall back to the generic handler.
 * @param error Failed HTTP response
 * @returns Translation key, or null when the error is not recognised
 */
export function resolveBreachErrorKey(error: HttpErrorResponse): string | null {
  const body = error?.error;
  if (!body) {
    return null;
  }
  const haystack = [
    body.defaultUserMessage,
    body.developerMessage,
    body.userMessageGlobalisationCode,
    ...(Array.isArray(body.errors)
      ? body.errors.flatMap((item: any) => [
          item?.userMessageGlobalisationCode,
          item?.defaultUserMessage,
          item?.developerMessage
        ])
      : [])
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

  // Longest codes first: several of them share a prefix with a shorter one.
  const match = Object.keys(BREACH_ERROR_KEYS)
    .sort((a, b) => b.length - a.length)
    .find((code) => haystack.includes(code));
  return match ? BREACH_ERROR_KEYS[match] : null;
}
