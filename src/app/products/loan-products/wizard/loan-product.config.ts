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

import { LoanProducts } from '../loan-products';

// HIDDEN_DEFAULTS and FORM_STEPS copied from upstream
export const HIDDEN_DEFAULTS: Record<string, unknown> = {
  description: 'Personal Loan Product',
  includeInBorrowerCycle: true,
  digitsAfterDecimal: 2,
  inMultiplesOf: 1,
  installmentAmountInMultiplesOf: 10,
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
  enableDownPayment: true,
  loanChargeOffBehaviour: 'Regular',
  enableInstallmentLevelDelinquency: false,
  useGlobalConfigForRepaymentEvent: true,
  dueDaysForRepaymentEvent: 1,
  overDueDaysForRepaymentEvent: 1,
  supportedInterestRefundTypes: null,
  enableIncomeCapitalization: false,
  enableBuydownFees: false,
  calculateInterestForExactDays: true,
  isEqualAmortization: false,
  loanScheduleType: 'Progressive',
  loanScheduleProcessingType: 'Horizontal',
  // graceOnPrincipalPayment, graceOnInterestPayment and interestFreePeriod (mapped to
  // graceOnInterestCharged) are visible FormControls in the Settings step, so they must be sourced
  // from the FormGroup — exactly like the Classic flow. They are intentionally NOT in HIDDEN_DEFAULTS:
  // because `defaults` is spread last in buildPayload's merge, listing them here would override the
  // user's form values. HIDDEN_DEFAULTS must only hold fields never exposed in the UI.
  daysInYearType: 360,
  daysInYearCustomStrategy: 'Full Leap Year',
  daysInMonthType: 30,
  principalThresholdForLastInstallment: 5,
  canUseForTopup: false,
  isInterestRecalculationEnabled: false,
  disbursedAmountPercentageForDownPayment: 35,
  enableAutoRepaymentForDownPayment: true,
  delinquencyBucketId: null
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
/**
 * Discriminates how a wizard step renders:
 * - `fields` (default): the config-driven form controls in {@link FormStep.fields}.
 * - `payment-allocation`: hosts the reused Classic `LoanProductPaymentStrategyStepComponent`; shown
 *   only while the selected repayment strategy is the advanced payment allocation strategy.
 * - `review`: the summary/confirmation step.
 */
export type FormStepKind = 'fields' | 'payment-allocation' | 'charges' | 'review';
export interface FormStep {
  id: number;
  title: string;
  icon: string;
  fields: FormField[];
  kind?: FormStepKind;
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
          { value: 'Feb 29 Period Only', label: 'Feb 29 Period Only' }
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
    // Reuses the Classic Payment Allocation UI (see loan-product-wizard.component.html). Carries no
    // config-driven fields; visibility is driven by the selected repayment strategy in the component.
    id: 9,
    title: 'Payment Allocation',
    icon: 'ti-arrows-sort',
    kind: 'payment-allocation',
    fields: []
  },
  {
    // Reuses the Classic `LoanProductChargesStepComponent` (rendered by the wizard for `kind: 'charges'`)
    // so processing/overdue charges are selected from the template's real `chargeOptions`/`penaltyOptions`
    // — identical dropdowns, filters and payload as Classic — instead of free-text names. The selected
    // full charge objects are folded into the backend `charges` array by `buildChargeReferences`.
    id: 5,
    title: 'Charges',
    icon: 'ti-coin',
    kind: 'charges',
    fields: []
  },
  {
    // Item 4 — Accounting is intentionally kept as its own self-contained, optional wizard step: a
    // single `accountingRule` control with no cross-field dependencies on any other step. This is the
    // decoupling seam. A richer accounting module (e.g. reusing the Classic
    // `LoanProductAccountingStepComponent` for advanced GL-account mappings) can be plugged in behind
    // this step later WITHOUT touching payload generation (`buildPayload` only reads `accountingRule`
    // from form state) or any other step. Left as a documented future enhancement here to avoid a
    // structural rewrite; behaviour is unchanged.
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
  { id: 8, title: 'Review', icon: 'ti-eye', kind: 'review', fields: [] }
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

/**
 * Fields that should use template defaults when not explicitly provided by user.
 * These are hidden fields in the UI that the backend expects.
 */
export const TEMPLATE_DEFAULT_FIELDS = [
  'currencyCode',
  'digitsAfterDecimal',
  'inMultiplesOf',
  'installmentAmountInMultiplesOf',
  'amortizationType',
  'interestType',
  'interestCalculationPeriodType',
  'repaymentFrequencyType',
  'interestRateFrequencyType',
  'repaymentStartDateType',
  'accountingRule',
  'daysInMonthType',
  'daysInYearType',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'transactionProcessingStrategyCode',
  'calculateInterestForExactDays',
  'chargeOffBehaviour'
] as const;

/**
 * Extracts the primitive value from a template field that may be either:
 * - An object with { id, code, value } structure -> returns id
 * - A primitive value -> returns the value directly
 */
function getTemplateFieldValue(template: unknown, fieldName: string): unknown {
  const field = template && typeof template === 'object' ? (template as Record<string, unknown>)[fieldName] : undefined;
  if (field === undefined || field === null) {
    return undefined;
  }
  if (typeof field === 'object' && field !== null && 'id' in field) {
    return (field as { id: unknown }).id;
  }
  return field;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isProgressiveLoanSchedule(scheduleType: unknown): boolean {
  return scheduleType === LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE || scheduleType === 'Progressive';
}

function hasValidGracePeriod(graceValue: unknown, numberOfRepayments: number | null): boolean {
  const gracePeriod = toFiniteNumber(graceValue);
  return gracePeriod !== null && numberOfRepayments !== null && gracePeriod < numberOfRepayments;
}

/**
 * Merges template defaults into the form values for fields not explicitly set by the user.
 * Uses the pattern: userValue ?? templateValue ?? undefined
 *
 * @param formValues - The user's form values
 * @param template - The loan product template from the API
 * @returns Merged values with template defaults applied for missing fields
 */
export function mergeTemplateDefaults(formValues: FormState, template: unknown): Record<string, unknown> {
  if (!template || typeof template !== 'object') {
    return { ...formValues };
  }

  const result: Record<string, unknown> = { ...formValues };
  const templateObj = template as Record<string, unknown>;

  for (const fieldName of TEMPLATE_DEFAULT_FIELDS) {
    const userValue = formValues[fieldName as keyof FormState];
    if (userValue !== undefined && userValue !== null && userValue !== '') {
      continue;
    }

    const templateValue = getTemplateFieldValue(templateObj, fieldName);
    if (templateValue !== undefined) {
      result[fieldName] = templateValue;
    }
  }

  return result;
}

function normalizeChargeId(value: unknown): number | string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record['id'] !== undefined) {
      return normalizeChargeId(record['id']);
    }
    return null;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return null;
}

function buildChargeReferences(formValues: Record<string, unknown>): Array<{ id: number | string }> {
  const chargeIds: Array<number | string> = [];
  const pushCharge = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => pushCharge(entry));
      return;
    }

    const chargeId = normalizeChargeId(value);
    if (chargeId === null) {
      return;
    }

    if (!chargeIds.some((existing) => existing === chargeId)) {
      chargeIds.push(chargeId);
    }
  };

  pushCharge(formValues['charges']);
  pushCharge(formValues['overdueCharge']);

  return chargeIds.map((id) => ({ id }));
}

