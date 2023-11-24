
export interface DelinquencyRange {
  id:             number;
  classification: string;
  minimumAgeDays: number;
}

export interface DelinquentData {
  availableDisbursementAmount:   number;
  pastDueDays:                   number;
  nextPaymentDueDate:            number[];
  delinquentDays:                number;
  delinquentDate:                number[];
  delinquentAmount:              number;
  lastPaymentAmount:             number;
  lastRepaymentAmount:           number;
  delinquencyCalculationPaused:  boolean;
  installmentLevelDelinquency?:  InstallmentLevelDelinquency[];
}

export interface InstallmentLevelDelinquency {
  rangeId:          number;
  classification:   string;
  minimumAgeDays:   number;
  delinquentAmount: number;
}
