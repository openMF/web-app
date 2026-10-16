/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ClosingCashier } from '../end-of-day-cash-closing/end-of-day-closing.models';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
export type Money = number | string;
export interface AvailableDenomination {
  denominationId: string;
  currencyCode: string;
  denominationValue: Money;
  denominationType: string;
  availableQuantity: number;
}
export interface AvailableCurrency {
  currencyCode: string;
  decimalPlaces: number;
  denominations: AvailableDenomination[];
}
export interface CashTransferContext {
  businessDate: string;
  source: ClosingCashier;
  destinations: ClosingCashier[];
  currencies: AvailableCurrency[];
  permissions: string[];
}
export interface CashTransferRequest {
  destinationCashierId: number;
  idempotencyKey?: string;
  currencies: { currencyCode: string; denominations: { denominationId: string; quantity: number }[] }[];
}
export interface TransferDenomination {
  denominationId: string;
  denominationType: string;
  denominationValue: Money;
  quantity: number;
  amount: Money;
}
export interface TransferCurrency {
  currencyCode: string;
  decimalPlaces: number;
  total: Money;
  denominations: TransferDenomination[];
  sourceCashierTransactionId?: number;
  destinationCashierTransactionId?: number;
}
export interface CashTransferRecord {
  id?: number;
  reference?: string;
  operation: string;
  status: string;
  businessDate: string;
  source: ClosingCashier;
  destination: ClosingCashier;
  createdBy: number;
  createdByUsername: string;
  createdAt?: string;
  completedAt?: string;
  balanced: boolean;
  inflowsByCurrency: { currencyCode: string; amount: Money }[];
  outflowsByCurrency: { currencyCode: string; amount: Money }[];
  currencies: TransferCurrency[];
}
export interface PendingCashTransfer {
  requiresReview?: boolean;
  request: CashTransferRequest;
  preview: CashTransferRecord;
}
function validCashier(cashier: ClosingCashier): boolean {
  if (!cashier) return false;
  const ids = [
    cashier.cashierId,
    cashier.staffId,
    cashier.tellerId,
    cashier.officeId
  ];
  const names = [
    cashier.cashierName,
    cashier.tellerName,
    cashier.officeName
  ];
  return (
    ids.every((id) => Number.isSafeInteger(id) && id > 0) &&
    names.every((name) => typeof name === 'string' && name.trim().length > 0)
  );
}
function validDenomination(line: TransferDenomination, precision: number): boolean {
  if (
    !line ||
    typeof line.denominationId !== 'string' ||
    !line.denominationId.length ||
    (line.denominationType !== 'BANKNOTE' && line.denominationType !== 'COIN') ||
    !Number.isSafeInteger(line.quantity) ||
    line.quantity <= 0
  )
    return false;
  const value = toUnits(line.denominationValue, precision);
  return value > 0n && value * BigInt(line.quantity) === toUnits(line.amount, precision);
}
/** Validate every value the summary formats, in addition to the backend currency legs. */
export function isBalanced(record: CashTransferRecord | null | undefined): boolean {
  try {
    if (
      !record ||
      record.balanced !== true ||
      record.operation !== 'CASH_TRANSFER_BETWEEN_TELLERS' ||
      !validCashier(record.source) ||
      !validCashier(record.destination) ||
      record.source.cashierId === record.destination.cashierId ||
      typeof record.businessDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.businessDate) ||
      !Array.isArray(record.currencies) ||
      !record.currencies.length ||
      !Array.isArray(record.inflowsByCurrency) ||
      !Array.isArray(record.outflowsByCurrency)
    )
      return false;
    return (
      new Set(record.currencies.map((c) => c.currencyCode)).size === record.currencies.length &&
      record.inflowsByCurrency.length === record.currencies.length &&
      record.outflowsByCurrency.length === record.currencies.length &&
      record.currencies.every((c) => {
        if (
          !/^[A-Z]{3}$/.test(c.currencyCode) ||
          !Number.isInteger(c.decimalPlaces) ||
          c.decimalPlaces < 0 ||
          c.decimalPlaces > 6 ||
          !Array.isArray(c.denominations) ||
          !c.denominations.length ||
          new Set(c.denominations.map((d) => d.denominationId)).size !== c.denominations.length
        )
          return false;
        const inflows = record.inflowsByCurrency.filter((t) => t.currencyCode === c.currencyCode);
        const outflows = record.outflowsByCurrency.filter((t) => t.currencyCode === c.currencyCode);
        const total = toUnits(c.total, c.decimalPlaces);
        return (
          total > 0n &&
          inflows.length === 1 &&
          outflows.length === 1 &&
          toUnits(inflows[0].amount, c.decimalPlaces) === total &&
          toUnits(outflows[0].amount, c.decimalPlaces) === total &&
          c.denominations.every((line) => validDenomination(line, c.decimalPlaces)) &&
          c.denominations.reduce((sum, d) => sum + toUnits(d.amount, c.decimalPlaces), 0n) === total
        );
      })
    );
  } catch {
    return false;
  }
}
export function isCompletedTransfer(
  record: CashTransferRecord | null | undefined,
  expectedId?: number
): record is CashTransferRecord & { id: number } {
  return (
    !!record &&
    record.status === 'COMPLETED' &&
    typeof record.id === 'number' &&
    Number.isSafeInteger(record.id) &&
    record.id > 0 &&
    (expectedId === undefined || record.id === expectedId) &&
    typeof record.reference === 'string' &&
    record.reference.trim().length > 0 &&
    typeof record.completedAt === 'string' &&
    !Number.isNaN(Date.parse(record.completedAt)) &&
    isBalanced(record)
  );
}
export function denominationTotal(currency: TransferCurrency, coins: boolean): string {
  return fromUnits(
    currency.denominations
      .filter((d) => (d.denominationType === 'COIN') === coins)
      .reduce((sum, d) => sum + toUnits(d.amount, currency.decimalPlaces), 0n),
    currency.decimalPlaces
  );
}
