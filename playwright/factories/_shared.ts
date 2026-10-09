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

/**
 * Normalise a Fineract product payload down to its numeric id.
 *
 * `ensureMinimalLoanProduct` / `ensureMinimalSavingsProduct` return
 * either an existing product straight off the product-list endpoint or
 * a freshly-built `{ id, name, shortName }` projection. Both spell the
 * key `id`, whereas the create-* envelope used everywhere else in this
 * suite spells it `resourceId` — so a factory that reaches for
 * `product.resourceId` silently gets `undefined` and posts an account
 * with no product attached. Reading both spellings in one place stops
 * every future product-backed factory from re-discovering that.
 *
 * @param product - Payload returned by an `ensure*Product` call.
 * @param caller  - Factory name, used to make the failure traceable.
 * @returns The numeric product id.
 * @throws When neither `id` nor `resourceId` is a number.
 */
export function resolveProductId(product: unknown, caller: string): number {
  const candidate = product as { id?: unknown; resourceId?: unknown } | null | undefined;
  // Prefer a numeric `id`, then fall back to `resourceId`. Selecting on
  // nullishness alone (`id ?? resourceId`) would latch onto a
  // present-but-non-numeric `id` and reject a payload whose `resourceId`
  // is a perfectly good number.
  const id = typeof candidate?.id === 'number' ? candidate.id : candidate?.resourceId;

  if (typeof id !== 'number') {
    throw new Error(`${caller}: product payload missing a numeric id/resourceId, got ${JSON.stringify(product)}`);
  }

  return id;
}
