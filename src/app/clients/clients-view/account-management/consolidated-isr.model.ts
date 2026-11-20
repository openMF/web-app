/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** BE-11 diagnostic contracts. Money is exact decimal text; absent results stay absent. */
export interface IsrPeriod {
  from: string;
  through: string;
}
export const ISR_CAPABILITIES = [
  'eligibilityDiagnostics',
  'nativeBalanceObservations',
  'consolidatedBalanceRetrieval',
  'draftRuleVersions',
  'approvedTaxRules',
  'calculation',
  'allocation',
  'withholdingExecution',
  'accountingIntegrationVerified',
  'historicalSnapshots',
  'historicalReconciliation'
] as const;
export type IsrCapability = (typeof ISR_CAPABILITIES)[number];
export type IsrCapabilities = Partial<Record<IsrCapability, boolean>> & {
  diagnosticClassifications?: string[];
  blockers?: string[];
};
export interface IsrProfile {
  clientId: number;
  tenant: string;
  legalForm: number | null;
  jurisdiction: string | null;
  taxTreatment: string | null;
  ruleId: string | null;
  ruleVersion: number | null;
  currency: string | null;
  status: string;
  eligibleAccounts: number[];
}
export interface IsrAccountDecision {
  accountId: number;
  productId: number;
  policyVersion: number | null;
  classification: string | null;
  structurallySupported: boolean;
  eligible: boolean;
  reasons: string[];
}
export interface IsrEligibility {
  clientId: number;
  period: IsrPeriod;
  state: string;
  profile: IsrProfile;
  accounts: IsrAccountDecision[];
  populationComplete: boolean;
  blockers: string[];
}
export interface IsrAccount extends IsrAccountDecision {
  clientId: number;
  officeId: number;
  depositType: number;
  status: number;
  subStatus: number;
  activatedOn: string | null;
  closedOn: string | null;
  currency: string | null;
  currencyDigits: number;
  purpose: string | null;
  mainAccountId: number | null;
  nativeWithholdTax: boolean;
  taxGroupId: number | null;
  accountingType: number | null;
  observedLedgerBalance: string | null;
  policyEvidenceHash: string | null;
}
export interface IsrTransaction {
  id: number;
  accountId: number;
  type: number;
  date: string;
  amount: string | null;
  reversed: boolean;
  reversal: boolean;
  originalTransactionId: number | null;
  runningBalance: string | null;
}
export interface IsrTaxDetail {
  id: number;
  transactionId: number;
  componentId: number;
  amount: string | null;
}
export interface IsrCurrencyObservation {
  currency: string;
  currencyDigits: number;
  accountCount: number;
  observedLedgerBalance: string | null;
  nativePostedInterest: string | null;
  nativeWithheldTax: string | null;
}
export interface IsrSources {
  accounts: IsrAccount[];
  transactions: IsrTransaction[];
  taxDetails: IsrTaxDetail[];
  observations: IsrCurrencyObservation[];
  complete: boolean;
  reasons: string[];
  fingerprint: string;
}
export interface IsrPreview {
  clientId: number;
  businessDate: string;
  taxPeriod: IsrPeriod;
  observedAt: string;
  profile: IsrProfile;
  sources: IsrSources;
  state: string;
  taxableBase: string | null;
  calculatedIsr: string | null;
  actualWithheldAmount: string | null;
  allocations: unknown[];
  nativeReferences: number[];
  blockers: string[];
}
export interface IsrCalculation {
  calculationId: string;
  tenant: string;
  clientId: number;
  actorId: number;
  recordedAt: string;
  supersedes: string | null;
  correctionReason: string | null;
  result: IsrPreview;
}
export interface IsrHistoryEntry {
  sequence: number;
  calculation: IsrCalculation;
}
export interface IsrAuditEntry {
  id: number;
  action: string;
  actorId: number;
  businessDate: string;
  recordedAt: string;
  detailsJson: string;
}
export interface IsrReconciliation {
  calculationId: string;
  status: string;
  savedFingerprint: string;
  currentFingerprint: string;
  checkedAt: string;
  blockers: string[];
  accountingVerified: boolean;
  financialRetryAllowed: boolean;
}
export class IsrContractError extends Error {}

