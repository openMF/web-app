/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CashInventoryAmount } from '../cash-inventory/cash-inventory.service';
import { VaultContext, VaultPreviewCurrency } from './vault-cash-deposit.models';

/** Phase 3 has only immutable BLOCKED attempts, never financial transactions. */
export interface VaultDepositAttempt {
  attemptReference: string;
  status: 'BLOCKED';
  transactionId?: null;
  operationType: 'VAULT_CASH_DEPOSIT';
  branch: VaultContext['branch'];
  vault: VaultContext['vault'];
  businessDate: string;
  createdAt: string;
  proposedSource?: { type: 'INTERNAL_CUSTODY_TRANSFER' | 'EXTERNAL_CASH_RECEIPT'; reference: string } | null;
  initiatedBy: number;
  correlationReference?: string | null;
  currencies: VaultPreviewCurrency[];
  accountingStatus: 'NOT_POSTED';
  executionAllowed: false;
  blockers: { code: string; message: string }[];
}

export interface VaultReceiptEligibility {
  eligible: false;
  reason: 'NOT_POSTED';
}

export interface VaultDepositHistoryItem {
  attemptReference: string;
  recordKind: 'DEPOSIT_ATTEMPT';
  status: 'BLOCKED';
  operationType: 'VAULT_CASH_DEPOSIT';
  branch: VaultContext['branch'];
  vault: VaultContext['vault'];
  businessDate: string;
  createdAt: string;
  currencies: { currencyCode: string; decimalPlaces: number; proposedCash: CashInventoryAmount }[];
  receiptEligibility: VaultReceiptEligibility;
  permittedActions: string[];
}

export interface VaultDepositHistoryResponse {
  items: VaultDepositHistoryItem[];
  totalFilteredRecords: number;
  offset: number;
  limit: number;
}

export interface VaultDepositHistoryFilter {
  officeId?: number;
  vaultKey?: string;
  currencyCode?: string;
  status?: 'BLOCKED';
  fromDate?: string;
  toDate?: string;
  reference?: string;
  offset?: number;
  limit?: number;
}

export interface VaultDepositDetail {
  recordKind: 'DEPOSIT_ATTEMPT';
  attempt: VaultDepositAttempt;
  receiptEligibility: VaultReceiptEligibility;
  permittedActions: string[];
}

export interface VaultDepositAudit {
  attemptReference: string;
  events: {
    eventId: string;
    eventType: string;
    actorId?: number | null;
    timestamp: string;
    previousState?: string | null;
    newState: 'BLOCKED';
  }[];
}

export function vaultBlockerLabel(code: string): string {
  const labels: Record<string, string> = {
    SOURCE_POLICY_UNAVAILABLE: 'vaultDeposit.preview.sourcePolicy',
    ACCOUNTING_POLICY_UNAVAILABLE: 'vaultDeposit.preview.accountingPolicy',
    VAULT_STATUS_UNKNOWN: 'vaultDeposit.preview.vaultUnknown',
    EXECUTION_NOT_IMPLEMENTED: 'vaultDeposit.preview.executionUnavailable',
    APPROVAL_POLICY_UNAVAILABLE: 'vaultDeposit.confirmation.approvalPolicy',
    POSTING_MODEL_UNAVAILABLE: 'vaultDeposit.confirmation.postingModel'
  };
  return labels[code] ?? 'vaultDeposit.preview.missingPolicy';
}

export function vaultAttemptStatusLabel(status: string): string {
  return status === 'BLOCKED' ? 'vaultDeposit.history.blocked' : 'vaultDeposit.history.unknownStatus';
}
