/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { VaultDenomination } from './vault-cash-deposit.models';

export const VAULT_QUANTITY_LIMIT = 1_000_000_000;

export function vaultQuantity(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  return /^\d{1,10}$/.test(value) && Number(value) <= VAULT_QUANTITY_LIMIT ? null : { quantity: true };
}

export interface VaultCashEstimate {
  subtotals: string[];
  banknotesTotal: string;
  coinsTotal: string;
  totalCash: string;
  positive: boolean;
  inRange: boolean;
}

/** Reuse exact minor-unit arithmetic. Overprecision is rejected, never rounded. */
export function calculateVaultCash(
  rows: VaultDenomination[],
  quantities: string[],
  precision: number
): VaultCashEstimate {
  if (!Number.isInteger(precision) || precision < 0 || precision > 6 || rows.length !== quantities.length) {
    throw new Error('Invalid vault catalog');
  }
  const ids = new Set<string>();
  let notes = 0n,
    coins = 0n;
  const subtotals = rows.map((row, index) => {
    const id = row.denominationId?.trim().toLowerCase();
    if (!id || row.denominationId !== row.denominationId.trim() || ids.has(id) || !row.active || ![
        'BANKNOTE',
        'COIN'
      ].includes(row.type)) throw new Error('Invalid vault catalog');
    ids.add(id);
    const value = toUnits(row.value, precision);
    if (value <= 0n || vaultQuantity({ value: quantities[index] } as AbstractControl))
      throw new Error('Invalid cash entry');
    const subtotal = value * BigInt(quantities[index]);
    if (row.type === 'BANKNOTE') notes += subtotal;
    else coins += subtotal;
    return fromUnits(subtotal, precision);
  });
  const total = notes + coins;
  return {
    subtotals,
    banknotesTotal: fromUnits(notes, precision),
    coinsTotal: fromUnits(coins, precision),
    totalCash: fromUnits(total, precision),
    positive: total > 0n,
    inRange: total < 10_000_000_000_000n * 10n ** BigInt(precision)
  };
}
