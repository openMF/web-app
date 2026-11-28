import { test as base, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const test = base.extend<{ operationsPermissions: string[] }>({ operationsPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });
let writes: string[];
let requests: URL[];
let failApproval: boolean;
let malformed: boolean;
const evidence = '../WEB-1481-evidence';
const baseline = !!process.env.WEB1481_BASELINE;
const panel = (page: Page) => page.locator('mifosx-operations-dashboard');
const approvals = [
  19,
  14,
  6,
  1
].map((age, index) => ({
  loanId: index + 1,
  clientId: 101 + index,
  accountNo: `S-${index + 1}`,
  clientName: `Synthetic Loan ${index + 1}`,
  status: { id: 100 },
  submittedOnDate: `2026-11-${String(27 - age).padStart(2, '0')}`
}));

test.beforeEach(async ({ page, operationsPermissions }) => {
  writes = [];
  requests = [];
  failApproval = false;
  malformed = false;
  // Startup sets the business date from the browser clock before the server date arrives.
  // Keep both on the fixture date so tests do not depend on the day they run.
  await page.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1481,
        staffId: 7,
        username: 'Synthetic reviewer',
        officeId: 1,
        officeName: 'Synthetic Central',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-27');
  }, operationsPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.env = { productionModeEnableRBAC: true };' })
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    if (request.method() !== 'GET') {
      writes.push(`${request.method()} ${path}`);
      return route.fulfill({ status: 403, json: { errors: [] } });
    }
    requests.push(url);
    if (path.endsWith('/v2/prospects')) {
      const pageItems = [
        {
          prospectId: 1,
          clientId: 201,
          displayName: 'Synthetic Prospect One',
          externalRef: 'P-1',
          registrationStatus: 'PENDING',
          createdAt: '2020-01-01',
          currentStage: 'COMMERCIAL_REGISTRATION'
        },
        {
          prospectId: 2,
          displayName: 'Synthetic Prospect Two',
          externalRef: 'P-2',
          registrationStatus: 'IN_PROGRESS',
          submittedAt: '2020-01-01'
        },
        { prospectId: 3, displayName: 'Synthetic Completed', registrationStatus: 'COMPLETED' }
      ];
      return route.fulfill({ json: { pageItems, totalFilteredRecords: 3 } });
    }
    if (path.endsWith('/v2/onboarding/cases'))
      return route.fulfill({
        json: {
          pageItems: [
            {
              clientId: 10,
              clientName: 'Synthetic Activation',
              enrollmentStages: [{ name: 'ACTIVATION', status: 'PENDING', startedAt: null }]
            },
            {
              clientId: 11,
              clientName: 'Synthetic Active Client',
              enrollmentStages: [{ name: 'ACTIVATION', status: 'COMPLETED' }]
            }
          ],
          totalFilteredRecords: 2
        }
      });
    if (path.endsWith('/v2/credit-applications')) {
      if (url.searchParams.get('status') === '100') {
        if (failApproval) return route.fulfill({ status: 503, json: { errors: [] } });
        if (malformed) return route.fulfill({ json: { pageItems: [], totalFilteredRecords: 997 } });
        if (Number(url.searchParams.get('offset')) > 0)
          return route.fulfill({ json: { pageItems: [], totalFilteredRecords: 25 } });
        return route.fulfill({ json: { pageItems: approvals, totalFilteredRecords: 997 } });
      }
      return route.fulfill({
        json: {
          pageItems: [
            {
              loanId: 5,
              clientId: 105,
              clientName: 'Synthetic Disbursement',
              accountNo: 'S-5',
              status: { id: 200 },
              submittedOnDate: '2020-01-01'
            }
          ],
          totalFilteredRecords: 1
        }
      });
    }
    if (path.endsWith('/loans/99'))
      return route.fulfill({
        json: {
          id: 99,
          clientId: 199,
          clientName: 'Synthetic Exact Loan',
          accountNo: 'S-99',
          status: { id: 100 },
          timeline: { submittedOnDate: '2026-11-01' }
        }
      });
    if (path.endsWith('/audits')) {
      const resourceId = Number(url.searchParams.get('resourceId') || 1);
      return route.fulfill({
        json: {
          pageItems: [
            {
              id: resourceId,
              entityName: 'LOAN',
              resourceId,
              madeOnDate: 1795700000000,
              maker: 'Synthetic auditor',
              actionName: 'CREATE',
              processingResult: 'Processed'
            }
          ],
          totalFilteredRecords: 1
        }
      });
    }
    let data: unknown = [];
    if (path.endsWith('/offices')) data = [{ id: 1, name: 'Synthetic Central' }];
    else if (path.includes('/configurations')) data = { value: 0, enabled: true };
    else if (path.includes('/businessdate')) data = { date: [
          2026,
          11,
          27
        ] };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (path.endsWith('/loans'))
      data = {
        pageItems: approvals.map((row) => ({
          ...row,
          id: row.loanId,
          timeline: { submittedOnDate: row.submittedOnDate },
          officeName: 'Synthetic Central'
        })),
        totalFilteredRecords: 4
      };
    else if (/\/(clients|savingsaccounts)$/.test(path)) data = { pageItems: [], totalFilteredRecords: 0 };
    return route.fulfill({ json: data });
  });
});
async function open(page: Page, query = '') {
  await page.goto('/#/dashboard' + query);
  await expect(panel(page).getByRole('heading', { name: 'Operations dashboard', exact: true })).toBeVisible();
  await expect(panel(page).locator('tbody tr')).toHaveCount(8);
}

