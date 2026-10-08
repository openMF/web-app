/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Currency, PaymentType } from 'app/shared/models/general.model';
import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';

/**
 * Which input the Working Capital daily payment is solved from. Mirrors the backend enum
 * WorkingCapitalPaymentAmountCalculationStrategy; the API serialises it as a StringEnumOptionData
 * whose `id` is the enum name.
 */
export const WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY = {
  TPV: 'TPV',
  ANNUAL_EIR: 'ANNUAL_EIR',
  PAYMENT_AMOUNT: 'PAYMENT_AMOUNT'
} as const;

export type WorkingCapitalPaymentAmountCalculationStrategy =
  (typeof WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY)[keyof typeof WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY];

/** Fallback options for the strategy select when the template does not carry them. */
export const WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY_OPTIONS: StringEnumOptionData[] = [
  { id: 'TPV', code: 'TPV', value: 'Total Payment Volume' },
  { id: 'ANNUAL_EIR', code: 'ANNUAL_EIR', value: 'Annual EIR' },
  { id: 'PAYMENT_AMOUNT', code: 'PAYMENT_AMOUNT', value: 'Payment Amount' }
];

/**
 * Pricing inputs that belong to each strategy. The backend rejects any input of another strategy
 * with `not.allowed.for.<strategy>.strategy`, so forms must only send the active group.
 */
export const WC_PRICING_FIELDS_BY_STRATEGY: Record<WorkingCapitalPaymentAmountCalculationStrategy, string[]> = {
  TPV: [
    'periodPaymentRate',
    'minPeriodPaymentRate',
    'maxPeriodPaymentRate',
    'totalPaymentVolume'
  ],
  ANNUAL_EIR: [
    'annualEir',
    'minAnnualEir',
    'maxAnnualEir'
  ],
  PAYMENT_AMOUNT: [
    'paymentAmount',
    'minPaymentAmount',
    'maxPaymentAmount'
  ]
};

/**
 * Reads the strategy from either shape the API uses (plain enum name on requests, option
 * object on responses). Missing or unknown values fall back to TPV, the backend default.
 */
export function resolvePaymentAmountCalculationStrategy(
  value: StringEnumOptionData | string | null | undefined
): WorkingCapitalPaymentAmountCalculationStrategy {
  const raw = typeof value === 'string' ? value : (value?.id ?? value?.code);
  const key = (raw ?? '').toString().trim().toUpperCase();
  return key in WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY
    ? (key as WorkingCapitalPaymentAmountCalculationStrategy)
    : WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY.TPV;
}

/** Pricing keys of every strategy except the active one; the caller strips them from the payload. */
export function inactivePricingFields(strategy: WorkingCapitalPaymentAmountCalculationStrategy): string[] {
  return Object.entries(WC_PRICING_FIELDS_BY_STRATEGY)
    .filter(([key]) => key !== strategy)
    .flatMap(
      ([
        ,
        fields
      ]) => fields
    );
}

/**
 * EIR-related fields of GET /working-capital-loans/{loanId}. The three rates share the word EIR
 * but mean different things: `annualEir` is the contractual input (ANNUAL_EIR strategy only),
 * `calculatedAnnualEir` is the annual rate the engine resolved for any EIR amortization (null
 * for FLAT or before the schedule exists), and the schedule's `effectiveInterestRate` is the
 * daily periodic rate derived from it.
 */
export interface WorkingCapitalLoanPricing {
  paymentAmountCalculationStrategy?: StringEnumOptionData | null;
  annualEir?: number | null;
  calculatedAnnualEir?: number | null;
  paymentAmount?: number | null;
  periodPaymentAmount?: number | null;
  numberOfRepayments?: number | null;
  totalPaymentVolume?: number | null;
  paymentRate?: number | null;
}

/** Code value option used to populate the charge-off reason dropdown. */
export interface WorkingCapitalChargeOffReasonOption {
  id: number;
  name: string;
  position?: number;
  description?: string;
  isActive?: boolean;
}

/**
 * Response of GET /working-capital-loans/{loanId}/transactions/template?command=chargeOff.
 *
 * `expectedAmount` is the outstanding balance the charge-off will write off. Every command served by
 * that endpoint reports its amount in the same field - the caller asked for one specific command, so
 * it already knows what the number means.
 */
export interface WorkingCapitalChargeOffTemplate {
  expectedAmount: number;
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

/** Response of GET /working-capital-loans/{loanId}/amortization-schedule. Field names follow ProjectedAmortizationScheduleData. */
export interface ProjectedAmortizationSchedule {
  discountFeeAmount: number;
  netDisbursementAmount: number;
  totalPaymentVolume: number | null;
  periodPaymentRate: number | null;
  /** Which input the plan was solved from; decides which of the three inputs beside it is set. */
  paymentAmountCalculationStrategy?: StringEnumOptionData | null;
  annualEir?: number | null;
  paymentAmount?: number | null;
  npvDayCount: number;
  expectedDisbursementDate: Date;
  expectedPaymentAmount: number;
  originalPaymentNumber: number;
  /** DAILY periodic rate derived from calculatedAnnualEir. Null for FLAT amortization. */
  effectiveInterestRate: number | null;
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

export interface WorkingCapitalLoanTransaction {
  id: number;
  type: LoanTransactionType;
  transactionDate: number[] | string;
  reversed: boolean;
  currency: Currency;
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

/** Classification code value used to populate the repayment classification dropdown. */
export interface WorkingCapitalClassificationOption {
  id: number;
  name: string;
}

/**
 * The commands GET /working-capital-loans/{loanId}/transactions/template serves.
 *
 * Mirrors the set the backend dispatches on; approval is deliberately absent, as it is the one command still served
 * by the separate action-template endpoint.
 */
export type WorkingCapitalTransactionTemplateCommand =
  | 'disburse'
  | 'repayment'
  | 'goodwillCredit'
  | 'creditBalanceRefund'
  | 'recoveryPayment'
  | 'discountFee'
  | 'discountFeeAdjustment'
  | 'chargeOff'
  | 'prepayLoan';

/**
 * Response of GET /working-capital-loans/{loanId}/transactions/template?command=prepayLoan.
 *
 * The payoff quote that closes the loan: `expectedAmount` is the total, and the three
 * portions break it down. The quote is the balance as of `transactionDate`, so anything
 * disbursed, charged or adjusted after that date is left out. Payments are not scoped
 * the same way - the amount stays net of every repayment already made, which is what
 * keeps a backdated payoff from closing the loan and then overpaying it.
 */
export interface WorkingCapitalPrepaymentTemplate {
  wcLoanId: number;
  currency: Currency;
  transactionDate: number[] | string;
  expectedAmount: number;
  principalPortion: number;
  feeChargesPortion: number;
  penaltyChargesPortion: number;
  paymentTypeOptions: PaymentType[];
  classificationOptions: WorkingCapitalClassificationOption[];
}

/**
 * Request body for POST /working-capital-loans/{loanId}/transactions?command=repayment
 * as sent by the prepayment screen. A prepayment is an ordinary repayment for the
 * full outstanding balance, so it carries no dedicated command of its own.
 */
export interface WorkingCapitalPrepaymentRequest {
  transactionDate: string;
  transactionAmount: number;
  classificationId?: number;
  note?: string;
  externalId?: string;
  paymentDetails?: WorkingCapitalPaymentDetails;
  locale: string;
  dateFormat: string;
}
