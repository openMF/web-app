/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test as setup } from '@playwright/test';
import { authenticateRole } from './auth-helpers';
import { ROLES } from './config/roles';

/**
 * Auth setup for the `restricted` role (read-only / limited
 * permissions).
 *
 * Used by future authorization-boundary tests that assert a
 * restricted user CANNOT perform privileged actions (e.g.
 * "approve loan should 403"). Credentials must be supplied via
 * `E2E_RESTRICTED_USERNAME` / `E2E_RESTRICTED_PASSWORD`; there is
 * no safe default because the seed data varies by environment.
 * `authenticateRole` raises a loud, fast error if the env vars are
 * missing so misconfiguration cannot silently degrade test coverage.
 */
setup(`authenticate as ${ROLES.restricted.id}`, async ({ page, browser }) => {
  await authenticateRole(ROLES.restricted, page, browser);
});
