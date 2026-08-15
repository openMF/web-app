/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * WEB-XXXX — Client-lifecycle negative-path / illegal-transitions matrix.
 *
 * Locks down Fineract's client state machine as a *data table*. Each
 * row expresses an illegal predecessor → command pairing and asserts
 * two invariants:
 *
 *   1. The command surfaces an error string — the same payload the UI
 *      snackbar renders (Fineract `userMessageGlobalisationCode` /
 *      `developerMessage`). Matched with a row-specific regex so a
 *      copy change in Fineract shows up as a targeted CI failure
 *      rather than a silent green.
 *   2. The client's server-side `status.value` is *unchanged* after
 *      the failed attempt. This is the state-machine invariant: a
 *      rejected command must never leave the aggregate in an
 *      intermediate state.
 *
 * Why API-only (no UI): the client action menu (`ClientViewPage.
 * chooseAction`) is state-aware and hides illegal actions, so a UI
 * driver *cannot* even attempt these transitions. Fineract's REST
 * layer is the authoritative enforcement point — locking it here is
 * what makes "future Fineract command additions either fit the table
 * or fail in CI" true.
 *
 * Loop shape: Playwright has no `test.describe.each`; the equivalent
 * idiom is a plain `for (const row of MATRIX) { test.describe(...) }`
 * declared at module scope. Playwright collects the tests during
 * registration, so shard/parallel semantics are identical to
 * hand-written describes.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createTestClient } from '../../../factories/client.factory';
import { generateE2EName } from '../../../utils/naming';
import type { FineractApiClient } from '../../../fixtures/fineract-api';
import type { ApiSetupManager } from '../../../utils/api-setup-manager';
import type { CleanupGuard } from '../../../utils/cleanup-guard';

const SUBMITTED_ON_DATE = '01 January 2024';
const ACTIVATION_DATE = '02 January 2024';
const CLOSURE_DATE = '03 January 2024';
const ILLEGAL_ATTEMPT_DATE = '05 January 2024';
const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';
const DEFAULT_LOCALE = 'en';

const CLOSURE_REASON_NAME = 'E2E Close Client Reason';
const REJECTION_REASON_NAME = 'E2E Reject Client Reason';

/**
 * Predecessor-state builder. Returns the id of a freshly-created
 * client already parked in `expectedState`. Cleanup for non-pending
 * predecessors is intentionally NOT registered — Fineract only hard-
 * deletes pending clients, and the existing lifecycle specs
 * (`close-client.spec.ts`, `reactivate-after-close.spec.ts`) follow
 * the same trade-off.
 */
type StateBuilder = (
  fineractApi: FineractApiClient,
  apiSetup: ApiSetupManager,
  cleanupGuard: CleanupGuard
) => Promise<number>;

/**
 * Illegal-command builder. Produces the payload for the illegal
 * command attempt. Kept as a builder (not a static object) because
 * reject/reactivate need a freshly-resolved code-value id that must
 * be looked up per-run.
 */
type PayloadBuilder = (fineractApi: FineractApiClient) => Promise<Record<string, unknown>>;

interface IllegalTransitionRow {
  /** Human-readable row label used in the `describe` title. */
  readonly name: string;
  /** Predecessor state as reported by `GET /clients/{id}.status.value`. */
  readonly fromStatusValue: string;
  /** Fineract command name (`?command=...`). */
  readonly command: string;
  /** Builds a client parked in `fromStatusValue`. */
  readonly buildPredecessor: StateBuilder;
  /** Builds the illegal command payload. */
  readonly buildPayload: PayloadBuilder;
  /**
   * Regex that must match the Fineract error body. Anchored on the
   * `userMessageGlobalisationCode` when Fineract exposes one
   * (see `InvalidClientStateTransitionException`) and the
   * developer-facing message string as a fallback. Both surfaces
   * appear in the JSON envelope the UI reads for the snackbar.
   */
  readonly expectedErrorPattern: RegExp;
}

