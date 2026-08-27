/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { createActiveTestClient } from '../../factories/client.factory';
import { ensureClientChargeDefinition, E2E_CHARGE_NAMES, CHARGE_TIME_TYPE } from '../../factories/charge.factory';
import { AddChargePage } from '../../pages/charges/add-charge.page';

/**
 * Client charge creation through the Add Charge form.
 *
 * ── What makes this form worth its own spec file ────────────────────
 *
 * Add Charge is the most data-driven form in the client module: its
 * entire body is rendered from a charge-definition template fetched
 * *after* the user picks from the dropdown, and the set of date
 * controls differs per charge time type. Two of the three tests here
 * exist purely to pin that branching, because it is invisible to a
 * happy-path test that only ever selects one definition.
 *
 * Every test seeds its definition first. Without a client-applicable
 * definition the dropdown is empty and the form is unreachable — a
 * failure mode that reads like a broken selector rather than missing
 * tenant data.
 */
const DUE_DATE = '15 January 2024';

test.describe('Client charges · Add', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const creds = localStorage.getItem('mifosXCredentials');
      if (creds) {
        sessionStorage.setItem('mifosXCredentials', creds);
      }
    });
  });

  test('adds a specified-due-date charge to a client', async ({ page, fineractApi, apiSetup, cleanupGuard }) => {
    await ensureClientChargeDefinition(apiSetup);
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const addChargePage = new AddChargePage(page, client.resourceId);
    await addChargePage.navigate();
    await addChargePage.waitForLoad();
    await addChargePage.submitCharge({
      chargeName: E2E_CHARGE_NAMES.specifiedDueDate,
      dueDate: DUE_DATE
    });

    // Read back through the API rather than the table: the UI shows a
    // formatted amount and a localised date, so an assertion there
    // would be testing the pipes, not that the charge was stored.
    const charges = await fineractApi.getClientCharges(client.resourceId);
    const created = charges.find((charge) => charge?.name === E2E_CHARGE_NAMES.specifiedDueDate);

    expect(created).toBeDefined();
    expect(created.dueDate).toEqual([
      2024,
      1,
      15
    ]);
    expect(created.isPaid).toBe(false);
    expect(created.isWaived).toBe(false);
  });

  test('renders the due-date control only for specified-due-date charges', async ({ page, apiSetup, cleanupGuard }) => {
    await ensureClientChargeDefinition(apiSetup);
    const client = await createActiveTestClient(apiSetup, cleanupGuard);

    const addChargePage = new AddChargePage(page, client.resourceId);
    await addChargePage.navigate();
    await addChargePage.waitForLoad();

    // Before any selection the conditional block is absent entirely —
    // not disabled, absent. This is the assertion that documents why
    // `selectCharge()` has to wait for `amountInput`.
    await expect(addChargePage.amountInput).toBeHidden();
    await expect(addChargePage.dueDateInput).toBeHidden();

    await addChargePage.selectCharge(E2E_CHARGE_NAMES.specifiedDueDate);

    await expect(addChargePage.amountInput).toBeVisible();
    await expect(addChargePage.dueDateInput).toBeVisible();
    // The annual/monthly branch must NOT have rendered.
    await expect(addChargePage.feeOnMonthDayInput).toBeHidden();

    // The disabled echoes prove the template for *this* definition
    // landed, rather than some other definition's.
    expect(await addChargePage.getChargeTimeTypeText()).toContain('Specified due date');
    expect(await addChargePage.getChargeCalculationTypeText()).toContain('Flat');
  });

  test('rejects a non-client charge time type at the API boundary', async ({ apiSetup }) => {
    // ── Why this asserts a failure ────────────────────────────────
    //
    // The Add Charge component branches on charge time type and has
    // real markup for Annual and Monthly fees (`feeOnMonthDay`,
    // `feeInterval`). Those branches are unreachable: Fineract only
    // accepts `chargeTimeType: 2` when `chargeAppliesTo` is Client, so
    // no annual client-charge definition can exist to select.
    //
    // Pinning that here means the dead branches are documented rather
    // than quietly untested — and if Fineract ever widens the rule,
    // this test fails and tells us the UI branches became reachable.
    await expect(
      ensureClientChargeDefinition(apiSetup, 'E2E Client Annual Charge', CHARGE_TIME_TYPE.annual)
    ).rejects.toThrow(/chargeTimeType/);
  });
});
