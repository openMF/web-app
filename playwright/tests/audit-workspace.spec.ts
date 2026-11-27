/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect, Page } from '@playwright/test';
import fs from 'fs/promises';
import { loggedSleep } from '../utils/sleep';
const event = (id = 12, extra: any = {}) => ({
  id,
  resourceId: 3,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  maker: 'fixture-user',
  madeOnDate: [
    2026,
    11,
    12,
    12,
    59,
    45
  ],
  processingResult: 'Processed',
  ...extra
});
async function mock(
  page: Page,
  options: { permissions?: string[]; locale?: string; denied?: boolean; many?: boolean } = {}
) {
  const calls: { path: string; query: URLSearchParams; method: string }[] = [];
  await page.addInitScript(
    ({ permissions, locale }) => {
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify({ code: locale.split('-')[0], name: locale }));
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          username: 'fixture-user',
          userId: 5,
          officeId: 1,
          officeName: 'Fixture Office',
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
    const path = url.pathname.replace('/fineract-provider/api', '');
    calls.push({ path, query: url.searchParams, method: route.request().method() });
    let body: any = [];
    if (path === '/v1/configurations') body = { globalConfiguration: [] };
    if (path === '/v1/audits/searchtemplate')
      body = {
        appUsers: [{ id: 5, username: 'fixture-user' }],
        actionNames: [
          'UPDATE',
          'CREATE',
          'DELETE'
        ],
        entityNames: [
          'OFFICE',
          'CLIENT'
        ],
        statuses: [
          { id: 1, processingResult: 'Processed' },
          { id: 2, processingResult: 'Pending' }
        ]
      };
    if (path === '/v1/audits') {
      if (options.denied) {
        await route.fulfill({ status: 403, json: {} });
        return;
      }
      const history = !!url.searchParams.get('resourceId');
      const pageItems = options.many
        ? Array.from({ length: Number(url.searchParams.get('offset')) ? 2 : 25 }, (_, i) =>
            event(100 - Number(url.searchParams.get('offset')) - i)
          )
        : [
            event(12),
            event(11, { actionName: 'CREATE', madeOnDate: [
                2026,
                11,
                11,
                15,
                30
              ], checker: 'fixture-checker', checkedOnDate: [
                2026,
                11,
                11,
                16,
                0
              ] }),
            ...(history ? [event(10, { entityName: 'OFFICETRANSACTION', maker: 'UNRELATED' })] : [])
          ];
      body = { totalFilteredRecords: options.many ? 27 : pageItems.length, pageItems };
      if (url.searchParams.get('limit') === '200') body = { totalFilteredRecords: 2, pageItems: [
            event(12),
            event(11)
          ] };
    }
    if (/\/v1\/audits\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      body = event(id, {
        commandAsJson:
          '{"name":"<b>Submitted office</b>","externalId":"00003","amount":9007199254740993.0001,"password":"HIDDEN_SECRET","nested":{"token":"HIDDEN_TOKEN"}}'
      });
    }
    await route.fulfill({ json: body });
  });
  return calls;
}
const workspace = (page: Page) => page.locator('.audit-workspace');
async function open(page: Page) {
  await page.goto('/#/system/audit-trails');
  await expect(page.locator('.event-row').first()).toBeVisible();
}

test('grouping, keyboard selection, safe details, history, copy and complete export', async ({ page, context }) => {
  const calls = await mock(page);
  await context.grantPermissions([
    'clipboard-read',
    'clipboard-write'
  ]);
  await open(page);
  await expect(page.locator('.day-heading')).toHaveCount(2);
  expect(calls.filter((call) => /\/audits\/\d+$/.test(call.path))).toHaveLength(0);
  await page.locator('#audit-trail-12').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.detail-card')).toContainText('No checker recorded');
  await expect(page.locator('.detail-card')).toContainText('Not recorded');
  await expect(workspace(page)).not.toContainText('labels.auditTrail');
  await expect(page.locator('.submitted-fields')).toContainText('<b>Submitted office</b>');
  await expect(page.locator('.submitted-fields b')).toHaveCount(0);
  await expect(page.locator('.comparison-notice')).toContainText('Previous values were not recorded');
  await expect(page.locator('.request-json')).toHaveCount(0);
  await page.getByRole('button', { name: 'View request JSON' }).click();
  await expect(page.locator('.request-json')).toContainText('9007199254740993.0001');
  await expect(workspace(page)).not.toContainText('HIDDEN_SECRET');
  await expect(workspace(page)).not.toContainText('HIDDEN_TOKEN');
  await page.getByRole('button', { name: 'Copy trail', exact: true }).click();
  await expect(workspace(page)).toContainText('Trail copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain('commandAsJson');
  await page.getByRole('button', { name: 'History of resource #3', exact: true }).click();
  await expect(workspace(page)).toContainText('only exact identities');
  await expect(workspace(page)).not.toContainText('UNRELATED');
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('entityName')
  ).toBe('OFFICE');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
  const download = await downloadPromise;
  const csv = await fs.readFile((await download.path())!, 'utf8');
  expect(csv).toContain('fixture-user');
  expect(csv).not.toContain('HIDDEN');
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('limit')
  ).toBe('200');
  await page.getByRole('button', { name: 'Back to original event' }).click();
  await expect(page.locator('.detail-card')).toContainText('#12');
  await page.getByRole('button', { name: 'Close details' }).click();
  await expect(page.locator('#audit-trail-12')).toBeFocused();
  expect(calls.every((call) => call.method === 'GET')).toBe(true);
});

