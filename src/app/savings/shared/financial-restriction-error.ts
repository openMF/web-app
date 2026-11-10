/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Known BE-06 public codes only. Unknown errors stay with each workflow's existing parser. */
const restrictionCodes = new Set([
  'withdrawals.disabled',
  'deposits.disabled',
  'maximum.balance.enforcement.unsupported',
  'maximum.balance.exceeded',
  'freezing.unsupported',
  'purpose.unsupported',
  'interest.unsupported',
  'policy.missing',
  'policy.invalid',
  'policy.not.effective',
  'policy.transition.unsupported',
  'transaction.date.unsupported',
  'activation.unsupported',
  'amount.invalid',
  'operation.unsupported',
  'account.binding.missing',
  'business.date.missing',
  'core.snapshot.changed',
  'currency.mismatch'
]);
export function financialRestrictionError(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const status = (error as { status?: number }).status;
  if (status === 401 || status === 0 || (status != null && status >= 500)) return null;
  let body = (error as { error?: unknown }).error;
  try {
    if (body instanceof ArrayBuffer) body = new TextDecoder().decode(body);
    if (typeof body === 'string') body = JSON.parse(body);
  } catch {
    return null;
  }
  if (!body || typeof body !== 'object') return null;
  const data = body as { userMessageGlobalisationCode?: unknown; errors?: unknown };
  const codes = [
    data.userMessageGlobalisationCode,
    ...(Array.isArray(data.errors)
      ? data.errors.map((item) => (item && typeof item === 'object' ? item.userMessageGlobalisationCode : null))
      : [])
  ];
  const prefix = 'error.msg.savings.product.transaction.';
  for (const code of codes) {
    if (typeof code !== 'string' || !code.startsWith(prefix)) continue;
    const category = code.slice(prefix.length);
    if (restrictionCodes.has(category)) return 'FinancialControls.Errors.' + category;
  }
  return null;
}
