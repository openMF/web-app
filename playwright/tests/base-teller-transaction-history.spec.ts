/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, test } from '../fixtures/auth-session';

test.describe('WEB-1256 Base Teller transaction history', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => undefined;
    });
  });

  test('navigates from Base Teller and completes the real history workflow', async ({ page }) => {
    await page.goto('/#/organization/base-teller');
    const historyLink = page.locator('a[href="#/organization/base-teller/transaction-history"]');
    await expect(historyLink).toBeVisible();

    const contextResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/v2/base-teller/transaction-history/context')
    );
    const searchResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/v2/base-teller/transaction-history?') && !response.url().includes('/report')
    );
    await historyLink.click();
    const [
      contextResponse,
      initialSearch
    ] = await Promise.all([
      contextResponsePromise,
      searchResponsePromise
    ]);
    test.skip(
      contextResponse.status() !== 200 || initialSearch.status() !== 200,
      `Savings Plugin transaction history API is unavailable (context: ${contextResponse.status()}, search: ${initialSearch.status()})`
    );
    const initialBody = await initialSearch.json();

    await expect(page).toHaveURL(/organization\/base-teller\/transaction-history/);
    await expect(page.locator('mifosx-transaction-history')).toBeVisible();
    await expect(page.locator('table').first().locator('tbody tr')).toHaveCount(initialBody.items.length);
    await expect(page.getByText('EUR', { exact: true }).first()).toBeVisible();

    await page.locator('input[formcontrolname="fromDate"]').fill('03 October 2026');
    await page.locator('input[formcontrolname="toDate"]').fill('03 October 2026');
    for (const [
      control,
      option
    ] of [
      [
        'tellerId',
        'mifos - Cashier, WEB1233'
      ],
      [
        'currencyCode',
        'EUR - Euro'
      ],
      [
        'status',
        'Completed'
      ],
      [
        'type',
        'Cash'
      ],
      [
        'operation',
        'Pay Service'
      ],
      [
        'concept',
        'Demo water verification'
      ]
    ]) {
      await page.locator(`mat-select[formcontrolname="${control}"]`).click();
      await page.getByRole('option', { name: option, exact: true }).click();
    }
    await page.locator('input[formcontrolname="reference"]').fill('9E08ADDB57F9');

    const filteredResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname.endsWith('/v2/base-teller/transaction-history') &&
        url.searchParams.get('fromDate') === '2026-10-03' &&
        url.searchParams.get('toDate') === '2026-10-03' &&
        url.searchParams.get('tellerId') === '1' &&
        url.searchParams.get('currencyCode') === 'EUR' &&
        url.searchParams.get('status') === 'COMPLETED' &&
        url.searchParams.get('type') === 'CASH' &&
        url.searchParams.get('operation') === 'PAY_SERVICE' &&
        url.searchParams.get('concept') === 'Demo Water Verification' &&
        url.searchParams.get('reference') === '9E08ADDB57F9' &&
        response.status() === 200
      );
    });
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const filteredBody = await (await filteredResponse).json();
    expect(filteredBody.totalFilteredRecords).toBe(1);
    await expect(page.getByText('SP-2026-10-03-9E08ADDB57F9')).toBeVisible();

    const detailResponse = page.waitForResponse(
      (response) => /transaction-history\/SERVICE_PAYMENT(?::|%3A)2$/.test(response.url()) && response.status() === 200
    );
    await page.getByRole('button', { name: 'View Details' }).click();
    const detailBody = await (await detailResponse).json();
    expect(detailBody.historyId).toBe('SERVICE_PAYMENT:2');
    await expect(page.getByText('Nathan Kim')).toBeVisible();

    const denominationsResponse = page.waitForResponse(
      (response) => response.url().endsWith('/denominations') && response.status() === 200
    );
    await page.getByRole('button', { name: 'Denomination Details' }).click();
    const denominationBody = await (await denominationsResponse).json();
    expect(denominationBody.operationDenominations[0].quantity).toBe(1);
    await expect(page.getByText('EUR-20')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Change Given' })).toBeVisible();

    const receiptResponse = page.waitForResponse(
      (response) => response.url().endsWith('/receipt') && response.status() === 200
    );
    await page.getByRole('button', { name: 'Reprint Receipt' }).click();
    const receiptBody = await (await receiptResponse).json();
    expect(receiptBody.historyId).toBe('SERVICE_PAYMENT:2');
    expect(receiptBody.receipt.receiptNumber).toBe('SP-2026-10-03-9E08ADDB57F9');

    const reportResponse = page.waitForResponse(
      (response) => response.url().includes('/transaction-history/report') && response.status() === 200
    );
    await page.getByRole('button', { name: 'Print Results' }).click();
    const reportBody = await (await reportResponse).json();
    expect(reportBody.totalFilteredRecords).toBe(1);
    expect(reportBody.items).toHaveLength(1);
  });
});