/** Allowlist codes; never render raw backend messages, detailsJson or an unknown internal code. */
export const ISR_CODE_KEYS: Readonly<Record<string, string>> = {
  BLOCKED_PENDING_POLICY: 'ConsolidatedIsr.PolicyApprovalRequired',
  UNVERIFIED: 'ConsolidatedIsr.Unverified',
  UNCHANGED_BLOCKED: 'ConsolidatedIsr.UnchangedBlocked',
  RECONCILIATION_REQUIRED: 'ConsolidatedIsr.ReconciliationRequired',
  ASSESSMENT_SAVED: 'ConsolidatedIsr.AssessmentSaved',
  RECONCILIATION_CHECKED: 'ConsolidatedIsr.ReconciliationChecked',
  SAVINGS: 'SavingsProducts.Savings',
  INTEREST_BEARING_SIGHT: 'SavingsProducts.InterestBearingSight',
  SIGHT: 'SavingsProducts.Sight',
  ISR_POLICY_NOT_APPROVED: 'ConsolidatedIsr.Reasons.ISR_POLICY_NOT_APPROVED',
  TAX_PROFILE_UNVERIFIED: 'ConsolidatedIsr.Reasons.TAX_PROFILE_UNVERIFIED',
  AGGREGATION_BOUNDARY_UNAPPROVED: 'ConsolidatedIsr.Reasons.AGGREGATION_BOUNDARY_UNAPPROVED',
  TAX_PERIOD_UNSUPPORTED: 'ConsolidatedIsr.Reasons.TAX_PERIOD_UNSUPPORTED',
  TAXABLE_BASIS_UNAPPROVED: 'ConsolidatedIsr.Reasons.TAXABLE_BASIS_UNAPPROVED',
  ALLOCATION_UNAPPROVED: 'ConsolidatedIsr.Reasons.ALLOCATION_UNAPPROVED',
  ROUNDING_UNAPPROVED: 'ConsolidatedIsr.Reasons.ROUNDING_UNAPPROVED',
  NATIVE_ACCOUNTING_INTEGRATION_UNVERIFIED: 'ConsolidatedIsr.Reasons.NATIVE_ACCOUNTING_INTEGRATION_UNVERIFIED',
  ACCOUNT_CLASSIFICATION_UNSUPPORTED: 'ConsolidatedIsr.Reasons.ACCOUNT_CLASSIFICATION_UNSUPPORTED',
  INVESTMENT_TREATMENT_UNAPPROVED: 'ConsolidatedIsr.Reasons.INVESTMENT_TREATMENT_UNAPPROVED',
  ACCOUNT_STATUS_INELIGIBLE: 'ConsolidatedIsr.Reasons.ACCOUNT_STATUS_INELIGIBLE',
  ACCOUNT_OWNERSHIP_UNSUPPORTED: 'ConsolidatedIsr.Reasons.ACCOUNT_OWNERSHIP_UNSUPPORTED',
  ACCOUNT_OFFICE_SCOPE_INCOMPLETE: 'ConsolidatedIsr.Reasons.ACCOUNT_OFFICE_SCOPE_INCOMPLETE',
  ACCOUNT_POPULATION_LIMIT_EXCEEDED: 'ConsolidatedIsr.Reasons.ACCOUNT_POPULATION_LIMIT_EXCEEDED',
  PRODUCT_POLICY_UNAVAILABLE: 'ConsolidatedIsr.Reasons.PRODUCT_POLICY_UNAVAILABLE',
  PRODUCT_POLICY_NOT_EFFECTIVE: 'ConsolidatedIsr.Reasons.PRODUCT_POLICY_NOT_EFFECTIVE',
  PRODUCT_POLICY_TRANSITION_UNSUPPORTED: 'ConsolidatedIsr.Reasons.PRODUCT_POLICY_TRANSITION_UNSUPPORTED',
  PRODUCT_CORE_CHANGED: 'ConsolidatedIsr.Reasons.PRODUCT_CORE_CHANGED',
  TAX_GROUP_UNAVAILABLE: 'ConsolidatedIsr.Reasons.TAX_GROUP_UNAVAILABLE',
  TAX_CONFIGURATION_MISMATCH: 'ConsolidatedIsr.Reasons.TAX_CONFIGURATION_MISMATCH',
  CURRENCY_UNSUPPORTED: 'ConsolidatedIsr.Reasons.CURRENCY_UNSUPPORTED',
  CURRENCY_AGGREGATION_UNAPPROVED: 'ConsolidatedIsr.Reasons.CURRENCY_AGGREGATION_UNAPPROVED',
  SOURCE_DATA_UNAVAILABLE: 'ConsolidatedIsr.Reasons.SOURCE_DATA_UNAVAILABLE',
  SOURCE_TRANSACTION_LIMIT_EXCEEDED: 'ConsolidatedIsr.Reasons.SOURCE_TRANSACTION_LIMIT_EXCEEDED',
  HISTORICAL_BALANCE_BASIS_UNAPPROVED: 'ConsolidatedIsr.Reasons.HISTORICAL_BALANCE_BASIS_UNAPPROVED',
  HISTORICAL_ACCOUNT_STATE_UNVERIFIED: 'ConsolidatedIsr.Reasons.HISTORICAL_ACCOUNT_STATE_UNVERIFIED',
  NATIVE_WITHHOLDING_REMAINS_AUTHORITATIVE: 'ConsolidatedIsr.Reasons.NATIVE_WITHHOLDING_REMAINS_AUTHORITATIVE',
  SOURCE_DATA_CHANGED: 'ConsolidatedIsr.Reasons.SOURCE_DATA_CHANGED',
  NO_ACCOUNTS: 'ConsolidatedIsr.Reasons.NO_ACCOUNTS'
};
export function isrCodeKey(code: unknown): string {
  return typeof code === 'string' && Object.hasOwn(ISR_CODE_KEYS, code)
    ? ISR_CODE_KEYS[code]
    : 'ConsolidatedIsr.UnknownDiagnostic';
}
/** Use local calendar fields, never UTC conversion, for Material's Date inputs. */
export function isrIsoDate(date: Date | null): string | null {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
