/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';

export function pickupError(error: { status?: number; error?: unknown }): string {
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
  if (codes.includes('authorization.')) return extract('cashPickup.invalidAuthorization');
  if (codes.includes('inventory.')) return extract('cashPickup.insufficient');
  if (codes.includes('check.')) return extract('cashPickup.staleChecks');
  if (codes.includes('destination.')) return extract('cashPickup.invalidDestination');
  if (codes.includes('source.')) return extract('cashPickup.invalidSource');
  if (codes.includes('idempotency.')) return extract('cashPickup.duplicate');
  if (error.status === 403) return extract('cashPickup.forbidden');
  if (error.status === 409) return extract('cashPickup.conflict');
  return extract('cashPickup.unavailable');
}
