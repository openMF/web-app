/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
}

export interface WorkingCapitalLoanDiscountUpdateRequest {
  transactionAmount: number;
  relatedResourceId: number;
  externalId?: string;
  note?: string;
  locale: string;
  dateFormat: string;
}
