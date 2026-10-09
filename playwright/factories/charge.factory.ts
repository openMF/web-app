/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for Fineract client charges owned by the current Playwright
 * test.
 *
 * ── The two-level model, which is the whole point of this file ──────
 *
 * Fineract separates a charge *definition* (global, reusable: name,
 * currency, amount, when it applies) from a *client charge* (one
 * definition attached to one client, with its own paid/waived state).
 * The UI collapses these into one "Add Charge" form, which makes it
 * easy to write a spec that creates a client charge and never notices
 * the definition it depends on.
 *
 * That dependency is not optional. The Add Charge dropdown is filled
 * from definitions with `chargeAppliesTo: 3` (Client); with none
 * seeded the dropdown renders empty, the conditional fields below it
 * never appear, and the form is simply unreachable. So every charge
 * spec goes through {@link ensureClientChargeDefinition} first.
 *
 * ── Cleanup ─────────────────────────────────────────────────────────
 *
 * Client charges delete cleanly while unpaid, so the deleter here
 * normally succeeds — unlike the loan/savings factories. A *paid*
 * charge cannot be deleted; that deleter is registered anyway and its
 * failure is recorded by the `CleanupGuard` without throwing, matching
 * the account factories' behaviour.
 *
 * Definitions are deliberately NOT registered for cleanup. They are
 * shared infrastructure keyed by a fixed name, exactly like the
 * minimal loan/savings products.
 *
 * Portability note: zero Angular/Playwright-page imports. The React
 * port can adopt this file verbatim.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import { DEFAULT_ACCOUNT_OPENING_DATE } from './client.factory';

/**
 * Names of the shared charge definitions seeded for E2E runs.
 *
 * Exported so UI specs can pick the same definition from the Add
 * Charge dropdown that the API factories attach by id. The dropdown
 * renders `"<name> (<currency name>)"`, so specs should match by
 * substring rather than exact text.
 */
export const E2E_CHARGE_NAMES = {
  /** Specified-due-date charge — renders a `dueDate` control. */
  specifiedDueDate: 'E2E Client Charge'
} as const;

/**
 * Fineract charge time type ids.
 *
 * ── Only `specifiedDueDate` is valid for client charges ─────────────
 *
 * The charges template endpoint advertises all sixteen time types
 * regardless of what the definition applies to, so `annual` and
 * `monthly` look available and the Add Charge component even has
 * branches for them (`feeOnMonthDay`, `feeInterval`). They are not
 * reachable: creating a definition with `chargeAppliesTo: 3` and any
 * other time type is rejected with
 *
 *     The parameter `chargeTimeType` must be one of [ 2 ] .
 *
 * The other ids are kept here as documentation of that gap — the
 * annual/monthly branches of the Add Charge form are dead code for
 * client charges, and a test asserting on them can never pass against
 * a real backend.
 */
export const CHARGE_TIME_TYPE = {
  /** The only time type Fineract accepts for client charges. */
  specifiedDueDate: 2,
  /** Savings/loan charges only — rejected for `chargeAppliesTo: 3`. */
  annual: 6,
  /** Savings/loan charges only — rejected for `chargeAppliesTo: 3`. */
  monthly: 7
} as const;

/** Default flat amount for seeded client charge definitions. */
export const DEFAULT_CHARGE_AMOUNT = 100;

/** A client charge created by this factory. */
export interface TestClientCharge {
  /** Fineract client charge id. */
  resourceId: number;
  /** Owning client id. */
  clientId: number;
  /** Charge definition id this charge was created from. */
  chargeId: number;
  /** Definition name, as shown in the UI. */
  name: string;
  /** Charge amount. */
  amount: number;
  /** Due date in `dd MMMM yyyy` wire format. */
  dueDate: string;
}

