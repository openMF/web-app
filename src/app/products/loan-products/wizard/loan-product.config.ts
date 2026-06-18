/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * loanProduct.config.ts (ported)
 * Source: mifos-loan-product-v2/src/loanProductConfig.ts
 */

// HIDDEN_DEFAULTS and FORM_STEPS copied from upstream
export const HIDDEN_DEFAULTS: Record<string, unknown> = {
  description: 'Personal Loan Product',
  includeInBorrowerCycle: false,
  digitsAfterDecimal: 2,
  inMultiplesOf: 1,
  installmentAmountInMultiplesOf: 1,
  useBorrowerCycle: false,
  isLinkedToFloatingInterestRates: false,
  allowApprovedDisbursedAmountsOverApplied: false,
  overAppliedCalculationType: null,
  overAppliedNumber: null,
  interestRecognitionOnDisbursementDate: false,
  principalVariationsForBorrowerCycle: [],
  numberOfRepaymentVariationsForBorrowerCycle: [],
  repaymentStartDateType: 1,
  interestRateVariationsForBorrowerCycle: [],
  inArrearsTolerance: 50,
  canDefineInstallmentAmount: true,
  graceOnArrearsAgeing: 5,
  overdueDaysForNPA: 90,
  accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
  allowVariableInstallments: true,
  holdGuaranteeFunds: false,
  multiDisburseLoan: true,
  maxTrancheCount: 4,
  outstandingLoanBalance: 100000,
  disallowExpectedDisbursements: true,
  allowFullTermForTranche: false,
  'allowAttributeOverrides.amortizationType': true,
  'allowAttributeOverrides.interestType': true,
  'allowAttributeOverrides.transactionProcessingStrategyCode': true,
  'allowAttributeOverrides.interestCalculationPeriodType': true,
  'allowAttributeOverrides.inArrearsTolerance': true,
  'allowAttributeOverrides.repaymentEvery': true,
  'allowAttributeOverrides.graceOnPrincipalAndInterestPayment': true,
  'allowAttributeOverrides.graceOnArrearsAgeing': true,
  enableDownPayment: false,
  loanChargeOffBehaviour: 'Regular',
  enableInstallmentLevelDelinquency: false,
  useGlobalConfigForRepaymentEvent: true,
  dueDaysForRepaymentEvent: 1,
  overDueDaysForRepaymentEvent: 1,
  supportedInterestRefundTypes: null,
  enableIncomeCapitalization: false,
  enableBuydownFees: false
};

export interface ProductCard {
  name: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  route?: string;
  ctaLabel?: string;
}

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
export interface SelectOption {
  value: string | number;
  label: string;
}
export interface FormField {
  label: string;
  key: string;
  type: FieldType;
  required?: boolean;
  visible?: boolean;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  options?: SelectOption[];
}
export interface FormStep {
  id: number;
  title: string;
  icon: string;
  fields: FormField[];
}

