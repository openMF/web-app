/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test as setup } from '@playwright/test';
import { authenticateRole } from './auth-helpers';
import { ROLES } from './config/roles';

/**
 * Default-role auth setup.
 *
 * Per GSoC 2026 proposal WA-2.2, the procedure body now lives in
 * `auth-helpers.ts` so every role (default / admin / restricted /
 * future ones) walks the same code path. This file preserves the
 * legacy `playwright/.auth/user.json` storageState location consumed
 * by the existing `chromium` project, so no spec changes are needed.
 */
setup('authenticate', async ({ page, browser }) => {
  await authenticateRole(ROLES.default, page, browser);
});