/**
 * Enum fields whose form/template representation is a human-readable display string
 * (e.g. 'Progressive') but whose create contract (`POST /loanproducts`) expects the upper-case
 * backend code (e.g. 'PROGRESSIVE'). The Classic flow already submits codes; the wizard keeps
 * display strings until this normalization runs.
 */
const ENUM_CODE_MAPPINGS: Record<string, Record<string, string>> = {
  chargeOffBehaviour: {
    Regular: 'REGULAR',
    'Zero interest after charge-off': 'ZERO_INTEREST',
    'Accelerate maturity to charge-off date': 'ACCELERATE_MATURITY'
  },
  loanScheduleType: {
    Progressive: 'PROGRESSIVE',
    Cumulative: 'CUMULATIVE'
  },
  loanScheduleProcessingType: {
    Horizontal: 'HORIZONTAL',
    Vertical: 'VERTICAL'
  },
  daysInYearCustomStrategy: {
    'Full Leap Year': 'FULL_LEAP_YEAR',
    'Feb 29 Period Only': 'FEB_29_PERIOD_ONLY'
  }
};

/**
 * Normalizes known enum display strings to the backend codes the create API expects.
 * Idempotent: values already in code form (or fields not present) are left untouched, so this is
 * safe to run for every profile mode.
 */
