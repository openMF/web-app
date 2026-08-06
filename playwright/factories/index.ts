/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 4 — Test data factory barrel.
 *
 * Re-exports every concrete factory so specs can import them through a
 * single, stable entry point:
 *
 *     import { createTestClient } from '../../factories';
 *
 * The barrel keeps spec files insulated from factory file moves and lets
 * the React counterpart export an identically-shaped module — making the
 * cross-framework portability swap a path-only change.
 *
 * Two flavours of factory live behind this barrel, and the distinction
 * matters:
 *
 *  - **API factories** (`client.factory.ts`) hit Fineract REST, return
 *    a real `resourceId`, and register their own teardown on the
 *    per-test `CleanupGuard`. Use these to arrange preconditions.
 *  - **Payload builders** (`client.ts`) are pure and never touch the
 *    network. They produce form-shaped data for driving a page object
 *    through the UI.
 *
 * Both modules previously exported a function called `createTestClient`
 * with incompatible signatures, and only the pure builder was reachable
 * through this barrel — so `import { createTestClient } from '../../factories'`
 * and `import { createTestClient } from '../../factories/client.factory'`
 * silently resolved to different functions. The pure builder is now
 * re-exported as `buildTestClientPayload` to make the distinction
 * explicit at the import site.
 */

// ── API factories (network + cleanup registration) ─────────────────

export {
  createTestClient,
  createActiveTestClient,
  DEFAULT_TEST_CLIENT_LASTNAME,
  DEFAULT_TEST_CLIENT_SUBMITTED_ON_DATE,
  DEFAULT_TEST_CLIENT_ACTIVATION_DATE,
  DEFAULT_ACCOUNT_OPENING_DATE,
  type CreateTestClientOverrides,
  type CreateActiveTestClientOverrides
} from './client.factory';

export { createTestLoan, createApprovedLoan, createActiveLoan, type CreateTestLoanOverrides } from './loan.factory';

export {
  createTestSavingsAccount,
  createApprovedSavingsAccount,
  createActiveSavingsAccount,
  type CreateTestSavingsAccountOverrides
} from './savings.factory';

// ── Pure payload builders (no network) ─────────────────────────────

export {
  createTestClient as buildTestClientPayload,
  createSeededClient,
  type TestClientPayload,
  type ClientState,
  type CreateTestClientOverrides as BuildTestClientPayloadOverrides,
  type SeededTestClient
} from './client';

// ── Shared resolvers ───────────────────────────────────────────────

export { resolveDefaultOfficeId, resolveProductId, FIRST_OFFICE_CACHE_KEY } from './_shared';
