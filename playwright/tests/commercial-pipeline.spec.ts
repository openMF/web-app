/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test as base, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
interface PendingProspect {
  prospectId: number;
  displayName: string;
  externalRef: string;
  clientId: number;
  officeId: number;
  registrationStatus: string;
  currentStage: string;
  lastCompletedStage: string;
  stoppedAtStage: string;
  createdAt: string;
  lastUpdatedAt: string;
}

const test = base.extend<{ prospectPermissions: string[] }>({ prospectPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });
let rows: PendingProspect[];
let queries: URL[];
let writes: string[];
let failures: boolean;
let malformed: boolean;
let emptyWithPositiveTotal: boolean;
const evidence = '../WEB-1479-evidence';

function synthetic(id: number): PendingProspect {
  return {
    prospectId: id,
    displayName: `Synthetic Prospect ${String(id).padStart(2, '0')}`,
    externalRef: `S-${id}`,
    clientId: id + 100,
    officeId: id % 2 ? 1 : 2,
    registrationStatus: id === 3 ? 'COMPLETED' : 'IN_PROGRESS',
    currentStage: id % 2 ? 'KYC_LEVEL_1' : 'CREDIT_ANALYSIS',
    lastCompletedStage: 'COMMERCIAL_REGISTRATION',
    stoppedAtStage: id % 3 === 0 ? 'UNKNOWN' : 'KYC_LEVEL_1',
    // Neither of these dates is an authoritative stage-entry timestamp.
    createdAt: '2026-11-01T23:30:00Z',
    lastUpdatedAt: '2026-11-14T00:30:00Z'
  };
}

test.beforeEach(async ({ page, prospectPermissions }) => {
  rows = Array.from({ length: 14 }, (_, index) => synthetic(index + 1));
  queries = [];
  writes = [];
  failures = false;
  malformed = false;
  emptyWithPositiveTotal = false;
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1479,
        username: 'Synthetic reviewer',
        officeId: 1,
        officeName: 'Synthetic Central',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-26');
  }, prospectPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.env = { productionModeEnableRBAC: true };'
    })
  );
  // All API requests are mocked. Financial and notification writes are rejected.
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    if (request.method() !== 'GET') {
      writes.push(`${request.method()} ${path}`);
      return route.fulfill({ status: 403, json: { errors: [] } });
    }
    if (path.endsWith('/v2/prospects')) {
      queries.push(url);
      if (failures) return route.fulfill({ status: 503, json: { errors: [] } });
      if (malformed) return route.fulfill({ json: { unexpected: [] } });
      if (emptyWithPositiveTotal) return route.fulfill({ json: { totalFilteredRecords: 2, pageItems: [] } });
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const office = url.searchParams.get('officeId');
      const filtered = rows.filter(
        (row) =>
          (!office || String(row.officeId) === office) &&
          `${row.displayName} ${row.externalRef}`.toLowerCase().includes(q)
      );
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 10);
      return route.fulfill({
        json: { totalFilteredRecords: filtered.length, pageItems: filtered.slice(offset, offset + limit) }
      });
    }
    let data: unknown = [];
    if (path.endsWith('/offices'))
      data = [
        { id: 1, name: 'Synthetic Central' },
        { id: 2, name: 'Synthetic East' }
      ];
    else if (path.includes('/configurations')) data = { value: 0, enabled: true };
    else if (path.includes('/businessdate')) data = { date: [
          2026,
          11,
          26
        ] };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (/\/(clients|loans|savingsaccounts)$/.test(path)) data = { totalFilteredRecords: 0, pageItems: [] };
    return route.fulfill({ json: data });
  });
});

async function open(page: Page) {
  await page.goto('/#/dashboard');
  await page.getByRole('tab', { name: 'Commercial panel', exact: true }).click();
  await expect(page.locator('mifosx-commercial-panel')).toBeVisible();
}
const panel = (page: Page) => page.locator('mifosx-commercial-panel');

