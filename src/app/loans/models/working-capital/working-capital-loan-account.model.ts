/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Currency, PaymentType } from 'app/shared/models/general.model';

/** Code value option used to populate the charge-off reason dropdown. */
export interface WorkingCapitalChargeOffReasonOption {
  id: number;
  name: string;
  position?: number;
  description?: string;
  isActive?: boolean;
}

/** Response of GET /working-capital-loans/{loanId}/template?templateType=chargeOff. */
export interface WorkingCapitalChargeOffTemplate {
  chargeOffAmount: number;
  chargeOffDate: number[] | string;
  chargeOffReasonOptions: WorkingCapitalChargeOffReasonOption[];
  currency: Currency;
}

/** Request body for POST /working-capital-loans/{loanId}/transactions?command=chargeOff. */
export interface WorkingCapitalChargeOffRequest {
  transactionDate: string;
  chargeOffReasonId?: number;
  note?: string;
  externalId?: string;
  locale: string;
  dateFormat: string;
}

/** Request body for POST /working-capital-loans/{loanId}/transactions?command=undoChargeOff. */
export interface WorkingCapitalUndoChargeOffRequest {
  reversalExternalId?: string;
  note?: string;
  locale: string;
}

/**
 * Request body for PUT /working-capital-loans/{loanId}/mark-as-fraud.
 *
 * Unlike every other Working Capital action, this endpoint accepts `fraud` and
 * nothing else: its validator runs checkForUnsupportedParameters against a set
 * holding only that name, so adding locale or dateFormat returns HTTP 400.
 */
export interface WorkingCapitalMarkAsFraudRequest {
  fraud: boolean;
}

export interface ProjectedAmortizationSchedule {
  originationFeeAmount: number;
  netDisbursementAmount: number;
  totalPaymentValue: number;
  periodPaymentRate: number;
  npvDayCount: number;
  expectedDisbursementDate: Date;
  expectedPaymentAmount: number;
  loanTerm: number;
  effectiveInterestRate: number;
  payments: Payment[];
}

export interface Payment {
  paymentNo: number;
  paymentDate: Date;
  expectedPaymentAmount: number;
  expectedBalance: number;
  actualBalance?: number;
  expectedAmortizationAmount?: number;
  actualPaymentAmount?: number;
  actualAmortizationAmount?: number;
  expectedDiscountFeeBalance: number;
  actualDiscountFeeBalance?: number;
}

export interface WorkingCapitalBalances {
  id: number;
  principalOutstanding: number;
  totalPaidPrincipal: number;
  totalPayment: number;
  realizedIncome: number;
  unrealizedIncome: number;
  overpaymentAmount: number;
  breachPastDueAmount: number | null | undefined;
  /** Gross amount written off. It does not go down as recoveries come in. */
  totalWrittenOff?: number;
  principalWrittenOff?: number;
  feeWrittenOff?: number;
  penaltyWrittenOff?: number;
  /** Amount collected after the write-off. See mapWorkingCapitalWriteOffBalance for the field name caveat. */
  totalRecovered?: number;
  /** Alternative name the backend may adopt for totalRecovered. */
  totalRecoveryPayment?: number;
  /** totalWrittenOff - totalRecovered: what can still be recovered. */
  writtenOffOutstanding?: number;
}

export interface WorkingCapitalLoanDiscountUpdateRequest {
  transactionAmount: number;
  relatedResourceId: number;
  externalId?: string;
  note?: string;
  locale: string;
  dateFormat: string;
}

export interface WorkingCapitalBreachActionRequest {
  action: string;
  minimumPayment: number;
  minimumPaymentType: string;
  frequency: number;
  frequencyType: string;
  locale: string;
}

/**
 * Command payload for POST /working-capital-loans/{loanId}/breach-actions
 * (pause, resume, disable, enable, reset, undo_reset). Distinct from
 * WorkingCapitalBreachActionRequest, which carries the RESCHEDULE configuration.
 */
export interface WorkingCapitalBreachCommandRequest {
  action: string;
  locale: string;
  dateFormat: string;
  startDate?: string;
  endDate?: string;
  restartPeriodFromResetDate?: boolean;
}

export interface WorkingCapitalBreachAction {
  id: number;
  action: string;
  startDate: number[];
  endDate?: number[];
  effectiveEndDate?: number[];
  minimumPayment?: number;
  minimumPaymentType?: string;
  frequency?: number;
  frequencyType?: string;
}

/**
 * Request body for POST /working-capital-loans/{loanId}/breach-actions with
 * action disable or enable.
 *
 * `startDate` must be exactly the current business date; any other date is
 * rejected with must.be.current.business.date. `endDate` must never be sent,
 * not even as null, or the backend answers
 * must.not.be.provided.for.disable.or.enable.
 */
export interface WorkingCapitalBreachToggleRequest {
  action: 'disable' | 'enable';
  startDate: string;
  dateFormat: string;
  locale: string;
}

