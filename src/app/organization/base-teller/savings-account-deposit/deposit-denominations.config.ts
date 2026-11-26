/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Presentation shortcuts only: not a teller inventory or an acceptance catalog. */
export interface DepositDenomination {
  readonly value: number;
  readonly kind: 'banknote' | 'coin';
}

export const MXN_DEPOSIT_DENOMINATIONS: readonly DepositDenomination[] = [
  ...[
    1000,
    500,
    200,
    100,
    50,
    20
  ].map((value) => ({ value, kind: 'banknote' as const })),
  ...[
    10,
    5,
    2,
    1,
    0.5
  ].map((value) => ({ value, kind: 'coin' as const }))
];

export const MAX_DEPOSIT_QUANTITY = 1000000;
