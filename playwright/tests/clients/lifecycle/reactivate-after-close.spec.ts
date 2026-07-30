/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../../fixtures/test-fixtures';
import { ClientViewPage } from '../../../pages/client-view.page';
import { ReactivateClientPage } from '../../../pages/client-actions/reactivate-client.page';

/**
 * WA-3.3 client lifecycle happy path: Closed → Pending (Reactivate).
 *
 * Pattern:
 *   1. API creates an active client, then closes it, so the client
 *      enters the predecessor `Closed` state. This flow deliberately
 *      bypasses `createTestClient` because active/closed clients
 *      cannot be hard-deleted by the cleanup guard.
 *   2. UI drives the transition via `chooseAction('Reactivate')`.
 *   3. Assert snackbar copy + `getClient().status.value` returns to
 *      `Pending` (Fineract's documented reactivate destination — a
 *      subsequent Activate is required to reach `Active`) + the
 *      `closedOnDate` timeline entry is cleared.
 */
const SUBMITTED_ON_DATE = '01 January 2024';
const ACTIVATION_DATE = '02 January 2024';
const CLOSURE_DATE = '03 January 2024';
const REACTIVATION_DATE = '04 January 2024';
const CLOSURE_REASON_NAME = 'E2E Close Client Reason';

test.describe('Client lifecycle · Reactivate (Closed → Pending)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('reactivates a closed client from the client actions flow', async ({ page, fineractApi }) => {
    const closureReason = await fineractApi.ensureClientClosureReason(CLOSURE_REASON_NAME);
    const officeId = await fineractApi.getFirstOfficeId();

    const uniqueSuffix = Date.now();
    const createClientResponse = await fineractApi.createActiveClient(officeId, {
      firstname: `Reactivate${uniqueSuffix}`,
      lastname: 'Client',
      submittedOnDate: SUBMITTED_ON_DATE,
      activationDate: ACTIVATION_DATE
    });

    const clientId = createClientResponse.resourceId;
    await fineractApi.closeClient(clientId, closureReason.id, CLOSURE_DATE);

    const clientViewPage = new ClientViewPage(page, clientId);
    const reactivatePage = new ReactivateClientPage(page, clientId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.chooseAction('Reactivate');

    await reactivatePage.waitForLoad();
    await reactivatePage.submitReactivation({ reactivationDate: REACTIVATION_DATE });

    await clientViewPage.waitForLoad();
    await expect(clientViewPage.successSnackbar).toContainText('Client reactivated successfully.');

    const clientDetails = await fineractApi.getClient(clientId);
    // In Fineract, reactivating a closed client moves it back to
    // `Pending` state — a subsequent Activate action is required to
    // return to `Active`. The Pending status combined with the cleared
    // `closedOnDate` timeline entry is the definitive evidence that
    // the reactivate command was recorded server-side.
    expect(clientDetails.status?.value).toBe('Pending');
    expect(clientDetails.timeline?.closedOnDate).toBeFalsy();
    expect(clientDetails.timeline?.submittedOnDate).toEqual([
      2024,
      1,
      1
    ]);
  });
});