export interface WorkingCapitalNearBreachActionRequest {
  action: string;
  nearBreachThreshold: number;
  nearBreachFrequency: number;
  nearBreachFrequencyType: string;
  locale: string;
}

export interface WorkingCapitalNearBreachActions {
  id: number;
  loanId: number;
  action: string;
  threshold: number;
  frequency: number;
  frequencyType: string;
  submittedOnDate: number[];
}

export interface WorkingCapitalWriteOffRequest {
  transactionDate: string;
  /** Lower-case "writeoff" on purpose: the backend follows the term/progressive loan parameter shape. */
  writeoffReasonId?: number;
  note?: string;
  externalId?: string;
  locale: string;
  dateFormat: string;
}

export interface WorkingCapitalUndoWriteOffRequest {
  reversalExternalId?: string;
  note?: string;
  locale: string;
}

/** Payment data accepted by the Working Capital transaction commands. */
export interface WorkingCapitalPaymentDetails {
  paymentTypeId?: number;
  accountNumber?: string;
  checkNumber?: string;
  routingCode?: string;
  receiptNumber?: string;
  bankNumber?: string;
}

/**
 * Response of GET /working-capital-loans/{loanId}/template?templateType=recoveryPayment.
 *
 * `expectedAmount` is the remaining recoverable amount, not the gross written-off
 * one: on a loan written off for 100 with 30 already recovered it returns 70.
 */
export interface WorkingCapitalRecoveryPaymentTemplate {
  expectedAmount: number;
  currency: Currency;
  paymentTypeOptions: PaymentType[];
}

/**
 * Request body for POST /working-capital-loans/{loanId}/transactions?command=recoveryPayment.
 *
 * `classificationId` is deliberately absent: a recovery has no allocation, and
 * sending it makes the backend reject the whole request.
 */
export interface WorkingCapitalRecoveryPaymentRequest {
  transactionDate: string;
  transactionAmount: number;
  note?: string;
  externalId?: string;
  paymentDetails?: WorkingCapitalPaymentDetails;
  locale: string;
  dateFormat: string;
}

/**
 * Request body for POST /working-capital-loans/{loanId}/transactions/{transactionId}?command=undo,
 * the generic reversal shared by repayment, goodwill credit, payout refund and recovery payment.
 */
export interface WorkingCapitalUndoTransactionRequest {
  reversalExternalId?: string;
  note?: string;
  locale: string;
}

/** Write-off and recovery figures derived from the loan balance, ready to render. */
export interface WorkingCapitalWriteOffBalance {
  /** Gross written-off amount. Stays put as recoveries come in. */
  totalWrittenOff: number;
  principalWrittenOff: number;
  feeWrittenOff: number;
  penaltyWrittenOff: number;
  /** Amount already recovered after the write-off. */
  totalRecovered: number;
  /** Amount still recoverable. Drives both the panel and the action availability. */
  writtenOffOutstanding: number;
  /** Share of the written-off amount already recovered, 0-100. */
  recoveredPercentage: number;
  /** True once there is nothing left to recover. */
  fullyRecovered: boolean;
}

/** Reads an amount that may arrive as null, undefined or a string. */
function toAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Single mapping point between the loan balance payload and the write-off /
 * recovery figures the UI renders.
 *
 * `totalRecovered` is read together with `totalRecoveryPayment` because the
 * backend has an open decision to rename it; accepting both names here means
 * the rename costs nothing anywhere else. `writtenOffOutstanding` is recomputed
 * when the payload omits it so the panel never shows a blank remainder.
 * @param balance The `balance` block of GET /working-capital-loans/{loanId}
 * @returns Derived figures, or null when there is no balance to read
 */
export function mapWorkingCapitalWriteOffBalance(
  balance: WorkingCapitalBalances | null | undefined
): WorkingCapitalWriteOffBalance | null {
  if (!balance) {
    return null;
  }
  const totalWrittenOff = toAmount(balance.totalWrittenOff);
  const totalRecovered = toAmount(balance.totalRecovered ?? balance.totalRecoveryPayment);
  const writtenOffOutstanding =
    balance.writtenOffOutstanding != null
      ? toAmount(balance.writtenOffOutstanding)
      : Math.max(totalWrittenOff - totalRecovered, 0);
  return {
    totalWrittenOff,
    principalWrittenOff: toAmount(balance.principalWrittenOff),
    feeWrittenOff: toAmount(balance.feeWrittenOff),
    penaltyWrittenOff: toAmount(balance.penaltyWrittenOff),
    totalRecovered,
    writtenOffOutstanding,
    recoveredPercentage: totalWrittenOff > 0 ? Math.min(100, (totalRecovered / totalWrittenOff) * 100) : 0,
    fullyRecovered: totalWrittenOff > 0 && writtenOffOutstanding <= 0
  };
}
