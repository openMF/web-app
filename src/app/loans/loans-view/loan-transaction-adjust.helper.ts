/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';

/**
 * Availability rules for the Term Loan adjust command
 * (`POST /loans/{loanId}/transactions/{transactionId}`), which reverses the
 * original transaction and, when a positive amount is supplied, also creates a
 * replacement transaction of the same type.
 *
 * The backend applies two independent gates: a transaction must clear the first
 * one to be reversed at all, and both of them to be re-submitted with a new
 * amount. Types are matched by id rather than by the boolean flags because the
 * type codes are not unique (REFUND and REFUND_FOR_ACTIVE_LOAN share one code)
 * and because the flags for ACCRUAL_ACTIVITY and ACCRUAL_ADJUSTMENT are not
 * part of the transaction type model.
 *
 * Working Capital loans are out of scope: they reverse transactions through
 * their own commands.
 */

/**
 * Gate 1 - types the adjust command accepts at all. Mirrors the type check in
 * the backend's LoanAdjustmentServiceImpl#adjustExistingTransaction: accrual
 * related, repayment like, waiver, credit balance refund, deferred income,
 * capitalized income adjustment or buy down fee adjustment.
 */
const REVERSIBLE_TRANSACTION_TYPE_IDS: ReadonlySet<number> = new Set([
  2, // REPAYMENT
  4, // WAIVE_INTEREST
  9, // WAIVE_CHARGES
  10, // ACCRUAL
  20, // CREDIT_BALANCE_REFUND
  21, // MERCHANT_ISSUED_REFUND
  22, // PAYOUT_REFUND
  23, // GOODWILL_CREDIT
  24, // CHARGE_REFUND
  26, // CHARGE_ADJUSTMENT
  28, // DOWN_PAYMENT
  31, // INTEREST_PAYMENT_WAIVER
  32, // ACCRUAL_ACTIVITY
  34, // ACCRUAL_ADJUSTMENT
  35, // CAPITALIZED_INCOME
  37, // CAPITALIZED_INCOME_ADJUSTMENT
  40, // BUY_DOWN_FEE
  41 // BUY_DOWN_FEE_ADJUSTMENT
]);

/**
 * Gate 2 - types that clear gate 1 but reject a positive amount, so they can
 * only be reversed. The first three come from the backend's
 * LoanTransaction#isEditable check; the deferred income ones each raise their
 * own "cannot be adjusted" error.
 */
const REVERSE_ONLY_TRANSACTION_TYPE_IDS: ReadonlySet<number> = new Set([
  21, // MERCHANT_ISSUED_REFUND
  22, // PAYOUT_REFUND
  23, // GOODWILL_CREDIT
  35, // CAPITALIZED_INCOME
  37, // CAPITALIZED_INCOME_ADJUSTMENT
  40, // BUY_DOWN_FEE
  41 // BUY_DOWN_FEE_ADJUSTMENT
]);

/**
 * Interest refund is repayment like, so it clears gate 1, but the backend
 * rejects it before reaching that check: it can be neither reversed nor
 * adjusted directly.
 */
const INTEREST_REFUND_TYPE_ID = 33;

/**
 * Loan statuses the command is allowed to act on even though the loan is no
 * longer active. The backend re-runs the loan lifecycle state machine after the
 * adjustment, which reopens the account.
 */
const REOPENING_LOAN_STATUS_CODES: ReadonlySet<string> = new Set([
  'loanStatusType.closed.obligations.met',
  'loanStatusType.overpaid'
]);

/** True when the amount cannot be changed and the only available mode is a reversal. */
export function isReverseOnlyLoanTransaction(transactionType: LoanTransactionType): boolean {
  return REVERSE_ONLY_TRANSACTION_TYPE_IDS.has(transactionType.id);
}

/** True when the transaction can be reversed through the adjust command. */
export function canReverseLoanTransaction(transactionType: LoanTransactionType, alreadyReversed: boolean): boolean {
  return (
    !alreadyReversed &&
    transactionType.id !== INTEREST_REFUND_TYPE_ID &&
    REVERSIBLE_TRANSACTION_TYPE_IDS.has(transactionType.id)
  );
}

/** True when the transaction can be re-submitted with a new date, amount and payment details. */
export function canAdjustLoanTransaction(transactionType: LoanTransactionType, alreadyReversed: boolean): boolean {
  return canReverseLoanTransaction(transactionType, alreadyReversed) && !isReverseOnlyLoanTransaction(transactionType);
}

/**
 * True when adjusting or reversing a transaction on this loan will reopen it,
 * which is allowed but changes the account the user is looking at.
 * @param loanStatus Status of the loan the transaction belongs to
 */
export function adjustmentReopensLoan(loanStatus: { code?: string } | null | undefined): boolean {
  return !!loanStatus?.code && REOPENING_LOAN_STATUS_CODES.has(loanStatus.code);
}
