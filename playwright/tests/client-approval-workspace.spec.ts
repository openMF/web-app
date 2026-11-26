/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base, expect, Page, Route } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const test = base.extend<{ approvalPermissions: string[] }>({ approvalPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });
let rows: any[];
let batches: any[][];
let assignments: { id: number; payload: any }[];
let reads: URL[];
let partial: boolean;
let reverseDetails: boolean;
let heldDetails: { id: number; route: Route }[];
let searchFailure: boolean;
let assignmentFailure: boolean;
let batchDelay: Promise<void> | undefined;
let listFailure: boolean;
let listDelay: Promise<void> | undefined;
const evidence = '../WEB-1473-evidence';

test.beforeEach(async ({ page, approvalPermissions }) => {
  rows = Array.from({ length: 27 }, (_, i) => ({
    id: i + 1,
    accountNo: String(i + 1).padStart(9, '0'),
    displayName: i === 0 ? 'Synthetic Élise Client' : i === 6 ? 'Synthetic Client .' : 'Synthetic Client ' + (i + 1),
    officeId: i < 20 ? 1 : 2,
    officeName: i < 20 ? 'Synthetic Central' : 'Synthetic East',
    staffId: i === 4 ? 10 : null,
    staffName: i === 4 ? 'Synthetic Officer' : undefined,
    active: false,
    status: { id: 100, code: 'clientStatusType.pending', value: 'Pending' },
    timeline: { submittedOnDate: [
        2026,
        11,
        i < 8 ? 12 : 10
      ] }
  }));
  batches = [];
  assignments = [];
  reads = [];
  partial = false;
  reverseDetails = false;
  heldDetails = [];
  searchFailure = false;
  assignmentFailure = false;
  batchDelay = undefined;
  listFailure = false;
  listDelay = undefined;
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1473,
        username: 'Synthetic reviewer',
        officeId: 1,
        officeName: 'Synthetic Central',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-18');
  }, approvalPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.env = { productionModeEnableRBAC: true };' })
  );
  // All requests and all financial writes are intercepted. No synthetic command reaches a backend.
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith('/clients') && request.method() === 'GET') {
      reads.push(url);
      if (listDelay) await listDelay;
      if (listFailure) return route.fulfill({ status: 503, json: { errors: [] } });
      let filtered = rows.filter((row) => !row.active);
      for (const key of [
        'officeId',
        'staffId'
      ]) if (url.searchParams.has(key))
          filtered = filtered.filter((row) => String(row[key]) === url.searchParams.get(key));
      if (url.searchParams.has('displayName'))
        filtered = filtered.filter((row) =>
          row.displayName.toLocaleLowerCase().includes(url.searchParams.get('displayName')!.toLocaleLowerCase())
        );
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 1000);
      return route.fulfill({
        json: { totalFilteredRecords: filtered.length, pageItems: filtered.slice(offset, offset + limit) }
      });
    }
    if (/\/clients\/\d+$/.test(path) && request.method() === 'GET') {
      const id = Number(path.split('/').pop());
      if (reverseDetails && [
          1,
          2,
          3
        ].includes(id)) {
        heldDetails.push({ id, route });
        if (heldDetails.length === 3) {
          for (const held of heldDetails.sort((a, b) => b.id - a.id)) {
            await held.route.fulfill({ json: rows.find((row) => row.id === held.id) });
          }
        }
        return;
      }
      return route.fulfill({ json: rows.find((row) => row.id === id) });
    }
    if (path.endsWith('/batches') && request.method() === 'POST') {
      const batch = request.postDataJSON();
      batches.push(batch);
      if (batchDelay) await batchDelay;
      const responses = batch.flatMap((item: any) => {
        const id = Number(/clients\/(\d+)/.exec(item.relativeUrl)![1]);
        if (partial && id === 3) return [];
        if (partial && id === 2) return [{ requestId: item.requestId, statusCode: 400, body: '{}' }];
        rows.find((row) => row.id === id).active = true;
        return [
          { requestId: item.requestId, statusCode: id % 2 ? '200' : 200, body: JSON.stringify({ resourceId: id }) }
        ];
      });
      return route.fulfill({ json: responses });
    }
    if (
      /\/clients\/\d+$/.test(path) &&
      request.method() === 'POST' &&
      url.searchParams.get('command') === 'assignStaff'
    ) {
      assignments.push({ id: Number(path.split('/').pop()), payload: request.postDataJSON() });
      return assignmentFailure
        ? route.fulfill({ status: 400, json: { errors: [] } })
        : route.fulfill({ json: { resourceId: assignments.at(-1)!.id } });
    }
    if (request.method() !== 'GET') return route.fulfill({ status: 403, json: { errors: [] } });
    let data: any = [];
    if (path.endsWith('/offices'))
      data = [
        { id: 1, name: 'Synthetic Central' },
        { id: 2, name: 'Synthetic East' }
      ];
    else if (path.endsWith('/staff')) data = [{ id: 10, displayName: 'Synthetic Officer' }];
    else if (path.endsWith('/businessdate')) data = { businessDate: '2026-11-18' };
    else if (path.endsWith('/search') && searchFailure) return route.fulfill({ status: 503, json: { errors: [] } });
    else if (path.endsWith('/search'))
      data = rows
        .filter((row) => row.accountNo === url.searchParams.get('query'))
        .map((row) => ({ entityId: row.id, entityType: 'CLIENT', entityAccountNo: row.accountNo }));
    else if (path.includes('/configurations')) data = { value: 0, enabled: false };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (path.endsWith('/loans') || path.endsWith('/v2/prospects'))
      data = { totalFilteredRecords: 0, pageItems: [] };
    return route.fulfill({ json: data });
  });
});

