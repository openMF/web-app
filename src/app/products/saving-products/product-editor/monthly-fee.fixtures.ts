/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MonthlyFeeAssessmentPage, MonthlyFeeCapabilities, MonthlyFeeRun } from './monthly-fee.model';
export const feeCapabilities: MonthlyFeeCapabilities = {
  diagnosticAssessmentSupported: true,
  approvedAverageCalculationSupported: false,
  postingSupported: false,
  collectionSupported: false,
  diagnosticBatchAdapterSupported: true,
  productionScheduleSupported: false,
  accountingReconciliationSupported: false,
  reversalSupported: false,
  fullNativeCoverage: false,
  blockers: ['NATIVE_ACCOUNTING_NOT_VERIFIED']
};
export const feeRun: MonthlyFeeRun = {
  id: 'd705b866-1cad-42ca-bf60-c28e0136205f',
  tenant: 'default',
  period: '2026-10',
  businessDate: '2026-11-08',
  status: 'READY',
  cutoffAccountId: '9223372036854775807',
  afterAccountId: '0',
  evaluated: 0,
  blocked: 0,
  unknown: 0,
  createdBy: '1',
  createdAt: '2026-11-08T12:00:00'
};
export const feePage: MonthlyFeeAssessmentPage = {
  items: [
    {
      accountId: '9007199254740993',
      productId: '42',
      period: '2026-10',
      policyVersion: '3',
      minimumMonthlyAverageBalance: '9999999999999.999999',
      feeChargeId: '6',
      configuredFeeAmount: '100.000001',
      outcome: 'BLOCKED',
      reason: 'FINANCIAL_RULES_UNAPPROVED',
      financialOutcome: 'NOT_ATTEMPTED',
      assessedBy: '1',
      recordedAt: '2026-11-08T12:00:00'
    }
  ],
  nextAfterId: '9007199254740993',
  hasMore: true
};
