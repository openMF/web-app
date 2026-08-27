/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createTestLoan, createApprovedLoan } from '../../../factories/loan.factory';
import { LoanAccountViewPage } from '../../../pages/loans/loan-account-view.page';
import { LoanAccountActionPage } from '../../../pages/loans/loan-account-action.page';

/**
 * Loan lifecycle happy path: Pending → Approved → Active.
 *
 * The disbursement test is the one that would have caught the factory
 * bug fixed alongside this work: Fineract's approve response is a thin
 * command envelope with no principal, so a factory projecting off it
 * disbursed zero. Asserting `principalDisbursed` against the approved
 * principal pins that down at the UI level too.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const APPROVED_ON_DATE = '04 January 2024';
const DISBURSEMENT_DATE = '05 January 2024';

test.describe('Loan lifecycle · Approve and Disburse', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('approves a pending loan', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createTestLoan(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loan.resourceId);
    const approvePage = new LoanAccountActionPage(page, client.resourceId, loan.resourceId, 'Approve');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Approve');

    await approvePage.waitForLoad();
    // The approve form binds `[min]="approvedOnDate"` on the expected
    // disbursement date, and that field is prefilled from the loan's
    // submitted value. Moving approval later therefore invalidates the
    // prefill and leaves Submit disabled, so the disbursement date has
    // to move with it.
    await approvePage.submit({ date: APPROVED_ON_DATE, expectedDisbursementDate: APPROVED_ON_DATE });

    await viewPage.waitForLoad();

    const details = await fineractApi.getLoan(loan.resourceId);
    expect(details.status?.value).toBe('Approved');
    expect(details.timeline?.approvedOnDate).toEqual([
      2024,
      1,
      4
    ]);
  });

  test('disburses an approved loan at its full principal', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createApprovedLoan(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      approvedOnDate: APPROVED_ON_DATE
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loan.resourceId);
    const disbursePage = new LoanAccountActionPage(page, client.resourceId, loan.resourceId, 'Disburse');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Disburse');

    await disbursePage.waitForLoad();
    // The amount field is pre-filled from the approved principal, so
    // the happy path submits without overriding it.
    await disbursePage.submit({ date: DISBURSEMENT_DATE });

    const details = await fineractApi.getLoan(loan.resourceId);
    expect(details.status?.value).toBe('Active');
    expect(details.timeline?.actualDisbursementDate).toEqual([
      2024,
      1,
      5
    ]);
    expect(details.summary?.principalDisbursed).toBe(loan.principal);
  });
});
