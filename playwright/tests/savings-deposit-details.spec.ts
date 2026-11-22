/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { expect, Page, test } from '@playwright/test';

async function openDetails(page: Page, currency = 'MXN', includeSecondAccount = false) {
  const writes: string[] = [];
  const requests: string[] = [];
  const account = {
    id: 77,
    clientId: 10,
    accountNo: 'TEST-0077',
    productName: 'Everyday Savings',
    currency: { code: currency, decimalPlaces: 2 },
    status: { active: true, value: 'Active' },
    summary: { accountBalance: 500210, availableBalance: 500000 }
  };
  const secondAccount = { ...account, id: 78, accountNo: 'TEST-0078', productName: 'Goal Savings' };
  await page.addInitScript(() => {
    const credentials = JSON.stringify({
      authenticated: true,
      userId: 1,
      username: 'fixture-reader',
      officeId: 1,
      officeName: 'Test branch',
      permissions: ['ALL_FUNCTIONS'],
      roles: [],
      base64EncodedAuthenticationKey: 'fixture',
      rememberMe: true,
      shouldRenewPassword: false
    });
    localStorage.setItem('mifosXCredentials', credentials);
    sessionStorage.setItem('mifosXCredentials', credentials);
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api\/v\d+/, '');
    requests.push(path);
    if (route.request().method() !== 'GET') {
      writes.push(path);
      await route.fulfill({ status: 409, json: {} });
      return;
    }
    let json: unknown = [];
    if (path === '/search')
      json = [{ entityId: 10, entityType: 'CLIENT', entityName: 'Alex Test', entityAccountNo: 'TEST-0010' }];
    else if (path === '/clients/10') json = { id: 10, displayName: 'Alex Test', active: true };
    else if (path === '/clients/10/accounts') json = { savingsAccounts: includeSecondAccount ? [
              account,
              secondAccount
            ] : [account] };
    else if (path === '/savingsaccounts/77') json = account;
    else if (path === '/savingsaccounts/78') json = secondAccount;
    else if (path.endsWith('/transactions/template'))
      json = {
        paymentTypeOptions: [
          { id: 1, name: 'Cash Drawer', isCashPayment: true },
          { id: 2, name: 'Bank Check', isCashPayment: false }
        ]
      };
    else if (path === '/notifications') json = { pageItems: [] };
    await route.fulfill({ json });
  });
  await page.goto('/#/organization/base-teller/savings-account-deposits');
  await page.locator('input[formcontrolname="search"]').fill('Alex');
  await page.getByRole('option', { name: /Alex Test/ }).click();
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(page.locator('.selection-next')).toBeEnabled();
  await page.locator('.selection-next').click();
  await expect(page.locator('.deposit-context')).toBeVisible();
  return { writes, requests };
}

