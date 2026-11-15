/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Matches savings-plugin BE-02 AnpaAccountingData at a7e69d5. Dates are ISO strings.
// A null monetary value is unavailable evidence, never a zero balance.
export type Money = number | null;
export type Category = 'PRINCIPAL' | 'INTEREST' | 'FEE_COMMISSION' | 'ITBMS' | 'PENALTY' | 'OTHER';
export type Classification = 'REGULAR' | 'NPA' | 'NATIVE_UNSEGREGATED' | 'UNKNOWN';
export type MappingStatus =
  | 'NATIVE_UNSEGREGATED'
  | 'VERIFIED_SOURCE_EVIDENCE'
  | 'MISSING'
  | 'AMBIGUOUS'
  | 'INVALID_ACCOUNT'
  | 'UNCLASSIFIED_SOURCE'
  | 'UNAPPROVED_TAX_SEMANTICS'
  | 'NATIVE_MAPPING_UNAVAILABLE'
  | 'APPROVED_SEGREGATION_UNAVAILABLE';
export type ReconciliationStatus = 'UNVERIFIED' | 'MATCHED_CURRENT_GL_ONLY' | 'DIFFERENCE';
export type ReclassificationStatus = 'UNVERIFIED_NO_NATIVE_RECLASSIFICATION_CONTRACT';
export type Reason =
  | 'LOAN_NOT_ELIGIBLE'
  | 'ACCOUNTING_RULE_UNSUPPORTED'
  | 'NPA_HISTORY_UNAVAILABLE'
  | 'RECEIVABLE_MAPPING_MISSING'
  | 'NPA_RECEIVABLE_MAPPING_MISSING'
  | 'GL_EVIDENCE_INCOMPLETE'
  | 'UNAPPROVED_RECLASSIFICATION_RULE'
  | 'WRITE_OFF_DATE_INVALID'
  | 'HISTORICAL_SNAPSHOT_UNAVAILABLE'
  | 'CURRENCY_MISMATCH'
  | 'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
  | 'AMBIGUOUS_MAPPING'
  | 'INVALID_RECEIVABLE_ACCOUNT'
  | 'EVIDENCE_LIMIT_EXCEEDED'
  | 'ORIGIN_ALLOCATION_UNAVAILABLE'
  | 'TAX_TREATMENT_UNAPPROVED'
  | 'RECONCILIATION_DIFFERENCE'
  | 'HISTORICAL_MAPPING_UNAVAILABLE'
  | 'ACCOUNTING_POLICY_MISSING'
  | 'ACCOUNTING_POLICY_AMBIGUOUS'
  | 'ACCOUNTING_POLICY_UNAPPROVED'
  | 'ACCOUNTING_POLICY_INVALID'
  | 'OUTSTANDING_AMOUNT_UNKNOWN'
  | 'RECLASSIFICATION_EVIDENCE_UNVERIFIED'
  | 'NATIVE_ADJUSTMENT_INTEGRATION_UNVERIFIED'
  | 'ORIGINAL_ASSESSMENT_UNAVAILABLE'
  | 'STALE_SOURCE_EVIDENCE'
  | 'REVERSED_WRITE_OFF'
  | 'REVERSAL_JOURNAL_LINEAGE_UNAVAILABLE'
  | 'RECOVERY_AFTER_WRITE_OFF'
  | 'ACCOUNTING_PERIOD_TREATMENT_UNAPPROVED';
export type State =
  'VERIFIED_PREVIEW' | 'INCOMPLETE_EVIDENCE' | 'BLOCKED_PENDING_ACCOUNTING_POLICY' | 'RECONCILIATION_REQUIRED';
export type AdjustmentKind =
  'JOURNAL_ADJUSTMENT' | 'NPA_RECLASSIFICATION' | 'NPA_RECLASSIFICATION_REVERSAL' | 'NATIVE_WRITE_OFF_REVERSAL';
