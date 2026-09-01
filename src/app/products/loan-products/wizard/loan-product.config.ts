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
  // Row 11 of every sheet in the workbook: the `Default Value` column is 1 (the 10 in column E is
  // the `All Params` boilerplate sample, not a per-product figure). An instalment is a plain split of
  // the financed amount and must not be rounded up to the nearest 10.
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
  enableDownPayment: true,
  // Backend code, matching the value space of the template-sourced `chargeOffBehaviourOptions`
  // (whose select binds option ids). `normalizeEnumCodesToBackendValues` is idempotent, so an
  // already-coded value passes straight through and the emitted payload is unchanged.
  loanChargeOffBehaviour: 'REGULAR',
  enableInstallmentLevelDelinquency: false,
  useGlobalConfigForRepaymentEvent: true,
  dueDaysForRepaymentEvent: 1,
  overDueDaysForRepaymentEvent: 1,
  supportedInterestRefundTypes: null,
  enableIncomeCapitalization: false,
  enableBuydownFees: false,
  allowPartialPeriodInterestCalculation: true,
  isEqualAmortization: false,
  loanScheduleType: 'Progressive',
  loanScheduleProcessingType: 'Horizontal',
  // graceOnPrincipalPayment, graceOnInterestPayment and interestFreePeriod (mapped to
  // graceOnInterestCharged) are visible FormControls in the Settings step, so they must be sourced
  // from the FormGroup — exactly like the Classic flow. They are intentionally NOT in HIDDEN_DEFAULTS:
  // because `defaults` is spread last in buildPayload's merge, listing them here would override the
  // user's form values. HIDDEN_DEFAULTS must only hold fields never exposed in the UI.
  daysInYearType: 360,
  // Backend code, matching the value space of the template-sourced options (see the field config).
  // `normalizeEnumCodesToBackendValues` is idempotent, so an already-coded value passes through.
  daysInYearCustomStrategy: 'FULL_LEAP_YEAR',
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
  icon: string;
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
  /**
   * Lower bound for a `number` field. Emitted as `Validators.min` and mirrored onto the input's
   * `min` attribute. Mirrors the floors Classic declares on the same control.
   */
  min?: number;
  /**
   * Maximum number of decimal places a `number` field accepts; `0` means whole numbers only.
   * Emitted as the same `Validators.pattern` Classic uses (`^\d+([.,]\d{1,N})?$`, `^\d+$` for 0),
   * so the guided form rejects exactly what the Classic step rejects.
   *
   * Classic expresses every numeric constraint it has as a floor, a decimal-place pattern, or both —
   * there is no upper bound outside the down-payment percentage, which `syncConditionalValidators`
   * already covers with the shared `rangeValidator(0, 100)`. Hence no `max` here.
   */
  decimals?: number;
  options?: SelectOption[];
}
/**
 * Discriminates how a wizard step renders:
 * - `fields` (default): the config-driven form controls in {@link FormStep.fields}.
 * - `payment-allocation`: hosts the reused Classic `LoanProductPaymentStrategyStepComponent`; shown
 *   only while the selected repayment strategy is the advanced payment allocation strategy.
 * - `review`: the summary/confirmation step.
 */
export type FormStepKind =
  | 'fields'
  | 'payment-allocation'
  | 'charges'
  | 'accounting'
  | 'interest-refund'
  | 'deferred-income'
  | 'borrower-cycle'
  | 'review';
/**
 * The four Classic step components the wizard can host INSTEAD of rendering a step's `fields`
 * config: `LoanProductDetailsStepComponent`, `LoanProductCurrencyStepComponent`,
 * `LoanProductTermsStepComponent` and `LoanProductSettingsStepComponent`.
 *
 * The wizard already reuses Classic's other six steps (payment allocation, charges, accounting,
 * interest refund, deferred income, borrower cycle) for every profile. These four were the only ones
 * re-declared as config fields, and that re-declaration was the sole source of the
 * Custom/Advanced-vs-Classic divergence. Custom/Advanced now hosts the real components, so its field
 * set, validation and payload are Classic's by construction rather than by maintenance.
 *
 * Guided profiles keep rendering the `fields` config: their whole purpose is to expose a curated
 * subset, which the full Classic steps would defeat.
 */
export type ClassicStep = 'details' | 'currency' | 'terms' | 'settings';

export interface FormStep {
  id: number;
  title: string;
  icon: string;
  fields: FormField[];
  kind?: FormStepKind;
  /**
   * The Classic component that replaces this step's `fields` rendering when the profile uses the
   * Classic steps (see {@link usesClassicSteps}). Absent for steps with no Classic counterpart.
   */
  classicStep?: ClassicStep;
}

/**
 * Profiles that host Classic's four step components instead of the config-driven field grid.
 * Custom/Advanced is the only one: it is the "complete control" mode, so its surface must be exactly
 * Classic's. Every guided template renders its curated `fields` config instead.
 */
export function usesClassicSteps(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'custom-advanced';
}

