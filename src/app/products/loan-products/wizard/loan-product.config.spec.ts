/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LoanProducts } from '../loan-products';
import { buildPayload, PRODUCT_CARDS } from './loan-product.config';

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

describe('loan-product.config PRODUCT_CARDS', () => {
  it('gives every product card a non-empty icon', () => {
    PRODUCT_CARDS.forEach((product) => {
      expect(product.icon).toBeDefined();
      expect(typeof product.icon).toBe('string');
      expect(product.icon.length).toBeGreaterThan(0);
    });
  });
});