export interface Capabilities {
  eligibilityDiagnostics: boolean;
  historicalNpaEvidence: boolean;
  receivableClassification: boolean;
  feeAndTaxClassification: boolean;
  writeOffPreview: boolean;
  historicalAssessments: boolean;
  accountingReconciliation: boolean;
  nativeWriteOffInterceptionVerified: boolean;
  financialWriteOffCorrection: boolean;
  correctionControls?: CorrectionCapabilities;
}
export interface Template {
  nativeVersion: string | null;
  capabilities: Capabilities;
  categories: Category[];
  blockerCodes: Reason[];
  historicalEvidenceAvailability: string | null;
}
export interface Balances {
  principal: Money;
  interest: Money;
  fees: Money;
  penalties: Money;
  total: Money;
}
export interface Loan {
  loanId: number;
  clientId: number | null;
  groupId: number | null;
  productId: number;
  officeId: number;
  nativeStatus: number;
  currentNpa: boolean;
  chargedOff: boolean;
  accountingRule: number;
  currency: string | null;
  currencyDigits: number;
  submittedOn: string | null;
  disbursedOn: string | null;
  writtenOffOn: string | null;
  businessDate: string | null;
  currentOutstanding: Balances;
}
export interface Eligibility {
  loan: Loan;
  diagnosticEligible: boolean;
  nativeWriteOffCandidate: boolean;
  financiallyExecutable: boolean;
  blockers: Reason[];
}
export interface Period {
  from: string | null;
  through: string | null;
  state: Classification;
  source: string | null;
}
export interface Transition {
  date: string | null;
  npa: boolean;
  sourceReference: string | null;
}
export interface History {
  currentNpa: boolean;
  observedOn: string | null;
  confirmedTransitions: Transition[];
  knownPeriods: Period[];
  unknownPeriods: Period[];
  blockers: Reason[];
}
export interface Mapping {
  mappingId: number;
  financialAccountType: number;
  accountId: number | null;
  chargeId: number | null;
  paymentType: number | null;
  chargeOffReason: number | null;
  writeOffReason: number | null;
  capitalizedClassification: number | null;
  buydownClassification: number | null;
  accountType: number | null;
  accountUsage: number | null;
  disabled: boolean | null;
}
export interface Transaction {
  id: number;
  type: number;
  date: string | null;
  submittedOn: string | null;
  reversed: boolean;
  amount: Money;
  principal: Money;
  interest: Money;
  fees: Money;
  penalties: Money;
  reversedOn: string | null;
  createdAt: string | null;
  modifiedAt: string | null;
}
export interface Relation {
  id: number;
  fromTransaction: number;
  toTransaction: number | null;
  toCharge: number | null;
  type: number;
}
export interface Journal {
  id: number;
  loanTransactionId: number | null;
  postingReference: string | null;
  accountId: number;
  date: string | null;
  direction: number;
  amount: Money;
  currency: string | null;
  reversed: boolean;
  reversalId: number | null;
  manualEntry: boolean;
  submittedOn: string | null;
  createdAt: string | null;
  modifiedAt: string | null;
}
export interface Charge {
  id: number;
  chargeId: number;
  penalty: boolean;
  active: boolean;
  waived: boolean;
  amount: Money;
  paid: Money;
  waivedAmount: Money;
  writtenOff: Money;
  outstanding: Money;
  tax: Money;
  currency: string | null;
}
export interface ChargePayment {
  id: number;
  transactionId: number;
  loanChargeId: number;
  amount: Money;
}
export interface Tax {
  id: number;
  loanChargeId: number;
  taxComponentId: number;
  amount: Money;
  debitAccountId: number | null;
  creditAccountId: number | null;
}
export interface Evidence {
  loan: Loan;
  mappings: Mapping[];
  transactions: Transaction[];
  relations: Relation[];
  journals: Journal[];
  charges: Charge[];
  chargePayments: ChargePayment[];
  taxes: Tax[];
  truncated: boolean;
}
export interface AccountBucket {
  category: Category;
  currentClassification: Classification;
  mappingStatus: MappingStatus;
  mappingIds: number[];
  accountIds: number[];
  journalIds: number[];
  transactionIds: number[];
  netGlReceivable: Money;
  expenseEligible: Money;
  historicalOrigin: Classification;
}
export interface Reconciliation {
  category: Category;
  currentNativeOutstanding: Money;
  mappedGlBalance: Money;
  difference: Money;
  status: ReconciliationStatus;
}
export interface Preview {
  schemaVersion: string | null;
  tenant: string | null;
  asOf: string | null;
  calculatedAt: string | null;
  loan: Loan;
  history: History;
  receivables: AccountBucket[];
  reconciliation: Reconciliation[];
  possibleReclassifications: Journal[];
  reclassificationStatus: ReclassificationStatus;
  proposedReceivableExpense: Money;
  state: State;
  financiallyExecutable: boolean;
  blockers: Reason[];
  sourceFingerprint: string | null;
  mappingFingerprint: string | null;
  evidence: Evidence;
}
export interface Assessment {
  sequence: number;
  id: string | null;
  loanId: number;
  productId: number;
  officeId: number;
  actorId: number;
  businessDate: string | null;
  recordedAt: string | null;
  supersedesAssessmentId: string | null;
  correctionReason: string | null;
  result: Preview;
}
export interface AssessmentSummary {
  sequence: number;
  id: string | null;
  actorId: number;
  asOf: string | null;
  recordedAt: string | null;
  sourceFingerprint: string | null;
}
export interface PolicyRule {
  category: Category;
  historicalOrigin: Classification;
  currentClassification: Classification;
  sourceAccountId: number;
  nativeMappingId: number | null;
  destinationAccountId: number;
  expenseEligible: boolean | null;
  reclassifiedExpenseEligible: boolean | null;
  taxComponentId: number | null;
}
export interface PolicyDefinition {
  version: number;
  accountingRule: number;
  currency: string | null;
  effectiveFrom: string | null;
  effectiveThrough: string | null;
  approvalReference: string | null;
  rules: PolicyRule[];
}
export interface PolicyApproval {
  policyId: string | null;
  makerId: number;
  mappingFingerprint: string | null;
  accountFingerprint: string | null;
  approvalReference: string | null;
}
export interface PolicyResolution {
  policyId: string | null;
  definition: PolicyDefinition | null;
  explicitlyApproved: boolean;
  mappingsValidated: boolean;
  financiallyExecutable: boolean;
  blockers: Reason[];
}
export interface ExpenseCategory {
  category: Category;
  outstanding: Money;
  regularOutstanding: Money;
  npaOutstanding: Money;
  reclassifiedNpa: Money;
  eligible: Money;
  excluded: Money;
  blockers: Reason[];
}
export interface ExpenseAttribution {
  categories: ExpenseCategory[];
  principalExpense: Money;
  eligibleReceivables: Money;
  excludedReceivables: Money;
  totalExpense: Money;
  financiallyExecutable: boolean;
  blockers: Reason[];
}
export interface CorrectionCapabilities {
  npaAccountingPolicyVerified: boolean;
  npaHistoricalAttribution: boolean;
  nativeReclassification: boolean;
  correctedWriteOffExecution: boolean;
  nativeJournalReconciliation: boolean;
  legacyLoanReconciliation: boolean;
  adjustmentProposalSupport: boolean;
  financialAdjustmentExecution: boolean;
  reversalIntegration: boolean;
  blockers: Reason[];
}
export interface JournalComparison {
  category: Category;
  accountId: number | null;
  journalIds: number[];
  transactionPortion: Money;
  expected: Money;
  actual: Money;
  difference: Money;
  state: string | null;
  blockers: Reason[];
}
export interface WriteOffReconciliation {
  transactionId: number;
  writeOffDate: string | null;
  reversed: boolean;
  journalIds: number[];
  reversalJournalIds: number[];
  recoveryTransactionIds: number[];
  nativeWriteOffAmount: Money;
  actualExpenseDebit: Money;
  expectedExpenseDebit: Money;
  expenseDifference: Money;
  categories: JournalComparison[];
  state: string | null;
  blockers: Reason[];
}
export interface ReclassificationEvidence {
  state: string | null;
  candidates: Journal[];
  blockers: Reason[];
}
export interface AccountingPeriod {
  latestClosedThrough: string | null;
  calculationDateOpen: boolean;
  adjustmentPeriodTreatmentApproved: boolean;
}
export interface CorrectionReview {
  loanId: number;
  calculationDate: string | null;
  calculatedAt: string | null;
  originalAssessmentId: string | null;
  policy: PolicyResolution;
  attribution: ExpenseAttribution;
  writeOffs: WriteOffReconciliation[];
  reclassification: ReclassificationEvidence;
  capabilities: CorrectionCapabilities;
  sourceFingerprint: string | null;
  mappingFingerprint: string | null;
  evidence: Evidence;
  accountingPeriod: AccountingPeriod;
  blockers: Reason[];
}
export interface AdjustmentProposal {
  state: string | null;
  operation: AdjustmentKind;
  reason: string | null;
  reconciliationId: string | null;
  supersedesId: string | null;
  financiallyExecutable: boolean;
  review: CorrectionReview;
  blockers: Reason[];
}

