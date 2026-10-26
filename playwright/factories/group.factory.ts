/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for a freshly-created Fineract group owned by the current
 * Playwright test.
 *
 * Design goals (per GSoC 2026 proposal WA-2.9):
 *  - Default to a *pending* (`active: false`) group with no members.
 *    Fineract only hard-deletes groups in pending state with no
 *    member clients, so the {@link CleanupGuard} teardown registered
 *    here MUST be able to succeed.
 *  - Build a unique, shard-tagged name via {@link generateE2EName}
 *    so cleanup-grep tooling can identify orphaned rows. Group names
 *    are unique within an office in Fineract, so the
 *    `E2E_group_S{shard}_{ts}_{rand}` shape comfortably avoids
 *    collisions even under heavy parallel-worker load.
 *  - Dedupe the office lookup through {@link ApiSetupManager}.
 *  - Register the deleter immediately after a successful POST and
 *    never before.
 *
 * Portability note: this module imports only from the in-tree
 * Playwright infrastructure.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import { generateE2EName } from '../utils/naming';
import type { TestGroup } from '../types/test-data.types';
import { resolveDefaultOfficeId } from './_shared';

/** Default submitted-on date applied to every pending test group. */
export const DEFAULT_TEST_GROUP_SUBMITTED_ON_DATE = '01 January 2024';

/** Date format expected by the create-group endpoint. */
const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';

/** Locale expected by the create-group endpoint. */
const DEFAULT_LOCALE = 'en';

/** Caller-supplied tweaks to the default pending-group payload. */
export interface CreateTestGroupOverrides {
  /** Override the auto-generated group name. */
  name?: string;
  /** Override the default office id (first office returned by Fineract). */
  officeId?: number;
  /** Override the default submitted-on date. */
  submittedOnDate?: string;
  /**
   * Extra payload fields merged AFTER the defaults — use to attach
   * client ids, flip `active: true`, etc. Caller owns the cleanup-fail
   * risk for non-deletable shapes.
   */
  extra?: Record<string, unknown>;
}

/**
 * Create a pending group owned by the current test and queue its
 * deletion on the supplied {@link CleanupGuard}.
 *
 * @param setup     The per-test {@link ApiSetupManager}.
 * @param guard     The per-test {@link CleanupGuard}.
 * @param overrides See {@link CreateTestGroupOverrides}.
 * @returns A {@link TestGroup} projection. `displayName` is set to
 *          the group's `name` because Fineract groups have no
 *          separate `displayName` field on either the create response
 *          or the GET projection.
 */
export async function createTestGroup(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  overrides: CreateTestGroupOverrides = {}
): Promise<TestGroup> {
  const officeId = overrides.officeId ?? (await resolveDefaultOfficeId(setup));
  const name = overrides.name ?? generateE2EName('group');
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_TEST_GROUP_SUBMITTED_ON_DATE;

  const payload: Record<string, unknown> = {
    officeId,
    name,
    active: false,
    submittedOnDate,
    dateFormat: DEFAULT_DATE_FORMAT,
    locale: DEFAULT_LOCALE,
    ...overrides.extra
  };

  const response = await setup.api.createGroup(payload);
  // Fineract returns both `groupId` and `resourceId` on create — they
  // are always equal but `resourceId` is the documented envelope field.
  const resourceId: number = response.resourceId ?? response.groupId;
  if (typeof resourceId !== 'number') {
    throw new Error(
      `createTestGroup: Fineract create-group response missing numeric resourceId/groupId, got ${JSON.stringify(
        response
      )}`
    );
  }

  guard.register(`group:${resourceId}`, async () => {
    await setup.api.deleteGroup(resourceId);
  });

  return {
    resourceId,
    // Fineract groups have no separate `displayName` field — `name`
    // is what the UI renders, so we mirror it into the TestEntity
    // projection.
    displayName: name,
    officeId
  };
}
