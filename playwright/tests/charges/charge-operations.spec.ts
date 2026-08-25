/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { createTestClientCharge, E2E_CHARGE_NAMES } from '../../factories/charge.factory';
import { ClientChargesPage } from '../../pages/charges/client-charges.page';
import { ChargeViewPage } from '../../pages/charges/charge-view.page';

/**
 * Client charge operations: pay, waive and delete.
 *
 * ── Why these arrange through the API ───────────────────────────────
 *
 * Each test needs an existing charge. Creating it through the Add
 * Charge form would make every one of these tests fail whenever that
 * form breaks, hiding whichever operation actually regressed. The
 * form has its own spec; this file only exercises what happens after.
 *
 * ── Fineract's deletion rule ────────────────────────────────────────
 *
 * A client charge hard-deletes only while unpaid. The pay and waive
 * tests therefore leave a charge the `CleanupGuard` cannot remove;
 * that failure is recorded rather than thrown, exactly as with
 * activated savings accounts and disbursed loans.
 */
const DUE_DATE = '15 January 2024';
const PAY_DATE = '20 January 2024';

test.describe('Client charges · Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('lists a charge on the client general tab', async ({ page, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    await createTestClientCharge(apiSetup, cleanupGuard, client.resourceId, { dueDate: DUE_DATE });

    const chargesPage = new ClientChargesPage(page, client.resourceId);
    await chargesPage.navigate();
    await chargesPage.waitForLoad();
    await chargesPage.waitForCharge(E2E_CHARGE_NAMES.specifiedDueDate);

    // Outstanding is the last data column; a freshly created charge
    // should be fully outstanding.
    const outstanding = await chargesPage.getChargeCellText(E2E_CHARGE_NAMES.specifiedDueDate, 5);
    expect(outstanding).toContain('100');
  });

  test('pays a charge and reduces the outstanding amount', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const charge = await createTestClientCharge(apiSetup, cleanupGuard, client.resourceId, { dueDate: DUE_DATE });

    const chargeView = new ChargeViewPage(page, client.resourceId, charge.resourceId);
    await chargeView.navigate();
    await chargeView.waitForLoad();
    await chargeView.openPayForm();
    await chargeView.payCharge({ amount: '100', date: PAY_DATE });

    const details = await fineractApi.getClientCharge(client.resourceId, charge.resourceId);
    expect(details.isPaid).toBe(true);
    expect(details.amountPaid).toBe(100);
    expect(details.amountOutstanding).toBe(0);
  });

  test('waives a charge from the detail view', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const charge = await createTestClientCharge(apiSetup, cleanupGuard, client.resourceId, { dueDate: DUE_DATE });

    const chargeView = new ChargeViewPage(page, client.resourceId, charge.resourceId);
    await chargeView.navigate();
    await chargeView.waitForLoad();
    await chargeView.waiveCharge();

    // Waive neither navigates nor opens a dialog, so the API is the
    // only unambiguous completion signal. `expect.poll` keeps the wait
    // explicit instead of hiding it behind a sleep.
    await expect
      .poll(
        async () => {
          const details = await fineractApi.getClientCharge(client.resourceId, charge.resourceId);
          return details.isWaived;
        },
        { timeout: 30000 }
      )
      .toBe(true);

    const details = await fineractApi.getClientCharge(client.resourceId, charge.resourceId);
    expect(details.amountWaived).toBe(100);
    expect(details.amountOutstanding).toBe(0);
  });

  test('deletes an unpaid charge and returns to the general tab', async ({
    page,
    fineractApi,
    apiSetup,
    cleanupGuard
  }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    const charge = await createTestClientCharge(apiSetup, cleanupGuard, client.resourceId, { dueDate: DUE_DATE });

    const chargeView = new ChargeViewPage(page, client.resourceId, charge.resourceId);
    await chargeView.navigate();
    await chargeView.waitForLoad();
    await chargeView.deleteCharge();

    const charges = await fineractApi.getClientCharges(client.resourceId);
    expect(charges.find((entry) => entry?.id === charge.resourceId)).toBeUndefined();
  });

  test('shows the charge in the read-only charges overview', async ({ page, apiSetup, cleanupGuard }) => {
    const client = await createActiveTestClient(apiSetup, cleanupGuard);
    await createTestClientCharge(apiSetup, cleanupGuard, client.resourceId, { dueDate: DUE_DATE });

    const chargesPage = new ClientChargesPage(page, client.resourceId);
    await chargesPage.openChargesOverview();

    await expect(chargesPage.overviewRows.first()).toBeVisible({ timeout: 30000 });
    await expect(chargesPage.overviewRows.filter({ hasText: E2E_CHARGE_NAMES.specifiedDueDate })).toHaveCount(1);
  });
});
