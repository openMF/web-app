/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PolicyCapabilities, ProductPolicy } from './product-policy.model';

export const capabilities: PolicyCapabilities = {
  draftConfiguration: true,
  activation: true,
  financialEnforcement: false,
  clabeGeneration: false,
  classifications: [
    'SIGHT',
    'INTEREST_BEARING_SIGHT',
    'SAVINGS'
  ],
  purposes: [
    'MAIN',
    'GUARANTEED',
    'PLANNED_MAIN',
    'POCKET'
  ],
  multiplicities: [
    'SINGLE',
    'UNLIMITED'
  ],
  freezingModes: [
    'NONE',
    'TERM',
    'LOAN_RELEASE'
  ],
  interestModes: [
    'NONE',
    'FIXED',
    'TIERED',
    'REFERENCE_RATE'
  ],
  pendingFeatures: ['INTEREST_CALCULATION']
};
export const policy: ProductPolicy = {
  classification: 'SIGHT',
  purpose: 'MAIN',
  withdrawalsAllowed: true,
  depositsAllowed: true,
  liquidGuarantee: false,
  maximumBalance: '9999999999999.99',
  minimumMonthlyAverageBalance: '0',
  feeApplicable: false,
  feeChargeId: null,
  freezing: 'NONE',
  freezingTermDays: null,
  directDebitForLoanPayment: false,
  multiplicity: 'SINGLE',
  accountDesignation: 'Main account',
  additionalPaymentReference: false,
  paymentReferencePartner: null,
  interestMode: 'NONE',
  interestMatrix: null,
  referenceRate: null
};
