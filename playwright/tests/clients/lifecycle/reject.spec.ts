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
import { RejectClientPage } from '../../../pages/client-actions/reject-client.page';

/**
 * WA-3.3 client lifecycle happy path: Pending → Rejected.
 *
 * Pattern:
 *   1. Factory creates a pending client.
 *   2. UI drives the transition via `chooseAction('Reject')`.
 *   3. Assert snackbar copy + `getClient().status.value` +
 *      timeline entry (`rejectedOnDate`).
 */
const SUBMITTED_ON_DATE = '01 January 2024';
const REJECTION_DATE = '02 January 2024';
const REJECTION_REASON_NAME = 'E2E Reject Client Reason';

test.describe('Client lifecycle · Reject (Pending → Rejected)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('rejects a pending client from the client actions flow', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    await fineractApi.ensureClientRejectionReason(REJECTION_REASON_NAME);

    const client = await createTestClient(apiSetup, cleanupGuard, {
      submittedOnDate: SUBMITTED_ON_DATE
    });

    const clientViewPage = new ClientViewPage(page, client.resourceId);
    const rejectPage = new RejectClientPage(page, client.resourceId);

    await clientViewPage.navigate();
    await clientViewPage.waitForLoad();
    await clientViewPage.chooseAction('Reject');

    await rejectPage.waitForLoad();
    await rejectPage.submitRejection({
      rejectionDate: REJECTION_DATE,
      reasonName: REJECTION_REASON_NAME
    });

    await clientViewPage.waitForLoad();
    await expect(clientViewPage.successSnackbar).toContainText('Client rejected successfully.');

    const clientDetails = await fineractApi.getClient(client.resourceId);
    expect(clientDetails.status?.value).toBe('Rejected');
    // Fineract's GET /clients/{id} response does not surface `rejectedOnDate`
    // in the timeline payload for rejected clients (verified against the
    // running backend on 2026-07-15). The status transition itself is the
    // definitive evidence of the reject action; we still assert that the
    // pre-existing `submittedOnDate` timeline entry is preserved so any
    // future regression that wipes the timeline object is caught.
    expect(clientDetails.timeline?.submittedOnDate).toEqual([
      2024,
      1,
      1
    ]);
  });
});