function normalizeEnumCodesToBackendValues(merged: Record<string, unknown>): void {
  for (const [
    field,
    mapping
  ] of Object.entries(ENUM_CODE_MAPPINGS)) {
    if (field in merged && typeof merged[field] === 'string') {
      const value = merged[field] as string;
      if (value in mapping) {
        merged[field] = mapping[value];
      }
    }
  }
}

/**
 * Wizard form field names that must be renamed to their `POST /loanproducts` equivalents. The
 * wizard collects these values under UI-friendly names that differ from the backend create contract
 * (the names the Classic flow submits). Sending the wizard name triggers an "unsupported parameter"
 * rejection, so the value has to be re-keyed rather than dropped.
 */
const WIZARD_TO_CREATE_FIELD_RENAMES: Record<string, string> = {
  interestFreePeriod: 'graceOnInterestCharged',
  enableBuydownFees: 'enableBuyDownFee',
  loanChargeOffBehaviour: 'chargeOffBehaviour'
};

/**
 * `daysInYearType` id for the ACTUAL option (see the `daysInYearType` field options and the
 * `{ '1': 'Actual', ... }` display map). `daysInYearCustomStrategy` is only valid for this type.
 */
const DAYS_IN_YEAR_TYPE_ACTUAL = 1;

/**
 * Fields present in the wizard form/template state that `POST /loanproducts` never accepts. They
 * are UI-only helpers or read-only template/response fields; sending any of them makes the backend
 * reject the request with an "unsupported parameter" error.
 */
const UNSUPPORTED_CREATE_FIELDS = [
  'calculateInterestForExactDays', // read-only: returned by the template/retrieve API only
  'useGlobalConfigForRepaymentEvent', // UI-only toggle; the explicit due/overdue day values are sent instead
  'chargeName', // UI-only helper folded into `charges`
  'overdueCharge' // UI-only helper folded into `charges`
] as const;

/**
 * Single, centralized sanitization step applied to every wizard payload right before it is handed
 * to `LoanProducts.buildPayload()` / `POST /loanproducts`. It (1) folds the UI-only charge inputs
 * into the backend `charges` array, (2) re-keys wizard field names to the create contract, and
 * (3) strips fields the create endpoint does not accept — instead of scattering `delete` statements
 * across the build logic.
 *
 * It is presence-guarded and idempotent. The Personal flow already consumes/renames every one of
 * these fields inside its own block, so this runs as a no-op there and leaves that payload
 * byte-for-byte unchanged, while giving the Custom/Advanced flow the same create-contract
 * normalization the Classic flow gets from its typed step forms.
 */