export const PRODUCT_CARDS: ProductCard[] = [
  {
    name: 'labels.text.Custom / Advanced',
    description: 'labels.text.Complete control over every aspect of product behavior',
    active: true,
    disabled: false,
    route: 'custom-advanced',
    ctaLabel: 'Create Custom / Advanced',
    icon: 'tune'
  },
  {
    name: 'labels.text.Personal Loan',
    description:
      'labels.text.Unsecured funding for personal needs like travel, medical expenses, or weddings, with flexible tenure and minimal documentation',
    active: true,
    disabled: false,
    route: 'personal-loan',
    icon: 'account_balance_wallet'
  },
  {
    name: 'labels.text.Two Wheeler Loan',
    description:
      'labels.text.Finance for new or used two-wheelers with quick approval and flexible down payment options',
    active: true,
    disabled: false,
    route: 'two-wheeler-loan',
    icon: 'pedal_bike'
  },
  {
    name: 'labels.text.JLG Loan',
    description:
      'labels.text.Group-backed microloans for individuals in a Joint Liability Group, typically for income-generating activities',
    active: true,
    disabled: false,
    route: 'jlg-loan',
    icon: 'group'
  },
  {
    name: 'labels.text.Education Loan',
    description:
      'labels.text.Funding for tuition and related expenses for domestic or international studies, with repayment options aligned to course duration',
    active: true,
    disabled: false,
    route: 'education-loan',
    icon: 'school'
  },
  {
    name: 'labels.text.Home Loan',
    description: 'labels.text.Long-tenure financing to purchase, construct, or renovate a residential property',
    active: true,
    disabled: false,
    route: 'home-loan',
    icon: 'home'
  },
  {
    name: 'labels.text.Mortgage Loan (LAP)',
    description:
      'labels.text.Loan against property where an existing residential or commercial asset is pledged as collateral',
    active: true,
    disabled: false,
    route: 'mortgage-loan',
    icon: 'home_work'
  },
  {
    // Renamed from 'Agri Loan' to match the template's full product name everywhere else
    // (profile label, breadcrumb, page title).
    name: 'labels.text.Agriculture Loan',
    description:
      'labels.text.Credit for farming-related needs such as crop production, equipment, or land development, often tied to agricultural cycles',
    active: true,
    disabled: false,
    route: 'agriculture-loan',
    icon: 'agriculture'
  },
  {
    name: 'labels.text.Auto Loan',
    description: 'labels.text.Financing for new or used car purchases with structured EMIs over a chosen tenure',
    active: true,
    disabled: false,
    route: 'auto-loan',
    icon: 'directions_car'
  },
  {
    name: 'labels.text.Gold Loan',
    description:
      'labels.text.Quick secured loan against pledged gold ornaments or coins, with fast disbursal and minimal paperwork',
    active: true,
    disabled: false,
    route: 'gold-loan',
    icon: 'diamond'
  },
  {
    name: 'labels.text.Consumer Durable Loan',
    description:
      'labels.text.Point-of-sale financing for electronics, appliances, and other durable goods, often with zero-cost EMI options',
    active: true,
    disabled: false,
    route: 'consumer-durable-loan',
    icon: 'devices'
  },
  {
    name: 'labels.text.Loan vs Securities / FD',
    description:
      'labels.text.Credit extended against shares, mutual funds, or fixed deposits without liquidating the underlying investment',
    active: true,
    disabled: false,
    route: 'loan-against-securities',
    icon: 'account_balance'
  },
  {
    name: 'labels.text.Credit Card EMI',
    description: 'labels.text.Converts card spends or available credit limit into structured EMIs',
    active: true,
    disabled: false,
    route: 'credit-card-emi-loan',
    icon: 'credit_card'
  },
  {
    name: 'labels.text.BNPL',
    description:
      'labels.text.Buy now, pay later financing for short-term, often interest-free purchases, settled in fixed installments',
    active: true,
    disabled: false,
    route: 'bnpl-loan',
    icon: 'shopping_cart'
  },
  {
    name: 'labels.text.Invoice Discounting',
    description:
      'labels.text.Short-term financing against unpaid invoices to improve business cash flow before customer payment is due',
    active: false,
    disabled: true,
    icon: 'receipt_long'
  },
  {
    name: 'labels.text.Merchant Cash Advance',
    description:
      'labels.text.Working capital advanced against future card or digital sales, repaid as a percentage of daily transactions',
    active: false,
    disabled: true,
    icon: 'storefront'
  },
  {
    name: 'labels.text.Line of Credit',
    description:
      'labels.text.A revolving credit limit that can be drawn, repaid, and reused as needed, with interest charged only on the amount utilized',
    active: false,
    disabled: true,
    icon: 'credit_score'
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
  allowPartialPeriodInterestCalculation: { true: 'Yes', false: 'No' },
  isEqualAmortization: { true: 'Yes', false: 'No' },
  // Only the "None" choice: every real bucket is named by the tenant, so the Review resolves its
  // label from the field's template-sourced options (`formatFieldValue`) rather than from a static
  // map that could only ever guess. The two invented entries that used to live here
  // ('Bucket 1 – Standard', 'Bucket 2 – Aggressive') named buckets that exist on no tenant.
  delinquencyBucketId: { '': 'None' },
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
  loanChargeOffBehaviour: { REGULAR: 'Regular', Regular: 'Regular' },
  enableInstallmentLevelDelinquency: { true: 'Yes', false: 'No' },
  useGlobalConfigForRepaymentEvent: { true: 'Yes', false: 'No' },
  enableIncomeCapitalization: { true: 'Yes', false: 'No' },
  enableBuydownFees: { true: 'Yes', false: 'No' },
  overAppliedCalculationType: { '': 'None', Percentage: 'Percentage', Amount: 'Amount' }
};

/**
 * The "no bucket" choice on the delinquency bucket select. Classic offers this as a clear button next
 * to its dropdown (`clearProperty('delinquencyBucketId')` in loan-product-settings-step.component.ts,
 * which also resets `enableInstallmentLevelDelinquency`); the wizard renders it as an option instead,
 * so the empty value has to be declared rather than sourced from the template. `buildPayload`
 * normalizes '' to null, and the same guard clears the installment-level flag.
 *
 * Declared above {@link FORM_STEPS} because that array literal references it at module-evaluation
 * time — moving it down beside NTH_DAY_ON_DAY_OPTION would put it in the temporal dead zone.
 */
export const DELINQUENCY_BUCKET_NONE_OPTION: SelectOption = { value: '', label: 'None' };

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'Details',
    classicStep: 'details',
    icon: 'ti-id',
    fields: [
      {
        label: 'labels.inputs.Loan product name',
        key: 'name',
        type: 'text',
        required: true,
        placeholder: 'labels.placeholders.Example loan product name',
        maxLength: 100
      },
      {
        label: 'labels.inputs.Short Name',
        key: 'shortName',
        type: 'text',
        required: true,
        placeholder: 'labels.placeholders.Example short name',
        maxLength: 4,
        hint: 'max 4 chars'
      },
      {
        label: 'labels.inputs.External ID',
        key: 'externalId',
        type: 'text',
        placeholder: 'labels.placeholders.Example external id'
      },
      {
        label: 'labels.inputs.Description',
        key: 'description',
        type: 'textarea',
        placeholder: 'labels.placeholders.Example description',
        maxLength: 500
      },
      {
        label: 'labels.inputs.Start Date',
        key: 'startDate',
        type: 'date',
        placeholder: 'labels.placeholders.Select start date'
      },
      {
        label: 'labels.inputs.Close Date',
        key: 'closeDate',
        type: 'date',
        placeholder: 'labels.placeholders.Select close date'
      },
      { label: 'labels.inputs.Include in Customer Loan Counter', key: 'includeInBorrowerCycle', type: 'checkbox' }
    ]
  },
  {
    id: 2,
    title: 'Currency',
    classicStep: 'currency',
    icon: 'ti-currency-dollar',
    fields: [
      // The tenant's configured currencies, sourced from the backend template at render time exactly
      // like Classic, via TEMPLATE_OPTION_SOURCES. Left empty here rather than carrying a hardcoded
      // four-currency list, which offered choices the tenant may not have and hid the ones it does.
      {
        label: 'labels.inputs.CURRENCY',
        key: 'currencyCode',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Decimal Places',
        key: 'digitsAfterDecimal',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 2',
        min: 0
      },
      {
        label: 'labels.inputs.Currency In Multiples Of',
        key: 'inMultiplesOf',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 1',
        min: 0
      },
      {
        label: 'labels.inputs.Installment in multiples of',
        key: 'installmentAmountInMultiplesOf',
        type: 'number',
        placeholder: 'labels.placeholders.Example 10',
        min: 0
      },
      { label: 'labels.inputs.Use borrower cycle', key: 'useBorrowerCycle', type: 'checkbox' }
    ]
  },
  {
    id: 3,
    title: 'Terms',
    classicStep: 'terms',
    icon: 'ti-calculator',
    fields: [
      {
        label: 'labels.inputs.Principal Amount',
        key: 'principal',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 50000',
        min: 1
      },
      {
        label: 'labels.inputs.Number of Repayments',
        key: 'numberOfRepayments',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 12',
        min: 1,
        decimals: 0
      },
      {
        label: 'labels.inputs.Annual interest rate',
        key: 'interestRatePerPeriod',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 12',
        min: 0,
        decimals: 6
      },
      {
        label: 'labels.inputs.Interest rate frequency',
        key: 'interestRateFrequencyType',
        type: 'select',
        required: true,
        options: [
          { value: 2, label: 'Per month' },
          { value: 3, label: 'Per year' }
        ]
      },
      {
        label: 'labels.inputs.Repaid every – value',
        key: 'repaymentEvery',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 1',
        min: 1
      },
      {
        label: 'labels.inputs.Repaid every – period',
        key: 'repaymentFrequencyType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Days' },
          { value: 1, label: 'Weeks' },
          { value: 2, label: 'Months' }
        ]
      },
      {
        label: 'labels.inputs.Linked to floating interest rates',
        key: 'isLinkedToFloatingInterestRates',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow approval/disbursal above applied amount',
        key: 'allowApprovedDisbursedAmountsOverApplied',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Over Amount Calculation Type',
        key: 'overAppliedCalculationType',
        type: 'select',
        options: [
          { value: '', label: 'None' },
          { value: 'Percentage', label: 'Percentage' },
          { value: 'Amount', label: 'Amount' }
        ]
      },
      {
        label: 'labels.inputs.Over Amount',
        key: 'overAppliedNumber',
        type: 'number',
        placeholder: 'labels.placeholders.Example 10'
      },
      {
        label: 'labels.inputs.Minimum days between disbursal and first repayment',
        key: 'minimumDaysBetweenDisbursalAndFirstRepayment',
        type: 'number',
        placeholder: 'labels.placeholders.Example 5',
        min: 0
      },
      {
        label: 'labels.inputs.Interest recognition on disbursement date',
        key: 'interestRecognitionOnDisbursementDate',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Repayment start date type',
        key: 'repaymentStartDateType',
        type: 'select',
        options: [{ value: 1, label: 'Disbursement date' }]
      }
    ]
  },
  {
    // The "Terms vary based on loan cycle" surface (sheet rows 26, 27 and 29), rendered by
    // `LoanProductBorrowerCycleStepComponent`. Only JLG marks those rows Applicable, and the step is
    // additionally gated on the `useBorrowerCycle` control — see `visibleSteps`. It carries no
    // config-driven fields: the component owns three FormArrays and emits them, because the wizard's
    // single flat FormGroup cannot hold arrays of objects.
    //
    // Placed immediately after Terms because the per-cycle bands ARE the product's terms — Classic
    // renders the same block inside its Terms step. Declaration order is what `visibleSteps`
    // preserves, so this is what fixes the operator-facing ordering.
    id: 12,
    title: 'Loan Cycle Variations',
    icon: 'ti-repeat',
    kind: 'borrower-cycle',
    fields: []
  },
  {
    id: 4,
    title: 'Settings',
    classicStep: 'settings',
    icon: 'ti-settings',
    fields: [
      {
        label: 'labels.inputs.Amortization Type',
        key: 'amortizationType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Equal principal payments' },
          { value: 1, label: 'Equal installments' }
        ]
      },
      {
        label: 'labels.inputs.Interest Method',
        key: 'interestType',
        type: 'select',
        required: true,
        options: [
          { value: 0, label: 'Declining balance' },
          { value: 1, label: 'Flat' }
        ]
      },
      {
        // Classic's control of the same label (loan-product-settings-step.component.html), shown only
        // for the "Same as repayment period" interest calculation type. NOT the sheet's literal API
        // param `calculateInterestForExactDays`, which is read-only — returned by the template and
        // retrieve APIs and rejected by create — and therefore stays in UNSUPPORTED_CREATE_FIELDS.
        // This flag matters: Fineract accepts `isInterestRecalculationEnabled` only with daily
        // interest calculation OR this set to true.
        label: 'labels.inputs.Calculate interest for exact days in partial period',
        key: 'allowPartialPeriodInterestCalculation',
        type: 'checkbox'
      },
      { label: 'labels.inputs.Is Equal Amortization', key: 'isEqualAmortization', type: 'checkbox' },
      {
        label: 'labels.inputs.Interest Calculation Period',
        key: 'interestCalculationPeriodType',
        type: 'select',
        options: [
          { value: 0, label: 'Daily' },
          { value: 1, label: 'Same as repayment period' }
        ]
      },
      {
        label: 'labels.inputs.Loan Schedule Type',
        key: 'loanScheduleType',
        type: 'select',
        options: [
          { value: 'Cumulative', label: 'Cumulative' },
          { value: 'Progressive', label: 'Progressive' }
        ]
      },
      {
        label: 'labels.inputs.Repayment Strategy',
        key: 'transactionProcessingStrategyCode',
        type: 'select',
        required: true,
        options: [
          {
            value: 'interest-principal-penalties-fees-order-strategy',
            label: 'labels.inputs.Interest → Principal → Penalties → Fees'
          },
          {
            value: 'principal-interest-penalties-fees-order-strategy',
            label: 'labels.inputs.Principal → Interest → Penalties → Fees'
          },
          { value: 'mifos-standard-strategy', label: 'Mifos standard' },
          { value: 'early-repayment-strategy', label: 'Early repayment' }
        ]
      },
      {
        label: 'labels.inputs.Loan Schedule Processing Type',
        key: 'loanScheduleProcessingType',
        type: 'select',
        options: [
          { value: 'Horizontal', label: 'Horizontal' },
          { value: 'Vertical', label: 'Vertical' }
        ]
      },
      {
        label: 'labels.inputs.Grace on principal payment (months)',
        key: 'graceOnPrincipalPayment',
        type: 'number',
        placeholder: '0',
        min: 0
      },
      {
        label: 'labels.inputs.Grace on interest payment (months)',
        key: 'graceOnInterestPayment',
        type: 'number',
        placeholder: '0',
        min: 0
      },
      {
        label: 'labels.inputs.Interest free period (months)',
        key: 'interestFreePeriod',
        type: 'number',
        placeholder: '0',
        min: 0
      },
      {
        label: 'labels.inputs.Days in Year',
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
        label: 'labels.inputs.Days in year custom strategy',
        key: 'daysInYearCustomStrategy',
        type: 'select',
        // Classic binds `[value]="daysInYearCustomStrategy.id"` against the template's
        // `daysInYearCustomStrategyOptions`, i.e. the backend code — so this static list (the
        // fallback for a template-less render) carries codes too, keeping one value space.
        options: [
          { value: 'FULL_LEAP_YEAR', label: 'Full Leap Year' },
          { value: 'FEB_29_PERIOD_ONLY', label: 'Feb 29 Period Only' }
        ]
      },
      {
        label: 'labels.inputs.Days in month',
        key: 'daysInMonthType',
        type: 'select',
        options: [
          { value: 1, label: 'Same as in year' },
          { value: 30, label: '30 days' }
        ]
      },
      {
        label: 'labels.inputs.Principal threshold (%) for last installment',
        key: 'principalThresholdForLastInstallment',
        type: 'number',
        placeholder: '5',
        min: 0
      },
      { label: 'labels.inputs.Allow top-up loans', key: 'canUseForTopup', type: 'checkbox' },
      { label: 'labels.inputs.Recalculate Interest', key: 'isInterestRecalculationEnabled', type: 'checkbox' },
      // Interest recalculation family — every control Classic's Settings step registers while
      // `isInterestRecalculationEnabled` is on (loan-product-settings-step.component.ts, the
      // `isInterestRecalculationEnabled` valueChanges block) and removes when it is off. Options come
      // from the backend template at render time, exactly like Classic, via TEMPLATE_OPTION_SOURCES;
      // the static `options` here are only a fallback for a template-less render.
      {
        label: 'labels.inputs.Pre-closure interest calculation rule',
        key: 'preClosureInterestCalculationStrategy',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Advance payments adjustment type',
        key: 'rescheduleStrategyMethod',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Interest recalculation compounding on',
        key: 'interestRecalculationCompoundingMethod',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Frequency for compounding',
        key: 'recalculationCompoundingFrequencyType',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Frequency Interval for compounding',
        key: 'recalculationCompoundingFrequencyInterval',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 1'
      },
      {
        label: 'labels.inputs.Compounding on nth day',
        key: 'recalculationCompoundingFrequencyNthDayType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Compounding on day of week',
        key: 'recalculationCompoundingFrequencyDayOfWeekType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Compounding on day',
        key: 'recalculationCompoundingFrequencyOnDayType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Frequency for recalculate Outstanding Principal',
        key: 'recalculationRestFrequencyType',
        type: 'select',
        required: true,
        options: []
      },
      {
        label: 'labels.inputs.Frequency Interval for recalculation',
        key: 'recalculationRestFrequencyInterval',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 1'
      },
      {
        label: 'labels.inputs.Recalculate on nth day',
        key: 'recalculationRestFrequencyNthDayType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Recalculate on day of week',
        key: 'recalculationRestFrequencyDayOfWeekType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Recalculate on day',
        key: 'recalculationRestFrequencyOnDayType',
        type: 'select',
        options: []
      },
      {
        label: 'labels.inputs.Is arrears recognition based on original schedule?',
        key: 'isArrearsBasedOnOriginalSchedule',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Do not calculate interest on past due principal balances',
        key: 'disallowInterestCalculationOnPastDue',
        type: 'checkbox'
      },
      {
        // The tenant's own delinquency buckets, sourced from the backend template at render time
        // exactly like Classic, via TEMPLATE_OPTION_SOURCES. Only the "None" choice is declared here:
        // it is the wizard's equivalent of Classic's clear button, not a bucket, so it has no template
        // counterpart and must survive a template-less render.
        label: 'labels.inputs.Delinquency Bucket',
        key: 'delinquencyBucketId',
        type: 'select',
        options: [DELINQUENCY_BUCKET_NONE_OPTION]
      },
      { label: 'labels.inputs.Define installment amount', key: 'canDefineInstallmentAmount', type: 'checkbox' },
      { label: 'labels.inputs.Allow variable installments', key: 'allowVariableInstallments', type: 'checkbox' },
      { label: 'labels.inputs.Allow multiple disbursements', key: 'multiDisburseLoan', type: 'checkbox' },
      {
        label: 'labels.inputs.Maximum Tranche count',
        key: 'maxTrancheCount',
        type: 'number',
        placeholder: 'labels.placeholders.Example 4'
      },
      {
        label: 'labels.inputs.Allow full term for tranche',
        key: 'allowFullTermForTranche',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.In arrears tolerance',
        key: 'inArrearsTolerance',
        type: 'number',
        placeholder: 'labels.placeholders.Example 50',
        min: 0
      },
      {
        label: 'labels.inputs.Grace on Arrears Ageing',
        key: 'graceOnArrearsAgeing',
        type: 'number',
        placeholder: 'labels.placeholders.Example 5',
        min: 0
      },
      {
        label: 'labels.inputs.Overdue days for NPA',
        key: 'overdueDaysForNPA',
        type: 'number',
        placeholder: 'labels.placeholders.Example 90',
        min: 0
      },
      {
        label: 'labels.inputs.Account moves out of NPA only on arrears completion',
        key: 'accountMovesOutOfNPAOnlyOnArrearsCompletion',
        type: 'checkbox'
      },
      { label: 'labels.inputs.Place Guarantee Funds On-Hold', key: 'holdGuaranteeFunds', type: 'checkbox' },
      // Classic registers these three only while `holdGuaranteeFunds` is ticked and `removeControl`s
      // them otherwise (loan-product-settings-step.component.ts), with `mandatoryGuarantee` marked
      // required in its template. The wizard's flat form keeps them registered, so the same gating is
      // reproduced by the GUARANTEE_FUNDS_DEPENDENT_FIELDS visibility rule in the wizard component and
      // the matching strip in sanitizeCreateLoanProductPayload.
      {
        label: 'labels.inputs.Mandatory Guarantee(%)',
        key: 'mandatoryGuarantee',
        type: 'number',
        required: true,
        placeholder: 'labels.placeholders.Example 100'
      },
      {
        label: 'labels.inputs.Minimum Guarantee from Own Funds(%)',
        key: 'minimumGuaranteeFromOwnFunds',
        type: 'number',
        placeholder: 'labels.placeholders.Example 0'
      },
      {
        label: 'labels.inputs.Minimum guarantee from guarantor (%)',
        key: 'minimumGuaranteeFromGuarantor',
        type: 'number',
        placeholder: 'labels.placeholders.Example 0'
      },
      {
        label: 'labels.inputs.Maximum allowed outstanding balance',
        key: 'outstandingLoanBalance',
        type: 'number',
        placeholder: 'labels.placeholders.Example 100000'
      },
      {
        label: 'labels.inputs.Disallow Expected Disbursements',
        key: 'disallowExpectedDisbursements',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow amortization override',
        key: 'allowAttributeOverrides.amortizationType',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow interest method override',
        key: 'allowAttributeOverrides.interestType',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow repayment strategy override',
        key: 'allowAttributeOverrides.transactionProcessingStrategyCode',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow interest calculation period override',
        key: 'allowAttributeOverrides.interestCalculationPeriodType',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow arrears tolerance override',
        key: 'allowAttributeOverrides.inArrearsTolerance',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow repaid every override',
        key: 'allowAttributeOverrides.repaymentEvery',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow moratorium override',
        key: 'allowAttributeOverrides.graceOnPrincipalAndInterestPayment',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Allow arrears ageing override',
        key: 'allowAttributeOverrides.graceOnArrearsAgeing',
        type: 'checkbox'
      },
      { label: 'labels.inputs.Enable Down Payment', key: 'enableDownPayment', type: 'checkbox' },
      {
        label: 'labels.inputs.Disbursed amount percentage for downpayment',
        key: 'disbursedAmountPercentageForDownPayment',
        type: 'number',
        placeholder: 'labels.placeholders.Example 35'
      },
      {
        label: 'labels.inputs.Enable Auto Repayment for Down Payment',
        key: 'enableAutoRepaymentForDownPayment',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Loan Charge-off behaviour',
        key: 'loanChargeOffBehaviour',
        type: 'select',
        // Codes, matching the template-sourced options this select prefers at render time.
        options: [{ value: 'REGULAR', label: 'Regular' }]
      },
      {
        label: 'labels.inputs.Enable installment level Delinquency',
        key: 'enableInstallmentLevelDelinquency',
        type: 'checkbox'
      },
      { label: 'labels.inputs.Enable income capitalization', key: 'enableIncomeCapitalization', type: 'checkbox' },
      { label: 'labels.inputs.Enable buydown fees', key: 'enableBuydownFees', type: 'checkbox' }
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
    // Reuses the Classic `LoanProductAccountingStepComponent` (rendered by the wizard for
    // `kind: 'accounting'`). It owns the accounting rule radio AND — when Cash/Accrual is selected —
    // the full set of mandatory GL account selectors, validators and advanced mapping rules, exactly
    // like Classic. The wizard folds its collected values (`loanProductAccounting`) into the payload
    // in buildPayloadForSubmit, mirroring Classic's `...loanProductAccountingStep.loanProductAccounting`
    // spread, so Cash / Accrual (periodic) / Accrual (upfront) all send every required account id.
    id: 6,
    title: 'Accounting',
    icon: 'ti-report',
    kind: 'accounting',
    fields: []
  },
  {
    // Reuses the Classic `LoanProductInterestRefundStepComponent`. Sheet row 76 ("Interest Refunds",
    // a highlighted group): the multi-select is only meaningful on the advanced payment allocation
    // strategy, which is the same gate Classic applies, so the wizard shows this step under exactly
    // that condition (see `visibleSteps`).
    id: 10,
    title: 'Interest Refunds',
    icon: 'ti-receipt-refund',
    kind: 'interest-refund',
    fields: []
  },
  {
    // Reuses the Classic `LoanProductDeferredIncomeRecognitionStepComponent`. Sheet rows 77-78
    // ("Defered Income recognition", a highlighted group). The component owns both toggles AND their
    // conditional dependents — `enableIncomeCapitalization` -> capitalizedIncomeCalculationType /
    // capitalizedIncomeStrategy / capitalizedIncomeType, `enableBuyDownFee` -> buyDownFeeCalculationType /
    // buyDownFeeStrategy / buyDownFeeIncomeType / merchantBuyDownFee — with Classic's own
    // add/removeControl logic and `Validators.required`, so the conditional behaviour is reused
    // rather than reimplemented.
    id: 11,
    title: 'Deferred Income Recognition',
    icon: 'ti-cash-banknote',
    kind: 'deferred-income',
    fields: []
  },
  {
    id: 7,
    title: 'Advanced Configuration',
    icon: 'ti-panel',
    fields: [
      {
        label: 'labels.inputs.Use global config values for repayment event',
        key: 'useGlobalConfigForRepaymentEvent',
        type: 'checkbox'
      },
      {
        label: 'labels.inputs.Due days for repayment event',
        key: 'dueDaysForRepaymentEvent',
        type: 'number',
        placeholder: 'labels.placeholders.Example 1',
        min: 0
      },
      {
        label: 'labels.inputs.OverDue days for repayment event',
        key: 'overDueDaysForRepaymentEvent',
        type: 'number',
        placeholder: 'labels.placeholders.Example 1',
        min: 0
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
  allowPartialPeriodInterestCalculation: true,
  isEqualAmortization: false,
  interestCalculationPeriodType: 1,
  loanScheduleType: 'Progressive',
  transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
  loanScheduleProcessingType: 'Horizontal',
  graceOnPrincipalPayment: 0,
  graceOnInterestPayment: 0,
  interestFreePeriod: 0,
  daysInYearType: 360,
  // Backend code, matching the value space of the template-sourced options (see the field config).
  // `normalizeEnumCodesToBackendValues` is idempotent, so an already-coded value passes through.
  daysInYearCustomStrategy: 'FULL_LEAP_YEAR',
  daysInMonthType: 30,
  principalThresholdForLastInstallment: 5,
  canUseForTopup: false,
  isInterestRecalculationEnabled: false,
  // Interest recalculation family. Seeded empty: Classic creates each of these controls only when
  // the toggle is switched on (defaulting each select to its first template option, which
  // `seedInterestRecalculationDefaults` reproduces), and `sanitizeCreateLoanProductPayload` strips
  // the whole family from the payload while the toggle is off — so these seeds never reach a payload
  // for any existing profile.
  preClosureInterestCalculationStrategy: '',
  rescheduleStrategyMethod: '',
  interestRecalculationCompoundingMethod: '',
  recalculationCompoundingFrequencyType: '',
  recalculationCompoundingFrequencyInterval: '',
  recalculationCompoundingFrequencyNthDayType: '',
  recalculationCompoundingFrequencyDayOfWeekType: '',
  recalculationCompoundingFrequencyOnDayType: '',
  recalculationRestFrequencyType: '',
  recalculationRestFrequencyInterval: '',
  recalculationRestFrequencyNthDayType: '',
  recalculationRestFrequencyDayOfWeekType: '',
  recalculationRestFrequencyOnDayType: '',
  isArrearsBasedOnOriginalSchedule: false,
  disallowInterestCalculationOnPastDue: false,
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
  // Classic's guarantee controls default to empty and are only registered while the toggle is on;
  // null keeps them out of the payload until the user fills them in (see the strip in
  // sanitizeCreateLoanProductPayload).
  mandatoryGuarantee: null,
  minimumGuaranteeFromOwnFunds: null,
  minimumGuaranteeFromGuarantor: null,
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
  // Backend code, matching the value space of the template-sourced `chargeOffBehaviourOptions`
  // (whose select binds option ids). `normalizeEnumCodesToBackendValues` is idempotent, so an
  // already-coded value passes straight through and the emitted payload is unchanged.
  loanChargeOffBehaviour: 'REGULAR',
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

export type LoanWizardProfileMode =
  | 'personal'
  | 'custom-advanced'
  | 'two-wheeler'
  | 'education'
  | 'agriculture'
  | 'bnpl'
  | 'home'
  | 'mortgage'
  | 'gold'
  | 'auto'
  | 'jlg'
  | 'consumer-durable'
  | 'credit-card-emi'
  | 'loan-against-securities';

/**
 * Home Loan and Mortgage Loan (LAP) share one product-level configuration. This is what the workbook
 * specifies, not an assumption: the `Home L` and `Mortage L` sheets are cell-for-cell identical, and
 * the index sheet's remark against Mortgage Loan (LAP) gives the reason — "Collateral fields are at
 * the loan account level and not product level". The pledged asset is the only thing that separates a
 * LAP from a home loan, and Fineract carries it on the loan account, so at product level there is
 * nothing left to differentiate. The two profiles therefore differ only in identity (card, route,
 * page title, product description) and share every field-visibility and payload rule below.
 */
export function isHomeOrMortgageProfile(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'home' || profileMode === 'mortgage';
}

export type FormState = typeof INITIAL_FORM_STATE;

/**
 * Guided template modes (Personal, Two Wheeler) hide the HIDDEN_DEFAULTS long-tail, force the
 * Progressive + advanced-payment-allocation stack and run the guided payload transforms in
 * {@link buildPayload}. Only Custom/Advanced exposes every control and lets the form win the merge.
 */
export function isGuidedProfileMode(profileMode: LoanWizardProfileMode): boolean {
  return profileMode !== 'custom-advanced';
}

/**
 * Guided profiles that pin the Progressive + advanced-payment-allocation stack (buildPayload forces
 * schedule/strategy; the wizard seeds the strategy control to the advanced strategy).
 *
 * Education deliberately is NOT on this list: its defining feature is the principal moratorium
 * (graceOnPrincipalPayment), and Fineract's ProgressiveLoanScheduleGenerator does not implement
 * grace periods at all — the create API accepts them on a Progressive product but the generated
 * schedule silently ignores them. Education therefore runs on the Classic Cumulative stack, pinned
 * through its hidden defaults (CUMULATIVE + standard strategy + daily interest calculation).
 *
 * Agriculture is NOT on this list either: a bullet crop loan is the classic Cumulative pattern
 * (numberOfRepayments: 1 with repaymentEvery = the crop-cycle length); Progressive is EMI-oriented
 * and would drag in the advanced-allocation requirement for no benefit.
 */
export function forcesProgressiveStack(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'personal' || profileMode === 'two-wheeler';
}

/**
 * Guided profiles whose payload transmits the multi-disburse family (multiDisburseLoan,
 * maxTrancheCount, allowFullTermForTranche, disallowExpectedDisbursements). Every other guided
 * profile omits all of them — the proven Personal Loan contract. Education needs them: education
 * loans disburse in semester-wise tranches paid to the institution. Home needs them for the same
 * structural reason: the Home L sheet marks the whole family Applicable (rows 55-59) because a
 * construction-linked home loan disburses against build stages rather than in one lump sum.
 */
export function sendsMultiDisburseFields(profileMode: LoanWizardProfileMode): boolean {
  return (
    profileMode === 'education' ||
    profileMode === 'bnpl' ||
    profileMode === 'credit-card-emi' ||
    isHomeOrMortgageProfile(profileMode)
  );
}

/**
 * Guided profiles that transmit `outstandingLoanBalance`. Every other guided profile drops it — the
 * form seeds the base 100000, which no guided product wants as a real cap. BNPL is the exception:
 * its sheet marks the field Applicable (row 56), so it is an editable control whose value must
 * reach the payload, gated on `multiDisburseLoan` exactly as the Classic Settings step gates it.
 * Home and Mortgage are the same case (Home L / Mortage L row 57).
 */
export function sendsOutstandingLoanBalance(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'bnpl' || profileMode === 'credit-card-emi' || isHomeOrMortgageProfile(profileMode);
}

/**
 * Profiles that render the reused Classic `LoanProductInterestRefundStepComponent` — the sheet's
 * highlighted "Interest Refunds" group (row 76). When present, the operator's selection drives
 * `supportedInterestRefundTypes` instead of the template's default list.
 */
export function rendersInterestRefundStep(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'bnpl' || profileMode === 'credit-card-emi';
}

/**
 * Profiles that omit `overAppliedCalculationType` / `overAppliedNumber` from the payload while
 * `allowApprovedDisbursedAmountsOverApplied` is off, exactly as Classic's disabled controls do. See
 * the note in {@link sanitizeCreateLoanProductPayload} for why this is opt-in per profile.
 */
export function dropsDisabledOverAppliedFields(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'bnpl' || profileMode === 'credit-card-emi';
}

/**
 * Profiles that render the reused Classic `LoanProductDeferredIncomeRecognitionStepComponent` — the
 * sheet's highlighted "Defered Income recognition" group (rows 77-78). The step owns
 * `enableIncomeCapitalization` / `enableBuyDownFee` and their conditional dependents, so those two
 * flags are NOT rendered as flat Settings checkboxes for these profiles.
 */
export function rendersDeferredIncomeStep(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'bnpl';
}

/**
 * Profiles that render the borrower-cycle variations step — the sheet's "Terms vary based on loan
 * cycle" rows (26, 27 and 29). JLG is the only sheet in the workbook that marks them Applicable: a
 * joint liability group member's entitlement is expected to grow with each completed cycle, so the
 * product carries per-cycle principal, tenure and rate bands.
 *
 * The step is additionally gated on the `useBorrowerCycle` control at render time (sheet row 12, which
 * JLG also marks Applicable), mirroring Classic's `@if (loanProductTermsForm.value.useBorrowerCycle)`.
 */
export function rendersBorrowerCycleStep(profileMode: LoanWizardProfileMode): boolean {
  return profileMode === 'jlg';
}

/** Fewest tranches a `multiDisburseLoan: true` product can be created with — used as the floor and
 * the empty-value fallback for `maxTrancheCount` in {@link buildPayload}. */
export const MIN_TRANCHE_COUNT = 2;

/**
 * The guarantee inputs Classic registers under `holdGuaranteeFunds` and removes when it is off (see
 * loan-product-settings-step.component.ts). Like the interest recalculation family, the wizard holds
 * them in its one flat FormGroup, so the toggle drives visibility, validators and — through
 * {@link sanitizeCreateLoanProductPayload} — payload inclusion instead of control lifetime.
 */
export const GUARANTEE_FUNDS_DEPENDENT_FIELDS: readonly string[] = [
  'mandatoryGuarantee',
  'minimumGuaranteeFromOwnFunds',
  'minimumGuaranteeFromGuarantor'
];

/**
 * Keys the BNPL sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. BNPL is the widest guided profile — it exposes nearly the whole Settings surface —
 * so rather than re-listing the (shorter) hidden set, `hiddenDefaultsFor('bnpl')` subtracts these.
 *
 * Sheet rows, in order: 17, 18, 19, 25, 32, 33, 35, 37, 42, 43, 44, 49, 53, 54, 55, 56, 57, 58, 67,
 * 68, 69, 70, 71, 72, 76, 77, 78. The remaining `Applicable = Y` rows (name, shortName, externalId,
 * currencyCode, principal, numberOfRepayments, the interest/repayment terms, amortization, interest
 * method, interest calculation period, repayment strategy and the three grace fields) are never in
 * HIDDEN_DEFAULTS to begin with, so they need no entry here.
 */
/**
 * Every control Classic registers under `isInterestRecalculationEnabled` and removes when it is off.
 * The wizard holds them in its one flat FormGroup, so the toggle drives visibility, validators and
 * — through {@link sanitizeCreateLoanProductPayload} — payload inclusion instead of control lifetime.
 */
export const INTEREST_RECALCULATION_FIELDS: readonly string[] = [
  'preClosureInterestCalculationStrategy',
  'rescheduleStrategyMethod',
  'interestRecalculationCompoundingMethod',
  'recalculationCompoundingFrequencyType',
  'recalculationCompoundingFrequencyInterval',
  'recalculationCompoundingFrequencyNthDayType',
  'recalculationCompoundingFrequencyDayOfWeekType',
  'recalculationCompoundingFrequencyOnDayType',
  'recalculationRestFrequencyType',
  'recalculationRestFrequencyInterval',
  'recalculationRestFrequencyNthDayType',
  'recalculationRestFrequencyDayOfWeekType',
  'recalculationRestFrequencyOnDayType',
  'isArrearsBasedOnOriginalSchedule',
  'disallowInterestCalculationOnPastDue'
];

/**
 * Wizard field key -> the backend template property holding its options, for selects Classic also
 * populates from the template rather than a hardcoded list. Resolved at render time in the wizard's
 * `visibleFields`, so the wizard and Classic always offer the identical choices.
 */
export const TEMPLATE_OPTION_SOURCES: Record<string, string> = {
  // Classic's currency step fills its dropdown from `loanProductsTemplate.currencyOptions`
  // (loan-product-currency-step.component.ts), i.e. the currencies actually configured on the tenant.
  currencyCode: 'currencyOptions',
  // Classic's settings step fills its bucket dropdown from `loanProductsTemplate.delinquencyBucketOptions`
  // (loan-product-settings-step.component.ts), i.e. the buckets actually configured on the tenant.
  delinquencyBucketId: 'delinquencyBucketOptions',
  preClosureInterestCalculationStrategy: 'preClosureInterestCalculationStrategyOptions',
  rescheduleStrategyMethod: 'rescheduleStrategyTypeOptions',
  interestRecalculationCompoundingMethod: 'interestRecalculationCompoundingTypeOptions',
  recalculationCompoundingFrequencyType: 'interestRecalculationFrequencyTypeOptions',
  recalculationRestFrequencyType: 'interestRecalculationFrequencyTypeOptions',
  recalculationCompoundingFrequencyNthDayType: 'interestRecalculationNthDayTypeOptions',
  recalculationRestFrequencyNthDayType: 'interestRecalculationNthDayTypeOptions',
  recalculationCompoundingFrequencyDayOfWeekType: 'interestRecalculationDayOfWeekTypeOptions',
  recalculationRestFrequencyDayOfWeekType: 'interestRecalculationDayOfWeekTypeOptions',
  loanChargeOffBehaviour: 'chargeOffBehaviourOptions',
  daysInYearCustomStrategy: 'daysInYearCustomStrategyOptions'
};

/**
 * The "on day" pseudo-option Classic pushes onto the nth-day list
 * (`interestRecalculationNthDayTypeData.push({ id: -2, code: 'onDay', value: 'on day' })`). Selecting
 * it swaps the day-of-week select for the day-of-month one.
 */
export const NTH_DAY_ON_DAY_OPTION: SelectOption = { value: -2, label: 'on day' };

/** Day-of-month choices Classic builds as `Array.from({ length: 28 }, (_, i) => i + 1)`. */
export const ON_DAY_OF_MONTH_OPTIONS: SelectOption[] = Array.from({ length: 28 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1)
}));

const BNPL_VISIBLE_KEYS: readonly string[] = [
  'allowApprovedDisbursedAmountsOverApplied',
  'overAppliedCalculationType',
  'overAppliedNumber',
  'interestRecognitionOnDisbursementDate',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'isInterestRecalculationEnabled',
  'multiDisburseLoan',
  'maxTrancheCount',
  'outstandingLoanBalance',
  'disallowExpectedDisbursements',
  'allowFullTermForTranche',
  'enableDownPayment',
  'disbursedAmountPercentageForDownPayment',
  'enableAutoRepaymentForDownPayment',
  'loanChargeOffBehaviour',
  'delinquencyBucketId',
  'enableInstallmentLevelDelinquency',
  // Owned by the reused Classic Interest Refund / Deferred Income Recognition steps for BNPL (the
  // highlighted sheet groups), so the step's emitted value — not a pinned default — drives the payload.
  'supportedInterestRefundTypes',
  'enableIncomeCapitalization',
  'enableBuydownFees'
];

/**
 * Keys the Home L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 16, 33, 34, 36, 38, 43, 44, 45, 50, 53, 54, 55, 56, 57, 58,
 * 59, 72. The remaining `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal,
 * numberOfRepayments, the interest/repayment terms, amortization, interest method, interest
 * calculation period, repayment strategy, the three grace fields, charges and accounting) are never
 * in HIDDEN_DEFAULTS to begin with, so they need no entry here.
 *
 * Two sheet rows are deliberately NOT listed:
 * - Row 17 ("Installment day calculation from", sample "Disbursement Date") and row 29
 *   (`repaymentStartDateType`, sample 1) are the same backend field, and the sheet marks the first
 *   Applicable and the second Hidden. The wizard's select offers exactly that one option, so
 *   `isProfileOrStrategyDeterminedField` hides it for every profile — the same resolution BNPL made
 *   for the identical contradiction on its own sheet.
 * - Rows 68-70 (the down payment trio) are marked Hidden with a blank Default Value, so they inherit
 *   the master defaults from HIDDEN_DEFAULTS (enabled, 35%, auto-repayment on) exactly as Personal
 *   Loan does. A home loan's margin money is therefore fixed by the template rather than editable.
 */
const HOME_VISIBLE_KEYS: readonly string[] = [
  'isLinkedToFloatingInterestRates',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'holdGuaranteeFunds',
  'isInterestRecalculationEnabled',
  'multiDisburseLoan',
  'maxTrancheCount',
  'outstandingLoanBalance',
  'disallowExpectedDisbursements',
  'allowFullTermForTranche',
  'delinquencyBucketId'
];

/**
 * Keys the Gold L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 32, 33, 35, 37, 41, 42, 43, 44, 49, 52, 71. The remaining
 * `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal, numberOfRepayments,
 * the interest/repayment terms, amortization, interest method, interest calculation period, repayment
 * strategy, the three grace fields, charges and accounting) are never in HIDDEN_DEFAULTS to begin
 * with, so they need no entry here.
 *
 * Row 16 ("Installment day calculation from", sample "Disbursement Date") is deliberately NOT listed:
 * it and row 28 (`repaymentStartDateType`, sample 1) are the same backend field, and the sheet marks
 * the first Applicable and the second Hidden. The wizard's select offers exactly that one option, so
 * `isProfileOrStrategyDeterminedField` hides it for every profile — the same resolution Home and BNPL
 * made for the identical contradiction on their own sheets.
 */
const GOLD_VISIBLE_KEYS: readonly string[] = [
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  // Row 41. Gold is the only sheet so far that marks the arrears tolerance Applicable: the pledged
  // ornament is revalued and auctioned on default, so the tolerance band is a real underwriting lever
  // rather than a fixed product constant.
  'inArrearsTolerance',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'holdGuaranteeFunds',
  'delinquencyBucketId'
];

/**
 * Keys the Auto L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 15, 32, 33, 35, 37, 42, 43, 44, 49, 53, 67, 68, 69, 71. The
 * remaining `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal,
 * numberOfRepayments, the interest/repayment terms, amortization, interest method, interest
 * calculation period, repayment strategy, the three grace fields, charges and accounting) are never in
 * HIDDEN_DEFAULTS to begin with, so they need no entry here.
 *
 * Row 16 ("Installment day calculation from") is deliberately NOT listed, for the same reason it is
 * omitted from {@link GOLD_VISIBLE_KEYS} — see the note there.
 */
const AUTO_VISIBLE_KEYS: readonly string[] = [
  'isLinkedToFloatingInterestRates',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'isInterestRecalculationEnabled',
  // Rows 67-69. Unlike Two Wheeler — which pins the toggle on and exposes only the percentage — the
  // Auto sheet marks all three down-payment fields Applicable, so the whole trio is editable. This is
  // the structural difference between this profile and Gold, whose sheet keeps the trio on the master
  // defaults.
  'enableDownPayment',
  'disbursedAmountPercentageForDownPayment',
  'enableAutoRepaymentForDownPayment',
  'delinquencyBucketId'
];

/**
 * Keys the JLG L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 7, 12, 26, 27, 29, 32, 33, 35, 37, 42, 43, 44, 49, 53, 71. The
 * remaining `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal,
 * numberOfRepayments, the interest/repayment terms, amortization, interest method, interest
 * calculation period, repayment strategy, the three grace fields, charges and accounting) are never in
 * HIDDEN_DEFAULTS to begin with, so they need no entry here.
 *
 * Rows 7/12 and 26/27/29 are what make this sheet unlike every other one in the workbook: JLG is the
 * only product whose terms vary by the borrower's loan cycle, which is the defining microfinance
 * pattern — a group member's entitlement grows with each successfully repaid cycle. Rows 26/27/29 are
 * therefore rendered by the dedicated `borrower-cycle` step rather than as flat form controls; see
 * {@link rendersBorrowerCycleStep}.
 */
const JLG_VISIBLE_KEYS: readonly string[] = [
  'includeInBorrowerCycle',
  'useBorrowerCycle',
  'principalVariationsForBorrowerCycle',
  'numberOfRepaymentVariationsForBorrowerCycle',
  'interestRateVariationsForBorrowerCycle',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'isInterestRecalculationEnabled',
  'delinquencyBucketId'
];

/**
 * Keys the Consumer Durable L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS}
 * would otherwise pin. Sheet rows, in order: 32, 33, 35, 37, 42, 43, 44, 49, 51, 53, 67, 68, 69, 71.
 * The remaining `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal,
 * numberOfRepayments, the interest/repayment terms, amortization, interest method, interest
 * calculation period, repayment strategy, the three grace fields, charges and accounting) are never in
 * HIDDEN_DEFAULTS to begin with, so they need no entry here.
 *
 * Row 16 needs no exemption on this sheet: unlike Home, Gold and Auto — where row 16 is Applicable and
 * contradicts the Hidden row 28 for the same backend field — Consumer Durable marks it Not Applicable
 * with the sample as its default, so `repaymentStartDateType` simply stays hidden.
 */
const CONSUMER_DURABLE_VISIBLE_KEYS: readonly string[] = [
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  // Row 51. Unique to this sheet among the profiles shipped so far: a customer who has repaid one
  // appliance is the prime candidate for financing the next, so top-up is a real product lever here
  // rather than the fixed `false` every other guided template pins.
  'canUseForTopup',
  'isInterestRecalculationEnabled',
  // Rows 67-69, all three Applicable — the same shape as Auto. Point-of-sale finance is quoted as
  // "pay X% today, the rest over N months", so the down payment is the headline commercial term.
  'enableDownPayment',
  'disbursedAmountPercentageForDownPayment',
  'enableAutoRepaymentForDownPayment',
  'delinquencyBucketId'
];

/**
 * Keys the Card L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 17, 18, 19, 25, 32, 33, 35, 37, 42, 43, 44, 49, 53, 54, 55,
 * 56, 57, 58, 67, 68, 69, 70, 71, 72, 76. The remaining `Applicable = Y` rows (name, shortName,
 * externalId, currencyCode, principal, numberOfRepayments, the interest/repayment terms,
 * amortization, interest method, interest calculation period, repayment strategy, the three grace
 * fields, charges and accounting) are never in HIDDEN_DEFAULTS to begin with.
 *
 * This is BNPL's list exactly, minus `enableIncomeCapitalization` and `enableBuydownFees`: the Card L
 * sheet marks rows 77-78 Not Applicable, so a card EMI product does not render the Deferred Income
 * Recognition step even though it does render the Interest Refund step (row 76). It is the first
 * profile to take one of that pair without the other — see {@link rendersInterestRefundStep} and
 * {@link rendersDeferredIncomeStep}.
 *
 * Row 16 is deliberately NOT listed. It and row 28 (`repaymentStartDateType`) are the same backend
 * field, and the sheet marks the first Applicable and the second Hidden. The wizard's select offers
 * exactly that one option, so `isProfileOrStrategyDeterminedField` hides it for every profile — the
 * same resolution Home, Gold, Auto and BNPL made for the identical contradiction.
 */
const CREDIT_CARD_EMI_VISIBLE_KEYS: readonly string[] = [
  'allowApprovedDisbursedAmountsOverApplied',
  'overAppliedCalculationType',
  'overAppliedNumber',
  'interestRecognitionOnDisbursementDate',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  'isInterestRecalculationEnabled',
  'multiDisburseLoan',
  'maxTrancheCount',
  'outstandingLoanBalance',
  'disallowExpectedDisbursements',
  'allowFullTermForTranche',
  'enableDownPayment',
  'disbursedAmountPercentageForDownPayment',
  'enableAutoRepaymentForDownPayment',
  'loanChargeOffBehaviour',
  'delinquencyBucketId',
  'enableInstallmentLevelDelinquency',
  // Owned by the reused Classic Interest Refund step (row 76), so the step's emitted value — not a
  // pinned default — drives the payload.
  'supportedInterestRefundTypes'
];

/**
 * Keys the LAS L sheet marks `is Applicable = Y` that the base {@link HIDDEN_DEFAULTS} would
 * otherwise pin. Sheet rows, in order: 15, 32, 33, 35, 37, 42, 43, 44, 49, 52, 53, 71. The remaining
 * `Applicable = Y` rows (name, shortName, externalId, currencyCode, principal, numberOfRepayments,
 * the interest/repayment terms, amortization, interest method, interest calculation period, repayment
 * strategy, the three grace fields, charges and accounting) are never in HIDDEN_DEFAULTS to begin with.
 *
 * Two Applicable rows are deliberately NOT listed, both because the sheet contradicts itself:
 *
 * - Row 16 ("Installment day calculation from") and row 28 (`repaymentStartDateType`) are the same
 *   backend field, marked Applicable and Hidden respectively. The wizard's select offers exactly that
 *   one option, so `isProfileOrStrategyDeterminedField` hides it for every profile — the resolution
 *   Home, Gold, Auto and BNPL all made for this identical pair.
 *
 * - Row 58 (`allowFullTermForTranche`) is Applicable while rows 54-57 — `multiDisburseLoan` and the
 *   rest of the multi-disburse family — are all Not Applicable. A "full term for tranche" flag is
 *   meaningless without tranches: it is gated on `multiDisburseLoan` in the UI and dropped from the
 *   payload entirely for any profile outside {@link sendsMultiDisburseFields}, which this one is.
 *   Exposing it alone would render a control that cannot affect the product, so the family is treated
 *   as Not Applicable as a whole — the reading rows 54-57 support.
 */
const LOAN_AGAINST_SECURITIES_VISIBLE_KEYS: readonly string[] = [
  // Row 15. Securities-backed lending is commonly priced off a floating benchmark, so this profile
  // exposes the link — the same call Home and Auto make, and the opposite of Gold and JLG.
  'isLinkedToFloatingInterestRates',
  'allowPartialPeriodInterestCalculation',
  'isEqualAmortization',
  'loanScheduleType',
  'loanScheduleProcessingType',
  'daysInYearType',
  'daysInYearCustomStrategy',
  'daysInMonthType',
  'principalThresholdForLastInstallment',
  // Row 52. The pledged portfolio is held as security, so the guarantee-funds machinery is a real
  // control here, as it is for Home and Gold.
  'holdGuaranteeFunds',
  'isInterestRecalculationEnabled',
  'delinquencyBucketId'
];

/**
 * A per-call copy of {@link HIDDEN_DEFAULTS} with its mutable values isolated.
 *
 * A bare `{ ...HIDDEN_DEFAULTS }` is a SHALLOW copy, so the borrower-cycle variation arrays
 * (`principalVariationsForBorrowerCycle` and siblings) would be the same array instance in every
 * object `hiddenDefaultsFor` ever returns — and in the module-level constant itself. Nothing mutates
 * them in place today (the borrower-cycle step assigns a fresh array rather than pushing), but a
 * single future `payload.principalVariationsForBorrowerCycle.push(...)` would silently corrupt every
 * profile for the lifetime of the page. Copying the arrays here keeps each caller's object its own.
 */
function cloneHiddenDefaults(): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...HIDDEN_DEFAULTS };
  for (const [
    key,
    value
  ] of Object.entries(clone)) {
    if (Array.isArray(value)) {
      clone[key] = [...value];
    }
  }
  return clone;
}

