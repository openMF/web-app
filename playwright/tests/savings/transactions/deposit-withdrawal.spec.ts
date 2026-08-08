/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createActiveSavingsAccount } from '../../../factories/savings.factory';
import { SavingsAccountViewPage } from '../../../pages/savings/savings-account-view.page';
import { SavingsTransactionPage } from '../../../pages/savings/savings-transaction.page';

/**
 * Savings money movement: deposit and withdrawal.
 *
 * Balance assertions read `summary.accountBalance` from the API rather
 * than scraping the overview table, because the table renders a
 * currency-formatted string whose separators and symbol depend on
 * tenant locale settings. A spec that asserted on "$150.00" would pass
 * or fail based on configuration that has nothing to do with the
 * transaction.
 *
 * Both tests exercise the three-step linear stepper (details →
 * confirm → complete), which is the part of this form most likely to
 * trip up a naive implementation.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const ACTIVATED_ON_DATE = '05 January 2024';
const TRANSACTION_DATE = '06 January 2024';

test.describe('Savings transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('deposits funds and increases the account balance', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createActiveSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      activatedOnDate: ACTIVATED_ON_DATE
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const depositPage = new SavingsTransactionPage(page, client.resourceId, account.resourceId, 'Deposit');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Deposit');

    await depositPage.waitForLoad();
    await depositPage.submitTransaction({ date: TRANSACTION_DATE, amount: '500' });

    await viewPage.waitForLoad();

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.summary?.accountBalance).toBe(500);
  });

  test('withdraws funds and decreases the account balance', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createActiveSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      activatedOnDate: ACTIVATED_ON_DATE
    });

    // Seed the opening balance through the API. Driving the deposit
    // through the UI too would make this spec fail for two unrelated
    // reasons, and the deposit path already has its own coverage above.
    await fineractApi.createSavingsTransaction(account.resourceId, 'deposit', TRANSACTION_DATE, 500);

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const withdrawPage = new SavingsTransactionPage(page, client.resourceId, account.resourceId, 'Withdrawal');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Withdrawal');

    await withdrawPage.waitForLoad();
    await withdrawPage.submitTransaction({ date: TRANSACTION_DATE, amount: '200' });

    await viewPage.waitForLoad();

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.summary?.accountBalance).toBe(300);
  });
});