export const PRODUCT_CARDS: ProductCard[] = [
  {
    name: 'Custom / Advanced',
    description: 'Flexible configuration with advanced controls for tranche and arrears behavior.',
    active: true,
    disabled: false,
    route: 'custom-advanced',
    ctaLabel: 'Create Custom / Advanced'
  },
  {
    name: 'Personal Loan',
    description:
      'Unsecured funding for personal needs like travel, medical expenses, or weddings, with flexible tenure and minimal documentation.',
    active: true,
    disabled: false,
    route: 'personal-loan'
  },
  {
    name: 'Two Wheeler Loan',
    description: 'Finance for new or used two-wheelers with quick approval and flexible down payment options.',
    active: false,
    disabled: true
  },
  {
    name: 'JLG Loan',
    description:
      'Group-backed microloans for individuals in a Joint Liability Group, typically for income-generating activities.',
    active: false,
    disabled: true
  },
  {
    name: 'Education Loan',
    description:
      'Funding for tuition and related expenses for domestic or international studies, with repayment options aligned to course duration.',
    active: false,
    disabled: true
  },
  {
    name: 'Home Loan',
    description: 'Long-tenure financing to purchase, construct, or renovate a residential property.',
    active: false,
    disabled: true
  },
  {
    name: 'Mortgage Loan (LAP)',
    description: 'Loan against property where an existing residential or commercial asset is pledged as collateral.',
    active: false,
    disabled: true
  },
  {
    name: 'Agri Loan',
    description:
      'Credit for farming-related needs such as crop production, equipment, or land development, often tied to agricultural cycles.',
    active: false,
    disabled: true
  },
  {
    name: 'Auto Loan',
    description: 'Financing for new or used car purchases with structured EMIs over a chosen tenure.',
    active: false,
    disabled: true
  },
  {
    name: 'Gold Loan',
    description:
      'Quick secured loan against pledged gold ornaments or coins, with fast disbursal and minimal paperwork.',
    active: false,
    disabled: true
  },
  {
    name: 'Consumer Durable Loan',
    description:
      'Point-of-sale financing for electronics, appliances, and other durable goods, often with zero-cost EMI options.',
    active: false,
    disabled: true
  },
  {
    name: 'Loan vs Securities / FD',
    description:
      'Credit extended against shares, mutual funds, or fixed deposits without liquidating the underlying investment.',
    active: false,
    disabled: true
  },
  {
    name: 'Credit Card EMI',
    description: 'Converts card spends or available credit limit into structured EMIs.',
    active: false,
    disabled: true
  },
  {
    name: 'BNPL',
    description:
      'Buy now, pay later financing for short-term, often interest-free purchases, settled in fixed installments.',
    active: false,
    disabled: true
  },
  {
    name: 'Invoice Discounting',
    description:
      'Short-term financing against unpaid invoices to improve business cash flow before customer payment is due.',
    active: false,
    disabled: true
  },
  {
    name: 'Merchant Cash Advance',
    description:
      'Working capital advanced against future card or digital sales, repaid as a percentage of daily transactions.',
    active: false,
    disabled: true
  },
  {
    name: 'Line of Credit',
    description:
      'A revolving credit limit that can be drawn, repaid, and reused as needed, with interest charged only on the amount utilized.',
    active: false,
    disabled: true
  }
];

export const LABEL_MAP: Record<string, string> = {
  name: 'Product name',
  canDefineInstallmentAmount: 'Define installment amount',
  allowVariableInstallments: 'Allow variable installments',
  multiDisburseLoan: 'Allow multiple disbursements',
  maxTrancheCount: 'Maximum tranche count',
  allowFullTermForTranche: 'Allow full term for tranche',
  inArrearsTolerance: 'In arrears tolerance',
  graceOnArrearsAgeing: 'Grace on arrears ageing',
  overdueDaysForNPA: 'Overdue days for NPA',
  shortName: 'Short code',
  externalId: 'External ID',
  currencyCode: 'Currency',
  principal: 'Principal amount',
  numberOfRepayments: 'Number of repayments',
  interestRatePerPeriod: 'Annual interest rate',
  interestRateFrequencyType: 'Interest rate frequency',
  repaymentEvery: 'Repaid every',
  repaymentFrequencyType: 'Repayment period',
  amortizationType: 'Amortization type',
  interestType: 'Interest method',
  calculateInterestForExactDays: 'Exact days calculation',
  isEqualAmortization: 'Equal amortization',
  interestCalculationPeriodType: 'Interest calculation period',
  loanScheduleType: 'Loan schedule type',
  transactionProcessingStrategyCode: 'Repayment strategy',
  loanScheduleProcessingType: 'Schedule processing',
  graceOnPrincipalPayment: 'Grace on principal (months)',
  graceOnInterestPayment: 'Grace on interest (months)',
  interestFreePeriod: 'Interest-free period (months)',
  daysInYearType: 'Days in year',
  daysInYearCustomStrategy: 'Year strategy',
  daysInMonthType: 'Days in month',
  principalThresholdForLastInstallment: 'Last installment threshold (%)',
  canUseForTopup: 'Top-up loans allowed',
  isInterestRecalculationEnabled: 'Interest recalculation',
  delinquencyBucketId: 'Delinquency bucket',
  chargeName: 'Processing charge',
  overdueCharge: 'Overdue charge',
  accountingRule: 'Accounting rule',
  description: 'Description',
  startDate: 'Start date',
  closeDate: 'Close date',
  includeInBorrowerCycle: 'Include in borrower cycle',
  digitsAfterDecimal: 'Decimal places',
  inMultiplesOf: 'Currency in multiples of',
  installmentAmountInMultiplesOf: 'Installment in multiples of',
  useBorrowerCycle: 'Use borrower cycle',
  isLinkedToFloatingInterestRates: 'Linked to floating interest rates',
  allowApprovedDisbursedAmountsOverApplied: 'Allow approval/disbursal above applied amount',
  overAppliedCalculationType: 'Over amount calculation type',
  overAppliedNumber: 'Over amount',
  minimumDaysBetweenDisbursalAndFirstRepayment: 'Minimum days between disbursal and first repayment',
  interestRecognitionOnDisbursementDate: 'Interest recognition on disbursement date',
  repaymentStartDateType: 'Repayment start date type',
  accountMovesOutOfNPAOnlyOnArrearsCompletion: 'Account moves out of NPA only on arrears completion',
  holdGuaranteeFunds: 'Place guarantee funds on-hold',
  outstandingLoanBalance: 'Maximum allowed outstanding balance',
  disallowExpectedDisbursements: 'Disallow expected disbursements',
  'allowAttributeOverrides.amortizationType': 'Allow amortization override',
  'allowAttributeOverrides.interestType': 'Allow interest method override',
  'allowAttributeOverrides.transactionProcessingStrategyCode': 'Allow repayment strategy override',
  'allowAttributeOverrides.interestCalculationPeriodType': 'Allow interest calculation period override',
  'allowAttributeOverrides.inArrearsTolerance': 'Allow arrears tolerance override',
  'allowAttributeOverrides.repaymentEvery': 'Allow repaid every override',
  'allowAttributeOverrides.graceOnPrincipalAndInterestPayment': 'Allow moratorium override',
  'allowAttributeOverrides.graceOnArrearsAgeing': 'Allow arrears ageing override',
  enableDownPayment: 'Enable down payment',
  disbursedAmountPercentageForDownPayment: 'Disbursed amount percentage for downpayment',
  enableAutoRepaymentForDownPayment: 'Enable auto repayment for downpayment',
  loanChargeOffBehaviour: 'Loan charge-off behaviour',
  enableInstallmentLevelDelinquency: 'Enable installment level delinquency',
  useGlobalConfigForRepaymentEvent: 'Use global config values for repayment event',
  dueDaysForRepaymentEvent: 'Due days for repayment event',
  overDueDaysForRepaymentEvent: 'Overdue days for repayment event',
  enableIncomeCapitalization: 'Enable income capitalization',
  enableBuydownFees: 'Enable buydown fees'
};

