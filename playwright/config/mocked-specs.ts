/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Browser specs that stub every `/fineract-provider` call with
 * `page.route` and seed their own session, so they need no backend, no
 * global readiness probe and no `setup` login.
 *
 * `playwright.config.ts` runs these in the `mocked` project and makes
 * the `chromium` project ignore them. Both projects read this one list,
 * so a spec can never run in both or fall out of both.
 *
 * Only add a spec here when it makes no real backend call: no
 * factories, no `request` fixture calls to Fineract and no
 * `route.continue()` that reaches the network. A spec left off the list
 * still runs, just in the slower backend job.
 */
export const MOCKED_SPECS: string[] = [
  'audit-workspace.spec.ts',
  'backend-info-status-bar.spec.ts',
  'cash-allocation-readiness.spec.ts',
  'cash-register-closing.spec.ts',
  'checker-inbox-workspace.spec.ts',
  'client-approval-workspace.spec.ts',
  'clients/account-management.contract.spec.ts',
  'clients/address-location.spec.ts',
  'commercial-pipeline.spec.ts',
  'kyc/export-kyc.spec.ts',
  'loan-approval-workspace.spec.ts',
  'loans/loan-documents.spec.ts',
  'login-connection-card.spec.ts',
  'mass-rejection.spec.ts',
  'organization/office-address.contract.spec.ts',
  'organization/office-change-history.contract.spec.ts',
  'organization/office-hours.contract.spec.ts',
  'organization/office-services.contract.spec.ts',
  'savings-deposit-confirmation.spec.ts',
  'savings-deposit-details.spec.ts',
  'savings-deposit-selection.spec.ts',
  'savings/unified-savings-integration.contract.spec.ts'
].map((spec) => `**/playwright/tests/${spec}`);
