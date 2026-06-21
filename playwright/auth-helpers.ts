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

/**
 * Shared auth-setup procedure used by every `auth.<role>.setup.ts`.
 *
 * Per GSoC 2026 proposal WA-2.2.
 *
 * Performs an end-to-end login as the given role and writes a
 * `storageState` file that downstream test projects can consume via
 * `use: { storageState: role.storageStateFile }`.
 *
 * Mirrors the legacy single-role `auth.setup.ts` but is now
 * parameterized by an {@link AuthRole}. Keeping the procedure in one
 * place means future hardening (token-prewarm, retry-with-backoff,
 * 2FA bypass, etc.) lands once and benefits every role.
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

  console.log(`[auth:${role.id}] copying ${BEHAVIOR.authStorageKey} from sessionStorage → localStorage`);
  const credsCopied = await page.evaluate((storageKey) => {
    const creds = sessionStorage.getItem(storageKey);
    if (!creds) return false;
    localStorage.setItem(storageKey, creds);
    return true;
  }, BEHAVIOR.authStorageKey);

  if (!credsCopied) {
    throw new Error(
      `[auth:${role.id}] CRITICAL: ${BEHAVIOR.authStorageKey} not found in sessionStorage. ` +
        'Did the auth storage key change?'
    );
  }

  await page.context().storageState({ path: role.storageStateFile });
  console.log(`[auth:${role.id}] storageState saved to ${role.storageStateFile}`);

  const verifyContext = await browser.newContext({ storageState: role.storageStateFile });
  const verifyPage = await verifyContext.newPage();
  await verifyPage.goto('/#/');
  await expect(verifyPage).not.toHaveURL(/.*login.*/, { timeout: 30000 });
  await verifyContext.close();
  console.log(`[auth:${role.id}] storageState verification passed ✓`);
}
