/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import { createTestGroup } from './group.factory';
import { E2E_NAME_PATTERN, generateE2EName } from '../utils/naming';

// Live-backend specs — run under the `integration` Playwright project
// (testMatch: /playwright\/factories\/.*\.spec\.ts/ in
// playwright.config.ts). No browser, no auth-setup dependency.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('createTestGroup() against live Fineract', () => {
  test('creates a pending group matching the TestGroup shape', async ({ apiSetup, cleanupGuard }) => {
    const group = await createTestGroup(apiSetup, cleanupGuard);

    expect(typeof group.resourceId).toBe('number');
    expect(group.resourceId).toBeGreaterThan(0);
    expect(group.officeId).toBeGreaterThan(0);
    // displayName is mirrored from `name` for groups — assert the
    // E2E pattern on it directly.
    expect(group.displayName).toMatch(E2E_NAME_PATTERN);
    expect(group.displayName.startsWith('E2E_group_S')).toBe(true);

    // Round-trip the create through the GET endpoint.
    const fetched = await apiSetup.api.getGroup(group.resourceId);
    expect(fetched.id).toBe(group.resourceId);
    expect(fetched.name).toBe(group.displayName);
    expect(fetched.officeId).toBe(group.officeId);
    expect(fetched.active).toBe(false);
    expect(fetched.status?.value).toBe('Pending');
  });

  test('honours name / submittedOnDate overrides', async ({ apiSetup, cleanupGuard }) => {
    // Use generateE2EName so the override embeds shard + timestamp +
    // random token — unique across parallel workers in the same ms.
    const overrideName = generateE2EName('OverrideGroup');
    const group = await createTestGroup(apiSetup, cleanupGuard, {
      name: overrideName,
      submittedOnDate: '15 March 2024'
    });
    expect(group.displayName).toBe(overrideName);
    const fetched = await apiSetup.api.getGroup(group.resourceId);
    expect(fetched.timeline?.submittedOnDate).toEqual([
      2024,
      3,
      15
    ]);
  });

  test('queues a working deleter on the cleanup-guard', async ({ apiSetup, cleanupGuard }) => {
    const group = await createTestGroup(apiSetup, cleanupGuard);
    expect(cleanupGuard.size()).toBe(1);

    const summary = await cleanupGuard.flush();
    expect(summary.ok).toBe(1);
    expect(summary.failed).toEqual([]);

    await expect(apiSetup.api.getGroup(group.resourceId)).rejects.toThrow(/404|not exist/i);
  });
});
