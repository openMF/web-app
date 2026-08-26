/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createTestLoan } from '../../../factories/loan.factory';
import { LoanAccountViewPage } from '../../../pages/loans/loan-account-view.page';
import { LoanAccountActionPage } from '../../../pages/loans/loan-account-action.page';

/**
 * Loan lifecycle terminal path: Pending → Rejected.
 *
 * Unlike savings, `Reject` is a TOP-LEVEL entry on the loan action
 * menu rather than a "More" submenu item. That asymmetry between the
 * two modules is exactly why `chooseAction()` probes both instead of
 * hard-coding a menu location per action.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const REJECTED_ON_DATE = '04 January 2024';

test.describe('Loan lifecycle · Reject', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('rejects a pending loan', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createTestLoan(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loan.resourceId);
    const rejectPage = new LoanAccountActionPage(page, client.resourceId, loan.resourceId, 'Reject');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Reject');

    await rejectPage.waitForLoad();
    await rejectPage.submit({ date: REJECTED_ON_DATE, note: 'Rejected by E2E suite' });

    const details = await fineractApi.getLoan(loan.resourceId);
    expect(details.status?.value).toBe('Rejected');
    expect(details.timeline?.rejectedOnDate).toEqual([
      2024,
      1,
      4
    ]);
  });
});
