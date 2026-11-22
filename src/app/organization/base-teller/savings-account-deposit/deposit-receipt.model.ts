/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { toUnits } from '../cash-exchange/cash-exchange.models';
import {
  DepositClient,
  DepositSavingsAccount,
  FineractId,
  SavingsDepositCommandResult,
  SavingsDepositReceipt
} from '../base-teller.service';

/** Posting must use actual account currency and scale, not the pre-selection calculation fallback. */
export function hasDepositCurrency(account: DepositSavingsAccount | null | undefined): boolean {
  const code = account?.currency?.code || account?.currencyCode;
  const precision = account?.currency?.decimalPlaces;
  return (
    typeof code === 'string' &&
    /^[A-Z]{3}$/.test(code) &&
    precision != null &&
    Number.isInteger(precision) &&
    precision >= 0 &&
    precision <= 20
  );
}

/** Captured before the financial POST. Never read mutable forms to reconstruct a posted deposit. */
export interface DepositReceiptContext {
  customer: DepositClient;
  account: DepositSavingsAccount;
  accountId: FineractId;
  amount: number;
  depositType: 'CASH' | 'CHECK';
  paymentMethod: string;
  receiptReference: string;
  date: number[] | null;
  note: string;
}

export interface DepositReceiptViewModel {
  transactionId: string | null;
  receiptNumber: string | null;
  receiptConfirmed: boolean;
  amount: number | null;
  amountFromReceipt: boolean;
  currency: string;
  precision: number;
  customer: string;
  customerNumber: string;
  accountNumber: string;
  product: string;
  paymentMethod: string;
  depositType: 'CASH' | 'CHECK';
  transactionType: string;
  date: number[] | null;
  time: string | null;
  dateFromReceipt: boolean;
  operator: string | null;
  note: string;
  resultingBalance: number | null;
  previousBalance: number | null;
}

/** Keep long server identifiers as strings; never round an unsafe numeric identifier. */
export function depositTransactionId(value: unknown): string | null {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) ? value : null;
}

export function commandTransactionId(command?: SavingsDepositCommandResult): FineractId | null {
  return [
      command?.resourceId,
      command?.entityId,
      command?.transactionId
    ].find((value) => depositTransactionId(value) != null) ?? null;
}

function finiteAmount(value: unknown, precision: number, positive = false): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || (positive && value <= 0)) return null;
  try {
    const units = toUnits(Math.abs(value), precision);
    return units <= BigInt(Number.MAX_SAFE_INTEGER) ? value : null;
  } catch {
    return null;
  }
}

/** Intl accepts exactly three ASCII letters as a currency code. */
function isCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z]{3}$/.test(value);
}

