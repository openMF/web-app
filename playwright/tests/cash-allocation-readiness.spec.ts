/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect } from '@playwright/test';

// Synthetic HTTP contracts only; these tests never post financial transactions to a backend.
test.use({ storageState: { cookies: [], origins: [] }, launchOptions: { slowMo: 0 } });
const mxn = { code: 'MXN', name: 'Mexican Peso', decimalPlaces: 2, denominations: [] as object[] };
const unit = { identifier: 'synthetic-mxn-unit', type: 'COIN', value: '1.000000', quantity: 0, subtotal: '0' };
let catalog: object[];
let posts: string[];
let contextCalls: number;
let requestKeys: string[];
let failCreate: boolean;
let businessDate: string;
let createErrorCode: string;

test.beforeEach(async ({ page }) => {
  catalog = [];
  posts = [];
  requestKeys = [];
  contextCalls = 0;
  failCreate = false;
  businessDate = '2026-11-20';
  createErrorCode = 'drawer.already.opened';
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'mifosXCredentials',
      JSON.stringify({
        authenticated: true,
        base64EncodedAuthenticationKey: 'synthetic-test-key',
        permissions: ['ALL_FUNCTIONS'],
        roles: [],
        userId: 1453,
        username: 'Synthetic tester',
        officeId: 1,
        officeName: 'Synthetic office',
        shouldRenewPassword: false
      })
    );
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/cash-allocations/context')) {
      contextCalls++;
      // The initial list has no catalog; only the selected response supplies authoritative rows.
      const currencies = [{ ...mxn, denominations: url.searchParams.has('currencyCode') ? catalog : [] }];
      await route.fulfill({
        json: {
          businessDate,
          officeId: 1,
          officeName: 'Synthetic office',
          currencyCode: url.searchParams.get('currencyCode'),
          vaultBalance: '0.00',
          currencies,
          cashiers: []
        }
      });
      return;
    }
    if (request.method() === 'POST' && url.pathname.includes('/cash-allocations')) {
      posts.push(url.pathname);
      const body = request.postDataJSON();
      if (url.pathname.endsWith('/preview')) {
        await route.fulfill({
          json: {
            ...body,
            source: 'Opening contra',
            destination: 'Synthetic vault',
            cashInflow: body.amount,
            cashOutflow: body.amount,
            authoritativeTotal: body.amount,
            checksInflow: '0',
            checksOutflow: '0',
            vouchersInflow: '0',
            vouchersOutflow: '0'
          }
        });
      } else {
        requestKeys.push(body.idempotencyKey);
        if (failCreate) await route.abort('failed');
        else
          await route.fulfill({
            status: 403,
            json: {
              errors: [
                {
                  userMessageGlobalisationCode: 'error.msg.base.teller.cash.allocation.' + createErrorCode,
                  developerMessage: 'SQL private database detail',
                  defaultUserMessage: 'SQL private database detail'
                }
              ]
            }
          });
      }
      return;
    }
    if (url.pathname.includes('/configurations')) await route.fulfill({ json: { value: 0, enabled: false } });
    else if (url.pathname.includes('/actuator/')) await route.fulfill({ json: { status: 'UP' } });
    else await route.fulfill({ json: [] });
  });
});

test('explains missing MXN denominations on mobile and sends no financial POST', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/organization/base-teller/cash-allocations');
  await expect(page.getByText('No active denominations are configured for this currency')).toBeVisible();
  await expect(page.getByText(/Ask an authorized administrator to configure the denomination catalog/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  expect(posts).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page
    .getByText(/Ask an authorized administrator to configure the denomination catalog/)
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('missing-denominations-mobile.png'), fullPage: true });
});

test('renders the selected-response catalog and preserves explicit confirmation and cancellation', async ({
  page
}, testInfo) => {
  catalog = [unit];
  await page.goto('/#/organization/base-teller/cash-allocations');
  await page.locator('input[formcontrolname="quantity"]').fill('3');
  await expect(page.getByText('3.00 MXN', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Preview Transaction' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(contextCalls).toBe(2);
  expect(posts).toHaveLength(1);
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('configured-denominations.png'), fullPage: true });
});