/**
 * The hidden, always-sent defaults for a profile mode. Guided profiles hide every key of the
 * returned object in the UI and spread it LAST in {@link buildPayload}'s merge, so a key must be
 * removed here (not just overridden) the moment a profile exposes it as an editable control —
 * otherwise the default would clobber the user's input.
 */
export function hiddenDefaultsFor(profileMode: LoanWizardProfileMode): Record<string, unknown> {
  if (profileMode === 'two-wheeler') {
    const defaults: Record<string, unknown> = { ...cloneHiddenDefaults(), description: 'Two Wheeler Loan Product' };
    // The down payment percentage is THE commercial lever of a two wheeler product (it is how
    // lenders control loan-to-value on a fast-depreciating asset), so this profile exposes it as a
    // visible, editable Settings control — see PROFILE_EXTRA_VISIBLE_FIELDS. `enableDownPayment`
    // itself stays hidden and forced true: turning it off would make the product a personal loan.
    delete defaults.disbursedAmountPercentageForDownPayment;
    // The delinquency bucket is an editable risk control for this template (spreadsheet marks it
    // Applicable for Two Wheeler): drop it from the hidden defaults so the visible select's value
    // wins the guided "defaults win" merge. buildPayload normalizes the None option ('') back to
    // null, keeping the same payload contract Personal sends from its hidden null default.
    delete defaults.delinquencyBucketId;
    return defaults;
  }
  if (profileMode === 'education') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Education Loan Product',
      // No down payment concept in an education loan — overrides the base hidden true. The sanitize
      // step then drops the two down-payment dependents exactly as it does for Classic.
      enableDownPayment: false,
      // Follow-on funding for higher studies is a real pattern; cheap to allow.
      canUseForTopup: true,
      // First (interest) installment a month after the first tranche reaches the institution.
      minimumDaysBetweenDisbursalAndFirstRepayment: 30,
      // The Cumulative stack (see forcesProgressiveStack): Fineract's Progressive schedule
      // generator has no grace/moratorium support, so the moratorium product must run on the
      // Classic Cumulative path. Daily interest calculation keeps the tranche-friendly
      // configuration Classic uses for multi-disbursal products, and the standard strategy avoids
      // the advanced-allocation requirement that would drag Progressive back in.
      loanScheduleType: 'Cumulative',
      transactionProcessingStrategyCode: 'mifos-standard-strategy',
      interestCalculationPeriodType: 0,
      // Universal for education loans: declining balance, fixed EMI after the moratorium. Pinned
      // (and therefore hidden) so the operator's surface stays "course length → moratorium →
      // repayment years".
      interestType: 0,
      amortizationType: 1,
      // Banks charge interest from day one; an interest-free moratorium would be a pricing
      // giveaway. Hidden to avoid confusion with the two real grace fields, which stay visible as
      // this template's headline controls.
      interestFreePeriod: 0
    };
    // Semester-wise tranche count is the product lever operators actually tune, so it is a
    // visible, editable control (its default comes from PROFILE_INITIAL_OVERRIDES). It must leave
    // the hidden defaults or the guided "defaults win" merge would clobber the user's input.
    // (The rest of the multi-disburse family stays pinned here and is transmitted — see
    // sendsMultiDisburseFields in buildPayload; the outstanding-balance cap is dropped there for
    // every guided profile. loanScheduleProcessingType stays HORIZONTAL like every other profile —
    // Fineract only restricts VERTICAL to the advanced strategy.)
    delete defaults.maxTrancheCount;
    // Editable delinquency bucket (spreadsheet marks it Applicable for Education): see the
    // Two Wheeler branch — dropped from hidden defaults so the visible select drives the payload.
    delete defaults.delinquencyBucketId;
    return defaults;
  }
  if (profileMode === 'agriculture') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Agriculture Loan Product',
      // Production credit carries no down payment concept — overrides the base hidden true; the
      // sanitize step then drops the two down-payment dependents.
      enableDownPayment: false,
      // Bullet repayment at harvest is the classic Cumulative pattern (see forcesProgressiveStack).
      // At settlement, clear principal first, then interest — the borrower-friendly ordering for
      // partial harvest-time payments.
      loanScheduleType: 'Cumulative',
      transactionProcessingStrategyCode: 'principal-interest-penalties-fees-order-strategy',
      // With a single installment, flat = simple interest on the full principal for the term —
      // exactly how crop-loan interest is quoted and how subvention is computed. One period, one
      // interest amount: daily calculation adds nothing; amortization is meaningless with N=1 and
      // is pinned to a valid value.
      interestType: 1,
      amortizationType: 1,
      interestCalculationPeriodType: 1,
      // A bullet product has nothing to moratorium: Fineract requires grace < numberOfRepayments
      // (= 1), so all three grace controls are pinned to 0 and hidden. The guided grace guard in
      // buildPayload would drop any value >= 1 anyway; hiding removes the invalid states entirely.
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      interestFreePeriod: 0,
      // Seasonal arrears behavior: post-harvest sale proceeds take weeks to arrive, so don't age
      // arrears instantly, and tolerate small rounding/short-payments at settlement.
      graceOnArrearsAgeing: 30,
      inArrearsTolerance: 100,
      // One fixed installment; nothing for the borrower to define or vary.
      canDefineInstallmentAmount: false
    };
    // The seasonal NPA clock is the one risk lever Fineract exposes for the RBI "crop seasons"
    // norm, so it is a visible, editable Settings control (default 180 ≈ one season, via
    // PROFILE_INITIAL_OVERRIDES). It must leave the hidden defaults or the guided "defaults win"
    // merge would clobber the user's input.
    delete defaults.overdueDaysForNPA;
    // Editable delinquency bucket (spreadsheet marks it Applicable for Agriculture): see the
    // Two Wheeler branch — dropped from hidden defaults so the visible select drives the payload.
    delete defaults.delinquencyBucketId;
    return defaults;
  }
  if (profileMode === 'bnpl') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'BNPL Loan Product'
    };
    // Every key below is marked `is Applicable = Y` in the BNPL sheet, so BNPL renders it as an
    // editable control. Each must be REMOVED (not overridden) from the hidden defaults, because the
    // guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of BNPL_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (isHomeOrMortgageProfile(profileMode)) {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: profileMode === 'mortgage' ? 'Mortgage Loan Product' : 'Home Loan Product'
    };
    // Every key below is marked `is Applicable = Y` on the Home L sheet, so the profile renders it as
    // an editable control. Each must be REMOVED (not overridden) from the hidden defaults, because
    // the guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of HOME_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'gold') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Gold Loan Product',
      // Row 54 is the only sheet row in the workbook that pins `multiDisburseLoan` to an explicit
      // FALSE (Home marks the whole tranche family Applicable; the older guided sheets leave the
      // Default Value blank). A gold loan disburses once against a single pledged lot, so the whole
      // family stays hidden AND is dropped from the payload — Gold is absent from both
      // `sendsMultiDisburseFields` and `sendsOutstandingLoanBalance`. Overriding the base `true` here
      // matters even though the key never reaches the payload: `hiddenDefaultsFor` also feeds the
      // wizard's hidden-key set, and PROFILE_INITIAL_OVERRIDES seeds the matching FormControl false so
      // the reused Classic Charges step stops offering tranche-only charges.
      multiDisburseLoan: false,
      // Row 53, pinned FALSE. Interest recalculation is meaningless on a short bullet-style pledge
      // loan, and Home is the profile that exposes it — Gold's sheet marks it Not Applicable.
      isInterestRecalculationEnabled: false,
      // Row 15, Not Applicable (Home marks it Applicable). Gold is quoted at a fixed rate for the
      // pledge period; the base hidden `false` already matches, and it stays hidden.
      isLinkedToFloatingInterestRates: false
    };
    // Every key below is marked `is Applicable = Y` on the Gold L sheet, so the profile renders it as
    // an editable control. Each must be REMOVED (not overridden) from the hidden defaults, because
    // the guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of GOLD_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'auto') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Auto Loan Product'
      // The multi-disburse family (rows 54-58) is Not Applicable with a BLANK Default Value, so unlike
      // Gold — whose row 54 pins an explicit FALSE — it simply inherits the master defaults and is
      // dropped from the payload wholesale, since Auto is absent from `sendsMultiDisburseFields` and
      // `sendsOutstandingLoanBalance`. That is exactly what Two Wheeler, the closest existing analogue,
      // already does.
    };
    // Every key below is marked `is Applicable = Y` on the Auto L sheet, so the profile renders it as
    // an editable control. Each must be REMOVED (not overridden) from the hidden defaults, because
    // the guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of AUTO_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'jlg') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'JLG Loan Product',
      // Row 67, pinned FALSE, overriding the base hidden `true`. A joint liability group loan has no
      // down payment concept — the group's guarantee is the security — so the sanitize step then drops
      // the two down-payment dependents exactly as it does for Education and Agriculture.
      enableDownPayment: false,
      // Row 15, Not Applicable with an explicit FALSE. Group lending is quoted at a fixed rate for the
      // cycle; the base hidden `false` already matches and it stays hidden.
      isLinkedToFloatingInterestRates: false
    };
    // Every key below is marked `is Applicable = Y` on the JLG L sheet, so the profile renders it as an
    // editable control. Each must be REMOVED (not overridden) from the hidden defaults, because the
    // guided merge spreads `defaults` last and would otherwise clobber the user's input — and for the
    // three variation arrays it would clobber the borrower-cycle step's collected rows with `[]`.
    for (const exposedKey of JLG_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'consumer-durable') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Consumer Durable Loan Product'
      // The multi-disburse family (rows 54-58) is Not Applicable with a BLANK Default Value, so it
      // inherits the master defaults and is dropped from the payload wholesale — this profile is absent
      // from both `sendsMultiDisburseFields` and `sendsOutstandingLoanBalance`. Same treatment as Auto
      // and Two Wheeler; only Gold's sheet pins an explicit FALSE.
    };
    // Every key below is marked `is Applicable = Y` on the Consumer Durable L sheet, so the profile
    // renders it as an editable control. Each must be REMOVED (not overridden) from the hidden
    // defaults, because the guided merge spreads `defaults` last and would clobber the user's input.
    for (const exposedKey of CONSUMER_DURABLE_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'credit-card-emi') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Credit Card EMI Loan Product'
    };
    // Every key below is marked `is Applicable = Y` on the Card L sheet, so the profile renders it as
    // an editable control. Each must be REMOVED (not overridden) from the hidden defaults, because the
    // guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of CREDIT_CARD_EMI_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'loan-against-securities') {
    const defaults: Record<string, unknown> = {
      ...cloneHiddenDefaults(),
      description: 'Loan vs Securities / FD Product'
      // The multi-disburse family (rows 54-58) is Not Applicable with blank Default Values, so it
      // inherits the master defaults and is dropped from the payload wholesale — this profile is
      // absent from both `sendsMultiDisburseFields` and `sendsOutstandingLoanBalance`. Same treatment
      // as Auto and Consumer Durable; see LOAN_AGAINST_SECURITIES_VISIBLE_KEYS for why row 58 does not
      // change that.
    };
    // Every key below is marked `is Applicable = Y` on the LAS L sheet, so the profile renders it as an
    // editable control. Each must be REMOVED (not overridden) from the hidden defaults, because the
    // guided merge spreads `defaults` last and would otherwise clobber the user's input.
    for (const exposedKey of LOAN_AGAINST_SECURITIES_VISIBLE_KEYS) {
      delete defaults[exposedKey];
    }
    return defaults;
  }
  if (profileMode === 'custom-advanced') {
    const d: Record<string, unknown> = { ...cloneHiddenDefaults() };
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
  }
  return { ...cloneHiddenDefaults() };
}

