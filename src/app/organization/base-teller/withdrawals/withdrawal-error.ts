/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
export function withdrawalError(error: { status?: number; error?: unknown }): string {
  let body = error.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = undefined;
    }
  }
  const data = body as
    { userMessageGlobalisationCode?: string; errors?: { userMessageGlobalisationCode?: string }[] } | undefined;
  const codes = [
    data?.userMessageGlobalisationCode,
    ...(Array.isArray(data?.errors) ? data.errors.map((e) => e.userMessageGlobalisationCode) : [])
  ].join(' ');
  if (codes.includes('funds.insufficient')) return extract('withdrawal.insufficientFunds');
  if (codes.includes('inventory.insufficient')) return extract('withdrawal.insufficientCash');
  if (codes.includes('identification')) return extract('withdrawal.invalidIdentification');
  if (codes.includes('check.unsupported')) return extract('withdrawal.checkUnavailable');
  if (codes.includes('denomination') || codes.includes('quantity')) return extract('withdrawal.invalidCash');
  if (codes.includes('account') || codes.includes('customer')) return extract('withdrawal.ineligible');
  if (codes.includes('source.') || codes.includes('office.')) return extract('withdrawal.drawerRequired');
  if (codes.includes('idempotency')) return extract('withdrawal.keyConflict');
  if (codes.includes('amount')) return extract('withdrawal.invalidAmount');
  if (codes.includes('payment.type')) return extract('withdrawal.paymentRequired');
  if (codes.includes('maker.checker') || codes.includes('posting.')) return extract('withdrawal.postingUnavailable');
  if (error.status === 401 || error.status === 403) return extract('withdrawal.forbidden');
  if (error.status === 409) return extract('withdrawal.conflict');
  return extract('withdrawal.unavailable');
}
