/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { E2E_SAVINGS_PRODUCT_NAME } from '../../factories/savings.factory';
import { ClientViewPage } from '../../pages/client-view.page';
import { CreateSavingsAccountPage } from '../../pages/savings/create-savings-account.page';
import { SavingsAccountViewPage } from '../../pages/savings/savings-account-view.page';

/**
 * Savings account creation happy path — the flow Alberto called out as
 * one of the two most important client journeys.
 *
 * Pattern:
 *   1. API factory arranges the precondition (an ACTIVE client —
 *      Fineract rejects a savings application against a pending one,
 *      and the Applications menu is not even rendered).
 *   2. `ApiSetupManager` seeds the shared savings product so the run
 *      does not depend on tenant demo data.
 *   3. UI drives the stepper end to end.
 *   4. Assertions read back through the API, not the DOM — the view
 *      renders formatted strings, the API returns the state that
 *      actually persisted.
 */
const SUBMITTED_ON_DATE = '03 January 2024';

test.describe('Savings account · Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('creates a savings account from the client applications menu', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    await apiSetup.ensureMinimalSavingsProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const clientViewPage = new ClientViewPage(page, client.resourceId);
    const createPage = new CreateSavingsAccountPage(page, client.resourceId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();

    // Navigating via the menu rather than deep-linking to /create is
    // deliberate: it also covers the `@if (isActive())` gate on the
    // Applications entry, which is the guard that stops a user from
    // applying for an account against a pending client.
    await clientViewPage.openNewSavingsApplication();

    await createPage.waitForLoad();
    await createPage.submitApplication({
      productName: E2E_SAVINGS_PRODUCT_NAME,
      submittedOnDate: SUBMITTED_ON_DATE
    });

    // Fineract redirects to the new account's general view; the id is
    // only discoverable from the resulting URL.
    await page.waitForURL(/\/savings-accounts\/\d+\/general/, { timeout: 30000 });
    const savingsId = Number(page.url().match(/savings-accounts\/(\d+)\/general/)?.[1]);
    expect(Number.isInteger(savingsId)).toBe(true);

    cleanupGuard.register(`savings:${savingsId}`, async () => {
      await fineractApi.deleteSavingsAccount(savingsId);
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, savingsId);
    await viewPage.waitForLoad();

    const account = await fineractApi.getSavingsAccount(savingsId);
    expect(account.status?.value).toBe('Submitted and pending approval');
    expect(account.clientId).toBe(client.resourceId);
    expect(account.savingsProductName).toBe(E2E_SAVINGS_PRODUCT_NAME);
    expect(account.timeline?.submittedOnDate).toEqual([
      2024,
      1,
      3
    ]);
  });

  test('carries an external id through to the created account', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    await apiSetup.ensureMinimalSavingsProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const externalId = `E2E-SAV-${Date.now()}`;

    const createPage = new CreateSavingsAccountPage(page, client.resourceId);
    await createPage.navigate();
    await createPage.submitApplication({
      productName: E2E_SAVINGS_PRODUCT_NAME,
      submittedOnDate: SUBMITTED_ON_DATE,
      externalId
    });

    await page.waitForURL(/\/savings-accounts\/\d+\/general/, { timeout: 30000 });
    const savingsId = Number(page.url().match(/savings-accounts\/(\d+)\/general/)?.[1]);
    expect(Number.isInteger(savingsId)).toBe(true);

    cleanupGuard.register(`savings:${savingsId}`, async () => {
      await fineractApi.deleteSavingsAccount(savingsId);
    });

    const account = await fineractApi.getSavingsAccount(savingsId);
    expect(account.externalId).toBe(externalId);
  });
});