export interface SaveAssessmentRequest {
  idempotencyKey: string;
  asOf: string;
  supersedesAssessmentId?: string;
  correctionReason?: string;
}
export interface ReconciliationRequest {
  idempotencyKey: string;
  assessmentId?: string;
  supersedesId?: string;
  reason?: string;
}
export interface ProposalRequest {
  idempotencyKey: string;
  reconciliationId: string;
  reason: string;
  supersedesId?: string;
  operation: AdjustmentKind;
}
export interface PolicyDraftRequest {
  idempotencyKey: string;
  policy: PolicyDefinition;
}
export interface PolicyApprovalRequest {
  idempotencyKey: string;
  approvalReference: string;
}
export interface ControlRecord<T> {
  sequence: number;
  id: string;
  kind: string;
  loanId: number;
  productId: number;
  officeId: number;
  actorId: number;
  businessDate: string;
  recordedAt: string;
  parentId: string | null;
  sourceFingerprint: string;
  request: ControlRequest;
  result: T;
}
export interface ControlRequest {
  idempotencyKey: string;
  policy?: PolicyDefinition;
  approvalReference?: string;
  assessmentId?: string;
  supersedesId?: string;
  reason?: string;
  reconciliationId?: string;
  operation?: AdjustmentKind;
}
export type PolicyEvent = ControlRecord<PolicyDefinition | PolicyApproval>;
