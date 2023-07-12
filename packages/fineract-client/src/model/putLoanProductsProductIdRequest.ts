/**
 * Apache Fineract REST API
 * Apache Fineract is a secure, multi-tenanted microfinance platform. The goal of the Apache Fineract API is to empower developers to build apps on top of the Apache Fineract Platform. The https://cui.fineract.dev[reference app] (username: mifos, password: password) works on the same demo tenant as the interactive links in this documentation. Until we complete the new REST API documentation you still have the legacy documentation available https://fineract.apache.org/legacy-docs/apiLive.htm[here]. Please check https://fineract.apache.org/docs/current[the Fineract documentation] for more information.
 *
 * The version of the OpenAPI document: 0.0.0-9ca128fc
 * Contact: dev@fineract.apache.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { AllowAttributeOverrides } from './allowAttributeOverrides';
import { ChargeToGLAccountMapper } from './chargeToGLAccountMapper';
import { GetLoanPaymentChannelToFundSourceMappings } from './getLoanPaymentChannelToFundSourceMappings';
import { RateData } from './rateData';
import { GetLoanFeeToIncomeAccountMappings } from './getLoanFeeToIncomeAccountMappings';
import { ChargeData } from './chargeData';


/**
 * PutLoanProductsProductIdRequest
 */
export interface PutLoanProductsProductIdRequest { 
    accountMovesOutOfNPAOnlyOnArrearsCompletion?: boolean;
    accountingRule?: number;
    allowApprovedDisbursedAmountsOverApplied?: boolean;
    allowAttributeOverrides?: AllowAttributeOverrides;
    allowPartialPeriodInterestCalcualtion?: boolean;
    allowVariableInstallments?: boolean;
    amortizationType?: number;
    canDefineInstallmentAmount?: boolean;
    canUseForTopup?: boolean;
    chargeOffExpenseAccountId?: number;
    chargeOffFraudExpenseAccountId?: number;
    charges?: Array<ChargeData>;
    closeDate?: string;
    currencyCode?: string;
    dateFormat?: string;
    daysInMonthType?: number;
    daysInYearType?: number;
    delinquencyBucketId?: number;
    description?: string;
    digitsAfterDecimal?: number;
    disallowExpectedDisbursements?: boolean;
    dueDaysForRepaymentEvent?: number;
    feeToIncomeAccountMappings?: Array<GetLoanFeeToIncomeAccountMappings>;
    fixedPrincipalPercentagePerInstallment?: number;
    fundId?: number;
    fundSourceAccountId?: number;
    goodwillCreditAccountId?: number;
    graceOnArrearsAgeing?: number;
    graceOnInterestPayment?: number;
    graceOnPrincipalPayment?: number;
    holdGuaranteeFunds?: boolean;
    inArrearsTolerance?: number;
    inMultiplesOf?: number;
    includeInBorrowerCycle?: boolean;
    incomeFromChargeOffFeesAccountId?: number;
    incomeFromChargeOffInterestAccountId?: number;
    incomeFromChargeOffPenaltyAccountId?: number;
    incomeFromFeeAccountId?: number;
    incomeFromGoodwillCreditFeesAccountId?: number;
    incomeFromGoodwillCreditInterestAccountId?: number;
    incomeFromGoodwillCreditPenaltyAccountId?: number;
    incomeFromPenaltyAccountId?: number;
    incomeFromRecoveryAccountId?: number;
    installmentAmountInMultiplesOf?: number;
    interestCalculationPeriodType?: number;
    interestOnLoanAccountId?: number;
    interestRateFrequencyType?: number;
    interestRatePerPeriod?: number;
    interestRateVariationsForBorrowerCycle?: Array<number>;
    interestRecalculationCompoundingMethod?: number;
    interestType?: number;
    isEqualAmortization?: boolean;
    isInterestRecalculationEnabled?: boolean;
    isLinkedToFloatingInterestRates?: boolean;
    loanPortfolioAccountId?: number;
    locale?: string;
    maxInterestRatePerPeriod?: number;
    maxNumberOfRepayments?: number;
    maxPrincipal?: number;
    maxTrancheCount?: number;
    minInterestRatePerPeriod?: number;
    minNumberOfRepayments?: number;
    minPrincipal?: number;
    minimumDaysBetweenDisbursalAndFirstRepayment?: number;
    multiDisburseLoan?: boolean;
    name?: string;
    numberOfRepaymentVariationsForBorrowerCycle?: Array<number>;
    numberOfRepayments?: number;
    outstandingLoanBalance?: number;
    overAppliedCalculationType?: string;
    overAppliedNumber?: number;
    overDueDaysForRepaymentEvent?: number;
    overdueDaysForNPA?: number;
    overpaymentLiabilityAccountId?: number;
    paymentChannelToFundSourceMappings?: Array<GetLoanPaymentChannelToFundSourceMappings>;
    penaltyToIncomeAccountMappings?: Array<ChargeToGLAccountMapper>;
    preClosureInterestCalculationStrategy?: number;
    principal?: number;
    principalThresholdForLastInstallment?: number;
    principalVariationsForBorrowerCycle?: Array<number>;
    rates?: Array<RateData>;
    recalculationCompoundingFrequencyInterval?: number;
    recalculationCompoundingFrequencyOnDayType?: number;
    recalculationCompoundingFrequencyType?: number;
    recalculationRestFrequencyInterval?: number;
    recalculationRestFrequencyType?: number;
    receivableFeeAccountId?: number;
    receivableInterestAccountId?: number;
    receivablePenaltyAccountId?: number;
    repaymentEvery?: number;
    repaymentFrequencyType?: number;
    rescheduleStrategyMethod?: number;
    shortName?: string;
    startDate?: string;
    transactionProcessingStrategyCode?: string;
    transfersInSuspenseAccountId?: number;
    useBorrowerCycle?: boolean;
    writeOffAccountId?: number;
}

