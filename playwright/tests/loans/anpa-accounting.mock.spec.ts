/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';

/** Browser states with mocked ANPA responses. Never counts as local API verification. */
test.describe('WEB-1205 mocked failure states', () => {
  test.skip(
    !process.env.E2E_ANPA_LOAN_ID,
    'Set E2E_ANPA_LOAN_ID to a synthetic loan for native parent route resolution.'
  );
  for (const status of [
    403,
    404,
    503
  ]) {
    test(`shows precise template failure ${status}`, async ({ page }) => {
      await page.route('**/anpa-writeoff/template', (route) =>
        route.fulfill({ status, contentType: 'application/json', body: '{}' })
      );
      await page.goto(`/#/loans/${process.env.E2E_ANPA_LOAN_ID}/anpa-accounting`);
      const panel = page.locator('mifosx-anpa-accounting');
      await expect(panel.locator('mat-card.error')).toBeVisible();
      await expect(panel.getByText(/Backend connected/)).toHaveCount(0);
      await expect(panel.getByRole('button', { name: 'Create Adjustment Proposal', exact: true })).toHaveCount(0);
      await expect(panel).toContainText(
        status === 403
          ? 'Permission denied'
          : status === 404
            ? 'endpoint unavailable'
            : 'Unable to reach the configured backend or proxy'
      );
    });
  }
  test('shows loading and then empty history without assuming zero balances', async ({ page }) => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/anpa-writeoff/template', async (route) => {
      await pending;
      await route.continue();
    });
    await page.route('**/anpa-writeoff/loans/*/assessments?*', (route) => route.fulfill({ json: [] }));
    await page.goto(`/#/loans/${process.env.E2E_ANPA_LOAN_ID}/anpa-accounting`);
    const panel = page.locator('mifosx-anpa-accounting');
    await expect(panel.getByRole('progressbar')).toBeVisible();
    release();
    await expect(panel.getByText(/Backend connected/)).toBeVisible();
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'History and Audit' }).click();
    await expect(
      panel
        .locator('mat-expansion-panel')
        .filter({ has: page.locator('mat-expansion-panel-header').filter({ hasText: 'History and Audit' }) })
        .getByText('No records available')
        .first()
    ).toBeVisible();
  });
});
