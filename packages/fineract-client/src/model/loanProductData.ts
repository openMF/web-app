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
import { GLAccountData } from './gLAccountData';
import { TransactionProcessingStrategyData } from './transactionProcessingStrategyData';
import { LoanProductConfigurableAttributes } from './loanProductConfigurableAttributes';
import { FundData } from './fundData';
import { LoanProductGuaranteeData } from './loanProductGuaranteeData';
import { ChargeData } from './chargeData';
import { EnumOptionData } from './enumOptionData';
import { PaymentTypeData } from './paymentTypeData';
import { ChargeToGLAccountMapper } from './chargeToGLAccountMapper';
import { LoanProductBorrowerCycleVariationData } from './loanProductBorrowerCycleVariationData';
import { CurrencyData } from './currencyData';
import { DelinquencyBucketData } from './delinquencyBucketData';
import { RateData } from './rateData';
import { FloatingRateData } from './floatingRateData';
import { LoanProductInterestRecalculationData } from './loanProductInterestRecalculationData';
import { PaymentTypeToGLAccountMapper } from './paymentTypeToGLAccountMapper';


export interface LoanProductData { 
    accountMovesOutOfNPAOnlyOnArrearsCompletion?: boolean;
    accountingMappingOptions?: { [key: string]: Array<GLAccountData>; };
    accountingMappings?: { [key: string]: object; };
    accountingRule?: EnumOptionData;
    accountingRuleOptions?: Array<EnumOptionData>;
    allowApprovedDisbursedAmountsOverApplied?: boolean;
    allowAttributeOverrides?: LoanProductConfigurableAttributes;
    allowPartialPeriodInterestCalculation?: boolean;
    allowVariableInstallments?: boolean;
    amortizationType?: EnumOptionData;
    amortizationTypeOptions?: Array<EnumOptionData>;
    annualInterestRate?: number;
    canDefineInstallmentAmount?: boolean;
    canUseForTopup?: boolean;
    chargeOptions?: Array<ChargeData>;
    charges?: Array<ChargeData>;
    closeDate?: string;
    compoundingToBePostedAsTransaction?: boolean;
    currency?: CurrencyData;
    currencyOptions?: Array<CurrencyData>;
    daysInMonthType?: EnumOptionData;
    daysInMonthTypeOptions?: Array<EnumOptionData>;
    daysInYearType?: EnumOptionData;
    daysInYearTypeOptions?: Array<EnumOptionData>;
    defaultDifferentialLendingRate?: number;
    delinquencyBucket?: DelinquencyBucketData;
    delinquencyBucketOptions?: Array<DelinquencyBucketData>;
    description?: string;
    disallowExpectedDisbursements?: boolean;
    dueDaysForRepaymentEvent?: number;
    equalAmortization?: boolean;
    externalId?: string;
    feeToIncomeAccountMappings?: Array<ChargeToGLAccountMapper>;
    fixedPrincipalPercentagePerInstallment?: number;
    floatingInterestRateCalculationAllowed?: boolean;
    floatingRateId?: number;
    floatingRateName?: string;
    floatingRateOptions?: Array<FloatingRateData>;
    fundId?: number;
    fundName?: string;
    fundOptions?: Array<FundData>;
    graceOnArrearsAgeing?: number;
    graceOnInterestCharged?: number;
    graceOnInterestPayment?: number;
    graceOnPrincipalPayment?: number;
    holdGuaranteeFunds?: boolean;
    id?: number;
    inArrearsTolerance?: number;
    includeInBorrowerCycle?: boolean;
    installmentAmountInMultiplesOf?: number;
    interestCalculationPeriodType?: EnumOptionData;
    interestCalculationPeriodTypeOptions?: Array<EnumOptionData>;
    interestRateDifferential?: number;
    interestRateFrequencyType?: EnumOptionData;
    interestRateFrequencyTypeOptions?: Array<EnumOptionData>;
    interestRatePerPeriod?: number;
    interestRateVariationsForBorrowerCycle?: Array<LoanProductBorrowerCycleVariationData>;
    interestRecalculationCompoundingTypeOptions?: Array<EnumOptionData>;
    interestRecalculationData?: LoanProductInterestRecalculationData;
    interestRecalculationDayOfWeekTypeOptions?: Array<EnumOptionData>;
    interestRecalculationEnabled?: boolean;
    interestRecalculationFrequencyTypeOptions?: Array<EnumOptionData>;
    interestRecalculationNthDayTypeOptions?: Array<EnumOptionData>;
    interestType?: EnumOptionData;
    interestTypeOptions?: Array<EnumOptionData>;
    isAllowPartialPeriodInterestCalculation?: boolean;
    isEqualAmortization?: boolean;
    isFloatingInterestRateCalculationAllowed?: boolean;
    isInterestRecalculationEnabled?: boolean;
    isLinkedToFloatingInterestRates?: boolean;
    isRatesEnabled?: boolean;
    linkedToFloatingInterestRates?: boolean;
    loanProductConfigurableAttributes?: LoanProductConfigurableAttributes;
    maxDifferentialLendingRate?: number;
    maxInterestRatePerPeriod?: number;
    maxNumberOfRepayments?: number;
    maxPrincipal?: number;
    maxTrancheCount?: number;
    maximumGap?: number;
    minDifferentialLendingRate?: number;
    minInterestRatePerPeriod?: number;
    minNumberOfRepayments?: number;
    minPrincipal?: number;
    minimumDaysBetweenDisbursalAndFirstRepayment?: number;
    minimumGap?: number;
    multiDisburseLoan?: boolean;
    name?: string;
    numberOfRepaymentVariationsForBorrowerCycle?: Array<LoanProductBorrowerCycleVariationData>;
    numberOfRepayments?: number;
    outstandingLoanBalance?: number;
    overAppliedCalculationType?: string;
    overAppliedNumber?: number;
    overDueDaysForRepaymentEvent?: number;
    overdueDaysForNPA?: number;
    paymentChannelToFundSourceMappings?: Array<PaymentTypeToGLAccountMapper>;
    paymentTypeOptions?: Array<PaymentTypeData>;
    penaltyOptions?: Array<ChargeData>;
    penaltyToIncomeAccountMappings?: Array<ChargeToGLAccountMapper>;
    preClosureInterestCalculationStrategyOptions?: Array<EnumOptionData>;
    principal?: number;
    principalThresholdForLastInstallment?: number;
    principalVariationsForBorrowerCycle?: Array<LoanProductBorrowerCycleVariationData>;
    productGuaranteeData?: LoanProductGuaranteeData;
    rateOptions?: Array<RateData>;
    rates?: Array<RateData>;
    ratesEnabled?: boolean;
    recurringMoratoriumOnPrincipalPeriods?: number;
    repaymentEvery?: number;
    repaymentFrequencyType?: EnumOptionData;
    repaymentFrequencyTypeOptions?: Array<EnumOptionData>;
    rescheduleStrategyTypeOptions?: Array<EnumOptionData>;
    shortName?: string;
    startDate?: string;
    status?: string;
    syncExpectedWithDisbursementDate?: boolean;
    transactionProcessingStrategyCode?: string;
    transactionProcessingStrategyName?: string;
    transactionProcessingStrategyOptions?: Array<TransactionProcessingStrategyData>;
    useBorrowerCycle?: boolean;
    valueConditionTypeOptions?: Array<EnumOptionData>;
}