async function open(page: Page) {
  await page.goto('/#/checker-inbox-and-tasks/client-approval');
  await expect(page.locator('mifosx-client-approval tbody tr')).toHaveCount(10);
}
async function selectThree(page: Page) {
  for (const account of [
    '000000001',
    '000000002',
    '000000003'
  ]) await page.getByRole('checkbox', { name: `Select client ${account}`, exact: true }).check();
}
async function confirm(page: Page) {
  await page.getByRole('button', { name: 'Approve 3 clients', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Activation date:');
  expect(batches).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
}

for (const width of [
  390,
  768,
  1280,
  1447,
  1920
]) {
  test(`responsive blue workspace at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1358 });
    await open(page);
    await expect(page.locator('.summary-card')).toHaveCount(4);
    await expect(page.locator('.summary-card').first()).toContainText('27');
    await expect(page.locator('.visible-range')).toHaveText('1–10 of 27');
    await selectThree(page);
    await expect(page.locator('.selection-count')).toContainText('3 clients selected');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const primary = await page.locator('.approve-selected').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(primary).toMatch(/rgb/);
    const rgb = primary.match(/\d+/g)!.map(Number);
    expect(rgb[2]).toBeGreaterThan(rgb[1]);
    await mkdir(evidence, { recursive: true });
    if (width === 390) await page.screenshot({ path: `${evidence}/after-mobile-rows.png`, fullPage: true });
    await page.locator('mifosx-client-approval').evaluate((el) => {
      let ancestor = el.parentElement;
      while (ancestor) {
        ancestor.scrollTop = 0;
        ancestor = ancestor.parentElement;
      }
    });
    await page.screenshot({ path: `${evidence}/after-${width}.png`, fullPage: true });
  });
}

test('searches accented names and exact accounts, resets and filters offices/staff', async ({ page }) => {
  await open(page);
  await page.getByRole('textbox', { name: 'Search by name or exact account number' }).fill('Élise');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('000000001');
  await page.getByRole('textbox', { name: 'Search by name or exact account number' }).fill('000000021');
  await expect(page.locator('tbody')).toContainText('000000021');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('combobox', { name: 'Office', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Central', exact: true }).click();
  await page.getByRole('combobox', { name: 'Staff', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Officer', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('000000005');
  expect(
    reads.some((url) => url.searchParams.get('staffId') === '10' && url.searchParams.get('officeId') === '1')
  ).toBe(true);
});

test('finds an exact alphanumeric account without treating it only as a client name', async ({ page }) => {
  rows[0].accountNo = 'HQ-00001';
  await open(page);
  await page.getByRole('textbox', { name: 'Search by name or exact account number' }).fill('HQ-00001');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('HQ-00001');
  await expect(page.locator('tbody')).toContainText('Synthetic Élise Client');
  expect(reads.some((url) => url.searchParams.get('displayName') === 'HQ-00001')).toBe(false);
});

test('keeps name search usable after exact lookup failure and reports account-only failure', async ({ page }) => {
  await open(page);
  searchFailure = true;
  const search = page.getByRole('textbox', { name: 'Search by name or exact account number' });
  await search.fill('Élise');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Synthetic Élise Client');
  await search.fill('000000001');
  await expect(page.locator('.feedback')).toContainText('Unable to load pending clients');
  expect(reads.some((url) => url.searchParams.get('displayName') === '000000001')).toBe(false);
});

test('recovers the table after correcting an invalid submitted-from date', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Submitted', exact: true }).click();
  const start = page.getByRole('textbox', { name: 'Start date', exact: true });
  await start.fill('invalid');
  await start.press('Tab');
  await expect(page.locator('tbody tr')).toHaveCount(0);
  await start.fill('11 November 2026');
  await start.press('Tab');
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await expect(page.locator('.visible-range')).toHaveText('1–8 of 8');
});

test('filters verified complete submission dates and preserves summary scope', async ({ page }) => {
  await open(page);
  await selectThree(page);
  await page.getByRole('button', { name: 'Submitted', exact: true }).click();
  const start = page.getByRole('textbox', { name: 'Start date', exact: true });
  await start.fill('11 November 2026');
  await start.press('Tab');
  await expect(page.locator('.visible-range')).toHaveText('1–8 of 8');
  await expect(page.locator('.selection-count')).toHaveCount(0);
  await expect(page.locator('.summary-card').first()).toContainText('27');
  await page.getByRole('button', { name: 'Clear dates', exact: true }).click();
  await expect(page.locator('.visible-range')).toHaveText('1–10 of 27');
  await expect(page.locator('tbody tr').first().getByRole('link', { name: 'View', exact: true })).toHaveAttribute(
    'href',
    /clients\/1$/
  );
  const group = page.locator('.office-toggle');
  await group.focus();
  await group.press('Enter');
  await expect(group).toHaveAttribute('aria-expanded', 'false');
  await group.press('Enter');
  await expect(group).toHaveAttribute('aria-expanded', 'true');
});

test('collapses groups and clears page selections when paginating', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Select all on this page', exact: true }).click();
  await expect(page.locator('.selection-count')).toContainText('10 clients selected');
  await page.locator('.office-toggle').click();
  await expect(page.locator('tbody')).toHaveCount(0);
  await expect(page.locator('.selection-count')).toHaveCount(0);
  await page.locator('.office-toggle').click();
  await selectThree(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.locator('.visible-range')).toHaveText('11–20 of 27');
  await expect(page.locator('.selection-count')).toHaveCount(0);
});

test('confirms batch activation, updates real totals, and leaves staff unchanged', async ({ page }) => {
  reverseDetails = true;
  await open(page);
  await selectThree(page);
  await confirm(page);
  await expect(page.locator('.outcomes')).toContainText('3 activated · 0 failed · 0 uncertain');
  await expect(page.locator('.summary-card').first()).toContainText('24');
  expect(assignments).toEqual([]);
  expect(batches).toHaveLength(1);
  const batch = batches[0];
  expect(new Set(batch.map((item) => item.requestId)).size).toBe(3);
  expect(new Set(batch.map((item) => item.relativeUrl))).toEqual(
    new Set(
      [
        1,
        2,
        3
      ].map((id) => `clients/${id}?command=activate`)
    )
  );
  expect(JSON.parse(batch[0].body)).toEqual(
    expect.objectContaining({ activationDate: expect.any(String), dateFormat: expect.any(String), locale: 'en' })
  );
  expect(JSON.parse(batch[0].body)).not.toHaveProperty('staffId');
});

test('reports partial and missing outcomes without automatic resubmission', async ({ page }) => {
  reverseDetails = true;
  partial = true;
  await open(page);
  await selectThree(page);
  await confirm(page);
  await expect(page.locator('.outcomes')).toContainText('1 activated · 1 failed · 1 uncertain');
  await expect(page.getByRole('checkbox', { name: 'Select client 000000003', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Next page' }).click();
  expect(batches).toHaveLength(1);
});

test('assigns staff separately only to successful activations and preserves assignment failures', async ({ page }) => {
  reverseDetails = true;
  partial = true;
  assignmentFailure = true;
  await open(page);
  await page.getByRole('combobox', { name: 'Office', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Central', exact: true }).click();
  await selectThree(page);
  await page.getByRole('combobox', { name: 'Assign staff', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Officer', exact: true }).click();
  await confirm(page);
  await expect(page.locator('.outcomes')).toContainText('Assign staff: Failed');
  expect(assignments).toEqual([{ id: 1, payload: { staffId: 10 } }]);
  expect(batches).toHaveLength(1);
});

test('individual approval requires confirmation, supports cancellation and prevents duplicate writes', async ({
  page
}) => {
  await open(page);
  await page.locator('tbody tr').first().getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Synthetic Élise Client');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(batches).toEqual([]);
  let release!: () => void;
  batchDelay = new Promise((resolve) => {
    release = resolve;
  });
  await page.locator('tbody tr').first().getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await expect(page.locator('tbody tr').first().getByRole('button', { name: 'Approve', exact: true })).toBeDisabled();
  await expect.poll(() => batches.length).toBe(1);
  release();
  await expect(page.locator('.outcomes')).toContainText('1 activated · 0 failed · 0 uncertain');
});

test('individual approval ignores a staff choice made for the bulk selection', async ({ page }) => {
  await open(page);
  await page.getByRole('combobox', { name: 'Office', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Central', exact: true }).click();
  await selectThree(page);
  await page.getByRole('combobox', { name: 'Assign staff', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic Officer', exact: true }).click();
  await page.locator('tbody tr').nth(3).getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Keep staff unchanged');
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await expect(page.locator('.outcomes')).toContainText('1 activated · 0 failed · 0 uncertain');
  expect(assignments).toEqual([]);
  expect(batches).toHaveLength(1);
  expect(batches[0][0].relativeUrl).toBe('clients/4?command=activate');
});

test('allows correcting the shared activation date after clearing selection before individual approval', async ({
  page
}) => {
  await open(page);
  await page.getByRole('checkbox', { name: 'Select client 000000001', exact: true }).check();
  const date = page.getByRole('textbox', { name: 'Activation date', exact: true });
  await date.fill('invalid');
  await date.press('Tab');
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await expect(page.locator('.selection-count')).toHaveCount(0);
  await expect(date).toBeVisible();
  const approve = page.locator('tbody tr').first().getByRole('button', { name: 'Approve', exact: true });
  await expect(approve).toBeDisabled();
  await date.fill('17 November 2026');
  await date.press('Tab');
  await expect(approve).toBeEnabled();
  await approve.click();
  await expect(page.getByRole('dialog')).toContainText('Activation date: 17 November 2026');
  expect(batches).toEqual([]);
});

test('recovers the last valid server page when pending records shrink', async ({ page }) => {
  const prototype = rows[0];
  rows = Array.from({ length: 1205 }, (_, i) => ({
    ...prototype,
    id: i + 1,
    accountNo: String(i + 1).padStart(9, '0')
  }));
  await open(page);
  rows = rows.slice(0, 23);
  await page.getByRole('button', { name: 'Last page' }).click();
  await expect(page.locator('.visible-range')).toHaveText('21–23 of 23');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  expect(reads.some((url) => url.searchParams.get('offset') === '1200')).toBe(true);
  expect(reads.some((url) => url.searchParams.get('offset') === '20')).toBe(true);
  rows = [];
  await page.getByRole('button', { name: 'Previous page' }).click();
  await expect(page.locator('.visible-range')).toHaveText('0');
  await expect(page.locator('tbody tr')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
});

test('uses server paging above 1000 and disables incomplete metrics and date filters', async ({ page }) => {
  const prototype = rows[0];
  rows = Array.from({ length: 1205 }, (_, i) => ({
    ...prototype,
    id: i + 1,
    accountNo: String(i + 1).padStart(9, '0')
  }));
  await open(page);
  await expect(page.locator('.summary-card').first()).toContainText('1205');
  await expect(page.locator('.summary-card').nth(1)).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Submitted', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Last page' }).click();
  await expect(page.locator('.visible-range')).toHaveText('1201–1205 of 1205');
  expect(reads.some((url) => url.searchParams.get('offset') === '1200' && url.searchParams.get('limit') === '10')).toBe(
    true
  );
});

test('shows a retryable API error instead of an empty queue', async ({ page }) => {
  listFailure = true;
  await page.goto('/#/checker-inbox-and-tasks/client-approval');
  await expect(page.locator('.feedback')).toContainText('Unable to load pending clients');
  await expect(page.locator('.empty-state')).toHaveCount(0);
  listFailure = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
});

test('supports dark mode with readable selected rows and blue actions', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1358 });
  await open(page);
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  await selectThree(page);
  await expect(page.locator('.bulk-toolbar')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  const colors = await page
    .locator('.approval-workspace')
    .evaluate((el) => ({ background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color }));
  expect(colors.background).not.toBe('rgb(255, 255, 255)');
  expect(colors.color).not.toBe(colors.background);
  const selectedColors = await page
    .locator('.selected-row')
    .evaluateAll((rows) => rows.map((row) => getComputedStyle(row).backgroundColor));
  expect(new Set(selectedColors).size).toBe(1);
  expect(selectedColors[0]).not.toBe(colors.background);
  await page.screenshot({ path: `${evidence}/after-dark.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('activation without staff permission', () => {
  test.use({ approvalPermissions: [
      'READ_CLIENT',
      'ACTIVATE_CLIENT'
    ] });
  test('permits approval while keeping staff assignment unavailable', async ({ page }) => {
    await open(page);
    await selectThree(page);
    await expect(page.getByRole('combobox', { name: 'Assign staff', exact: true })).toHaveCount(0);
    await confirm(page);
    await expect(page.locator('.outcomes')).toContainText('3 activated');
    expect(assignments).toEqual([]);
  });
});

test.describe('read-only', () => {
  test.use({ approvalPermissions: ['ALL_FUNCTIONS_READ'] });
  test('hides approval and staff assignment and prevents selection', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Select client 000000001', exact: true })).toBeDisabled();
    expect(batches).toEqual([]);
  });
});

test('captures the unmodified before screen with the same synthetic data', async ({ page }) => {
  test.skip(!process.env.WEB1473_BEFORE_URL, 'Run with WEB1473_BEFORE_URL to capture the original checkout');
  await page.setViewportSize({ width: 1920, height: 1358 });
  await page.goto(process.env.WEB1473_BEFORE_URL + '/#/checker-inbox-and-tasks/client-approval');
  await expect(page.locator('mifosx-client-approval table').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/before-1920.png`, fullPage: true });
});
