/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base, expect, Page } from '@playwright/test';

const test = base.extend<{ creditsPermissions: string[] }>({ creditsPermissions: [
    ['ALL_FUNCTIONS'],
    { option: true }
  ] });

// Isolated synthetic HTTP contracts. All backend traffic, including commands, is intercepted.
let rows: any[];
let reads: URL[];
let writes: { path: string; command: string; payload: any }[];
let failRejection: boolean;
let summaryFailure: boolean;
let currencyDelay: Promise<void> | undefined;
let currencyFailures: number;
let commandDelay: Promise<void> | undefined;
const pending = {
  id: 100,
  code: 'loanStatusType.submitted.and.pending.approval',
  value: 'Submitted and pending approval'
};

test.beforeEach(async ({ page, creditsPermissions }) => {
  reads = [];
  writes = [];
  failRejection = false;
  summaryFailure = false;
  currencyDelay = undefined;
  currencyFailures = 0;
  commandDelay = undefined;
  rows = Array.from({ length: 52 }, (_, index) => ({
    loanId: index + 1,
    clientId: index === 0 ? 99 : 100 + index,
    accountNo: String(index + 1).padStart(9, '0'),
    clientName: index < 2 ? 'Synthetic Pending Client ' + index : 'Synthetic Credit Client ' + index,
    productId: 10,
    productName: 'Standard Loan',
    productType: 'loan',
    amount: '12345.50',
    currencyCode: 'USD',
    submittedOnDate: '2026-11-18',
    stateProvinceId: 7,
    municipality: 'Synthetic town',
    clientTypeId: 3,
    status: index < 8 ? pending : index < 47 ? { id: 300, value: 'Active' } : { id: 500, value: 'Rejected' }
  }));
  await page.addInitScript((permissions) => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions,
        roles: [],
        userId: 1471,
        username: 'Synthetic reviewer',
        officeId: 1,
        officeName: 'Synthetic office',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-22');
  }, creditsPermissions);
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.env = { productionModeEnableRBAC: true };' })
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith('/v2/credit-applications')) {
      reads.push(url);
      if (summaryFailure && url.searchParams.get('limit') === '1') {
        await route.fulfill({ status: 503, json: { errors: [] } });
        return;
      }
      let filtered = rows.filter(
        (row) => !url.searchParams.get('status') || String(row.status.id) === url.searchParams.get('status')
      );
      if (url.searchParams.get('productId') === '20') filtered = [];
      if (url.searchParams.has('clientId'))
        filtered = filtered.filter((row) => String(row.clientId) === url.searchParams.get('clientId'));
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 25);
      await route.fulfill({
        json: { totalFilteredRecords: filtered.length, pageItems: filtered.slice(offset, offset + limit) }
      });
      return;
    }
    if (request.method() === 'POST' && /\/(loans|working-capital-loans)\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      const command = url.searchParams.get('command')!;
      writes.push({ path: path.replace(/^.*\/api\/v\d+/, ''), command, payload: request.postDataJSON() });
      if (commandDelay) await commandDelay;
      if (failRejection && id === 2) {
        await route.fulfill({ status: 400, json: { errors: [] } });
        return;
      }
      rows.find((row) => row.loanId === id).status = {
        id: command === 'approve' ? 200 : 500,
        value: command === 'approve' ? 'Approved' : 'Rejected'
      };
      await route.fulfill({ json: { resourceId: id } });
      return;
    }
    let data: any = [];
    if (path.endsWith('/search')) {
      await route.fulfill({
        json: [
          { entityId: 99, entityName: 'Resolved Synthetic Client', entityType: 'CLIENT', entityAccountNo: '000099' }
        ]
      });
      return;
    }
    if (path.endsWith('/clients/template')) data = { clientTypeOptions: [{ id: 3, name: 'Business' }] };
    else if (path.endsWith('/client/addresses/template'))
      data = { stateProvinceIdOptions: [{ id: 7, name: 'Synthetic state' }] };
    else if (path.endsWith('/loanproducts/basic-details'))
      data = [
        { id: 10, name: 'Standard Loan', productType: 'loan' },
        { id: 20, name: 'Other Loan', productType: 'loan' }
      ];
    else if (path.endsWith('/currencies')) {
      if (currencyDelay) await currencyDelay;
      if (currencyFailures > 0) {
        currencyFailures--;
        await route.fulfill({ status: 503, json: { errors: [] } });
        return;
      }
      data = {
        selectedCurrencyOptions: [
          { code: 'USD', name: 'US Dollar', decimalPlaces: 2 },
          { code: 'JPY', name: 'Yen', decimalPlaces: 0 }
        ]
      };
    } else if (path.includes('/configurations')) data = { value: 0, enabled: path.includes('enable-business-date') };
    else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (path.endsWith('/loans') || path.endsWith('/clients') || path.endsWith('/v2/prospects'))
      data = { totalFilteredRecords: 0, pageItems: [] };
    else if (path.includes('/businessdate')) data = { type: 'BUSINESS_DATE', date: [
          2026,
          11,
          22
        ] };
    // All other writes fail closed, so a changed financial endpoint cannot hit a live server.
    else if (request.method() !== 'GET') {
      await route.fulfill({ status: 403, json: { errors: [] } });
      return;
    }
    await route.fulfill({ json: data });
  });
});

