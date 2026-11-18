/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

// Frontend contract tests for the Connection card on the login page. The backend is synthetic,
// so the connection can be cut, hung and restored on demand.
test.use({ storageState: { cookies: [], origins: [] } });

/** How the synthetic health endpoint answers. */
type Health = 'up' | 'refused' | 'hang';

interface Backend {
  health: Health;
  healthChecks: number;
  infoRequests: number;
}

async function prepare(
  page: Page,
  options: { displayBackEndInfo?: boolean; health?: Health; tenantIds?: string } = {}
): Promise<Backend> {
  const backend: Backend = { health: options.health ?? 'up', healthChecks: 0, infoRequests: 0 };

  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.env = Object.assign(${JSON.stringify({
        fineractPlatformTenantId: 'synthetic-card',
        fineractPlatformTenantIds: options.tenantIds ?? 'synthetic-card',
        defaultLanguage: 'en-US',
        displayBackEndInfo: String(options.displayBackEndInfo ?? true)
      })}, { fineractApiUrl: window.location.origin });`
    })
  );
  await page.addInitScript(() => {
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: 'en', name: 'en-US' }));
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/actuator/health')) {
      backend.healthChecks++;
      if (backend.health === 'up') {
        await route.fulfill({ json: { status: 'UP' } });
      } else if (backend.health === 'refused') {
        await route.abort('connectionrefused');
      }
      // 'hang' never answers, so only the check's own timeout ends it.
      return;
    }
    if (path.endsWith('/actuator/info')) {
      backend.infoRequests++;
      // A server that is down fails every request, and a failed request through the interceptors
      // would raise an error alert.
      await (backend.health === 'up'
        ? route.fulfill({ json: { git: { build: { version: '1.17.0-SNAPSHOT' } } } })
        : route.fulfill({ status: 500, body: '' }));
      return;
    }
    await route.fulfill({ json: [] });
  });
  return backend;
}

const card = (page: Page) => page.locator('mifosx-connection-card .connection-card');
const statusText = (page: Page) => card(page).locator('.status-text');
const toggle = (page: Page) => card(page).locator('button.toggle');
const cell = (page: Page, label: string) =>
  card(page)
    .locator('.cell')
    .filter({ has: page.locator('dt', { hasText: label }) })
    .locator('dd');

test.describe('Login connection card', () => {
  test('is not rendered, and checks nothing, when MIFOS_DISPLAY_BACKEND_INFO is off', async ({ page }) => {
    const backend = await prepare(page, { displayBackEndInfo: false });

    await page.goto('/#/login');
    await expect(page.locator('mifosx-login-form')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('mifosx-connection-card')).toHaveCount(0);
    expect(backend.healthChecks).toBe(0);
  });

  test('shows a reachable server and its details', async ({ page }) => {
    await prepare(page);
    await page.goto('/#/login');

    await expect(card(page)).toHaveAttribute('data-state', 'online');
    await expect(statusText(page)).toHaveText('Server reachable');
    await expect(cell(page, 'Server')).toHaveText(new URL(page.url()).host);
    await expect(cell(page, 'Tenant ID')).toHaveText('synthetic-card');
    await expect(cell(page, 'Apache Fineract')).toHaveText('1.17.0-SNAPSHOT');
    await expect(cell(page, 'Mifos® WebApp')).not.toHaveText('');
  });

  test('shows a refused connection as unreachable, with no Fineract version', async ({ page }) => {
    const backend = await prepare(page, { health: 'refused' });
    await page.goto('/#/login');

    await expect(card(page)).toHaveAttribute('data-state', 'offline');
    await expect(statusText(page)).toHaveText('Server unreachable');
    await expect(cell(page, 'Apache Fineract')).toHaveText('—');
    await page.waitForLoadState('networkidle');
    // The check bypasses the interceptors and the version is only asked for once the server
    // answers, so nothing raises an error alert.
    expect(backend.infoRequests).toBe(0);
    await expect(page.locator('simple-snack-bar, mat-snack-bar-container')).toHaveCount(0);
  });

  test('reports a hung server within 5 seconds and recovers on the next check', async ({ page }) => {
    // Pause before the page loads, so the check starts at a known time and its timeout is
    // measured exactly. pauseAt needs a target ahead of the running clock, hence the second.
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    await page.clock.install({ time: start });
    await page.clock.pauseAt(start + 1000);
    const backend = await prepare(page, { health: 'hang' });
    await page.goto('/#/login');
    await expect(statusText(page)).toHaveText('Checking connection…');

    await page.clock.runFor(4999);
    await expect(statusText(page)).toHaveText('Checking connection…');
    await page.clock.runFor(1);
    await expect(statusText(page)).toHaveText('Server unreachable');

    backend.health = 'up';
    await page.clock.runFor(30000);
    await expect(statusText(page)).toHaveText('Server reachable');
  });

  test('collapses and expands, and remembers the choice after a reload', async ({ page }) => {
    await prepare(page);
    await page.goto('/#/login');
    const details = card(page).locator('.details');

    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle(page)).toHaveAccessibleName('Hide connection details');
    await expect(details).toBeVisible();

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toHaveAccessibleName('Show connection details');
    await expect(details).toBeHidden();
    await expect(cell(page, 'Server')).toBeHidden();
    await expect(statusText(page)).toBeVisible();

    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(details).toBeHidden();

    await toggle(page).click();
    await expect(details).toBeVisible();
  });

  test('updates the tenant ID as soon as another tenant is selected', async ({ page }) => {
    await prepare(page, { tenantIds: 'synthetic-card,second-tenant' });
    await page.goto('/#/login');
    await expect(cell(page, 'Tenant ID')).toHaveText('synthetic-card');

    await page.locator('mifosx-tenant-selector mat-select').click();
    await page.getByRole('option', { name: 'Second-tenant' }).click();

    await expect(cell(page, 'Tenant ID')).toHaveText('second-tenant');
  });

  test('stacks the details into one column below 360px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await prepare(page);
    await page.goto('/#/login');
    await expect(card(page)).toHaveAttribute('data-state', 'online');

    const columns = await card(page)
      .locator('.details-grid')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
    const overflow = await page.evaluate(() => document.body.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
