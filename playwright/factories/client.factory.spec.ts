/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import {
  createTestClient,
  createActiveTestClient,
  DEFAULT_TEST_CLIENT_LASTNAME,
  DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE,
  DEFAULT_TEST_CLIENT_ACTIVATION_DATE,
  DEFAULT_ACCOUNT_OPENING_DATE
} from './client.factory';
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

test.describe('createActiveTestClient() against live Fineract', () => {
  test('creates a client already in Active status', async ({ apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const fetched = await apiSetup.api.getClient(client.resourceId);
    expect(fetched.id).toBe(client.resourceId);
    expect(fetched.active).toBe(true);
    expect(fetched.status?.value).toBe('Active');
    // The activation date must land one day after submission — this is
    // the ordering every downstream account/charge factory relies on.
    expect(fetched.timeline?.submittedOnDate).toEqual([
      2024,
      1,
      1
    ]);
    expect(fetched.timeline?.activatedOnDate).toEqual([
      2024,
      1,
      2
    ]);
  });

  test('rejects an activation date that precedes submission', async ({ apiSetup, cleanupGuard }) => {
    // Fails locally, before any HTTP request, so the error names the
    // offending fields instead of surfacing as an opaque Fineract
    // validation message.
    await expect(
      createActiveTestClient(apiSetup, cleanupGuard, {
        submittedOnDate: '10 January 2024',
        activationDate: '05 January 2024'
      })
    ).rejects.toThrow(/activationDate .* must not precede submittedOnDate/);
    expect(cleanupGuard.size()).toBe(0);
  });

  test('rejects an unparseable date literal', async ({ apiSetup, cleanupGuard }) => {
    await expect(createActiveTestClient(apiSetup, cleanupGuard, { activationDate: 'not-a-date' })).rejects.toThrow(
      /unable to parse dates/
    );
    expect(cleanupGuard.size()).toBe(0);
  });

  test('rejects a calendar-invalid date that Date.parse would have rolled over', async ({ apiSetup, cleanupGuard }) => {
    // '31 February 2024' is not a real date. Date.parse tolerates some
    // overflow forms; the strict parser must reject it locally rather
    // than let it reach Fineract.
    await expect(
      createActiveTestClient(apiSetup, cleanupGuard, { activationDate: '31 February 2024' })
    ).rejects.toThrow(/unable to parse dates/);
    expect(cleanupGuard.size()).toBe(0);
  });

  test('rejects a non-dd-MMMM-yyyy format Date.parse would accept', async ({ apiSetup, cleanupGuard }) => {
    // ISO '2024-01-05' parses fine under Date.parse but is not the
    // Fineract wire format, so the strict guard must reject it.
    await expect(createActiveTestClient(apiSetup, cleanupGuard, { activationDate: '2024-01-05' })).rejects.toThrow(
      /unable to parse dates/
    );
    expect(cleanupGuard.size()).toBe(0);
  });

  test('exposes an account-opening date after the activation date', () => {
    // Guards the constant chain itself: a future edit that bumps the
    // activation date past the account-opening date would silently
    // break every Track B/C factory that defaults to it.
    expect(Date.parse(DEFAULT_ACCOUNT_OPENING_DATE)).toBeGreaterThan(Date.parse(DEFAULT_TEST_CLIENT_ACTIVATION_DATE));
    expect(Date.parse(DEFAULT_TEST_CLIENT_ACTIVATION_DATE)).toBeGreaterThan(
      Date.parse(DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE)
    );
  });

  test('extra cannot override the validated active-client invariants', async ({ apiSetup, cleanupGuard }) => {
    // `createTestClient` spreads `extra` after its own defaults, so an
    // earlier implementation let `extra` replace `submittedOnDate` —
    // meaning the date-order guard validated one pair while Fineract
    // received another. The invariants must win.
    const client = await createActiveTestClient(apiSetup, cleanupGuard, {
      extra: {
        active: false,
        activationDate: '31 December 2023',
        submittedOnDate: '20 January 2024'
      }
    });

    const fetched = await apiSetup.api.getClient(client.resourceId);
    expect(fetched.active).toBe(true);
    expect(fetched.timeline?.submittedOnDate).toEqual([
      2024,
      1,
      1
    ]);
    expect(fetched.timeline?.activatedOnDate).toEqual([
      2024,
      1,
      2
    ]);
  });
});
