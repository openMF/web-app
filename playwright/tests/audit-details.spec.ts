/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect, Page } from '@playwright/test';
import fs from 'fs/promises';
const event = (id = 12, extra: Record<string, unknown> = {}) => ({
  id,
  resourceId: 3,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  maker: 'fixture-maker',
  processingResult: 'Processed',
  madeOnDate: [
    2026,
    11,
    12,
    12,
    59,
    45
  ],
  commandAsJson:
    '{"name":"Synthetic Branch","openingDate":"01 January 2009","externalId":"003","parentId":1,"dateFormat":"dd MMMM yyyy","locale":"en","password":"HIDDEN_SECRET","amount":9007199254740993.001}',
  ...extra
});
const previous = () =>
  event(11, { actionName: 'CREATE', madeOnDate: [
      2026,
      11,
      12,
      12,
      54,
      6
    ], commandAsJson: '{"name":"Earlier Branch","externalId":null}' });
async function mock(
  page: Page,
  options: {
    permissions?: string[];
    invalidCompare?: boolean;
    denied?: boolean;
    malformed?: boolean;
    locale?: string;
  } = {}
) {
  const calls: URL[] = [];
  await page.addInitScript(
    ({ permissions, locale }) => {
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify({ code: locale.split('-')[0], name: locale }));
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          username: 'fixture-maker',
          userId: 5,
          officeId: 1,
          officeName: 'Synthetic Branch',
          permissions,
          roles: [],
          shouldRenewPassword: false
        })
      );
    },
    { permissions: options.permissions ?? ['ALL_FUNCTIONS'], locale: options.locale ?? 'en-US' }
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    calls.push(url);
    const path = url.pathname.replace('/fineract-provider/api', '');
    let body: unknown = [];
    if (path === '/v1/configurations') body = { globalConfiguration: [] };
    if (path === '/v1/audits/searchtemplate')
      body = { appUsers: [], actionNames: [], entityNames: [], processingResults: [] };
    if (path === '/v1/offices/1') body = { id: 1, name: 'Present Parent' };
    if (path === '/v1/audits') body = { totalFilteredRecords: 3, pageItems: [
          event(),
          previous(),
          event(10, { entityName: 'CLIENT', maker: 'UNRELATED' })
        ] };
    if (/\/v1\/audits\/\d+$/.test(path)) {
      if (options.denied) {
        await route.fulfill({ status: 403, json: {} });
        return;
      }
      const id = Number(path.split('/').pop());
      body =
        id === 11
          ? { ...previous(), ...(options.invalidCompare ? { resourceId: 4 } : {}) }
          : event(id, options.malformed ? { commandAsJson: '{invalid' } : {});
    }
    await route.fulfill({ json: body });
  });
  return calls;
}
async function open(page: Page) {
  await page.goto('/#/system/audit-trails/12');
  await expect(page.locator('.audit-details h1')).toHaveText('Synthetic Branch');
}