/**
 * The visible-control prefills shared by the Home and Mortgage profiles (see
 * {@link isHomeOrMortgageProfile} for why one object serves both).
 *
 * Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments`. Every sheet in
 * the workbook carries the SAME boilerplate sample values in column E (10000 / 12% / 12), inherited
 * from the `All Params` master — they are not per-product figures, and the sheets' `Default Value`
 * column is blank for all three. Seeding a headline ticket size or tenure here would be inventing a
 * commercial policy the workbook does not state, so these stay on the shared INITIAL_FORM_STATE seed
 * and the operator enters them.
 */
const HOME_AND_MORTGAGE_INITIAL_OVERRIDES: Partial<FormState> = {
  // Rows 36/37/38, resolved exactly as BNPL resolves the same three: the sheet's Progressive schedule
  // cannot coexist with the non-advanced strategy row 37 samples, because Fineract only accepts
  // loanScheduleProcessingType (and the other Progressive-only settings) alongside the advanced
  // payment allocation strategy. Progressive wins and the strategy is seeded to match. Seeded rather
  // than pinned because row 36 marks the schedule type Applicable.
  loanScheduleType: 'Progressive',
  transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
  loanScheduleProcessingType: 'Horizontal',
  // Rows 55-59. Staged disbursement is the structural difference between these two profiles and the
  // single-disbursal templates: the sheet marks the whole tranche family Applicable, so the toggle is
  // seeded on and the tranche cap, the balance cap and both tranche flags are editable controls.
  // `disallowExpectedDisbursements` keeps the base default rather than being re-seeded here.
  multiDisburseLoan: true,
  maxTrancheCount: 4,
  outstandingLoanBalance: 100000,
  // Rows 43/45 — seeded to the sheet's values, and editable because both rows are Applicable.
  daysInYearType: 360,
  daysInMonthType: 30
};

