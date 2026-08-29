/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';

/**
 * Transaction-type classification shared by the transactions list and the
 * transaction detail view so both style the same type the same way.
 * Code-based matches back up the boolean flags because Working Capital
 * responses do not always send them.
 */

export function isCapitalizedIncomeAmortizationTransaction(transactionType: LoanTransactionType): boolean {
  return (
    transactionType.capitalizedIncomeAmortization ||
    transactionType.capitalizedIncomeAmortizationAdjustment ||
    transactionType.code === 'loanTransactionType.capitalizedIncomeAmortization' ||
    transactionType.code === 'loanTransactionType.capitalizedIncomeAmortizationAdjustment'
  );
}

export function isBuyDownFeeAmortizationTransaction(transactionType: LoanTransactionType): boolean {
  return (
    transactionType.buyDownFeeAmortizationAdjustment ||
    transactionType.code === 'loanTransactionType.buyDownFeeAmortization' ||
    transactionType.code === 'loanTransactionType.buyDownFeeAmortizationAdjustment'
  );
}

export function isDiscountFeeAmortizationTransaction(transactionType: LoanTransactionType): boolean {
  return (
    transactionType.code === 'loanTransactionType.discountFeeAmortization' ||
    transactionType.code === 'loanTransactionType.discountFeeAmortizationAdjustment'
  );
}

/** Accrual itself plus the amortization types that are accrual-like activity. */
export function isAccrualKindTransaction(transactionType: LoanTransactionType): boolean {
  return (
    transactionType.accrual ||
    transactionType.code === 'loanTransactionType.overdueCharge' ||
    isCapitalizedIncomeAmortizationTransaction(transactionType) ||
    isBuyDownFeeAmortizationTransaction(transactionType) ||
    isDiscountFeeAmortizationTransaction(transactionType)
  );
}

/**
 * Discount Fee and its adjustment share one visual identity; the amortization
 * members of the family style as accrual instead.
 */
export function isDiscountFeeKindTransaction(transactionType: LoanTransactionType): boolean {
  return (
    transactionType.discountFee ||
    transactionType.code === 'loanTransactionType.discountFee' ||
    transactionType.code === 'loanTransactionType.discountFeeAdjustment'
  );
}
