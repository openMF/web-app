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
  count: number;
  paymentsLeft: number;
  expectedPaymentAmount: number;
  discountFactor: number;
  npvValue: number;
  balance: number;
  deferredBalance: number;
  forecastPaymentAmount?: number;
  expectedAmortizationAmount?: number;
  netAmortizationAmount?: number;
  incomeModification?: number;
}

export interface WorkingCapitalBalances {
  id: number;
  principal?: number;
  principalPaid?: number;
  principalOutstanding: number;
  fee?: number;
  feePaid?: number;
  feeOutstanding?: number;
  penalty?: number;
  penaltyPaid?: number;
  penaltyOutstanding?: number;
  realizedIncomeFromDiscountFee?: number;
  unrealizedIncomeFromDiscountFee?: number;
  totalExpectedRepayment?: number;
  totalRepayment?: number;
  totalOutstanding?: number;
  totalDisbursement?: number;
  totalDiscountFee?: number;
  overpaymentAmount?: number;
}