/**
 * Visible-control prefills that differ from INITIAL_FORM_STATE per profile. They seed the
 * FormGroup AND win over the generic backend template in the wizard's `syncTemplateDefaults` —
 * a curated product template deliberately overrides the template's generic defaults (e.g. two
 * wheeler rates are quoted per YEAR, while the backend template defaults the frequency to
 * per month; 14 per month would be a very different product).
 */
export const PROFILE_INITIAL_OVERRIDES: Partial<Record<LoanWizardProfileMode, Partial<FormState>>> = {
  'two-wheeler': {
    principal: 80000, // mid-range new two-wheeler on-road price
    numberOfRepayments: 36, // standard 3-year EMI plan
    interestRatePerPeriod: 14, // mid-market two-wheeler rate
    interestRateFrequencyType: 3, // per year — how the product is quoted and sold
    // Down payment is the product's defining feature. The `enableDownPayment` payload value is
    // forced true via hiddenDefaultsFor, but the FormControl must ALSO be seeded true because the
    // down payment %'s visibility gates on the control's value (see the wizard's visibleFields).
    enableDownPayment: true,
    disbursedAmountPercentageForDownPayment: 20 // ≈ 80% LTV, the industry midpoint
  },
  education: {
    principal: 500000, // typical domestic education loan ticket
    numberOfRepayments: 120, // 10-year repayment phase after the moratorium
    interestRatePerPeriod: 10.5, // mid-market education loan rate
    interestRateFrequencyType: 3, // per year — how the product is quoted
    // The headline field: principal moratorium ≈ 2-year course + buffer, in monthly periods.
    // Editable because it tracks the borrower's actual course length; stays < numberOfRepayments
    // or the guided grace guard drops it (Fineract requires grace < numberOfRepayments).
    graceOnPrincipalPayment: 24,
    // 8 semester tranches cover a 4-year course. Editable; visibility of the control gates on the
    // multiDisburseLoan control, which INITIAL_FORM_STATE already seeds true for guided profiles.
    maxTrancheCount: 8,
    // Seed the controls to the pinned Cumulative stack so the wizard UI agrees with the payload:
    // the Payment Allocation step hides itself for a non-advanced strategy, exactly as intended.
    loanScheduleType: 'Cumulative',
    transactionProcessingStrategyCode: 'mifos-standard-strategy'
  },
  agriculture: {
    principal: 100000, // typical scale-of-finance ticket
    // THE bullet: one installment containing all principal and interest at cycle end. Editable so
    // a two-season variant (2 × 6 months) stays possible without leaving the template.
    numberOfRepayments: 1,
    // Crop-cycle length — the field the product manager actually tunes (6 = single kharif/rabi
    // season, 12 = annual, 18 = sugarcane).
    repaymentEvery: 12,
    interestRatePerPeriod: 7, // subvented crop-loan headline rate; fully policy-driven
    interestRateFrequencyType: 3, // per year
    // Day-based proxy for the RBI "one/two crop seasons" NPA norm: 180 ≈ one season,
    // 360 ≈ two seasons for short-duration crops. Visible and editable per crop profile.
    overdueDaysForNPA: 180,
    // Seed the controls to the pinned Cumulative stack so the wizard UI agrees with the payload.
    loanScheduleType: 'Cumulative',
    transactionProcessingStrategyCode: 'principal-interest-penalties-fees-order-strategy'
  },
  bnpl: {
    principal: 10000, // sheet row 13 — a typical cart value, not a lending ticket
    numberOfRepayments: 12, // row 14
    interestRatePerPeriod: 12, // row 20
    interestRateFrequencyType: 2, // row 21 — per month
    // Row 40. The defining BNPL lever: the promotional interest-free window at the start of the
    // plan. Rows 38/39 sample 120 for the two grace fields against 12 repayments, which Fineract
    // rejects (grace must be < numberOfRepayments) and the guided grace guard would drop, so those
    // two keep the neutral 0 seed and stay editable.
    interestFreePeriod: 1,
    // Row 67/68/69. Down payment at checkout is intrinsic to BNPL, so the toggle is seeded on and
    // its two dependents are seeded to the sheet's values; all three stay editable.
    enableDownPayment: true,
    disbursedAmountPercentageForDownPayment: 35,
    enableAutoRepaymentForDownPayment: true,
    // Row 77 — deferred income recognition is on by default for BNPL (merchant-subsidised income is
    // recognised over the plan, not at disbursement). Rendered by the reused Classic step.
    enableIncomeCapitalization: true,
    // Rows 35/36/37. Progressive is the sheet's schedule type, and Fineract only accepts the
    // advanced payment allocation strategy (and therefore loanScheduleProcessingType,
    // chargeOffBehaviour and supportedInterestRefundTypes) on a Progressive product. Row 36 samples
    // a non-advanced strategy, which cannot coexist with row 35 — Progressive wins, matching the
    // Classic Settings step, which rewrites the strategy when the schedule type changes. Seeded
    // rather than pinned because row 35 marks the schedule type Applicable.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal'
  },
  home: HOME_AND_MORTGAGE_INITIAL_OVERRIDES,
  // Identical product-level configuration to Home — see isHomeOrMortgageProfile.
  mortgage: HOME_AND_MORTGAGE_INITIAL_OVERRIDES,
  gold: {
    // Rows 35/36/37, resolved exactly as Home and BNPL resolve the same three: the sheet's Progressive
    // schedule cannot coexist with the non-advanced strategy row 36 samples, because Fineract only
    // accepts loanScheduleProcessingType (and the other Progressive-only settings) alongside the
    // advanced payment allocation strategy. Progressive wins and the strategy is seeded to match.
    // Seeded rather than pinned because row 35 marks the schedule type Applicable.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Row 54's explicit FALSE. The control is hidden for this profile, but it still has to carry the
    // sheet's value: the reused Classic Charges step binds to it (`chargesMultiDisburseControl`) and
    // would otherwise offer tranche-only charges on a single-disbursal product. See hiddenDefaultsFor.
    multiDisburseLoan: false,
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The Gold L sheet carries the same 10000 / 12% / 12
    // boilerplate every other sheet inherits from `All Params`, with a blank Default Value column, so
    // seeding a loan-to-value or a pledge tenure here would invent commercial policy the sheet does
    // not state.
  },
  auto: {
    // Rows 35/36/37 — the same Progressive + advanced-allocation resolution Home, Gold and BNPL apply
    // to the identical contradiction on their own sheets.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Rows 67/68/69, seeded to the sheet's sample values. Down payment is intrinsic to vehicle finance
    // (it is how the lender controls loan-to-value on a depreciating asset), so the toggle is seeded on
    // — INITIAL_FORM_STATE seeds it false — and all three stay editable, per the sheet.
    enableDownPayment: true,
    disbursedAmountPercentageForDownPayment: 35,
    enableAutoRepaymentForDownPayment: true,
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The Auto L sheet carries the same 10000 / 12% / 12
    // boilerplate every other sheet inherits from `All Params`, with a blank Default Value column, so
    // seeding a headline ticket size or tenure here would invent commercial policy the sheet does not
    // state.
  },
  jlg: {
    // Rows 35/36/37 — the same Progressive + advanced-allocation resolution Home, Gold and BNPL apply
    // to the identical contradiction on their own sheets.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Row 12. The defining JLG feature, and the gate the borrower-cycle step renders behind, so the
    // toggle is seeded ON — INITIAL_FORM_STATE seeds it false — and stays editable per the sheet.
    useBorrowerCycle: true,
    // Row 7, Applicable and seeded on: a JLG product only makes sense if the member's completed loans
    // are counted, since that counter is what the cycle variations key off.
    includeInBorrowerCycle: true,
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The JLG L sheet carries the same 10000 / 12% / 12
    // boilerplate every other sheet inherits from `All Params`, with a blank Default Value column. It
    // matters more here than elsewhere: the per-cycle bands entered in the borrower-cycle step are the
    // real ticket sizes, so seeding a headline figure would actively mislead.
  },
  'consumer-durable': {
    // Rows 35/36/37 — the same Progressive + advanced-allocation resolution Home, Gold, Auto and BNPL
    // apply to the identical contradiction on their own sheets.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Rows 67/68/69, seeded to the sheet's sample values. Point-of-sale finance is sold as "pay X%
    // today, the rest over N months", so the toggle is seeded on — INITIAL_FORM_STATE seeds it false —
    // and all three stay editable, per the sheet. Same shape as Auto.
    enableDownPayment: true,
    disbursedAmountPercentageForDownPayment: 35,
    enableAutoRepaymentForDownPayment: true,
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The Consumer Durable L sheet carries the same
    // 10000 / 12% / 12 boilerplate every other sheet inherits from `All Params`, with a blank Default
    // Value column, so seeding a headline ticket size or tenure would invent commercial policy the
    // sheet does not state.
  },
  'credit-card-emi': {
    // Rows 35/36/37. Progressive is the sheet's schedule type, and Fineract only accepts the advanced
    // payment allocation strategy — and therefore loanScheduleProcessingType, chargeOffBehaviour and
    // supportedInterestRefundTypes — on a Progressive product. Row 36 samples a non-advanced strategy,
    // which cannot coexist with row 35, so Progressive wins and the strategy is seeded to match. This
    // matters more here than elsewhere: three of this profile's Applicable rows are gated on it.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Row 40. The promotional interest-free window at the start of the plan — the "no cost EMI" a card
    // issuer advertises. Rows 38/39 sample 120 for the two grace fields against 12 repayments, which
    // Fineract rejects (grace must be < numberOfRepayments), so those keep the neutral 0 seed and stay
    // editable, exactly as BNPL resolved the same rows.
    interestFreePeriod: 1,
    // Rows 54-58. A card EMI draws against a limit rather than disbursing once, so the tranche family
    // is Applicable here (unlike Gold, Auto or Consumer Durable) and the toggle is seeded on.
    multiDisburseLoan: true,
    maxTrancheCount: 4,
    outstandingLoanBalance: 100000,
    // Rows 67/68/69, seeded to the sheet's sample values and all three editable.
    enableDownPayment: true,
    disbursedAmountPercentageForDownPayment: 35,
    enableAutoRepaymentForDownPayment: true,
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The Card L sheet carries the same 10000 / 12% / 12
    // boilerplate every other sheet inherits from `All Params`, with a blank Default Value column.
  },
  'loan-against-securities': {
    // Rows 35/36/37 — the same Progressive + advanced-allocation resolution Home, Gold, Auto, Consumer
    // Durable and BNPL apply to the identical contradiction on their own sheets.
    loanScheduleType: 'Progressive',
    transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
    loanScheduleProcessingType: 'Horizontal',
    // Rows 42/44 — seeded to the sheet's values, and editable because both rows are Applicable.
    daysInYearType: 360,
    daysInMonthType: 30
    // Deliberately absent: `principal`, `interestRatePerPeriod` and `numberOfRepayments` — see the note
    // on HOME_AND_MORTGAGE_INITIAL_OVERRIDES. The LAS L sheet carries the same 10000 / 12% / 12
    // boilerplate every other sheet inherits from `All Params`, with a blank Default Value column. It
    // matters here in particular: the advance against a portfolio is a loan-to-value calculation made
    // per pledge, so any seeded ticket size would be arbitrary.
  }
};

