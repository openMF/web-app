/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import { createTestClient, DEFAULT_TEST_CLIENT_LASTNAME } from './client.factory';
import { E2E_NAME_PATTERN } from '../utils/naming';

// Live-backend specs — run under the `integration` Playwright project
// (testMatch: /playwright\/factories\/.*\.spec\.ts/ in
// playwright.config.ts). No browser, no auth-setup dependency; the
// tests issue HTTP directly against the Fineract endpoint configured
// via the existing `fineractApi` fixture.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('createTestClient() against live Fineract', () => {
  test('creates a pending client matching the TestClient shape', async ({ apiSetup, cleanupGuard }) => {
    const client = await createTestClient(apiSetup, cleanupGuard);

    expect(typeof client.resourceId).toBe('number');
    expect(client.resourceId).toBeGreaterThan(0);
    expect(client.officeId).toBeGreaterThan(0);
    // Default display name is `<generatedFirstname> <lastname>` —
    // assert both halves so a regression that drops the suffix is caught.
    expect(client.displayName.startsWith('E2E_client_S')).toBe(true);
    expect(client.displayName.endsWith(` ${DEFAULT_TEST_CLIENT_LASTNAME}`)).toBe(true);
    const firstname = client.displayName.split(' ')[0];
    expect(firstname).toMatch(E2E_NAME_PATTERN);

    // Round-trip the create through the GET endpoint to confirm
    // Fineract really persisted what the projection claims.
    const fetched = await apiSetup.api.getClient(client.resourceId);
    expect(fetched.id).toBe(client.resourceId);
    expect(fetched.displayName).toBe(client.displayName);
    expect(fetched.officeId).toBe(client.officeId);
    expect(fetched.active).toBe(false);
    expect(fetched.status?.value).toBe('Pending');
  });

  test('honours firstname / lastname / submittedOnDate overrides', async ({ apiSetup, cleanupGuard }) => {
    const client = await createTestClient(apiSetup, cleanupGuard, {
      firstname: 'OverrideF',
      lastname: 'OverrideL',
      submittedOnDate: '15 March 2024'
    });
    expect(client.displayName).toBe('OverrideF OverrideL');
    const fetched = await apiSetup.api.getClient(client.resourceId);
    expect(fetched.timeline?.submittedOnDate).toEqual([
      2024,
      3,
      15
    ]);
  });

  test('queues a working deleter on the cleanup-guard', async ({ apiSetup, cleanupGuard }) => {
    const client = await createTestClient(apiSetup, cleanupGuard);
    expect(cleanupGuard.size()).toBe(1);

    const summary = await cleanupGuard.flush();
    expect(summary.ok).toBe(1);
    expect(summary.failed).toEqual([]);

    // Confirm Fineract really hard-deleted the row by asserting the
    // subsequent GET 404s. We catch via try/catch instead of
    // `expect(...).rejects.toThrow()` because `getClient` throws a
    // plain `Error` with the 404 status embedded in the message.
    await expect(apiSetup.api.getClient(client.resourceId)).rejects.toThrow(/404|not found/i);
  });
});
