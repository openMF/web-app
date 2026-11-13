/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type {
  IsrCapabilities,
  IsrSources,
  IsrPreview,
  IsrEligibility,
  IsrCalculation,
  IsrReconciliation
} from '../../src/app/clients/clients-view/account-management/consolidated-isr.model';

/** Synthetic BE-11 blocked diagnostics, never evidence of financial correctness. */
export const isrId = 'd4a2587e-564a-4bb8-92f8-ad15ded9a400';
export const isrPeriod = { from: '2026-11-01', through: '2026-11-12' };
export const isrCapabilities: IsrCapabilities = {
  eligibilityDiagnostics: true,
  nativeBalanceObservations: true,
  consolidatedBalanceRetrieval: false,
  draftRuleVersions: true,
  approvedTaxRules: false,
  calculation: false,
  allocation: false,
  withholdingExecution: false,
  accountingIntegrationVerified: false,
  historicalSnapshots: true,
  historicalReconciliation: true,
  diagnosticClassifications: [
    'SAVINGS',
    'INTEREST_BEARING_SIGHT'
  ],
  blockers: [
    'ISR_POLICY_NOT_APPROVED',
    'NATIVE_ACCOUNTING_INTEGRATION_UNVERIFIED'
  ]
};
export function isrSources(clientId = 7): IsrSources {
  return {
    accounts: [
      {
        accountId: 18,
        productId: 4,
        clientId,
        officeId: 1,
        depositType: 100,
        status: 300,
        subStatus: 0,
        activatedOn: '2026-01-01',
        closedOn: null,
        currency: 'MXN',
        currencyDigits: 2,
        policyVersion: 2,
        classification: 'SAVINGS',
        purpose: 'MAIN',
        mainAccountId: null,
        nativeWithholdTax: true,
        taxGroupId: 1,
        accountingType: 3,
        observedLedgerBalance: '100.25',
        policyEvidenceHash: 'fixture',
        structurallySupported: true,
        eligible: false,
        reasons: [
          'ISR_POLICY_NOT_APPROVED',
          'TAX_PROFILE_UNVERIFIED'
        ]
      },
      {
        accountId: 22,
        productId: 5,
        clientId,
        officeId: 1,
        depositType: 100,
        status: 300,
        subStatus: 0,
        activatedOn: '2026-01-01',
        closedOn: null,
        currency: 'USD',
        currencyDigits: 2,
        policyVersion: null,
        classification: null,
        purpose: null,
        mainAccountId: null,
        nativeWithholdTax: false,
        taxGroupId: null,
        accountingType: 3,
        observedLedgerBalance: '88.25',
        policyEvidenceHash: null,
        structurallySupported: false,
        eligible: false,
        reasons: [
          'PRODUCT_POLICY_UNAVAILABLE',
          'ACCOUNT_CLASSIFICATION_UNSUPPORTED'
        ]
      }
    ],
    transactions: [
      {
        id: 30,
        accountId: 18,
        type: 17,
        date: '2026-11-05',
        amount: '0.25',
        reversed: false,
        reversal: false,
        originalTransactionId: null,
        runningBalance: '100.25'
      }
    ],
    taxDetails: [{ id: 1, transactionId: 30, componentId: 1, amount: '0.25' }],
    observations: [
      {
        currency: 'MXN',
        currencyDigits: 2,
        accountCount: 1,
        observedLedgerBalance: '100.25',
        nativePostedInterest: '1.50',
        nativeWithheldTax: '0.25'
      },
      {
        currency: 'USD',
        currencyDigits: 2,
        accountCount: 1,
        observedLedgerBalance: '88.25',
        nativePostedInterest: '0.00',
        nativeWithheldTax: '0.00'
      }
    ],
    complete: true,
    reasons: [
      'CURRENCY_AGGREGATION_UNAPPROVED',
      'HISTORICAL_BALANCE_BASIS_UNAPPROVED'
    ],
    fingerprint: 'fixture-snapshot'
  };
}
export function isrPreview(clientId = 7): IsrPreview {
  return {
    clientId,
    businessDate: '2026-11-12',
    taxPeriod: { ...isrPeriod },
    observedAt: '2026-11-12T08:00:00Z',
    profile: {
      clientId,
      tenant: 'default',
      legalForm: 1,
      jurisdiction: null,
      taxTreatment: null,
      ruleId: null,
      ruleVersion: null,
      currency: null,
      status: 'UNVERIFIED',
      eligibleAccounts: []
    },
    sources: isrSources(clientId),
    state: 'BLOCKED_PENDING_POLICY',
    taxableBase: null,
    calculatedIsr: null,
    actualWithheldAmount: null,
    allocations: [],
    nativeReferences: [],
    blockers: [
      'ISR_POLICY_NOT_APPROVED',
      'TAX_PROFILE_UNVERIFIED'
    ]
  };
}
export function isrEligibility(clientId = 7): IsrEligibility {
  const preview = isrPreview(clientId);
  return {
    clientId,
    period: { ...isrPeriod },
    state: preview.state,
    profile: preview.profile,
    accounts: preview.sources.accounts,
    populationComplete: true,
    blockers: preview.blockers
  };
}
export function isrCalculation(clientId = 7): IsrCalculation {
  return {
    calculationId: isrId,
    tenant: 'default',
    clientId,
    actorId: 1,
    recordedAt: '2026-11-12T08:00:00Z',
    supersedes: null,
    correctionReason: null,
    result: isrPreview(clientId)
  };
}
export const isrReconciliation: IsrReconciliation = {
  calculationId: isrId,
  status: 'RECONCILIATION_REQUIRED',
  savedFingerprint: 'fixture-snapshot',
  currentFingerprint: 'fixture-changed',
  checkedAt: '2026-11-12T09:00:00Z',
  blockers: [
    'SOURCE_DATA_CHANGED',
    'ISR_POLICY_NOT_APPROVED'
  ],
  accountingVerified: false,
  financialRetryAllowed: false
};
/** Wire fixtures retain BE-11 numeric JSON money; application models retain exact strings. */
export function isrWireJson(data: unknown): string {
  return JSON.stringify(data).replace(
    /"(observedLedgerBalance|nativePostedInterest|nativeWithheldTax|amount|runningBalance)":"(-?\d+(?:\.\d+)?)"/g,
    '"$1":$2'
  );
}
