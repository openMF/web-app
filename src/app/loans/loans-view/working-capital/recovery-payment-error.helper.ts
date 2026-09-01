/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

/**
 * Validation codes the recovery payment and the generic undo commands return,
 * mapped to translation keys.
 *
 * `cannot.be.before.write.off.date` is mapped even though the backend does not
 * emit it yet: the date floor is expected to move from "last transaction" to
 * "write-off date", and having both entries means that change needs no UI work.
 */
const RECOVERY_PAYMENT_ERROR_KEYS: Record<string, string> = {
  'error.msg.wc.loan.is.not.written.off': 'errors.recoveryPayment.loanNotWrittenOff',
  'cannot.be.greater.than.remaining.written.off.amount': 'errors.recoveryPayment.greaterThanRemaining',
  'cannot.undo.write.off.with.recovery.payments': 'errors.recoveryPayment.undoWriteOffWithRecoveries',
  'cannot.be.before.last.transaction.date': 'errors.recoveryPayment.beforeLastTransactionDate',
  'cannot.be.before.write.off.date': 'errors.recoveryPayment.beforeWriteOffDate',
  'transaction.already.undone': 'errors.recoveryPayment.alreadyUndone',
  'cannot.be.a.future.date': 'errors.recoveryPayment.futureDate'
};

/** Text-bearing fields a Fineract error carries, at the top level or nested. */
interface FineractErrorEntry {
  userMessageGlobalisationCode?: string;
  defaultUserMessage?: string;
  developerMessage?: string;
}

/** Body of a failed Fineract request. */
interface FineractErrorBody extends FineractErrorEntry {
  errors?: FineractErrorEntry[];
}

/**
 * Collects every text-bearing field of a Fineract error payload.
 *
 * The validation code shows up in a different field depending on how the
 * backend wraps the failure, so all of them are scanned rather than betting on
 * one shape.
 */
function errorHaystack(body: FineractErrorBody): string {
  return [
    body.defaultUserMessage,
    body.developerMessage,
    body.userMessageGlobalisationCode,
    ...(Array.isArray(body.errors)
      ? body.errors.flatMap((item) => [
          item?.userMessageGlobalisationCode,
          item?.defaultUserMessage,
          item?.developerMessage
        ])
      : [])
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');
}

/** Translated alert to raise for a recognised recovery payment failure. */
export interface RecoveryPaymentErrorAlert {
  type: string;
  message: string;
}

/**
 * Maps a failed recovery payment or reversal to a translated alert.
 *
 * HTTP 403 gets its own message because the generic undo command is authorized
 * with a permission that is derived at runtime and is not seeded in
 * m_permission, so every Working Capital reversal fails for anyone other than a
 * user holding ALL_FUNCTIONS. Returns null when the error is not recognised, so
 * callers can fall back to the generic error handling.
 * @param error Failed HTTP response
 * @param translate Translation service
 * @returns Alert to show, or null when the error is not recognised
 */
export function resolveRecoveryPaymentErrorMessage(
  error: unknown,
  translate: TranslateService
): RecoveryPaymentErrorAlert | null {
  const response = error as HttpErrorResponse;
  // The body is whatever the server returned; only the fields declared above
  // are read, and each one is checked before use.
  const body: FineractErrorBody | null = response?.error ?? null;
  if (body) {
    const haystack = errorHaystack(body);
    // Longest codes first: several of them share a prefix with a shorter one.
    const match = Object.keys(RECOVERY_PAYMENT_ERROR_KEYS)
      .sort((a, b) => b.length - a.length)
      .find((code) => haystack.includes(code));
    if (match) {
      const message = translateOrNull(translate, RECOVERY_PAYMENT_ERROR_KEYS[match]);
      return message ? { type: translate.instant('errors.error.bad.request.type'), message } : null;
    }
  }
  if (response?.status === 403) {
    const message = translateOrNull(translate, 'errors.recoveryPayment.reversalForbidden');
    return message ? { type: translate.instant('errors.error.unauthorized.type'), message } : null;
  }
  return null;
}

/** Returns the translation, or null when the key has no entry. */
function translateOrNull(translate: TranslateService, key: string): string | null {
  const translated = translate.instant(key);
  return translated !== key ? translated : null;
}