function sanitizeCreateLoanProductPayload(merged: Record<string, unknown>): void {
  // 1. Fold the UI-only charge selections into the backend `charges` array.
  if ('chargeName' in merged || 'overdueCharge' in merged) {
    merged.charges = buildChargeReferences(merged);
  }

  // 1b. Down-payment dependents mirror the Classic Settings step, which registers the
  //     `disbursedAmountPercentageForDownPayment` / `enableAutoRepaymentForDownPayment` controls only
  //     while `enableDownPayment` is true and calls `removeControl` for both otherwise (see
  //     loan-product-settings-step.component.ts `enableDownPayment` valueChanges). The wizard's flat
  //     form keeps them populated from HIDDEN_DEFAULTS / INITIAL_FORM_STATE (35 / true) even after the
  //     user unchecks down payment, which trips the backend rule
  //     "disbursedAmountPercentageForDownPayment supported.only.for.enable.down.payment.true". This is
  //     a no-op for Personal Loan, whose hidden `enableDownPayment` default is always true.
  if (!merged.enableDownPayment) {
    delete merged.disbursedAmountPercentageForDownPayment;
    delete merged.enableAutoRepaymentForDownPayment;
  }

  // 2. Re-key wizard field names to their create-contract equivalents without overwriting a value
  //    the backend field already holds.
  for (const [
    wizardField,
    backendField
  ] of Object.entries(WIZARD_TO_CREATE_FIELD_RENAMES)) {
    if (!(wizardField in merged)) {
      continue;
    }
    const backendValue = merged[backendField];
    if (backendValue === undefined || backendValue === null) {
      merged[backendField] = merged[wizardField];
    }
    delete merged[wizardField];
  }

  // 3. `chargeOffBehaviour` is only accepted for Progressive loan schedules; drop it otherwise so
  //    Cumulative products are not rejected.
  if ('chargeOffBehaviour' in merged && !isProgressiveLoanSchedule(merged.loanScheduleType)) {
    delete merged.chargeOffBehaviour;
  }

  // 4. `daysInYearCustomStrategy` is kept only when BOTH the advanced payment allocation strategy is
  //    selected AND `daysInYearType` is ACTUAL — mirroring the Classic Settings step, which registers
  //    the `daysInYearCustomStrategy` FormControl only under those two conditions (see
  //    loan-product-settings-step.component.ts `daysInYearType` valueChanges +
  //    validateAdvancedPaymentStrategyControls) and calls `removeControl` otherwise, so it never
  //    reaches the payload. The backend rejects the field for any non-ACTUAL days-in-year type with
  //    "daysInYearCustomStrategy is only applicable for ACTUAL days in year type".
  //    `supportedInterestRefundTypes` is likewise advanced-only.
  const strategy = merged.transactionProcessingStrategyCode;
  const usesAdvancedPaymentAllocation =
    typeof strategy === 'string' && LoanProducts.isAdvancedPaymentAllocationStrategy(strategy);
  const daysInYearTypeIsActual = Number(merged.daysInYearType) === DAYS_IN_YEAR_TYPE_ACTUAL;
  if ('daysInYearCustomStrategy' in merged && (!usesAdvancedPaymentAllocation || !daysInYearTypeIsActual)) {
    delete merged.daysInYearCustomStrategy;
  }

  // 5. `supportedInterestRefundTypes` is only meaningful as a non-empty list of refund type ids.
  const refundTypes = merged.supportedInterestRefundTypes;
  if (!usesAdvancedPaymentAllocation || !Array.isArray(refundTypes) || refundTypes.length === 0) {
    delete merged.supportedInterestRefundTypes;
  }

  // 6. Strip the fields the create endpoint never accepts.
  UNSUPPORTED_CREATE_FIELDS.forEach((field) => delete merged[field]);
}

