/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base, expect, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const test = base.extend<{ approvalPermissions: string[] }>({ approvalPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });
let rows: any[];
let batches: any[][];
let reads: URL[];
let mode: 'success' | 'partial' | 'uncertain' | 'malformed';
let totalOverride: number | undefined;
let failList: boolean;
let holdBatch: Promise<void> | undefined;
const evidence = '../WEB-1474-evidence';
function synthetic(id: number) {
  return {
    id,
    clientId: id === 3 ? 1 : id,
    clientName: id < 4 ? 'Synthetic Élise Hernández' : 'Synthetic Client ' + id,
    clientOfficeId: id > 20 ? 2 : 1,
    accountNo: String(id).padStart(9, '0'),
    loanProductId: id === 5 ? 2 : 1,
    loanProductName: id === 5 ? 'Synthetic PyME PFAE' : 'Synthetic Préstamo Ágil',
    principal: id === 1 ? '1000000.10' : id === 3 ? '0.10' : id === 4 ? '0.20' : '100.00',
    currency: { code: id === 2 ? 'USD' : 'MXN', decimalPlaces: 2 },
    loanPurposeName: id % 3 === 0 ? 'Equipment' : null,
    status: { id: 100, pendingApproval: true },
    multiDisburseLoan: false,
    loanType: { id: 1 },
    timeline: { submittedOnDate: [
        2026,
        11,
        10
      ], expectedDisbursementDate: [
        2026,
        11,
        20
      ] }
  };
}
test.beforeEach(async ({ page, approvalPermissions }) => {
  rows = Array.from({ length: 27 }, (_, i) => synthetic(i + 1));
  batches = [];
  reads = [];
  mode = 'success';
  totalOverride = undefined;
  failList = false;
  holdBatch = undefined;
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1474,
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
  // Every backend request and financial command is intercepted; no live banking environment is used.
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    if (path.endsWith('/loans') && request.method() === 'GET') {
      reads.push(url);
      if (failList) return route.fulfill({ status: 503, json: { errors: [] } });
      const filtered = rows.filter((row) => row.status.pendingApproval),
        offset = Number(url.searchParams.get('offset') || 0),
        limit = Number(url.searchParams.get('limit') || 1000);
      return route.fulfill({
        json: {
          totalFilteredRecords: totalOverride ?? filtered.length,
          pageItems: totalOverride
            ? Array.from({ length: Math.min(limit, totalOverride - offset) }, (_, i) => synthetic(offset + i + 1))
            : filtered.slice(offset, offset + limit)
        }
      });
    }
    if (/\/loans\/\d+\/template$/.test(path)) {
      const row = rows.find((item) => item.id === Number(path.split('/').at(-2)));
      return route.fulfill({ json: { approvalAmount: row.principal, expectedDisbursementDate: [
            2026,
            11,
            20
          ] } });
    }
    if (/\/loans\/\d+$/.test(path) && request.method() === 'GET')
      return route.fulfill({ json: rows.find((item) => item.id === Number(path.split('/').pop())) });
    if (path.endsWith('/batches') && request.method() === 'POST') {
      const batch = request.postDataJSON();
      batches.push(batch);
      if (holdBatch) await holdBatch;
      if (mode === 'uncertain') return route.abort('failed');
      if (mode === 'malformed') return route.fulfill({ json: { invalid: true } });
      const responses = batch.flatMap((item: any) => {
        const id = Number(/loans\/(\d+)/.exec(item.relativeUrl)![1]);
        if (mode === 'partial' && id === 3) return [];
        if (mode === 'partial' && id === 2) return [{ requestId: item.requestId, statusCode: '400', body: '{}' }];
        if (mode === 'partial' && id === 4)
          return [{ requestId: item.requestId, statusCode: 200, body: '{"commandId":44}' }];
        rows.find((row) => row.id === id).status = { id: 200, pendingApproval: false, waitingForDisbursal: true };
        return [
          { requestId: item.requestId, statusCode: id % 2 ? '200' : 200, body: JSON.stringify({ resourceId: id }) }
        ];
      });
      return route.fulfill({ json: responses.reverse() });
    }
    if (request.method() !== 'GET') return route.fulfill({ status: 403, json: { errors: [] } });
    let data: any = [];
    if (path.endsWith('/offices'))
      data = [
        { id: 1, name: 'Synthetic Central' },
        { id: 2, name: 'Synthetic East' }
      ];
    else if (path.includes('/configurations')) data = { value: 0, enabled: true };
    else if (path.includes('/businessdate')) data = { date: [
          2026,
          11,
          18
        ] };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (path.endsWith('/clients') || path.endsWith('/v2/prospects'))
      data = { totalFilteredRecords: 0, pageItems: [] };
    return route.fulfill({ json: data });
  });
});
async function open(page: Page) {
  await page.goto('/#/checker-inbox-and-tasks/loan-approval');
  await expect(page.locator('mifosx-loan-approval tbody tr')).toHaveCount(10);
}
async function select(page: Page, ids = [
    1,
    2
  ]) {
  for (const id of ids)
    await page.getByRole('checkbox', { name: `Select loan ${String(id).padStart(9, '0')} for`, exact: false }).check();
}
async function review(page: Page) {
  await page.getByRole('button', { name: 'Review selection', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Approve \d+ loans?$/ })).toBeEnabled();
}
async function confirm(page: Page) {
  await page.getByRole('button', { name: /^Approve \d+ loans?$/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
}

test('four dynamic cards, exact currencies, exposure and accessible loan navigation', async ({ page }) => {
  await open(page);
  const app = page.locator('mifosx-loan-approval');
  await expect(app.locator('.summary')).toHaveCount(4);
  await expect(app.locator('.summary').nth(0)).toContainText('27');
  await expect(app.locator('.summary').nth(1)).toContainText('1,000,600.40 MXN');
  await expect(app.locator('.summary').nth(1)).toContainText('100.00 USD');
  await expect(app.locator('.summary').nth(2)).toContainText('1');
  await expect(app.locator('.summary').nth(3)).toContainText('7');
  await expect(app.locator('.exposure').first()).toContainText('2 pending loans');
  await expect(app.locator('tbody tr').nth(1).locator('.exposure')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View loan 000000001', exact: true })).toHaveAttribute(
    'href',
    /clients\/1\/loans-accounts\/1/
  );
  await expect(page.getByRole('link', { name: 'Approve loan 000000001', exact: true })).toHaveAttribute(
    'href',
    /actions\/Approve/
  );
  await expect(page.getByRole('link', { name: 'Approve loan 000000001', exact: true })).toHaveAttribute(
    'href',
    /productType=loans/
  );
  expect(batches).toHaveLength(0);
});
test('searches names, accounts, products and synchronizes filters and selection', async ({ page }) => {
  await open(page);
  const search = page.getByRole('textbox', { name: 'Search by client, loan number or product' });
  await select(page, [1]);
  await search.fill('000000005');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('.bulk-toolbar')).toHaveCount(0);
  await search.fill('pfae');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await search.fill('ÉLISE');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('combobox', { name: 'Loan Purpose', exact: true }).click();
  await page.getByRole('option', { name: 'Not specified', exact: true }).click();
  await expect(page.locator('.summary').nth(3)).toContainText('10');
  await page.getByRole('button', { name: 'Amount', exact: true }).click();
  await page.getByRole('textbox', { name: 'Minimum amount', exact: true }).fill('1');
  await expect(page.getByRole('alert')).toContainText('Choose a currency');
  await page.getByRole('combobox', { name: 'Currency', exact: true }).click();
  await page.getByRole('option', { name: 'MXN', exact: true }).click();
  await page.getByRole('textbox', { name: 'Minimum amount', exact: true }).fill('1000000');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  expect(batches).toHaveLength(0);
});
test('office and product filters use real options and reset the visible scope', async ({ page }) => {
  await open(page);
  await page.getByRole('combobox', { name: 'Office', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic East', exact: true }).click();
  await expect(page.locator('mifosx-loan-approval tbody tr')).toHaveCount(7);
  await expect(page.locator('.office-heading')).toContainText('Synthetic East');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('combobox', { name: 'Product', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic PyME PFAE', exact: true }).click();
  await expect(page.locator('mifosx-loan-approval tbody tr')).toHaveCount(1);
  expect(batches).toHaveLength(0);
});
test('unsupported product constraints require the existing individual form', async ({ page }) => {
  rows[1].multiDisburseLoan = true;
  await open(page);
  await select(page);
  await review(page);
  await expect(page.locator('.notice')).toContainText('cannot be verified for bulk approval');
  await expect(page.locator('.notice a')).toHaveAttribute('href', /actions\/Approve/);
  await page.getByRole('button', { name: 'Approve 1 loan', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('000000002');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(batches).toHaveLength(0);
});
test('page and office selection, cross-page count, collapse and pagination', async ({ page }) => {
  await open(page);
  await page.getByRole('checkbox', { name: 'Select eligible loans on this office page' }).check();
  await expect(page.locator('.selection-summary')).toContainText('10 loans selected');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.locator('.pagination')).toContainText('Page 2 of 3');
  await expect(page.locator('.selection-summary')).toContainText('10 loans selected');
  await page.getByRole('button', { name: 'Select all 20 filtered loans in this office' }).click();
  await expect(page.locator('.selection-summary')).toContainText('20 loans selected');
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await expect(page.locator('.bulk-toolbar')).toHaveCount(0);
  await page.locator('.office-toggle').click();
  await expect(page.locator('.table-scroll')).toBeHidden();
  await page.locator('.office-toggle').click();
  await expect(page.locator('.table-scroll')).toBeVisible();
});
test('reviews dates and identities, cancels without writing and submits each command once after confirmation', async ({
  page
}) => {
  await open(page);
  await select(page);
  await review(page);
  await page.getByRole('button', { name: 'Approve 2 loans', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('000000001');
  await expect(dialog).toContainText('18 November 2026');
  await expect(dialog).toContainText('20 November 2026');
  expect(batches).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(batches).toHaveLength(0);
  await confirm(page);
  await expect(page.locator('.batch-results')).toContainText('Approved — verified in loan state');
  expect(batches).toHaveLength(1);
  expect(batches[0]).toHaveLength(2);
  for (const item of batches[0])
    expect(JSON.parse(item.body)).toMatchObject({
      approvedOnDate: '18 November 2026',
      expectedDisbursementDate: '20 November 2026'
    });
  for (const item of batches[0]) expect(JSON.parse(item.body)).not.toHaveProperty('approvedLoanAmount');
  await expect(page.locator('.summary').first()).toContainText('25');
});
test('changed loan principal after opening confirmation aborts the batch and requires new confirmation', async ({
  page
}) => {
  await open(page);
  await select(page, [1]);
  await review(page);
  await page.getByRole('button', { name: 'Approve 1 loan', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('1,000,000.10 MXN');
  rows[0].principal = '1200000.10';
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await expect(page.locator('mifosx-loan-approval').getByRole('alert')).toContainText('No approval was submitted');
  await expect(page.locator('mifosx-loan-approval tbody tr').first()).toContainText('1,200,000.10 MXN');
  await expect(page.locator('.bulk-toolbar')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(batches).toHaveLength(0);
  await select(page, [1]);
  await review(page);
  await page.getByRole('button', { name: 'Approve 1 loan', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('1,200,000.10 MXN');
  expect(batches).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await expect(page.locator('.batch-results')).toContainText('Approved — verified in loan state');
  expect(batches).toHaveLength(1);
  expect(JSON.parse(batches[0][0].body)).not.toHaveProperty('approvedLoanAmount');
  expect(rows[0].principal).toBe('1200000.10');
});
test('invalid approval date prevents confirmation and all financial writes', async ({ page }) => {
  await open(page);
  await select(page);
  await review(page);
  await page.getByRole('textbox', { name: 'Approved On', exact: true }).fill('19 November 2026');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Approve 2 loans', exact: true })).toBeDisabled();
  expect(batches).toHaveLength(0);
});
test('partial item failures, missing outcomes and maker-checker commands remain distinct and locked', async ({
  page
}) => {
  mode = 'partial';
  await open(page);
  await select(
    page,
    [
      1,
      2,
      3,
      4
    ]
  );
  await review(page);
  await confirm(page);
  const results = page.locator('.batch-results');
  await expect(results).toContainText('Approved — verified in loan state');
  await expect(results).toContainText('Rejected — approval command failed');
  await expect(results).toContainText('Outcome unresolved');
  await expect(results).toContainText('Submitted for maker-checker review');
  expect(batches).toHaveLength(1);
  await expect(page.getByRole('checkbox', { name: /Select loan 000000003/ })).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: /Select loan 000000002/ })).toBeEnabled();
  await page.getByRole('link', { name: 'Checker Inbox', exact: true }).click();
  await page.getByRole('link', { name: 'Loan Approval', exact: false }).click();
  await expect(page.getByRole('checkbox', { name: /Select loan 000000003/ })).toBeDisabled();
  expect(batches).toHaveLength(1);
});
for (const failure of [
  'uncertain',
  'malformed'
] as const)
  test(`does not retry ${failure} writes`, async ({ page }) => {
    mode = failure;
    await open(page);
    await select(page, [1]);
    await review(page);
    await confirm(page);
    await expect(page.locator('.batch-results')).toContainText('Outcome unresolved');
    await expect(page.getByRole('checkbox', { name: /Select loan 000000001/ })).toBeDisabled();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: /Select loan 000000001/ })).toBeDisabled();
    expect(batches).toHaveLength(1);
  });
for (const width of [
  390,
  600
])
  test(`mobile page selection stays visible and the clipped header is skipped at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    const mobile = page
      .locator('.mobile-page-selection')
      .getByRole('checkbox', { name: 'Select eligible loans on this office page', exact: true });
    await expect(mobile).toBeVisible();
    await expect(page.locator('.desktop-page-selection')).toBeHidden();
    await mobile.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.selection-summary')).toContainText('10 loans selected');
    await page.keyboard.press('Space');
    await expect(page.locator('.bulk-toolbar')).toHaveCount(0);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox', { name: /Select loan 000000001/ })).toBeFocused();
    await page.setViewportSize({ width: 1280, height: 1000 });
    await expect(mobile).toBeHidden();
    await expect(page.locator('.desktop-page-selection')).toBeVisible();
    await page.locator('.desktop-page-selection').getByRole('checkbox').check();
    await expect(page.locator('.selection-summary')).toContainText('10 loans selected');
    expect(batches).toHaveLength(0);
  });
test('approval refresh switches a newly incomplete snapshot to the first server page', async ({ page }) => {
  await open(page);
  await select(page, [1]);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await review(page);
  totalOverride = 1101;
  await confirm(page);
  await expect(page.locator('.pagination')).toContainText('Page 1 of 111');
  await expect(page.locator('mifosx-loan-approval tbody tr')).toHaveCount(10);
  await expect(page.locator('.select-office')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.locator('.pagination')).toContainText('Page 2 of 111');
  expect(reads.at(-1)!.searchParams.get('limit')).toBe('10');
  expect(reads.at(-1)!.searchParams.get('offset')).toBe('10');
  expect(batches).toHaveLength(1);
});
test('review preserves a manually edited expected disbursement date', async ({ page }) => {
  await open(page);
  await select(page);
  await page.getByRole('textbox', { name: 'Expected disbursement on', exact: true }).fill('24 November 2026');
  await page.keyboard.press('Tab');
  await review(page);
  await expect(page.getByRole('textbox', { name: 'Expected disbursement on', exact: true })).toHaveValue(
    '24 November 2026'
  );
  await page.getByRole('button', { name: 'Approve 2 loans', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('24 November 2026');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(batches).toHaveLength(0);
});
test('locks submission and navigation while a confirmed batch is running', async ({ page }) => {
  let release!: () => void;
  holdBatch = new Promise<void>((resolve) => {
    release = resolve;
  });
  await open(page);
  await select(page);
  await review(page);
  await confirm(page);
  await expect(page.getByRole('button', { name: 'Approve 2 loans', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Client Approval', exact: true }).click();
  await expect(page).toHaveURL(/loan-approval/);
  release();
  await expect(page.locator('.batch-results')).toBeVisible();
  expect(batches).toHaveLength(1);
});
test('server pagination goes beyond 100 pages and labels local-only filters', async ({ page }) => {
  totalOverride = 12005;
  await open(page);
  await expect(page.getByText('Search, filters, office counts', { exact: false })).toBeVisible();
  await expect(page.locator('.select-office')).toHaveCount(0);
  await page.getByRole('button', { name: 'Last page', exact: true }).click();
  await expect(page.locator('.pagination')).toContainText('Page 1201 of 1201');
  expect(reads.at(-1)!.searchParams.get('offset')).toBe('12000');
});
test('renders a recoverable list error without stale amounts or writes', async ({ page }) => {
  failList = true;
  await page.goto('/#/checker-inbox-and-tasks/loan-approval');
  await expect(page.locator('mifosx-loan-approval').getByRole('alert')).toContainText('Unable to load');
  failList = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('mifosx-loan-approval tbody tr')).toHaveCount(10);
  expect(batches).toHaveLength(0);
});
test.describe('restricted permissions', () => {
  test.use({ approvalPermissions: [
      'READ_LOAN',
      'APPROVE_LOAN_CHECKER'
    ] });
  test('checker-only access cannot initiate approval', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('link', { name: /^Approve loan/ })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: /Select loan 000000001/ })).toBeDisabled();
    await page.goto('/#/clients/1/loans-accounts/1/actions/Approve?productType=loans');
    await expect(page).not.toHaveURL(/actions\/Approve/);
    expect(batches).toHaveLength(0);
  });
});
for (const width of [
  390,
  768,
  1280,
  1920
])
  test(`responsive blue workspace at ${width}px with light and dark evidence`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1920 ? 1358 : 1000 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const app = page.locator('mifosx-loan-approval');
    await expect(app.locator('.summary')).toHaveCount(4);
    await select(page, [4]);
    await expect(page.locator('.bulk-toolbar')).toBeVisible();
    const primary = await page
      .getByRole('button', { name: 'Review selection', exact: true })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const channels = primary.match(/\d+/g)!.map(Number);
    expect(channels[2]).toBeGreaterThan(channels[0]);
    expect(channels[1]).toBeGreaterThan(channels[0]);
    const lightSurface = await app
      .locator('.summary')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await mkdir(evidence, { recursive: true });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('*').forEach((el) => {
        if (el.scrollTop) el.scrollTop = 0;
      });
    });
    await page.screenshot({ path: `${evidence}/after-${width}-light.png`, fullPage: true });
    await page.evaluate(() => document.body.classList.add('dark-theme'));
    expect(
      await app
        .locator('.summary')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor)
    ).not.toBe(lightSurface);
    await page.screenshot({ path: `${evidence}/after-${width}-dark.png`, fullPage: true });
    if (width === 390) {
      await page.getByRole('link', { name: 'Approve loan 000000004', exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('link', { name: 'Approve loan 000000004', exact: true })).toBeVisible();
      await page.screenshot({ path: `${evidence}/after-mobile-actions-dark.png`, fullPage: true });
    }
    await page.getByRole('textbox', { name: 'Search by client, loan number or product' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Office', exact: true })).toBeFocused();
    const checkbox = page.getByRole('checkbox', { name: /Select loan 000000001/ });
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();
    expect(batches).toHaveLength(0);
  });
