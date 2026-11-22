/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { expect, Page, test } from '@playwright/test';

const account = {
  id: 77,
  clientId: 10,
  accountNo: 'TEST-0077',
  productName: 'Everyday Savings',
  currency: { code: 'USD', decimalPlaces: 2 },
  status: { active: true, value: 'Active' },
  depositType: { value: 'Savings' },
  summary: { accountBalance: 120, availableBalance: 100 },
  nominalAnnualInterestRate: 3.5,
  minRequiredBalance: 0,
  timeline: { activatedOnDate: [
      2021,
      2,
      12
    ] },
  transactions: [
    { id: 1, date: [
        2026,
        9,
        30
      ], amount: 1.25, entryType: 'CREDIT', transactionType: { value: 'Interest posting', interestPosting: true } },
    { id: 2, date: [
        2026,
        10,
        28
      ], amount: 20, entryType: 'DEBIT', transactionType: { value: 'Withdrawal', withdrawal: true } },
    { id: 3, date: [
        2026,
        11,
        5
      ], amount: 50, entryType: 'CREDIT', transactionType: { value: 'Deposit', deposit: true } }
  ]
};
const goalAccount = {
  ...account,
  id: 78,
  accountNo: 'TEST-0078',
  productName: 'Goal Savings',
  summary: { accountBalance: 25, availableBalance: 25 },
  transactions: []
};
const inactiveAccount = {
  ...account,
  id: 79,
  accountNo: 'TEST-0079',
  productName: 'Junior Savings',
  status: { active: false, value: 'Closed' }
};

