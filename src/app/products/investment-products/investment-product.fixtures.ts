/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Synthetic administrative fixtures for tests; never loaded by production components. */
import {
  InvestmentPolicy,
  NativeProduct,
  PolicyConfiguration,
  PolicyTemplate,
  RateConfiguration,
  RateTemplate,
  RateWrite
} from './investment-product.models';
export const nativeFixture: NativeProduct = {
  name: 'Synthetic Investment',
  currencyCode: 'USD',
  currencyDigits: 2,
  currencyMultiple: 1,
  terms: { minimum: 1, minimumUnit: 0, maximum: 1825, maximumUnit: 0, multiple: null, multipleUnit: null },
  minimumDepositAmount: '100',
  maximumDepositAmount: '100000',
  accountingRule: 1,
  interestPostingPeriod: 4,
  withholdTax: false,
  taxGroupId: null,
  accountingMappings: []
};
export const policyFixture: InvestmentPolicy = {
  investmentType: 'PROMISSORY_NOTE',
  currencyCode: 'USD',
  minimumTermDays: 1,
  maximumTermDays: 1825,
  termMultipleDays: 1,
  minimumInvestmentAmount: '100',
  maximumInvestmentAmount: '100000',
  automaticReinvestmentEnabled: false,
  maximumReinvestments: null,
  maximumReinvestmentsByTerm: [],
  renewalRatePolicy: null,
  capitalizationEligible: false,
  capitalizationEnabled: false,
  interestPayoutMode: 'AT_MATURITY',
  principalSettlementMode: 'AT_MATURITY',
  earlyCancellationAllowed: false,
  penaltyMode: 'NONE',
  cancellationPolicyReference: null,
  penaltyFreeNonRenewalSupported: false
};
export const policyTemplateFixture: PolicyTemplate = {
  investmentTypes: [
    'PROMISSORY_NOTE',
    'CEDE'
  ],
  interestPayoutModes: [
    'AT_MATURITY',
    'MONTHLY',
    'CAPITALIZE_ON_RENEWAL'
  ],
  principalSettlementModes: ['AT_MATURITY'],
  penaltyModes: [
    'NONE',
    'NATIVE',
    'VERSIONED_REFERENCE'
  ],
  renewalRatePolicies: ['RATE_EFFECTIVE_AT_RENEWAL'],
  promissoryNoteMinimumTermDays: 1,
  promissoryNoteMaximumTermDays: 1825,
  cedeSuggestedMinimumTermDays: 60,
  cedeTermMultipleDays: 30
};
export const configurationFixture: PolicyConfiguration = {
  productId: 41,
  revision: 1,
  status: 'DRAFT',
  policy: policyFixture,
  nativeProduct: nativeFixture,
  capabilities: { configurationSupported: true, rateConfigurationSupported: true, financialExecutionSupported: false },
  validation: { policyValidated: true, accountingMappingValidated: false, blockers: [
      'NATIVE_ACCOUNTING_DISABLED_OR_UNSUPPORTED',
      'FINANCIAL_EXECUTION_UNAVAILABLE'
    ] }
};
export const rateTemplateFixture: RateTemplate = {
  currencyCode: 'USD',
  currencyDigits: 2,
  maximumAmountBands: 50,
  maximumTermBands: 50,
  maximumCells: 2500,
  rateDecimalPlaces: 6,
  timezone: 'America/Mexico_City',
  businessDate: '2026-11-19',
  validityModes: [
    'IMMEDIATE',
    'SCHEDULED'
  ],
  campaignTypes: [
    'NEW_INVESTMENT_OFFER',
    'CALENDAR_PREFERENTIAL',
    'FINAL_RENEWAL_PERIOD'
  ],
  capabilities: {
    rateConfigurationSupported: true,
    rateSchedulingSupported: true,
    rateHistorySupported: true,
    rateLookupSupported: true,
    ratePublicationSupported: true,
    independentReviewRequired: true,
    campaignPublicationSupported: false,
    nativeChartIntegrationSupported: false,
    financialExecutionSupported: false
  },
  blockers: []
};
export const rateWriteFixture: RateWrite = {
  expectedRevision: 0,
  matrix: {
    currencyCode: 'USD',
    amountBands: [{ lower: '100', upper: '100000', upperInclusive: true }],
    termBands: [{ minimumDays: 1, maximumDays: 1825 }],
    cells: [{ amountBand: 0, termBand: 0, annualRatePercent: '14.000001' }]
  },
  effectiveValidity: { mode: 'IMMEDIATE', effectiveDate: null },
  campaignMetadata: null
};
export const rateFixture: RateConfiguration = {
  revision: 1,
  version: null,
  status: 'DRAFT',
  effectiveDate: null,
  effectiveInstant: null,
  timezone: rateTemplateFixture.timezone,
  configuration: rateWriteFixture,
  policyRevision: 1,
  policySnapshot: policyFixture,
  nativeSnapshot: nativeFixture,
  makerId: 1,
  checkerId: null,
  approvedAtUtc: null,
  previousVersion: null,
  capabilities: rateTemplateFixture.capabilities,
  blockers: []
};
