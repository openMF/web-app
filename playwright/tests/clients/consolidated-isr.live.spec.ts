/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';
import { LoginPage } from '../../pages/login.page';
import { ConsolidatedIsrPage } from '../../pages/consolidated-isr.page';

/** No fixture seeding or financial writes. Operator must provide an explicitly synthetic scoped client. */
test('live ISR diagnostics require a compatible deployed BE-11 and a controlled synthetic customer', async ({
  page,
  request
}) => {
  const client = process.env.E2E_ISR_CLIENT_ID;
  const from = process.env.E2E_ISR_FROM;
  const through = process.env.E2E_ISR_THROUGH;
  test.skip(
    process.env.E2E_ISR_SYNTHETIC !== '1' || !client || !from || !through,
    'Blocked: supply E2E_ISR_SYNTHETIC=1, a controlled E2E_ISR_CLIENT_ID and E2E_ISR_FROM/THROUGH against deployed BE-11.'
  );
  if (!client || !from || !through) return;
  expect(client).toMatch(/^[1-9]\d*$/);
  const username = process.env.E2E_USERNAME || 'mifos';
  const password = process.env.E2E_PASSWORD || 'password';
  const server = (process.env.E2E_FINERACT_URL || 'https://localhost:8443').replace(/\/+$/, '');
  const root = server + '/fineract-provider/api/v1/savings/consolidated-isr';
  const tenant = process.env.E2E_TENANT || 'default';
  const headers = {
    Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    'Fineract-Platform-TenantId': tenant
  };
  const template = await request.get(root + '/template', { headers });
  test.skip(template.status() === 404, 'Blocked: BE-11 consolidated ISR template is not deployed on this backend.');
  expect(template.status()).toBe(200);
  const caps = await template.json();
  expect(typeof caps.eligibilityDiagnostics).toBe('boolean');
  test.skip(caps.eligibilityDiagnostics !== true, 'Blocked: runtime capability disables eligibility diagnostics.');
  const period = new URLSearchParams({ from, through }).toString();
  for (const endpoint of [
    'eligibility',
    'accounts',
    'preview'
  ]) {
    if (endpoint === 'accounts' && caps.nativeBalanceObservations !== true) continue;
    const response = await request.get(`${root}/clients/${client}/${endpoint}?${period}`, { headers });
    expect(response.status()).toBe(200);
    const body = await response.json();
    if (endpoint !== 'accounts') expect(body.clientId).toBe(Number(client));
    if (endpoint === 'preview' && body.state === 'BLOCKED_PENDING_POLICY') {
      expect(body.taxableBase ?? null).toBeNull();
      expect(body.calculatedIsr ?? null).toBeNull();
      expect(body.actualWithheldAmount ?? null).toBeNull();
      expect(body.allocations).toEqual([]);
    }
  }
  // Authentication is the only POST permitted in this read-only live browser flow.
  await page.route('**/fineract-provider/**', async (route) => {
    const req = route.request();
    expect(req.method() === 'GET' || (req.method() === 'POST' && /\/authentication(?:\?|$)/.test(req.url()))).toBe(
      true
    );
    await route.continue();
  });
  await page.addInitScript(
    ({ tenant, server }) => {
      localStorage.setItem('mifosXTenantIdentifier', tenant);
      localStorage.setItem('mifosXServerURL', server);
    },
    { tenant, server }
  );
  const login = new LoginPage(page);
  await login.navigate();
  await login.loginAndWaitForDashboard(username, password);
  const ui = new ConsolidatedIsrPage(page);
  await ui.open(Number(client));
  await ui.inspect(from, through);
  await expect(ui.view.getByTestId('isr-eligible-count')).toBeVisible();
  if (caps.calculation !== true) await expect(ui.view).toContainText('pending approved tax rules');
  if (caps.withholdingExecution !== true) await expect(ui.view).toContainText('not currently available');
  await expect(ui.view.getByRole('button', { name: /withhold|execute|pay tax/i })).toHaveCount(0);
});
