/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface TransactionHistoryTeller {
  id: number;
  tellerId: number;
  code: string;
  name: string;
  officeId: number;
  officeName: string;
}

export interface TransactionHistoryCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
}

export interface TransactionHistoryOption {
  code: string;
  label: string;
}

export interface TransactionHistoryContext {
  tellers: TransactionHistoryTeller[];
  currencies: TransactionHistoryCurrency[];
  statuses: TransactionHistoryOption[];
  types: TransactionHistoryOption[];
  operations: TransactionHistoryOption[];
  concepts: TransactionHistoryOption[];
}

export interface TransactionHistoryFilters {
  fromDate?: string;
  toDate?: string;
  tellerId?: number;
  currencyCode?: string;
  status?: string;
  type?: string;
  operation?: string;
  concept?: string;
  reference?: string;
  offset?: number;
  limit?: number;
  sort?: TransactionHistorySort;
  order?: 'ASC' | 'DESC';
}

export type TransactionHistorySort =
  'transactionDate' | 'operation' | 'inflow' | 'outflow' | 'currencyCode' | 'concept' | 'status' | 'reference';

export interface TransactionHistoryItem {
  historyId: string;
  transactionDate: string;
  operation: string;
  inflow: number;
  outflow: number;
  currencyCode: string;
  decimalPlaces: number | null;
  concept: string;
  status: string;
  reference: string;
  tellerId: number | null;
  clientId: number | null;
}

export interface TransactionHistoryTotals {
  currencyCode: string;
  decimalPlaces: number | null;
  totalInflows: number;
  totalOutflows: number;
  total: number;
}

export interface TransactionHistorySearch {
  items: TransactionHistoryItem[];
  totalFilteredRecords: number;
  offset: number;
  limit: number;
  totalsByCurrency: TransactionHistoryTotals[];
}

export interface TransactionHistoryClient {
  id: number;
  displayName: string;
  identification: string | null;
}

export interface TransactionHistoryCancellation {
  reason: string | null;
  user: string | null;
  date: string | null;
}

export interface TransactionHistoryDetail {
  historyId: string;
  transactionDate: string;
  client: TransactionHistoryClient | null;
  operation: string;
  concept: string;
  reference: string;
  teller: TransactionHistoryTeller | null;
  status: string;
  currencyCode: string;
  decimalPlaces: number | null;
  cashReceived: number | null;
  checksReceived: number | null;
  change: number | null;
  adjustment: number | null;
  total: number | null;
  cancellation: TransactionHistoryCancellation | null;
  receiptSupported: boolean;
}

export interface TransactionHistoryDenominationLine {
  currencyCode: string;
  denominationId: string;
  denominationValue: number;
  quantity: number;
  amount: number;
  denominationType: string | null;
}

export interface TransactionHistoryDenominations {
  historyId: string;
  operationDenominationsSupported: boolean;
  operationDenominations: TransactionHistoryDenominationLine[];
  changeDenominationsSupported: boolean;
  changeDenominations: TransactionHistoryDenominationLine[];
}

export interface TransactionHistoryReceipt {
  historyId: string;
  sourceType: string;
  sourceId: number;
  receipt: unknown;
}

export interface TransactionHistoryReport {
  generatedAt: string;
  items: TransactionHistoryItem[];
  totalFilteredRecords: number;
  totalsByCurrency: TransactionHistoryTotals[];
}
