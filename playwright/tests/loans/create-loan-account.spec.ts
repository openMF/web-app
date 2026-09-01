/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { E2E_LOAN_PRODUCT_NAME } from '../../factories/loan.factory';
import { ClientViewPage } from '../../pages/client-view.page';
import { CreateLoanAccountPage } from '../../pages/loans/create-loan-account.page';
import { LoanAccountViewPage } from '../../pages/loans/loan-account-view.page';

/**
 * Loan account creation happy path — the other flow Alberto called
 * out, and the harder of the two.
 *
 * The stepper differs from savings in ways that shape these tests:
 *   - the product picker is a search-select keyed by short name;
 *   - TERMS/CHARGES/SCHEDULE/PREVIEW are gated on product selection;
 *   - the repayment schedule is computed server-side, so the flow has
 *     to wait on data, not on a step header.
 *
 * All three are handled inside `CreateLoanAccountPage`, which is why
 * these specs read as plainly as the savings ones.
 */
const SUBMITTED_ON_DATE = '03 January 2024';
const EXPECTED_DISBURSEMENT_DATE = '03 January 2024';

test.describe('Loan account · Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('creates a loan account from the client applications menu', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    await apiSetup.ensureMinimalLoanProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const clientViewPage = new ClientViewPage(page, client.resourceId);
    const createPage = new CreateLoanAccountPage(page, client.resourceId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.openNewLoanApplication();

    await createPage.waitForLoad();
    await createPage.submitApplication({
      productName: E2E_LOAN_PRODUCT_NAME,
      submittedOnDate: SUBMITTED_ON_DATE,
      expectedDisbursementDate: EXPECTED_DISBURSEMENT_DATE
    });

    await page.waitForURL(/\/loans-accounts\/\d+\/general/, { timeout: 30000 });
    const loanId = Number(page.url().match(/loans-accounts\/(\d+)\/general/)?.[1]);
    expect(Number.isInteger(loanId)).toBe(true);

    cleanupGuard.register(`loan:${loanId}`, async () => {
      await fineractApi.deleteLoan(loanId);
    });

    const viewPage = new LoanAccountViewPage(page, client.resourceId, loanId);
    await viewPage.waitForLoad();

    const loan = await fineractApi.getLoan(loanId);
    expect(loan.status?.value).toBe('Submitted and pending approval');
    expect(loan.clientId).toBe(client.resourceId);
    expect(loan.loanProductName).toBe(E2E_LOAN_PRODUCT_NAME);
    expect(loan.principal).toBeGreaterThan(0);
  });

  test('renders a server-computed repayment schedule before preview', async ({ page, apiSetup, cleanupGuard }) => {
    await apiSetup.ensureMinimalLoanProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const createPage = new CreateLoanAccountPage(page, client.resourceId);
    await createPage.navigate();

    await createPage.selectProduct(E2E_LOAN_PRODUCT_NAME);
    await createPage.fillDetailsStep({
      submittedOnDate: SUBMITTED_ON_DATE,
      expectedDisbursementDate: EXPECTED_DISBURSEMENT_DATE
    });
    await createPage.goToNextStep();

    await createPage.fillTermsStep();
    await createPage.goToNextStep();
    await createPage.goToNextStep();

    // The schedule table is populated from a /loans/template round
    // trip. Asserting on a row rather than the step header is the
    // whole point: the header appears before the data arrives, so a
    // header-only wait would let the flow race ahead of the response.
    await createPage.waitForSchedule();
    await expect(createPage.scheduleRows.first()).toBeVisible();
    expect(await createPage.scheduleRows.count()).toBeGreaterThan(0);
  });

  test('gates the terms step behind product selection', async ({ page, apiSetup, cleanupGuard }) => {
    await apiSetup.ensureMinimalLoanProduct();
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const createPage = new CreateLoanAccountPage(page, client.resourceId);
    await createPage.navigate();

    // `@if (productId)` — the TERMS step and everything after it are
    // absent from the DOM, not merely hidden.
    await expect(createPage.stepHeader('TERMS')).toHaveCount(0);
    await expect(createPage.principalInput).toHaveCount(0);

    await createPage.selectProduct(E2E_LOAN_PRODUCT_NAME);
    await expect(createPage.stepHeader('TERMS')).toBeVisible();
  });
});
