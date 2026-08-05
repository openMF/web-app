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

/**
 * Default activation date for {@link createActiveTestClient}.
 *
 * Deliberately one day AFTER {@link DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE}:
 * Fineract rejects an activation that predates submission, and the
 * resulting error message names neither field, so an accidental
 * inversion surfaces as an opaque validation failure.
 */
export const DEFAULT_TEST_CLIENT_ACTIVATION_DATE = '02 January 2024';

/**
 * Earliest date a downstream account or charge may safely use.
 *
 * Loan applications, savings applications, and client charges are all
 * rejected by Fineract when their own date precedes the owning
 * client's activation date. Factories in Tracks B/C default their
 * `submittedOnDate` to this constant so the whole chain
 * (submitted -> activated -> account/charge) is monotonic by
 * construction rather than by each spec author remembering the rule.
 */
export const DEFAULT_ACCOUNT_OPENING_DATE = '03 January 2024';

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

/** Caller-supplied tweaks to the default active-client payload. */
export interface CreateActiveTestClientOverrides extends Omit<CreateTestClientOverrides, 'extra'> {
  /**
   * Override the default activation date. MUST NOT precede
   * `submittedOnDate` — Fineract rejects the create outright.
   */
  activationDate?: string;
  /**
   * Extra payload fields merged BEFORE this factory's own invariants.
   *
   * `active`, `activationDate`, and `submittedOnDate` are always
   * applied last and cannot be overridden here — they are the fields
   * this factory validates, and letting `extra` replace them would
   * mean validating one value while sending another to Fineract. Use
   * the dedicated `submittedOnDate` / `activationDate` options
   * instead, which go through {@link assertDateNotBefore}.
   */
  extra?: Record<string, unknown>;
}

/**
 * Create an ACTIVE client owned by the current test and queue its
 * deletion on the supplied {@link CleanupGuard}.
 *
 * Why this exists as a separate factory rather than an
 * `{ active: true }` flag on {@link createTestClient}: every flow that
 * opens a loan account, opens a savings account, or applies a client
 * charge requires an active client, and each of those flows carries a
 * date-ordering constraint relative to the activation date. Encoding
 * the chain once here keeps ~20 downstream specs from re-deriving it.
 *
 * Cleanup caveat: Fineract only hard-deletes clients that are pending
 * with no attached accounts. The deleter registered here will
 * therefore FAIL for an active client, and the {@link CleanupGuard}
 * will report it in `summary.failed` without throwing. That is
 * deliberate and accepted — E2E databases are ephemeral, and the
 * `E2E_` name prefix keeps orphans greppable. The registration is
 * kept (rather than skipped) so that a test which happens to leave the
 * client account-free still gets it removed.
 *
 * @param setup     The per-test {@link ApiSetupManager}.
 * @param guard     The per-test {@link CleanupGuard}.
 * @param overrides See {@link CreateActiveTestClientOverrides}.
 * @returns A {@link TestClient} projection. No follow-up GET is
 *          issued; callers needing the activation timeline should
 *          call `setup.api.getClient(id)` themselves.
 * @throws When `activationDate` precedes `submittedOnDate`, so the
 *         failure names the offending fields instead of surfacing as
 *         an opaque Fineract validation error.
 */
export async function createActiveTestClient(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  overrides: CreateActiveTestClientOverrides = {}
): Promise<TestClient> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE;
  const activationDate = overrides.activationDate ?? DEFAULT_TEST_CLIENT_ACTIVATION_DATE;

  assertDateNotBefore(activationDate, submittedOnDate, 'createActiveTestClient', 'activationDate', 'submittedOnDate');

  return createTestClient(setup, guard, {
    firstname: overrides.firstname,
    lastname: overrides.lastname,
    officeId: overrides.officeId,
    submittedOnDate,
    extra: {
      // Caller extras first, invariants last. `createTestClient`
      // spreads this object after its own defaults, so anything left
      // in here wins — including `submittedOnDate`. Ordering the
      // spread this way keeps the three validated fields
      // authoritative: otherwise the guard above could pass on one
      // date pair while Fineract received another.
      ...overrides.extra,
      active: true,
      activationDate,
      submittedOnDate
    }
  });
}

/**
 * Guard that `later` is not chronologically before `earlier`.
 *
 * Both inputs must use Fineract's `dd MMMM yyyy` wire format (e.g.
 * `'01 January 2024'`). Parsing goes through {@link parseFineractDate}
 * rather than `Date.parse`, whose support for this format is
 * implementation-defined and which would also accept unrelated
 * date-time strings — either of which could let a malformed literal
 * slip past this local check and fail only after the API request.
 */
function assertDateNotBefore(
  later: string,
  earlier: string,
  caller: string,
  laterLabel: string,
  earlierLabel: string
): void {
  const laterMs = parseFineractDate(later);
  const earlierMs = parseFineractDate(earlier);

  if (laterMs === null || earlierMs === null) {
    throw new Error(
      `${caller}: unable to parse dates — ${laterLabel}='${later}', ${earlierLabel}='${earlier}'. ` +
        `Expected Fineract's 'dd MMMM yyyy' format, e.g. '01 January 2024'.`
    );
  }

  if (laterMs < earlierMs) {
    throw new Error(
      `${caller}: ${laterLabel} ('${later}') must not precede ${earlierLabel} ('${earlier}') — ` +
        `Fineract rejects the create with a validation error that names neither field.`
    );
  }
}

/**
 * The twelve English month names Fineract emits and accepts in its
 * `dd MMMM yyyy` format, indexed 0-11 to match `Date.UTC`.
 */
const FINERACT_MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

/**
 * Strictly parse a Fineract `dd MMMM yyyy` date into epoch ms (UTC).
 *
 * Deliberately narrow: it accepts only `<1-2 digit day> <full month
 * name> <4-digit year>` and validates that the day is real for the
 * given month/year (rejecting e.g. `'31 February 2024'`). Anything
 * else returns `null`, so a malformed literal is caught here rather
 * than by an opaque Fineract 400 after the request goes out.
 *
 * @param value - The candidate date string.
 * @returns Epoch milliseconds, or `null` when `value` is not a valid
 *          `dd MMMM yyyy` date.
 */
function parseFineractDate(value: string): number | null {
  const match = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthIndex = FINERACT_MONTHS.indexOf(match[2].toLowerCase());
  const year = Number(match[3]);

  if (monthIndex === -1) {
    return null;
  }

  const ms = Date.UTC(year, monthIndex, day);
  // Reject overflow dates (e.g. day 31 in a 30-day month): Date.UTC
  // would roll them into the next month, so a round-trip mismatch
  // means the input was not a real calendar date.
  const roundTrip = new Date(ms);
  if (roundTrip.getUTCFullYear() !== year || roundTrip.getUTCMonth() !== monthIndex || roundTrip.getUTCDate() !== day) {
    return null;
  }

  return ms;
}
