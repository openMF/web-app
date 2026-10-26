/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import {
  createTestUser,
  generateE2EPassword,
  FINERACT_PASSWORD_REGEX,
  DEFAULT_TEST_USER_ROLE_ID
} from './user.factory';
import { createTestClient } from './client.factory';
import { createTestGroup } from './group.factory';
import { E2E_NAME_PATTERN } from '../utils/naming';

// Live-backend specs — run under the `integration` Playwright project
// (testMatch: /playwright\/factories\/.*\.spec\.ts/ in
// playwright.config.ts). No browser, no auth-setup dependency.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('generateE2EPassword()', () => {
  test('always satisfies the Fineract password regex with the default RNG', () => {
    for (let i = 0; i < 50; i++) {
      const pwd = generateE2EPassword();
      expect(pwd).toMatch(FINERACT_PASSWORD_REGEX);
    }
  });

  test('terminates and stays valid even when the RNG always returns 0', () => {
    const pwd = generateE2EPassword(() => 0);
    expect(pwd).toMatch(FINERACT_PASSWORD_REGEX);
  });

  test('terminates and stays valid even when the RNG always returns close to 1', () => {
    // 0.9999... — exercises the upper clamp branch.
    const pwd = generateE2EPassword(() => 0.999999);
    expect(pwd).toMatch(FINERACT_PASSWORD_REGEX);
  });
});

test.describe('createTestUser() against live Fineract', () => {
  test('creates a user matching the TestUser shape', async ({ apiSetup, cleanupGuard }) => {
    const user = await createTestUser(apiSetup, cleanupGuard);

    expect(typeof user.resourceId).toBe('number');
    expect(user.resourceId).toBeGreaterThan(0);
    expect(user.officeId).toBeGreaterThan(0);
    expect(user.username).toMatch(E2E_NAME_PATTERN);
    expect(user.username.startsWith('E2E_user_S')).toBe(true);
    expect(user.email).toBe(`${user.username.toLowerCase()}@e2e.test`);
    expect(user.password).toMatch(FINERACT_PASSWORD_REGEX);

    // Round-trip the create through the GET endpoint.
    const fetched = await apiSetup.api.getUser(user.resourceId);
    expect(fetched.id).toBe(user.resourceId);
    expect(fetched.username).toBe(user.username);
    expect(fetched.officeId).toBe(user.officeId);
    expect(fetched.email).toBe(user.email);
    // Default role assignment — Super user (id=1) from the demo seed.
    const selectedRoleIds = (fetched.selectedRoles ?? []).map((r: { id: number }) => r.id);
    expect(selectedRoleIds).toContain(DEFAULT_TEST_USER_ROLE_ID);
  });

  test('honours username / firstname / lastname overrides', async ({ apiSetup, cleanupGuard }) => {
    const overrideUsername = `OverrideUser_${Date.now()}`;
    const user = await createTestUser(apiSetup, cleanupGuard, {
      username: overrideUsername,
      firstname: 'Custom',
      lastname: 'Name'
    });
    expect(user.username).toBe(overrideUsername);
    const fetched = await apiSetup.api.getUser(user.resourceId);
    expect(fetched.firstname).toBe('Custom');
    expect(fetched.lastname).toBe('Name');
  });

  test('queues a working deleter on the cleanup-guard', async ({ apiSetup, cleanupGuard }) => {
    const user = await createTestUser(apiSetup, cleanupGuard);
    expect(cleanupGuard.size()).toBe(1);

    const summary = await cleanupGuard.flush();
    expect(summary.ok).toBe(1);
    expect(summary.failed).toEqual([]);

    await expect(apiSetup.api.getUser(user.resourceId)).rejects.toThrow(/404|not exist/i);
  });

  test('rejects an override password that violates the policy without hitting the backend', async ({
    apiSetup,
    cleanupGuard
  }) => {
    await expect(createTestUser(apiSetup, cleanupGuard, { password: 'short' })).rejects.toThrow(
      /does not satisfy Fineract's password policy/
    );
    // Nothing was created → nothing was registered for cleanup.
    expect(cleanupGuard.size()).toBe(0);
  });
});

test.describe('cleanup-guard reverse-order teardown across factories', () => {
  test('flush() deletes the most-recently-created entity first', async ({ apiSetup, cleanupGuard }) => {
    const client = await createTestClient(apiSetup, cleanupGuard);
    const group = await createTestGroup(apiSetup, cleanupGuard);
    const user = await createTestUser(apiSetup, cleanupGuard);

    expect(cleanupGuard.size()).toBe(3);
    const summary = await cleanupGuard.flush();

    expect(summary.ok).toBe(3);
    expect(summary.failed).toEqual([]);
    // LIFO: user → group → client.
    expect(summary.outcomes.map((o) => o.label)).toEqual([
      `user:${user.resourceId}`,
      `group:${group.resourceId}`,
      `client:${client.resourceId}`
    ]);
  });
});
