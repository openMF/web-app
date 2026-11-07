/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type Money = number | string;
export interface Denomination {
  denominationId: string;
  type: string;
  value: Money;
  quantity: number;
  amount: Money;
}
export interface ClosingCurrency {
  currencyCode: string;
  decimalPlaces: number;
  denominations: Denomination[];
}
export interface ClosingCashier {
  cashierId: number;
  staffId: number;
  cashierName: string;
  tellerId: number;
  tellerName: string;
  officeId: number;
  officeName: string;
  closed: boolean;
}
export interface ClosingContext {
  businessDate: string;
  cashiers: ClosingCashier[];
  currencies: ClosingCurrency[];
  completedClosingIds: number[];
}
export interface ClosingCheck {
  source: string;
  id: number;
  date: string;
  currencyCode: string;
  type: string;
  bank: string;
  reference: string;
  username: string;
  cashierId: number;
  amount: Money;
}
export interface ClosingRequest {
  cashierId: number;
  businessDate: string;
  idempotencyKey: string;
  currencies: {
    currencyCode: string;
    denominations: { denominationId: string; quantity: number }[];
    vouchers: Money;
    checks: { source: string; id: number }[];
  }[];
}
export interface ClosingBalance extends ClosingCurrency {
  expectedCash: Money;
  expectedChecks: Money;
  expectedVouchers: Money;
  expectedTotal: Money;
  coinTotal: Money;
  billTotal: Money;
  declaredCash: Money;
  selectedChecks: Money;
  vouchers: Money;
  declaredTotal: Money;
  shortage: Money;
  overage: Money;
  reconciliationStatus: 'BALANCED' | 'SHORTAGE' | 'OVERAGE';
  checks: ClosingCheck[];
  reconciliationId?: number;
  settledCash?: Money;
}
export interface ClosingRecord {
  id?: number;
  reference?: string;
  status: string;
  businessDate: string;
  officeId: number;
  officeName: string;
  tellerId: number;
  tellerName: string;
  cashierId: number;
  cashierStaffId: number;
  cashierName: string;
  createdBy: number;
  authorizedBy?: number;
  authorizedByUsername?: string;
  authorizedAt?: string;
  completedAt?: string;
  balancesByCurrency: ClosingBalance[];
}
