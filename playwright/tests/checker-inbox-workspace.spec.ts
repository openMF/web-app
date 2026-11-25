/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const test = base.extend<{ checkerPermissions: string[] }>({ checkerPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });
let rows: any[];
let unexpectedWrites: string[];
let listFailure: boolean;
let busyWrite: Promise<void> | undefined;
let writes: { id: number; command: string }[];
let reads: URL[];
let partial = false;
const evidence = '../WEB-1472-evidence';
test.beforeEach(async ({ page, checkerPermissions }) => {
  partial = false;
  writes = [];
  reads = [];
  unexpectedWrites = [];
  listFailure = false;
  busyWrite = undefined;
  rows = [
    'UPDATE',
    'CREATE',
    'DISBURSE',
    'DELETE',
    'UPDATE',
    'CREATE',
    'ACTIVATE'
  ].map((actionName, i) => ({
    id: 2187 - i,
    actionName,
    entityName: i === 2 || i === 4 ? 'LOAN' : 'CLIENT',
    resourceId: 52 + i,
    clientId: 52 + i,
    clientName: [
      'Synthetic Rosario Saldaña',
      'Synthetic Fiamma Chavarria',
      'Synthetic Loan Client',
      'Synthetic Document Client',
      'Synthetic Own Request',
      'Synthetic Laura Vázquez',
      'Synthetic Pedro Sánchez'
    ][i],
    loanAccountNo: i === 2 ? '000000049' : undefined,
    maker: i === 4 ? 'reviewer' : i % 2 ? 'laura' : 'juan',
    madeOnDate: 1795000000 - i * 3600,
    processingResult: 'awaiting.approval'
  }));
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1472,
        username: 'reviewer',
        officeId: 1,
        officeName: 'Synthetic Central',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-18');
  }, checkerPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.env = { productionModeEnableRBAC: true };' })
  );
  // Catch every backend write, including unexpected financial requests.
  await page.route('**/fineract-provider/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname;
    if (/\/makercheckers\/\d+$/.test(path) && req.method() !== 'GET') {
      const id = Number(path.split('/').pop()),
        command = req.method() === 'DELETE' ? 'delete' : url.searchParams.get('command')!;
      writes.push({ id, command });
      if (busyWrite) await busyWrite;
      if (partial && id === 2186) return route.fulfill({ status: 400, json: { errors: [] } });
      if (partial && id === 2185) return route.fulfill({ json: {} });
      rows = rows.filter((row) => row.id !== id);
      return route.fulfill({ json: { commandId: id, resourceId: id } });
    }
    if (path.endsWith('/v2/clients/search') && req.method() === 'POST')
      return route.fulfill({
        json: { content: [{ id: 52, displayName: 'Synthetic Rosario Saldaña', accountNumber: '000000052' }] }
      });
    if (req.method() !== 'GET') {
      unexpectedWrites.push(path);
      return route.fulfill({ status: 403, json: { errors: [] } });
    }
    if (path.endsWith('/makercheckers/searchtemplate'))
      return route.fulfill({
        json: {
          appUsers: [
            { id: 1, username: 'juan' },
            { id: 2, username: 'laura' }
          ],
          actionNames: [
            'UPDATE',
            'CREATE',
            'DELETE',
            'DISBURSE',
            'ACTIVATE'
          ],
          entityNames: [
            'CLIENT',
            'LOAN'
          ]
        }
      });
    if (path.endsWith('/makercheckers')) {
      reads.push(url);
      if (listFailure) return route.fulfill({ status: 503, json: { errors: [] } });
      let filtered = rows;
      for (const key of [
        'actionName',
        'entityName',
        'resourceId',
        'clientId'
      ]) if (url.searchParams.has(key)) filtered = filtered.filter((r) => String(r[key]) === url.searchParams.get(key));
      if (url.searchParams.has('makerId'))
        filtered = filtered.filter((r) => r.maker === (url.searchParams.get('makerId') === '1' ? 'juan' : 'laura'));
      if (url.searchParams.get('includeJson') === 'true') {
        filtered = filtered.map((row) => ({ ...row, commandAsJson: '{"mobileNo":"55"}' }));
      }
      return route.fulfill({ json: filtered });
    }
    if (/\/audits\/\d+$/.test(path)) {
      if (!checkerPermissions.includes('ALL_FUNCTIONS')) return route.fulfill({ status: 403, json: { errors: [] } });
      const row = rows.find((r) => r.id === Number(path.split('/').pop()));
      return route.fulfill({
        json: {
          ...row,
          commandAsJson: JSON.stringify(
            row?.id === 2187
              ? { mobileNo: '55 3318 0021', emailAddress: 'synthetic@example.test' }
              : {
                  nested: {
                    access_token: 'never-display-secret',
                    items: [{ password: 'never-display-password', amount: '90000.001' }]
                  }
                }
          )
        }
      });
    }
    if (path.includes('/clients/search'))
      return route.fulfill({
        json: { content: [{ id: 52, displayName: 'Synthetic Rosario Saldaña', accountNumber: '000000052' }] }
      });
    let data: any = [];
    if (path.endsWith('/notifications')) data = { pageItems: [], totalFilteredRecords: 0 };
    else if (path.endsWith('/businessdate')) data = { businessDate: '2026-11-18' };
    else if (path.includes('/configurations')) data = { value: 0, enabled: false };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    return route.fulfill({ json: data });
  });
});
async function open(page: Page) {
  await page.goto('/#/checker-inbox-and-tasks/checker-inbox');
  await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(7, { timeout: 15000 });
}
if (process.env.CHECKER_BASELINE) {
  test('before screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 });
    await open(page);
    await mkdir(evidence, { recursive: true });
    await page.screenshot({ path: `${evidence}/before-1920.png`, fullPage: true });
  });
} else {
  for (const width of [
    390,
    768,
    1280,
    1920
  ])
    test(`responsive inbox ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });
      await open(page);
      await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
      await expect(page.locator('.detail-panel')).toContainText('Synthetic Rosario');
      await expect(page.locator('.detail-panel')).toContainText('Requested changes');
      await expect(page.locator('.detail-panel')).not.toContainText('Previous:');
      await expect(page.locator('.request-json')).toHaveCount(0);
      await page.getByRole('checkbox', { name: 'Select request 2187', exact: true }).check();
      await expect(page.locator('.selection-toolbar')).toContainText('1 selected');
      await expect(page.getByRole('checkbox', { name: 'Select request 2183', exact: true })).toHaveCount(0);
      expect(writes).toHaveLength(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const rgb = await page
        .locator('.selection-toolbar .approve-action')
        .evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number));
      expect(rgb[2]).toBeGreaterThan(rgb[1]);
      await expect(page.locator('.selection-toolbar .approve-action')).toHaveCSS('color', 'rgb(255, 255, 255)');
      if (width === 1920)
        await page
          .locator('mifosx-toolbar button')
          .filter({ has: page.locator('fa-icon[icon="chevron-right"]') })
          .count()
          .then(async (count) => {
            if (count)
              await page
                .locator('mifosx-toolbar button')
                .filter({ has: page.locator('fa-icon[icon="chevron-right"]') })
                .click();
          });
      if (width === 1920) {
        const badge = await page.locator('.checker-pending-count').boundingBox();
        const item = await page
          .locator('mat-list-item')
          .filter({ has: page.locator('.checker-pending-count') })
          .boundingBox();
        expect(badge!.x + badge!.width).toBeLessThanOrEqual(item!.x + item!.width);
      }
      await expect
        .poll(async () => {
          const rgb = await page
            .locator('mat-checkbox')
            .filter({ has: page.getByRole('checkbox', { name: 'Deselect request 2187', exact: true }) })
            .locator('.mdc-checkbox__background')
            .evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number));
          return rgb[2] > rgb[1];
        })
        .toBe(true);
      await page.locator('mifosx-checker-inbox').evaluate((el) => {
        let p = el.parentElement;
        while (p) {
          p.scrollTop = 0;
          p = p.parentElement;
        }
      });
      await mkdir(evidence, { recursive: true });
      await page.screenshot({ path: `${evidence}/after-${width}.png`, fullPage: true });
    });
}

test.afterEach(async () => {
  expect(unexpectedWrites).toEqual([]);
});

if (!process.env.CHECKER_BASELINE) {
  test('filters automatically, preserves authoritative badges and resets all controls', async ({ page }) => {
    await open(page);
    await expect(page.locator('.queue-count')).toHaveText('7');
    await page.getByRole('combobox', { name: 'Made by', exact: true }).click();
    await page.getByRole('option', { name: 'juan', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(3);
    expect(reads.at(-1)!.searchParams.get('makerId')).toBe('1');
    await expect(page.locator('.queue-count')).toHaveText('7');
    await page.getByRole('combobox', { name: 'Action', exact: true }).click();
    await page.getByRole('option', { name: 'UPDATE', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(1);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(7);
    const resource = page.getByRole('textbox', { name: 'Resource ID', exact: true });
    await resource.fill('5');
    await expect.poll(() => reads.at(-1)?.searchParams.get('resourceId')).toBe('5');
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(0);
    await resource.fill('52');
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Review request 2187', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(resource).toHaveValue('');
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(7);
    const search = page.getByRole('combobox', { name: 'Search customer, account or resource ID', exact: true });
    await search.fill('000000049');
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(1);
    await search.fill('Rosario');
    await page.getByRole('option').filter({ hasText: 'Synthetic Rosario' }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(1);
    expect(reads.at(-1)!.searchParams.get('clientId')).toBe('52');
    expect(reads.at(-1)!.searchParams.has('q')).toBe(false);
    expect(writes).toHaveLength(0);
  });

  test('validates date ranges and sends the existing date serializer and entity filter', async ({ page }) => {
    await open(page);
    const dateTrigger = page.getByRole('button', { name: 'Date', exact: true });
    await dateTrigger.click();
    await expect(page.getByRole('textbox', { name: 'From date', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'To date', exact: true })).toBeFocused();
    await page.getByRole('textbox', { name: 'From date', exact: true }).fill('11/20/2026');
    await page.getByRole('textbox', { name: 'To date', exact: true }).fill('11/18/2026');
    await expect(page.locator('.error-message')).toContainText('Enter valid dates');
    await page.getByRole('textbox', { name: 'To date', exact: true }).fill('11/24/2026');
    await expect.poll(() => reads.at(-1)!.searchParams.get('makerDateTimeFrom')).toBe('20 November 2026');
    await expect.poll(() => reads.at(-1)!.searchParams.get('makerDateTimeTo')).toBe('24 November 2026');
    await page.keyboard.press('Escape');
    await expect(dateTrigger).toBeFocused();
    await page.getByRole('combobox', { name: 'Entity', exact: true }).click();
    await page.getByRole('option', { name: 'LOAN', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(2);
  });

  test('confirms one approval, prevents duplicate writes and refreshes both counts', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
    await page.locator('.detail-panel').getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('#2187');
    expect(writes).toHaveLength(0);
    let release!: () => void;
    busyWrite = new Promise((resolve) => (release = resolve));
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect.poll(() => writes.length).toBe(1);
    await expect(page.locator('mifosx-checker-inbox')).toContainText('Processing 1');
    release();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(6);
    await expect(page.locator('.queue-count')).toHaveText('6');
    await expect(page.locator('.checker-pending-count')).toHaveText('6');
    expect(writes).toEqual([{ id: 2187, command: 'approve' }]);
  });

  test('rejects without accepting an unpersisted comment and confirms delete separately', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Rejection comment', exact: true })).toBeDisabled();
    await page.locator('.detail-panel').getByRole('button', { name: 'Reject', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('cannot save or send');
    expect(writes).toHaveLength(0);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect(writes).toHaveLength(0);
    await page.locator('.detail-panel').getByRole('button', { name: 'Reject', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(6);
    await page.getByRole('button', { name: 'Review request 2186', exact: true }).click();
    await page.getByRole('button', { name: 'Delete request', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('audit');
    expect(writes).toEqual([{ id: 2187, command: 'reject' }]);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(5);
    expect(writes.at(-1)).toEqual({ id: 2186, command: 'delete' });
  });

  test('select all excludes own requests and reports mixed results without retry', async ({ page }) => {
    partial = true;
    await open(page);
    await page.getByRole('checkbox', { name: 'Select all eligible requests', exact: true }).check();
    await expect(page.locator('.selection-toolbar')).toContainText('6 selected');
    await page.locator('.selection-toolbar').getByRole('button', { name: 'Approve', exact: true }).click();
    expect(writes).toHaveLength(0);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox')).toContainText('4 succeeded, 1 failed');
    await expect(page.locator('mifosx-checker-inbox')).toContainText('Outcome unknown for request IDs: 2185');
    await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(3);
    expect(writes).toHaveLength(6);
    expect(new Set(writes.map((write) => write.id)).size).toBe(6);
    expect(writes.some((write) => write.id === 2183)).toBe(false);
  });

  test('locks own individual decisions, redacts nested JSON and supports keyboard review', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Review request 2183', exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.detail-panel')).toBeFocused();
    await expect(page.locator('.detail-panel')).toContainText('cannot approve or reject your own request');
    await expect(page.locator('.detail-panel').getByRole('button', { name: 'Approve', exact: true })).toBeDisabled();
    await expect(page.locator('.detail-panel').getByRole('button', { name: 'Reject', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'View request JSON', exact: true }).click();
    await expect(page.locator('.request-json')).toContainText('[REDACTED]');
    await expect(page.locator('mifosx-checker-inbox')).not.toContainText('never-display');
    expect(writes).toHaveLength(0);
  });

  test('handles malformed detail and list errors without enabling stale actions', async ({ page }) => {
    await open(page);
    await page.route('**/audits/2187', (route) =>
      route.fulfill({ json: { ...rows[0], commandAsJson: '{"password":"never-display-secret"' } })
    );
    await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
    await expect(page.locator('.detail-panel')).toContainText('cannot be safely displayed');
    await expect(page.locator('.detail-panel')).not.toContainText('never-display-secret');
    listFailure = true;
    await page.getByRole('button', { name: 'Refresh inbox', exact: true }).click();
    await expect(page.locator('mifosx-checker-inbox')).toContainText('Unable to load checker inbox');
    await expect(page.locator('.queue-count')).toHaveCount(0);
    await expect(page.locator('.selection-toolbar')).toHaveCount(0);
    expect(writes).toHaveLength(0);
  });

  test('cancels stale detail responses, preserves the newest selection and hides JSON by default', async ({ page }) => {
    await open(page);
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    let handled!: () => void;
    const responseHandled = new Promise<void>((resolve) => (handled = resolve));
    await page.route('**/audits/2187', async (route) => {
      await held;
      try {
        await route.fulfill({ json: { ...rows[0], commandAsJson: '{"emailAddress":"stale@example.test"}' } });
      } catch {
        // Switching requests can cancel the intercepted request before fulfillment.
      } finally {
        handled();
      }
    });
    const isStaleRequest = (request: import('@playwright/test').Request) =>
      new URL(request.url()).pathname.endsWith('/audits/2187');
    const settled = Promise.race([
      page.waitForEvent('requestfinished', { predicate: isStaleRequest }),
      page.waitForEvent('requestfailed', { predicate: isStaleRequest })
    ]);
    await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
    await expect(page.locator('.detail-panel')).toContainText('Loading request details');
    const current = page.getByRole('button', { name: 'Review request 2186', exact: true });
    await current.click();
    release();
    await Promise.all([
      settled,
      responseHandled
    ]);
    const panel = page.locator('.detail-panel');
    await expect(panel).toContainText('Synthetic Fiamma');
    await expect(panel).not.toContainText('stale@example.test');
    await expect(page.locator('.request-json')).toHaveCount(0);
    await page.getByRole('button', { name: 'Close details', exact: true }).click();
    await expect(current).toBeFocused();
  });

  test('legacy request links open the same safe inline review workflow', async ({ page }) => {
    await page.goto('/#/checker-inbox-and-tasks/checker-inbox/2183/view');
    await expect(page.locator('.detail-panel')).toContainText('Synthetic Own Request');
    await expect(page.locator('.detail-panel').getByRole('button', { name: 'Approve', exact: true })).toBeDisabled();
    expect(writes).toHaveLength(0);
    await page.getByRole('button', { name: 'Close details', exact: true }).click();
    await expect(
      page.getByRole('combobox', { name: 'Search customer, account or resource ID', exact: true })
    ).toBeFocused();
  });

  test('dark mode keeps blue decisions and readable surfaces', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
    await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
    const rgb = await page
      .locator('.detail-panel .approve-action')
      .evaluate((el) => getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number));
    expect(rgb[2]).toBeGreaterThan(rgb[1]);
    await page.screenshot({ path: `${evidence}/after-dark.png`, fullPage: true });
  });

  test.describe('restricted checker', () => {
    test.use({ checkerPermissions: [
        'READ_MAKERCHECKER',
        'UPDATE_CLIENT_CHECKER'
      ] });
    test('can review and approve without general audit permissions', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: 'Review request 2187', exact: true }).click();
      await expect(page.locator('.detail-panel')).toContainText('Mobile Number');
      await page.locator('.detail-panel').getByRole('button', { name: 'Approve', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect.poll(() => writes).toEqual([{ id: 2187, command: 'approve' }]);
      await expect(page.locator('mifosx-checker-inbox tbody tr')).toHaveCount(6);
    });
    test('enforces action permissions on both individual and bulk controls', async ({ page }) => {
      await open(page);
      await expect(page.getByRole('checkbox', { name: 'Select request 2186', exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Review request 2186', exact: true }).click();
      await expect(page.locator('.detail-panel').getByRole('button', { name: 'Approve', exact: true })).toBeDisabled();
      await page.getByRole('checkbox', { name: 'Select all eligible requests', exact: true }).check();
      await expect(page.locator('.selection-toolbar')).toContainText('1 selected');
      expect(writes).toHaveLength(0);
    });
  });
}