/**
 * Home L / Mortage L rows 16, 53, 57 and 58 — Applicable on the sheet but in the wizard's custom-only
 * list, so they need the same second-gate exemption BNPL needs. The three guarantee inputs come with
 * `holdGuaranteeFunds`: they are custom-only for the same reason it is, and the sheet marks the
 * guarantee feature Applicable as a whole (row 53) rather than listing its dependents separately.
 */
const HOME_AND_MORTGAGE_EXTRA_VISIBLE_FIELDS: readonly string[] = [
  'isLinkedToFloatingInterestRates',
  'holdGuaranteeFunds',
  ...GUARANTEE_FUNDS_DEPENDENT_FIELDS,
  'outstandingLoanBalance',
  'disallowExpectedDisbursements'
];

/**
 * Keys from the guided-hidden lists (hidden defaults / custom-only fields) that a specific profile
 * exposes as an editable control. `disbursedAmountPercentageForDownPayment` sits in the wizard's
 * custom-only list, which hides it for every guided profile; Two Wheeler surfaces it as its
 * headline field.
 */
export const PROFILE_EXTRA_VISIBLE_FIELDS: Partial<Record<LoanWizardProfileMode, readonly string[]>> = {
  'two-wheeler': ['disbursedAmountPercentageForDownPayment'],
  // BNPL marks these Applicable in the sheet even though the wizard's custom-only list hides them
  // for every other guided profile. Dropping them from the hidden defaults is not enough on its own:
  // `isCustomOnlyField` is a second, independent gate in the wizard's `visibleFields`.
  bnpl: [
    'allowApprovedDisbursedAmountsOverApplied',
    'overAppliedCalculationType',
    'overAppliedNumber',
    'interestRecognitionOnDisbursementDate',
    'outstandingLoanBalance',
    'disallowExpectedDisbursements',
    'enableDownPayment',
    'disbursedAmountPercentageForDownPayment',
    'enableAutoRepaymentForDownPayment',
    'loanChargeOffBehaviour',
    'enableInstallmentLevelDelinquency'
  ],
  home: HOME_AND_MORTGAGE_EXTRA_VISIBLE_FIELDS,
  mortgage: HOME_AND_MORTGAGE_EXTRA_VISIBLE_FIELDS,
  // Gold L row 52 — Applicable on the sheet but in the wizard's custom-only list, so it needs the same
  // second-gate exemption Home needs. The three guarantee inputs come with `holdGuaranteeFunds`: they
  // are custom-only for the same reason it is, and the sheet marks the guarantee feature Applicable as
  // a whole rather than listing its dependents separately.
  gold: [
    'holdGuaranteeFunds',
    ...GUARANTEE_FUNDS_DEPENDENT_FIELDS
  ],
  // Auto L rows 15 and 67-69 — Applicable on the sheet but in the wizard's custom-only list, so they
  // need the same second-gate exemption Home, Gold and BNPL need. Unlike Two Wheeler, which exposes
  // only the percentage, the whole down-payment trio is editable here.
  auto: [
    'isLinkedToFloatingInterestRates',
    'enableDownPayment',
    'disbursedAmountPercentageForDownPayment',
    'enableAutoRepaymentForDownPayment'
  ],
  // JLG L rows 7 and 12 — Applicable on the sheet but in the wizard's custom-only list, so they need
  // the same second-gate exemption Home, Gold and BNPL need. `useBorrowerCycle` additionally gates the
  // borrower-cycle step, so it must be reachable for the operator to turn the feature off.
  jlg: [
    'includeInBorrowerCycle',
    'useBorrowerCycle'
  ],
  // Consumer Durable L rows 67-69 — Applicable on the sheet but in the wizard's custom-only list, so
  // they need the same second-gate exemption Auto and BNPL need. Unlike Auto, the floating-rate link
  // (row 15) is Not Applicable here, so it is deliberately absent.
  'consumer-durable': [
    'enableDownPayment',
    'disbursedAmountPercentageForDownPayment',
    'enableAutoRepaymentForDownPayment'
  ],
  // Card L marks these Applicable even though the wizard's custom-only list hides them for most guided
  // profiles. Dropping them from the hidden defaults is not enough on its own: `isCustomOnlyField` is a
  // second, independent gate in the wizard's `visibleFields`. Same set BNPL needs, since the two sheets
  // agree on every one of these rows.
  'credit-card-emi': [
    'allowApprovedDisbursedAmountsOverApplied',
    'overAppliedCalculationType',
    'overAppliedNumber',
    'interestRecognitionOnDisbursementDate',
    'outstandingLoanBalance',
    'disallowExpectedDisbursements',
    'enableDownPayment',
    'disbursedAmountPercentageForDownPayment',
    'enableAutoRepaymentForDownPayment',
    'loanChargeOffBehaviour',
    'enableInstallmentLevelDelinquency'
  ],
  // LAS L rows 15 and 52 — Applicable on the sheet but in the wizard's custom-only list, so they need
  // the same second-gate exemption Home and Gold need. The three guarantee inputs come with
  // `holdGuaranteeFunds`: they are custom-only for the same reason it is, and the sheet marks the
  // guarantee feature Applicable as a whole rather than listing its dependents separately.
  'loan-against-securities': [
    'isLinkedToFloatingInterestRates',
    'holdGuaranteeFunds',
    ...GUARANTEE_FUNDS_DEPENDENT_FIELDS
  ]
};

