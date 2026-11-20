/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
  AccountBucket,
  Category,
  Classification,
  CorrectionReview,
  Eligibility,
  Evidence,
  ExpenseCategory,
  History,
  Loan,
  Preview,
  Template
} from '../../models/anpa-accounting.model';
// Small synthetic unit fixtures. Full recorded API responses stay outside the source tree;
// the separate live Playwright suite verifies the deployed backend contract.
const loan: Loan = {
  loanId: 2,
  clientId: 2,
  groupId: null,
  productId: 2,
  officeId: 1,
  nativeStatus: 300,
  currentNpa: false,
  chargedOff: false,
  accountingRule: 4,
  currency: 'USD',
  currencyDigits: 2,
  submittedOn: '2026-01-01',
  disbursedOn: '2026-01-01',
  writtenOffOn: '2026-11-14',
  businessDate: '2026-11-15',
  currentOutstanding: {
    principal: 985,
    interest: 110,
    fees: 0,
    penalties: 0,
    total: 1095
  }
};
export const npaHistory: History = {
  currentNpa: false,
  observedOn: '2026-11-15',
  confirmedTransitions: [],
  knownPeriods: [],
  unknownPeriods: [
    {
      from: '2026-01-01',
      through: '2026-11-15',
      state: 'UNKNOWN',
      source: 'No authoritative NPA transition history in native bc1c598'
    }
  ],
  blockers: [
    'NPA_HISTORY_UNAVAILABLE'
  ]
};
function bucket(
  category: Category,
  currentClassification: Classification,
  values: Partial<AccountBucket> = {}
): AccountBucket {
  return {
    category,
    currentClassification,
    historicalOrigin: 'UNKNOWN',
    mappingStatus: 'NATIVE_MAPPING_UNAVAILABLE',
    mappingIds: [],
    accountIds: [],
    journalIds: [],
    transactionIds: [],
    netGlReceivable: null,
    expenseEligible: null,
    ...values
  };
}
const receivables: AccountBucket[] = [
  bucket('PRINCIPAL', 'NATIVE_UNSEGREGATED', {
    mappingStatus: 'NATIVE_UNSEGREGATED',
    mappingIds: [23],
    accountIds: [12],
    journalIds: [
      22,
      26
    ],
    transactionIds: [
      8,
      10
    ],
    netGlReceivable: 985
  }),
  bucket('INTEREST', 'NATIVE_UNSEGREGATED', {
    mappingStatus: 'NATIVE_UNSEGREGATED',
    mappingIds: [25],
    accountIds: [13],
    journalIds: [
      24,
      27
    ],
    transactionIds: [
      9,
      10
    ],
    netGlReceivable: 110
  }),
  bucket('INTEREST', 'REGULAR', { mappingStatus: 'APPROVED_SEGREGATION_UNAVAILABLE' }),
  bucket('INTEREST', 'NPA', { mappingStatus: 'NATIVE_MAPPING_UNAVAILABLE' }),
  bucket('FEE_COMMISSION', 'NATIVE_UNSEGREGATED', {
    mappingStatus: 'NATIVE_UNSEGREGATED',
    mappingIds: [26],
    accountIds: [14]
  }),
  bucket('PENALTY', 'NATIVE_UNSEGREGATED', {
    mappingStatus: 'NATIVE_UNSEGREGATED',
    mappingIds: [27],
    accountIds: [15]
  }),
  bucket('ITBMS', 'REGULAR', { mappingStatus: 'UNAPPROVED_TAX_SEMANTICS' }),
  bucket('OTHER', 'UNKNOWN', { mappingStatus: 'UNCLASSIFIED_SOURCE' })
];
const evidence: Evidence = {
  loan,
  mappings: [],
  transactions: [],
  relations: [],
  journals: [
    {
      id: 22,
      loanTransactionId: 8,
      postingReference: 'L8',
      accountId: 12,
      date: '2026-01-01',
      direction: 2,
      amount: 1000,
      currency: 'USD',
      reversed: false,
      reversalId: null,
      manualEntry: false,
      submittedOn: '2026-11-15',
      createdAt: '2026-11-15T09:14:42.647174Z',
      modifiedAt: '2026-11-15T09:14:42.647174Z'
    }
  ],
  charges: [],
  chargePayments: [],
  taxes: [],
  truncated: false
};
export const preview: Preview = {
  loan,
  history: npaHistory,
  receivables,
  evidence,
  reconciliation: [],
  possibleReclassifications: [],
  schemaVersion: '1',
  tenant: 'default',
  asOf: '2026-11-14',
  calculatedAt: '2026-11-15T16:57:36.564407Z',
  reclassificationStatus: 'UNVERIFIED_NO_NATIVE_RECLASSIFICATION_CONTRACT',
  proposedReceivableExpense: null,
  state: 'INCOMPLETE_EVIDENCE',
  financiallyExecutable: false,
  blockers: [
    'HISTORICAL_SNAPSHOT_UNAVAILABLE',
    'NPA_HISTORY_UNAVAILABLE',
    'NPA_RECEIVABLE_MAPPING_MISSING',
    'GL_EVIDENCE_INCOMPLETE',
    'TAX_TREATMENT_UNAPPROVED',
    'ORIGIN_ALLOCATION_UNAVAILABLE',
    'UNAPPROVED_RECLASSIFICATION_RULE',
    'HISTORICAL_MAPPING_UNAVAILABLE',
    'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
  ],
  sourceFingerprint: '292d1c5a8722790d1d97f1bef812e9073605ea6349a12f639cadd0d218eb1c55',
  mappingFingerprint: '28377bc46b4dc43ed16cabf51f95fd3c6cd4c6877033cbf89c6a133ab35b5068'
};
const policy: CorrectionReview['policy'] = {
  policyId: '3fa2b7f7-6e74-436f-b23b-7f69ac5f63ae',
  definition: {
    version: 1,
    accountingRule: 4,
    currency: 'USD',
    effectiveFrom: '2026-01-01',
    effectiveThrough: '2026-11-15',
    approvalReference: 'Synthetic test policy; no financial authorization',
    rules: [
      {
        category: 'INTEREST',
        historicalOrigin: 'REGULAR',
        currentClassification: 'REGULAR',
        sourceAccountId: 3,
        nativeMappingId: 4,
        destinationAccountId: 8,
        expenseEligible: true,
        reclassifiedExpenseEligible: null,
        taxComponentId: null
      }
    ]
  },
  explicitlyApproved: true,
  mappingsValidated: true,
  financiallyExecutable: false,
  blockers: [
    'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
  ]
};
const writtenOffLoan: Loan = {
  ...loan,
  nativeStatus: 601,
  loanId: 1,
  currentOutstanding: { principal: 0, interest: 0, fees: 0, penalties: 0, total: 0 }
};
const correctionCapabilities: CorrectionReview['capabilities'] = {
  npaAccountingPolicyVerified: false,
  npaHistoricalAttribution: false,
  nativeReclassification: false,
  correctedWriteOffExecution: false,
  nativeJournalReconciliation: true,
  legacyLoanReconciliation: true,
  adjustmentProposalSupport: true,
  financialAdjustmentExecution: false,
  reversalIntegration: false,
  blockers: []
};
const reviewBlockers: CorrectionReview['blockers'] = [
  'NPA_HISTORY_UNAVAILABLE',
  'NPA_RECEIVABLE_MAPPING_MISSING',
  'TAX_TREATMENT_UNAPPROVED',
  'GL_EVIDENCE_INCOMPLETE',
  'ORIGIN_ALLOCATION_UNAVAILABLE',
  'UNAPPROVED_RECLASSIFICATION_RULE',
  'HISTORICAL_MAPPING_UNAVAILABLE',
  'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED',
  'OUTSTANDING_AMOUNT_UNKNOWN',
  'ORIGINAL_ASSESSMENT_UNAVAILABLE',
  'RECOVERY_AFTER_WRITE_OFF'
];
export const review: CorrectionReview = {
  policy,
  evidence: { ...evidence, loan: writtenOffLoan },
  loanId: 1,
  calculationDate: '2026-11-15',
  calculatedAt: '2026-11-15T16:57:36.388992Z',
  originalAssessmentId: null,
  sourceFingerprint: 'f4a2cdd061e2b7d79a937bd14fc9dfdd7282440b9cfb4678408508e163061d0f',
  mappingFingerprint: '74006d9a9764057138c8b74332dd4ec05948cd765f837eed646fd9f1ef532681',
  accountingPeriod: {
    latestClosedThrough: '2026-11-14',
    calculationDateOpen: true,
    adjustmentPeriodTreatmentApproved: false
  },
  blockers: reviewBlockers,
  attribution: {
    principalExpense: null,
    eligibleReceivables: null,
    excludedReceivables: null,
    totalExpense: null,
    financiallyExecutable: false,
    blockers: [
      'ORIGIN_ALLOCATION_UNAVAILABLE',
      'OUTSTANDING_AMOUNT_UNKNOWN',
      'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
    ],
    categories: ([
        'PRINCIPAL',
        'INTEREST',
        'FEE_COMMISSION',
        'ITBMS',
        'PENALTY',
        'OTHER'
      ] as Category[]).map((category): ExpenseCategory => ({
      outstanding: 0,
      regularOutstanding: null,
      npaOutstanding: null,
      reclassifiedNpa: null,
      eligible: null,
      excluded: null,
      blockers: ['ORIGIN_ALLOCATION_UNAVAILABLE'],
      category
    }))
  },
  writeOffs: [
    {
      transactionId: 6,
      writeOffDate: '2026-11-14',
      reversed: false,
      journalIds: [
        16,
        17,
        18,
        19
      ],
      reversalJournalIds: [],
      recoveryTransactionIds: [
        7
      ],
      nativeWriteOffAmount: 1160,
      actualExpenseDebit: 1160,
      expectedExpenseDebit: null,
      expenseDifference: null,
      categories: [
        {
          category: 'PRINCIPAL',
          accountId: 2,
          journalIds: [
            16
          ],
          transactionPortion: 1000,
          expected: 1000,
          actual: 1000,
          difference: 0,
          state: 'MATCHED_NATIVE_PORTION_CURRENT_MAPPING',
          blockers: []
        },
        {
          category: 'PENALTY',
          accountId: 5,
          journalIds: [],
          transactionPortion: null,
          expected: null,
          actual: 0,
          difference: null,
          state: 'MISSING_HISTORICAL_EVIDENCE',
          blockers: []
        }
      ],
      state: 'MISSING_HISTORICAL_EVIDENCE',
      blockers: [
        'HISTORICAL_MAPPING_UNAVAILABLE',
        'ORIGINAL_ASSESSMENT_UNAVAILABLE',
        'RECOVERY_AFTER_WRITE_OFF',
        'ORIGIN_ALLOCATION_UNAVAILABLE',
        'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
      ]
    }
  ],
  reclassification: {
    state: 'UNVERIFIED_CANDIDATES_ONLY',
    candidates: [],
    blockers: [
      'RECLASSIFICATION_EVIDENCE_UNVERIFIED',
      'UNAPPROVED_RECLASSIFICATION_RULE',
      'NPA_HISTORY_UNAVAILABLE'
    ]
  },
  capabilities: { ...correctionCapabilities, blockers: reviewBlockers }
};
export const eligibility: Eligibility = {
  diagnosticEligible: true,
  nativeWriteOffCandidate: true,
  financiallyExecutable: false,
  blockers: [
    'NPA_HISTORY_UNAVAILABLE',
    'NPA_RECEIVABLE_MAPPING_MISSING',
    'GL_EVIDENCE_INCOMPLETE',
    'TAX_TREATMENT_UNAPPROVED',
    'ORIGIN_ALLOCATION_UNAVAILABLE',
    'UNAPPROVED_RECLASSIFICATION_RULE',
    'HISTORICAL_MAPPING_UNAVAILABLE',
    'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED'
  ],
  loan
};
export const template: Template = {
  nativeVersion: '0.0.1628-bc1c598',
  capabilities: {
    eligibilityDiagnostics: true,
    historicalNpaEvidence: false,
    receivableClassification: true,
    feeAndTaxClassification: false,
    writeOffPreview: true,
    historicalAssessments: true,
    accountingReconciliation: true,
    nativeWriteOffInterceptionVerified: false,
    financialWriteOffCorrection: false,
    correctionControls: { ...correctionCapabilities, blockers: [
        'ACCOUNTING_POLICY_MISSING',
        'NPA_HISTORY_UNAVAILABLE',
        'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED',
        'NATIVE_ADJUSTMENT_INTEGRATION_UNVERIFIED'
      ] }
  },
  categories: [
    'PRINCIPAL',
    'INTEREST',
    'FEE_COMMISSION',
    'ITBMS',
    'PENALTY',
    'OTHER'
  ],
  blockerCodes: [
    'LOAN_NOT_ELIGIBLE',
    'ACCOUNTING_RULE_UNSUPPORTED',
    'NPA_HISTORY_UNAVAILABLE',
    'RECEIVABLE_MAPPING_MISSING',
    'NPA_RECEIVABLE_MAPPING_MISSING',
    'GL_EVIDENCE_INCOMPLETE',
    'UNAPPROVED_RECLASSIFICATION_RULE',
    'WRITE_OFF_DATE_INVALID',
    'HISTORICAL_SNAPSHOT_UNAVAILABLE',
    'CURRENCY_MISMATCH',
    'NATIVE_WRITE_OFF_INTEGRATION_UNVERIFIED',
    'AMBIGUOUS_MAPPING',
    'INVALID_RECEIVABLE_ACCOUNT',
    'EVIDENCE_LIMIT_EXCEEDED',
    'ORIGIN_ALLOCATION_UNAVAILABLE',
    'TAX_TREATMENT_UNAPPROVED',
    'RECONCILIATION_DIFFERENCE',
    'HISTORICAL_MAPPING_UNAVAILABLE',
    'ACCOUNTING_POLICY_MISSING',
    'ACCOUNTING_POLICY_AMBIGUOUS',
    'ACCOUNTING_POLICY_UNAPPROVED',
    'ACCOUNTING_POLICY_INVALID',
    'OUTSTANDING_AMOUNT_UNKNOWN',
    'RECLASSIFICATION_EVIDENCE_UNVERIFIED',
    'NATIVE_ADJUSTMENT_INTEGRATION_UNVERIFIED',
    'ORIGINAL_ASSESSMENT_UNAVAILABLE',
    'STALE_SOURCE_EVIDENCE',
    'REVERSED_WRITE_OFF',
    'REVERSAL_JOURNAL_LINEAGE_UNAVAILABLE',
    'RECOVERY_AFTER_WRITE_OFF',
    'ACCOUNTING_PERIOD_TREATMENT_UNAPPROVED'
  ],
  historicalEvidenceAvailability:
    'Current flag only; native NPA transition history and NPA receivable segregation unavailable.'
};