test('metadata, safe submissions, request format, history, comparison and observations', async ({ page, context }) => {
  const calls = await mock(page);
  await context.grantPermissions([
    'clipboard-read',
    'clipboard-write'
  ]);
  await open(page);
  await expect(page.locator('.metadata > div')).toHaveCount(5);
  await expect(page.locator('.metadata')).toContainText('None recorded');
  await expect(page.locator('.metadata')).toContainText('Not recorded');
  await expect(page.locator('.submitted-card')).toContainText('January 1, 2009');
  await expect(page.locator('.submitted-card')).not.toContainText('Date format');
  await expect(page.locator('.submitted-card')).toContainText('Current name: Present Parent');
  await expect(page.locator('.history-timeline li')).toHaveCount(2);
  await expect(page.locator('.history-card')).not.toContainText('UNRELATED');
  await expect
    .poll(() => calls.find((url) => url.pathname.endsWith('/audits'))?.searchParams.get('entityName'))
    .toBe('OFFICE');
  await expect(page.locator('.observations-card')).toContainText('approximately 6 minutes');
  await page.getByRole('button', { name: 'Request format', exact: true }).click();
  await page.getByRole('button', { name: 'View request JSON', exact: true }).click();
  await expect(page.locator('.request-json')).toContainText('9007199254740993.001');
  await expect(page.locator('.request-json')).not.toContainText('HIDDEN_SECRET');
  await page.getByRole('button', { name: 'Copy safe JSON', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain('HIDDEN_SECRET');
  await page.getByRole('button', { name: 'Compare with 11', exact: true }).click();
  await expect(page.locator('.comparison-card')).toContainText('Comparison of submitted values');
  await expect(page.locator('.comparison-card')).toContainText('Earlier Branch');
  await expect(page.locator('.comparison-card')).toContainText('Trail 11 → 12');
  await expect(page.locator('.comparison-card')).toContainText('Not supplied');
  await expect(page.locator('.comparison-card')).toContainText('not database states');
  await page.screenshot({ path: '../WEB-1483-evidence/after-comparison-json.png', fullPage: true });
});

test('copy and export preserve the safe representation', async ({ page, context }) => {
  await mock(page);
  await context.grantPermissions([
    'clipboard-read',
    'clipboard-write'
  ]);
  await open(page);
  await page.getByRole('button', { name: 'Copy trail', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trail copied.');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).not.toContain('HIDDEN_SECRET');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('audit-trail-12.json');
  const json = JSON.parse(await fs.readFile((await download.path())!, 'utf8'));
  expect(json.representation).toBe('Safe API-returned audit representation');
  expect(json.commandAsJson).toContain('[Redacted]');
  expect(json.commandAsJson).not.toContain('HIDDEN_SECRET');
});

test('history navigation reuses route safely and back preserves route', async ({ page }) => {
  await mock(page);
  await open(page);
  await page.getByRole('button', { name: 'Previous trail', exact: true }).click();
  await expect(page.locator('.audit-details h1')).toHaveText('Earlier Branch');
  await expect(page).toHaveURL(/audit-trails\/11/);
  await expect(page.locator('.selected')).toContainText('11');
  await expect(page.locator('.comparison-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next trail', exact: true }).click();
  await expect(page.locator('.audit-details h1')).toHaveText('Synthetic Branch');
  await page.getByRole('link', { name: 'Back to Audit Trails' }).click();
  await expect(page).toHaveURL(/audit-trails$/);
});

for (const change of [
  'tenant',
  'credentials'
]) {
  test(`reused audit route recovers after an authorized ${change} scope change`, async ({ page }) => {
    await mock(page);
    await open(page);
    await page
      .locator('mifosx-view-audit')
      .evaluate((element) => element.setAttribute('data-reuse-marker', 'original-instance'));
    const current = event(13, { maker: 'scope-b-maker', commandAsJson: '{"name":"Scope B Branch"}' });
    await page.route(/\/audits\/13(?:\?.*)?$/, async (route) => {
      await route.fulfill({ json: current });
    });
    await page.route(/\/audits(?:\?.*)?$/, async (route) => {
      await route.fulfill({ json: { totalFilteredRecords: 1, pageItems: [current] } });
    });
    await page.evaluate((change) => {
      if (change === 'tenant') localStorage.setItem('mifosXTenantIdentifier', 'scope-b');
      else {
        const credentials = JSON.parse(sessionStorage.getItem('mifosXCredentials')!);
        sessionStorage.setItem(
          'mifosXCredentials',
          JSON.stringify({ ...credentials, userId: 6, username: 'scope-b-maker' })
        );
      }
    }, change);
    await expect(page.locator('.state-card')).toContainText('You do not have permission');
    await expect(page.locator('.audit-heading')).toHaveCount(0);
    await page.evaluate(() => {
      location.hash = '/system/audit-trails/13';
    });
    await expect(page.locator('.audit-details h1')).toHaveText('Scope B Branch');
    await expect(page.locator('mifosx-view-audit')).toHaveAttribute('data-reuse-marker', 'original-instance');
    await expect(page.locator('.history-timeline li')).toHaveCount(1);
    await expect(page.locator('.history-card')).toContainText('scope-b-maker');
    await expect(page.locator('.audit-details')).not.toContainText('Synthetic Branch');
    await expect(page.locator('.comparison-card')).toHaveCount(0);
  });
}

test('rejects unrelated comparison record', async ({ page }) => {
  await mock(page, { invalidCompare: true });
  await open(page);
  await page.getByRole('button', { name: 'Compare with 11', exact: true }).click();
  await expect(page.locator('.comparison-card')).toContainText('Comparison unavailable');
  await expect(page.locator('.comparison-card table')).toHaveCount(0);
});

test('permission denial issues no audit requests', async ({ page }) => {
  const calls = await mock(page, { permissions: ['READ_CLIENT'] });
  await page.goto('/#/system/audit-trails/12');
  await expect(page.locator('.state-card')).toContainText('You do not have permission');
  expect(calls.filter((url) => /\/audits(?:\/|$)/.test(url.pathname))).toHaveLength(0);
  await expect(page.getByRole('button', { name: 'Export JSON' })).toHaveCount(0);
});

test('backend denial and malformed commands fail safely', async ({ page }) => {
  await mock(page, { denied: true });
  await page.goto('/#/system/audit-trails/12');
  await expect(page.locator('.state-card')).toContainText('You do not have permission');
  await page.unroute('**/fineract-provider/**');
  await mock(page, { malformed: true });
  await page.reload();
  await expect(page.locator('.audit-details h1')).toHaveText('Office #3');
  await expect(page.locator('.submitted-card')).toContainText('Request JSON is unavailable or malformed.');
});

test('obsolete route response cannot restore old details', async ({ page }) => {
  await mock(page);
  await open(page);
  let release!: () => void;
  let started!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requestStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/audits/11', async (route) => {
    started();
    await barrier;
    await route.fulfill({ json: { ...previous(), commandAsJson: '{"name":"STALE"}' } }).catch(() => {});
  });
  await page.getByRole('button', { name: 'Previous trail' }).click();
  await requestStarted;
  await page.evaluate(() => {
    location.hash = '/system/audit-trails/13';
  });
  await expect(page.locator('.audit-details h1')).toHaveText('Synthetic Branch');
  await expect(page).toHaveURL(/audit-trails\/13/);
  release();
  await expect(page.locator('.audit-details')).not.toContainText('STALE');
});

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  for (const dark of [
    false,
    true
  ]) {
    test(`layout and keyboard ${width} ${dark ? 'dark' : 'light'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await mock(page);
      await open(page);
      if (dark)
        await page.evaluate(() => {
          document.body.classList.add('dark-theme');
          document.documentElement.classList.add('dark-theme');
        });
      await expect(page.locator('.history-timeline li')).toHaveCount(2);
      await expect(page.getByRole('link', { name: 'Back to Audit Trails' })).toHaveCSS('color', 'rgb(255, 255, 255)');
      const overflow = await page
        .locator('.audit-details')
        .evaluate((element) => element.scrollWidth > element.clientWidth);
      expect(overflow).toBe(false);
      await page.getByRole('button', { name: 'Copy trail', exact: true }).focus();
      await expect(page.getByRole('button', { name: 'Copy trail', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Export JSON' })).toBeFocused();
      await page.screenshot({
        path: `../WEB-1483-evidence/after-${width}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true
      });
    });
  }
}

test('Spanish catalog renders investigation labels without untranslated keys', async ({ page }) => {
  await mock(page, { locale: 'es-MX' });
  await page.goto('/#/system/audit-trails/12');
  await expect(page.locator('.submitted-card')).toContainText('Valores enviados');
  await expect(page.locator('.audit-details')).not.toContainText('auditDetails.');
});
