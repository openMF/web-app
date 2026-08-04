/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Currency } from 'app/shared/models/general.model';

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
  createdDate: Date;
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