async function contracts(
  page: Page,
  options: {
    missing?: boolean;
    detailsError?: boolean;
    accountsError?: boolean;
    searchError?: boolean;
    holdTemplate?: boolean;
    holdDetails?: boolean;
    alternateSavingsType?: boolean;
    depositError?: boolean;
    manyAccounts?: boolean;
    stringStatus?: boolean;
    completeDeposit?: boolean;
  } = {}
) {
  let releaseTemplateResponse!: () => void;
  const templateResponse = new Promise<void>((resolve) => {
    releaseTemplateResponse = resolve;
  });
  let releaseDetailsResponse!: () => void;
  const detailsResponse = new Promise<void>((resolve) => {
    releaseDetailsResponse = resolve;
  });
  let markDetailsRequested!: () => void;
  const detailsRequested = new Promise<void>((resolve) => {
    markDetailsRequested = resolve;
  });
  const writes: string[] = [];
  const requests: string[] = [];
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
      if (
        options.completeDeposit &&
        route.request().method() === 'POST' &&
        path === '/savingsaccounts/77/transactions' &&
        url.searchParams.get('command') === 'deposit'
      ) {
        await route.fulfill(
          options.depositError
            ? { status: 400, json: { defaultUserMessage: 'Synthetic deposit rejected' } }
            : { json: { resourceId: 101, savingsId: 77 } }
        );
      } else {
        await route.fulfill({ status: 409, json: {} });
      }
      return;
    }
    let json: unknown = [];
    let status = 200;
    if (path === '/search') {
      json =
        url.searchParams.get('query') === 'TEST-0077'
          ? options.alternateSavingsType
            ? [{ accountId: 77, accountType: 'savings', entityName: 'Alex Test' }]
            : [{ entityId: 77, entityType: 'SAVINGS', entityName: 'Alex Test', entityAccountNo: 'TEST-0077' }]
          : url.searchParams.get('query') === 'nobody'
            ? []
            : [{ entityId: 10, entityType: 'CLIENT', entityName: 'Alex Test', entityAccountNo: 'TEST-0010' }];
      if (options.searchError) status = 500;
    } else if (path === '/clients/10')
      json = {
        id: 10,
        displayName: 'Alex Test',
        accountNo: 'TEST-0010',
        active: true,
        status: { value: 'Active' },
        ...(options.missing ? {} : { officeName: 'Test branch', mobileNo: '000 000 0010' })
      };
    else if (path === '/clients/10/accounts') {
      json = {
        savingsAccounts: [
          account,
          goalAccount,
          options.stringStatus ? { ...inactiveAccount, status: 'Closed' } : inactiveAccount,
          ...(options.manyAccounts
            ? Array.from({ length: 12 }, (_, index) => ({
                ...account,
                id: 100 + index,
                productName: `Additional Savings ${index}`,
                accountNo: `TEST-${100 + index}`
              }))
            : [])
        ]
      };
      if (options.accountsError) status = 500;
    } else if (/^\/savingsaccounts\/\d+$/.test(path)) {
      markDetailsRequested();
      if (options.holdDetails) await detailsResponse;
      json = path.endsWith('/78')
        ? goalAccount
        : options.missing
          ? {
              id: 77,
              clientId: 10,
              accountNo: 'TEST-0077',
              status: account.status,
              currency: { code: 'JPY', decimalPlaces: 0 },
              accountBalance: 120
            }
          : account;
      if (options.detailsError) status = 500;
    } else if (path.endsWith('/transactions/template')) {
      if (options.holdTemplate) await templateResponse;
      json = { paymentTypeOptions: [{ id: 1, name: 'Cash', isCashPayment: true }] };
    } else if (path === '/savingsaccounts/77/transactions/101')
      json = {
        id: 101,
        accountNo: 'TEST-0077',
        amount: 50,
        runningBalance: 170,
        paymentDetailData: { receiptNumber: 'TEST-RECEIPT-101' },
        transactionType: { value: 'Deposit' }
      };
    else if (path === '/notifications') json = { pageItems: [] };
    await route.fulfill({ status, json });
  });
  await page.goto('/#/organization/base-teller/savings-account-deposits');
  return { writes, requests, releaseTemplateResponse, releaseDetailsResponse, detailsRequested };
}
async function chooseCustomer(page: Page, query = 'Alex') {
  await page.locator('input[formcontrolname="search"]').fill(query);
  await page.getByRole('option', { name: /Alex Test/ }).click();
  await expect(page.getByTestId('customer-card')).toContainText('Alex Test');
}
const next = (page: Page) => page.locator('.selection-next');

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`selection, account switching and navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1200 });
    const { writes } = await contracts(page);
    await expect(next(page)).toBeDisabled();
    await chooseCustomer(page);
    await expect(page.getByRole('radio')).toHaveCount(3);
    await expect(page.getByRole('radio', { name: /Junior Savings/ })).toBeDisabled();
    await page.getByRole('radio', { name: /Everyday Savings/ }).check();
    await expect(next(page)).toBeEnabled();
    await expect(page.locator('.account-details')).toContainText('$100.00');
    await expect(page.locator('.recent-transaction')).toHaveCount(3);
    await expect(page.locator('.recent-transaction').first()).toContainText('Deposit');
    await expect(page.getByTestId('destination-summary')).toContainText('TEST-0077');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`after-${width}.png`), fullPage: true });
    await page.getByRole('radio', { name: /Goal Savings/ }).check();
    await expect(next(page)).toBeEnabled();
    await expect(page.locator('.account-details')).toContainText('$25.00');
    await expect(page.getByTestId('destination-summary')).toContainText('TEST-0078');
    await next(page).click();
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Deposit Details');
    await page.getByRole('button', { name: 'Previous', exact: true }).first().click();
    await expect(page.getByRole('radio', { name: /Goal Savings/ })).toBeChecked();
    await page.getByRole('button', { name: 'Change Customer' }).click();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(next(page)).toBeDisabled();
    await expect(page.locator('input[formcontrolname="search"]')).toBeFocused();
    expect(writes).toEqual([]);
  });
}

test('direct account search verifies customer ownership and reuses details', async ({ page }) => {
  const { requests, writes } = await contracts(page);
  await chooseCustomer(page, 'TEST-0077');
  await expect(next(page)).toBeEnabled();
  expect(requests.filter((path) => path === '/savingsaccounts/77')).toHaveLength(1);
  expect(requests).toContain('/clients/10');
  expect(requests).toContain('/clients/10/accounts');
  expect(writes).toEqual([]);
});

test('keyboard autocomplete, account radio navigation, empty results and cancel', async ({ page }) => {
  const { writes } = await contracts(page);
  const search = page.locator('input[formcontrolname="search"]');
  await search.fill('nobody');
  await expect(page.getByRole('option')).toContainText('No matching customers');
  await search.fill('Alex');
  await expect(page.getByRole('option', { name: /Alex Test/ })).toBeVisible();
  await search.press('ArrowDown');
  await search.press('Enter');
  await page.getByRole('radio', { name: /Everyday Savings/ }).focus();
  await page.getByRole('radio', { name: /Everyday Savings/ }).press('Space');
  await expect(next(page)).toBeEnabled();
  await page.getByRole('radio', { name: /Everyday Savings/ }).press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Goal Savings/ })).toBeChecked();
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL(/\/base-teller$/);
  expect(writes).toEqual([]);
});

test('missing optional metadata uses accurate balance label and precision', async ({ page }) => {
  await contracts(page, { missing: true });
  await chooseCustomer(page);
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(next(page)).toBeEnabled();
  await expect(page.locator('.account-details')).toContainText('Account Balance');
  await expect(page.locator('.account-details')).toContainText('¥120');
  await expect(page.locator('.account-details')).not.toContainText('Available Balance');
  await expect(page.getByTestId('customer-card')).not.toContainText('Test branch');
  await expect(page.locator('.account-details')).not.toContainText('Opening Date');
  await expect(page.getByTestId('destination-summary')).toContainText('Everyday Savings');
  await expect(page.getByTestId('destination-summary')).toContainText('TEST-0077');
  await expect(page.locator('.account-card.selected')).toContainText('Everyday Savings');
});

test('optional history failure is independent of required template loading', async ({ page }) => {
  const { writes, releaseTemplateResponse } = await contracts(page, { detailsError: true, holdTemplate: true });
  try {
    await chooseCustomer(page);
    await page.getByRole('radio', { name: /Everyday Savings/ }).check();
    await expect(next(page)).toBeDisabled();
    await expect(page.getByRole('tab', { name: /Deposit Details/ })).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Customer and Account');
    await expect(page.locator('.account-details')).toContainText('Account details unavailable');
  } finally {
    releaseTemplateResponse();
  }
  await expect(next(page)).toBeEnabled();
  expect(writes).toEqual([]);
});

test('account failure exposes retry without a stale destination', async ({ page }) => {
  await contracts(page, { accountsError: true });
  await page.locator('input[formcontrolname="search"]').fill('Alex');
  await page.getByRole('option', { name: /Alex Test/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  await expect(next(page)).toBeDisabled();
  await expect(page.getByTestId('destination-summary')).not.toContainText('TEST-0077');
});

test('dark theme keeps the selected account readable', async ({ page }, testInfo) => {
  await contracts(page);
  await page.evaluate(() => {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  });
  await chooseCustomer(page);
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(next(page)).toBeEnabled();
  const contrast = await page.locator('.mat-step-icon-selected').evaluate((element) => {
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
    const style = getComputedStyle(element);
    const text = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({ path: testInfo.outputPath('after-dark.png'), fullPage: true });
});

test('search failure is announced without presenting false empty results', async ({ page }) => {
  const { writes } = await contracts(page, { searchError: true });
  await page.locator('input[formcontrolname="search"]').fill('Alex');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('option', { name: /No matching customers/ })).toHaveCount(0);
  await expect(next(page)).toBeDisabled();
  expect(writes).toEqual([]);
});

test('Retry reissues the same failed text query', async ({ page }) => {
  const { requests, writes } = await contracts(page, { searchError: true });
  await page.locator('input[formcontrolname="search"]').fill(' Alex ');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.route('**/search?**', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('query')).toBe('Alex');
    requests.push('/search');
    await route.fulfill({
      json: [{ entityId: 10, entityType: 'CLIENT', entityName: 'Alex Test', entityAccountNo: 'TEST-0010' }]
    });
  });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('input[formcontrolname="search"]')).toBeFocused();
  await expect(page.getByRole('option', { name: /Alex Test/ })).toBeVisible();
  expect(requests.filter((path) => path === '/search')).toHaveLength(2);
  expect(writes).toEqual([]);
});

test('equivalent trimmed queries retain their options and string statuses remain visible', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-21T10:00:00Z') });
  const { requests } = await contracts(page, { stringStatus: true });
  const search = page.locator('input[formcontrolname="search"]');
  await search.fill('Alex');
  await expect(page.getByRole('option', { name: /Alex Test/ })).toBeVisible();
  await page.clock.pauseAt(new Date('2026-11-21T10:01:00Z'));
  await search.fill('Alex ');
  await page.clock.runFor(350);
  await expect(page.getByRole('option', { name: /Alex Test/ })).toBeVisible();
  expect(requests.filter((path) => path === '/search')).toHaveLength(1);
  await page.getByRole('option', { name: /Alex Test/ }).click();
  const inactive = page.locator('.account-card').filter({ hasText: 'Junior Savings' });
  await expect(inactive.locator('.status-badge')).toHaveText('Closed');
  await expect(inactive.getByRole('radio')).toBeDisabled();
});

test('New Deposit resets a confirmed receipt and returns to customer selection', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const { writes } = await contracts(page, { completeDeposit: true });
  await chooseCustomer(page);
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  const receiptNumberInput = page.locator('input[formcontrolname="receiptNumber"]');
  const originalReceiptNumber = await receiptNumberInput.inputValue();
  await page.locator('input[formcontrolname="transactionAmount"]').fill('50');
  await page.locator('input[formcontrolname="denomination"]').fill('25');
  await page.locator('input[formcontrolname="quantity"]').fill('2');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-101');
  await expect(page.getByRole('button', { name: 'Confirm deposit', exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: /Customer and Account/ }).click({ force: true });
  await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Preview');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('receipt-new-deposit-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'New Deposit', exact: true }).click();
  await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Customer and Account');
  await expect(page.locator('input[formcontrolname="search"]')).toBeFocused();
  await expect(page.locator('input[formcontrolname="search"]')).toHaveValue('');
  await expect(next(page)).toBeDisabled();
  await expect(page.getByTestId('customer-card')).toHaveCount(0);
  await expect(page.locator('.receipt')).toHaveCount(0);
  expect(await receiptNumberInput.inputValue()).not.toBe(originalReceiptNumber);
  await expect(page.locator('input[formcontrolname="transactionAmount"]')).toHaveValue('');
  expect(writes).toEqual(['/savingsaccounts/77/transactions']);
  await chooseCustomer(page);
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(next(page)).toBeEnabled();
  expect(writes).toHaveLength(1);
});

test('desktop footer stays pinned within the page scroll and becomes static on mobile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await contracts(page, { manyAccounts: true });
  await chooseCustomer(page);
  const footer = page.locator('.selection-footer');
  await expect(footer).toHaveCSS('position', 'sticky');
  await expect(page.locator('.mat-horizontal-content-container')).toHaveCSS('overflow', 'visible');
  for (const position of [
    240,
    560
  ]) {
    await footer.evaluate((element, scrollTop) => {
      let ancestor = element.parentElement;
      while (
        ancestor &&
        !(/auto|scroll/.test(getComputedStyle(ancestor).overflowY) && ancestor.scrollHeight > ancestor.clientHeight)
      )
        ancestor = ancestor.parentElement;
      if (!ancestor) throw new Error('Page scroll container not found');
      ancestor.scrollTop = scrollTop;
    }, position);
    await expect
      .poll(() =>
        footer.evaluate((element) => {
          let ancestor = element.parentElement;
          while (
            ancestor &&
            !(/auto|scroll/.test(getComputedStyle(ancestor).overflowY) && ancestor.scrollHeight > ancestor.clientHeight)
          )
            ancestor = ancestor.parentElement;
          if (!ancestor) return false;
          const box = element.getBoundingClientRect();
          const viewport = ancestor.getBoundingClientRect();
          return Math.abs(box.bottom - Math.min(viewport.bottom, window.innerHeight)) < 2 && box.top >= viewport.top;
        })
      )
      .toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath('sticky-footer-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 800 });
  await expect(footer).toHaveCSS('position', 'static');
});

test('alternate savings result types are labeled and selected consistently', async ({ page }) => {
  const { requests } = await contracts(page, { alternateSavingsType: true });
  await page.locator('input[formcontrolname="search"]').fill('TEST-0077');
  const option = page.getByRole('option', { name: /Alex Test/ });
  await expect(option).toContainText('Savings Account');
  await expect(option).toContainText('77');
  await option.click();
  await expect(next(page)).toBeEnabled();
  expect(requests).toContain('/savingsaccounts/77');
});

test('optional pending details do not block a list-backed destination', async ({ page }) => {
  const { releaseDetailsResponse, detailsRequested, writes } = await contracts(page, { holdDetails: true });
  try {
    await chooseCustomer(page);
    await page.getByRole('radio', { name: /Everyday Savings/ }).check();
    await detailsRequested;
    await expect(next(page)).toBeEnabled();
    await expect(page.locator('.account-details')).toContainText('Loading account details');
    await next(page).click();
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Deposit Details');
    expect(writes).toEqual([]);
  } finally {
    releaseDetailsResponse();
  }
});

test('the successful deposit stub accepts only POST', async ({ page }) => {
  await contracts(page, { completeDeposit: true });
  for (const method of [
    'PUT',
    'POST'
  ]) {
    const status = await page.evaluate(async (requestMethod) => {
      const response = await fetch('/fineract-provider/api/v1/savingsaccounts/77/transactions?command=deposit', {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      return response.status;
    }, method);
    expect(status).toBe(method === 'POST' ? 200 : 409);
  }
});

test('a Preview deposit failure renders one inline live alert', async ({ page }) => {
  await contracts(page, { completeDeposit: true, depositError: true });
  await chooseCustomer(page);
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await page.locator('input[formcontrolname="transactionAmount"]').fill('50');
  await page.locator('input[formcontrolname="denomination"]').fill('25');
  await page.locator('input[formcontrolname="quantity"]').fill('2');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  const alerts = page.locator('mifosx-base-teller-savings-account-deposit [role="alert"]');
  await expect(alerts).toHaveCount(1);
  await expect(alerts).toHaveText('Synthetic deposit rejected');
});
