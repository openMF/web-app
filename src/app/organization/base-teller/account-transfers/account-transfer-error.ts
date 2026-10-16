/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
export function transferError(error: { status?: number; error?: unknown }): string {
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
  if (codes.includes('insufficient')) return extract('accountTransfer.insufficient');
  if (codes.includes('same.account')) return extract('accountTransfer.sameAccount');
  if (codes.includes('currency')) return extract('accountTransfer.currencyMismatch');
  if (codes.includes('ownership') || codes.includes('source.owner')) return extract('accountTransfer.ownership');
  if (codes.includes('ineligible') || codes.includes('target.')) return extract('accountTransfer.ineligible');
  if (codes.includes('account.lookup') || codes.includes('account.not.found'))
    return extract('accountTransfer.accountNotFound');
  if (codes.includes('client.not.found')) return extract('accountTransfer.noClients');
  if (codes.includes('amount')) return extract('accountTransfer.invalidAmount');
  if (codes.includes('idempotency')) return extract('accountTransfer.duplicate');
  if (codes.includes('operation') || codes.includes('request')) return extract('accountTransfer.unsupported');
  if (error.status === 401 || error.status === 403) return extract('accountTransfer.forbidden');
  if (error.status === 409) return extract('accountTransfer.conflict');
  return extract('accountTransfer.unavailable');
}