test('baseline reference', async ({ page }) => {
  test.skip(!baseline, 'Separate unmodified baseline checkout only');
  await mkdir(evidence, { recursive: true });
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto('/#/dashboard');
  await expect(page.locator('mifosx-analytics-dashboard')).toBeVisible();
  await page.screenshot({ path: `${evidence}/before-1920-light.png`, fullPage: true });
});

test.describe('Operations', () => {
  test.skip(baseline, 'Operations is absent on baseline');
  test('renders three honest summary cards and no automatic escalation claim', async ({ page }) => {
    await open(page);
    await expect(panel(page).locator('.summary-card')).toHaveCount(3);
    await expect(panel(page).locator('.summary-card').nth(1).locator('.metrics strong')).toHaveText([
      '—',
      '997',
      '—'
    ]);
    await expect(panel(page).locator('.summary-card').nth(2).locator('.metrics strong')).toHaveText([
      '—',
      '—',
      '—'
    ]);
    await expect(panel(page).locator('.rule-banner')).toContainText('automatic escalation are unavailable');
    await expect(panel(page)).not.toContainText('Automatically escalated');
    await expect(panel(page)).not.toContainText('Synthetic Completed');
    await expect(panel(page)).not.toContainText('Synthetic Active Client');
    expect(writes).toEqual([]);
  });
  test('selects a task using the keyboard and exposes radio labels', async ({ page }) => {
    await open(page);
    await panel(page).getByRole('radio', { name: 'Select task Synthetic Loan 2' }).focus();
    await page.keyboard.press('Space');
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Loan 2');
    await expect(panel(page).getByRole('radio', { name: 'Select task Synthetic Loan 2' })).toBeChecked();
    await panel(page).getByRole('button', { name: 'Prospects', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(panel(page).locator('tbody tr')).toHaveCount(2);
    expect(writes).toEqual([]);
  });
  test('sorts oldest first and keeps unknown registration/disbursement age separate', async ({ page }) => {
    await open(page);
    await expect(panel(page).locator('tbody tr').first()).toContainText('19 days');
    await expect(panel(page).locator('tbody .age-chip.overdue')).toHaveCount(2);
    await expect(panel(page).locator('tbody .age-chip.unknown')).toHaveCount(4);
    await panel(page)
      .getByRole('button', { name: /1–5 days 1/ })
      .click();
    await expect(panel(page).locator('tbody tr')).toHaveCount(1);
    await expect(panel(page).locator('tbody')).toContainText('Synthetic Loan 4');
  });
  test('filters by card, preserves age and clears hidden detail selection', async ({ page }) => {
    await open(page);
    await panel(page)
      .getByRole('button', { name: /Over 10 days 2/ })
      .click();
    await panel(page).getByRole('button', { name: 'Prospects', exact: true }).click();
    await expect(panel(page).locator('tbody tr')).toHaveCount(0);
    await expect(panel(page).getByRole('button', { name: /Over 10 days 0/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel(page).locator('.detail-card')).toContainText('Select a pending task');
  });
  test('searches loaded tasks and shows ownership and unsupported controls accurately', async ({ page }) => {
    await open(page);
    await panel(page).getByLabel('Search loaded tasks by customer or reference').fill('P-1');
    await expect(panel(page).locator('tbody tr')).toHaveCount(1);
    await panel(page).locator('.task-name').click();
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Prospect One');
    await expect(panel(page).locator('.detail-card')).toContainText('Recorded history is unavailable');
    await expect(panel(page).getByRole('switch', { name: 'Only mine' })).toBeDisabled();
    await expect(panel(page).getByRole('button', { name: 'Assign to me', exact: true })).toBeDisabled();
    await expect(panel(page).getByRole('button', { name: 'Escalate', exact: true })).toBeDisabled();
    await expect(panel(page).locator('.detail-card')).not.toContainText('Unassigned');
    expect(writes).toEqual([]);
  });
  test('shows real loan history and scoped activity with actor and result', async ({ page }) => {
    await open(page);
    await expect(panel(page).locator('.detail-card .history')).toContainText('Synthetic auditor');
    await expect(panel(page).locator('.activity-card')).toContainText('Processed');
    await panel(page).getByRole('radio', { name: 'Select task Synthetic Loan 2' }).check();
    await expect
      .poll(() =>
        requests
          .filter((url) => url.pathname.endsWith('/audits'))
          .at(-1)
          ?.searchParams.get('resourceId')
      )
      .toBe('2');
    expect(writes).toEqual([]);
  });
  test('preserves the other boards and loads analytics only when requested', async ({ page }) => {
    await open(page);
    expect(requests.some((url) => url.pathname.includes('/runreports/'))).toBe(false);
    const queueCalls = requests.filter((url) => url.pathname.endsWith('/v2/credit-applications')).length;
    await page.getByRole('tab', { name: 'Commercial panel', exact: true }).click();
    await expect(page.locator('mifosx-commercial-panel')).toBeVisible();
    await page.getByRole('link', { name: 'Open dashboard task' }).click();
    await expect(page.getByRole('tab', { name: 'Dashboard', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Prospect One');
    expect(requests.filter((url) => url.pathname.endsWith('/v2/credit-applications')).length).toBe(queueCalls);
    await page.getByRole('tab', { name: 'Onboarding Board', exact: true }).click();
    await expect(page.locator('mifosx-onboarding-board')).toBeVisible();
    await page.locator('mifosx-onboarding-board').getByRole('link', { name: 'Open dashboard task' }).first().click();
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Loan 1');
    await page.getByRole('tab', { name: 'Analytics', exact: true }).click();
    await expect(page.locator('mifosx-analytics-dashboard')).toBeVisible();
  });
  test('opens a verified loan task outside the queue page using one exact read', async ({ page }) => {
    await page.goto('/#/dashboard?operationsTask=loan:99:approval');
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Exact Loan');
    await expect(panel(page).locator('tbody tr')).toHaveCount(9);
    expect(requests.filter((url) => url.pathname.endsWith('/loans/99'))).toHaveLength(1);
    expect(writes).toEqual([]);
  });
  test('keeps a deep-linked task when the server business date differs from the browser date', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-03T12:00:00Z'));
    await page.goto('/#/dashboard?operationsTask=loan:99:approval');
    await expect(panel(page).locator('.detail-card')).toContainText('Synthetic Exact Loan');
    // Ages follow the server business date (Nov 27), not the browser date (Dec 3).
    await expect(panel(page).locator('tbody tr').filter({ hasText: 'Synthetic Exact Loan' })).toContainText('26 days');
    await expect(panel(page).locator('tbody tr').filter({ hasText: 'Synthetic Loan 1' })).toContainText('19 days');
    expect(writes).toEqual([]);
  });
  test('handles missing deep links without showing another customer', async ({ page }) => {
    await open(page, '?operationsTask=prospect:99');
    await expect(panel(page).locator('.detail-card')).toContainText('not available in the authorized loaded pages');
    await expect(panel(page).locator('.detail-card')).not.toContainText('Synthetic Loan');
  });
  test('isolates source errors and recovers on explicit refresh', async ({ page }) => {
    failApproval = true;
    await page.goto('/#/dashboard');
    await expect(panel(page).getByRole('alert')).toContainText('Some queues could not be loaded');
    await expect(panel(page).locator('tbody tr')).toHaveCount(4);
    await expect(panel(page).locator('.summary-card').nth(1).locator('.metrics strong')).toHaveText([
      '—',
      '—',
      '—'
    ]);
    failApproval = false;
    await panel(page).getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(panel(page).locator('tbody tr')).toHaveCount(8);
  });
  test('treats contradictory empty pages as unavailable instead of zero', async ({ page }) => {
    malformed = true;
    await page.goto('/#/dashboard');
    await expect(panel(page).getByRole('alert')).toBeVisible();
    await expect(panel(page).locator('.summary-card').nth(1).locator('.metrics strong')).toHaveText([
      '—',
      '—',
      '—'
    ]);
  });
  test('recovers when refresh removes the final source page', async ({ page }) => {
    await open(page);
    await panel(page).getByRole('button', { name: 'Next Loan approvals', exact: true }).click();
    await expect(panel(page).locator('tbody tr')).toHaveCount(8);
    await expect(panel(page).locator('.queue-page').filter({ hasText: 'Loan approvals' })).toContainText('Page 1');
    expect(
      requests
        .filter((url) => url.pathname.endsWith('/v2/credit-applications') && url.searchParams.get('status') === '100')
        .map((url) => url.searchParams.get('offset'))
    ).toEqual([
      '0',
      '25',
      '0'
    ]);
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
      test(`responsive ${width}px ${dark ? 'dark' : 'light'}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1400 });
        await page.addInitScript((dark) => localStorage.setItem('mifosXThemeDarkEnabled', JSON.stringify(dark)), dark);
        await open(page);
        await expect(page.locator('body')).toHaveClass(new RegExp(`\\b${dark ? 'dark-theme' : 'light-theme'}\\b`));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
        expect(await panel(page).evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
        await mkdir(evidence, { recursive: true });
        await page.screenshot({ path: `${evidence}/after-${width}-${dark ? 'dark' : 'light'}.png`, fullPage: true });
        await panel(page).locator('.task-toolbar').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${evidence}/after-${width}-${dark ? 'dark' : 'light'}-tasks.png`,
          fullPage: true
        });
        await panel(page).locator('.activity-card').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${evidence}/after-${width}-${dark ? 'dark' : 'light'}-activity.png`,
          fullPage: true
        });
        expect(writes).toEqual([]);
      });
    }
});

test.describe('Permission restrictions', () => {
  test.skip(baseline, 'Operations absent on baseline');
  test.use({ operationsPermissions: [] });
  test('does not request unauthorized queues, history or customer files', async ({ page }) => {
    await page.goto('/#/dashboard');
    await expect(panel(page)).toContainText('You do not have permission');
    expect(
      requests.some((url) =>
        /\/(v2\/prospects|v2\/onboarding\/cases|v2\/credit-applications|audits)$/.test(url.pathname)
      )
    ).toBe(false);
    await expect(panel(page).getByRole('link', { name: 'Open file' })).toHaveCount(0);
    expect(writes).toEqual([]);
  });
});
