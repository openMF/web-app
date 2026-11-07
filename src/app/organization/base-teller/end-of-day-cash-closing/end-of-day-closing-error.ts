/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
/** Only allowlisted messages reach the UI; never echo backend payloads or credentials. */
export function closingError(error: { status?: number; error?: unknown }): string {
  let body = error.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const data = body as {
    userMessageGlobalisationCode?: string;
    errors?: { userMessageGlobalisationCode?: string }[];
  } | null;
  const codes = [
    data?.userMessageGlobalisationCode,
    ...(data?.errors ?? []).map((e) => e.userMessageGlobalisationCode)
  ].join(' ');
  if (codes.includes('authorization.')) return extract('eod.invalidAuthorization');
  if (codes.includes('already.closed')) return extract('eod.alreadyClosed');
  if (codes.includes('check.')) return extract('eod.checkChanged');
  if (codes.includes('denomination.') || codes.includes('quantity.') || codes.includes('amount.'))
    return extract('eod.invalidDeclaration');
  if (error.status === 409 || codes.includes('idempotency.') || codes.includes('date.') || codes.includes('custody.'))
    return extract('eod.conflict');
  if (error.status === 401) return extract('errors.error.auth.sessionExpired.message');
  if (error.status === 403) return extract('eod.forbidden');
  if (error.status === 0) return extract('eod.network');
  return extract('eod.failed');
}