test('keeps both existing dashboard views and lazily loads the commercial view', async ({ page }) => {
  await page.goto('/#/dashboard');
  await expect(page.getByRole('tab', { name: 'Dashboard', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(queries).toHaveLength(0);
  await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
  await expect(page.locator('mifosx-onboarding-board')).toBeVisible();
  await page.getByRole('tab', { name: 'Commercial panel', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(10);
  expect(queries[0].searchParams.get('limit')).toBe('10');
  expect(queries[0].searchParams.get('orderBy')).toBe('prospectId');
  expect(writes).toEqual([]);
});

test('renders eight phases, departments and honest unavailable metrics', async ({ page }) => {
  await open(page);
  await expect(panel(page).locator('thead th')).toHaveCount(10);
  await expect(panel(page).locator('.stage-number')).toHaveText([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8'
  ]);
  await expect(panel(page).locator('thead')).not.toContainText('Recovery');
  await expect(panel(page).locator('.summary-card strong')).toHaveText([
    '—',
    '—',
    '—',
    '—',
    '—'
  ]);
  await expect(panel(page).locator('.summary-grid')).toContainText('Unavailable');
  await expect(panel(page).locator('.stage-marker')).toHaveCount(80);
  await expect(panel(page).locator('.stage-marker').first()).toHaveAccessibleName(/Unknown/);
  await expect(panel(page).locator('.scope-bar')).toContainText('Loaded prospects: 10 · Matching prospects: 14');
  await expect(panel(page).getByRole('button', { name: 'On time · 1–5 days', exact: true })).toBeDisabled();
  await expect(panel(page).locator('.legend')).toContainText('6–10 days');
});

test('searches by q and synchronizes selected summary and attention', async ({ page }) => {
  await open(page);
  await panel(page).getByRole('textbox', { name: 'Search by folio or prospect' }).fill('S-2');
  await expect(panel(page).locator('tbody tr')).toHaveCount(1);
  expect(queries.at(-1)!.searchParams.get('q')).toBe('S-2');
  expect(queries.at(-1)!.searchParams.has('search')).toBe(false);
  await expect(panel(page).locator('.traceability')).toContainText('Synthetic Prospect 02');
  await expect(panel(page).locator('.attention-row')).toHaveCount(1);
  await expect(panel(page).locator('.traceability')).toContainText('COMMERCIAL_REGISTRATION');
  await expect(panel(page).locator('.traceability')).not.toContainText('Missing proof');
});

test('uses actual office IDs and server pagination', async ({ page }) => {
  await open(page);
  await panel(page).getByRole('button', { name: 'Next page' }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(4);
  expect(queries.at(-1)!.searchParams.get('offset')).toBe('10');
  await panel(page).getByRole('combobox', { name: 'Branch', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic East', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(7);
  expect(queries.at(-1)!.searchParams.get('officeId')).toBe('2');
  expect(queries.at(-1)!.searchParams.get('offset')).toBe('0');
});

test('refresh recovers a removed page and keeps valid pages navigable', async ({ page }) => {
  rows = Array.from({ length: 25 }, (_, index) => synthetic(index + 1));
  await open(page);
  await expect(panel(page).locator('tbody tr')).toHaveCount(10);
  await panel(page).getByRole('button', { name: 'Next page' }).click();
  await expect(panel(page).locator('.prospect-button').first()).toHaveText('Synthetic Prospect 11');
  await panel(page).getByRole('button', { name: 'Next page' }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(5);

  rows = rows.slice(0, 19);
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(9);
  expect(queries.slice(-2).map((query) => query.searchParams.get('offset'))).toEqual([
    '20',
    '10'
  ]);
  await expect(panel(page).locator('.scope-bar')).toContainText('Matching prospects: 19');
  await expect(panel(page).getByRole('button', { name: 'Previous page' })).toBeEnabled();
  await expect(panel(page).getByRole('button', { name: 'Next page' })).toBeDisabled();
  await expect(panel(page).locator('.traceability')).toContainText('Synthetic Prospect 11');

  const readsBeforeRefresh = queries.length;
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect.poll(() => queries.length).toBe(readsBeforeRefresh + 1);
  await expect(panel(page).locator('.scope-bar')).toContainText('Loaded prospects: 9');
  expect(queries.at(-1)!.searchParams.get('offset')).toBe('10');
});

test('supports keyboard row selection and safe client-note navigation', async ({ page }) => {
  await open(page);
  const button = panel(page).locator('.prospect-button').nth(1);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(panel(page).locator('.traceability h3')).toContainText('Synthetic Prospect 02');
  await expect(panel(page).getByRole('link', { name: 'View file', exact: true })).toHaveAttribute(
    'href',
    /clients\/102\/general/
  );
  await expect(panel(page).getByRole('link', { name: 'Open client notes', exact: true })).toHaveAttribute(
    'href',
    /clients\/102\/notes/
  );
  expect(writes).toEqual([]);
});

test('shows an empty state without claiming measured zero pipeline metrics', async ({ page }) => {
  rows = [];
  await open(page);
  await expect(panel(page)).toContainText('No prospects match this search.');
  await expect(panel(page).locator('.summary-card strong')).toHaveText([
    '—',
    '—',
    '—',
    '—',
    '—'
  ]);
  await expect(panel(page)).toContainText('Aging could not be assessed.');
});

test('clears stale selection on failure and recovers through Retry', async ({ page }) => {
  await open(page);
  await expect(panel(page).locator('tbody tr')).toHaveCount(10);
  failures = true;
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(panel(page).getByRole('alert')).toContainText('Could not load prospects');
  await expect(panel(page).locator('tbody tr')).toHaveCount(0);
  await expect(panel(page).getByRole('link', { name: 'View file', exact: true })).toHaveCount(0);
  failures = false;
  await panel(page).getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(10);
});

test('shows an error for an empty first page with a positive total and can retry', async ({ page }) => {
  emptyWithPositiveTotal = true;
  await open(page);
  await expect(panel(page).getByRole('alert')).toBeVisible();
  await expect(panel(page)).not.toContainText('No prospects match this search.');
  await expect(panel(page).locator('tbody tr')).toHaveCount(0);
  emptyWithPositiveTotal = false;
  await panel(page).getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(10);
  await expect(panel(page).getByRole('alert')).toHaveCount(0);
});

test('rejects malformed success instead of presenting an empty success', async ({ page }) => {
  malformed = true;
  await open(page);
  await expect(panel(page).getByRole('alert')).toBeVisible();
  await expect(panel(page)).not.toContainText('No prospects match this search.');
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
    test(`keeps shell contained at ${width}px in ${dark ? 'dark' : 'light'} theme`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1080 : 2400 });
      await page.addInitScript((dark) => localStorage.setItem('mifosXThemeDarkEnabled', JSON.stringify(dark)), dark);
      await open(page);
      await expect(panel(page).locator('.scope-bar')).toContainText('Loaded prospects: 10');
      if (width === 390) {
        await expect(panel(page).locator('.table-scroll')).toBeHidden();
        await expect(panel(page).locator('.mobile-prospect')).toHaveCount(10);
        await expect(panel(page).locator('.mobile-prospect').first().locator('li')).toHaveCount(8);
      } else {
        await expect(panel(page).locator('.table-scroll')).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('body')).toHaveClass(new RegExp(`\\b${dark ? 'dark-theme' : 'light-theme'}\\b`));
      await expect(page.locator('body')).not.toHaveClass(new RegExp(`\\b${dark ? 'light-theme' : 'dark-theme'}\\b`));
      await mkdir(evidence, { recursive: true });
      await page.screenshot({ path: `${evidence}/after-${width}-${dark ? 'dark' : 'light'}.png`, fullPage: true });
      await panel(page).locator('.traceability').scrollIntoViewIfNeeded();
      await expect(panel(page).locator('.traceability')).toBeInViewport();
      await page.screenshot({
        path: `${evidence}/after-${width}-${dark ? 'dark' : 'light'}-details.png`,
        fullPage: true
      });
    });
  }
}

test.describe('limited permissions', () => {
  test.use({ prospectPermissions: ['READ_PROSPECT'] });
  test('preserves prospect access without exposing client or note links', async ({ page }) => {
    await open(page);
    await expect(panel(page).locator('tbody tr')).toHaveCount(10);
    await expect(panel(page).getByRole('link', { name: 'View file', exact: true })).toHaveCount(0);
    await expect(panel(page).getByRole('link', { name: 'Open client notes', exact: true })).toHaveCount(0);
  });
});

test.describe('no prospect permission', () => {
  test.use({ prospectPermissions: ['READ_CLIENT'] });
  test('does not issue a prospect request', async ({ page }) => {
    await open(page);
    await expect(panel(page)).toContainText('You do not have permission');
    expect(queries).toEqual([]);
  });
});
