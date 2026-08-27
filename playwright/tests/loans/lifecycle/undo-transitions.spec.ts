/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../../factories/client.factory';
import { createApprovedLoan, createActiveLoan } from '../../../factories/loan.factory';
import { LoanAccountViewPage } from '../../../pages/loans/loan-account-view.page';
import { LoanAccountActionPage } from '../../../pages/loans/loan-account-action.page';

/**
 * Loan lifecycle reversals: Undo Approval and Undo Disbursal.
 *
 * Both forms render no fields at all — just a submit button — which is
 * the case a page object built only against Approve/Disburse would get
 * wrong. Covering them separately keeps that assumption honest.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const APPROVED_ON_DATE = '04 January 2024';
const DISBURSEMENT_DATE = '05 January 2024';

test.describe('Loan lifecycle · Undo transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('returns an approved loan to pending', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createApprovedLoan(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      approvedOnDate: APPROVED_ON_DATE
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loan.resourceId);
    const undoPage = new LoanAccountActionPage(page, client.resourceId, loan.resourceId, 'Undo Approval');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Undo Approval');

    await undoPage.waitForLoad();
    await undoPage.submit();

    const details = await fineractApi.getLoan(loan.resourceId);
    expect(details.status?.value).toBe('Submitted and pending approval');
    expect(details.timeline?.approvedOnDate).toBeFalsy();
  });

  test('returns a disbursed loan to approved', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const loan = await createActiveLoan(apiSetup, cleanupGuard, client.resourceId, {
      submittedOnDate: SUBMITTED_ON_DATE,
      approvedOnDate: APPROVED_ON_DATE,
      disbursementDate: DISBURSEMENT_DATE
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loan.resourceId);
    const undoPage = new LoanAccountActionPage(page, client.resourceId, loan.resourceId, 'Undo Disbursal');

    await viewPage.navigate();
    await viewPage.waitForLoad();
    await viewPage.chooseAction('Undo Disbursal');

    await undoPage.waitForLoad();
    await undoPage.submit();

    const details = await fineractApi.getLoan(loan.resourceId);
    // Undoing a disbursal returns the loan to Approved, NOT to pending —
    // the approval survives.
    expect(details.status?.value).toBe('Approved');
    expect(details.timeline?.actualDisbursementDate).toBeFalsy();
    expect(details.timeline?.approvedOnDate).toBeTruthy();
  });
});
