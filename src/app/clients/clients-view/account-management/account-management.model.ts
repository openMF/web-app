/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Decimal tokens remain text; absent amounts never mean zero. */
export type Money = string;
export interface MainCapabilities {
  mainAccountRelationships: boolean;
  guaranteedAccountCreation: boolean;
  guaranteeAllocation: boolean;
  guaranteeRelease: boolean;
  loanDisbursementRouting: boolean;
  paymentReferenceProvider: boolean;
  blockers: string[];
}
export interface MainRelationship {
  clientId: number;
  savingsAccountId: number;
  savingsProductId: number;
  policyVersion: number;
  nativeStatus: number;
  active: boolean;
}
export interface MainRelationships {
  clientId: number;
  relationships: MainRelationship[];
}
export interface MainAudit {
  clientId: number;
  savingsAccountId: number;
  savingsProductId: number;
  policyVersion: number;
  id: number;
  action: string;
  actorId: number;
  recordedAt: string | number[];
}
export interface NativeSavings {
  id: number;
  clientId: number;
  accountNo: string;
  savingsProductId: number;
  savingsProductName: string;
  currency: { code: string; decimalPlaces: number };
  status: { id: number };
  summary?: { accountBalance?: Money; totalInterestPosted?: Money; totalInterestEarned?: Money };
  nominalAnnualInterestRate?: Money;
}
export interface SweepCapabilities {
  eligibilityDiagnostics: boolean;
  durableDiagnosticBatch: boolean;
  manualSweep: boolean;
  guaranteeAllocation: boolean;
  guaranteeRelease: boolean;
  automaticSweep: boolean;
  financialEnforcement: boolean;
  blockers: string[];
}
export interface GuaranteeSource {
  savingsAccountId: number;
  purpose: string;
  policyVersion: number;
  nativeStatus: number;
}
export interface GuaranteeLoan {
  loanId: number;
  nativeStatus: number;
  currencyCode: string;
}
export interface Decision {
  clientId: number;
  loanId: number;
  savingsAccountId: number;
  businessDate: string;
  currencyCode: string;
  currencyDigits: number;
  policyVersion?: number;
  requestedAmount?: Money;
  loanStatus: number;
  loanOutstanding?: Money;
  sourcePurpose?: string;
  sourceCurrencyCode?: string;
  sourceCurrencyDigits?: number;
  nativeWithdrawableBalance?: Money;
  availableGuaranteeFunds?: Money | null;
  state: string;
  reasons: string[];
}
export interface Reconciliation {
  executionId: string;
  status: string;
  nativeReferencesMatch: boolean;
  repaymentReversed: boolean;
  savingsReversed: boolean;
  journalEntriesPresent: boolean;
  journalEntriesBalanced: boolean;
  nativeAccountingVerified: boolean;
  financialRetryAllowed: boolean;
}
export interface Receipt {
  id: string;
  clientId: number;
  loanId: number;
  savingsAccountId: number;
  operation: string;
  mode: string;
  state: string;
  businessDate: string;
  policyVersion?: number;
  requestedAmount?: Money;
  appliedAmount?: Money | null;
  currencyCode: string;
  actorId: number;
  reasonCode: string;
  nativeSavingsTransactionId?: string;
  nativeLoanTransactionId?: string;
  nativeTransferId?: string;
  evaluation: Decision;
}
export interface SweepAudit {
  id: number;
  executionId?: string;
  actorId: number;
  businessDate: string;
  event: string;
  reasonCode: string;
  evaluation?: Decision;
  reconciliation?: Reconciliation;
  recordedAt: string;
}
export interface Allocation {
  id: number;
  savingsAccountId: number;
  policyVersion: number;
  currencyCode: string;
  state: string;
  proposedAmount?: Money;
  reservedAmount?: Money;
  consumedAmount?: Money;
  releasedAmount?: Money;
}
export interface Eligibility {
  state: string;
  executionEnabled?: boolean;
  businessDate?: string;
  blockers: string[];
}
export interface ReleaseStatus extends Eligibility {
  allocations: Allocation[];
}
export interface PlannedCapabilities {
  arrangementConfiguration: boolean;
  scheduleProjection: boolean;
  pocketRelationships: boolean;
  nativeAccountCreation: boolean;
  payrollExecution: boolean;
  contributionScheduler: boolean;
  frozenFundRelease: boolean;
  maturitySettlement: boolean;
  pocketTransfer: boolean;
  accountClosure: boolean;
  blockers: string[];
}
export interface PlannedConfiguration {
  savingsProductId: number;
  policyVersion: number;
  employerClientId: number;
  arrangementReference: string;
  contributionAmount: Money;
  frequencyUnit: 'DAYS' | 'WEEKS' | 'MONTHS';
  frequencyInterval: number;
  shortMonthRule?: 'SKIP' | 'LAST_DAY';
  startDate: string;
  termDays: number;
  maturityDate: string;
  status: 'CONFIGURATION_ONLY' | 'CANCELLED';
}
export interface Arrangement {
  id: string;
  clientId: number;
  revision: number;
  configuration: PlannedConfiguration;
  savingsAccountId?: number;
  state: string;
  financialExecutionEnabled: boolean;
  blockers: string[];
}
export interface Contribution {
  revision: number;
  sequence: number;
  dueDate: string;
  expectedAmount: Money;
  nativeTransactionId?: number;
  status: string;
  executionEnabled: boolean;
}
export interface NativeSnapshot {
  savingsAccountId: number;
  clientId: number;
  savingsProductId: number;
  policyVersion?: number;
  purpose?: string;
  currency: string;
  currencyDigits: number;
  nativeStatus: number;
  nativeSubStatus: number;
  balance?: Money;
  withdrawableBalance?: Money;
  nativeInterestEarned?: Money;
  nativeInterestPosted?: Money;
  interestMode?: string;
  businessDate: string;
  blockers: string[];
}
export interface Pocket {
  savingsAccountId: number;
  clientId: number;
  mainSavingsAccountId: number;
  revision: number;
  policyVersion: number;
  mainPolicyVersion: number;
  name: string;
  relationshipStatus: string;
  nativeAccount: NativeSnapshot;
}
/** BE-10 history deliberately returns JDBC column names, unlike its record DTOs. */
export interface PlannedAudit {
  id: number;
  subject_type: string;
  subject_id: string;
  savings_account_id?: number;
  savings_product_id: number;
  policy_version: number;
  actor_id: number;
  action: string;
  outcome: string;
  business_date: string;
  recorded_at: string;
}
export const PAGE_SIZE = 25;
