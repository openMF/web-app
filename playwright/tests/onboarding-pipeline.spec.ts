/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test as base, expect, Page } from '@playwright/test';

const test = base.extend<{ enrollmentPermissions: string[]; enrollmentEnabled: boolean }>({ enrollmentPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ], enrollmentEnabled: [
    true,
    { option: true }
  ] });
let rows: ReturnType<typeof synthetic>[];
let queries: URL[];
let writes: string[];
let failure: number;
let malformed: boolean;
let contradictory: boolean;
let wrongDetail: boolean;
let pendingLoans: unknown[];
let pendingSavings: unknown[];
const panel = (page: Page) => page.locator('mifosx-onboarding-board');

function synthetic(id: number) {
  return {
    clientId: id,
    clientName: `Synthetic client ${String(id).padStart(2, '0')}`,
    officeId: (id % 2) + 1,
    clientLifecycleStatus: id === 2 ? 'clientStatusType.active' : 'clientStatusType.pending',
    enrollmentStages: [
      {
        name: 'COMMERCIAL_REGISTRATION',
        status: 'UNKNOWN',
        startedAt: '2026-11-01',
        completedAt: null,
        source: 'm_client.submittedon_date',
        aging: null
      },
      { name: 'BIOMETRICS_KYC_LEVEL_1', status: 'UNKNOWN', source: 'MISSING_EXPLICIT_KYC_LEVEL_MAPPING', aging: null },
      { name: 'KYC_LEVEL_2', status: 'UNKNOWN', source: 'MISSING_EXPLICIT_KYC_LEVEL_MAPPING', aging: null },
      { name: 'KYC_LEVEL_3', status: 'UNKNOWN', source: 'MISSING_EXPLICIT_KYC_LEVEL_MAPPING', aging: null },
      { name: 'COMPLIANCE', status: 'UNKNOWN', source: 'MISSING_EXPLICIT_COMPLIANCE_DECISION', aging: null },
      {
        name: 'ACTIVATION',
        status: id === 2 ? 'COMPLETED' : 'PENDING',
        source: 'm_client.status_enum,m_client.activation_date',
        aging: null
      }
    ],
    kycEvidence:
      id === 5
        ? null
        : {
            verificationId: id + 10,
            derivedKycStatus: id === 1 ? 'In Review' : id === 4 ? 'Declined' : id === 3 ? 'Pending' : 'Approved',
            verificationCreatedAt: '2026-11-01T00:00:00Z',
            verificationLastModifiedAt: '2026-11-25T23:30:00Z',
            faceMatchEvidencePresent: id <= 2,
            faceMatchEvidenceStatus: id <= 2 ? 'APPROVED' : 'UNKNOWN',
            faceMatchEvidenceSucceeded: id <= 2,
            amlScreeningEvidencePresent: id <= 2,
            amlScreeningEvidenceStatus: id === 2 ? 'APPROVED' : id === 1 ? 'NOT_APPROVED' : 'UNKNOWN',
            amlScreeningEvidenceSucceeded: id === 2
          }
  };
}

test.beforeEach(async ({ page, enrollmentPermissions, enrollmentEnabled }) => {
  rows = Array.from({ length: 5 }, (_, i) => synthetic(i + 1));
  pendingLoans = [];
  pendingSavings = [];
  queries = [];
  writes = [];
  failure = 0;
  malformed = false;
  contradictory = false;
  wrongDetail = false;
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1480,
        username: 'Synthetic reviewer',
        officeId: 1,
        officeName: 'Synthetic Central',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-26');
    localStorage.setItem('mifosXTenantIdentifier', 'synthetic-tenant');
  }, enrollmentPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body:
        'window.env = ' +
        JSON.stringify({ productionModeEnableRBAC: true, enableEnrollmentPipeline: enrollmentEnabled }) +
        ';'
    })
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    if (request.method() !== 'GET') {
      writes.push(`${request.method()} ${path}`);
      return route.fulfill({ status: 403, json: { errors: [] } });
    }
    if (path.endsWith('/v2/onboarding/cases')) {
      queries.push(url);
      if (failure) return route.fulfill({ status: failure, json: { errors: [] } });
      if (malformed) return route.fulfill({ json: { unexpected: [] } });
      if (contradictory) return route.fulfill({ json: { totalFilteredRecords: 2, pageItems: [] } });
      const id = url.searchParams.get('clientId');
      if (id)
        return route.fulfill({
          json: { totalFilteredRecords: 1, pageItems: [synthetic(wrongDetail ? 99 : Number(id))] }
        });
      const offset = Number(url.searchParams.get('offset') || 0),
        limit = Number(url.searchParams.get('limit') || 10);
      return route.fulfill({
        json: { totalFilteredRecords: rows.length, pageItems: rows.slice(offset, offset + limit) }
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
    else if (path.endsWith('/loans')) data = { totalFilteredRecords: pendingLoans.length, pageItems: pendingLoans };
    else if (path.endsWith('/savingsaccounts'))
      data = { totalFilteredRecords: pendingSavings.length, pageItems: pendingSavings };
    else if (/\/(clients|prospects)$/.test(path)) data = { totalFilteredRecords: 0, pageItems: [] };
    return route.fulfill({ json: data });
  });
});