/** Pure presentation mapping. cumulativeBalance is an interest accumulator, never a ledger balance. */
export function buildDepositReceiptViewModel(
  context: DepositReceiptContext,
  command?: SavingsDepositCommandResult,
  receipt?: SavingsDepositReceipt
): DepositReceiptViewModel {
  const commandReceipt: SavingsDepositReceipt | undefined = command;
  const receiptCurrency = isCurrencyCode(receipt?.currency?.code) ? receipt?.currency : undefined;
  const currency = [
      receiptCurrency?.code,
      context.account.currency?.code,
      context.account.currencyCode
    ].find(isCurrencyCode) || '';
  const suppliedPrecision = receiptCurrency?.decimalPlaces ?? context.account.currency?.decimalPlaces;
  const precision =
    suppliedPrecision != null &&
    Number.isInteger(suppliedPrecision) &&
    suppliedPrecision >= 0 &&
    suppliedPrecision <= 20
      ? suppliedPrecision
      : currency
        ? new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits
        : 6;
  const receivedAmount = receipt?.amount ?? receipt?.transactionAmount;
  const amount = finiteAmount(receivedAmount ?? context.amount, precision, true);
  const resultingBalance = finiteAmount(receipt?.runningBalance, precision);
  const receiptNumber = receipt?.paymentDetailData?.receiptNumber || commandReceipt?.paymentDetailData?.receiptNumber;
  let previousBalance: number | null = null;
  // Fineract SavingsAccount.recalculateDailyBalances adds a non-reversed credit's amount to runningBalance.
  // Only derive the immediately preceding ledger balance for that explicitly identified simple deposit.
  // Never use selected-account/available balances, cumulativeBalance, or a request amount for this equation.
  if (
    resultingBalance != null &&
    receivedAmount != null &&
    amount != null &&
    receipt?.transactionType?.deposit === true &&
    receipt.entryType === 'CREDIT' &&
    receipt.reversed === false &&
    receipt.isReversal !== true &&
    !receipt.transfer &&
    !receipt.lienTransaction
  ) {
    const balanceUnits = toUnits(Math.abs(resultingBalance), precision) * (resultingBalance < 0 ? -1n : 1n);
    const previousUnits = balanceUnits - toUnits(amount, precision);
    if (previousUnits >= -BigInt(Number.MAX_SAFE_INTEGER) && previousUnits <= BigInt(Number.MAX_SAFE_INTEGER)) {
      const candidate = Number(previousUnits) / 10 ** precision;
      // A safe integer numerator can still lose a minor unit when divided as a Number.
      // Omit the equation unless the display value round-trips to the exact scaled balance.
      try {
        const roundTrip = toUnits(Math.abs(candidate), precision) * (candidate < 0 ? -1n : 1n);
        if (roundTrip === previousUnits) previousBalance = candidate;
      } catch {
        // A rounded value may no longer fit the account's precision.
      }
    }
  }
  const rawType = receipt?.transactionType?.value;
  return {
    transactionId: depositTransactionId(receipt?.id) || depositTransactionId(commandTransactionId(command)),
    receiptNumber: receiptNumber || context.receiptReference || null,
    receiptConfirmed: !!receiptNumber,
    amount,
    amountFromReceipt: receivedAmount != null,
    currency,
    precision,
    customer: context.customer.displayName || context.customer.fullname || context.customer.name || '',
    customerNumber: context.customer.accountNo || '',
    accountNumber:
      receipt?.accountNo || receipt?.accountNumber || context.account.accountNo || context.account.accountNumber || '',
    product: context.account.productName || context.account.savingsProductName || '',
    paymentMethod: receipt?.paymentDetailData?.paymentType?.name || context.paymentMethod,
    depositType: context.depositType,
    transactionType:
      receipt?.transactionType?.deposit === true || !rawType || rawType.toLowerCase() === 'deposit'
        ? 'labels.inputs.Deposit'
        : rawType,
    date: receipt?.date || context.date,
    time: receipt?.transactionTime || null,
    dateFromReceipt: !!receipt?.date,
    operator: receipt?.submittedByUsername || null,
    note: receipt?.note ?? context.note,
    resultingBalance,
    previousBalance
  };
}

/** Positive reconciliation only: an operator-supplied ID is not proof without the original reference. */
export function matchesPendingDeposit(
  context: DepositReceiptContext,
  id: string,
  receipt: SavingsDepositReceipt
): boolean {
  if (
    depositTransactionId(receipt.id) !== id ||
    String(receipt.accountId) !== String(context.accountId) ||
    receipt.paymentDetailData?.receiptNumber !== context.receiptReference ||
    receipt.transactionType?.deposit !== true ||
    receipt.entryType !== 'CREDIT' ||
    receipt.reversed !== false ||
    receipt.isReversal === true ||
    !receipt.currency?.code ||
    receipt.currency.code !== (context.account.currency?.code || context.account.currencyCode) ||
    !context.date ||
    !receipt.date ||
    receipt.date.length !== 3 ||
    !receipt.date.every((part, index) => part === context.date![index])
  )
    return false;
  const view = buildDepositReceiptViewModel(context, undefined, receipt);
  if (view.amount === null || !view.amountFromReceipt) return false;
  try {
    return toUnits(view.amount, view.precision) === toUnits(context.amount, view.precision);
  } catch {
    return false;
  }
}