export function buildPayload(
  formState: FormState,
  profileMode: LoanWizardProfileMode = 'personal',
  template?: unknown
): Record<string, unknown> {
  const defaults =
    profileMode === 'custom-advanced'
      ? (() => {
          const d = { ...HIDDEN_DEFAULTS };
          delete d.canDefineInstallmentAmount;
          delete d.allowVariableInstallments;
          delete d.multiDisburseLoan;
          delete d.maxTrancheCount;
          delete d.allowFullTermForTranche;
          delete d.inArrearsTolerance;
          delete d.graceOnArrearsAgeing;
          delete d.overdueDaysForNPA;
          // `daysInYearType` and `daysInYearCustomStrategy` are visible, user-editable selects in the
          // Custom/Advanced settings step (same as Classic). Leaving them in HIDDEN_DEFAULTS would
          // force `daysInYearType` to 360 / `daysInYearCustomStrategy` to 'Full Leap Year' regardless
          // of the user's choice, so the form value would never reach the payload. Drop them here so
          // the form drives both, matching Classic — the gate in `sanitizeCreateLoanProductPayload`
          // then removes `daysInYearCustomStrategy` for any non-ACTUAL type, exactly as Classic does.
          delete d.daysInYearType;
          delete d.daysInYearCustomStrategy;
          return d;
        })()
      : { ...HIDDEN_DEFAULTS };

  /* Apply template defaults if template is provided for Personal Loan */
  const formValuesWithTemplateDefaults = template ? mergeTemplateDefaults(formState, template) : formState;

  // Merge order is profile-dependent:
  // - Personal Loan hides every HIDDEN_DEFAULTS field in the UI (see the `hiddenFieldKeys` filter in
  //   loan-product-wizard.component.ts), so those controls only ever carry their INITIAL_FORM_STATE
  //   seed. The product-specific hidden defaults must therefore win — `defaults` is spread last.
  // - Custom/Advanced exposes those same fields as editable controls, so the user's form values must
  //   win. Spreading `defaults` first lets it fill in only the genuinely hidden, backend-only fields
  //   the form never carries (e.g. the borrower-cycle variation arrays) without clobbering visible
  //   input. Downstream sanitization/normalization is unchanged and still runs for both modes.
  const merged =
    profileMode === 'custom-advanced'
      ? { ...defaults, ...formValuesWithTemplateDefaults }
      : { ...formValuesWithTemplateDefaults, ...defaults };

  // Personal Loan specific transformations
  if (profileMode === 'personal') {
    const formValues = formState as Record<string, unknown>;
    const selectedTransactionProcessingStrategyCode = formValues.transactionProcessingStrategyCode;
    const transactionProcessingStrategyCode = merged.transactionProcessingStrategyCode;
    const supportsAdvancedPaymentAllocation =
      typeof transactionProcessingStrategyCode === 'string' &&
      LoanProducts.isAdvancedPaymentAllocationStrategy(transactionProcessingStrategyCode);
    const supportsProgressiveLoanFeatures =
      supportsAdvancedPaymentAllocation && isProgressiveLoanSchedule(merged.loanScheduleType);
    const numberOfRepayments = toFiniteNumber(merged.numberOfRepayments);

    merged.transactionProcessingStrategyCode =
      typeof selectedTransactionProcessingStrategyCode === 'string' && selectedTransactionProcessingStrategyCode !== ''
        ? selectedTransactionProcessingStrategyCode
        : LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY;
    merged.loanScheduleType = LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE;

    // Map interest-free period to the backend field name used by the classic payload contract.
    if ('interestFreePeriod' in merged) {
      merged.graceOnInterestCharged = merged.interestFreePeriod;
      delete merged.interestFreePeriod;
    }

    merged.charges = buildChargeReferences(formValues);

    delete merged.chargeName;
    delete merged.overdueCharge;

    // Preserve backend field names expected by the classic payload contract.
    if ('enableBuydownFees' in merged) {
      merged.enableBuyDownFee = merged.enableBuydownFees;
      delete merged.enableBuydownFees;
    }

    if (supportsProgressiveLoanFeatures) {
      const templateSupportedInterestRefundTypes = getTemplateFieldValue(
        template as Record<string, unknown>,
        'supportedInterestRefundTypes'
      );
      if (Array.isArray(templateSupportedInterestRefundTypes) && templateSupportedInterestRefundTypes.length > 0) {
        merged.supportedInterestRefundTypes = templateSupportedInterestRefundTypes;
      } else {
        delete merged.supportedInterestRefundTypes;
      }
    } else {
      delete merged.supportedInterestRefundTypes;
    }

    if (supportsProgressiveLoanFeatures && 'loanChargeOffBehaviour' in merged) {
      merged.chargeOffBehaviour = merged.loanChargeOffBehaviour;
    }
    delete merged.loanChargeOffBehaviour;

    delete merged.allowVariableInstallments;
    delete merged.minimumGap;
    delete merged.maximumGap;
    delete merged.multiDisburseLoan;
    delete merged.maxTrancheCount;
    delete merged.allowFullTermForTranche;
    delete merged.outstandingLoanBalance;
    delete merged.disallowExpectedDisbursements;

    if (!hasValidGracePeriod(merged.graceOnPrincipalPayment, numberOfRepayments)) {
      delete merged.graceOnPrincipalPayment;
    }

    if (!hasValidGracePeriod(merged.graceOnInterestPayment, numberOfRepayments)) {
      delete merged.graceOnInterestPayment;
    }

    if (!supportsProgressiveLoanFeatures) {
      delete merged.chargeOffBehaviour;
    }

    const templateOnlyFieldsNotAcceptedByCreateApi = [
      'useGlobalConfigForRepaymentEvent',
      'daysInYearCustomStrategy'
    ] as const;
    templateOnlyFieldsNotAcceptedByCreateApi.forEach((field) => {
      delete merged[field];
    });
  } else if (profileMode === 'custom-advanced') {
    // Advanced Payment Allocation parity with Classic: `supportedInterestRefundTypes` is only ever
    // populated from the template's default list (there is no dedicated Interest Refund UI in either
    // wizard profile, same as Personal Loan above), and only once the advanced strategy + Progressive
    // schedule are both selected — mirroring `supportsProgressiveLoanFeatures` in the Personal block.
    const transactionProcessingStrategyCode = merged.transactionProcessingStrategyCode;
    const usesAdvancedPaymentAllocation =
      typeof transactionProcessingStrategyCode === 'string' &&
      LoanProducts.isAdvancedPaymentAllocationStrategy(transactionProcessingStrategyCode);
    if (usesAdvancedPaymentAllocation && isProgressiveLoanSchedule(merged.loanScheduleType)) {
      const templateSupportedInterestRefundTypes = getTemplateFieldValue(
        template as Record<string, unknown>,
        'supportedInterestRefundTypes'
      );
      if (Array.isArray(templateSupportedInterestRefundTypes) && templateSupportedInterestRefundTypes.length > 0) {
        merged.supportedInterestRefundTypes = templateSupportedInterestRefundTypes;
      }
    }

    // Multi-disbursement parity with the Classic Settings step. Classic's `multiDisburseLoan`
    // valueChanges handler (loan-product-settings-step.component.ts) removes the `maxTrancheCount`
    // and `outstandingLoanBalance` controls and patches `disallowExpectedDisbursements` /
    // `allowFullTermForTranche` back to false whenever multiple disbursals are turned off, so those
    // tranche-only fields never reach `POST /loanproducts` unless `multiDisburseLoan` is true. The
    // wizard's flat form keeps them populated from `HIDDEN_DEFAULTS` (disallowExpectedDisbursements:
    // true, outstandingLoanBalance: 100000) even after the user unchecks multiple disbursals, which
    // trips the backend rule "Allow Multiple Disbursals Not Set - Disallow Expected Disbursals Can't
    // Be Set". Mirror Classic's conditional construction here to produce the identical contract.
    if (!merged.multiDisburseLoan) {
      delete merged.maxTrancheCount;
      delete merged.outstandingLoanBalance;
      merged.disallowExpectedDisbursements = false;
      merged.allowFullTermForTranche = false;
    }
  }

  // Centralized create-contract sanitization for every profile mode: fold UI-only charge inputs,
  // re-key wizard field names to their backend equivalents, and strip fields `POST /loanproducts`
  // does not accept. No-op for Personal (its block already consumed these fields); it is what brings
  // the Custom/Advanced payload in line with the Classic contract.
  sanitizeCreateLoanProductPayload(merged);

  // Convert enum display strings to backend codes for every profile mode. The Classic flow submits
  // codes ('PROGRESSIVE', 'HORIZONTAL', ...); the custom-advanced wizard would otherwise send the
  // display strings ('Progressive', 'Horizontal', ...) and the backend enum parser would reject them.
  normalizeEnumCodesToBackendValues(merged);

  // Convert flattened allowAttributeOverrides keys to nested object
  const allowAttributeOverrides: Record<string, boolean> = {};
  const keysToDelete: string[] = [];
  for (const key of Object.keys(merged)) {
    if (key.startsWith('allowAttributeOverrides.')) {
      const subKey = key.replace('allowAttributeOverrides.', '');
      allowAttributeOverrides[subKey] = merged[key] as boolean;
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => delete merged[key]);
  if (Object.keys(allowAttributeOverrides).length > 0) {
    merged.allowAttributeOverrides = allowAttributeOverrides;
  }

  return merged;
}