test('renders decimal quantity validation without crashing and keeps preview disabled', async ({ page }) => {
  catalog = [unit];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#/organization/base-teller/cash-allocations');
  const quantity = page.locator('input[formcontrolname="quantity"]');
  await quantity.fill('1.5');
  await quantity.blur();
  await expect(page.getByText('Enter a whole number of items')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  expect(posts).toEqual([]);
  expect(errors).toEqual([]);
});

test('preserves the duplicate-opening guard and displays a safe localized error', async ({ page }) => {
  catalog = [unit];
  await page.goto('/#/organization/base-teller/cash-allocations');
  await page.locator('input[formcontrolname="quantity"]').fill('1');
  await page.getByRole('button', { name: 'Preview Transaction' }).click();
  await page.getByRole('button', { name: 'Confirm and Post' }).click();
  await expect(page.locator('mifosx-cash-allocation [role="alert"]')).toContainText('Opening is already completed');
  await expect(page.getByText('SQL private database detail', { exact: false })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cash Allocation Receipt' })).not.toBeVisible();
  expect(requestKeys).toHaveLength(1);
});

test('locks edits after an uncertain create and retries with the original idempotency key', async ({ page }) => {
  catalog = [unit];
  failCreate = true;
  await page.goto('/#/organization/base-teller/cash-allocations');
  await page.locator('input[formcontrolname="quantity"]').fill('1');
  await page.getByRole('button', { name: 'Preview Transaction' }).click();
  await page.getByRole('button', { name: 'Confirm and Post' }).click();
  await expect(page.getByText(/The transaction outcome is unresolved/)).toBeVisible();
  await expect(page.locator('input[formcontrolname="quantity"]')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  await page.getByRole('button', { name: 'Retry Same Transaction' }).click();
  await expect.poll(() => requestKeys.length).toBe(2);
  expect(requestKeys[1]).toBe(requestKeys[0]);
  await page.reload();
  await expect(page.locator('input[formcontrolname="quantity"]')).toBeDisabled();
  await page.getByRole('button', { name: 'Retry Same Transaction' }).click();
  await expect.poll(() => requestKeys.length).toBe(3);
  expect(requestKeys[2]).toBe(requestKeys[0]);
  expect(posts.filter((path) => path.endsWith('/preview'))).toHaveLength(1);
});

test('offers a reachable retry after context retrieval fails', async ({ page }) => {
  catalog = [unit];
  let fail = true;
  await page.route('**/cash-allocations/context**', async (route) => {
    if (fail) {
      fail = false;
      await route.fulfill({ status: 500, json: { developerMessage: 'Private context details' } });
    } else await route.fallback();
  });
  await page.goto('/#/organization/base-teller/cash-allocations');
  await expect(page.locator('mifosx-cash-allocation [role="alert"]')).toBeVisible();
  await expect(page.locator('input[formcontrolname="quantity"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('input[formcontrolname="quantity"]')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  expect(posts).toEqual([]);
});

test('refreshes a newly configured single-currency catalog without reloading the page', async ({ page }) => {
  await page.goto('/#/organization/base-teller/cash-allocations');
  await expect(page.getByTestId('cash-allocation-denominations-retry')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  catalog = [unit];
  await page.getByTestId('cash-allocation-denominations-retry').click();
  await expect(page.locator('input[formcontrolname="quantity"]')).toHaveValue('0');
  await page.locator('input[formcontrolname="quantity"]').fill('1');
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeEnabled();
  expect(posts).toEqual([]);
});

test('can supersede a slow currency request using the still-mounted selector', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const jpy = { code: 'JPY', name: 'Yen', decimalPlaces: 0, denominations: [unit] };
  await page.route('**/cash-allocations/context**', async (route) => {
    const code = new URL(route.request().url()).searchParams.get('currencyCode');
    if (code === 'JPY') await gate;
    await route
      .fulfill({
        json: {
          businessDate: '2026-11-20',
          officeId: 1,
          officeName: 'Synthetic office',
          currencyCode: code,
          vaultBalance: code === 'JPY' ? '99' : '7.00',
          cashiers: [],
          currencies: code === 'JPY' ? [jpy] : code === 'MXN' ? [{ ...mxn, denominations: [unit] }] : [
                    mxn,
                    jpy
                  ]
        }
      })
      .catch(() => undefined); // The superseded request is deliberately cancelled by the component.
  });
  try {
    await page.goto('/#/organization/base-teller/cash-allocations');
    await expect(page.locator('input[formcontrolname="quantity"]')).toBeVisible();
    const selector = page.locator('mat-select[formcontrolname="currencyCode"]');
    const element = await selector.elementHandle();
    await selector.click();
    await page.getByRole('option', { name: 'JPY — Yen', exact: true }).click();
    await expect(page.getByText('Loading cash allocation configuration...')).toBeVisible();
    expect(await element!.evaluate((node) => node.isConnected)).toBe(true);
    await expect(page.locator('.context-summary')).toHaveCount(0);
    await expect(page.locator('input[formcontrolname="quantity"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
    await selector.click();
    await page.getByRole('option', { name: 'MXN — Mexican Peso', exact: true }).click();
    await expect(page.locator('input[formcontrolname="quantity"]')).toBeVisible();
    release();
    await expect(selector).toContainText('MXN');
    await expect(page.locator('.context-summary')).toContainText('7.00 MXN');
    expect(posts).toEqual([]);
  } finally {
    release();
  }
});

test('can select another currency after the selected currency fails to load', async ({ page }) => {
  const jpy = { code: 'JPY', name: 'Yen', decimalPlaces: 0, denominations: [] };
  await page.route('**/cash-allocations/context**', async (route) => {
    const code = new URL(route.request().url()).searchParams.get('currencyCode');
    if (code === 'JPY') {
      await route.fulfill({ status: 500, json: {} });
      return;
    }
    await route.fulfill({
      json: {
        businessDate: '2026-11-20',
        officeId: 1,
        officeName: 'Synthetic office',
        currencyCode: code,
        vaultBalance: '7.00',
        cashiers: [],
        currencies: code ? [{ ...mxn, denominations: [unit] }] : [
              mxn,
              jpy
            ]
      }
    });
  });
  await page.goto('/#/organization/base-teller/cash-allocations');
  await expect(page.locator('input[formcontrolname="quantity"]')).toBeVisible();
  const selector = page.locator('mat-select[formcontrolname="currencyCode"]');
  await selector.click();
  await page.getByRole('option', { name: 'JPY — Yen', exact: true }).click();
  await expect(page.getByTestId('cash-allocation-context-retry')).toBeVisible();
  await expect(selector).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  await selector.click();
  await page.getByRole('option', { name: 'MXN — Mexican Peso', exact: true }).click();
  await expect(page.locator('input[formcontrolname="quantity"]')).toHaveValue('0');
  expect(posts).toEqual([]);
});

test('can explicitly discard a restored previous-day request after a rejected retry', async ({ page }) => {
  catalog = [unit];
  failCreate = true;
  await page.goto('/#/organization/base-teller/cash-allocations');
  await page.locator('input[formcontrolname="quantity"]').fill('1');
  await page.getByRole('button', { name: 'Preview Transaction' }).click();
  await page.getByRole('button', { name: 'Confirm and Post', exact: true }).click();
  await expect(page.getByTestId('cash-allocation-discard-recovery')).toBeVisible();
  businessDate = '2026-11-21';
  failCreate = false;
  createErrorCode = 'business.date.invalid';
  await page.reload();
  await expect(page.getByTestId('cash-allocation-recovery-warning')).toContainText('different business date');
  await page.getByRole('button', { name: 'Retry Same Transaction' }).click();
  await expect.poll(() => requestKeys.length).toBe(2);
  expect(requestKeys[0]).toBe(requestKeys[1]);
  await page.getByTestId('cash-allocation-discard-recovery').click();
  await expect(page.getByRole('dialog')).toContainText('earlier request may already have posted');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('input[formcontrolname="quantity"]')).toBeDisabled();
  await page.getByTestId('cash-allocation-discard-recovery').click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('input[formcontrolname="quantity"]')).toBeEnabled();
  await expect(page.locator('input[formcontrolname="quantity"]')).toHaveValue('0');
  await expect(page.locator('.context-summary')).toContainText('2026-11-21');
  await expect(page.getByRole('button', { name: 'Preview Transaction' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Retry Same Transaction' })).toHaveCount(0);
  expect(requestKeys).toHaveLength(2);
  expect(await page.evaluate(() => Object.keys(sessionStorage).some((key) => key.startsWith('cash-allocation:')))).toBe(
    false
  );
});
