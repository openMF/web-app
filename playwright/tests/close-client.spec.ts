/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../fixtures/test-fixtures';
import { ClientViewPage } from '../pages/client-view.page';
import { CloseClientPage } from '../pages/close-client.page';

const SUBMITTED_ON_DATE = '01 January 2024';
const ACTIVATION_DATE = '02 January 2024';
const CLOSURE_DATE = '03 January 2024';
const ACTIVE_LOAN_TEST_DATE = '04 January 2024';
const CLOSURE_REASON_NAME = 'E2E Close Client Reason';

test.describe('Close Client Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('should close an active client from the client actions flow', async ({ page, fineractApi }) => {
    await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();

    const uniqueSuffix = Date.now();
    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `Close${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE,
      activationDate: ACTIVATION_DATE
    });

    const clientId = createClientResponse.resourceId;
    const clientViewPage = new ClientViewPage(page, clientId);
    const closeClientPage = new CloseClientPage(page, clientId);

    await clientViewPage.navigate();
    await clientViewPage.chooseAction('Close');

    await closeClientPage.waitForLoad();
    await closeClientPage.submitClosure({
      closureDate: CLOSURE_DATE,
      reasonName: CLOSURE_REASON_NAME
    });

    await clientViewPage.waitForLoad();
    await expect(clientViewPage.successSnackbar).toContainText('Client closed successfully.');

    await clientViewPage.openActionsSubmenu();
    await expect(clientViewPage.actionMenuItem('Reactivate')).toBeVisible();
    await clientViewPage.dismissOverlay();

    await clientViewPage.gotoPersonalDataTab();
    await expect(clientViewPage.closedDateValue()).toContainText('03 January 2024');

    const clientDetails = await fineractApi.getClient(clientId);
    expect(clientDetails.status?.value).toBe('Closed');
    expect(clientDetails.timeline?.closedOnDate).toEqual([
      2024,
      1,
      3
    ]);
  });

  test('should keep the close form invalid until both closure date and reason are provided', async ({
    page,
    fineractApi
  }) => {
    await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();
    const uniqueSuffix = Date.now();

    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `Validation${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE,
      activationDate: ACTIVATION_DATE
    });

    const clientId = createClientResponse.resourceId;
    const clientViewPage = new ClientViewPage(page, clientId);
    const closeClientPage = new CloseClientPage(page, clientId);

    await clientViewPage.navigate();
    await clientViewPage.chooseAction('Close');

    await closeClientPage.waitForLoad();
    await expect(closeClientPage.confirmButton).toBeDisabled();

    await closeClientPage.closureDateInput.fill(CLOSURE_DATE);
    await closeClientPage.closureDateInput.blur();
    await expect(closeClientPage.confirmButton).toBeDisabled();

    await closeClientPage.selectClosureReason(CLOSURE_REASON_NAME);
    await expect(closeClientPage.confirmButton).toBeEnabled();
  });

  test('should show Reactivate for a client already closed through the API', async ({ page, fineractApi }) => {
    const closureReason = await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();
    const uniqueSuffix = Date.now();

    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `Closed${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE,
      activationDate: ACTIVATION_DATE
    });

    const clientId = createClientResponse.resourceId;
    await fineractApi.closeClient(clientId, closureReason.id, CLOSURE_DATE);

    const clientViewPage = new ClientViewPage(page, clientId);
    await clientViewPage.navigate();

    await clientViewPage.openActionsSubmenu();
    await expect(clientViewPage.actionMenuItem('Reactivate')).toBeVisible();
  });

  test('should keep the client active when cancel or browser back is used from the close flow', async ({
    page,
    fineractApi
  }) => {
    await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();
    const uniqueSuffix = Date.now();

    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `CancelBack${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE,
      activationDate: ACTIVATION_DATE
    });

    const clientId = createClientResponse.resourceId;
    const clientViewPage = new ClientViewPage(page, clientId);
    const closeClientPage = new CloseClientPage(page, clientId);

    await clientViewPage.navigate();
    await clientViewPage.chooseAction('Close');

    await closeClientPage.waitForLoad();
    await closeClientPage.cancelButton.click();
    await closeClientPage.waitForCancelNavigation();

    let clientDetails = await fineractApi.getClient(clientId);
    expect(clientDetails.status?.value).toBe('Active');

    await clientViewPage.openActionsSubmenu();
    await expect(clientViewPage.actionMenuItem('Close')).toBeVisible();
    await clientViewPage.dismissOverlay();

    await clientViewPage.gotoPersonalDataTab();
    await expect(clientViewPage.closedDateValue()).toHaveCount(0);

    await clientViewPage.navigate();
    await clientViewPage.chooseAction('Close');

    await closeClientPage.waitForLoad();
    await closeClientPage.closureDateInput.fill(CLOSURE_DATE);
    await closeClientPage.closureDateInput.blur();
    await closeClientPage.selectClosureReason(CLOSURE_REASON_NAME);

    await page.goBack();
    await closeClientPage.waitForCancelNavigation();

    clientDetails = await fineractApi.getClient(clientId);
    expect(clientDetails.status?.value).toBe('Active');

    await clientViewPage.openActionsSubmenu();
    await expect(clientViewPage.actionMenuItem('Close')).toBeVisible();
    await clientViewPage.dismissOverlay();

    await clientViewPage.gotoPersonalDataTab();
    await expect(clientViewPage.closedDateValue()).toHaveCount(0);
  });

  test('should reject closing a client with an active loan', async ({ page, fineractApi }) => {
    const closureReason = await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();
    const uniqueSuffix = Date.now();

    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `LoanBlock${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: ACTIVE_LOAN_TEST_DATE,
      activationDate: ACTIVE_LOAN_TEST_DATE
    });

    const clientId = createClientResponse.resourceId;
    const loan = await fineractApi.createActiveLoanForClient(clientId, ACTIVE_LOAN_TEST_DATE, ACTIVE_LOAN_TEST_DATE);

    expect(loan.status?.value).toBe('Active');

    const clientViewPage = new ClientViewPage(page, clientId);
    const closeClientPage = new CloseClientPage(page, clientId);

    await clientViewPage.navigate();
    await clientViewPage.chooseAction('Close');

    await closeClientPage.waitForLoad();
    await closeClientPage.submitClosure({
      closureDate: ACTIVE_LOAN_TEST_DATE,
      reasonName: closureReason.name
    });

    await expect(page).toHaveURL(new RegExp(`/clients/${clientId}/actions/Close$`));
    await expect(page.getByText('Client cannot be closed because of non-closed loans.')).toBeVisible();

    const clientDetails = await fineractApi.getClient(clientId);
    expect(clientDetails.status?.value).toBe('Active');
  });
});
