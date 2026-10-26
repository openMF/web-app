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
 * Auth setup for the `admin` role (full-permission writer).
 *
 * Storage state is written to `playwright/.auth/admin.json` and is
 * consumed by the `chromium-admin` Playwright project. Tests that
 * exercise write paths (create client, approve loan, etc.) should
 * either:
 *   - declare `use: { storageState: ROLES.admin.storageStateFile }`
 *     directly, or
 *   - live under `playwright/tests/admin/**` so the
 *     `chromium-admin` project (auto-mounted when that folder
 *     contains specs — see playwright.config.ts) wires this state
 *     in for them.
 *
 * Credentials default to `mifos`/`password` so the local dev backend
 * "just works"; production CI should set `E2E_ADMIN_USERNAME` and
 * `E2E_ADMIN_PASSWORD`.
 */
setup(`authenticate as ${ROLES.admin.id}`, async ({ page, browser }) => {
  await authenticateRole(ROLES.admin, page, browser);
});
