
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

export interface LoanDelinquencyTags {
  id:               number;
  loanId:           number;
  delinquencyRange: DelinquencyRange;
  addedOnDate:      number[];
  liftedOnDate:     number[];
}

export interface LoanDelinquencyAction {
  id:             number;
  action:         string;
  startDate:      number[];
  endDate:        number[];
  createdById:    number;
  createdOn:      Date;
  updatedById:    number;
  lastModifiedOn: Date;
}

export interface DelinquencyPausePeriod {
  active:           boolean;
  pausePeriodStart: number[];
  pausePeriodEnd:   number[];
}
