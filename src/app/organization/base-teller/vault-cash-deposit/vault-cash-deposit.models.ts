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

/** VaultDepositPreviewRequest: quantities only; amounts and custody are server-owned. */
export interface VaultDepositPreviewRequest {
  officeId?: number;
  businessDate: string;
  currencies: {
    currencyCode: string;
    denominations: { denominationId: string; quantity: number }[];
  }[];
  correlationReference?: string;
}

export interface VaultPreviewLine {
  denominationId: string;
  value: CashInventoryAmount;
  quantity: number;
  subtotal: CashInventoryAmount;
}

export interface VaultPreviewColumn {
  cash: CashInventoryAmount;
  checks: { supported: boolean; amount?: CashInventoryAmount | null };
  vouchers: { supported: boolean; amount?: CashInventoryAmount | null };
}

export interface VaultPreviewCurrency {
  currencyCode: string;
  decimalPlaces: number;
  banknotes: VaultPreviewLine[];
  coins: VaultPreviewLine[];
  banknotesTotal: CashInventoryAmount;
  coinsTotal: CashInventoryAmount;
  totalCash: CashInventoryAmount;
  generalTransaction: { perspective: string; inflows: VaultPreviewColumn; outflows: VaultPreviewColumn };
}

/** VaultDepositPreviewData. This record never represents a completed transaction. */
export interface VaultDepositPreview {
  operationType: 'VAULT_CASH_DEPOSIT';
  validationStatus: 'VALID_PREVIEW';
  movementStatus: 'PROPOSED';
  branch: VaultContext['branch'];
  vault: VaultContext['vault'];
  businessDate: string;
  correlationReference?: string | null;
  currencies: VaultPreviewCurrency[];
  executionReadiness: {
    executionAllowed: boolean;
    status: string;
    sourcePolicy: VaultStatus;
    accountingPolicy: VaultStatus;
    blockers: { code: string; message: string }[];
  };
}
