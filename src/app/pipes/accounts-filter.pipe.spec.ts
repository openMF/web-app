/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AccountsFilterPipe } from './accounts-filter.pipe';

describe('AccountsFilterPipe deposit accounts', () => {
  const pipe = new AccountsFilterPipe();
  const account = (id: number, state: string, type = 'Fixed Deposit') => ({
    id,
    productName: 'INVERSION TOTAL',
    depositType: { value: type },
    status: { code: `savingsAccountStatusType.${state}` }
  });

  it('preserves distinct IDs, response ordering and original objects for every eligible FD state', () => {
    const accounts = [
      'submitted.and.pending.approval',
      'approved',
      'active',
      'matured'
    ].map((s, i) => Object.freeze(account(i + 1, s)));
    Object.freeze(accounts);
    const result = pipe.transform(accounts, 'saving', 'open', 'isFixed');
    expect(result.map((a: any) => a.id)).toEqual([
      1,
      2,
      3,
      4
    ]);
    result.forEach((a: any, i: number) => expect(a).toBe(accounts[i]));
    expect(accounts).toHaveLength(4);
  });

  it('keeps closed, premature, withdrawn and rejected records in the closed subset', () => {
    const accounts = [
      'active',
      'closed',
      'pre.mature.closure',
      'withdrawn.by.applicant',
      'rejected'
    ].map((s, i) => account(i + 1, s));
    expect(pipe.transform(accounts, 'saving', 'open', 'isFixed').map((a: any) => a.id)).toEqual([1]);
    expect(pipe.transform(accounts, 'saving', 'closed', 'isFixed').map((a: any) => a.id)).toEqual([
      2,
      3,
      4,
      5
    ]);
  });

  it.each([
    [
      'isFixed',
      1
    ],
    [
      'isSavings',
      2
    ],
    [
      'isRecurring',
      3
    ]
  ])('classifies %s using depositType rather than product name or account status', (type, id) => {
    const accounts = [
      account(1, 'approved'),
      account(2, 'approved', 'Savings'),
      account(3, 'approved', 'Recurring Deposit')
    ];
    expect(pipe.transform(accounts, 'saving', 'open', type).map((a: any) => a.id)).toEqual([id]);
  });
});
