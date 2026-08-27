/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient, createTestClient } from '../../factories/client.factory';
import { E2E_SAVINGS_PRODUCT_NAME } from '../../factories/savings.factory';
import { ClientViewPage } from '../../pages/client-view.page';
import { CreateSavingsAccountPage } from '../../pages/savings/create-savings-account.page';

/**
 * Savings account creation — form-level guards.
 *
 * These cover the conditional-rendering rules the create stepper
 * relies on. They are worth pinning because each one is a silent
 * behaviour rather than a visible error message, so a regression would
 * not fail the happy-path spec — it would just make it flaky.
 */
test.describe('Savings account · Create form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('hides every detail field until a product is selected', async ({ page, apiSetup, cleanupGuard }) => {
    await apiSetup.ensureMinimalSavingsProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const createPage = new CreateSavingsAccountPage(page, client.resourceId);
    await createPage.navigate();

    // `@if (savingsProductSelected)` — submitted-on is not merely
    // disabled, it is absent from the DOM.
    await expect(createPage.submittedOnDateInput).toHaveCount(0);
    await expect(createPage.productDropdown).toBeVisible();

    await createPage.selectProduct(E2E_SAVINGS_PRODUCT_NAME);
    await expect(createPage.submittedOnDateInput).toBeVisible();
  });

  test('blocks the Next button while the details step is incomplete', async ({ page, apiSetup, cleanupGuard }) => {
    await apiSetup.ensureMinimalSavingsProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const createPage = new CreateSavingsAccountPage(page, client.resourceId);
    await createPage.navigate();

    // Before a product is chosen the details form is invalid, so the
    // step's own Next button is disabled.
    await expect(createPage.nextButton.first()).toBeDisabled();
  });

  test('does not offer the Applications menu for a pending client', async ({ page, apiSetup, cleanupGuard }) => {
    // Fineract will not accept an account application for a client
    // that has not been activated, and the UI enforces that by not
    // rendering the entry point at all (`@if (isActive())`).
    const client = await createTestClient(apiSetup, cleanupGuard);

    const clientViewPage = new ClientViewPage(page, client.resourceId);
    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.openActionsMenu();

    await expect(clientViewPage.applicationsMenuItem).toHaveCount(0);
  });
});
