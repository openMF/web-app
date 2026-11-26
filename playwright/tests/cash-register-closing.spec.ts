/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { expect, test, Page } from '@playwright/test';

// Synthetic HTTP responses: no browser test sends financial commands to a live backend.
let state: Record<string, unknown>;
let posts: unknown[];
let failRefresh: boolean;
let failPost: boolean;
let incompleteReceipt: boolean;
const closingPath = '/#/organization/base-teller/cash-register-closing';
const receipt = () => ({
  ...state,
  id: 7,
  reference: 'CCR-SYNTHETIC-7',
  status: 'COMPLETED',
  cashTotal: 100,
  checkTotal: 0,
  actualAmount: 100,
  difference: 0,
  differenceType: 'BALANCED',
  authorizedBy: 5,
  authorizedByUsername: 'Synthetic authorizer',
  authorizedOn: '2026-11-26T10:00:00Z',
  denominations: [],
  checks: []
});

test.beforeEach(async ({ page }) => {
  posts = [];
  failRefresh = false;
  failPost = false;
  incompleteReceipt = false;
  state = {
    businessDate: '2026-11-26',
    officeId: 1,
    officeName: 'Synthetic Office',
    tellerId: 2,
    tellerName: 'Main Teller',
    cashierId: 3,
    cashierName: 'Synthetic Cashier',
    currencyCode: 'USD',
    openingBalance: 100,
    cashInflows: 0,
    cashOutflows: 0,
    previousSettlements: 0,
    expectedAmount: 100,
    eligibleChecks: [],
    status: 'OPEN',
    registerStatus: 'OPEN'
  };
  await page.context().addInitScript(() => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-key',
        permissions: ['ALL_FUNCTIONS'],
        roles: [],
        userId: 1493,
        username: 'Synthetic tester',
        officeId: 1,
        officeName: 'Synthetic Office',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    localStorage.setItem('mifosXServerDate', '2026-11-26');
  });
  await page
    .context()
    .route('**/assets/env.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: 'window.env = { productionModeEnableRBAC: true };' })
    );
  await page.context().route('**/fineract-provider/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (path.endsWith('/closings/context')) {
      if (failRefresh) await route.fulfill({ status: 503, json: { errors: [] } });
      else await route.fulfill({ json: state });
    } else if (path.endsWith('/closings') && req.method() === 'POST') {
      posts.push(req.postDataJSON());
      if (failPost) await route.abort('failed');
      else if (incompleteReceipt) await route.fulfill({ json: { ...receipt(), status: 'OPEN' } });
      else {
        state = { ...state, status: 'COMPLETED', registerStatus: 'COMPLETED', closingId: 7 };
        await route.fulfill({ json: receipt() });
      }
    } else if (path.endsWith('/closings/7')) await route.fulfill({ json: receipt() });
    else if (path.endsWith('/tellers/2/cashiers'))
      await route.fulfill({ json: [{ id: 3, staffName: 'Synthetic Cashier' }] });
    else if (path.endsWith('/tellers')) await route.fulfill({ json: [{ id: 2, name: 'Main Teller' }] });
    else if (path.endsWith('/currencies'))
      await route.fulfill({
        json: {
          selectedCurrencyOptions: [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' }
          ]
        }
      });
    else if (path.includes('/configurations')) await route.fulfill({ json: { enabled: false, value: 0 } });
    else if (path.includes('/actuator/')) await route.fulfill({ json: { status: 'UP' } });
    else await route.fulfill({ json: [] });
  });
});
async function load(page: Page) {
  await page.goto(closingPath);
  await page.locator('mat-select[formcontrolname="tellerId"]').click();
  await page.getByRole('option', { name: 'Main Teller' }).click();
  await page.locator('mat-select[formcontrolname="cashierId"]').click();
  await page.getByRole('option', { name: 'Synthetic Cashier' }).click();
  await page.locator('mat-select[formcontrolname="currencyCode"]').click();
  await page.getByRole('option', { name: 'USD - US Dollar' }).click();
  const response = page.waitForResponse((r) => r.url().includes('/closings/context'));
  await page.getByRole('button', { name: 'Load', exact: true }).click();
  await response;
}
async function declare(page: Page) {
  await page.locator('input[formcontrolname="value"]').fill('1');
  await page.locator('input[formcontrolname="quantity"]').fill('100');
}
async function confirm(page: Page) {
  await page.getByRole('button', { name: 'Finalize Closing', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
}

test('shows unopened status, locks controls and never dispatches a financial POST', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 2200 });
  state.registerStatus = 'NOT_OPENED';
  state.openingBalance = 0;
  state.expectedAmount = 0;
  await load(page);
  await expect(page.locator('.register-status')).toHaveText('infoNot Opened');
  await expect(
    page.getByText('This cash register has not been opened. Open the cash register before attempting to close it.')
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalize Closing', exact: true })).toBeDisabled();
  await expect(page.locator('input[formcontrolname="value"]')).not.toBeEditable();
  expect(posts).toEqual([]);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  });
  await page.screenshot({ path: info.outputPath('after-not-opened.png'), fullPage: true });
});
test('cancellation sends no POST and success shows a persistent receipt and closed status', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 2600 });
  await load(page);
  await declare(page);
  await page.getByRole('button', { name: 'Finalize Closing', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(posts).toEqual([]);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  });
  await page.screenshot({ path: info.outputPath('after-open.png'), fullPage: true });
  const posted = page.waitForResponse((r) => r.url().endsWith('/closings') && r.request().method() === 'POST');
  await confirm(page);
  await posted;
  await expect(page.locator('.register-status')).toContainText('Closed');
  await expect(page.getByText('CCR-SYNTHETIC-7', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalize Closing', exact: true })).toBeDisabled();
  expect(posts).toHaveLength(1);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  });
  await page.screenshot({ path: info.outputPath('after-closed.png'), fullPage: true });
  await load(page);
  await expect(page.locator('.register-status')).toContainText('Closed');
  await expect(page.getByText('CCR-SYNTHETIC-7', { exact: true })).toBeVisible();
  expect(posts).toHaveLength(1);
});
test('rejects a closing if another operator changes eligibility during confirmation', async ({ page }) => {
  await load(page);
  await declare(page);
  await page.getByRole('button', { name: 'Finalize Closing', exact: true }).click();
  state.registerStatus = 'NOT_OPENED';
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(
    page.getByText('The register or financial position changed. Review the updated context before closing.')
  ).toBeVisible();
  expect(posts).toEqual([]);
});
test('unknown status fails closed', async ({ page }) => {
  delete state.registerStatus;
  await load(page);
  await expect(page.locator('.register-status')).toContainText('Status Unavailable');
  await expect(page.getByRole('button', { name: 'Finalize Closing', exact: true })).toBeDisabled();
  expect(posts).toEqual([]);
});
test('Retry reloads a mismatched context and disappears after recovery', async ({ page }) => {
  state.cashierId = 99;
  await load(page);
  const alert = page.locator('.message.error[role="alert"]');
  await expect(alert).toContainText('The register status could not be verified. Load the context again.');
  const retry = alert.getByRole('button', { name: 'Retry', exact: true });
  await expect(retry).toBeEnabled();
  state.cashierId = 3;
  const response = page.waitForResponse((r) => r.url().includes('/closings/context'));

  await retry.click();
  await response;

  await expect(page.locator('.register-status')).toContainText('Open');
  await expect(alert).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  expect(posts).toEqual([]);
});
test('uncertain POST remains locked across status checks and page reload', async ({ page }) => {
  failPost = true;
  await load(page);
  await declare(page);
  await confirm(page);
  await expect(page.getByText(/The closing outcome is unresolved/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalize Closing', exact: true })).toBeDisabled();
  const statusResponse = page.waitForResponse((r) => r.url().includes('/closings/context'));
  await page.getByRole('button', { name: 'Check Closing Status' }).click();
  await statusResponse;
  expect(posts).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Check Closing Status' })).toBeVisible();
  expect(posts).toHaveLength(1);
});
test('confirmed receipt survives a failed context refresh', async ({ page }) => {
  await load(page);
  await declare(page);
  await page.context().route('**/closings', async (route) => {
    posts.push(route.request().postDataJSON());
    failRefresh = true;
    await route.fulfill({ json: receipt() });
  });
  await confirm(page);
  await expect(page.getByText('CCR-SYNTHETIC-7', { exact: true })).toBeVisible();
  await expect(page.locator('.register-status')).toContainText('Closed');
  await expect(
    page.getByText('The completed receipt is preserved, but the status refresh failed. Check the status again.')
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalize Closing', exact: true })).toHaveCount(0);
});
test('non-completed receipt never displays false success', async ({ page }) => {
  incompleteReceipt = true;
  await load(page);
  await declare(page);
  await confirm(page);
  await expect(page.getByText(/The closing outcome is unresolved/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  await expect(page.getByText('CCR-SYNTHETIC-7', { exact: true })).toHaveCount(0);
  await expect(page.locator('.register-status')).not.toContainText('Closed');
  expect(posts).toHaveLength(1);
});
test('mobile status remains accessible without horizontal overflow', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  state.registerStatus = 'NOT_OPENED';
  await load(page);
  await expect(page.locator('.register-status')).toContainText('Not Opened');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  });
  await page.screenshot({ path: info.outputPath('after-mobile.png'), fullPage: true });
});

test('a second browser tab cannot submit after another tab completes closing', async ({ page, context }) => {
  await load(page);
  await declare(page);
  const second = await context.newPage();
  await load(second);
  await declare(second);
  await second.getByRole('button', { name: 'Finalize Closing', exact: true }).click();
  await confirm(page);
  await expect(page.locator('.register-status')).toContainText('Closed');
  await second.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(second.locator('.register-status')).toContainText('Closed');
  expect(posts).toHaveLength(1);
});

test('keyboard confirmation and rapid clicks dispatch one command', async ({ page }) => {
  await load(page);
  await declare(page);
  const finalize = page.getByRole('button', { name: 'Finalize Closing', exact: true });
  await finalize.click({ clickCount: 2 });
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('button', { name: 'Confirm', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.register-status')).toContainText('Closed');
  expect(posts).toHaveLength(1);
});

test('status and explanatory text stay visible in the dark theme', async ({ page }, info) => {
  state.registerStatus = 'NOT_OPENED';
  await load(page);
  await page.evaluate(() => document.body.classList.add('dark-theme'));
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  });
  await expect(page.locator('.register-status')).toContainText('Not Opened');
  await page.screenshot({ path: info.outputPath('after-dark.png'), fullPage: true });
});
