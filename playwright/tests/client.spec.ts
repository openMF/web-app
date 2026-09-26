/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ClientPage } from '../pages/client.page';

/**
 * Client Module E2E Tests
 *
 * Validates the core client management functionality of the Mifos X Web App.
 *
 * Prerequisites:
 * - Angular dev server running on http://localhost:4200
 * - Fineract backend accessible (via proxy to https://localhost:8443)
 *
 * Test Data:
 * - Valid credentials: mifos / password
 */

// Skip in CI - requires Fineract backend
test.skip(!!process.env.CI, 'Requires Fineract backend');

test.describe('Client Module', () => {
  let loginPage: LoginPage;
  let clientPage: ClientPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);

    await loginPage.navigate();
    await loginPage.loginAndWaitForDashboard('mifos', 'password');
  });

  test('should display the client list', async () => {
    await clientPage.navigateToClients();

    await clientPage.assertClientListVisible();
    await expect(clientPage.createClientButton).toBeVisible();
  });

  test('should open the create client form', async ({ page }) => {
    await clientPage.navigateToClients();
    await clientPage.openCreateClientForm();

    await clientPage.assertCreateFormVisible();
    await expect(page).toHaveURL(/.*clients\/create.*/);
  });

  test('should open a client profile', async () => {
    await clientPage.navigateToClients();

    // Trigger search to populate the table
    await clientPage.searchClient('');

    await expect(clientPage.clientRows.first()).toBeVisible({ timeout: 30000 });
    await clientPage.openClientProfile();
    await clientPage.assertClientDetailVisible();
  });
});
