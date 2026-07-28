/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, type Browser, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/login.page';
import type { AuthRole } from './config/roles';
import { BEHAVIOR } from './config/behavior';
import { ROUTES } from './config/routes';

/**
 * Shared auth-setup procedure used by every `auth.<role>.setup.ts`.
 *
 * Per GSoC 2026 proposal WA-2.2.
 *
 * Performs an end-to-end login as the given role and writes a
 * `storageState` file that downstream test projects consume via
 * `use: { storageState: role.storageStateFile }`.
 *
 * Mirrors the legacy single-role `auth.setup.ts` but is now
 * parameterized by an {@link AuthRole}. Keeping the procedure in one
 * place means future hardening (token-prewarm, 2FA bypass, etc.)
 * lands once and benefits every role.
 *
 * Layer-2 contract usage:
 *   - {@link BEHAVIOR.authStorageKey} is the per-framework key the
 *     host app uses for the auth blob. Angular reads from
 *     sessionStorage at boot, so we mirror it into localStorage so
 *     Playwright's `storageState` (which only persists localStorage
 *     and cookies) actually captures it. The mirror short-circuits
 *     when the key already exists in localStorage, which is the
 *     React case — a deliberate cross-framework contract so the same
 *     helper works against either repo.
 *   - {@link ROUTES.home} drives the post-login verification
 *     navigation. The React route registry returns `/` for the same
 *     logical page, so this stays portable.
 *
 * Reliability features:
 *   - The verification context is closed in a `finally` block so a
 *     failed assertion never leaks a Chromium process.
 */
export async function authenticateRole(role: AuthRole, page: Page, browser: Browser): Promise<void> {
  const authPath = path.resolve(role.storageStateFile);
  const authDir = path.dirname(authPath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  if (fs.existsSync(authPath)) {
    fs.unlinkSync(authPath);
  }

  const username = process.env[role.usernameEnv] || role.defaultUsername;
  const password = process.env[role.passwordEnv] || role.defaultPassword;

  if (!username || !password) {
    throw new Error(
      `[auth:${role.id}] Missing credentials. Set ${role.usernameEnv} and ` +
        `${role.passwordEnv} in the environment. ${role.description}`
    );
  }

  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.loginAndWaitForDashboard(username, password);

  console.log(`[auth:${role.id}] mirroring ${BEHAVIOR.authStorageKey} into localStorage if needed`);
  const credsCopied = await page.evaluate((storageKey) => {
    // React stores the auth blob in localStorage directly — no mirror
    // needed. Short-circuit so this helper is portable across repos.
    if (localStorage.getItem(storageKey)) {
      return true;
    }
    // Angular stores it in sessionStorage; mirror to localStorage so
    // Playwright's storageState (localStorage + cookies only) can
    // capture it.
    const fromSession = sessionStorage.getItem(storageKey);
    if (!fromSession) return false;
    localStorage.setItem(storageKey, fromSession);
    return true;
  }, BEHAVIOR.authStorageKey);

  if (!credsCopied) {
    throw new Error(
      `[auth:${role.id}] CRITICAL: ${BEHAVIOR.authStorageKey} not found in ` +
        'sessionStorage or localStorage after login. Did the auth storage key change?'
    );
  }

  await page.context().storageState({ path: role.storageStateFile });
  console.log(`[auth:${role.id}] storageState saved to ${role.storageStateFile}`);

  // Verify the storageState we just wrote is actually loadable. The
  // try/finally guarantees the verification context is closed even
  // if the assertion fails, so failed runs don't leak a Chromium
  // process per role.
  const verifyContext = await browser.newContext({ storageState: role.storageStateFile });
  try {
    const verifyPage = await verifyContext.newPage();
    await verifyPage.goto(ROUTES.home);
    await expect(verifyPage).not.toHaveURL(/.*login.*/, { timeout: 30000 });
  } finally {
    await verifyContext.close();
  }
  console.log(`[auth:${role.id}] storageState verification passed ✓`);
}