async function open(page: Page) {
  await page.goto('/#/checker-inbox-and-tasks/credit');
  await expect(page.locator('mifosx-credit-applications tbody tr')).toHaveCount(25);
}
async function selectFirst(page: Page) {
  await page.getByRole('checkbox', { name: 'Select application 000000001', exact: true }).check();
}

for (const width of [
  390,
  768,
  1280,
  1535,
  1920
]) {
  test(`renders the blue workspace without page overflow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1200 });
    await open(page);
    await expect(page.locator('.summary-card')).toHaveCount(4);
    await expect(page.locator('.summary-card').first()).toContainText('52');
    await expect(page.locator('.visible-range')).toContainText('1–25 of 52');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width <= 960) await page.locator('.queue-toggle').click();
    await expect(page.locator('nav a[aria-current="page"]')).toContainText('Credit');
    await page.screenshot({ path: info.outputPath(`after-${width}.png`), fullPage: true });
    if (width <= 960) await page.locator('.queue-toggle').click();
    await selectFirst(page);
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeVisible();
    const primary = await page
      .getByRole('button', { name: 'Approve', exact: true })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(primary).toBe('rgb(16, 116, 185)');
    const checkbox = page.getByRole('checkbox', { name: 'Select application 000000001', exact: true });
    const checkboxColor = await checkbox.evaluate(
      (el) => getComputedStyle(el.closest('mat-checkbox')!.querySelector('.mdc-checkbox__background')!).backgroundColor
    );
    expect(checkboxColor).toMatch(/^rgba?\(16, 116, 185(?:, [\d.]+)?\)$/);
    if (width === 390) await page.locator('tbody tr').first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`selected-${width}.png`), fullPage: true });
  });
}

test('filters by status, product, dates, currency-aware amounts and location using supported parameters', async ({
  page
}) => {
  await open(page);
  await page.locator('.summary-card').filter({ hasText: 'Active' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(25);
  await expect
    .poll(() =>
      reads
        .filter((u) => u.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('status')
    )
    .toBe('300');
  await page.locator('form').getByRole('button', { name: 'Submitted Date', exact: true }).click();
  await page.locator('input[formcontrolname="submittedFrom"]').fill('01 November 2026');
  await page.locator('input[formcontrolname="submittedTo"]').fill('22 November 2026');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.locator('form').getByRole('button', { name: 'Amount', exact: true }).click();
  await page.locator('input[formcontrolname="minAmount"]').fill('100.00000001');
  await page.locator('input[formcontrolname="maxAmount"]').fill('999999.99');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Select a currency');
  await page.getByRole('combobox', { name: 'Currency', exact: true }).click();
  await page.getByRole('option', { name: 'USD — US Dollar' }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByRole('button', { name: 'State / Municipality', exact: true }).click();
  await page.getByRole('combobox', { name: 'State', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic state' }).click();
  await page.locator('input[formcontrolname="municipality"]').fill('Synthetic town');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByRole('combobox', { name: 'Product', exact: true }).click();
  await page.getByRole('option', { name: 'Standard Loan', exact: true }).click();
  await expect
    .poll(() =>
      reads
        .filter((u) => u.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('productId')
    )
    .toBe('10');
  const params = Object.fromEntries(reads.filter((u) => u.searchParams.get('limit') === '25').at(-1)!.searchParams);
  expect(params).toMatchObject({
    status: '300',
    submittedFrom: '2026-11-01',
    submittedTo: '2026-11-22',
    minAmount: '100.00000001',
    maxAmount: '999999.99',
    currencyCode: 'USD',
    stateProvinceId: '7',
    municipality: 'Synthetic town',
    productId: '10',
    offset: '0'
  });
  expect(params).not.toHaveProperty('query');
  expect(params).not.toHaveProperty('productIds');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.visible-range')).toContainText('1–25 of 52');
  await expect
    .poll(() =>
      reads
        .filter((u) => u.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.has('status')
    )
    .toBe(false);
});

test('clears hidden financial selections on paging and preserves the server sort', async ({ page }) => {
  await open(page);
  await selectFirst(page);
  await expect(page.locator('.mass-actions')).toContainText('1 selected');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.locator('.mass-actions')).toHaveCount(0);
  await expect(page.locator('.visible-range')).toContainText('26–50 of 52');
  await page.locator('th').filter({ hasText: 'Amount' }).click();
  await expect
    .poll(() =>
      reads
        .filter((u) => u.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('orderBy')
    )
    .toBe('amount');
  await expect(page.locator('.visible-range')).toContainText('1–25 of 52');
  expect(writes).toHaveLength(0);
});

test('requires confirmation and uses standard approval command with business date', async ({ page }) => {
  await open(page);
  await selectFirst(page);
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('000000001');
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('Batch completed. Review each application result.', { exact: true })).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0].path).toBe('/loans/1');
  expect(writes[0].command).toBe('approve');
  expect(writes[0].payload).toMatchObject({
    approvedOnDate: '22 November 2026',
    dateFormat: 'dd MMMM yyyy',
    locale: 'en'
  });
  await expect(page.locator('tbody tr').first()).toContainText('Approved');
  await expect(page.locator('.mass-actions')).toHaveCount(0);
});

test('reports partial rejection results from synthetic backend responses', async ({ page }) => {
  failRejection = true;
  await open(page);
  await selectFirst(page);
  await page.getByRole('checkbox', { name: 'Select application 000000002', exact: true }).check();
  await page.getByRole('button', { name: 'Reject Selected', exact: true }).click();
  await page.locator('textarea[formcontrolname="note"]').fill('Synthetic policy review');
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.batch-outcomes')).toContainText('000000001 — Succeeded');
  await expect(page.locator('.batch-outcomes')).toContainText('000000002 — Failed');
  expect(writes).toHaveLength(2);
  expect(writes.every((write) => write.command === 'reject')).toBe(true);
  expect(writes[0].payload.note).toBe('Synthetic policy review');
});

test('exports all filtered pages and preserves leading-zero account numbers', async ({ page }) => {
  const fixture = rows[0];
  rows = Array.from({ length: 205 }, (_, index) => ({
    ...fixture,
    loanId: index + 1,
    accountNo: String(index + 1).padStart(9, '0'),
    clientName: 'Export client ' + (index + 1)
  }));
  await open(page);
  await page.getByRole('combobox', { name: 'Product', exact: true }).click();
  await page.getByRole('option', { name: 'Standard Loan', exact: true }).click();
  await expect
    .poll(() =>
      reads
        .filter((url) => url.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('productId')
    )
    .toBe('10');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export filtered results (all pages)', exact: true }).click();
  const file = await download;
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('"\'000000001"');
  expect(csv).toContain('"12345.50"');
  expect(csv.trim().split('\r\n')).toHaveLength(206);
  const exportReads = reads.filter((url) => url.searchParams.get('limit') === '200');
  expect(exportReads.map((url) => url.searchParams.get('offset'))).toEqual([
    '0',
    '200'
  ]);
  expect(exportReads.every((url) => url.searchParams.get('productId') === '10')).toBe(true);
  expect(csv).toContain('"Export client 205"');
  expect(csv).toContain('"\'000000205"');
  expect(writes).toHaveLength(0);
});

test('supports dark theme and current-page text search', async ({ page }, info) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await open(page);
  await page.evaluate(() => document.body.classList.add('dark-theme'));
  const search = page.locator('input[formcontrolname="pageSearch"]');
  const before = reads.length;
  await search.fill('Synthetic Pending Client 0');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  expect(reads).toHaveLength(before);
  await expect(page.locator('#search-scope')).toContainText('this page only');
  await expect(page.locator('.visible-range')).toContainText('Matches on this page: 1');
  await search.press('Escape');
  await page.screenshot({ path: info.outputPath('after-dark-1920.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 1200 });
  await page.locator('tbody tr').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('after-dark-390.png'), fullPage: true });
});

test('represents summary failures as unavailable and keeps table results', async ({ page }) => {
  summaryFailure = true;
  const failedSummary = page.waitForResponse(
    (response) =>
      response.url().includes('/v2/credit-applications') &&
      new URL(response.url()).searchParams.get('limit') === '1' &&
      response.status() === 503
  );
  await open(page);
  await failedSummary;
  await expect(page.locator('.summary-scope').getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  await expect(page.locator('.summary-card').nth(1)).toContainText('—');
  await expect(page.locator('.summary-card').first()).toContainText('52');
});

for (const role of [
  'READ_LOAN',
  'APPROVE_LOAN',
  'REJECT_LOAN',
  'NONE'
]) {
  const granted = role === 'NONE' ? [] : role === 'READ_LOAN' ? ['READ_LOAN'] : [
            'READ_LOAN',
            role
          ];
  test.describe(role, () => {
    test.use({ creditsPermissions: granted });
    test(`protects financial actions for ${role}`, async ({ page }) => {
      await page.goto('/#/checker-inbox-and-tasks/credit');
      if (role === 'NONE') {
        await expect(page).toHaveURL(/\/home$/);
        await expect(page.locator('mifosx-home')).toBeVisible();
        await expect(page.locator('mifosx-credit-applications')).toHaveCount(0);
        expect(reads).toHaveLength(0);
        return;
      }
      await expect(page.locator('tbody tr')).toHaveCount(25);
      if (role === 'READ_LOAN') {
        await expect(page.getByRole('checkbox', { name: 'Select application 000000001', exact: true })).toBeDisabled();
      } else {
        await selectFirst(page);
        if (role === 'APPROVE_LOAN')
          await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeVisible();
        else await expect(page.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
      }
      expect(writes).toHaveLength(0);
    });
  });
}

test('keeps all ten existing queue deep links usable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [
    queue,
    selector
  ] of [
    [
      'checker-inbox',
      'mifosx-checker-inbox'
    ],
    [
      'requests',
      'mifosx-credit-applications'
    ],
    [
      'pending-prospects',
      'mifosx-pending-prospects'
    ],
    [
      'client-approval',
      'mifosx-client-approval'
    ],
    [
      'loan-approval',
      'mifosx-loan-approval'
    ],
    [
      'council-approval',
      'mifosx-council-approval'
    ],
    [
      'loan-disbursal',
      'mifosx-loan-disbursal'
    ],
    [
      'reschedule-loan',
      'mifosx-reschedule-loan'
    ],
    [
      'credit',
      'mifosx-credit-applications'
    ],
    [
      'mass-rejection',
      'mifosx-credit-applications'
    ]
  ]) {
    await page.goto('/#/checker-inbox-and-tasks/' + queue);
    await expect(page.locator(selector)).toBeVisible();
    await expect(page.locator('nav a[aria-current="page"]')).toHaveAttribute(
      'href',
      '#/checker-inbox-and-tasks/' + queue
    );
  }
  expect(errors).toEqual([]);
  expect(writes).toHaveLength(0);
});

test('keeps working-capital loans in individual approval review', async ({ page }) => {
  rows[0].productType = 'working-capital';
  await open(page);
  await selectFirst(page);
  await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeDisabled();
  await expect(page.locator('.approval-hint')).toContainText('individual review');
  expect(writes).toHaveLength(0);
});

test('resolves an authorized client suggestion into a server-wide clientId filter', async ({ page }) => {
  await open(page);
  await page.locator('input[formcontrolname="pageSearch"]').fill('Resolved');
  await expect(
    page.getByRole('option', { name: 'Filter all pages by client: Resolved Synthetic Client (000099)', exact: true })
  ).toBeVisible();
  await page.locator('input[formcontrolname="pageSearch"]').press('ArrowDown');
  await page.locator('input[formcontrolname="pageSearch"]').press('Enter');
  await expect
    .poll(() =>
      reads
        .filter((u) => u.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('clientId')
    )
    .toBe('99');
  await expect(page.locator('input[formcontrolname="pageSearch"]')).toHaveValue('');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Client: Resolved Synthetic Client', exact: true })).toBeVisible();
  expect(reads.every((u) => !u.searchParams.has('query') && !u.searchParams.has('searchText'))).toBe(true);
});

test('Enter in page search does not submit server filters', async ({ page }) => {
  await open(page);
  const search = page.locator('input[formcontrolname="pageSearch"]');
  await search.fill('Synthetic Pending Client 0');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await search.press('Escape');
  const requests = reads.length;
  await search.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  expect(reads).toHaveLength(requests);
});

test('an open Amount dialog receives currencies after a delayed load', async ({ page }) => {
  let release: () => void;
  currencyDelay = new Promise<void>((resolve) => (release = resolve));
  await open(page);
  await page.locator('form').getByRole('button', { name: 'Amount', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Loading currencies…', { exact: true })).toBeVisible();
  await dialog.locator('input[formcontrolname="minAmount"]').fill('100.00000001');
  release();
  await expect(dialog.getByText('Loading currencies…', { exact: true })).toHaveCount(0);
  await dialog.getByRole('combobox', { name: 'Currency', exact: true }).click();
  await page.getByRole('option', { name: 'USD — US Dollar', exact: true }).click();
  await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .poll(() =>
      reads
        .filter((url) => url.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('minAmount')
    )
    .toBe('100.00000001');
  expect(
    reads
      .filter((url) => url.searchParams.get('limit') === '25')
      .at(-1)
      ?.searchParams.get('currencyCode')
  ).toBe('USD');
});

test('currency failure can be retried without closing Amount', async ({ page }) => {
  currencyFailures = 1;
  await open(page);
  await page.locator('form').getByRole('button', { name: 'Amount', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByText('Currencies are unavailable. Retry to load supported currencies.', { exact: true })
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'Currency', exact: true }).click();
  await page.getByRole('option', { name: 'USD — US Dollar', exact: true }).click();
  await dialog.locator('input[formcontrolname="maxAmount"]').fill('200');
  await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .poll(() =>
      reads
        .filter((url) => url.searchParams.get('limit') === '25')
        .at(-1)
        ?.searchParams.get('maxAmount')
    )
    .toBe('200');
});

for (const action of [
  'approve',
  'reject'
]) {
  test(`blocks navigation until every confirmed ${action} command completes`, async ({ page }) => {
    let release: () => void;
    commandDelay = new Promise<void>((resolve) => (release = resolve));
    // Establish a real history entry for the attempted navigation.
    await page.goto('/#/checker-inbox-and-tasks/requests');
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await page.locator('nav a[href$="/credit"]').click();
    await expect(page.locator('tbody tr')).toHaveCount(25);
    for (const id of [
      1,
      2,
      3,
      4
    ]) await page
        .getByRole('checkbox', { name: 'Select application ' + String(id).padStart(9, '0'), exact: true })
        .check();
    await page.getByRole('button', { name: action === 'approve' ? 'Approve' : 'Reject Selected', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect.poll(() => writes.length).toBe(3);
    await page.evaluate(() => {
      const probe = window as Window & { creditsAttemptedHash?: string };
      probe.creditsAttemptedHash = '';
      window.addEventListener(
        'popstate',
        () => {
          probe.creditsAttemptedHash = location.hash;
        },
        { once: true }
      );
    });
    await page.goBack();
    // Back changes the URL to Requests first. Returning to Credit then proves
    // the guard has canceled that navigation, rather than observing the old URL.
    await expect
      .poll(() => page.evaluate(() => (window as Window & { creditsAttemptedHash?: string }).creditsAttemptedHash))
      .toBe('#/checker-inbox-and-tasks/requests');
    await expect(page).toHaveURL(/\/credit$/);
    expect(writes).toHaveLength(3);
    release();
    await expect(page.locator('.batch-outcomes li')).toHaveCount(4);
    expect(writes).toHaveLength(4);
    expect(writes.every((write) => write.command === action)).toBe(true);
    await page.locator('nav a[href$="/requests"]').click();
    await expect(page).toHaveURL(/\/requests$/);
  });
}

test('navigation before confirmation cancels without issuing a rejection', async ({ page }) => {
  await page.goto('/#/checker-inbox-and-tasks/requests');
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.locator('nav a[href$="/credit"]').click();
  await expect(page.locator('tbody tr')).toHaveCount(25);
  await selectFirst(page);
  await page.getByRole('button', { name: 'Reject Selected', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(writes).toHaveLength(0);
});
