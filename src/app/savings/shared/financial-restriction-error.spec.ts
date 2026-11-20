/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { financialRestrictionError } from './financial-restriction-error';
import { withdrawalError } from 'app/organization/base-teller/withdrawals/withdrawal-error';
import { transferError } from 'app/organization/base-teller/account-transfers/account-transfer-error';

describe('BE-06 financial restriction errors', () => {
  const code = 'error.msg.savings.product.transaction.withdrawals.disabled';
  it.each([
    400,
    403,
    409,
    422
  ])('keeps policy rejections separate from authorization (HTTP %s)', (status) => {
    const response = { status, error: { errors: [{ userMessageGlobalisationCode: code }] } };
    expect(financialRestrictionError(response)).toBe('FinancialControls.Errors.withdrawals.disabled');
    expect(withdrawalError(response)).toBe('FinancialControls.Errors.withdrawals.disabled');
    expect(transferError(response)).toBe('FinancialControls.Errors.withdrawals.disabled');
  });
  it.each([
    'withdrawals.disabled',
    'deposits.disabled',
    'maximum.balance.enforcement.unsupported',
    'freezing.unsupported',
    'purpose.unsupported',
    'policy.missing',
    'policy.invalid',
    'transaction.date.unsupported',
    'activation.unsupported'
  ])('maps exact public category %s', (category) => {
    expect(
      financialRestrictionError({
        status: 400,
        error: JSON.stringify({ userMessageGlobalisationCode: 'error.msg.savings.product.transaction.' + category })
      })
    ).toBe('FinancialControls.Errors.' + category);
  });
  it.each([
    undefined,
    null,
    '',
    'java.lang.PrivateStackTrace',
    { errors: 'bad' },
    { errors: [
        null,
        1,
        {}
      ] },
    { userMessageGlobalisationCode: 'unknown' }
  ])('leaves malformed or unknown bodies to existing handlers (%s)', (error) => {
    expect(financialRestrictionError({ status: 400, error })).toBeNull();
  });
  it.each([
    401,
    0,
    500
  ])('preserves network and authentication failure handling (%s)', (status) => {
    expect(financialRestrictionError({ status, error: { userMessageGlobalisationCode: code } })).toBeNull();
  });
  it('does not infer product restrictions from a generic forbidden error', () => {
    expect(withdrawalError({ status: 403 })).toBe('withdrawal.forbidden');
    expect(financialRestrictionError({ status: 403, error: { defaultUserMessage: code } })).toBeNull();
  });
});