export const VALUE_MAP: Record<string, Record<string, string>> = {
  interestRateFrequencyType: { '2': 'Per month', '3': 'Per year' },
  repaymentFrequencyType: { '0': 'Days', '1': 'Weeks', '2': 'Months' },
  amortizationType: { '0': 'Equal principal payments', '1': 'Equal installments' },
  interestType: { '0': 'Declining balance', '1': 'Flat' },
  interestCalculationPeriodType: { '0': 'Daily', '1': 'Same as repayment period' },
  daysInYearType: { '1': 'Actual', '360': '360 days', '364': '364 days', '365': '365 days' },
  daysInMonthType: { '1': 'Same as in year', '30': '30 days' },
  accountingRule: { '1': 'None', '2': 'Cash-based', '3': 'Accrual (periodic)', '4': 'Accrual (upfront)' },
  currencyCode: { INR: 'Indian Rupee (₹)', USD: 'US Dollar ($)', EUR: 'Euro (€)', GBP: 'British Pound (£)' },
  transactionProcessingStrategyCode: {
    'interest-principal-penalties-fees-order-strategy': 'Interest → Principal → Penalties → Fees',
    'principal-interest-penalties-fees-order-strategy': 'Principal → Interest → Penalties → Fees',
    'mifos-standard-strategy': 'Mifos standard',
    'early-repayment-strategy': 'Early repayment'
  },
  canUseForTopup: { true: 'Yes', false: 'No' },
  isInterestRecalculationEnabled: { true: 'Enabled', false: 'Disabled' },
  calculateInterestForExactDays: { true: 'Yes', false: 'No' },
  isEqualAmortization: { true: 'Yes', false: 'No' },
  delinquencyBucketId: { '': 'None', '1': 'Bucket 1 – Standard', '2': 'Bucket 2 – Aggressive' },
  canDefineInstallmentAmount: { true: 'Yes', false: 'No' },
  allowVariableInstallments: { true: 'Yes', false: 'No' },
  multiDisburseLoan: { true: 'Yes', false: 'No' },
  allowFullTermForTranche: { true: 'Yes', false: 'No' },
  includeInBorrowerCycle: { true: 'Yes', false: 'No' },
  useBorrowerCycle: { true: 'Yes', false: 'No' },
  isLinkedToFloatingInterestRates: { true: 'Yes', false: 'No' },
  allowApprovedDisbursedAmountsOverApplied: { true: 'Yes', false: 'No' },
  interestRecognitionOnDisbursementDate: { true: 'Yes', false: 'No' },
  repaymentStartDateType: { '1': 'Disbursement date' },
  accountMovesOutOfNPAOnlyOnArrearsCompletion: { true: 'Yes', false: 'No' },
  holdGuaranteeFunds: { true: 'Yes', false: 'No' },
  disallowExpectedDisbursements: { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.amortizationType': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.interestType': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.transactionProcessingStrategyCode': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.interestCalculationPeriodType': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.inArrearsTolerance': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.repaymentEvery': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.graceOnPrincipalAndInterestPayment': { true: 'Yes', false: 'No' },
  'allowAttributeOverrides.graceOnArrearsAgeing': { true: 'Yes', false: 'No' },
  enableDownPayment: { true: 'Yes', false: 'No' },
  enableAutoRepaymentForDownPayment: { true: 'Yes', false: 'No' },
  loanChargeOffBehaviour: { Regular: 'Regular' },
  enableInstallmentLevelDelinquency: { true: 'Yes', false: 'No' },
  useGlobalConfigForRepaymentEvent: { true: 'Yes', false: 'No' },
  enableIncomeCapitalization: { true: 'Yes', false: 'No' },
  enableBuydownFees: { true: 'Yes', false: 'No' },
  overAppliedCalculationType: { '': 'None', Percentage: 'Percentage', Amount: 'Amount' }
};

export const REVIEW_SECTIONS: Array<{ title: string; keys: string[]; optional?: boolean }> = [
  {
    title: 'Product details',
    optional: true,
    keys: [
      'name',
      'shortName',
      'externalId',
      'description',
      'startDate',
      'closeDate',
      'currencyCode'
    ]
  },
  {
    title: 'Loan terms',
    keys: [
      'principal',
      'numberOfRepayments',
      'repaymentEvery',
      'repaymentFrequencyType',
      'interestRatePerPeriod',
      'interestRateFrequencyType'
    ]
  },
  {
    title: 'Structure & settings',
    keys: [
      'amortizationType',
      'interestType',
      'interestCalculationPeriodType',
      'loanScheduleType',
      'transactionProcessingStrategyCode',
      'daysInYearType',
      'daysInMonthType',
      'graceOnPrincipalPayment',
      'graceOnInterestPayment',
      'principalThresholdForLastInstallment',
      'canUseForTopup',
      'isInterestRecalculationEnabled',
      'delinquencyBucketId',
      'canDefineInstallmentAmount',
      'allowVariableInstallments',
      'multiDisburseLoan',
      'maxTrancheCount',
      'allowFullTermForTranche',
      'inArrearsTolerance',
      'graceOnArrearsAgeing',
      'overdueDaysForNPA'
    ]
  },
  {
    title: 'Charges',
    optional: true,
    keys: [
      'chargeName',
      'overdueCharge'
    ]
  },
  {
    title: 'Accounting',
    keys: ['accountingRule']
  },
  {
    title: 'Advanced configuration',
    optional: true,
    keys: [
      'includeInBorrowerCycle',
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'enableAutoRepaymentForDownPayment',
      'useGlobalConfigForRepaymentEvent',
      'dueDaysForRepaymentEvent',
      'overDueDaysForRepaymentEvent',
      'enableIncomeCapitalization',
      'enableBuydownFees',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'accountMovesOutOfNPAOnlyOnArrearsCompletion',
      'holdGuaranteeFunds',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowAttributeOverrides.amortizationType',
      'allowAttributeOverrides.interestType',
      'allowAttributeOverrides.transactionProcessingStrategyCode',
      'allowAttributeOverrides.interestCalculationPeriodType',
      'allowAttributeOverrides.inArrearsTolerance',
      'allowAttributeOverrides.repaymentEvery',
      'allowAttributeOverrides.graceOnPrincipalAndInterestPayment',
      'allowAttributeOverrides.graceOnArrearsAgeing'
    ]
  }
];

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'Details',
    icon: 'ti-id',
    fields: [
      {
        label: 'Loan product name',
        key: 'name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Personal Loan – Standard'
      },
      {
        label: 'Short name',
        key: 'shortName',
        type: 'text',
        required: true,
        placeholder: 'e.g. PLS',
        maxLength: 4,
        hint: 'max 4 chars'
      },
      { label: 'External ID', key: 'externalId', type: 'text', placeholder: 'e.g. PL001' },
      {
        label: 'Description',
        key: 'description',
        type: 'textarea',
        placeholder: 'e.g. Custom advance loan product'
      },
      { label: 'Start date', key: 'startDate', type: 'date', placeholder: 'Select start date' },
      { label: 'Close date', key: 'closeDate', type: 'date', placeholder: 'Select close date' },
      { label: 'Include in customer loan counter', key: 'includeInBorrowerCycle', type: 'checkbox' }
    ]
  },
  {
    id: 2,
    title: 'Currency',
    icon: 'ti-currency-dollar',
    fields: [
      {
        label: 'Currency',
        key: 'currencyCode',
        type: 'select',
        required: true,
        options: [
          { value: 'INR', label: 'INR – Indian Rupee' },
          { value: 'USD', label: 'USD – US Dollar' },
          { value: 'EUR', label: 'EUR – Euro' },
          { value: 'GBP', label: 'GBP – British Pound' }
        ]
      },
      { label: 'Decimal places', key: 'digitsAfterDecimal', type: 'number', placeholder: 'e.g. 2' },
      { label: 'Currency in multiples of', key: 'inMultiplesOf', type: 'number', placeholder: 'e.g. 1' },
      {
        label: 'Installment in multiples of',
        key: 'installmentAmountInMultiplesOf',
        type: 'number',
        placeholder: 'e.g. 10'
      },
      { label: 'Use borrower cycle', key: 'useBorrowerCycle', type: 'checkbox' }
    ]
  },
  {
    id: 3,
    title: 'Terms',
    icon: 'ti-calculator',
    fields: [
      { label: 'Principal amount', key: 'principal', type: 'number', required: true, placeholder: 'e.g. 50000' },
      {
        label: 'Number of repayments',
        key: 'numberOfRepayments',
        type: 'number',
        required: true,
        placeholder: 'e.g. 12'
      },
      {
        label: 'Annual interest rate (%)',
        key: 'interestRatePerPeriod',
        type: 'number',
        required: true,
        placeholder: 'e.g. 12'
      },
      {
        label: 'Interest rate frequency',
        key: 'interestRateFrequencyType',
        type: 'select',
        required: true,
        options: [
          { value: 2, label: 'Per month' },
          { value: 3, label: 'Per year' }
        ]
      },
      { label: 'Repaid every – value', key: 'repaymentEvery', type: 'number', required: true, placeholder: 'e.g. 1' },
      {
        label: 'Repaid every – period',
        key: 'repaymentFrequencyType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Days' },
          { value: 1, label: 'Weeks' },
          { value: 2, label: 'Months' }
        ]
      },
      { label: 'Linked to floating interest rates', key: 'isLinkedToFloatingInterestRates', type: 'checkbox' },
      {
        label: 'Allow approval/disbursal above applied amount',
        key: 'allowApprovedDisbursedAmountsOverApplied',
        type: 'checkbox'
      },
      {
        label: 'Over amount calculation type',
        key: 'overAppliedCalculationType',
        type: 'select',
        options: [
          { value: '', label: 'None' },
          { value: 'Percentage', label: 'Percentage' },
          { value: 'Amount', label: 'Amount' }
        ]
      },
      { label: 'Over amount', key: 'overAppliedNumber', type: 'number', placeholder: 'e.g. 10' },
      {
        label: 'Minimum days between disbursal and first repayment',
        key: 'minimumDaysBetweenDisbursalAndFirstRepayment',
        type: 'number',
        placeholder: 'e.g. 5'
      },
      {
        label: 'Interest recognition on disbursement date',
        key: 'interestRecognitionOnDisbursementDate',
        type: 'checkbox'
      },
      {
        label: 'Repayment start date type',
        key: 'repaymentStartDateType',
        type: 'select',
        options: [{ value: 1, label: 'Disbursement date' }]
      }
    ]
  },
  {
    id: 4,
    title: 'Settings',
    icon: 'ti-settings',
    fields: [
      {
        label: 'Amortization type',
        key: 'amortizationType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Equal principal payments' },
          { value: 1, label: 'Equal installments' }
        ]
      },
      {
        label: 'Interest method',
        key: 'interestType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Declining balance' },
          { value: 1, label: 'Flat' }
        ]
      },
      {
        label: 'Calculate interest for exact days in partial period',
        key: 'calculateInterestForExactDays',
        type: 'checkbox'
      },
      { label: 'Is equal amortization?', key: 'isEqualAmortization', type: 'checkbox' },
      {
        label: 'Interest calculation period',
        key: 'interestCalculationPeriodType',
        type: 'select',
        options: [
          { value: 0, label: 'Daily' },
          { value: 1, label: 'Same as repayment period' }
        ]
      },
      {
        label: 'Loan schedule type',
        key: 'loanScheduleType',
        type: 'select',
        options: [
          { value: 'Cumulative', label: 'Cumulative' },
          { value: 'Progressive', label: 'Progressive' }
        ]
      },
      {
        label: 'Repayment strategy',
        key: 'transactionProcessingStrategyCode',
        type: 'select',
        required: true,
        options: [
          {
            value: 'interest-principal-penalties-fees-order-strategy',
            label: 'Interest → Principal → Penalties → Fees'
          },
          {
            value: 'principal-interest-penalties-fees-order-strategy',
            label: 'Principal → Interest → Penalties → Fees'
          },
          { value: 'mifos-standard-strategy', label: 'Mifos standard' },
          { value: 'early-repayment-strategy', label: 'Early repayment' }
        ]
      },
      {
        label: 'Loan schedule processing type',
        key: 'loanScheduleProcessingType',
        type: 'select',
        options: [
          { value: 'Horizontal', label: 'Horizontal' },
          { value: 'Vertical', label: 'Vertical' }
        ]
      },
      {
        label: 'Grace on principal payment (months)',
        key: 'graceOnPrincipalPayment',
        type: 'number',
        placeholder: '0'
      },
      { label: 'Grace on interest payment (months)', key: 'graceOnInterestPayment', type: 'number', placeholder: '0' },
      { label: 'Interest free period (months)', key: 'interestFreePeriod', type: 'number', placeholder: '0' },
      {
        label: 'Days in year',
        key: 'daysInYearType',
        type: 'select',
        options: [
          { value: 1, label: 'Actual' },
          { value: 360, label: '360 days' },
          { value: 364, label: '364 days' },
          { value: 365, label: '365 days' }
        ]
      },
      {
        label: 'Days in year – custom strategy',
        key: 'daysInYearCustomStrategy',
        type: 'select',
        options: [
          { value: 'Full Leap Year', label: 'Full Leap Year' },
          { value: 'February 28', label: 'February 28' }
        ]
      },
      {
        label: 'Days in month',
        key: 'daysInMonthType',
        type: 'select',
        options: [
          { value: 1, label: 'Same as in year' },
          { value: 30, label: '30 days' }
        ]
      },
      {
        label: 'Principal threshold (%) for last installment',
        key: 'principalThresholdForLastInstallment',
        type: 'number',
        placeholder: '5'
      },
      { label: 'Allow top-up loans', key: 'canUseForTopup', type: 'checkbox' },
      { label: 'Recalculate interest', key: 'isInterestRecalculationEnabled', type: 'checkbox' },
      {
        label: 'Delinquency bucket',
        key: 'delinquencyBucketId',
        type: 'select',
        options: [
          { value: '', label: 'None' },
          { value: '1', label: 'Bucket 1 – Standard' },
          { value: '2', label: 'Bucket 2 – Aggressive' }
        ]
      },
      { label: 'Define installment amount', key: 'canDefineInstallmentAmount', type: 'checkbox' },
      { label: 'Allow variable installments', key: 'allowVariableInstallments', type: 'checkbox' },
      { label: 'Allow multiple disbursements', key: 'multiDisburseLoan', type: 'checkbox' },
      {
        label: 'Maximum tranche count',
        key: 'maxTrancheCount',
        type: 'number',
        placeholder: 'e.g. 4'
      },
      {
        label: 'Allow full term for tranche',
        key: 'allowFullTermForTranche',
        type: 'checkbox'
      },
      {
        label: 'In arrears tolerance',
        key: 'inArrearsTolerance',
        type: 'number',
        placeholder: 'e.g. 50'
      },
      {
        label: 'Grace on arrears ageing',
        key: 'graceOnArrearsAgeing',
        type: 'number',
        placeholder: 'e.g. 5'
      },
      {
        label: 'Overdue days for NPA',
        key: 'overdueDaysForNPA',
        type: 'number',
        placeholder: 'e.g. 90'
      },
      {
        label: 'Account moves out of NPA only on arrears completion',
        key: 'accountMovesOutOfNPAOnlyOnArrearsCompletion',
        type: 'checkbox'
      },
      { label: 'Place guarantee funds on-hold', key: 'holdGuaranteeFunds', type: 'checkbox' },
      {
        label: 'Maximum allowed outstanding balance',
        key: 'outstandingLoanBalance',
        type: 'number',
        placeholder: 'e.g. 100000'
      },
      { label: 'Disallow expected disbursements', key: 'disallowExpectedDisbursements', type: 'checkbox' },
      { label: 'Allow amortization override', key: 'allowAttributeOverrides.amortizationType', type: 'checkbox' },
      { label: 'Allow interest method override', key: 'allowAttributeOverrides.interestType', type: 'checkbox' },
      {
        label: 'Allow repayment strategy override',
        key: 'allowAttributeOverrides.transactionProcessingStrategyCode',
        type: 'checkbox'
      },
      {
        label: 'Allow interest calculation period override',
        key: 'allowAttributeOverrides.interestCalculationPeriodType',
        type: 'checkbox'
      },
      {
        label: 'Allow arrears tolerance override',
        key: 'allowAttributeOverrides.inArrearsTolerance',
        type: 'checkbox'
      },
      { label: 'Allow repaid every override', key: 'allowAttributeOverrides.repaymentEvery', type: 'checkbox' },
      {
        label: 'Allow moratorium override',
        key: 'allowAttributeOverrides.graceOnPrincipalAndInterestPayment',
        type: 'checkbox'
      },
      {
        label: 'Allow arrears ageing override',
        key: 'allowAttributeOverrides.graceOnArrearsAgeing',
        type: 'checkbox'
      },
      { label: 'Enable downpayment', key: 'enableDownPayment', type: 'checkbox' },
      {
        label: 'Disbursed amount percentage for downpayment',
        key: 'disbursedAmountPercentageForDownPayment',
        type: 'number',
        placeholder: 'e.g. 35'
      },
      { label: 'Enable auto repayment for downpayment', key: 'enableAutoRepaymentForDownPayment', type: 'checkbox' },
      {
        label: 'Loan charge-off behaviour',
        key: 'loanChargeOffBehaviour',
        type: 'select',
        options: [{ value: 'Regular', label: 'Regular' }]
      },
      { label: 'Enable installment level delinquency', key: 'enableInstallmentLevelDelinquency', type: 'checkbox' },
      { label: 'Enable income capitalization', key: 'enableIncomeCapitalization', type: 'checkbox' },
      { label: 'Enable buydown fees', key: 'enableBuydownFees', type: 'checkbox' }
    ]
  },
  {
    id: 5,
    title: 'Charges',
    icon: 'ti-coin',
    fields: [
      {
        label: 'Processing charge name',
        key: 'chargeName',
        type: 'text',
        placeholder: 'e.g. Processing Fee (optional)'
      },
      {
        label: 'Overdue charge name',
        key: 'overdueCharge',
        type: 'text',
        placeholder: 'e.g. Late Payment Penalty (optional)'
      }
    ]
  },
  {
    id: 6,
    title: 'Accounting',
    icon: 'ti-report',
    fields: [
      {
        label: 'Accounting rule',
        key: 'accountingRule',
        type: 'select',
        required: true,
        options: [
          { value: 1, label: 'None' },
          { value: 2, label: 'Cash-based' },
          { value: 3, label: 'Accrual (periodic)' },
          { value: 4, label: 'Accrual (upfront)' }
        ]
      }
    ]
  },
  {
    id: 7,
    title: 'Advanced Configuration',
    icon: 'ti-panel',
    fields: [
      {
        label: 'Use global config values for repayment event',
        key: 'useGlobalConfigForRepaymentEvent',
        type: 'checkbox'
      },
      {
        label: 'Due days for repayment event',
        key: 'dueDaysForRepaymentEvent',
        type: 'number',
        placeholder: 'e.g. 1'
      },
      {
        label: 'Overdue days for repayment event',
        key: 'overDueDaysForRepaymentEvent',
        type: 'number',
        placeholder: 'e.g. 1'
      }
    ]
  },
  { id: 8, title: 'Review', icon: 'ti-eye', fields: [] }
];

