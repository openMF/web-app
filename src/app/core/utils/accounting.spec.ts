/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Accounting } from './accounting';

describe('Accounting', () => {
  const accounting = new Accounting();

  it('names the accrual periodic rule returned by getAccountingRuleFrom', () => {
    const rule = accounting.getAccountingRuleFrom(3);
    expect(accounting.getAccountRuleName(rule.value.toUpperCase())).toBe('Accrual (periodic)');
  });
  it('names the accrual upfront rule returned by getAccountingRuleFrom', () => {
    const rule = accounting.getAccountingRuleFrom(4);
    expect(accounting.getAccountRuleName(rule.value.toUpperCase())).toBe('Accrual (upfront)');
  });
});
