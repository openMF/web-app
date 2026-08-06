/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import { createActiveTestClient } from './client.factory';
import { createTestLoan, createApprovedLoan, createActiveLoan } from './loan.factory';

// Live-backend specs — `integration` Playwright project. No browser.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('createTestLoan() against live Fineract', () => {
  test('creates a loan in Submitted and pending approval', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createTestLoan(apiSetup, cleanupGuard, client.resourceId);

    expect(typeof loan.resourceId).toBe('number');
    expect(loan.resourceId).toBeGreaterThan(0);
    expect(loan.clientId).toBe(client.resourceId);
    // Regression guard: `ensureMinimalLoanProduct` spells the key `id`,
    // not `resourceId`. Reading the wrong one used to yield `undefined`
    // and POST a loan with no product attached.
    expect(loan.loanProductId).toBeGreaterThan(0);

    const fetched = await apiSetup.api.getLoan(loan.resourceId);
    expect(fetched.id).toBe(loan.resourceId);
    expect(fetched.status?.value).toBe('Submitted and pending approval');
    expect(fetched.loanProductId).toBe(loan.loanProductId);
  });

  test('registers deleters for both the loan and its client', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    await createTestLoan(apiSetup, cleanupGuard, client.resourceId);

    // Client first, loan second — the guard drains LIFO so the loan is
    // deleted before its owning client, which is the only order
    // Fineract's foreign keys accept.
    expect(cleanupGuard.size()).toBe(2);
  });

  test('hard-deletes a pending loan on flush', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createTestLoan(apiSetup, cleanupGuard, client.resourceId);

    const summary = await cleanupGuard.flush();
    // Scoped to the loan deleter on purpose. The owning client is
    // ACTIVE, and Fineract only hard-deletes clients in Pending state,
    // so that entry is an expected failure and asserting an empty
    // `failed` array would be asserting the wrong thing.
    expect(summary.failed.some((entry) => entry.label === `loan:${loan.resourceId}`)).toBe(false);
    await expect(apiSetup.api.getLoan(loan.resourceId)).rejects.toThrow(/404|not found/i);
  });
});

test.describe('createApprovedLoan() against live Fineract', () => {
  test('returns server state rather than the command envelope', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createApprovedLoan(apiSetup, cleanupGuard, client.resourceId);

    // Fineract's approve response is a thin `{ loanId, changes }`
    // envelope with no status/timeline/principal. These assertions only
    // pass because the factory re-reads the loan afterwards.
    expect(loan.status?.value).toBe('Approved');
    expect(loan.timeline?.approvedOnDate).toBeTruthy();
    expect(loan.principal).toBeGreaterThan(0);
  });
});

test.describe('createActiveLoan() against live Fineract', () => {
  test('disburses the loan and reports Active status', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createActiveLoan(apiSetup, cleanupGuard, client.resourceId);

    expect(loan.status?.value).toBe('Active');
    expect(loan.timeline?.actualDisbursementDate).toBeTruthy();

    const fetched = await apiSetup.api.getLoan(loan.resourceId);
    expect(fetched.status?.value).toBe('Active');
    // The disbursed amount must match the approved principal — the
    // earlier projection bug silently disbursed 0 here.
    expect(fetched.summary?.principalDisbursed).toBe(loan.principal);
  });

  test('records the expected-to-fail deleter without throwing', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createActiveLoan(apiSetup, cleanupGuard, client.resourceId);

    // Fineract refuses to hard-delete a disbursed loan. The guard is
    // expected to surface that as a recorded failure, not an exception
    // that would mask the real test result. Scope the assertion to the
    // loan's own deleter — the active client also fails to delete, so a
    // bare `failed.length > 0` would still pass if the loan deleter were
    // missing or had unexpectedly succeeded.
    const summary = await cleanupGuard.flush();
    expect(summary.failed.some((entry) => entry.label === `loan:${loan.resourceId}`)).toBe(true);
  });
});
