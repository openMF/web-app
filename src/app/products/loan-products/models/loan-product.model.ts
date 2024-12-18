import {AccountingMapping, ChargeOffReasonToExpenseAccountMapping, ChargeToIncomeAccountMapping, Currency, PaymentChannelToFundSourceMapping} from 'app/shared/models/general.model';
import { OptionData, StringEnumOptionData } from 'app/shared/models/option-data.model';
import { CreditAllocation, PaymentAllocation } from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';

export interface LoanProduct {
  id:                                                        number;
  name:                                                      string;
  shortName:                                                 string;
  includeInBorrowerCycle:                                    boolean;
  useBorrowerCycle:                                          boolean;
  status:                                                    string;
  currency:                                                  Currency;
  currencyCode?:                                             string;
  fundId?:                                                   number;
  fundName?:                                                 string;
  startDate?:                                                string;
  closeDate?:                                                string;
  description?:                                              string;
  installmentAmountInMultiplesOf?:                           number;
  principal:                                                 number;
  minPrincipal?:                                             number;
  maxPrincipal?:                                             number;
  numberOfRepayments:                                        number;
  minNumberOfRepayments?:                                    number;
  maxNumberOfRepayments?:                                    number;
  repaymentEvery:                                            number;
  repaymentFrequencyType:                                    OptionData;
  minimumDaysBetweenDisbursalAndFirstRepayment?:             number;
  interestRatePerPeriod:                                     number;
  interestRateFrequencyType:                                 OptionData;
  annualInterestRate:                                        number;
  isLinkedToFloatingInterestRates:                           boolean;
  isFloatingInterestRateCalculationAllowed:                  boolean;
  allowVariableInstallments:                                 boolean;
  minimumGap:                                                number;
  maximumGap:                                                number;
  amortizationType:                                          OptionData;
  interestType:                                              OptionData;
  interestCalculationPeriodType:                             OptionData;
  allowPartialPeriodInterestCalculation:                     boolean;
  transactionProcessingStrategyCode:                         string;
  transactionProcessingStrategyName:                         string;
  paymentAllocation?:                                        PaymentAllocation[];
  creditAllocation?:                                         CreditAllocation[];
  daysInMonthType:                                           OptionData;
  daysInYearType:                                            OptionData;
  isInterestRecalculationEnabled:                            boolean;
  interestRecalculationData?:                                InterestRecalculationData;
  interestRecalculationCompoundingMethod?:                   number;
  preClosureInterestCalculationStrategy?:                    number;
  rescheduleStrategyMethod?:                                 number;
  recalculationCompoundingFrequencyType?:                    number;
  recalculationRestFrequencyType?:                           number;
  allowCompoundingOnEod?:                                    boolean;
  disallowInterestCalculationOnPastDue?:                     boolean;
  isArrearsBasedOnOriginalSchedule?:                         boolean;
  isCompoundingToBePostedAsTransaction?:                     boolean;
  recalculationRestFrequencyInterval?:                       number;