test('exact search modes, validated filters, dates and named presets', async ({ page }) => {
  const calls = await mock(page);
  await open(page);
  await page.getByRole('textbox', { name: 'Search by trail ID, resource ID or user' }).fill('12');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.event-row')).toHaveCount(1);
  expect(calls.at(-1)?.path).toBe('/v1/audits/12');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.getByRole('combobox', { name: /^entity$/i }).click();
  await page.getByRole('option', { name: 'Office', exact: true }).click();
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('entityName')
  ).toBe('OFFICE');
  await page.getByRole('button', { name: 'Made date/time' }).click();
  await page.getByLabel('Maker from', { exact: true }).fill('2026-11-12T10:00');
  await page.getByLabel('Maker to', { exact: true }).fill('2026-11-12T09:00');
  const count = calls.length;
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('valid');
  expect(calls.length).toBe(count);
  await page.getByLabel('Maker to', { exact: true }).fill('2026-11-12T11:00');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('makerDateTimeFrom')
  ).toBe('2026-11-12 10:00:00');
  await page.getByRole('button', { name: 'Saved filters', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Manage saved filters' }).click();
  await page.getByLabel('Filter name').fill('Office review');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.getByRole('button', { name: 'Office review', exact: true }).click();
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('entityName')
  ).toBe('OFFICE');
  await page.getByRole('button', { name: 'Delete preset', exact: true }).click();
});

test('server pagination and sorting', async ({ page }) => {
  const calls = await mock(page, { many: true });
  await open(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.locator('.event-row')).toHaveCount(2);
  expect(
    calls
      .filter((call) => call.path === '/v1/audits')
      .at(-1)
      ?.query.get('offset')
  ).toBe('25');
  await page.getByRole('button', { name: 'Made by', exact: true }).click();
  await expect(page.locator('.event-row')).toHaveCount(25);
  const query = calls.filter((call) => call.path === '/v1/audits').at(-1)!.query;
  expect(query.get('orderBy')).toBe('maker');
  expect(query.get('offset')).toBe('0');
});

test('permission restrictions and backend failure', async ({ page }) => {
  const calls = await mock(page, { permissions: ['READ_CLIENT'] });
  await page.goto('/#/system/audit-trails');
  await expect(workspace(page)).toContainText('You do not have permission');
  expect(calls.some((call) => call.path.startsWith('/v1/audits'))).toBe(false);
});

test('backend refusal clears results and exposes retry', async ({ page }) => {
  await mock(page, { denied: true });
  await page.goto('/#/system/audit-trails');
  await expect(page.locator('.events-card')).toContainText('could not be loaded');
  await expect(page.locator('.event-row')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
});

test('localized audit controls, server-filtered resource and user search', async ({ page }) => {
  const calls = await mock(page);
  await open(page);
  await page.locator('mat-select[formControlName="mode"]').click();
  await page.getByRole('option', { name: 'Resource ID', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search by trail ID, resource ID or user' }).fill('3');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .poll(() =>
      calls
        .filter((call) => call.path === '/v1/audits')
        .at(-1)
        ?.query.get('resourceId')
    )
    .toBe('3');
  await page.locator('mat-select[formControlName="mode"]').click();
  await page.getByRole('option', { name: 'User', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search by trail ID, resource ID or user' }).fill('fixture-user');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .poll(() =>
      calls
        .filter((call) => call.path === '/v1/audits')
        .at(-1)
        ?.query.get('makerId')
    )
    .toBe('5');
});

test('French catalog includes audit-specific controls', async ({ page }) => {
  await mock(page, { locale: 'fr-FR' });
  await open(page);
  await expect(page.getByRole('button', { name: 'Filtres enregistrés', exact: true })).toBeVisible();
  await page.locator('#audit-trail-12').click();
  await expect(page.locator('.detail-card')).toContainText('Modifications soumises');
});

test('rapid selection cancels stale details and standalone route redacts', async ({ page }) => {
  await mock(page);
  await open(page);
  await page.route('**/audits/12', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ json: event(12, { commandAsJson: '{"name":"STALE"}' }) }).catch(() => {});
  });
  await page.locator('#audit-trail-12').click();
  await page.locator('#audit-trail-11').click();
  await expect(page.locator('.detail-card')).toContainText('#11');
  await expect(page.locator('.detail-card')).toContainText('Submitted office');
  await loggedSleep(
    400,
    'Allow the deliberately delayed obsolete audit response to finish before checking stale-content exclusion'
  );
  await expect(page.locator('.detail-card')).not.toContainText('STALE');
  await page.getByRole('link', { name: 'Open audit details' }).click();
  await expect(page.locator('.command-table')).toContainText('Submitted office');
  await expect(page.locator('.command-table')).not.toContainText('HIDDEN_SECRET');
});

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`responsive ${width}, light and dark`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1200 });
    await mock(page);
    await open(page);
    await page.locator('#audit-trail-12').click();
    await expect(page.locator('.detail-card')).toContainText('Submitted changes');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`after-${width}-light.png`), fullPage: true });
    await page.evaluate(() => {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    });
    await page.screenshot({ path: testInfo.outputPath(`after-${width}-dark.png`), fullPage: true });
    await page.locator('.detail-card').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Copy trail', exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`after-${width}-detail-dark.png`), fullPage: true });
  });
}