async function countThousand(page: Page) {
  await page.locator('input[formcontrolname="transactionAmount"]').fill('1000');
  await page.getByRole('button', { name: 'Increase $500.00 quantity', exact: true }).click();
  const twoHundred = page.getByRole('button', { name: 'Increase $200.00 quantity', exact: true });
  await twoHundred.click();
  await twoHundred.click();
  await page.getByRole('button', { name: 'Increase $100.00 quantity', exact: true }).click();
}

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`cash details layout and safe Preview at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1200 });
    const { writes, requests } = await openDetails(page);
    const receipt = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
    await expect(page.locator('.details-next')).toBeDisabled();
    await expect(page.locator('.cash-row')).toHaveCount(11);
    await countThousand(page);
    await expect(page.locator('.reconciliation')).toContainText('Cash count matches the amount');
    await expect(page.locator('.reconciliation')).toContainText('4 banknotes, 0 coins');
    await expect(page.locator('.cash-row').nth(2)).toContainText('$400.00');
    await expect(page.locator('.deposit-summary')).toContainText('$501,210.00');
    await expect(page.locator('.deposit-context')).toContainText('$500,210.00');
    await expect(page.locator('.deposit-summary')).toContainText('Estimated balance after deposit');
    await expect(page.locator('.details-next')).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page
      .locator('.details-layout')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 1280 ? 2 : 1);
    expect(
      await page.locator('.cash-row').evaluateAll((rows) => rows.every((row) => row.scrollWidth <= row.clientWidth))
    ).toBe(true);

    await page.locator('input[formcontrolname="transactionAmount"]').focus();
    const outline = await page
      .locator('.deposit-amount .mdc-notched-outline__leading')
      .evaluate((element) => getComputedStyle(element).borderColor);
    const focusRgb = outline.match(/\d+/g)!.map(Number);
    expect(focusRgb[2]).toBeGreaterThan(focusRgb[1]);
    expect(focusRgb[2]).toBeGreaterThan(focusRgb[0]);
    const selected = await page
      .locator('.mat-button-toggle-checked')
      .evaluate((element) => getComputedStyle(element).color);
    const rgb = selected.match(/\d+/g)!.map(Number);
    expect(rgb[2]).toBeGreaterThan(rgb[1]);
    await page.screenshot({ path: testInfo.outputPath(`details-${width}.png`), fullPage: true });
    await page.locator('.reconciliation').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`details-cash-${width}.png`), fullPage: true });
    await page.locator('.details-footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`details-footer-${width}.png`), fullPage: true });

    await page.locator('.details-next').click();
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Preview');
    await expect(page.locator('.preview-summary')).toContainText('TEST-0077');
    await expect(page.locator('.preview-summary')).toContainText('$1,000.00');
    expect(await page.locator('input[formcontrolname="receiptNumber"]').inputValue()).toBe(receipt);
    expect(writes).toEqual([]);
    expect(requests).toContain('/savingsaccounts/77');
    expect(requests).toContain('/savingsaccounts/77/transactions/template');
  });
}

test('mismatch, direct quantity editing, coin precision and clear count never submit', async ({ page }) => {
  const { writes } = await openDetails(page);
  const amount = page.locator('input[formcontrolname="transactionAmount"]');
  await amount.fill('1000');
  await page.getByRole('button', { name: 'Increase $500.00 quantity', exact: true }).click();
  await expect(page.locator('.reconciliation')).toContainText('Missing $500.00');
  await expect(page.locator('.details-next')).toBeDisabled();
  await page.getByRole('tab', { name: /Preview/ }).click({ force: true });
  await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Deposit Details');
  const quantity = page.getByRole('spinbutton', { name: 'Quantity of $500.00', exact: true });
  await quantity.fill('3');
  await expect(page.locator('.reconciliation')).toContainText('Count exceeds the amount by $500.00');
  await quantity.fill('1.5');
  await expect(page.locator('.reconciliation')).toContainText('Check the denomination values');
  await expect(page.locator('.details-next')).toBeDisabled();
  await page.getByRole('button', { name: 'Clear count', exact: true }).click();
  await expect(amount).toHaveValue('1000');
  await amount.fill('1');
  await page.getByRole('spinbutton', { name: 'Quantity of $0.50', exact: true }).fill('2');
  await expect(page.locator('.details-next')).toBeEnabled();
  await expect(page.locator('.reconciliation')).toContainText('0 banknotes, 2 coins');
  expect(writes).toEqual([]);
});

test('Check fields and compatible payment types preserve amount, notes and receipt', async ({ page }) => {
  const { writes } = await openDetails(page);
  const receipt = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
  await page.locator('input[formcontrolname="transactionAmount"]').fill('123.45');
  await page.locator('textarea[formcontrolname="note"]').fill('Synthetic check deposit');
  await page.getByRole('radio', { name: 'Check', exact: true }).check();
  await expect(page.locator('.cash-count')).toHaveCount(0);
  await expect(page.locator('.details-next')).toBeDisabled();
  await page.locator('mat-select[formcontrolname="paymentTypeId"]').click();
  await expect(page.getByRole('option', { name: 'Cash Drawer' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Bank Check' }).click();
  for (const name of [
    'accountNumber',
    'checkNumber',
    'routingCode',
    'bankNumber'
  ]) {
    await page.locator(`input[formcontrolname="${name}"]`).fill(`TEST-${name}`);
  }
  await expect(page.locator('.details-next')).toBeEnabled();
  await expect(page.locator('.deposit-summary')).toContainText('Bank Check');
  expect(await page.locator('input[formcontrolname="receiptNumber"]').inputValue()).toBe(receipt);
  await page.locator('.details-next').click();
  await expect(page.locator('.preview-summary')).toContainText('123.45');
  expect(writes).toEqual([]);
});

test('other currencies retain manual denomination entry', async ({ page }) => {
  const { writes } = await openDetails(page, 'USD');
  await expect(page.locator('.cash-row')).toHaveCount(1);
  await page.locator('input[formcontrolname="transactionAmount"]').fill('50');
  await page.locator('input[formcontrolname="denomination"]').fill('25');
  await page.locator('input[formcontrolname="quantity"]').fill('2');
  await expect(page.locator('.details-next')).toBeEnabled();
  expect(writes).toEqual([]);
});

test('dark theme blue controls and semantic success remain readable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  const { writes } = await openDetails(page);
  await page.evaluate(() => {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  });
  await countThousand(page);
  await expect(page.locator('.reconciliation')).toContainText('Cash count matches');
  for (const selector of [
    '.reconciliation',
    '.mat-button-toggle-checked',
    '.details-next'
  ]) {
    const ratio = await page.locator(selector).evaluate((element) => {
      const luminance = (color: string) => {
        const channels = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((v) => v / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      const style = getComputedStyle(element),
        a = luminance(style.color),
        b = luminance(style.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.screenshot({ path: testInfo.outputPath('details-dark.png'), fullPage: true });
  expect(writes).toEqual([]);
});

for (const width of [
  390,
  1920
]) {
  test(`custom MXN denominations reconcile without writes at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1200 });
    const { writes } = await openDetails(page);
    const receipt = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
    await countThousand(page);
    await page.locator('input[formcontrolname="transactionAmount"]').fill('1000.20');
    await expect(page.locator('.details-next')).toBeDisabled();
    await page.locator('.cash-count').getByRole('button', { name: 'Add', exact: true }).click();
    const customRow = page.locator('.cash-group.manual-count .cash-row');
    await customRow.locator('input[formcontrolname="denomination"]').fill('0.20');
    await expect(customRow.locator('input[formcontrolname="quantity"]')).toHaveValue('1');
    await expect(page.locator('.details-next')).toBeEnabled();
    await expect(page.locator('.reconciliation')).toContainText('Cash count matches the amount');
    await expect(page.locator('.deposit-summary')).toContainText('$501,210.20');
    expect(await customRow.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await customRow.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`custom-mxn-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Clear count', exact: true }).click();
    await expect(customRow.locator('input[formcontrolname="quantity"]')).toHaveValue('0');
    await expect(customRow.locator('input[formcontrolname="denomination"]')).toHaveValue('0.20');
    await expect(page.locator('input[formcontrolname="transactionAmount"]')).toHaveValue('1000.20');
    expect(await page.locator('input[formcontrolname="receiptNumber"]').inputValue()).toBe(receipt);
    await customRow.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator('.cash-row')).toHaveCount(11);
    await countThousand(page);
    await expect(page.locator('.details-next')).toBeEnabled();
    await page.locator('.details-next').click();
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Preview');
    expect(writes).toEqual([]);
  });
}

test('account switching revalidates an unchanged Check payment ID after a delayed template', async ({ page }) => {
  const { writes } = await openDetails(page, 'MXN', true);
  await page.locator('input[formcontrolname="transactionAmount"]').fill('123.45');
  await page.getByRole('radio', { name: 'Check', exact: true }).check();
  await page.locator('mat-select[formcontrolname="paymentTypeId"]').click();
  await page.getByRole('option', { name: 'Bank Check', exact: true }).click();
  for (const name of [
    'accountNumber',
    'checkNumber',
    'routingCode',
    'bankNumber'
  ]) {
    await page.locator(`input[formcontrolname="${name}"]`).fill(`TEST-${name}`);
  }
  await expect(page.locator('.details-next')).toBeEnabled();
  let releaseTemplate!: () => void;
  const template = new Promise<void>((resolve) => {
    releaseTemplate = resolve;
  });
  await page.route('**/savingsaccounts/78/transactions/template**', async (route) => {
    await template;
    await route.fulfill({ json: { paymentTypeOptions: [{ id: 2, name: 'Bank Check', isCashPayment: false }] } });
  });
  try {
    await page.getByRole('button', { name: 'Change account', exact: true }).click();
    await page.getByRole('radio', { name: /Goal Savings/ }).check();
    await expect(page.locator('.selection-next')).toBeDisabled();
  } finally {
    releaseTemplate();
  }
  await expect(page.locator('.selection-next')).toBeEnabled();
  await page.locator('.selection-next').click();
  await expect(page.locator('.deposit-context')).toContainText('TEST-0078');
  await expect(page.locator('mat-select[formcontrolname="paymentTypeId"]')).toContainText('Bank Check');
  await expect(page.locator('.details-next')).toBeEnabled();
  await page.locator('.details-next').click();
  await expect(page.locator('.preview-summary')).toContainText('TEST-0078');
  await expect(page.locator('.preview-summary')).toContainText('123.45');
  expect(writes).toEqual([]);
});
