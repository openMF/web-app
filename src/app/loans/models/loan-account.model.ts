/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CodeValue, Currency } from 'app/shared/models/general.model';

export interface DelinquencyRange {
  id: number;
  classification: string;
  minimumAgeDays: number;
}

export interface DelinquentData {
  availableDisbursementAmount: number;
  availableDisbursementAmountWithOverApplied: number;
  pastDueDays: number;
  nextPaymentDueDate: number[];
  delinquentDays: number;
  delinquentDate: number[];
  delinquentAmount: number;
  lastPaymentAmount: number;
  lastRepaymentAmount: number;
  delinquencyCalculationPaused: boolean;
  installmentLevelDelinquency?: InstallmentLevelDelinquency[];
}

export interface InstallmentLevelDelinquency {
  rangeId: number;
  classification: string;
  minimumAgeDays: number;
  delinquentAmount: number;
}

export interface LoanDelinquencyTags {
  id: number;
  loanId: number;
  delinquencyRange: DelinquencyRange;
  addedOnDate: number[];
  liftedOnDate: number[];
}

export interface LoanDelinquencyAction {
  id: number;
  action: string;
  startDate: number[];
  endDate: number[];
  createdById: number;
  createdOn: Date;
  updatedById: number;
  lastModifiedOn: Date;
}

export interface DelinquencyPausePeriod {
  active: boolean;
  pausePeriodStart: number[];
  pausePeriodEnd: number[];
}

export interface RepaymentSchedule {
  currency: Currency;
  loanTermInDays: number;
  totalPrincipalDisbursed: number;
  totalPrincipalExpected: number;
  totalPrincipalPaid: number;
  totalInterestCharged: number;
  totalFeeChargesCharged: number;
  totalPenaltyChargesCharged: number;
  totalWaived: number;
  totalWrittenOff: number;
  totalRepaymentExpected: number;
  totalRepayment: number;
  totalPaidInAdvance: number;
  totalPaidLate: number;
  totalOutstanding: number;
  totalCredits: number;
  periods: RepaymentSchedulePeriod[];
}

export interface RepaymentSchedulePeriod {
  dueDate: number[];
  principalDisbursed?: number;
  principalLoanBalanceOutstanding: number;
  feeChargesDue: number;
  feeChargesPaid: number;
  feeChargesOutstanding: number;
  totalOriginalDueForPeriod: number;
  totalDueForPeriod: number;
  totalPaidForPeriod: number;
  totalOutstandingForPeriod: number;
  totalOverdue?: number;
  totalActualCostOfLoanForPeriod: number;
  totalCredits: number;
  period?: number;
  fromDate?: number[];
  complete?: boolean;
  isAdditional?: boolean;
  downPaymentPeriod?: boolean;
  daysInPeriod?: number;
  principalOriginalDue?: number;
  principalDue?: number;
  principalPaid?: number;
  principalWrittenOff?: number;
  principalOutstanding?: number;
  interestOriginalDue?: number;
  interestDue?: number;
  interestPaid?: number;
  interestWaived?: number;
  interestWrittenOff?: number;
  interestOutstanding?: number;
  feeChargesWaived?: number;
  feeChargesWrittenOff?: number;
  penaltyChargesDue?: number;
  penaltyChargesPaid?: number;
  penaltyChargesWaived?: number;
  penaltyChargesWrittenOff?: number;
  penaltyChargesOutstanding?: number;
  totalPaidInAdvanceForPeriod?: number;
  totalPaidLateForPeriod?: number;
  totalWaivedForPeriod?: number;
  totalWrittenOffForPeriod?: number;
  totalInstallmentAmountForPeriod?: number;
}

export interface DisbursementData {
  actualDisbursementDate: Date;
  expectedDisbursementDate: Date;
  principal: number;
  id?: number;
}

export interface LoanDeferredIncomeData {
  capitalizedIncomeData: LoanCapitalizedIncomeData[];
}

export interface LoanCapitalizedIncomeData {
  amount: number;
  amortizedAmount?: number;
  unrecognizedAmount?: number;
  amountAdjustment?: number;
}

export interface BuyDownFeeAmortizationDetails {
  id: number;
  loanId: number;
  transactionId: number;
  buyDownFeeDate: string;
  buyDownFeeAmount: number;
  amortizedAmount: number;
  notYetAmortizedAmount: number;
  adjustedAmount: number;
  chargedOffAmount: number;
}

export interface EditablePeriod extends RepaymentSchedulePeriod {
  changed?: boolean;
}

export interface EditableRepaymentSchedule extends RepaymentSchedule {
  periods: EditablePeriod[];
}

export interface RepaymentScheduleEditCache {
  edit: boolean;
  data: RepaymentSchedulePeriod;
}

export interface ScheduleChangeRecord {
  dueDate: string;
  installmentAmount: number;
}

export interface LoanOriginator {
  id: number;
  externalId: string;
  name: string;
  status: string;
  originatorType: CodeValue;
  channelType: CodeValue;
}
