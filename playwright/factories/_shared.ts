/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Shared resolver helpers for the test-data factories.
 *
 * The only piece of cross-factory state is "what office should we
 * attach this entity to?" — every factory in this PR defaults to the
 * first office returned by Fineract, and dedupes that lookup through
 * the {@link ApiSetupManager} so a test that creates a client, a
 * group, and a user only pays one `/api/v1/offices` round-trip.
 *
 * Portability note: this module imports only from the in-tree
 * `ApiSetupManager`. The React port can copy it verbatim.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';

/**
 * Stable cache key for "the first office id". Exported so unit specs
 * can assert deduplication without re-implementing the convention.
 */
export const FIRST_OFFICE_CACHE_KEY = 'office:first';

/**
 * Resolve the first office id, sharing the result across every
 * factory invocation in the current process. The Fineract demo data
 * ships exactly one office (the Head Office), so this is effectively
 * a one-shot lookup; the `dedupe` wrapper still matters because
 * parallel factory calls within the same test would otherwise fire
 * the request twice.
 */
export async function resolveDefaultOfficeId(setup: ApiSetupManager): Promise<number> {
  return setup.dedupe(FIRST_OFFICE_CACHE_KEY, () => setup.api.getFirstOfficeId());
}
