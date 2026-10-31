/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
const errors: Record<string, string> = {
  'cashier.required': extract('fx.drawerRequired'),
  'cashier.assignment': extract('fx.drawerRequired'),
  'branch.forbidden': extract('fx.branchForbidden'),
  'office.required': extract('fx.branchForbidden'),
  'version.conflict': extract('fx.stale'),
  'preview.stale': extract('fx.stale'),
  'rate.stale': extract('fx.stale'),
  'rate.context': extract('fx.stale'),
  'rate.not.found': extract('fx.notFound'),
  'operation.unsupported': extract('fx.executionUnavailable'),
  'identification.required': extract('fx.identificationInvalid'),
  'identification.invalid': extract('fx.identificationInvalid'),
  'customer.inactive': extract('fx.customerInvalid'),
  'customer.not.found': extract('fx.customerInvalid'),
  'inventory.insufficient': extract('fx.inventoryInsufficient'),
  'inventory.overflow': extract('fx.invalidCash')
};
export function fxError(error: { status?: number; error?: unknown; name?: string }): string {
  if (error.name === 'TimeoutError') return extract('fx.timeout');
  if (error.status === 401) return extract('fx.unauthenticated');
  if (error.status && error.status >= 500) return extract('fx.unavailable');
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
  ];
  for (const code of codes) {
    if (!code?.startsWith('error.msg.base.teller.fx.')) continue;
    const suffix = code.slice('error.msg.base.teller.fx.'.length);
    if (errors[suffix]) return errors[suffix];
    if (/^(quantity|denomination)/.test(suffix)) return extract('fx.invalidCash');
    if (suffix.startsWith('currency.')) return extract('fx.currencyInvalid');
    return extract('fx.invalidRequest');
  }
  if (error.status === 403) return extract('fx.forbidden');
  if (error.status === 404) return extract('fx.notFound');
  if (error.status === 409) return extract('fx.stale');
  if (error.status === 400 || error.status === 422) return extract('fx.invalidRequest');
  return extract('fx.unavailable');
}
