import { Currency } from 'app/shared/models/general.model';

export interface DelinquencyRange {
  id: number;
  classification: string;
  minimumAgeDays: number;
}

export interface DelinquentData {
  availableDisbursementAmount: number;
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
