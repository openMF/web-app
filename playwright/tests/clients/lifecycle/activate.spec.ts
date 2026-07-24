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
import { ActivateClientPage } from '../../../pages/client-actions/activate-client.page';

/**
 * WA-3.3 client lifecycle happy path: Pending → Active.
 *
 * Pattern:
 *   1. Factory creates the predecessor-state client (pending).
 *   2. UI drives the transition via `chooseAction('Activate')`.
 *   3. Assert snackbar copy + `getClient().status.value` +
 *      timeline entry (`activatedOnDate`).
 */
const SUBMITTED_ON_DATE = '01 January 2024';
const ACTIVATION_DATE = '02 January 2024';

test.describe('Client lifecycle · Activate (Pending → Active)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('activates a pending client from the client actions flow', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    const client = await createTestClient(apiSetup, cleanupGuard, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const clientViewPage = new ClientViewPage(page, client.resourceId);
    const activatePage = new ActivateClientPage(page, client.resourceId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.chooseAction('Activate');

    await activatePage.waitForLoad();
    await activatePage.submitActivation({ activationDate: ACTIVATION_DATE });

    await clientViewPage.waitForLoad();
    await expect(clientViewPage.successSnackbar).toContainText('Client activated successfully.');

    const clientDetails = await fineractApi.getClient(client.resourceId);
    expect(clientDetails.status?.value).toBe('Active');
    expect(clientDetails.timeline?.activatedOnDate).toEqual([
      2024,
      1,
      2
    ]);
  });
});
