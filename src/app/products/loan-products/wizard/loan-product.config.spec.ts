/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanProducts } from '../loan-products';
import {
  INITIAL_FORM_STATE,
  LoanWizardProfileMode,
  PRODUCT_CARDS,
  PROFILE_INITIAL_OVERRIDES,
  buildPayload,
  hiddenDefaultsFor,
  profileForRoutePath,
  rendersBorrowerCycleStep
} from './loan-product.config';

describe('loan-product.config buildPayload', () => {
  it('removes unsupported hidden defaults from the personal loan payload', () => {
    const formState = {
      name: 'Personal Loan',
      shortName: 'PL1',
      currencyCode: 'INR',
      principal: 50000,
      numberOfRepayments: 12,
      interestRatePerPeriod: 12,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      amortizationType: 1,
      interestType: 0,
      interestCalculationPeriodType: 1,
      transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
      loanScheduleType: 'Progressive',
      loanScheduleProcessingType: 'Horizontal',
      interestFreePeriod: 6,
      chargeName: 'Processing fee',
      overdueCharge: { id: 91 },
      charges: [
        { id: 10 },
        { id: 10 },
        { id: '11' }
      ],
      loanChargeOffBehaviour: 'Regular',
      enableBuydownFees: true,
      allowVariableInstallments: true,
      minimumGap: 2,
      maximumGap: 4,
      multiDisburseLoan: true,
      maxTrancheCount: 4,
      outstandingLoanBalance: 100000,
      'allowAttributeOverrides.amortizationType': true,
      useGlobalConfigForRepaymentEvent: true,
      dueDaysForRepaymentEvent: 3,
      overDueDaysForRepaymentEvent: 5
    } as Record<string, unknown>;

    const payload = buildPayload(formState as never, 'personal', {
      currencyCode: { id: 'INR' },
      digitsAfterDecimal: { id: 2 },
      inMultiplesOf: { id: 1 },
      installmentAmountInMultiplesOf: { id: 10 },
      amortizationType: { id: 1 },
      interestType: { id: 0 },
      interestCalculationPeriodType: { id: 1 },
      repaymentFrequencyType: { id: 2 },
      interestRateFrequencyType: { id: 2 },
      repaymentStartDateType: { id: 1 },
      accountingRule: { id: 2 },
      daysInMonthType: { id: 30 },
      daysInYearType: { id: 360 },
      loanScheduleType: { value: 'Progressive' },
      loanScheduleProcessingType: { value: 'Horizontal' },
      transactionProcessingStrategyCode: { value: 'interest-principal-penalties-fees-order-strategy' }
    });

    expect(payload.interestFreePeriod).toBeUndefined();
    // graceOnInterestCharged is sourced from the visible `interestFreePeriod` FormControl (6), not
    // from a hidden default — HIDDEN_DEFAULTS no longer overrides it.
    expect(payload.graceOnInterestCharged).toBe(6);
    expect(payload.chargeName).toBeUndefined();
    expect(payload.overdueCharge).toBeUndefined();
    expect(payload.charges).toEqual([
      { id: 10 },
      { id: 11 },
      { id: 91 }
    ]);
    expect(payload.allowVariableInstallments).toBeUndefined();
    expect(payload.minimumGap).toBeUndefined();
    expect(payload.maximumGap).toBeUndefined();
    expect(payload.multiDisburseLoan).toBeUndefined();
    expect(payload.maxTrancheCount).toBeUndefined();
    expect(payload.outstandingLoanBalance).toBeUndefined();
    expect(payload.graceOnPrincipalPayment).toBeUndefined();
    expect(payload.graceOnInterestPayment).toBeUndefined();
    expect(payload.supportedInterestRefundTypes).toBeUndefined();
    expect(payload.calculateInterestForExactDays).toBeUndefined();
    expect(payload.chargeOffBehaviour).toBeUndefined();
    expect(payload.enableBuyDownFee).toBe(false);
    expect(payload.allowAttributeOverrides).toMatchObject({
      amortizationType: true
    });
    expect(payload.loanScheduleType).toBe('PROGRESSIVE');
    expect(payload.transactionProcessingStrategyCode).toBe('interest-principal-penalties-fees-order-strategy');
    expect(payload.useGlobalConfigForRepaymentEvent).toBeUndefined();
    expect(payload.daysInYearCustomStrategy).toBeUndefined();
    expect(payload.dueDaysForRepaymentEvent).toBe(1);
    expect(payload.overDueDaysForRepaymentEvent).toBe(1);
    expect(payload.currencyCode).toBe('INR');
  });

  it('keeps progressive-only fields when the selected strategy and template support them', () => {
    const formState = {
      name: 'Personal Loan',
      shortName: 'PL1',
      currencyCode: 'INR',
      principal: 50000,
      numberOfRepayments: 12,
      interestRatePerPeriod: 12,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      amortizationType: 1,
      interestType: 0,
      interestCalculationPeriodType: 1,
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleType: 'Progressive',
      loanScheduleProcessingType: 'Horizontal',
      interestFreePeriod: 6,
      chargeName: 'Processing fee',
      overdueCharge: { id: 91 },
      charges: [{ id: 10 }],
      loanChargeOffBehaviour: 'Regular',
      enableBuydownFees: true,
      allowVariableInstallments: true,
      minimumGap: 2,
      maximumGap: 4,
      multiDisburseLoan: true,
      maxTrancheCount: 4,
      outstandingLoanBalance: 100000,
      'allowAttributeOverrides.amortizationType': true,
      useGlobalConfigForRepaymentEvent: true,
      dueDaysForRepaymentEvent: 3,
      overDueDaysForRepaymentEvent: 5
    } as Record<string, unknown>;

    const payload = buildPayload(formState as never, 'personal', {
      currencyCode: { id: 'INR' },
      digitsAfterDecimal: { id: 2 },
      inMultiplesOf: { id: 1 },
      installmentAmountInMultiplesOf: { id: 10 },
      amortizationType: { id: 1 },
      interestType: { id: 0 },
      interestCalculationPeriodType: { id: 1 },
      repaymentFrequencyType: { id: 2 },
      interestRateFrequencyType: { id: 2 },
      repaymentStartDateType: { id: 1 },
      accountingRule: { id: 2 },
      daysInMonthType: { id: 30 },
      daysInYearType: { id: 360 },
      loanScheduleType: { value: 'Progressive' },
      loanScheduleProcessingType: { value: 'Horizontal' },
      transactionProcessingStrategyCode: { value: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY },
      supportedInterestRefundTypes: [{ id: 'MERCHANT_ISSUED_REFUND' }]
    });

    expect(payload.allowVariableInstallments).toBeUndefined();
    expect(payload.minimumGap).toBeUndefined();
    expect(payload.maximumGap).toBeUndefined();
    expect(payload.multiDisburseLoan).toBeUndefined();
    expect(payload.maxTrancheCount).toBeUndefined();
    expect(payload.supportedInterestRefundTypes).toEqual([{ id: 'MERCHANT_ISSUED_REFUND' }]);
    expect(payload.chargeOffBehaviour).toBe('REGULAR');
  });

  it('does not apply personal-only transforms in custom-advanced mode', () => {
    const payload = buildPayload(
      {
        numberOfRepayments: 12,
        graceOnPrincipalPayment: 120,
        chargeName: 'Processing fee',
        overdueCharge: { id: 91 },
        charges: [{ id: 10 }]
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    // Personal-only business transforms must NOT run in custom-advanced mode:
    // - Personal forces the advanced-payment-allocation strategy; custom-advanced leaves it unset.
    expect(payload.transactionProcessingStrategyCode).toBeUndefined();
    // - Personal drops grace periods that are not shorter than the repayment count; custom keeps the
    //   form-supplied value untouched (120 >= 12 would be dropped in personal mode).
    expect(payload.graceOnPrincipalPayment).toBe(120);
  });

  it('centrally sanitizes the custom-advanced payload to the create contract', () => {
    const payload = buildPayload(
      {
        interestFreePeriod: 4,
        chargeName: 'Processing fee',
        overdueCharge: { id: 91 },
        charges: [{ id: 10 }]
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    // Wizard-only field names are re-keyed to the backend create contract (not dropped). The value
    // comes from the visible `interestFreePeriod` FormControl (4), not from a hidden default.
    expect(payload.interestFreePeriod).toBeUndefined();
    expect(payload.graceOnInterestCharged).toBe(4);
    expect(payload.loanChargeOffBehaviour).toBeUndefined();
    expect(payload.chargeOffBehaviour).toBe('REGULAR');
    expect(payload.enableBuydownFees).toBeUndefined();
    expect(payload.enableBuyDownFee).toBe(false);

    // UI-only charge inputs are folded into `charges`; the raw helpers are removed.
    expect(payload.chargeName).toBeUndefined();
    expect(payload.overdueCharge).toBeUndefined();
    expect(payload.charges).toEqual([
      { id: 10 },
      { id: 91 }
    ]);

    // Fields the create endpoint never accepts are stripped.
    expect(payload.calculateInterestForExactDays).toBeUndefined();
    expect(payload.useGlobalConfigForRepaymentEvent).toBeUndefined();
    expect(payload.supportedInterestRefundTypes).toBeUndefined();
  });

  it('normalizes enum display strings to backend codes in custom-advanced mode', () => {
    const payload = buildPayload(
      {
        loanScheduleType: 'Progressive',
        loanScheduleProcessingType: 'Horizontal',
        // daysInYearCustomStrategy is only retained for the advanced payment allocation strategy AND
        // the ACTUAL days-in-year type (id 1) — mirroring Classic — so both are set here.
        daysInYearType: 1,
        daysInYearCustomStrategy: 'Full Leap Year',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.loanScheduleType).toBe('PROGRESSIVE');
    expect(payload.loanScheduleProcessingType).toBe('HORIZONTAL');
    expect(payload.daysInYearCustomStrategy).toBe('FULL_LEAP_YEAR');
  });

  it('drops daysInYearCustomStrategy when daysInYearType is not ACTUAL, matching Classic', () => {
    // Classic's Settings step only registers the daysInYearCustomStrategy FormControl when the
    // advanced strategy is selected AND daysInYearType is ACTUAL (id 1); for any other type it calls
    // removeControl, so the field never reaches the payload. The backend enforces this with
    // "daysInYearCustomStrategy is only applicable for ACTUAL days in year type".
    const payload = buildPayload(
      {
        daysInYearType: 360,
        daysInYearCustomStrategy: 'Full Leap Year',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.daysInYearType).toBe(360);
    expect(payload.daysInYearCustomStrategy).toBeUndefined();
  });

  it('keeps daysInYearCustomStrategy only for ACTUAL + advanced strategy, matching Classic', () => {
    const payload = buildPayload(
      {
        daysInYearType: 1,
        daysInYearCustomStrategy: 'Full Leap Year',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.daysInYearType).toBe(1);
    expect(payload.daysInYearCustomStrategy).toBe('FULL_LEAP_YEAR');
  });

  it('drops daysInYearCustomStrategy for ACTUAL when the strategy is not advanced, matching Classic', () => {
    // Classic never registers the daysInYearCustomStrategy control outside the advanced strategy, so
    // even ACTUAL must omit it for a non-advanced strategy.
    const payload = buildPayload(
      {
        daysInYearType: 1,
        daysInYearCustomStrategy: 'Full Leap Year',
        transactionProcessingStrategyCode: 'mifos-standard-strategy'
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.daysInYearType).toBe(1);
    expect(payload.daysInYearCustomStrategy).toBeUndefined();
  });

  it('forwards the template default supportedInterestRefundTypes for custom-advanced, matching Classic', () => {
    const payload = buildPayload(
      {
        loanScheduleType: 'Progressive',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      } as Record<string, unknown> as never,
      'custom-advanced',
      { supportedInterestRefundTypes: [{ id: 'MERCHANT_ISSUED_REFUND' }] }
    );

    expect(payload.supportedInterestRefundTypes).toEqual([{ id: 'MERCHANT_ISSUED_REFUND' }]);
  });

  it('omits supportedInterestRefundTypes for custom-advanced when the strategy is not advanced', () => {
    const payload = buildPayload(
      {
        loanScheduleType: 'Progressive',
        transactionProcessingStrategyCode: 'mifos-standard-strategy'
      } as Record<string, unknown> as never,
      'custom-advanced',
      { supportedInterestRefundTypes: [{ id: 'MERCHANT_ISSUED_REFUND' }] }
    );

    expect(payload.supportedInterestRefundTypes).toBeUndefined();
  });

  it('gates tranche/disbursement fields on multiDisburseLoan for custom-advanced, matching Classic', () => {
    // Classic's Settings step removes maxTrancheCount/outstandingLoanBalance and forces
    // disallowExpectedDisbursements/allowFullTermForTranche to false when multiple disbursals are
    // off. The wizard's HIDDEN_DEFAULTS otherwise force disallowExpectedDisbursements: true and
    // outstandingLoanBalance: 100000, which trips the backend "Allow Multiple Disbursals Not Set -
    // Disallow Expected Disbursals Can't Be Set" rule.
    const payload = buildPayload(
      {
        multiDisburseLoan: false,
        maxTrancheCount: 4,
        allowFullTermForTranche: true
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.multiDisburseLoan).toBe(false);
    expect(payload.maxTrancheCount).toBeUndefined();
    expect(payload.outstandingLoanBalance).toBeUndefined();
    expect(payload.disallowExpectedDisbursements).toBe(false);
    expect(payload.allowFullTermForTranche).toBe(false);
  });

  it('keeps tranche/disbursement fields when multiDisburseLoan is on for custom-advanced', () => {
    const payload = buildPayload(
      {
        multiDisburseLoan: true,
        maxTrancheCount: 4,
        allowFullTermForTranche: true
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.multiDisburseLoan).toBe(true);
    expect(payload.maxTrancheCount).toBe(4);
    // outstandingLoanBalance and disallowExpectedDisbursements flow through from HIDDEN_DEFAULTS,
    // which is valid once multiple disbursals are enabled.
    expect(payload.outstandingLoanBalance).toBe(100000);
    expect(payload.disallowExpectedDisbursements).toBe(true);
    expect(payload.allowFullTermForTranche).toBe(true);
  });

  it('lets custom-advanced form values win over HIDDEN_DEFAULTS for visible fields', () => {
    // Regression guard: the Custom/Advanced Settings step exposes fields that also live in
    // HIDDEN_DEFAULTS (e.g. `loanScheduleType`, `daysInMonthType`). Previously `defaults` was spread
    // last for every profile, so those hidden defaults clobbered the user's visible choices. The
    // custom-advanced merge now spreads `defaults` first so the form drives visible fields.
    const payload = buildPayload(
      {
        loanScheduleType: 'Cumulative',
        daysInMonthType: 1,
        principalThresholdForLastInstallment: 25,
        transactionProcessingStrategyCode: 'mifos-standard-strategy'
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    // User picked Cumulative — it must survive (and normalize to the backend code), not be forced
    // back to HIDDEN_DEFAULTS' 'Progressive'.
    expect(payload.loanScheduleType).toBe('CUMULATIVE');
    expect(payload.daysInMonthType).toBe(1);
    expect(payload.principalThresholdForLastInstallment).toBe(25);
  });

  it('still injects genuinely hidden, backend-only defaults for custom-advanced', () => {
    // Fields the form never carries (borrower-cycle variation arrays) must still come from
    // HIDDEN_DEFAULTS even though `defaults` is now spread first.
    const payload = buildPayload({} as Record<string, unknown> as never, 'custom-advanced');

    expect(payload.principalVariationsForBorrowerCycle).toEqual([]);
    expect(payload.numberOfRepaymentVariationsForBorrowerCycle).toEqual([]);
    expect(payload.interestRateVariationsForBorrowerCycle).toEqual([]);
  });

  it('omits down-payment dependents when enableDownPayment is false (custom-advanced), matching Classic', () => {
    // Classic's Settings step removes disbursedAmountPercentageForDownPayment /
    // enableAutoRepaymentForDownPayment when down payment is off. The wizard's flat form keeps them
    // populated (35 / true), tripping the backend
    // "disbursedAmountPercentageForDownPayment supported.only.for.enable.down.payment.true".
    const payload = buildPayload(
      {
        enableDownPayment: false,
        disbursedAmountPercentageForDownPayment: 35,
        enableAutoRepaymentForDownPayment: true
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.enableDownPayment).toBe(false);
    expect(payload.disbursedAmountPercentageForDownPayment).toBeUndefined();
    expect(payload.enableAutoRepaymentForDownPayment).toBeUndefined();
  });

  it('keeps down-payment dependents when enableDownPayment is true (custom-advanced)', () => {
    const payload = buildPayload(
      {
        enableDownPayment: true,
        disbursedAmountPercentageForDownPayment: 35,
        enableAutoRepaymentForDownPayment: true
      } as Record<string, unknown> as never,
      'custom-advanced'
    );

    expect(payload.enableDownPayment).toBe(true);
    expect(payload.disbursedAmountPercentageForDownPayment).toBe(35);
    expect(payload.enableAutoRepaymentForDownPayment).toBe(true);
  });

  it('keeps down-payment dependents for Personal (enableDownPayment is always the hidden true default)', () => {
    const payload = buildPayload(
      { name: 'Personal Loan', shortName: 'PL1' } as Record<string, unknown> as never,
      'personal'
    );

    expect(payload.enableDownPayment).toBe(true);
    expect(payload.disbursedAmountPercentageForDownPayment).toBe(35);
    expect(payload.enableAutoRepaymentForDownPayment).toBe(true);
  });
});

describe('loan-product.config buildPayload golden parity', () => {
  // These two tests pin the COMPLETE create payload for the existing profile modes. Unlike the
  // focused key-by-key tests above, `toEqual` on the whole object also fails when a key is ADDED,
  // so any refactor of the shared payload path shows up as an explicit, reviewable diff here.
  // Only an intentional product-behavior change may update these expected objects.

  it('produces the exact Personal Loan create payload for an untouched wizard form', () => {
    // The wizard form's raw value for a user who only filled the required fields: every other
    // control still carries its INITIAL_FORM_STATE seed.
    const formState = {
      ...INITIAL_FORM_STATE,
      name: 'Personal Loan – Standard',
      shortName: 'PLS',
      currencyCode: 'INR',
      principal: 50000,
      interestRatePerPeriod: 12
    };

    const payload = buildPayload(formState, 'personal', {
      currencyCode: { id: 'INR' },
      digitsAfterDecimal: { id: 2 },
      inMultiplesOf: { id: 1 },
      installmentAmountInMultiplesOf: { id: 10 },
      amortizationType: { id: 1 },
      interestType: { id: 0 },
      interestCalculationPeriodType: { id: 1 },
      repaymentFrequencyType: { id: 2 },
      interestRateFrequencyType: { id: 2 },
      repaymentStartDateType: { id: 1 },
      accountingRule: { id: 2 },
      daysInMonthType: { id: 30 },
      daysInYearType: { id: 360 },
      loanScheduleType: { value: 'Progressive' },
      loanScheduleProcessingType: { value: 'Horizontal' },
      transactionProcessingStrategyCode: { value: 'interest-principal-penalties-fees-order-strategy' }
    });

    expect(payload).toEqual({
      name: 'Personal Loan – Standard',
      shortName: 'PLS',
      externalId: '',
      description: 'Personal Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 50000,
      numberOfRepayments: 12,
      interestRatePerPeriod: 12,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: true,
      disbursedAmountPercentageForDownPayment: 35,
      enableAutoRepaymentForDownPayment: true,
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('produces the exact Custom/Advanced create payload for an untouched wizard form', () => {
    const formState = {
      ...INITIAL_FORM_STATE,
      name: 'Custom LP',
      shortName: 'CLP',
      currencyCode: 'INR',
      principal: 50000,
      interestRatePerPeriod: 12
    };

    const payload = buildPayload(formState, 'custom-advanced');

    expect(payload).toEqual({
      name: 'Custom LP',
      shortName: 'CLP',
      externalId: '',
      description: '',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: false,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 1,
      useBorrowerCycle: false,
      principal: 50000,
      numberOfRepayments: 12,
      interestRatePerPeriod: 12,
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
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
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
      // Classic's real partial-period control, which Custom/Advanced renders and therefore sends.
      // `LoanProducts.buildPayload` re-keys it to Fineract's misspelled
      // `allowPartialPeriodInterestCalcualtion` on the wire (see loan-products.spec.ts); this golden
      // covers the config-level builder, which keeps the correct spelling.
      allowPartialPeriodInterestCalculation: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      outstandingLoanBalance: 100000,
      disallowExpectedDisbursements: true,
      enableDownPayment: false,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });
});

describe('loan-product.config buildPayload for the two-wheeler profile', () => {
  /**
   * The raw form value the wizard actually submits for Two Wheeler: the shared seed, the profile's
   * curated prefills, and the guided-profile strategy forced by getInitialFormState — plus the two
   * required fields the user types.
   */
  function twoWheelerFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['two-wheeler'],
      name: 'Two Wheeler Loan – Standard',
      shortName: 'TWL',
      currencyCode: 'INR',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      ...edits
    };
  }

  it('produces the exact Two Wheeler create payload for an untouched wizard form', () => {
    // Identical contract to the Personal Loan golden above except for the profile's deltas:
    // curated principal/tenure/rate prefills, per-year rate quoting, the 20% down payment carried
    // by the (visible, editable) form control, and the product description.
    expect(buildPayload(twoWheelerFormState(), 'two-wheeler')).toEqual({
      name: 'Two Wheeler Loan – Standard',
      shortName: 'TWL',
      externalId: '',
      description: 'Two Wheeler Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 80000,
      numberOfRepayments: 36,
      interestRatePerPeriod: 14,
      interestRateFrequencyType: 3,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: true,
      disbursedAmountPercentageForDownPayment: 20,
      enableAutoRepaymentForDownPayment: true,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('lets the user-edited down payment percentage win over the profile prefill', () => {
    // disbursedAmountPercentageForDownPayment is REMOVED from the two-wheeler hidden defaults, so
    // the guided "defaults win" merge must not clobber the visible control's value.
    const payload = buildPayload(twoWheelerFormState({ disbursedAmountPercentageForDownPayment: 25 }), 'two-wheeler');

    expect(payload.disbursedAmountPercentageForDownPayment).toBe(25);
    expect(payload.enableDownPayment).toBe(true);
    expect(payload.enableAutoRepaymentForDownPayment).toBe(true);
  });

  it('forces down payment on even if the form control was somehow toggled off', () => {
    // enableDownPayment is the product's identity: it stays in the two-wheeler hidden defaults,
    // which are spread last for guided profiles, so a stray false in the (hidden) control cannot
    // turn the product into a personal loan.
    const payload = buildPayload(twoWheelerFormState({ enableDownPayment: false }), 'two-wheeler');

    expect(payload.enableDownPayment).toBe(true);
    expect(payload.disbursedAmountPercentageForDownPayment).toBe(20);
  });

  it('omits the multi-disburse field family, matching the Personal Loan payload contract', () => {
    const payload = buildPayload(twoWheelerFormState(), 'two-wheeler');

    expect(payload.multiDisburseLoan).toBeUndefined();
    expect(payload.maxTrancheCount).toBeUndefined();
    expect(payload.allowFullTermForTranche).toBeUndefined();
    expect(payload.outstandingLoanBalance).toBeUndefined();
    expect(payload.disallowExpectedDisbursements).toBeUndefined();
    expect(payload.allowVariableInstallments).toBeUndefined();
  });

  it('drops grace periods that are not shorter than the repayment count, like Personal', () => {
    const payload = buildPayload(twoWheelerFormState({ graceOnPrincipalPayment: 36 }), 'two-wheeler');

    expect(payload.graceOnPrincipalPayment).toBeUndefined();
  });

  it('lets a user-selected delinquency bucket win, and normalizes the None option to null', () => {
    // delinquencyBucketId is REMOVED from the two-wheeler hidden defaults (spreadsheet marks it
    // Applicable), so the visible select's value must survive the guided "defaults win" merge; the
    // None option ('') is normalized back to the null contract Personal sends from its hidden default.
    expect(buildPayload(twoWheelerFormState({ delinquencyBucketId: '1' }), 'two-wheeler').delinquencyBucketId).toBe(
      '1'
    );
    expect(
      buildPayload(twoWheelerFormState({ delinquencyBucketId: '' }), 'two-wheeler').delinquencyBucketId
    ).toBeNull();
  });
});

describe('loan-product.config buildPayload for the education profile', () => {
  /**
   * The raw form value the wizard actually submits for Education: the shared seed plus the
   * profile's curated prefills (which include the pinned Cumulative-stack control values), plus
   * the two required fields the user types.
   */
  function educationFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['education'],
      name: 'Education Loan – Domestic',
      shortName: 'EDU',
      currencyCode: 'INR',
      ...edits
    };
  }

  it('produces the exact Education create payload for an untouched wizard form', () => {
    // Education is the first guided profile OFF the Progressive stack: Fineract's progressive
    // schedule generator has no grace/moratorium support, so the moratorium product runs on the
    // Classic Cumulative + standard-strategy + daily-interest configuration, and it is the only
    // profile that transmits the multi-disburse family (semester tranches).
    expect(buildPayload(educationFormState(), 'education')).toEqual({
      name: 'Education Loan – Domestic',
      shortName: 'EDU',
      externalId: '',
      description: 'Education Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 500000,
      numberOfRepayments: 120,
      interestRatePerPeriod: 10.5,
      interestRateFrequencyType: 3,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 30,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      isEqualAmortization: false,
      interestCalculationPeriodType: 0,
      loanScheduleType: 'CUMULATIVE',
      transactionProcessingStrategyCode: 'mifos-standard-strategy',
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 24,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: true,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      multiDisburseLoan: true,
      maxTrancheCount: 8,
      allowFullTermForTranche: false,
      disallowExpectedDisbursements: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: false,
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('never forces the Progressive stack: schedule, strategy and interest calc stay pinned Cumulative', () => {
    // Even if the (hidden) controls somehow carried Progressive-stack values, the education hidden
    // defaults are spread last and must win — a Progressive education product would silently drop
    // its moratorium at schedule generation.
    const payload = buildPayload(
      educationFormState({
        loanScheduleType: 'Progressive',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        interestCalculationPeriodType: 1
      }),
      'education'
    );

    expect(payload.loanScheduleType).toBe('CUMULATIVE');
    expect(payload.transactionProcessingStrategyCode).toBe('mifos-standard-strategy');
    expect(payload.interestCalculationPeriodType).toBe(0);
    expect(payload.supportedInterestRefundTypes).toBeUndefined();
    expect(payload.chargeOffBehaviour).toBeUndefined();
  });

  it('transmits the multi-disburse family but never the outstanding-balance cap', () => {
    const payload = buildPayload(educationFormState(), 'education');

    expect(payload.multiDisburseLoan).toBe(true);
    expect(payload.maxTrancheCount).toBe(8);
    expect(payload.allowFullTermForTranche).toBe(false);
    expect(payload.disallowExpectedDisbursements).toBe(true);
    expect(payload.outstandingLoanBalance).toBeUndefined();
  });

  it('lets the user-edited tranche count win over the profile prefill', () => {
    expect(buildPayload(educationFormState({ maxTrancheCount: 12 }), 'education').maxTrancheCount).toBe(12);
  });

  it('floors an emptied or below-minimum tranche count instead of sending an invalid cap', () => {
    // The control is a visible, optional number input: clearing it leaves the FormControl at null and
    // 0/1 are typeable, but Fineract rejects `multiDisburseLoan: true` without a cap of 2 or more.
    [
      null,
      undefined,
      '',
      0,
      1
    ].forEach((maxTrancheCount) => {
      expect(buildPayload(educationFormState({ maxTrancheCount }), 'education').maxTrancheCount).toBe(2);
    });
  });

  it('sends no down-payment fields (overrides the base hidden enableDownPayment: true)', () => {
    const payload = buildPayload(educationFormState(), 'education');

    expect(payload.enableDownPayment).toBe(false);
    expect(payload.disbursedAmountPercentageForDownPayment).toBeUndefined();
    expect(payload.enableAutoRepaymentForDownPayment).toBeUndefined();
  });

  it('keeps the moratorium while it is shorter than the repayment count and drops it otherwise', () => {
    expect(buildPayload(educationFormState(), 'education').graceOnPrincipalPayment).toBe(24);
    expect(
      buildPayload(educationFormState({ graceOnPrincipalPayment: 120 }), 'education').graceOnPrincipalPayment
    ).toBeUndefined();
  });
});

describe('loan-product.config buildPayload for the agriculture profile', () => {
  /**
   * The raw form value the wizard actually submits for Agriculture: the shared seed plus the
   * profile's curated prefills (which include the pinned Cumulative-stack control values), plus
   * the two required fields the user types.
   */
  function agricultureFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['agriculture'],
      name: 'Agriculture Loan – Kharif',
      shortName: 'AGR',
      currencyCode: 'INR',
      ...edits
    };
  }

  it('produces the exact Agriculture create payload for an untouched wizard form', () => {
    // The bullet crop loan: one installment (all principal + interest) at the end of the crop
    // cycle, flat interest, Cumulative schedule, principal-first settlement ordering, seasonal
    // arrears/NPA settings — and no down payment, tranches or progressive-only fields.
    expect(buildPayload(agricultureFormState(), 'agriculture')).toEqual({
      name: 'Agriculture Loan – Kharif',
      shortName: 'AGR',
      externalId: '',
      description: 'Agriculture Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 100000,
      numberOfRepayments: 1,
      interestRatePerPeriod: 7,
      interestRateFrequencyType: 3,
      repaymentEvery: 12,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 1,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'CUMULATIVE',
      transactionProcessingStrategyCode: 'principal-interest-penalties-fees-order-strategy',
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: false,
      inArrearsTolerance: 100,
      graceOnArrearsAgeing: 30,
      overdueDaysForNPA: 180,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: false,
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('keeps the pinned bullet stack even if the hidden controls carried other values', () => {
    // Flat interest, Cumulative schedule, principal-first strategy and zero grace are the
    // product's identity: the agriculture hidden defaults are spread last and must win over any
    // stray control values (all of these controls are hidden for this profile).
    const payload = buildPayload(
      agricultureFormState({
        interestType: 0,
        loanScheduleType: 'Progressive',
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        graceOnPrincipalPayment: 6
      }),
      'agriculture'
    );

    expect(payload.interestType).toBe(1);
    expect(payload.loanScheduleType).toBe('CUMULATIVE');
    expect(payload.transactionProcessingStrategyCode).toBe('principal-interest-penalties-fees-order-strategy');
    expect(payload.graceOnPrincipalPayment).toBe(0);
    expect(payload.chargeOffBehaviour).toBeUndefined();
    expect(payload.supportedInterestRefundTypes).toBeUndefined();
  });

  it('lets the user tune the seasonal NPA clock and the cycle structure', () => {
    // overdueDaysForNPA (visible/editable) and the Terms fields are the operator's levers:
    // 360 ≈ two crop seasons; 2 × 6 months is the two-season bullet variant.
    const payload = buildPayload(
      agricultureFormState({ overdueDaysForNPA: 360, numberOfRepayments: 2, repaymentEvery: 6 }),
      'agriculture'
    );

    expect(payload.overdueDaysForNPA).toBe(360);
    expect(payload.numberOfRepayments).toBe(2);
    expect(payload.repaymentEvery).toBe(6);
  });

  it('omits the multi-disburse family and every down-payment field', () => {
    const payload = buildPayload(agricultureFormState(), 'agriculture');

    expect(payload.multiDisburseLoan).toBeUndefined();
    expect(payload.maxTrancheCount).toBeUndefined();
    expect(payload.allowFullTermForTranche).toBeUndefined();
    expect(payload.disallowExpectedDisbursements).toBeUndefined();
    expect(payload.outstandingLoanBalance).toBeUndefined();
    expect(payload.disbursedAmountPercentageForDownPayment).toBeUndefined();
    expect(payload.enableAutoRepaymentForDownPayment).toBeUndefined();
  });
});

describe('loan-product.config buildPayload for the home and mortgage profiles', () => {
  /**
   * The raw form value the wizard submits for Home / Mortgage: the shared seed, the profile's
   * prefills (the Progressive + advanced-allocation stack and the tranche family), plus the fields
   * the user must type. `principal` and `interestRatePerPeriod` are deliberately not prefilled by the
   * profile — the workbook states no per-product figure — so they are supplied here as user input.
   */
  function homeFormState(
    profile: LoanWizardProfileMode = 'home',
    edits: Record<string, unknown> = {}
  ): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES[profile],
      name: 'Home Loan – Standard',
      shortName: 'HL',
      currencyCode: 'INR',
      principal: 2500000,
      interestRatePerPeriod: 9,
      numberOfRepayments: 240,
      ...edits
    };
  }

  it('produces the exact Home create payload for an untouched wizard form', () => {
    // Home L rows 55-59: the tranche family is transmitted (staged, construction-linked
    // disbursement), unlike the single-disbursal templates. Rows 43/45 fix the 360/30 day count,
    // rows 68-70 keep the down payment hidden on the master defaults, and the sheet's Progressive
    // schedule pulls in the advanced payment allocation strategy.
    expect(buildPayload(homeFormState(), 'home')).toEqual({
      name: 'Home Loan – Standard',
      shortName: 'HL',
      externalId: '',
      description: 'Home Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 2500000,
      numberOfRepayments: 240,
      interestRatePerPeriod: 9,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      allowPartialPeriodInterestCalculation: true,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      multiDisburseLoan: true,
      maxTrancheCount: 4,
      outstandingLoanBalance: 100000,
      disallowExpectedDisbursements: true,
      allowFullTermForTranche: false,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: true,
      disbursedAmountPercentageForDownPayment: 35,
      enableAutoRepaymentForDownPayment: true,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('gives Mortgage the identical product-level payload apart from the description', () => {
    // The `Home L` and `Mortage L` sheets are cell-for-cell identical, and the workbook's index sheet
    // explains why: "Collateral fields are at the loan account level and not product level". Locking
    // this keeps the two profiles from silently drifting apart.
    const home = buildPayload(homeFormState('home'), 'home');
    const mortgage = buildPayload(homeFormState('mortgage'), 'mortgage');
    const differingKeys = Object.keys({ ...home, ...mortgage }).filter(
      (key) => JSON.stringify(home[key]) !== JSON.stringify(mortgage[key])
    );

    expect(differingKeys).toEqual(['description']);
    expect(home.description).toBe('Home Loan Product');
    expect(mortgage.description).toBe('Mortgage Loan Product');
  });

  it('omits the guarantee inputs while guarantee funds are not held', () => {
    // Classic removes all three controls when the toggle is off, so none may reach the create API.
    const payload = buildPayload(homeFormState(), 'home');

    expect(payload.holdGuaranteeFunds).toBe(false);
    expect('mandatoryGuarantee' in payload).toBe(false);
    expect('minimumGuaranteeFromOwnFunds' in payload).toBe(false);
    expect('minimumGuaranteeFromGuarantor' in payload).toBe(false);
  });

  it('sends the guarantee inputs the operator filled in and drops the blank ones', () => {
    const payload = buildPayload(
      homeFormState('home', {
        holdGuaranteeFunds: true,
        mandatoryGuarantee: 100,
        minimumGuaranteeFromOwnFunds: 20
      }),
      'home'
    );

    expect(payload.holdGuaranteeFunds).toBe(true);
    expect(payload.mandatoryGuarantee).toBe(100);
    expect(payload.minimumGuaranteeFromOwnFunds).toBe(20);
    // Left blank in the form: Classic registers it empty and an empty value is not a valid number.
    expect('minimumGuaranteeFromGuarantor' in payload).toBe(false);
  });

  it('lets user input win over the hidden defaults for every field the sheet marks Applicable', () => {
    // Each of these is REMOVED from the profile's hidden defaults, so the guided "defaults win" merge
    // must not clobber the visible control's value.
    const payload = buildPayload(
      homeFormState('home', {
        isLinkedToFloatingInterestRates: true,
        principalThresholdForLastInstallment: 10,
        daysInMonthType: 1,
        maxTrancheCount: 6,
        outstandingLoanBalance: 9000000,
        delinquencyBucketId: '2',
        isEqualAmortization: true
      }),
      'home'
    );

    expect(payload.isLinkedToFloatingInterestRates).toBe(true);
    expect(payload.principalThresholdForLastInstallment).toBe(10);
    expect(payload.daysInMonthType).toBe(1);
    expect(payload.maxTrancheCount).toBe(6);
    expect(payload.outstandingLoanBalance).toBe(9000000);
    expect(payload.delinquencyBucketId).toBe('2');
    expect(payload.isEqualAmortization).toBe(true);
  });

  it("reproduces Classic's reset when multiple disbursals are switched off", () => {
    // Otherwise the payload trips "Allow Multiple Disbursals Not Set - Disallow Expected Disbursals
    // Can't Be Set".
    const payload = buildPayload(homeFormState('home', { multiDisburseLoan: false }), 'home');

    expect(payload.multiDisburseLoan).toBe(false);
    expect('maxTrancheCount' in payload).toBe(false);
    expect('outstandingLoanBalance' in payload).toBe(false);
    expect(payload.disallowExpectedDisbursements).toBe(false);
    expect(payload.allowFullTermForTranche).toBe(false);
  });

  it('coerces a below-minimum tranche cap up to the minimum', () => {
    [
      null,
      0,
      1
    ].forEach((maxTrancheCount) => {
      expect(buildPayload(homeFormState('home', { maxTrancheCount }), 'home').maxTrancheCount).toBe(2);
    });
  });

  it('drops a grace period that is not shorter than the tenure', () => {
    // Fineract requires grace < numberOfRepayments; the sheet samples 120 against 12 repayments.
    expect(buildPayload(homeFormState('home', { graceOnPrincipalPayment: 24 }), 'home').graceOnPrincipalPayment).toBe(
      24
    );
    expect(
      buildPayload(homeFormState('home', { numberOfRepayments: 12, graceOnPrincipalPayment: 120 }), 'home')
        .graceOnPrincipalPayment
    ).toBeUndefined();
  });

  it('normalizes the delinquency bucket "None" option to null', () => {
    expect(buildPayload(homeFormState('home', { delinquencyBucketId: '' }), 'home').delinquencyBucketId).toBeNull();
  });
});

describe('loan-product.config buildPayload for the gold profile', () => {
  /**
   * The raw form value the wizard submits for Gold: the shared seed, the profile's prefills (the
   * Progressive + advanced-allocation stack, the sheet's day counts and the single-disbursal pin),
   * plus the fields the user must type. `principal` and `interestRatePerPeriod` are deliberately not
   * prefilled by the profile — the workbook states no per-product figure — so they are user input.
   */
  function goldFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['gold'],
      name: 'Gold Loan – Standard',
      shortName: 'GL',
      currencyCode: 'INR',
      principal: 200000,
      interestRatePerPeriod: 14,
      numberOfRepayments: 12,
      ...edits
    };
  }

  it('produces the exact Gold create payload for an untouched wizard form', () => {
    // Gold L rows 54-58: the whole tranche family is Not Applicable and absent from the payload — a
    // pledge loan disburses once against a single lot — which is the structural difference from Home.
    // Row 41 makes the arrears tolerance an editable control, rows 15/53 pin the floating-rate link
    // and interest recalculation off, and rows 68-70 keep the down payment on the master defaults.
    expect(buildPayload(goldFormState(), 'gold')).toEqual({
      name: 'Gold Loan – Standard',
      shortName: 'GL',
      externalId: '',
      description: 'Gold Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 200000,
      numberOfRepayments: 12,
      interestRatePerPeriod: 14,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      allowPartialPeriodInterestCalculation: true,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: true,
      disbursedAmountPercentageForDownPayment: 35,
      enableAutoRepaymentForDownPayment: true,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('omits the whole multi-disburse family, which the sheet marks Not Applicable', () => {
    // Gold L rows 54-58. Row 54 is the only sheet row in the workbook that pins an explicit FALSE, and
    // a single-disbursal product must not carry the tranche keys at all.
    const payload = buildPayload(goldFormState(), 'gold');

    [
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche'
    ].forEach((key) => {
      expect([
        key,
        key in payload
      ]).toEqual([
        key,
        false
      ]);
    });
  });

  it('seeds the multiDisburseLoan control false so the Charges step hides tranche-only charges', () => {
    // The control stays hidden, but the reused Classic Charges step binds to it, so the sheet's FALSE
    // has to reach the FormControl and not only the (dropped) payload key.
    expect(PROFILE_INITIAL_OVERRIDES['gold']!.multiDisburseLoan).toBe(false);
  });

  it('lets user input win over the hidden defaults for every field the sheet marks Applicable', () => {
    // Each of these is REMOVED from the profile's hidden defaults, so the guided "defaults win" merge
    // must not clobber the visible control's value.
    const payload = buildPayload(
      goldFormState({
        inArrearsTolerance: 250,
        principalThresholdForLastInstallment: 10,
        daysInMonthType: 1,
        daysInYearType: 365,
        delinquencyBucketId: '2',
        isEqualAmortization: true,
        holdGuaranteeFunds: true,
        mandatoryGuarantee: 100
      }),
      'gold'
    );

    expect(payload.inArrearsTolerance).toBe(250);
    expect(payload.principalThresholdForLastInstallment).toBe(10);
    expect(payload.daysInMonthType).toBe(1);
    expect(payload.daysInYearType).toBe(365);
    expect(payload.delinquencyBucketId).toBe('2');
    expect(payload.isEqualAmortization).toBe(true);
    expect(payload.holdGuaranteeFunds).toBe(true);
    expect(payload.mandatoryGuarantee).toBe(100);
  });

  it('keeps the fields the sheet marks Not Applicable pinned against user input', () => {
    // Rows 15 and 53 are Not Applicable with an explicit FALSE default, so the controls stay hidden
    // and the hidden defaults must win the guided merge even if a stale form value says otherwise.
    const payload = buildPayload(
      goldFormState({ isLinkedToFloatingInterestRates: true, isInterestRecalculationEnabled: true }),
      'gold'
    );

    expect(payload.isLinkedToFloatingInterestRates).toBe(false);
    expect(payload.isInterestRecalculationEnabled).toBe(false);
  });

  it('omits the guarantee inputs while guarantee funds are not held', () => {
    // Row 52 is Applicable, so the toggle is a real control — but Classic removes all three inputs
    // when it is off, so none may reach the create API.
    const payload = buildPayload(goldFormState(), 'gold');

    expect(payload.holdGuaranteeFunds).toBe(false);
    expect('mandatoryGuarantee' in payload).toBe(false);
    expect('minimumGuaranteeFromOwnFunds' in payload).toBe(false);
    expect('minimumGuaranteeFromGuarantor' in payload).toBe(false);
  });

  it('normalizes the delinquency bucket "None" option to null', () => {
    expect(buildPayload(goldFormState({ delinquencyBucketId: '' }), 'gold').delinquencyBucketId).toBeNull();
  });

  it('drops a grace period that is not shorter than the tenure', () => {
    // Fineract requires grace < numberOfRepayments; the sheet samples 120 against 12 repayments.
    expect(buildPayload(goldFormState({ graceOnPrincipalPayment: 3 }), 'gold').graceOnPrincipalPayment).toBe(3);
    expect(
      buildPayload(goldFormState({ numberOfRepayments: 12, graceOnPrincipalPayment: 120 }), 'gold')
        .graceOnPrincipalPayment
    ).toBeUndefined();
  });
});

describe('loan-product.config buildPayload for the auto profile', () => {
  /**
   * The raw form value the wizard submits for Auto: the shared seed, the profile's prefills (the
   * Progressive + advanced-allocation stack, the down-payment trio and the sheet's day counts), plus
   * the fields the user must type. `principal` and `interestRatePerPeriod` are deliberately not
   * prefilled by the profile — the workbook states no per-product figure — so they are user input.
   */
  function autoFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['auto'],
      name: 'Auto Loan – Standard',
      shortName: 'AL',
      currencyCode: 'INR',
      principal: 800000,
      interestRatePerPeriod: 11,
      numberOfRepayments: 60,
      ...edits
    };
  }

  it('produces the exact Auto create payload for an untouched wizard form', () => {
    // Auto L rows 67-69: the whole down-payment trio is Applicable and editable, which is what
    // separates this profile from Gold. Rows 54-58 keep the tranche family out of the payload, row 15
    // makes the floating-rate link editable and row 53 does the same for interest recalculation.
    expect(buildPayload(autoFormState(), 'auto')).toEqual({
      name: 'Auto Loan – Standard',
      shortName: 'AL',
      externalId: '',
      description: 'Auto Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: false,
      principal: 800000,
      numberOfRepayments: 60,
      interestRatePerPeriod: 11,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      allowPartialPeriodInterestCalculation: true,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: true,
      disbursedAmountPercentageForDownPayment: 35,
      enableAutoRepaymentForDownPayment: true,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      principalVariationsForBorrowerCycle: [],
      numberOfRepaymentVariationsForBorrowerCycle: [],
      interestRateVariationsForBorrowerCycle: [],
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('omits the whole multi-disburse family, which the sheet marks Not Applicable', () => {
    // Auto L rows 54-58. A car loan disburses once to the dealer.
    const payload = buildPayload(autoFormState(), 'auto');

    [
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche'
    ].forEach((key) => {
      expect([
        key,
        key in payload
      ]).toEqual([
        key,
        false
      ]);
    });
  });

  it('lets user input win over the hidden defaults for every field the sheet marks Applicable', () => {
    // Each of these is REMOVED from the profile's hidden defaults, so the guided "defaults win" merge
    // must not clobber the visible control's value.
    const payload = buildPayload(
      autoFormState({
        isLinkedToFloatingInterestRates: true,
        principalThresholdForLastInstallment: 10,
        daysInMonthType: 1,
        daysInYearType: 365,
        delinquencyBucketId: '2',
        isEqualAmortization: true,
        disbursedAmountPercentageForDownPayment: 20,
        enableAutoRepaymentForDownPayment: false
      }),
      'auto'
    );

    expect(payload.isLinkedToFloatingInterestRates).toBe(true);
    expect(payload.principalThresholdForLastInstallment).toBe(10);
    expect(payload.daysInMonthType).toBe(1);
    expect(payload.daysInYearType).toBe(365);
    expect(payload.delinquencyBucketId).toBe('2');
    expect(payload.isEqualAmortization).toBe(true);
    expect(payload.disbursedAmountPercentageForDownPayment).toBe(20);
    expect(payload.enableAutoRepaymentForDownPayment).toBe(false);
  });

  it('drops the down payment dependents when the operator turns the toggle off', () => {
    // Rows 67-69 are all editable here, so unlike Gold the toggle can actually be switched off — and
    // Classic removes both dependents when it is, exactly as sanitizeCreateLoanProductPayload does.
    const payload = buildPayload(autoFormState({ enableDownPayment: false }), 'auto');

    expect(payload.enableDownPayment).toBe(false);
    expect('disbursedAmountPercentageForDownPayment' in payload).toBe(false);
    expect('enableAutoRepaymentForDownPayment' in payload).toBe(false);
  });

  it('omits the guarantee inputs, which the sheet marks Not Applicable', () => {
    // Row 52 is Not Applicable for Auto (Home and Gold mark it Applicable): a hypothecated vehicle is
    // the security, so there is no guarantee-funds feature to configure.
    const payload = buildPayload(autoFormState(), 'auto');

    expect(payload.holdGuaranteeFunds).toBe(false);
    expect('mandatoryGuarantee' in payload).toBe(false);
    expect('minimumGuaranteeFromOwnFunds' in payload).toBe(false);
    expect('minimumGuaranteeFromGuarantor' in payload).toBe(false);
  });

  it('normalizes the delinquency bucket "None" option to null', () => {
    expect(buildPayload(autoFormState({ delinquencyBucketId: '' }), 'auto').delinquencyBucketId).toBeNull();
  });

  it('drops a grace period that is not shorter than the tenure', () => {
    // Fineract requires grace < numberOfRepayments; the sheet samples 120 against 12 repayments.
    expect(buildPayload(autoFormState({ graceOnPrincipalPayment: 6 }), 'auto').graceOnPrincipalPayment).toBe(6);
    expect(
      buildPayload(autoFormState({ numberOfRepayments: 12, graceOnPrincipalPayment: 120 }), 'auto')
        .graceOnPrincipalPayment
    ).toBeUndefined();
  });
});

describe('loan-product.config buildPayload for the jlg profile', () => {
  /**
   * The raw form value the wizard submits for JLG: the shared seed, the profile's prefills (the
   * Progressive + advanced-allocation stack, both borrower-cycle toggles and the sheet's day counts),
   * plus the fields the user must type.
   */
  function jlgFormState(edits: Record<string, unknown> = {}): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      ...PROFILE_INITIAL_OVERRIDES['jlg'],
      name: 'JLG Loan – Standard',
      shortName: 'JLG',
      currencyCode: 'INR',
      principal: 30000,
      interestRatePerPeriod: 24,
      numberOfRepayments: 24,
      ...edits
    };
  }

  it('produces the exact JLG create payload for an untouched wizard form', () => {
    // JLG L rows 7/12 seed both borrower-cycle toggles on, row 67 pins the down payment off (so the
    // sanitize step drops its two dependents), and rows 54-58 keep the tranche family out. The three
    // variation arrays are deliberately absent here: they are removed from the hidden defaults so the
    // borrower-cycle step's rows can win, and the wizard folds them in at submit time — see the
    // component spec's coverage of `buildPayloadForSubmit`.
    expect(buildPayload(jlgFormState(), 'jlg')).toEqual({
      name: 'JLG Loan – Standard',
      shortName: 'JLG',
      externalId: '',
      description: 'JLG Loan Product',
      startDate: '',
      closeDate: '',
      includeInBorrowerCycle: true,
      currencyCode: 'INR',
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      installmentAmountInMultiplesOf: 10,
      useBorrowerCycle: true,
      principal: 30000,
      numberOfRepayments: 24,
      interestRatePerPeriod: 24,
      interestRateFrequencyType: 2,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      isLinkedToFloatingInterestRates: false,
      allowApprovedDisbursedAmountsOverApplied: false,
      overAppliedCalculationType: null,
      overAppliedNumber: null,
      minimumDaysBetweenDisbursalAndFirstRepayment: 5,
      interestRecognitionOnDisbursementDate: false,
      repaymentStartDateType: 1,
      amortizationType: 1,
      interestType: 0,
      allowPartialPeriodInterestCalculation: true,
      isEqualAmortization: false,
      interestCalculationPeriodType: 1,
      loanScheduleType: 'PROGRESSIVE',
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleProcessingType: 'HORIZONTAL',
      graceOnPrincipalPayment: 0,
      graceOnInterestPayment: 0,
      graceOnInterestCharged: 0,
      daysInYearType: 360,
      daysInMonthType: 30,
      principalThresholdForLastInstallment: 5,
      canUseForTopup: false,
      isInterestRecalculationEnabled: false,
      delinquencyBucketId: null,
      canDefineInstallmentAmount: true,
      inArrearsTolerance: 50,
      graceOnArrearsAgeing: 5,
      overdueDaysForNPA: 90,
      accountMovesOutOfNPAOnlyOnArrearsCompletion: true,
      holdGuaranteeFunds: false,
      enableDownPayment: false,
      chargeOffBehaviour: 'REGULAR',
      enableInstallmentLevelDelinquency: false,
      dueDaysForRepaymentEvent: 1,
      overDueDaysForRepaymentEvent: 1,
      enableIncomeCapitalization: false,
      enableBuyDownFee: false,
      accountingRule: 2,
      charges: [],
      allowAttributeOverrides: {
        amortizationType: true,
        interestType: true,
        transactionProcessingStrategyCode: true,
        interestCalculationPeriodType: true,
        inArrearsTolerance: true,
        repaymentEvery: true,
        graceOnPrincipalAndInterestPayment: true,
        graceOnArrearsAgeing: true
      }
    });
  });

  it('seeds both borrower-cycle toggles on, per rows 7 and 12', () => {
    // These two are what make the profile a cycle-based product: the counter must be kept, and the
    // terms must be allowed to vary against it.
    expect(PROFILE_INITIAL_OVERRIDES['jlg']!.useBorrowerCycle).toBe(true);
    expect(PROFILE_INITIAL_OVERRIDES['jlg']!.includeInBorrowerCycle).toBe(true);
  });

  it('leaves the variation arrays out of the hidden defaults so the step can supply them', () => {
    // If any of the three stayed pinned, the guided merge — which spreads the defaults LAST — would
    // overwrite the operator's rows with the base empty array.
    const defaults = hiddenDefaultsFor('jlg');

    [
      'principalVariationsForBorrowerCycle',
      'numberOfRepaymentVariationsForBorrowerCycle',
      'interestRateVariationsForBorrowerCycle'
    ].forEach((key) => {
      expect([
        key,
        key in defaults
      ]).toEqual([
        key,
        false
      ]);
    });
  });

  it('keeps the arrays pinned for every other profile', () => {
    // Only JLG's sheet marks rows 26/27/29 Applicable; the rest must keep sending the empty arrays.
    ([
        'personal',
        'two-wheeler',
        'education',
        'agriculture',
        'bnpl',
        'home',
        'mortgage',
        'gold'
      ] as LoanWizardProfileMode[]).forEach((profile) => {
      expect([
        profile,
        hiddenDefaultsFor(profile).principalVariationsForBorrowerCycle
      ]).toEqual([
        profile,
        []
      ]);
    });
  });

  it('pins the down payment off, dropping its dependents', () => {
    // Row 67 is Not Applicable with an explicit FALSE — the group guarantee is the security, so there
    // is no margin money — and the base hidden default is TRUE, so this must be an override.
    const payload = buildPayload(jlgFormState({ enableDownPayment: true }), 'jlg');

    expect(payload.enableDownPayment).toBe(false);
    expect('disbursedAmountPercentageForDownPayment' in payload).toBe(false);
    expect('enableAutoRepaymentForDownPayment' in payload).toBe(false);
  });

  it('omits the whole multi-disburse family, which the sheet marks Not Applicable', () => {
    const payload = buildPayload(jlgFormState(), 'jlg');

    [
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche'
    ].forEach((key) => {
      expect([
        key,
        key in payload
      ]).toEqual([
        key,
        false
      ]);
    });
  });

  it('lets user input win over the hidden defaults for every field the sheet marks Applicable', () => {
    const payload = buildPayload(
      jlgFormState({
        includeInBorrowerCycle: false,
        useBorrowerCycle: false,
        principalThresholdForLastInstallment: 10,
        daysInMonthType: 1,
        daysInYearType: 365,
        delinquencyBucketId: '2',
        isEqualAmortization: true,
        isInterestRecalculationEnabled: false
      }),
      'jlg'
    );

    expect(payload.includeInBorrowerCycle).toBe(false);
    expect(payload.useBorrowerCycle).toBe(false);
    expect(payload.principalThresholdForLastInstallment).toBe(10);
    expect(payload.daysInMonthType).toBe(1);
    expect(payload.daysInYearType).toBe(365);
    expect(payload.delinquencyBucketId).toBe('2');
    expect(payload.isEqualAmortization).toBe(true);
  });

  it('keeps the floating rate link pinned off, which the sheet marks Not Applicable', () => {
    expect(
      buildPayload(jlgFormState({ isLinkedToFloatingInterestRates: true }), 'jlg').isLinkedToFloatingInterestRates
    ).toBe(false);
  });

  it('normalizes the delinquency bucket "None" option to null', () => {
    expect(buildPayload(jlgFormState({ delinquencyBucketId: '' }), 'jlg').delinquencyBucketId).toBeNull();
  });
});

describe('loan-product.config rendersBorrowerCycleStep', () => {
  it('renders the step for JLG only', () => {
    expect(rendersBorrowerCycleStep('jlg')).toBe(true);
    ([
        'personal',
        'custom-advanced',
        'two-wheeler',
        'education',
        'agriculture',
        'bnpl',
        'home',
        'mortgage',
        'gold'
      ] as LoanWizardProfileMode[]).forEach((profile) => {
      expect([
        profile,
        rendersBorrowerCycleStep(profile)
      ]).toEqual([
        profile,
        false
      ]);
    });
  });
});

describe('loan-product.config profileForRoutePath', () => {
  it('maps each wizard route to its profile and page title key', () => {
    expect(profileForRoutePath('personal-loan')).toEqual({
      profileMode: 'personal',
      pageTitle: 'labels.heading.Create Personal Loan'
    });
    expect(profileForRoutePath('custom-advanced')).toEqual({
      profileMode: 'custom-advanced',
      pageTitle: 'labels.heading.Custom / Advanced Loan Configuration'
    });
    expect(profileForRoutePath('two-wheeler-loan')).toEqual({
      profileMode: 'two-wheeler',
      pageTitle: 'labels.heading.Create Two Wheeler Loan'
    });
    expect(profileForRoutePath('education-loan')).toEqual({
      profileMode: 'education',
      pageTitle: 'labels.heading.Create Education Loan'
    });
    expect(profileForRoutePath('agriculture-loan')).toEqual({
      profileMode: 'agriculture',
      pageTitle: 'labels.heading.Create Agriculture Loan'
    });
    expect(profileForRoutePath('home-loan')).toEqual({
      profileMode: 'home',
      pageTitle: 'labels.heading.Create Home Loan'
    });
    expect(profileForRoutePath('mortgage-loan')).toEqual({
      profileMode: 'mortgage',
      pageTitle: 'labels.heading.Create Mortgage Loan'
    });
    expect(profileForRoutePath('gold-loan')).toEqual({
      profileMode: 'gold',
      pageTitle: 'labels.heading.Create Gold Loan'
    });
    expect(profileForRoutePath('auto-loan')).toEqual({
      profileMode: 'auto',
      pageTitle: 'labels.heading.Create Auto Loan'
    });
    expect(profileForRoutePath('jlg-loan')).toEqual({
      profileMode: 'jlg',
      pageTitle: 'labels.heading.Create JLG Loan'
    });
  });

  it('falls back to the Personal Loan profile for unknown or missing paths', () => {
    expect(profileForRoutePath('no-such-route').profileMode).toBe('personal');
    expect(profileForRoutePath(undefined).profileMode).toBe('personal');
  });
});

describe('loan-product.config PRODUCT_CARDS', () => {
  it('gives every product card a non-empty icon', () => {
    PRODUCT_CARDS.forEach((product) => {
      expect(product.icon).toBeDefined();
      expect(typeof product.icon).toBe('string');
      expect(product.icon.length).toBeGreaterThan(0);
    });
  });

  it('activates the Two Wheeler Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Two Wheeler Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('two-wheeler-loan');
  });

  it('activates the Education Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Education Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('education-loan');
  });

  it('activates the Agriculture Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Agriculture Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('agriculture-loan');
  });

  it('activates the Home Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Home Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('home-loan');
  });

  it('activates the Mortgage Loan (LAP) card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Mortgage Loan (LAP)')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('mortgage-loan');
  });

  it('activates the Gold Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Gold Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('gold-loan');
  });

  it('activates the Auto Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.Auto Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('auto-loan');
  });

  it('activates the JLG Loan card with its wizard route', () => {
    const card = PRODUCT_CARDS.find((product) => product.name === 'labels.text.JLG Loan')!;

    expect(card.active).toBe(true);
    expect(card.disabled).toBe(false);
    expect(card.route).toBe('jlg-loan');
  });

  it('routes every active card to a route a wizard profile claims', () => {
    // The selection grid renders a Create button for every active card; a card whose route no
    // profile claims would silently fall back to the Personal Loan wizard.
    PRODUCT_CARDS.filter((product) => product.active).forEach((product) => {
      expect([
        'personal-loan',
        'custom-advanced',
        'two-wheeler-loan',
        'education-loan',
        'agriculture-loan',
        'bnpl-loan',
        'home-loan',
        'mortgage-loan',
        'gold-loan',
        'auto-loan',
        'jlg-loan'
      ]).toContain(product.route);
    });
  });
  describe('daysInYearCustomStrategy payload gating', () => {
    // Classic registers the control (and its `Validators.required`) only for the advanced payment
    // allocation strategy AND an ACTUAL days-in-year type, and never sends it otherwise. These lock
    // that gate across every profile so the field can never reach the create API while hidden.
    const allProfiles: LoanWizardProfileMode[] = [
      'personal',
      'two-wheeler',
      'education',
      'agriculture',
      'custom-advanced',
      'bnpl',
      'home',
      'mortgage',
      'gold',
      'auto',
      'jlg'
    ];

    function payloadFor(profile: LoanWizardProfileMode, overrides: Record<string, unknown>) {
      return buildPayload({ ...INITIAL_FORM_STATE, ...overrides } as any, profile, undefined);
    }

    it('omits it for every profile when days in year is not ACTUAL', () => {
      allProfiles.forEach((profile) => {
        const payload = payloadFor(profile, {
          daysInYearType: 360,
          transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
        });
        expect([
          profile,
          'daysInYearCustomStrategy' in payload
        ]).toEqual([
          profile,
          false
        ]);
      });
    });

    it('omits it for every profile on a non-advanced strategy, even with ACTUAL days in year', () => {
      allProfiles.forEach((profile) => {
        const payload = payloadFor(profile, {
          daysInYearType: 1,
          transactionProcessingStrategyCode: 'mifos-standard-strategy'
        });
        expect([
          profile,
          'daysInYearCustomStrategy' in payload
        ]).toEqual([
          profile,
          false
        ]);
      });
    });

    it('sends it only from the profiles that expose the control, as the backend code', () => {
      const applicable = {
        daysInYearType: 1,
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        loanScheduleType: 'Progressive'
      };
      // Guided profiles that keep the field hidden and pinned still omit it - unchanged behaviour.
      ([
          'personal',
          'two-wheeler',
          'education',
          'agriculture'
        ] as LoanWizardProfileMode[]).forEach((profile) => {
        const payload = payloadFor(profile, applicable);
        expect([
          profile,
          'daysInYearCustomStrategy' in payload
        ]).toEqual([
          profile,
          false
        ]);
      });
      // The profiles that render it as an editable control send it.
      ([
          'custom-advanced',
          'bnpl',
          'home',
          'mortgage',
          'gold',
          'auto',
          'jlg'
        ] as LoanWizardProfileMode[]).forEach((profile) => {
        const payload = payloadFor(profile, applicable);
        expect([
          profile,
          payload.daysInYearCustomStrategy
        ]).toEqual([
          profile,
          'FULL_LEAP_YEAR'
        ]);
      });
    });
  });
});