const MATRIX: readonly IllegalTransitionRow[] = [
  {
    name: 'Active → activate is rejected (already active)',
    fromStatusValue: 'Active',
    command: 'activate',
    buildPredecessor: async (fineractApi) => {
      const officeId = await fineractApi.getFirstOfficeId();
      const createResponse = await fineractApi.createActiveClient(officeId, {
        firstname: generateE2EName('illegalActive'),
        lastname: 'Client',
        submittedOnDate: SUBMITTED_ON_DATE,
        activationDate: ACTIVATION_DATE
      });
      return createResponse.resourceId ?? createResponse.clientId;
    },
    buildPayload: async () => ({
      activationDate: ILLEGAL_ATTEMPT_DATE,
      dateFormat: DEFAULT_DATE_FORMAT,
      locale: DEFAULT_LOCALE
    }),
    // Fineract's `Client.activate()` checks `isActive()` and throws
    // `PlatformApiDataValidationException` with globalisation code
    // `error.msg.clients.already.active` and message "Cannot activate
    // client. Client is already active."
    expectedErrorPattern: /already.active|Cannot activate client/i
  },
  {
    name: 'Pending → reactivate is rejected',
    fromStatusValue: 'Pending',
    command: 'reactivate',
    buildPredecessor: async (_fineractApi, apiSetup, cleanupGuard) => {
      const client = await createTestClient(apiSetup, cleanupGuard, {
        submittedOnDate: SUBMITTED_ON_DATE
      });
      return client.resourceId;
    },
    buildPayload: async () => ({
      reactivationDate: ILLEGAL_ATTEMPT_DATE,
      dateFormat: DEFAULT_DATE_FORMAT,
      locale: DEFAULT_LOCALE
    }),
    // Source: `ClientWritePlatformServiceJpaRepositoryImpl.reActivateClient`
    // throws `InvalidClientStateTransitionException("reactivation",
    // "on.nonclosed.account", "only closed clients may be reactivated.")`
    // which the `InvalidClientStateTransitionException` constructor
    // renders as globalisation code
    // `error.msg.client.reactivation.on.nonclosed.account`.
    expectedErrorPattern: /reactivation\.on\.nonclosed\.account|only closed clients may be reactivated/i
  },
  {
    name: 'Active → reject is rejected',
    fromStatusValue: 'Active',
    command: 'reject',
    buildPredecessor: async (fineractApi) => {
      // Seed the reject-reason code value up front so the illegal
      // command payload can reference it — Fineract validates the
      // reason id BEFORE the state guard fires, so an unknown id
      // would produce the wrong error class and falsely pass the
      // expectedErrorPattern.
      await fineractApi.ensureClientRejectionReason(REJECTION_REASON_NAME);
      const officeId = await fineractApi.getFirstOfficeId();
      const createResponse = await fineractApi.createActiveClient(officeId, {
        firstname: generateE2EName('illegalActive'),
        lastname: 'Client',
        submittedOnDate: SUBMITTED_ON_DATE,
        activationDate: ACTIVATION_DATE
      });
      return createResponse.resourceId ?? createResponse.clientId;
    },
    buildPayload: async (fineractApi) => {
      const reason = await fineractApi.ensureClientRejectionReason(REJECTION_REASON_NAME);
      return {
        rejectionDate: ILLEGAL_ATTEMPT_DATE,
        rejectionReasonId: reason.id,
        dateFormat: DEFAULT_DATE_FORMAT,
        locale: DEFAULT_LOCALE
      };
    },
    // Source: `ClientWritePlatformServiceJpaRepositoryImpl.rejectClient`
    // throws `InvalidClientStateTransitionException("rejection",
    // "on.account.not.in.pending.activation.status",
    // "Only clients pending activation may be withdrawn.")` →
    // globalisation code
    // `error.msg.client.rejection.on.account.not.in.pending.activation.status`.
    expectedErrorPattern: /rejection\.on\.account\.not\.in\.pending\.activation\.status|clients pending activation/i
  }
];

test.describe('Client lifecycle · Illegal transitions matrix', () => {
  for (const row of MATRIX) {
    test.describe(row.name, () => {
      test(`rejects '${row.command}' from ${row.fromStatusValue} and leaves status unchanged`, async ({
        fineractApi,
        apiSetup,
        cleanupGuard
      }) => {
        const clientId = await row.buildPredecessor(fineractApi, apiSetup, cleanupGuard);

        // Sanity-check the predecessor state BEFORE the illegal
        // attempt — a bug in the setup helper (e.g. a silent no-op
        // close) would otherwise turn this test into a tautology.
        const before = await fineractApi.getClient(clientId);
        expect(before.status?.value).toBe(row.fromStatusValue);

        const payload = await row.buildPayload(fineractApi);
        const result = await fineractApi.tryExecuteClientCommand(clientId, row.command, payload);

        // Assertion 1 — the wire-level error surface.
        expect(
          result.ok,
          `Fineract accepted an illegal ${row.fromStatusValue} → ${row.command} transition ` +
            `(status ${result.status}, body: ${result.bodyText})`
        ).toBe(false);
        expect(result.status).toBeGreaterThanOrEqual(400);
        expect(result.bodyText).toMatch(row.expectedErrorPattern);

        // Assertion 2 — state-machine invariant. The rejected
        // command must NOT have mutated `status.value`. Re-fetch
        // via GET (never trust the response of the failed POST).
        const after = await fineractApi.getClient(clientId);
        expect(after.status?.value).toBe(row.fromStatusValue);
      });
    });
  }
});