/** Caller-supplied tweaks accepted by {@link createTestClientCharge}. */
export interface CreateTestClientChargeOverrides {
  /** Charge definition id. Defaults to the shared specified-due-date definition. */
  chargeId?: number;
  /** Definition name used when seeding. Ignored if `chargeId` is given. */
  chargeName?: string;
  /** Fineract charge time type id. Ignored if `chargeId` is given. */
  chargeTimeType?: number;
  /** Due date, `dd MMMM yyyy`. Defaults to {@link DEFAULT_ACCOUNT_OPENING_DATE}. */
  dueDate?: string;
  /** Amount override. Defaults to {@link DEFAULT_CHARGE_AMOUNT}. */
  amount?: number;
}

/**
 * Seed (or reuse) a client-applicable charge definition.
 *
 * Thin wrapper over the API client so specs and page objects have one
 * obvious entry point, and so the default name/time-type pairing lives
 * in exactly one place.
 *
 * @param setup - The per-test {@link ApiSetupManager}.
 * @param name - Definition name. Must be unique per time type.
 * @param chargeTimeType - Fineract charge time type id.
 * @param amount - Flat amount for the definition.
 * @returns The charge definition payload.
 */
export async function ensureClientChargeDefinition(
  setup: ApiSetupManager,
  name: string = E2E_CHARGE_NAMES.specifiedDueDate,
  chargeTimeType: number = CHARGE_TIME_TYPE.specifiedDueDate,
  amount: number = DEFAULT_CHARGE_AMOUNT
): Promise<any> {
  return setup.api.ensureClientChargeDefinition(name, chargeTimeType, amount);
}

/**
 * Attach a charge to a client via the API.
 *
 * Used to arrange state for the *operations* specs (pay / waive /
 * delete), which need an existing charge and should not re-test the
 * Add Charge form to get one.
 *
 * @param setup - The per-test {@link ApiSetupManager}.
 * @param guard - The per-test {@link CleanupGuard}.
 * @param clientId - resourceId of the owning client.
 * @param overrides - See {@link CreateTestClientChargeOverrides}.
 */
export async function createTestClientCharge(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestClientChargeOverrides = {}
): Promise<TestClientCharge> {
  // A caller who supplies `chargeId` bypasses the definition lookup, so
  // this factory cannot know the definition's real name. Require
  // `chargeName` alongside it rather than return the default name, which
  // could differ from the attached charge — specs select/assert on `name`.
  if (overrides.chargeId !== undefined && overrides.chargeName === undefined) {
    throw new Error(
      'createTestClientCharge: pass `chargeName` alongside `chargeId` so the returned name matches the attached definition'
    );
  }

  const name = overrides.chargeName ?? E2E_CHARGE_NAMES.specifiedDueDate;
  const amount = overrides.amount ?? DEFAULT_CHARGE_AMOUNT;
  const dueDate = overrides.dueDate ?? DEFAULT_ACCOUNT_OPENING_DATE;

  let chargeId = overrides.chargeId;
  if (chargeId === undefined) {
    const definition = await ensureClientChargeDefinition(
      setup,
      name,
      overrides.chargeTimeType ?? CHARGE_TIME_TYPE.specifiedDueDate,
      amount
    );
    // `ensure` returns either a freshly created envelope (`resourceId`)
    // or an existing definition read back from the list (`id`). Same
    // trap as `resolveProductId` guards against for products.
    chargeId = definition?.id ?? definition?.resourceId;
    if (typeof chargeId !== 'number') {
      throw new Error(
        `createTestClientCharge: could not resolve a numeric charge definition id, got ${JSON.stringify(definition)}`
      );
    }
  }

  const response = await setup.api.createClientCharge(clientId, chargeId, dueDate, amount);
  const resourceId: number = response?.resourceId;
  if (typeof resourceId !== 'number') {
    throw new Error(
      `createTestClientCharge: Fineract create-client-charge response missing numeric resourceId, got ${JSON.stringify(
        response
      )}`
    );
  }

  guard.register(`clientCharge:${resourceId}`, async () => {
    await setup.api.deleteClientCharge(clientId, resourceId);
  });

  return { resourceId, clientId, chargeId, name, amount, dueDate };
}
