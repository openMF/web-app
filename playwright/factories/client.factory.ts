/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for a freshly-created Fineract client owned by the current
 * Playwright test.
 *
 * Design goals (per GSoC 2026 proposal WA-2.9):
 *  - Default to a *pending* (`active: false`) client. Fineract only
 *    hard-deletes clients in pending state with no attached accounts,
 *    so the {@link CleanupGuard} teardown registered here MUST be
 *    able to succeed. Tests that need an active client can pass
 *    `{ active: true, activationDate }` via `overrides` and accept
 *    that their cleanup will fail loudly (the guard reports it but
 *    does not throw).
 *  - Build a unique, shard-tagged name via {@link generateE2EName}
 *    so cleanup-grep tooling can identify orphaned rows.
 *  - Dedupe the office lookup through {@link ApiSetupManager} so a
 *    test that creates three resources only pays one
 *    `/api/v1/offices` round-trip.
 *  - Register the deleter immediately after a successful POST and
 *    never before — a half-completed create must not leave a stale
 *    id queued for teardown.
 *
 * Portability note: this module imports only from the in-tree
 * Playwright infrastructure (no Angular, no React, no Material). The
 * React port can adopt it verbatim once its Playwright suite needs
 * test-data factories.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import { generateE2EName } from '../utils/naming';
import type { TestClient } from '../types/test-data.types';
import { resolveDefaultOfficeId } from './_shared';

/** Default lastname applied to every pending test client. */
export const DEFAULT_TEST_CLIENT_LASTNAME = 'E2E';

/** Default submitted-on date applied to every pending test client. */
export const DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE = '01 January 2024';

/** Fineract `legalFormId` for an individual person. */
const LEGAL_FORM_PERSON = 1;

/** Date format expected by the create-client endpoint. */
const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

/** Locale expected by the create-client endpoint. */
const DEFAULT_LOCALE = 'en';

/** Caller-supplied tweaks to the default pending-client payload. */
export interface CreateTestClientOverrides {
  /** Override the auto-generated firstname. */
  firstname?: string;
  /** Override the default lastname (`'E2E'`). */
  lastname?: string;
  /** Override the default office id (first office returned by Fineract). */
  officeId?: number;
  /** Override the default submitted-on date. */
  submittedOnDate?: string;
  /**
   * Extra payload fields merged AFTER the defaults — use to flip
   * `active: true`, set an activation date, attach to a group, etc.
   * Caller owns the cleanup-fail risk for non-deletable shapes.
   */
  extra?: Record<string, unknown>;
}

/**
 * Create a pending client owned by the current test and queue its
 * deletion on the supplied {@link CleanupGuard}.
 *
 * @param setup    The per-test {@link ApiSetupManager}. Carries the
 *                 authenticated `FineractApiClient` and shares
 *                 deduped setup calls across factories.
 * @param guard    The per-test {@link CleanupGuard}. The returned
 *                 client's deleter is pushed onto this stack before
 *                 this function returns.
 * @param overrides See {@link CreateTestClientOverrides}.
 * @returns A {@link TestClient} projection built from the create
 *          response and the input — no follow-up GET is issued, so
 *          callers needing post-creation state (timeline, status
 *          transitions) should call `setup.api.getClient(id)`
 *          themselves.
 */
export async function createTestClient(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  overrides: CreateTestClientOverrides = {}
): Promise<TestClient> {
  const officeId = overrides.officeId ?? (await resolveDefaultOfficeId(setup));
  const firstname = overrides.firstname ?? generateE2EName('client');
  const lastname = overrides.lastname ?? DEFAULT_TEST_CLIENT_LASTNAME;
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE;

  const payload: Record<string, unknown> = {
    officeId,
    firstname,
    lastname,
    legalFormId: LEGAL_FORM_PERSON,
    active: false,
    submittedOnDate,
    dateFormat: DEFAULT_DATE_FORMAT,
    locale: DEFAULT_LOCALE,
    ...overrides.extra
  };

  const response = await setup.api.createClient(payload);
  // Fineract returns both `clientId` and `resourceId` on create — they
  // are always equal but `resourceId` is the documented envelope field.
  const resourceId: number = response.resourceId ?? response.clientId;
  if (typeof resourceId !== 'number') {
    throw new Error(
      `createTestClient: Fineract create-client response missing numeric resourceId/clientId, got ${JSON.stringify(
        response
      )}`
    );
  }

  // Register the deleter BEFORE returning so a caller that forgets to
  // await our result still gets cleanup on test exit.
  guard.register(`client:${resourceId}`, async () => {
    await setup.api.deleteClient(resourceId);
  });

  return {
    resourceId,
    displayName: `${firstname} ${lastname}`,
    officeId
  };
}
