/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs/promises';

// Isolated synthetic contract data: every API request is intercepted. No audit records are written.
test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1600, height: 1100 } });

const office = { id: 4, name: 'Audit review fixture', parentId: 1, externalId: '0004', openingDate: [
    2020,
    1,
    1
  ] };
const event = (id: number, overrides: any = {}) => ({
  id,
  resourceId: 4,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  maker: 'fixture-user',
  madeOnDate: [
    2026,
    10,
    2,
    16,
    5
  ],
  processingResult: 'Processed',
  ...overrides
});

async function mockHistory(page: Page, options: { permissions?: string[]; status?: number; locale?: string } = {}) {
  const calls: { path: string; method: string; query: URLSearchParams }[] = [];
  await page.addInitScript(
    ({ permissions, locale }) => {
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify({ code: locale.split('-')[0], name: locale }));
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          username: 'contract-fixture',
          userId: 1,
          officeId: 1,
          officeName: 'Fixture',
          permissions,
          roles: [],
          shouldRenewPassword: false
        })
      );
    },
    { permissions: options.permissions ?? ['ALL_FUNCTIONS'], locale: options.locale ?? 'en-US' }
  );
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/fineract-provider/api', '');
    calls.push({ path, method: route.request().method(), query: url.searchParams });
    let body: unknown = [];
    if (path === '/v1/offices') body = [office];
    else if (path === '/v1/offices/4') body = office;
    else if (path === '/v1/configurations') body = { globalConfiguration: [] };
    else if (path === '/v1/audits/searchtemplate') body = { appUsers: [{ id: 3, username: 'fixture-user' }] };
    else if (path === '/v1/audits') {
      expect(url.searchParams.get('entityName')).toBe('OFFICE');
      expect(url.searchParams.get('resourceId')).toBe('4');
      expect(url.searchParams.get('limit')).toBe('25');
      if (options.status) {
        await route.fulfill({ status: options.status, json: {} });
        return;
      }
      const next = Number(url.searchParams.get('offset')) > 0;
      body = {
        totalFilteredRecords: 5,
        pageItems: next
          ? [
              event(50, { madeOnDate: [
                  2026,
                  9,
                  15
                ] }),
              event(49, { maker: null, madeOnDate: [
                  2026,
                  8,
                  20
                ] })
            ]
          : [
              event(52),
              event(50, { madeOnDate: [
                  2026,
                  9,
                  15
                ] }),
              event(53, { entityName: 'OFFICETRANSACTION', maker: 'UNRELATED_RESOURCE' })
            ]
      };
    } else if (/\/v1\/audits\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      body = {
        ...event(id),
        commandAsJson: JSON.stringify({
          name: '<img src=x onerror=alert(1)>',
          externalId: '00012345678901234567890',
          password: 'HIDDEN_SECRET',
          token: 'HIDDEN_TOKEN'
        })
      };
    } else if (path === '/v2/offices/4/schedules') body = { officeId: 4, days: [] };
    await route.fulfill({ json: body });
  });
  return calls;
}

test('monthly timeline, safe on-demand fields, loaded CSV and scoped pagination', async ({ page }, testInfo) => {
  const calls = await mockHistory(page);
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page.locator('.audit-card')).toHaveCount(2);
  await expect(page.locator('.month-heading')).toHaveText([
    'October 2026',
    'September 2026'
  ]);
  await expect(page.locator('.branch-history')).not.toContainText('UNRELATED_RESOURCE');
  expect(calls.filter((call) => /\/audits\/\d+$/.test(call.path))).toHaveLength(0);
  await page.locator('.event-actions button').first().click();
  await expect(page.locator('.submitted-value').first()).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.submitted-fields img')).toHaveCount(0);
  await expect(page.locator('.branch-history')).not.toContainText('HIDDEN_SECRET');
  await expect(page.locator('.comparison-notice')).toContainText('Previous values were not recorded');
  await expect(page.locator('.submitted-value').last()).toHaveText('00012345678901234567890');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.export-button').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('office-4-loaded-audit.csv');
  const csv = await fs.readFile((await download.path())!, 'utf8');
  expect(csv).toContain('"52","4","OFFICE"');
  expect(csv).not.toMatch(/HIDDEN_|UNRELATED_RESOURCE|onerror/);
  await page.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(page.locator('.audit-card')).toHaveCount(3);
  await expect(page.locator('.month-heading')).toHaveText([
    'October 2026',
    'September 2026',
    'August 2026'
  ]);
  await expect(page.locator('.actor-avatar.unidentified')).toHaveCount(1);
  await expect(page.locator('.summary-card .metric strong')).toHaveText([
    '3',
    '1'
  ]);
  expect(calls.filter((call) => call.path === '/v1/audits').map((call) => call.query.get('offset'))).toEqual([
    '0',
    '3'
  ]);
  expect(calls.every((call) => call.method === 'GET')).toBe(true);
  await page.locator('.office-header').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('history-desktop.png'), fullPage: true });
});