export const INITIAL_FORM_STATE: Record<string, string | number | boolean | null> = {
  name: '',
  shortName: '',
  externalId: '',
  description: '',
  startDate: '',
  closeDate: '',
  includeInBorrowerCycle: false,
  currencyCode: '',
  digitsAfterDecimal: 2,
  inMultiplesOf: 1,
  installmentAmountInMultiplesOf: 1,
  useBorrowerCycle: false,
  principal: '',
  numberOfRepayments: 12,
  interestRatePerPeriod: '',
  interestRateFrequencyType: 2,
  repaymentEvery: 1,
  repaymentFrequencyType: 2,
  isLinkedToFloatingInterestRates: false,
  allowApprovedDisbursedAmountsOverApplied: false,
  overAppliedCalculationType: '',
  overAppliedNumber: null,
  minimumDaysBetweenDisbursalAndFirstRepayment: 5,
  interestRecognitionOnDisbursementDate: false,
  repaymentStartDateType: 1,
  amortizationType: 1,
  interestType: 0,
  calculateInterestForExactDays: true,
  isEqualAmortization: false,
  interestCalculationPeriodType: 1,
  loanScheduleType: 'Progressive',
  transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
  loanScheduleProcessingType: 'Horizontal',
  graceOnPrincipalPayment: 0,
  graceOnInterestPayment: 0,
  interestFreePeriod: 0,
  daysInYearType: 360,
  daysInYearCustomStrategy: 'Full Leap Year',
  daysInMonthType: 30,
  principalThresholdForLastInstallment: 5,
  canUseForTopup: false,
  isInterestRecalculationEnabled: false,
  delinquencyBucketId: '',
  canDefineInstallmentAmount: true,
  allowVariableInstallments: true,
  multiDisburseLoan: true,
  maxTrancheCount: 4,
  allowFullTermForTranche: false,
  inArrearsTolerance: 50,
  graceOnArrearsAgeing: 5,
  overdueDaysForNPA: 90,
  accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
  holdGuaranteeFunds: false,
  outstandingLoanBalance: 100000,
  disallowExpectedDisbursements: true,
  'allowAttributeOverrides.amortizationType': true,
  'allowAttributeOverrides.interestType': true,
  'allowAttributeOverrides.transactionProcessingStrategyCode': true,
  'allowAttributeOverrides.interestCalculationPeriodType': true,
  'allowAttributeOverrides.inArrearsTolerance': true,
  'allowAttributeOverrides.repaymentEvery': true,
  'allowAttributeOverrides.graceOnPrincipalAndInterestPayment': true,
  'allowAttributeOverrides.graceOnArrearsAgeing': true,
  enableDownPayment: false,
  disbursedAmountPercentageForDownPayment: 35,
  enableAutoRepaymentForDownPayment: true,
  loanChargeOffBehaviour: 'Regular',
  enableInstallmentLevelDelinquency: false,
  useGlobalConfigForRepaymentEvent: true,
  dueDaysForRepaymentEvent: 1,
  overDueDaysForRepaymentEvent: 1,
  enableIncomeCapitalization: false,
  enableBuydownFees: false,
  chargeName: '',
  overdueCharge: '',
  accountingRule: 2
};

export type LoanWizardProfileMode = 'personal' | 'custom-advanced';

export type FormState = typeof INITIAL_FORM_STATE;

export function buildPayload(
  formState: FormState,
  profileMode: LoanWizardProfileMode = 'personal'
): Record<string, unknown> {
  if (profileMode === 'custom-advanced') {
    const customHiddenDefaults = { ...HIDDEN_DEFAULTS };
    delete customHiddenDefaults.canDefineInstallmentAmount;
    delete customHiddenDefaults.allowVariableInstallments;
    delete customHiddenDefaults.multiDisburseLoan;
    delete customHiddenDefaults.maxTrancheCount;
    delete customHiddenDefaults.allowFullTermForTranche;
    delete customHiddenDefaults.inArrearsTolerance;
    delete customHiddenDefaults.graceOnArrearsAgeing;
    delete customHiddenDefaults.overdueDaysForNPA;
    return { ...formState, ...customHiddenDefaults };
  }

  return { ...formState, ...HIDDEN_DEFAULTS };
}
