/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { createTestClient } from '../../../factories/client.factory';
import { ClientViewPage } from '../../../pages/client-view.page';
import { ROUTES } from '../../../config/routes';

/**
 * WA-3.3 client lifecycle happy path: Rejected → Pending (Undo Rejection).
 *
 * Pattern:
 *   1. Factory creates a pending client; API immediately rejects it so
 *      the client enters the predecessor `Rejected` state.
 *   2. UI drives the transition via `chooseAction('Undo Rejection')`.
 *      Undo Rejection carries a single `reopenedDate` control and has
 *      no dedicated page object yet, so the field is driven inline.
 *   3. Assert snackbar copy + `getClient().status.value` returns to
 *      `Pending` + `timeline.rejectedOnDate` is cleared.
 */
const SUBMITTED_ON_DATE = '01 January 2024';
const REJECTION_DATE = '02 January 2024';
const REOPENED_DATE = '03 January 2024';
const REJECTION_REASON_NAME = 'E2E Reject Client Reason';

test.describe('Client lifecycle · Undo Rejection (Rejected → Pending)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('undoes a rejection from the client actions flow', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const rejectionReason = await fineractApi.ensureClientRejectionReason(REJECTION_REASON_NAME);

    const client = await createTestClient(apiSetup, cleanupGuard, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    // Predecessor state: reject through the API so the UI transition
    // under test is Undo Rejection, not the initial rejection.
    await fineractApi.rejectClient(client.resourceId, rejectionReason.id, REJECTION_DATE);

    const clientViewPage = new ClientViewPage(page, client.resourceId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.chooseAction('Undo Rejection');

    await expect(page).toHaveURL(new RegExp(`${ROUTES.clientAction(client.resourceId, 'Undo Rejection')}$`));

    const reopenedDateInput = page.locator('input[formcontrolname="reopenedDate"]');
    await reopenedDateInput.waitFor({ state: 'visible', timeout: 30000 });
    await reopenedDateInput.fill(REOPENED_DATE);
    await reopenedDateInput.blur();

    const confirmButton = page.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await clientViewPage.waitForLoad();
    await expect(clientViewPage.successSnackbar).toContainText('Client rejection undone successfully.');

    const clientDetails = await fineractApi.getClient(client.resourceId);
    expect(clientDetails.status?.value).toBe('Pending');
    // Fineract clears the rejection timestamp when a rejection is undone.
    expect(clientDetails.timeline?.rejectedOnDate).toBeFalsy();
  });
});
