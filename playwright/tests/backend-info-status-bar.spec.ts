/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

// Frontend contract tests for the footer status bar and its System information panel. The
// backend is synthetic, so the connection can be cut and restored on demand.
test.use({ storageState: { cookies: [], origins: [] } });

const FINERACT_INFO = {
  git: { build: { version: '1.17.0-SNAPSHOT' }, commit: { id: { abbrev: '12e7559', full: '12e7559288b1f0a4' } } }
};

/** Synthetic backend whose health endpoint can be made unreachable. */
interface Backend {
  reachable: boolean;
  healthChecks: number;
}

async function prepare(
  page: Page,
  options: { displayBackEndInfo?: boolean; reportIssueUrl?: string; reachable?: boolean } = {}
): Promise<Backend> {
  const backend: Backend = { reachable: options.reachable ?? true, healthChecks: 0 };

  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.env = Object.assign(${JSON.stringify({
        fineractPlatformTenantId: 'synthetic-status',
        defaultLanguage: 'en-US',
        displayBackEndInfo: String(options.displayBackEndInfo ?? true),
        reportIssueUrl: options.reportIssueUrl ?? ''
      })}, { fineractApiUrl: window.location.origin });`
    })
  );
  await page.addInitScript(() => {
    localStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        rememberMe: true,
        userId: 9000,
        username: 'synthetic-status-user',
        officeId: 1,
        officeName: 'Synthetic Office',
        roles: [],
        permissions: ['ALL_FUNCTIONS'],
        base64EncodedAuthenticationKey: btoa('synthetic:fixture'),
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: 'en', name: 'en-US' }));
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/actuator/health')) {
      backend.healthChecks++;
      await (backend.reachable ? route.fulfill({ json: { status: 'UP' } }) : route.abort('connectionrefused'));
      return;
    }
    if (path.endsWith('/actuator/info')) {
      await route.fulfill({ json: FINERACT_INFO });
      return;
    }
    const api = path.split('/api/v1')[1] || '';
    if (api === '/notifications') {
      await route.fulfill({ json: { pageItems: [], totalFilteredRecords: 0 } });
    } else if (api === '/configurations') {
      await route.fulfill({ json: { globalConfiguration: [] } });
    } else {
      await route.fulfill({ json: [] });
    }
  });
  return backend;
}

/** Opens Home and dismisses the authorized-use warning it shows once per session. */
async function openHome(page: Page) {
  await page.goto('/#/home');
  const warning = page.getByRole('dialog').filter({ hasText: 'authorized use only' });
  await warning.getByRole('button', { name: 'Close' }).click();
  await expect(warning).toBeHidden();
}

const statusBar = (page: Page) => page.locator('mifosx-status-bar .status-bar');
const detailsButton = (page: Page) => statusBar(page).getByRole('button', { name: 'Details' });
const panel = (page: Page) => page.getByRole('dialog', { name: 'System Information' });

test.describe('Backend info status bar', () => {
  test('stays hidden, and checks nothing, when MIFOS_DISPLAY_BACKEND_INFO is off', async ({ page }) => {
    const backend = await prepare(page, { displayBackEndInfo: false });

    await openHome(page);
    await expect(page.locator('mat-toolbar')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('mifosx-status-bar')).toHaveCount(0);
    expect(backend.healthChecks).toBe(0);
  });

  test('shows the connection and the versions, with the System information panel above it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepare(page);
    await openHome(page);

    await expect(statusBar(page)).toHaveAttribute('data-state', 'online');
    await expect(statusBar(page).locator('.status-text')).toHaveText('Connected');
    await expect(statusBar(page).locator('.item-fineract .item-value')).toHaveText('1.17.0');
    await expect(statusBar(page).locator('.item-fineract .pre-release-badge')).toHaveText('SNAPSHOT');

    await detailsButton(page).click();

    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('button', { name: 'Close' })).toBeFocused();
    await expect(panel(page)).toContainText(/Checked \d+ s ago/);
    await expect(panel(page).locator('.row-fineract')).toContainText('1.17.0');
    await expect(panel(page).locator('.pre-release-notice')).toContainText('pre-release build');
    await expect(panel(page).getByRole('link', { name: 'Report issue' })).toHaveCount(0);
    const panelBox = (await panel(page).boundingBox())!;
    const barBox = (await statusBar(page).boundingBox())!;
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(barBox.y);
  });

  test('closes the panel on Escape, its close button, Details and a click elsewhere', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepare(page);
    await openHome(page);
    await expect(statusBar(page)).toHaveAttribute('data-state', 'online');

    await detailsButton(page).click();
    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
    await expect(detailsButton(page)).toBeFocused();

    await detailsButton(page).click();
    await panel(page).getByRole('button', { name: 'Close' }).click();
    await expect(panel(page)).toBeHidden();
    await expect(detailsButton(page)).toBeFocused();

    await detailsButton(page).click();
    await expect(detailsButton(page)).toHaveAttribute('aria-expanded', 'true');
    await detailsButton(page).click();
    await expect(panel(page)).toBeHidden();
    await expect(detailsButton(page)).toHaveAttribute('aria-expanded', 'false');

    await detailsButton(page).click();
    await expect(panel(page)).toBeVisible();
    await page.locator('mifosx-content').click({ position: { x: 8, y: 8 } });
    await expect(panel(page)).toBeHidden();
  });

  test('shows the server unreachable, then reconnects with Retry now', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const backend = await prepare(page, { reachable: false });
    await openHome(page);

    await expect(statusBar(page)).toHaveAttribute('data-state', 'offline');
    await expect(statusBar(page).locator('.status-text')).toHaveText('Server unreachable');
    await expect(statusBar(page).locator('.item-retry')).toContainText(/Retrying in \d+ s/);
    await expect(statusBar(page).locator('.item-fineract .item-value')).toHaveText('—');

    await detailsButton(page).click();
    await expect(panel(page).locator('.row-fineract')).toHaveText('—');
    await expect(panel(page).locator('.pre-release-notice')).toHaveCount(0);

    backend.reachable = true;
    await panel(page).getByRole('button', { name: 'Retry now' }).click();

    await expect(statusBar(page)).toHaveAttribute('data-state', 'online');
    await expect(statusBar(page).locator('.item-fineract .item-value')).toHaveText('1.17.0');
    await expect(panel(page).getByRole('button', { name: 'Retry now' })).toHaveCount(0);
  });

  test('copies the diagnostics for a support ticket', async ({ page, context }) => {
    await context.grantPermissions([
      'clipboard-read',
      'clipboard-write'
    ]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepare(page);
    await openHome(page);
    await expect(statusBar(page)).toHaveAttribute('data-state', 'online');

    await detailsButton(page).click();
    await panel(page).getByRole('button', { name: 'Copy diagnostics' }).click();

    await expect(page.getByText('Diagnostics copied to the clipboard')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('Apache Fineract: 1.17.0-SNAPSHOT (12e7559)');
    expect(copied).toContain('Tenant: synthetic-status');
    expect(copied).toMatch(/^Status: Connected \(checked .+\)$/m);
  });

  test('opens Report issue in a new tab when a link is configured', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepare(page, { reportIssueUrl: 'https://issues.example.org/new' });
    await openHome(page);

    await detailsButton(page).click();

    const reportIssue = panel(page).getByRole('link', { name: 'Report issue' });
    await expect(reportIssue).toHaveAttribute('href', 'https://issues.example.org/new');
    await expect(reportIssue).toHaveAttribute('target', '_blank');
    await expect(reportIssue).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('opens the panel as a bottom sheet from the compact bar on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await prepare(page);
    await openHome(page);

    const compactBar = page.locator('mifosx-status-bar button.status-bar.compact');
    await expect(compactBar).toContainText('Connected');
    await expect(compactBar).toContainText('1.17.0');
    await expect(compactBar).toContainText('SNAPSHOT');

    await compactBar.click();

    const sheet = page.locator('mat-bottom-sheet-container');
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText('Copy diagnostics');
    await expect(compactBar).toHaveAttribute('aria-expanded', 'true');

    await sheet.getByRole('button', { name: 'Close' }).click();

    await expect(sheet).toBeHidden();
    await expect(compactBar).toHaveAttribute('aria-expanded', 'false');
  });
});
