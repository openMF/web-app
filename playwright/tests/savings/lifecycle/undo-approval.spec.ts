/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createApprovedSavingsAccount } from '../../../factories/savings.factory';
import { SavingsAccountViewPage } from '../../../pages/savings/savings-account-view.page';
import { SavingsAccountActionPage } from '../../../pages/savings/savings-account-action.page';

/**
 * Savings lifecycle reversal: Approved → Pending.
 *
 * Worth a dedicated spec because undo-approval is the only savings
 * action form with no date field at all — just a note and Confirm.
 * A page object that assumed every action form has a date input would
 * pass the approve/activate specs and fail only here.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const APPROVED_ON_DATE = '04 January 2024';

test.describe('Savings lifecycle · Undo approval', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('returns an approved account to pending', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const account = await createApprovedSavingsAccount(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      approvedOnDate: APPROVED_ON_DATE
    });

    const viewPage = new SavingsAccountViewPage(page, client.resourceId, account.resourceId);
    const undoPage = new SavingsAccountActionPage(page, client.resourceId, account.resourceId, 'Undo Approval');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Undo Approval');

    await undoPage.waitForLoad();
    // No date to supply — the form is note-only.
    await undoPage.submit({ note: 'Reverted by E2E suite' });

    const details = await fineractApi.getSavingsAccount(account.resourceId);
    expect(details.status?.value).toBe('Submitted and pending approval');
    // The approval must be erased from the timeline, not merely
    // superseded — a status flip with a lingering approvedOnDate would
    // leave the account un-approvable a second time.
    expect(details.timeline?.approvedOnDate).toBeFalsy();
  });
});