async function open(page: Page) {
  await page.goto('/#/dashboard');
  await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByRole('button', { name: 'Enrollment Status', exact: true }).click();
}

test('preserves Dashboard and Commercial tabs with lazy onboarding loading', async ({ page }) => {
  await page.goto('/#/dashboard');
  await expect(page.getByRole('tab', { name: 'Dashboard', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(queries).toHaveLength(0);
  await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
  await expect(page.locator('mifosx-onboarding-tasks')).toBeVisible();
  expect(queries).toHaveLength(0);
  await panel(page).getByRole('button', { name: 'Enrollment Status', exact: true }).click();
  await expect(panel(page).locator('.matrix-card tbody tr')).toHaveCount(5);
  expect(queries[0].searchParams.get('limit')).toBe('10');
  await page.getByRole('tab', { name: 'Commercial panel', exact: true }).click();
  await expect(page.locator('mifosx-commercial-panel')).toBeVisible();
  await page.getByRole('tab', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('mifosx-analytics-dashboard')).toBeVisible();
});

test('renders six stages and one scoped count from the audited contract', async ({ page }) => {
  await open(page);
  await expect(panel(page).locator('.stage-number')).toHaveText([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6'
  ]);
  await expect(panel(page).locator('thead th')).toHaveCount(8);
  await expect(panel(page).locator('.summary-card strong')).toHaveText(['5']);
  await expect(panel(page).locator('.summary-card')).toContainText('Filtered cases on this page');
  await expect(panel(page).locator('.scope-note')).toContainText('include active clients');
  await expect(panel(page).locator('.scope-bar')).toContainText('Authorized client cases: 5');
  await expect(panel(page).locator('.business-rule')).toContainText(
    'No prospect may go unattended for more than 10 days.'
  );
  await expect(panel(page).locator('.summary-card')).toHaveCount(1);
});

test('keeps independent KYC and biometric evidence without fabricating a PLD block or alert', async ({ page }) => {
  await open(page);
  const first = panel(page).locator('tbody tr').first();
  await expect(first.locator('.stage-marker').nth(0)).toHaveAccessibleName('KYC: Review required');
  await expect(first.locator('.stage-marker').nth(1)).toHaveAccessibleName('PLD screening: Unknown');
  await expect(first.locator('.stage-marker').nth(2)).toHaveAccessibleName('Biometric: Completed');
  await expect(panel(page).locator('.stage-marker.blocked')).toHaveCount(0);
  await expect(panel(page).locator('.summary-card')).toHaveCount(1);
  await expect(panel(page).locator('.traceability')).toContainText(
    'a block, failure or review requirement is not established'
  );
  await expect(panel(page).locator('.traceability')).not.toContainText('Selfie received');
});

test('leaves account level, card, internal control and aging unavailable despite activation', async ({ page }) => {
  await open(page);
  const active = panel(page).locator('tbody tr').nth(1);
  for (const index of [
    3,
    4,
    5
  ]) await expect(active.locator('.stage-marker').nth(index)).toHaveAccessibleName(/Unknown/);
  await expect(active).toContainText('Duration unavailable');
  await expect(active).not.toContainText('Issued');
  await expect(active).not.toContainText('No card');
  await expect(panel(page).getByRole('combobox', { name: 'Account level', exact: true })).toHaveCount(0);
  for (const name of [
    'On time · 1–5 days',
    'At risk · 6–10 days',
    'Overdue · more than 10 days',
    'BLOCKED'
  ]) await expect(panel(page).getByRole('button', { name, exact: true })).toHaveCount(0);
});

test('filters the loaded page and keeps cards, attention and selected evidence synchronized', async ({ page }) => {
  await open(page);
  await panel(page).getByRole('textbox', { name: 'Search this page by client name or ID' }).fill('client 04');
  await expect(panel(page).locator('tbody tr')).toHaveCount(1);
  await expect(panel(page).locator('.summary-card strong').first()).toHaveText('1');
  await expect(panel(page).locator('.traceability h3')).toContainText('Synthetic client 04');
  await expect(panel(page).locator('.attention-row')).toHaveCount(1);
  expect(queries.every((url) => !url.searchParams.has('q') && !url.searchParams.has('officeId'))).toBe(true);
  await panel(page).getByRole('combobox', { name: 'Branch', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic East', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(0);
  await expect(panel(page).locator('.attention-row')).toHaveCount(0);
  await expect(panel(page)).toContainText('No records match the selected filter');
});

test('shows known review and rejection attention without declaring unknown cases healthy', async ({ page }) => {
  await open(page);
  await expect(panel(page).locator('.attention-row strong')).toHaveText([
    'Synthetic client 01',
    'Synthetic client 04'
  ]);
  await expect(panel(page).locator('.attention')).toContainText(
    'PLD alerts and waiting-time priorities cannot be assessed'
  );
  await expect(panel(page).getByRole('button', { name: 'Escalate', exact: true })).toHaveCount(0);
});

test('loads bounded pages and recovers after the last page is removed', async ({ page }) => {
  rows = Array.from({ length: 21 }, (_, i) => synthetic(i + 1));
  await open(page);
  await panel(page).getByRole('button', { name: 'Next page' }).click();
  await expect(panel(page).locator('.client-button').first()).toContainText('11');
  await panel(page).getByRole('button', { name: 'Next page' }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(1);
  rows = rows.slice(0, 19);
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(9);
  expect(
    queries
      .filter((url) => !url.searchParams.has('clientId'))
      .slice(-2)
      .map((url) => url.searchParams.get('offset'))
  ).toEqual([
    '20',
    '10'
  ]);
  await expect(panel(page).locator('.scope-bar')).toContainText('Authorized client cases: 19');
});

test('allows keyboard selection and only links the correct existing client workflows', async ({ page }) => {
  await open(page);
  const button = panel(page).locator('.client-button').nth(1);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(panel(page).locator('.traceability h3')).toContainText('Synthetic client 02');
  await expect(panel(page).getByRole('link', { name: 'Enrollment Status', exact: true })).toHaveAttribute(
    'href',
    /clients\/2\/enrollment-status/
  );
  await expect(panel(page).getByRole('link', { name: 'Open client notes', exact: true })).toHaveAttribute(
    'href',
    /clients\/2\/notes/
  );
  await expect(panel(page).getByRole('button', { name: 'Review PLD alert', exact: true })).toHaveCount(0);
  await expect(panel(page).getByRole('button', { name: 'Notify executive', exact: true })).toHaveCount(0);
  expect(writes).toEqual([]);
});

test('rejects mismatched detail identities without showing another client', async ({ page }) => {
  wrongDetail = true;
  await open(page);
  await expect(panel(page).locator('.traceability').getByRole('alert')).toBeVisible();
  await expect(panel(page).locator('.traceability')).not.toContainText('Synthetic client 99');
  await expect(panel(page).locator('.actions a')).toHaveCount(0);
});

test('shows operational tasks immediately with group routes and nullable names', async ({ page }, testInfo) => {
  pendingLoans = [
    {
      id: 11,
      clientId: null,
      clientName: null,
      group: { id: 3, name: 'Synthetic loan group' },
      accountNo: 'L-11',
      officeName: 'Central'
    }
  ];
  pendingSavings = [
    {
      id: 12,
      clientId: null,
      clientName: null,
      groupId: 4,
      groupName: 'Synthetic savings group',
      accountNo: 'S-12',
      officeName: 'Central'
    }
  ];
  await page.goto('/#/dashboard');
  await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
  const tasks = page.locator('mifosx-onboarding-tasks');
  await expect(tasks).toBeVisible();
  await expect(tasks.locator('tbody tr')).toHaveCount(2);
  await expect(tasks.getByRole('link', { name: 'View', exact: true }).first()).toHaveAttribute(
    'href',
    /groups\/3\/loans-accounts\/11/
  );
  await expect(tasks.getByRole('link', { name: 'View', exact: true }).last()).toHaveAttribute(
    'href',
    /groups\/4\/savings-accounts\/12/
  );
  await tasks.getByRole('textbox', { name: 'Filter by name', exact: true }).fill('S-12');
  await expect(tasks.locator('tbody tr')).toHaveCount(1);
  expect(queries).toHaveLength(0);
  expect(writes).toEqual([]);
  await tasks.screenshot({ path: testInfo.outputPath('tasks.png') });
});

test('handles empty results and contradictory success separately', async ({ page }) => {
  rows = [];
  await open(page);
  await expect(panel(page).locator('.summary-card strong')).toHaveText(['0']);
  await expect(panel(page)).toContainText('No Enrollment Information');
  contradictory = true;
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(panel(page).getByRole('alert')).toBeVisible();
  await expect(panel(page).locator('.summary-card strong').first()).toHaveText('—');
});

test('clears stale data on error and recovers through Retry', async ({ page }) => {
  await open(page);
  await expect(panel(page).locator('tbody tr')).toHaveCount(5);
  failure = 503;
  await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(panel(page).getByRole('alert')).toBeVisible();
  await expect(panel(page).locator('.traceability')).toHaveCount(0);
  failure = 0;
  await panel(page).getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(panel(page).locator('tbody tr')).toHaveCount(5);
});

test('rejects a malformed response', async ({ page }) => {
  malformed = true;
  await open(page);
  await expect(panel(page).getByRole('alert')).toBeVisible();
});
test('shows a permission-denied state from the server', async ({ page }) => {
  failure = 403;
  await open(page);
  await expect(panel(page).getByRole('alert')).toContainText('permission');
});

for (const width of [
  390,
  768,
  1280,
  1920
])
  for (const dark of [
    false,
    true
  ]) {
    test(`contains ${width}px layout in ${dark ? 'dark' : 'light'} theme`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 390 ? 1080 : 2400 });
      await page.addInitScript((dark) => localStorage.setItem('mifosXThemeDarkEnabled', JSON.stringify(dark)), dark);
      await open(page);
      await expect(panel(page).locator('.scope-bar')).toContainText('Loaded: 5');
      await expect(page.locator('body')).toHaveClass(new RegExp(`\\b${dark ? 'dark-theme' : 'light-theme'}\\b`));
      await expect(page.locator('body')).not.toHaveClass(new RegExp(`\\b${dark ? 'light-theme' : 'dark-theme'}\\b`));
      if (width === 390) {
        await expect(panel(page).locator('.table-scroll')).toBeHidden();
        await expect(panel(page).locator('.mobile-client')).toHaveCount(5);
        await expect(panel(page).locator('.mobile-client').first().locator('li')).toHaveCount(6);
      } else {
        await expect(panel(page).locator('.table-scroll')).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await panel(page).evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(panel(page).locator('.traceability .status-summary')).toBeVisible();
      const colors = await panel(page)
        .locator('.status-action')
        .evaluate((element) => ({
          background: getComputedStyle(element).backgroundColor,
          foreground: getComputedStyle(element.querySelector('.mdc-button__label') ?? element).color
        }));
      const luminance = (color: string) => {
        const channels = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((value) => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      const foreground = luminance(colors.foreground),
        background = luminance(colors.background);
      expect(
        (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
      ).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({ path: testInfo.outputPath('after.png'), fullPage: true });
      await panel(page)
        .locator('.traceability')
        .screenshot({ path: testInfo.outputPath('details.png') });
    });
  }

test.describe('restricted permissions', () => {
  test.use({ enrollmentPermissions: ['READ_CLIENT'] });
  test('does not query the enrollment feed without both read permissions', async ({ page }) => {
    await open(page);
    await expect(panel(page)).toContainText('permission');
    expect(queries).toHaveLength(0);
  });
});

test.describe('read-only permissions', () => {
  test.use({ enrollmentPermissions: ['ALL_FUNCTIONS_READ'] });
  test('does not offer client-note writes with an all-functions read grant', async ({ page }) => {
    await open(page);
    await expect(panel(page).locator('tbody tr')).toHaveCount(5);
    await expect(panel(page).getByRole('link', { name: 'Open client notes', exact: true })).toHaveCount(0);
  });
});

test('handles a missing plugin endpoint inline without a global alert', async ({ page }) => {
  failure = 404;
  await open(page);
  await expect(panel(page).getByRole('alert')).toContainText('Enrollment consultation is unavailable');
  await expect(page.locator('mifosx-onboarding-tasks')).toBeVisible();
  await expect(page.locator('.mat-mdc-snack-bar-container')).toHaveCount(0);
});

test.describe('ordinary Fineract deployment', () => {
  test.use({ enrollmentEnabled: false });
  test('keeps the task view and never queries or offers the plugin consultation', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
    await expect(page.locator('mifosx-onboarding-tasks')).toBeVisible();
    await expect(panel(page).locator('.consultation-panel')).toHaveCount(0);
    expect(queries).toHaveLength(0);
  });
});
