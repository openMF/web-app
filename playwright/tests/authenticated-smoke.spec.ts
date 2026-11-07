/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect } from '../fixtures/auth-session';
test.describe('Authenticated Smoke Tests', () => {
  test('should load dashboard without login redirect', async ({ page }) => {
    await page.goto('/#/');

    await expect(page).not.toHaveURL(/.*login.*/, { timeout: 30000 });
    await expect(page.locator('mat-toolbar')).toBeVisible({ timeout: 10000 });
  });
});
