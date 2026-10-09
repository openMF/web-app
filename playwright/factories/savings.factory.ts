/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for a Fineract savings account owned by the current
 * Playwright test.
 *
 * Mirrors `loan.factory.ts` exactly — three state variants building on
 * each other:
 *
 *  - {@link createTestSavingsAccount} — "Submitted and pending approval".
 *  - {@link createApprovedSavingsAccount} — approved, not yet activated.
 *  - {@link createActiveSavingsAccount} — approved AND activated (Active).
 *
 * Requires an ACTIVE client for the same reason as the loan factory:
 * Fineract rejects a savings application against a pending client.
 *
 * Cleanup caveat: identical to the loan factory. Fineract only
 * hard-deletes a savings account while "Submitted and pending
 * approval"; the deleter registered for the approved/active variants
 * is expected to fail and is recorded by the `CleanupGuard` without
 * throwing.
 *
 * Portability note: zero Angular/Playwright-page imports. The React
 * port can adopt this file verbatim.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import type { TestSavingsAccount } from '../types/test-data.types';
import { DEFAULT_ACCOUNT_OPENING_DATE } from './client.factory';
import { resolveProductId } from './_shared';

/**
 * Name of the shared minimal savings product seeded by
 * `ApiSetupManager#ensureMinimalSavingsProduct`.
 *
 * Exported so UI specs can pick the same product from the create-account
 * dropdown that the API factories attach by id. Hard-coding the string in
 * both places is how the two drift apart after a product rename.
 */
export const E2E_SAVINGS_PRODUCT_NAME = 'E2E Savings Product';

/** Caller-supplied tweaks accepted by every savings factory in this module. */
export interface CreateTestSavingsAccountOverrides {
  /** Fineract savings product id. Defaults to the shared minimal E2E product. */
  savingsProductId?: number;
  /**
   * Submitted-on date. Defaults to {@link DEFAULT_ACCOUNT_OPENING_DATE},
   * matching the loan factory's default so specs combining both
   * account types don't need to reconcile two separate date constants.
   */
  submittedOnDate?: string;
  /** Approval date. Defaults to `submittedOnDate`. */
  approvedOnDate?: string;
  /** Activation date. Defaults to `approvedOnDate`. */
  activatedOnDate?: string;
}

/**
 * Re-read a savings account after a state transition and project it.
 *
 * Fineract's `approve` / `activate` command responses carry only a thin
 * `{ officeId, clientId, savingsId, resourceId, changes }` envelope —
 * no `status` and no `timeline`. Projecting off that envelope produced
 * a `TestSavingsAccount` whose `status` and `timeline` were always
 * `undefined`, so any spec asserting on them would read a hole rather
 * than server state. One extra GET keeps the projection honest.
 */
async function refetchSavingsAccount(
  setup: ApiSetupManager,
  savingsId: number,
  clientId: number,
  savingsProductId: number
): Promise<TestSavingsAccount> {
  const account = await setup.api.getSavingsAccount(savingsId);
  return {
    resourceId: savingsId,
    displayName: `Savings #${savingsId}`,
    clientId,
    savingsProductId,
    status: account.status,
    timeline: account.timeline
  };
}

/**
 * Create a savings account in "Submitted and pending approval" state
 * and queue its deletion on the supplied {@link CleanupGuard}.
 *
 * Delegates the actual create call to
 * `FineractApiClient#createSavingsAccountForClient`, which derives the
 * five required interest fields from the product template — see that
 * method's docstring for why hand-writing them per call site is the
 * most common source of create-account 400s.
 *
 * @param setup    The per-test {@link ApiSetupManager}.
 * @param guard    The per-test {@link CleanupGuard}.
 * @param clientId - resourceId of an ACTIVE client (see module docstring).
 * @param overrides See {@link CreateTestSavingsAccountOverrides}.
 */
export async function createTestSavingsAccount(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestSavingsAccountOverrides = {}
): Promise<TestSavingsAccount> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;

  let savingsProductId = overrides.savingsProductId;
  if (savingsProductId === undefined) {
    savingsProductId = resolveProductId(await setup.ensureMinimalSavingsProduct(), 'savings.factory');
  }

  const response = await setup.api.createSavingsAccountForClient(clientId, submittedOnDate, savingsProductId);
  const savingsId: number = response.savingsId ?? response.resourceId;
  if (typeof savingsId !== 'number') {
    throw new Error(
      `createTestSavingsAccount: Fineract create-savings-account response missing numeric savingsId/resourceId, got ${JSON.stringify(
        response
      )}`
    );
  }

  guard.register(`savings:${savingsId}`, async () => {
    await setup.api.deleteSavingsAccount(savingsId);
  });

  return {
    resourceId: savingsId,
    displayName: `Savings #${savingsId}`,
    clientId,
    savingsProductId
  };
}

/**
 * Create a savings account and approve it. Builds on
 * {@link createTestSavingsAccount} — the same deleter is reused.
 */
export async function createApprovedSavingsAccount(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestSavingsAccountOverrides = {}
): Promise<TestSavingsAccount> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;
  const approvedOnDate = overrides.approvedOnDate ?? submittedOnDate;

  const account = await createTestSavingsAccount(setup, guard, clientId, { ...overrides, submittedOnDate });
  await setup.api.approveSavingsAccount(account.resourceId, approvedOnDate);
  return refetchSavingsAccount(setup, account.resourceId, clientId, account.savingsProductId);
}

/**
 * Create, approve, AND activate a savings account (Active state).
 *
 * Cleanup for this variant is expected to fail — Fineract will not
 * hard-delete an activated savings account.
 */
export async function createActiveSavingsAccount(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestSavingsAccountOverrides = {}
): Promise<TestSavingsAccount> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;
  const approvedOnDate = overrides.approvedOnDate ?? submittedOnDate;
  const activatedOnDate = overrides.activatedOnDate ?? approvedOnDate;

  const account = await createApprovedSavingsAccount(setup, guard, clientId, {
    ...overrides,
    submittedOnDate,
    approvedOnDate
  });
  await setup.api.activateSavingsAccount(account.resourceId, activatedOnDate);
  return refetchSavingsAccount(setup, account.resourceId, clientId, account.savingsProductId);
}