/** Wizard header eyebrow, one translation key per profile. */
export const PROFILE_LABEL_KEYS: Record<LoanWizardProfileMode, string> = {
  personal: 'labels.text.Personal Loan',
  'custom-advanced': 'labels.text.Custom / Advanced',
  'two-wheeler': 'labels.text.Two Wheeler Loan',
  education: 'labels.text.Education Loan',
  agriculture: 'labels.text.Agriculture Loan',
  bnpl: 'labels.text.BNPL',
  home: 'labels.text.Home Loan',
  mortgage: 'labels.text.Mortgage Loan (LAP)',
  gold: 'labels.text.Gold Loan',
  auto: 'labels.text.Auto Loan',
  jlg: 'labels.text.JLG Loan',
  'consumer-durable': 'labels.text.Consumer Durable Loan',
  'credit-card-emi': 'labels.text.Credit Card EMI',
  'loan-against-securities': 'labels.text.Loan vs Securities / FD'
};

/** Route path (under products/loan-products) → wizard profile and the page heading it renders. */
const PROFILE_ROUTES: Record<string, { profileMode: LoanWizardProfileMode; pageTitle: string }> = {
  'personal-loan': { profileMode: 'personal', pageTitle: 'labels.heading.Create Personal Loan' },
  'custom-advanced': {
    profileMode: 'custom-advanced',
    pageTitle: 'labels.heading.Custom / Advanced Loan Configuration'
  },
  'two-wheeler-loan': { profileMode: 'two-wheeler', pageTitle: 'labels.heading.Create Two Wheeler Loan' },
  'education-loan': { profileMode: 'education', pageTitle: 'labels.heading.Create Education Loan' },
  'agriculture-loan': { profileMode: 'agriculture', pageTitle: 'labels.heading.Create Agriculture Loan' },
  'bnpl-loan': { profileMode: 'bnpl', pageTitle: 'labels.heading.Create BNPL Loan' },
  'home-loan': { profileMode: 'home', pageTitle: 'labels.heading.Create Home Loan' },
  'mortgage-loan': { profileMode: 'mortgage', pageTitle: 'labels.heading.Create Mortgage Loan' },
  'gold-loan': { profileMode: 'gold', pageTitle: 'labels.heading.Create Gold Loan' },
  'auto-loan': { profileMode: 'auto', pageTitle: 'labels.heading.Create Auto Loan' },
  'jlg-loan': { profileMode: 'jlg', pageTitle: 'labels.heading.Create JLG Loan' },
  'consumer-durable-loan': {
    profileMode: 'consumer-durable',
    pageTitle: 'labels.heading.Create Consumer Durable Loan'
  },
  'credit-card-emi-loan': {
    profileMode: 'credit-card-emi',
    pageTitle: 'labels.heading.Create Credit Card EMI Loan'
  },
  'loan-against-securities': {
    profileMode: 'loan-against-securities',
    pageTitle: 'labels.heading.Create Loan vs Securities / FD'
  }
};

/**
 * Resolves the wizard profile (and its page title translation key) from the matched route path,
 * falling back to the Personal Loan profile for unknown paths — the same fallback the route
 * mapping had when it was a `path === 'custom-advanced'` ternary.
 */
