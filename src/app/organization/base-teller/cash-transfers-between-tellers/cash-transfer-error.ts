/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
const TRANSFER_ERROR_NAMESPACE = 'error.msg.base.teller.cash.transfer.';

function transferErrorCodes(error: { error?: unknown }): string[] {
  let body = error.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return [];
    }
  }
  const data = body as
    | { userMessageGlobalisationCode?: unknown; errors?: { userMessageGlobalisationCode?: unknown }[] }
    | null
    | undefined;
  return [
    data?.userMessageGlobalisationCode,
    ...(Array.isArray(data?.errors) ? data.errors.map((item) => item?.userMessageGlobalisationCode) : [])
  ]
    .filter((code): code is string => typeof code === 'string' && code.startsWith(TRANSFER_ERROR_NAMESPACE))
    .map((code) => code.slice(TRANSFER_ERROR_NAMESPACE.length));
}

export function hasCashTransferError(error: { error?: unknown }, code: string): boolean {
  return transferErrorCodes(error).includes(code);
}

export function cashTransferError(error: { status?: number; error?: unknown }): string {
  const codes = transferErrorCodes(error);
  const hasFamily = (family: string) => codes.some((code) => code.startsWith(family + '.'));
  if (codes.includes('source.assignment')) return extract('cashTellerTransfer.sourceAssignmentRequired');
  if (codes.includes('source.forbidden')) return extract('cashTellerTransfer.staffAssignmentRequired');
  if (hasFamily('source')) return extract('cashTellerTransfer.invalidSource');
  if (hasFamily('destination')) return extract('cashTellerTransfer.invalidDestination');
  if (codes.includes('inventory.insufficient')) return extract('cashTellerTransfer.insufficient');
  if (hasFamily('inventory')) return extract('cashTellerTransfer.stale');
  if (hasFamily('idempotency')) return extract('cashTellerTransfer.duplicate');
  if (hasFamily('denomination') || hasFamily('currency')) return extract('cashTellerTransfer.configuration');
  if ([
      'quantity',
      'request',
      'selection',
      'amount'
    ].some(hasFamily)) return extract('cashTellerTransfer.invalidQuantity');
  if (error.status === 401 || error.status === 403) return extract('cashTellerTransfer.forbidden');
  if (error.status === 409) return extract('cashTellerTransfer.stale');
  return extract('cashTellerTransfer.unavailable');
}
