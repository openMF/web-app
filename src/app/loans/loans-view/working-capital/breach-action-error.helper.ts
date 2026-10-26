/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

const BREACH_ACTION_ERROR_PREFIX = 'error.msg.workingCapitalLoanBreachAction.';

/**
 * Maps a failed breach-action command (reset / undo_reset) to a translated,
 * user-friendly message. The backend reports domain-rule violations as HTTP 400
 * with a `userMessageGlobalisationCode` (top level or inside `errors[]`); every
 * code under the breach-action prefix has an entry in the `errors` section of
 * the translation files. Returns null when the error is not a breach-action
 * domain error or no translation exists, so callers can fall back to the
 * generic handling done by the error interceptor.
 */
export function resolveBreachActionErrorMessage(error: unknown, translate: TranslateService): string | null {
  const body = (error as HttpErrorResponse)?.error;
  const code: string | undefined =
    body?.errors?.[0]?.userMessageGlobalisationCode ?? body?.userMessageGlobalisationCode;
  if (!code || !code.startsWith(BREACH_ACTION_ERROR_PREFIX)) {
    return null;
  }
  const key = `errors.${code}`;
  const translated = translate.instant(key);
  return translated !== key ? translated : null;
}
