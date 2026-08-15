/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import { createActiveTestClient } from './client.factory';
import { createTestSavingsAccount, createApprovedSavingsAccount, createActiveSavingsAccount } from './savings.factory';

// Live-backend specs — `integration` Playwright project. No browser.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('createTestSavingsAccount() against live Fineract', () => {
  test('creates an account in Submitted and pending approval', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createTestSavingsAccount(apiSetup, cleanupGuard, client.resourceId);

    expect(typeof account.resourceId).toBe('number');
    expect(account.resourceId).toBeGreaterThan(0);
    expect(account.clientId).toBe(client.resourceId);
    // Same regression guard as the loan factory: `ensureMinimalSavingsProduct`
    // spells the key `id`, and reading `resourceId` yielded `undefined`.
    expect(account.savingsProductId).toBeGreaterThan(0);

    const fetched = await apiSetup.api.getSavingsAccount(account.resourceId);
    expect(fetched.id).toBe(account.resourceId);
    expect(fetched.status?.value).toBe('Submitted and pending approval');
    expect(fetched.savingsProductId).toBe(account.savingsProductId);
  });

  test('hard-deletes a pending account on flush', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createTestSavingsAccount(apiSetup, cleanupGuard, client.resourceId);
    expect(cleanupGuard.size()).toBe(2);

    const summary = await cleanupGuard.flush();
    // Scoped to the savings deleter on purpose. The owning client is
    // ACTIVE, and Fineract only hard-deletes clients in Pending state,
    // so that entry is an expected failure and asserting an empty
    // `failed` array would be asserting the wrong thing.
    expect(summary.failed.some((entry) => entry.label === `savings:${account.resourceId}`)).toBe(false);
    await expect(apiSetup.api.getSavingsAccount(account.resourceId)).rejects.toThrow(/404|not found/i);
  });
});

test.describe('createApprovedSavingsAccount() against live Fineract', () => {
  test('returns server state rather than the command envelope', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createApprovedSavingsAccount(apiSetup, cleanupGuard, client.resourceId);

    // Fineract's approve response carries no status/timeline; these
    // only pass because the factory re-reads the account afterwards.
    expect(account.status?.value).toBe('Approved');
    expect(account.timeline?.approvedOnDate).toBeTruthy();
  });
});

test.describe('createActiveSavingsAccount() against live Fineract', () => {
  test('activates the account and reports Active status', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createActiveSavingsAccount(apiSetup, cleanupGuard, client.resourceId);

    expect(account.status?.value).toBe('Active');
    expect(account.timeline?.activatedOnDate).toBeTruthy();

    const fetched = await apiSetup.api.getSavingsAccount(account.resourceId);
    expect(fetched.status?.value).toBe('Active');
  });

  test('records the expected-to-fail deleter without throwing', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createActiveSavingsAccount(apiSetup, cleanupGuard, client.resourceId);

    // Fineract will not hard-delete an activated savings account. The
    // guard must record that as a failure, not throw and mask the test.
    // Scope the assertion to the account's own deleter — the active
    // client also fails to delete, so a bare `failed.length > 0` would
    // still pass if this deleter were missing or had succeeded.
    const summary = await cleanupGuard.flush();
    expect(summary.failed.some((entry) => entry.label === `savings:${account.resourceId}`)).toBe(true);
  });
});
