/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createTestSavingsAccount } from '../../../factories/savings.factory';
import { SavingsAccountViewPage } from '../../../pages/savings/savings-account-view.page';
import { SavingsAccountActionPage } from '../../../pages/savings/savings-account-action.page';

/**
 * Savings lifecycle terminal path: Pending → Rejected.
 *
 * This spec is the one that justifies `chooseAction()`'s submenu
 * fallback. `SavingsButtonsConfiguration` puts `Approve` in the
 * top-level menu but `Reject` under "More" for a pending account — if
 * the page object only looked at the top level, approve would pass and
 * reject would fail with an unhelpful "menuitem not found".
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const REJECTED_ON_DATE = '04 January 2024';

test.describe('Savings lifecycle · Reject', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('rejects a pending savings account from the More submenu', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createTestSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const rejectPage = new SavingsAccountActionPage(page, client.resourceId, account.resourceId, 'Reject');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Reject');

    await rejectPage.waitForLoad();
    await rejectPage.submit({ date: REJECTED_ON_DATE, note: 'Rejected by E2E suite' });

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.status?.value).toBe('Rejected');
    expect(details.timeline?.rejectedOnDate).toEqual([
      2024,
      1,
      4
    ]);
  });
});
