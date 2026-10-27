/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type {
  CashInventoryAmount,
  CashInventoryCurrency,
  CashInventoryRow
} from '../cash-inventory/cash-inventory.service';

/** Savings Plugin VaultData records. Catalog availability is not physical cash availability. */
export type VaultStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type VaultCurrency = CashInventoryCurrency;

export interface VaultContext {
  branch: { id: number; name: string };
  vault: { key: string; officeId: number; name: string; status: VaultStatus };
  businessDate: string;
  supportedCurrencies: VaultCurrency[];
  capabilities: {
    viewContext: boolean;
    viewCurrencies: boolean;
    viewDenominations: boolean;
    viewInventory: boolean;
    previewDeposit: boolean;
    executeDeposit: boolean;
  };
  readiness: { depositReady: boolean; limitations: string[] };
}

export interface VaultCurrencies {
  vaultKey: string;
  currencies: VaultCurrency[];
  status: VaultStatus;
}

export interface VaultDenomination {
  id: number;
  denominationId: string;
  currencyCode: string;
  value: CashInventoryAmount;
  type: 'BANKNOTE' | 'COIN';
  active: boolean;
}

export interface VaultDenominations {
  vaultKey: string;
  currencyCode: string;
  denominations: VaultDenomination[];
  status: VaultStatus;
}

export interface VaultInventory {
  vaultKey: string;
  currencyCode: string;
  status: VaultStatus;
  balances: CashInventoryRow[];
}
