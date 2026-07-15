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
 */

export { createTestClient, type TestClientPayload } from './client';
