/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect } from '@playwright/test';
test.describe('Authenticated Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Playwright storageState only restores localStorage and cookies.
    // The Fineract web app expects credentials in sessionStorage.
    // We injected credentials into localStorage during auth.setup.ts,
    // so we must restore them to sessionStorage before the page runs.
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('should load dashboard without login redirect', async ({ page }) => {
    await page.goto('/#/');

    await expect(page).not.toHaveURL(/.*login.*/, { timeout: 30000 });
    await expect(page.locator('mat-toolbar')).toBeVisible({ timeout: 10000 });
  });
});
