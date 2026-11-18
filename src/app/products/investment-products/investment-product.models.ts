/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Response models contain the fields this feature reads; write models retain the complete backend contract. */

/** Exact decimal values remain text in memory; the wire codec writes JSON numbers. */
export type Decimal = string;
export type InvestmentType = 'PROMISSORY_NOTE' | 'CEDE';
export interface Capabilities {
  [capability: string]: boolean;
}
export interface TermRenewalLimit {
  termDays: number;
  maximumReinvestments: number;
}
export interface InvestmentPolicy {
  investmentType: InvestmentType;
  currencyCode: string;
  minimumTermDays: number;
  maximumTermDays: number;
  termMultipleDays: number;
  minimumInvestmentAmount: Decimal | null;
  maximumInvestmentAmount: Decimal | null;
  automaticReinvestmentEnabled: boolean;
  maximumReinvestments: number | null;
  maximumReinvestmentsByTerm: TermRenewalLimit[];
  renewalRatePolicy: 'RATE_EFFECTIVE_AT_RENEWAL' | null;
  capitalizationEligible: boolean;
  capitalizationEnabled: boolean;
  interestPayoutMode: 'AT_MATURITY' | 'MONTHLY' | 'CAPITALIZE_ON_RENEWAL';
  principalSettlementMode: 'AT_MATURITY';
  earlyCancellationAllowed: boolean;
  penaltyMode: 'NONE' | 'NATIVE' | 'VERSIONED_REFERENCE';
  cancellationPolicyReference: { policyCode: string; revision: number } | null;
  penaltyFreeNonRenewalSupported: boolean;
}
export interface NativeProduct {
  name: string;
  currencyCode: string;
  currencyDigits: number;
  currencyMultiple: number | null;
  terms: {
    minimum: number | null;
    minimumUnit: number | null;
    maximum: number | null;
    maximumUnit: number | null;
    multiple: number | null;
    multipleUnit: number | null;
  };
  minimumDepositAmount: Decimal | null;
  maximumDepositAmount: Decimal | null;
  accountingRule: number;
  interestPostingPeriod: number | null;
  withholdTax: boolean;
  taxGroupId: number | null;
  accountingMappings: {
    mappingId: number;
    financialAccountType: number | null;
    glAccountId: number | null;
    disabled: boolean;
    classification: number | null;
    usage: number | null;
    paymentType: number | null;
    chargeId: number | null;
  }[];
}
export interface Assessment {
  policyValidated: boolean;
  accountingMappingValidated: boolean;
  blockers: string[];
}
export interface PolicyConfiguration {
  productId: number;
  revision: number;
  status: 'UNCONFIGURED' | 'DRAFT';
  policy: InvestmentPolicy | null;
  nativeProduct: NativeProduct;
  validation: Assessment;
  capabilities: Capabilities;
}
export interface PolicyTemplate {
  investmentTypes: InvestmentType[];
  interestPayoutModes: InvestmentPolicy['interestPayoutMode'][];
  principalSettlementModes: InvestmentPolicy['principalSettlementMode'][];
  penaltyModes: InvestmentPolicy['penaltyMode'][];
  renewalRatePolicies: NonNullable<InvestmentPolicy['renewalRatePolicy']>[];
  promissoryNoteMinimumTermDays: number;
  promissoryNoteMaximumTermDays: number;
  cedeSuggestedMinimumTermDays: number;
  cedeTermMultipleDays: number;
}
export interface PolicyWrite {
  expectedRevision: number;
  policy: InvestmentPolicy;
}
export interface PolicyValidation {
  validation: Assessment;
}
export interface PolicyAudit {
  previousRevision: number;
  revision: number;
  operation: string;
  actorId: number;
  recordedAtUtc: string;
  businessDate: string;
  changedFields: string[];
  previousConfiguration: InvestmentPolicy | null;
  newConfiguration: InvestmentPolicy;
}
export interface AmountBand {
  lower: Decimal;
  upper: Decimal | null;
  upperInclusive: boolean;
}
export interface TermBand {
  minimumDays: number;
  maximumDays: number;
}
export interface RateMatrix {
  currencyCode: string;
  amountBands: AmountBand[];
  termBands: TermBand[];
  cells: { amountBand: number; termBand: number; annualRatePercent: Decimal }[];
}
export interface EffectiveValidity {
  mode: 'IMMEDIATE' | 'SCHEDULED';
  effectiveDate: string | null;
}
export interface CampaignMetadata {
  campaignId: string;
  name: string;
  type: 'NEW_INVESTMENT_OFFER' | 'CALENDAR_PREFERENTIAL' | 'FINAL_RENEWAL_PERIOD';
  startDate: string;
  endDate: string;
}
export interface RateWrite {
  expectedRevision: number;
  matrix: RateMatrix;
  effectiveValidity: EffectiveValidity;
  campaignMetadata: CampaignMetadata | null;
}
export interface RateTemplate {
  currencyCode: string;
  currencyDigits: number;
  maximumAmountBands: number;
  maximumTermBands: number;
  maximumCells: number;
  rateDecimalPlaces: number;
  timezone: string | null;
  businessDate: string | null;
  validityModes: EffectiveValidity['mode'][];
  campaignTypes: CampaignMetadata['type'][];
  capabilities: Capabilities;
  blockers: string[];
}
export interface RateConfiguration {
  revision: number;
  version: number | null;
  status: 'DRAFT' | 'APPROVED_SCHEDULED' | 'APPROVED_EFFECTIVE' | 'SUPERSEDED';
  effectiveDate: string | null;
  effectiveInstant: string | null;
  timezone: string | null;
  configuration: RateWrite;
  policyRevision: number;
  policySnapshot: InvestmentPolicy;
  nativeSnapshot: NativeProduct;
  makerId: number;
  checkerId: number | null;
  approvedAtUtc: string | null;
  previousVersion: number | null;
  capabilities: Capabilities;
  blockers: string[];
}
export interface RateValidation {
  valid: boolean;
  blockers: string[];
}
export interface RateAudit {
  revision: number;
  version: number | null;
  action: string;
  actorId: number;
  recordedAtUtc: string;
  previousVersion: number | null;
  effectiveInstant: string | null;
  cellChanges: { amountBand: AmountBand; termBand: TermBand; previousRate: Decimal | null; newRate: Decimal }[];
}
export interface RateSelection {
  investmentType: InvestmentType;
  annualRatePercent: Decimal | null;
  version: number | null;
  amountBand: AmountBand | null;
  termBand: TermBand | null;
  effectiveDate: string | null;
  effectiveInstant: string | null;
  timezone: string | null;
  status: 'SELECTED_CONFIGURATION_ONLY' | 'NO_APPLICABLE_RATE';
  capabilities: Capabilities;
  blockers: string[];
}
export interface NativeCatalogProduct {
  id: number;
  name: string;
  currency?: { code: string };
}
export interface CatalogEntry {
  native: NativeCatalogProduct;
  configuration?: PolicyConfiguration;
  rateStatus?: RateConfiguration['status'] | 'NO_APPLICABLE_RATE';
  error?: string;
  rateError?: string;
}
