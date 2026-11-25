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
let savedNotes: Map<number, string>;
let uncertainCommand = false;
const pending = {
  id: 100,
  code: 'loanStatusType.submitted.and.pending.approval',
  value: 'Submitted and pending approval'
};

test.beforeEach(async ({ page, creditsPermissions }) => {
  savedNotes = new Map();
  uncertainCommand = false;
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
      if (url.searchParams.get('submittedFrom'))
        filtered = filtered.filter((row) => row.submittedOnDate >= url.searchParams.get('submittedFrom')!);
      if (url.searchParams.get('submittedTo'))
        filtered = filtered.filter((row) => row.submittedOnDate <= url.searchParams.get('submittedTo')!);
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
      savedNotes.set(id, request.postDataJSON().note);
      writes.push({ path: path.replace(/^.*\/api\/v\d+/, ''), command, payload: request.postDataJSON() });
      if (commandDelay) await commandDelay;
      if (uncertainCommand) {
        await route.fulfill({ status: 503, json: { errors: [] } });
        return;
      }
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
    if (request.method() === 'GET' && /\/(loans|working-capital-loans)\/\d+$/.test(path)) {
      const row = rows.find((item) => item.loanId === Number(path.split('/').pop()));
      await route.fulfill({
        json: {
          id: row.loanId,
          loanProductId: row.productId,
          clientId: row.clientId,
          proposedPrincipal: row.amount,
          currency: { code: row.currencyCode, decimalPlaces: 2 },
          accountNo: row.accountNo,
          status: row.status,
          timeline: { submittedOnDate: row.submittedOnDate }
        }
      });
      return;
    }
    if (request.method() === 'GET' && /\/loans\/\d+\/notes$/.test(path)) {
      const id = Number(path.split('/').at(-2));
      await route.fulfill({ json: [{ note: savedNotes.get(id) }] });
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

async function openMass(page: Page) {
  await page.goto('/#/checker-inbox-and-tasks/mass-rejection');
  await expect(page.locator('mifosx-credit-applications tbody tr')).toHaveCount(10);
  await expect(page.getByText('8 of 52 applications can be rejected', { exact: true })).toBeVisible();
  await expect(page.locator('.rejection-form input[formcontrolname="rejectedOnDate"]')).toHaveValue('22 November 2026');
}
async function selectFirst(page: Page) {
  await page.getByRole('checkbox', { name: 'Select application 000000001', exact: true }).check();
}
async function reason(page: Page) {
  await page.getByRole('combobox', { name: 'Rejection Reason', exact: true }).click();
  await page.getByRole('option', { name: 'Incomplete documentation', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}
for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`renders the persistent panel and selection at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    await openMass(page);
    const panel = page.getByRole('complementary', { name: 'Rejection confirmation' });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Reject 0 applications', exact: true })).toBeDisabled();
    await selectFirst(page);
    await reason(page);
    await expect(panel.getByText('12,345.50 USD', { exact: true })).toHaveCount(2);
    await expect(panel.getByRole('button', { name: 'Reject 1 application', exact: true })).toBeEnabled();
    if (width === 1920) {
      await page.getByRole('checkbox', { name: 'Select application 000000002', exact: true }).check();
      await page
        .getByRole('textbox', { name: 'Note for the loan officer (optional)' })
        .fill('Missing signed authorization.');
    }
    await page.screenshot({ path: `../WEB-1476-evidence/after-${width}.png`, fullPage: true });
    if (width === 1920) await panel.getByRole('button', { name: 'Remove application 000000002' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await panel.getByRole('button', { name: 'Remove application 000000001' }).click();
    await expect(page.getByRole('checkbox', { name: 'Select application 000000001', exact: true })).not.toBeChecked();
    await expect(panel.getByRole('button', { name: 'Reject 0 applications', exact: true })).toBeDisabled();
    expect(writes).toHaveLength(0);
  });
}

test('requires final confirmation and persists the reason and note through supported commands', async ({ page }) => {
  await openMass(page);
  await selectFirst(page);
  await reason(page);
  await page
    .getByRole('textbox', { name: 'Note for the loan officer (optional)' })
    .fill('Missing signed authorization');
  await page.getByRole('button', { name: 'Reject 1 application', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(writes).toHaveLength(0);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Reject 1 application', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.batch-outcomes')).toContainText('Succeeded');
  expect(writes).toHaveLength(1);
  expect(writes[0]).toEqual({
    path: '/loans/1',
    command: 'reject',
    payload: {
      rejectedOnDate: '22 November 2026',
      note: 'Rejection Reason: Incomplete documentation\nNote: Missing signed authorization',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    }
  });
  expect(reads.some((url) => url.searchParams.get('limit') === '200')).toBe(true);
  await expect(page.getByText('7 of 52 applications can be rejected', { exact: true })).toBeVisible();
});

test('filters eligible rows, searches this page and applies real product/date filters', async ({ page }) => {
  await openMass(page);
  await page.getByRole('switch', { name: 'Show only applications that can be rejected' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(8);
  expect(reads.some((url) => url.searchParams.get('status') === '100' && url.searchParams.get('limit') === '10')).toBe(
    true
  );
  await page.locator('input[formcontrolname="pageSearch"]').fill('000000001');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('combobox', { name: 'Product', exact: true }).click();
  await page.getByRole('option', { name: 'Other Loan', exact: true }).click();
  await expect(page.locator('.empty-state')).toBeVisible();
  expect(reads.at(-1)!.searchParams.get('productId')).toBe('20');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.getByRole('button', { name: 'Submitted Date', exact: false }).first().click();
  const dates = page.getByRole('dialog');
  await expect(dates).toBeVisible();
  await dates.getByRole('textbox', { name: 'From Date', exact: true }).fill('01 November 2026');
  await dates.getByRole('textbox', { name: 'To Date', exact: true }).fill('20 November 2026');
  await dates.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(dates).not.toBeVisible();
  expect(reads.at(-1)!.searchParams.get('submittedFrom')).toBe('2026-11-01');
  expect(reads.at(-1)!.searchParams.get('submittedTo')).toBe('2026-11-20');
});

test('reports partial failure without retrying commands', async ({ page }) => {
  failRejection = true;
  await openMass(page);
  await selectFirst(page);
  await page.getByRole('checkbox', { name: 'Select application 000000002', exact: true }).check();
  await reason(page);
  await page.getByRole('button', { name: 'Reject 2 applications', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.batch-outcomes')).toContainText('Failed');
  await expect(page.locator('.batch-outcomes')).toContainText('Succeeded');
  expect(writes).toHaveLength(2);
});

test('keeps uncertain writes locked after reload', async ({ page }) => {
  uncertainCommand = true;
  await openMass(page);
  await selectFirst(page);
  await reason(page);
  await page.getByRole('button', { name: 'Reject 1 application', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.batch-outcomes')).toContainText('Uncertain');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Select application 000000001', exact: true })).toBeDisabled();
  expect(writes).toHaveLength(1);
});

test('keeps blue navigation and readable red selection in dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await openMass(page);
  await selectFirst(page);
  await reason(page);
  await page.evaluate(() => document.body.classList.add('dark-theme'));
  await expect(page.locator('tr.selected-row')).toBeVisible();
  await page.screenshot({ path: '../WEB-1476-evidence/after-dark-1920.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 1200 });
  await page.screenshot({ path: '../WEB-1476-evidence/after-dark-390.png', fullPage: true });
});

test('keeps the confirmed queue alive during internal navigation', async ({ page }) => {
  let finish!: () => void;
  commandDelay = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await openMass(page);
  await selectFirst(page);
  await reason(page);
  await page.getByRole('button', { name: 'Reject 1 application', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('mifosx-credit-applications')).toContainText('Processing');
  await page.getByRole('link', { name: 'Credit', exact: true }).click();
  await expect(page).toHaveURL(/mass-rejection/);
  expect(writes).toHaveLength(1);
  finish();
  await expect(page.locator('.batch-outcomes')).toContainText('Succeeded');
});
