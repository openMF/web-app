/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FineractId } from '../base-teller.service';

export type CashManagementStatus = 'OPEN' | 'COMPLETED';
export type CashDifferenceType = 'BALANCED' | 'OVERAGE' | 'SHORTAGE';
export type CashOperationType = 'DEPOSIT_IN_TRANSIT' | 'BANK_DEPOSIT';

export interface CashDenomination {
  denominationId?: string | null;
  value: number;
  quantity: number;
}

export interface CashierCheck {
  id: FineractId;
  bank?: string | null;
  checkNumber?: string | null;
  amount: number;
}

export interface CashierClosingContext {
  businessDate: string;
  officeId: FineractId;
  officeName: string;
  tellerId: FineractId;
  tellerName: string;
  cashierId: FineractId;
  cashierName: string;
  currencyCode: string;
  openingBalance: number;
  cashInflows: number;
  cashOutflows: number;
  previousSettlements: number;
  expectedAmount: number;
  eligibleChecks: CashierCheck[];
  status: CashManagementStatus;
}

export interface CashierClosingRequest {
  idempotencyKey: string;
  cashierId: FineractId;
  businessDate: string;
  currencyCode: string;
  denominations: CashDenomination[];
  checkIds: FineractId[];
}

export interface CashierClosingReceipt {
  id: FineractId;
  reference: string;
  businessDate: string;
  officeId: FineractId;
  officeName: string;
  tellerId: FineractId;
  tellerName: string;
  cashierId: FineractId;
  cashierName: string;
  currencyCode: string;
  cashTotal: number;
  checkTotal: number;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  differenceType: CashDifferenceType;
  authorizedBy: FineractId;
  authorizedByUsername: string;
  authorizedOn?: string | null;
  status: CashManagementStatus;
  denominations: CashDenomination[];
  checks: CashierCheck[];
}

export interface GlobalCashCount {
  businessDate: string;
  currencyCode?: string | null;
  expectedAmount: number;
  cashTotal: number;
  checkTotal: number;
  actualAmount: number;
  difference: number;
  cashierClosings: CashierClosingReceipt[];
}

export interface CashOperationRequest extends CashierClosingRequest {
  transactionType: CashOperationType;
  description?: string | null;
}

export interface CashOperation {
  id: FineractId;
  reference: string;
  transactionType: CashOperationType;
  businessDate: string;
  currencyCode: string;
  amount: number;
  cashTotal: number;
  checkTotal: number;
  officeId: FineractId;
  tellerId: FineractId;
  cashierId: FineractId;
  cashierName: string;
  actorId: FineractId;
  actorUsername: string;
  description?: string | null;
  status: CashManagementStatus;
  createdOn?: string | null;
}

export interface CashOperationFilters {
  fromDate?: string;
  toDate?: string;
  cashierId?: FineractId;
  currencyCode?: string;
  status?: CashManagementStatus;
  transactionType?: CashOperationType;
  q?: string;
  offset?: number;
  limit?: number;
}

export interface CashOperationPage {
  pageItems: CashOperation[];
  totalFilteredRecords: number;
}

export interface CashHolding {
  businessDate: string;
  officeId: FineractId;
  tellerId: FineractId;
  cashierId: FineractId;
  cashierName: string;
  currencyCode: string;
  openingFunds: number;
  inflows: number;
  outflows: number;
  settlementsAndDeposits: number;
  currentBalance: number;
  status: CashManagementStatus;
}

export interface CashHoldingFilters {
  businessDate?: string;
  cashierId?: FineractId;
  currencyCode?: string;
}

export interface TellerOption {
  id: FineractId;
  name?: string;
}

export interface CashierOption {
  id: FineractId;
  staffName?: string;
  cashierName?: string;
}

export interface CurrencyOption {
  code?: string;
  name?: string;
}