export function profileForRoutePath(routePath: string | undefined): {
  profileMode: LoanWizardProfileMode;
  pageTitle: string;
} {
  return PROFILE_ROUTES[routePath ?? ''] ?? PROFILE_ROUTES['personal-loan'];
}

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
  'allowPartialPeriodInterestCalculation',
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
function sanitizeCreateLoanProductPayload(merged: Record<string, unknown>, profileMode: LoanWizardProfileMode): void {
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

  // 1b1. The guarantee trio mirrors the Classic Settings step, which `addControl`s
  //      `mandatoryGuarantee` / `minimumGuaranteeFromOwnFunds` / `minimumGuaranteeFromGuarantor` only
  //      while `holdGuaranteeFunds` is ticked and `removeControl`s all three otherwise, so none of
  //      them reach `POST /loanproducts` for a product that holds no guarantee funds. The wizard's
  //      flat form always carries them, so strip the family here. This is a no-op for every profile
  //      that pins `holdGuaranteeFunds: false` in its hidden defaults (all of them except Home and
  //      Mortgage), leaving those payloads byte-for-byte unchanged. Blank optional entries are
  //      dropped for the enabled case too — an empty value is not a valid number.
  if (!merged.holdGuaranteeFunds) {
    GUARANTEE_FUNDS_DEPENDENT_FIELDS.forEach((field) => delete merged[field]);
  } else {
    GUARANTEE_FUNDS_DEPENDENT_FIELDS.forEach((field) => {
      if (merged[field] === '' || merged[field] === null || merged[field] === undefined) {
        delete merged[field];
      }
    });
  }

  // 1a2. The over-applied pair mirrors the Classic Terms step, which declares both controls
  //      `{ value: null, disabled: true }` and only `.enable()`s them while
  //      `allowApprovedDisbursedAmountsOverApplied` is ticked, patching both back to null otherwise
  //      (loan-product-terms-step.component.ts). A disabled control is excluded from
  //      `FormGroup.value`, so in Classic neither key reaches the payload while the toggle is off.
  //
  //      Deliberately scoped to the profiles that need it rather than applied globally: the older
  //      profiles have shipped a payload carrying `overAppliedCalculationType`/`overAppliedNumber` as
  //      an explicit null (their hidden defaults pin the toggle off, so the keys are inert), and
  //      dropping them there would change the wire format of already-released product templates for
  //      no functional gain. Fineract treats an explicit null and an absent key identically.
  if (dropsDisabledOverAppliedFields(profileMode) && !merged.allowApprovedDisbursedAmountsOverApplied) {
    delete merged.overAppliedCalculationType;
    delete merged.overAppliedNumber;
  }

  // 1b2. `allowFullTermForTranche` is Progressive-only: Classic renders it inside the Progressive
  //      branch of its multi-disburse block and patches it back to false whenever the schedule type
  //      becomes Cumulative (loan-product-settings-step.component.ts `loanScheduleType` valueChanges).
  if ('allowFullTermForTranche' in merged && !isProgressiveLoanSchedule(merged.loanScheduleType)) {
    merged.allowFullTermForTranche = false;
  }

  // 1b3. The interest recalculation family exists in Classic only while the toggle is on — every one
  //      of its controls is `addControl`ed then and `removeControl`ed otherwise, so none of the keys
  //      reach `POST /loanproducts` for a product with recalculation disabled (which the backend
  //      rejects with "not supported when interest recalculation is disabled"). The wizard's flat
  //      form always carries them, so strip the whole family here instead. Within an enabled
  //      product, the nested selects Classic never registers for the chosen frequency are blank, and
  //      blank values are dropped just below.
  if (!merged.isInterestRecalculationEnabled) {
    INTEREST_RECALCULATION_FIELDS.forEach((field) => delete merged[field]);
  } else {
    INTEREST_RECALCULATION_FIELDS.forEach((field) => {
      if (merged[field] === '' || merged[field] === null || merged[field] === undefined) {
        delete merged[field];
      }
    });
    // Progressive-only, exactly like Classic's
    // `enableFieldsWhenScheduleTypeIsProgressiveAndInterestRateRecalculationEnabled`.
    if (!isProgressiveLoanSchedule(merged.loanScheduleType)) {
      delete merged.disallowInterestCalculationOnPastDue;
    }
  }

  // 1c. Installment-level delinquency only exists under a delinquency bucket. Classic renders the
  //     checkbox only while a bucket is selected and its clear button resets both together
  //     (`clearProperty('delinquencyBucketId')` in loan-product-settings-step.component.ts), so the
  //     flag can never be true without a bucket. Selecting the "None" option is the wizard's
  //     equivalent of that clear, so mirror the same reset here. No-op for the profiles that pin the
  //     flag false in HIDDEN_DEFAULTS.
  if (!merged.delinquencyBucketId) {
    merged.enableInstallmentLevelDelinquency = false;
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
  const defaults = hiddenDefaultsFor(profileMode);

  /* Apply template defaults if template is provided for a guided profile */
  const formValuesWithTemplateDefaults = template ? mergeTemplateDefaults(formState, template) : formState;

  // Merge order is profile-dependent:
  // - Guided profiles (Personal, Two Wheeler) hide every key of their hidden defaults in the UI
  //   (see the `hiddenFieldKeys` filter in loan-product-wizard.component.ts), so those controls only
  //   ever carry their INITIAL_FORM_STATE seed. The product-specific hidden defaults must therefore
  //   win — `defaults` is spread last. Any field a guided profile exposes as editable is REMOVED
  //   from its hidden defaults in `hiddenDefaultsFor` (e.g. Two Wheeler's down payment %), so the
  //   form value survives this spread.
  // - Custom/Advanced exposes those same fields as editable controls, so the user's form values must
  //   win. Spreading `defaults` first lets it fill in only the genuinely hidden, backend-only fields
  //   the form never carries (e.g. the borrower-cycle variation arrays) without clobbering visible
  //   input. Downstream sanitization/normalization is unchanged and still runs for both modes.
  const merged =
    profileMode === 'custom-advanced'
      ? { ...defaults, ...formValuesWithTemplateDefaults }
      : { ...formValuesWithTemplateDefaults, ...defaults };

  // Guided-profile transformations: fold charges, validate grace, and normalize the payload to the
  // contract the Personal Loan template has always sent. Profiles on the Progressive stack
  // (Personal, Two Wheeler) additionally force the Progressive + advanced-payment-allocation pair;
  // Education runs on the Classic Cumulative stack (its hidden defaults pin schedule/strategy), so
  // no forcing happens and the progressive-only branches below turn themselves off.
  if (isGuidedProfileMode(profileMode)) {
    const formValues = formState as Record<string, unknown>;
    const selectedTransactionProcessingStrategyCode = formValues.transactionProcessingStrategyCode;
    const numberOfRepayments = toFiniteNumber(merged.numberOfRepayments);

    if (forcesProgressiveStack(profileMode)) {
      merged.transactionProcessingStrategyCode =
        typeof selectedTransactionProcessingStrategyCode === 'string' &&
        selectedTransactionProcessingStrategyCode !== ''
          ? selectedTransactionProcessingStrategyCode
          : LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY;
      merged.loanScheduleType = LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE;
    }

    // Computed AFTER any stack forcing so the progressive-only branches below key off the strategy
    // and schedule the payload will actually carry.
    const transactionProcessingStrategyCode = merged.transactionProcessingStrategyCode;
    const supportsAdvancedPaymentAllocation =
      typeof transactionProcessingStrategyCode === 'string' &&
      LoanProducts.isAdvancedPaymentAllocationStrategy(transactionProcessingStrategyCode);
    const supportsProgressiveLoanFeatures =
      supportsAdvancedPaymentAllocation && isProgressiveLoanSchedule(merged.loanScheduleType);

    // Map interest-free period to the backend field name used by the classic payload contract.
    if ('interestFreePeriod' in merged) {
      merged.graceOnInterestCharged = merged.interestFreePeriod;
      delete merged.interestFreePeriod;
    }

    merged.charges = buildChargeReferences(formValues);

    delete merged.chargeName;
    delete merged.overdueCharge;

    // Normalize the delinquency bucket "None" option ('') to null, mirroring the Classic Settings
    // step (loan-product-settings-step.component.ts, which converts '' -> null before submit). For
    // profiles that expose it as an editable select (Two Wheeler, Education, Agriculture) this keeps
    // the untouched-form payload on the same `null` contract Personal sends from its hidden default;
    // for profiles that keep it hidden the value is already null, so this is a no-op.
    if (merged.delinquencyBucketId === '') {
      merged.delinquencyBucketId = null;
    }

    // Preserve backend field names expected by the classic payload contract.
    if ('enableBuydownFees' in merged) {
      merged.enableBuyDownFee = merged.enableBuydownFees;
      delete merged.enableBuydownFees;
    }

    if (supportsProgressiveLoanFeatures) {
      // A profile that renders the reused Classic Interest Refund step (BNPL — the sheet's
      // highlighted "Interest Refunds" group) has already folded the operator's selection in, so it
      // wins. Every other guided profile has no such UI and keeps the template's default list,
      // exactly as before.
      const selectedInterestRefundTypes = merged.supportedInterestRefundTypes;
      const templateSupportedInterestRefundTypes = getTemplateFieldValue(
        template as Record<string, unknown>,
        'supportedInterestRefundTypes'
      );
      if (Array.isArray(selectedInterestRefundTypes) && selectedInterestRefundTypes.length > 0) {
        merged.supportedInterestRefundTypes = selectedInterestRefundTypes;
      } else if (
        Array.isArray(templateSupportedInterestRefundTypes) &&
        templateSupportedInterestRefundTypes.length > 0 &&
        !rendersInterestRefundStep(profileMode)
      ) {
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

    // Profiles without tranches omit the entire multi-disburse family (the proven Personal Loan
    // contract — the backend then applies its own defaults). Education transmits it: semester-wise
    // tranche disbursement is intrinsic to the product, `multiDisburseLoan: true` is pinned in its
    // hidden defaults and `maxTrancheCount` is a visible, editable control. The outstanding-balance
    // cap is omitted for every guided profile — the form seeds it with the base 100000, which no
    // guided product wants as an actual cap.
    if (!sendsOutstandingLoanBalance(profileMode)) {
      delete merged.outstandingLoanBalance;
    }
    if (!sendsMultiDisburseFields(profileMode)) {
      delete merged.multiDisburseLoan;
      delete merged.maxTrancheCount;
      delete merged.allowFullTermForTranche;
      delete merged.disallowExpectedDisbursements;
    } else if (!merged.multiDisburseLoan) {
      // Classic's `multiDisburseLoan` valueChanges handler removes the `maxTrancheCount` and
      // `outstandingLoanBalance` controls and patches `disallowExpectedDisbursements` /
      // `allowFullTermForTranche` back to false when multiple disbursals are switched off (see
      // loan-product-settings-step.component.ts). Profiles that expose the toggle as an editable
      // control (BNPL) must reproduce that, or the payload trips the backend rule "Allow Multiple
      // Disbursals Not Set - Disallow Expected Disbursals Can't Be Set". Education pins the toggle
      // true in its hidden defaults, so this branch never fires for it.
      delete merged.maxTrancheCount;
      delete merged.outstandingLoanBalance;
      merged.disallowExpectedDisbursements = false;
      merged.allowFullTermForTranche = false;
    } else {
      // The tranche cap is a visible, optional number control (Education), so clearing it leaves the
      // FormControl at null and typing 0/1 is equally accepted by the input. Fineract rejects
      // `multiDisburseLoan: true` without a valid cap, and a "multi"-disburse product needs at least
      // two tranches, so coerce anything below the minimum back to it rather than shipping the
      // invalid value.
      const trancheCount = toFiniteNumber(merged.maxTrancheCount);
      merged.maxTrancheCount =
        trancheCount !== null && trancheCount >= MIN_TRANCHE_COUNT ? trancheCount : MIN_TRANCHE_COUNT;
    }

    if (!hasValidGracePeriod(merged.graceOnPrincipalPayment, numberOfRepayments)) {
      delete merged.graceOnPrincipalPayment;
    }

    if (!hasValidGracePeriod(merged.graceOnInterestPayment, numberOfRepayments)) {
      delete merged.graceOnInterestPayment;
    }

    if (!supportsProgressiveLoanFeatures) {
      delete merged.chargeOffBehaviour;
    }

    delete merged.useGlobalConfigForRepaymentEvent;

    // `daysInYearCustomStrategy` is dropped unconditionally for the guided profiles that keep it
    // hidden and pinned — none of them can produce a meaningful value, so the key is pure noise.
    // A profile that exposes it as an editable control (BNPL, sheet row 43) must instead let the
    // shared gate in `sanitizeCreateLoanProductPayload` decide, which applies Classic's exact
    // condition: keep it only for the advanced payment allocation strategy AND an ACTUAL
    // days-in-year type, drop it otherwise. That keeps the field's required validator honest — it
    // is only ever required when the value will actually be sent.
    if (hiddenDefaultsFor(profileMode).daysInYearCustomStrategy !== undefined) {
      delete merged.daysInYearCustomStrategy;
    }

    // Same opt-in for the partial-period flag. Classic sends it for every product, but the four
    // older guided profiles have shipped without it (it was previously bound to the read-only
    // `calculateInterestForExactDays`, which is stripped), and turning it on would change how
    // interest is actually calculated for those templates — Education in particular pins the Daily
    // interest calculation type, which the flag is invalid for. BNPL exposes it as an editable
    // control (sheet row 32) and therefore keeps it.
    if (hiddenDefaultsFor(profileMode).allowPartialPeriodInterestCalculation !== undefined) {
      delete merged.allowPartialPeriodInterestCalculation;
    }
  } else {
    // Custom/Advanced only.
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
  sanitizeCreateLoanProductPayload(merged, profileMode);

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