test('local search and maker/date filters retain office scope', async ({ page }) => {
  const calls = await mockHistory(page);
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page.locator('.audit-card')).toHaveCount(2);
  const search = page.getByRole('textbox', { name: 'Search by field or value' });
  await search.fill('no-matching-fixture');
  await expect(page.locator('.audit-card')).toHaveCount(0);
  expect(calls.filter((call) => call.path === '/v1/audits')).toHaveLength(1);
  await search.fill('');
  await expect(page.locator('.audit-card')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'User', exact: true }).click();
  await page.getByRole('option', { name: 'fixture-user', exact: true }).click();
  await expect
    .poll(() =>
      calls
        .filter((call) => call.path === '/v1/audits')
        .at(-1)
        ?.query.get('makerId')
    )
    .toBe('3');
  await page.getByRole('button', { name: 'All history' }).click();
  await page.locator('input[formcontrolname="from"]').fill('2026-10-01T00:00:00');
  await expect
    .poll(() =>
      calls
        .filter((call) => call.path === '/v1/audits')
        .at(-1)
        ?.query.get('makerDateTimeFrom')
    )
    .toBe('2026-10-01 00:00:00');
  await page.locator('input[formcontrolname="to"]').fill('2026-09-01T00:00:00');
  await expect(page.getByRole('alert')).toContainText('Enter valid dates');
  await expect(page.locator('.export-button')).toBeDisabled();
});

test('office-only users cannot see the tab or access the route', async ({ page }) => {
  const calls = await mockHistory(page, { permissions: ['READ_OFFICE'] });
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page).toHaveURL(/\/4\/general$/);
  await expect(page.locator('a[href$="/change-history"]')).toHaveCount(0);
  expect(calls.some((call) => call.path.includes('/audits'))).toBe(false);
});

test('audit 403 is a permission state and other branch tabs remain usable', async ({ page }) => {
  await mockHistory(page, { status: 403 });
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page.locator('.branch-history [role="alert"]')).toContainText('You do not have permission');
  await expect(page.locator('.audit-card')).toHaveCount(0);
  await page.locator('a[href$="/address"]').click();
  await expect(page).toHaveURL(/\/4\/address$/);
});

test('Spanish mobile layout stays within the page and uses localized month headings', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockHistory(page, { locale: 'es-MX' });
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page.locator('.audit-card')).toHaveCount(2);
  await expect(page.locator('.month-heading').first()).toHaveText('octubre 2026');
  await expect(page.locator('a[href$="/change-history"]')).toHaveText('Historial de cambios');
  const bounds = await page.locator('.branch-history').boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('history-mobile-es.png'), fullPage: true });
  await page.locator('.audit-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('history-mobile-timeline-es.png'), fullPage: true });
});

test('dark theme keeps the timeline and date controls readable on tablet', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 900, height: 1100 });
  await page.addInitScript(() => localStorage.setItem('mifosXThemeDarkEnabled', 'true'));
  await mockHistory(page);
  await page.goto('/#/organization/offices/4/change-history');
  await expect(page.locator('.audit-card')).toHaveCount(2);
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  const colors = await page
    .locator('.audit-card')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor };
    });
  expect(colors.color).not.toBe(colors.background);
  await page.getByRole('button', { name: 'All history' }).click();
  await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('.office-header').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('history-tablet-dark.png'), fullPage: true });
});
