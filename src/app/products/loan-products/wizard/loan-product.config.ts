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
}

export type FieldType = 'text' | 'number' | 'select' | 'checkbox';
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
  { name: 'Personal Loan', description: 'First version of the loan product wizard.', active: true, disabled: false },
  { name: 'Two Wheeler Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'JLG Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Education Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Home Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Mortgage Loan (LAP)', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Agri Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Auto Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Gold Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Consumer Durable Loan', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Loan vs Securities / FD', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Credit Card EMI', description: 'Coming soon.', active: false, disabled: true },
  { name: 'BNPL', description: 'Coming soon.', active: false, disabled: true },
  { name: 'Invoice Discounting', description: 'Not available in this version.', active: false, disabled: true },
  { name: 'Merchant Cash Advance', description: 'Not available in this version.', active: false, disabled: true },
  { name: 'Line of Credit', description: 'Not available in this version.', active: false, disabled: true },
  { name: 'Custom / Advanced', description: 'Coming soon.', active: false, disabled: true }
];

export const LABEL_MAP: Record<string, string> = {
  name: 'Product name',
  shortName: 'Short code',
  externalId: 'External ID',
  currencyCode: 'Currency',
  principal: 'Principal amount',
  numberOfRepayments: 'Number of repayments',
  interestRatePerPeriod: 'Nominal interest rate',
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
  accountingRule: 'Accounting rule'
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
  delinquencyBucketId: { '': 'None', '1': 'Bucket 1 – Standard', '2': 'Bucket 2 – Aggressive' }
};

export const REVIEW_SECTIONS: Array<{ title: string; keys: string[]; optional?: boolean }> = [
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
      'delinquencyBucketId'
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
      { label: 'External ID', key: 'externalId', type: 'text', placeholder: 'e.g. PL001' }
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
      }
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
        label: 'Nominal interest rate (%)',
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
      }
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
  { id: 7, title: 'Review', icon: 'ti-eye', fields: [] }
];

export const INITIAL_FORM_STATE = {
  name: '',
  shortName: '',
  externalId: '',
  currencyCode: 'INR',
  principal: '',
  numberOfRepayments: 12,
  interestRatePerPeriod: '',
  interestRateFrequencyType: 2,
  repaymentEvery: 1,
  repaymentFrequencyType: 2,
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
  chargeName: '',
  overdueCharge: '',
  accountingRule: 2
};

export type FormState = typeof INITIAL_FORM_STATE;

export function buildPayload(formState: FormState): Record<string, unknown> {
  return { ...formState, ...HIDDEN_DEFAULTS };
}
