/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/login.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, browser }) => {
  const authPath = path.resolve(authFile);
  const authDir = path.dirname(authPath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  if (fs.existsSync(authPath)) {
    fs.unlinkSync(authPath);
  }

  const username = process.env.E2E_USERNAME || 'mifos';
  const password = process.env.E2E_PASSWORD || 'password';

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAndWaitForDashboard(username, password);

  console.log('Auth setup: copying mifosXCredentials from sessionStorage → localStorage');
  const credsCopied = await page.evaluate(() => {
    const creds = sessionStorage.getItem('mifosXCredentials');
    if (!creds) return false;
    localStorage.setItem('mifosXCredentials', creds);
    return true;
  });

  if (!credsCopied) {
    throw new Error('CRITICAL: mifosXCredentials not found in sessionStorage. ' + 'Did the auth storage key change?');
  }

  await page.context().storageState({ path: authFile });
  console.log('Auth setup: storageState saved to', authFile);

  const verifyContext = await browser.newContext({ storageState: authFile });
  const verifyPage = await verifyContext.newPage();
  await verifyPage.goto('/#/');
  await expect(verifyPage).not.toHaveURL(/.*login.*/, { timeout: 30000 });
  await verifyContext.close();
  console.log('Auth setup: storageState verification passed ✓');
});
