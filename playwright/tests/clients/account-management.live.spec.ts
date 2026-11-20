/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';

test.skip(
  !process.env.E2E_ACCOUNT_MANAGEMENT_CLIENT_ID,
  'Requires an existing scoped customer and a compatible live backend.'
);

/** Read-only integration probe. The account-live project depends on authenticated account-setup against BE-08/09/10. */
test('live WEB-1350 account contracts and disabled guarantee execution', async ({ page }) => {
  const client = process.env.E2E_ACCOUNT_MANAGEMENT_CLIENT_ID;
  test.skip(!client, 'Requires a scoped existing customer and a compatible savings-plugin/Fineract environment.');
  expect(client).toMatch(/^[1-9][0-9]*$/);
  const mainResponse = page.waitForResponse(
    (r) => r.url().includes(`/savings/account-relationships/clients/${client}/main`) && r.request().method() === 'GET'
  );
  await page.goto(`/#/clients/${client}/account-management`);
  const main = await mainResponse;
  expect(main.status()).toBe(200);
  const authoritative = await main.json();
  expect(authoritative.clientId).toBe(Number(client));
  expect(Array.isArray(authoritative.relationships)).toBe(true);
  const view = page.locator('mifosx-account-management');
  await expect(view).toBeVisible();
  for (const row of authoritative.relationships)
    await expect(view.getByRole('link', { name: String(row.savingsAccountId), exact: true })).toBeVisible();
  const templateResponse = page.waitForResponse((r) => r.url().includes('/savings/guarantee-sweeps/template'));
  await view.getByRole('tab', { name: /Guaranteed account/i }).click();
  const response = await templateResponse;
  expect(response.status()).toBe(200);
  const capabilities = await response.json();
  // This test deliberately targets the verified BE-09 contract, not a future native writer.
  expect(capabilities.manualSweep).toBe(false);
  expect(capabilities.financialEnforcement).toBe(false);
  const apply = view.locator('[data-testid="apply-guarantee"]');
  if (await apply.count()) await expect(apply).toBeDisabled();
  await expect(view).toContainText('Guarantee relationship not established');
  const plannedResponse = page.waitForResponse((r) => r.url().includes('/savings/planned-savings/template'));
  await view.getByRole('tab', { name: /Planned main account/i }).click();
  const planned = await plannedResponse;
  if (planned.status() === 404) await expect(view).toContainText('This capability endpoint is unavailable');
  else {
    expect(planned.status()).toBe(200);
    const caps = await planned.json();
    expect(caps.payrollExecution).toBe(false);
    expect(caps.maturitySettlement).toBe(false);
  }
});