  canDefineInstallmentAmount:                                boolean;
  graceOnArrearsAgeing?:                                     number;
  overdueDaysForNPA?:                                        number;
  repaymentStartDateType:                                    OptionData;
  charges:                                                   any[];
  principalVariationsForBorrowerCycle:                       any[];
  interestRateVariationsForBorrowerCycle:                    any[];
  numberOfRepaymentVariationsForBorrowerCycle:               any[];
  canUseForTopup:                                            boolean;
  isRatesEnabled:                                            boolean;
  rates:                                                     any[];
  advancedPaymentAllocationTransactionTypes:                 OptionData[];
  advancedPaymentAllocationFutureInstallmentAllocationRules: OptionData[];
  advancedPaymentAllocationTypes:                            OptionData[];
  creditAllocationTransactionTypes:                          OptionData[];
  creditAllocationAllocationTypes:                           OptionData[];
  multiDisburseLoan:                                         boolean;
  maxTrancheCount:                                           number;
  disallowExpectedDisbursements:                             boolean;
  allowApprovedDisbursedAmountsOverApplied:                  boolean;
  overAppliedNumber:                                         number;
  principalThresholdForLastInstallment:                      number;
  holdGuaranteeFunds:                                        boolean;
  accountMovesOutOfNPAOnlyOnArrearsCompletion:               boolean;
  allowAttributeOverrides:                                   AllowAttributeOverrides;
  syncExpectedWithDisbursementDate:                          boolean;
  isEqualAmortization:                                       boolean;
  delinquencyBucketOptions:                                  DelinquencyBucket[];
  delinquencyBucket:                                         DelinquencyBucket;
  delinquencyBucketId?:                                      number;
  graceOnPrincipalPayment?:                                  number;
  graceOnInterestPayment?:                                   number;
  graceOnInterestCharged?:                                   number;
  inArrearsTolerance?:                                       number;
  dueDaysForRepaymentEvent:                                  number;
  overDueDaysForRepaymentEvent:                              number;
  enableDownPayment:                                         boolean;
  enableAutoRepaymentForDownPayment:                         boolean;
  enableInstallmentLevelDelinquency:                         boolean;
  loanScheduleType:                                          OptionData;
  loanScheduleProcessingType:                                OptionData;
  allowAttributeConfiguration?:                              boolean;
  // Accounting
  accountingRule:                                            any;
  accountingMappings?:                                       { [key: string]: AccountingMapping };
  fundSourceAccountId?:                                      number;
  goodwillCreditAccountId?:                                  number;
  incomeFromChargeOffFeesAccountId?:                         number;
  incomeFromChargeOffInterestAccountId?:                     number;
  incomeFromChargeOffPenaltyAccountId?:                      number;
  incomeFromFeeAccountId?:                                   number;
  incomeFromGoodwillCreditFeesAccountId?:                    number;
  incomeFromGoodwillCreditInterestAccountId?:                number;
  incomeFromGoodwillCreditPenaltyAccountId?:                 number;
  incomeFromPenaltyAccountId?:                               number;
  incomeFromRecoveryAccountId?:                              number;
  interestOnLoanAccountId?:                                  number;
  loanPortfolioAccountId?:                                   number;
  overpaymentLiabilityAccountId?:                            number;
  receivableInterestAccountId?:                              number;
  receivableFeeAccountId?:                                   number;
  receivablePenaltyAccountId?:                               number;
  transfersInSuspenseAccountId?:                             number;
  writeOffAccountId?:                                        number;
  // Advanced Accounting
  paymentChannelToFundSourceMappings?:                       PaymentChannelToFundSourceMapping[];
  feeToIncomeAccountMappings?:                               ChargeToIncomeAccountMapping[];
  penaltyToIncomeAccountMappings?:                           ChargeToIncomeAccountMapping[];
  chargeOffReasonToExpenseAccountMappings?:                  ChargeOffReasonToExpenseAccountMapping[];
  enableAccrualActivityPosting?:                             boolean;
  supportedInterestRefundTypes?:                             StringEnumOptionData[];
  chargeOffBehaviour?:                                       StringEnumOptionData;
}


export interface AllowAttributeOverrides {
  amortizationType:                   boolean;
  interestType:                       boolean;
  transactionProcessingStrategyCode:  boolean;
  interestCalculationPeriodType:      boolean;
  inArrearsTolerance:                 boolean;
  repaymentEvery:                     boolean;
  graceOnPrincipalAndInterestPayment: boolean;
  graceOnArrearsAgeing:               boolean;
  isNew:                              boolean;
}

export interface DelinquencyBucket {
  id:      number;
  name:    string;
  ranges?: Range[];
}

export interface Range {
  id:              number;
  classification:  string;
  minimumAgeDays:  number;
  maximumAgeDays?: number;
}


export interface InterestRecalculationData {
  id?:                                    number;
  productId?:                             number;
  recalculationCompoundingFrequencyType:  OptionData;
  interestRecalculationCompoundingType:   OptionData;
  rescheduleStrategyType:                 OptionData;
  recalculationRestFrequencyType:         OptionData;
  recalculationRestFrequencyInterval:     number;
  isArrearsBasedOnOriginalSchedule:       boolean;
  isCompoundingToBePostedAsTransaction:   boolean;
  preClosureInterestCalculationStrategy:  OptionData;
  allowCompoundingOnEod:                  boolean;
  disallowInterestCalculationOnPastDue:   boolean;
}
