/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createTestSavingsAccount, createApprovedSavingsAccount } from '../../../factories/savings.factory';
import { SavingsAccountViewPage } from '../../../pages/savings/savings-account-view.page';
import { SavingsAccountActionPage } from '../../../pages/savings/savings-account-action.page';

/**
 * Savings lifecycle happy path: Pending → Approved → Active.
 *
 * Each test arranges its predecessor state through an API factory and
 * exercises exactly one transition through the UI. That keeps a
 * failure pointing at the transition under test rather than at
 * whichever earlier step happened to break first.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const APPROVED_ON_DATE = '04 January 2024';
const ACTIVATED_ON_DATE = '05 January 2024';

test.describe('Savings lifecycle · Approve and Activate', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('approves a pending savings account', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createTestSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const approvePage = new SavingsAccountActionPage(page, client.resourceId, account.resourceId, 'Approve');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Approve');

    await approvePage.waitForLoad();
    await approvePage.submit({ date: APPROVED_ON_DATE });

    await viewPage.waitForLoad();

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.status?.value).toBe('Approved');
    expect(details.timeline?.approvedOnDate).toEqual([
      2024,
      1,
      4
    ]);
  });

  test('activates an approved savings account', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createApprovedSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      approvedOnDate: APPROVED_ON_DATE
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const activatePage = new SavingsAccountActionPage(page, client.resourceId, account.resourceId, 'Activate');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Activate');

    await activatePage.waitForLoad();
    await activatePage.submit({ date: ACTIVATED_ON_DATE });

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.status?.value).toBe('Active');
    expect(details.timeline?.activatedOnDate).toEqual([
      2024,
      1,
      5
    ]);

    // The balance overview only renders once the account leaves the
    // pending/rejected states — asserting it here doubles as a check
    // that the view re-read the account after activation.
    await viewPage.navigate();
    await viewPage.waitForLoad();
    await expect(viewPage.accountOverview).toBeVisible();
  });
});
