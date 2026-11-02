/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';
import { mkdir } from 'node:fs/promises';

const route = '/#/products/saving-products';
const artifacts = 'artifacts/WEB-1350-FE01';

// Run explicitly with playwright.be01.config.ts against a provisioned BE-01 backend.
// Read-only: policy/configuration responses are never fabricated.
test.describe('Unified savings product catalog (BE-01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('mifosx-saving-products mat-progress-bar')).toBeHidden();
    await expect(page.getByRole('table', { name: 'Savings Products', exact: true })).toBeVisible();
  });

  test('real catalog supports search, each classification, legacy and existing navigation', async ({ page }) => {
    await mkdir(artifacts, { recursive: true });
    const table = page.locator('mifosx-saving-products table');
    const rows = table.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const name = await rows.first().locator('td').first().innerText();
    const view = rows.first().getByRole('link', { name: `View product: ${name}` });
    const href = await view.getAttribute('href');
    expect(href).toMatch(/saving-products\/\d+$/);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: `${artifacts}/product-list-desktop.png`, fullPage: true });

    const search = page.getByRole('searchbox', { name: 'Search by product name' });
    await search.fill(`  ${name.toUpperCase()}  `);
    await expect(rows.first().locator('td').first()).toHaveText(name);
    await page.screenshot({ path: `${artifacts}/product-list-search.png`, fullPage: true });
    await search.fill('WEB1350-NO-SUCH-PRODUCT-999999');
    await expect(page.getByText('No products match your search and classification.')).toBeVisible();
    await page.screenshot({ path: `${artifacts}/product-list-empty-state.png`, fullPage: true });
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();

    for (const label of [
      'Sight',
      'Interest-bearing Sight',
      'Savings',
      'Legacy / unclassified'
    ]) {
      await page.getByRole('combobox', { name: 'Accounting classification' }).click();
      await page.getByRole('option', { name: label, exact: true }).click();
      await expect(rows.first()).toBeVisible();
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (const cell of await rows.locator('td.mat-column-classification').all()) {
        await expect(cell.locator('.classification')).toHaveText(label);
      }
      const matchingName = await rows.first().locator('td').first().innerText();
      await search.fill(matchingName.toLowerCase());
      await expect(rows.first().locator('td').first()).toHaveText(matchingName);
      await search.fill('');
      if (label === 'Sight')
        await page.screenshot({ path: `${artifacts}/product-list-classification-filter.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    await page.goto(href!);
    await expect(page).toHaveURL(/saving-products\/\d+\/general/);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
    await page.goto(route);
    await expect(rows.first()).toBeVisible();
    await rows
      .first()
      .getByRole('link', { name: /^Edit product:/ })
      .click();
    await expect(page).toHaveURL(/saving-products\/\d+\/edit/);
    await expect(page.locator('mifosx-edit-saving-product')).toBeVisible();
  });

  test('responsive layouts retain reachable controls and product actions', async ({ page }) => {
    for (const width of [
      1920,
      1366,
      768,
      390
    ]) {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 768 });
      // Reload at the device size so the existing shell initializes its mobile drawer closed.
      await page.reload();
      await expect(page.locator('mifosx-saving-products tbody tr').first()).toBeVisible();
      await expect(page.getByRole('searchbox', { name: 'Search by product name' })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Accounting classification' })).toBeVisible();
      await expect(page.getByRole('link', { name: /^View product:/ }).first()).toBeVisible();
      const overflow = await page
        .locator('mifosx-saving-products')
        .evaluate((element) => element.scrollWidth > element.clientWidth);
      expect(overflow).toBe(false);
      const tableOverflow = await page
        .locator('.table-container')
        .evaluate((element) => element.scrollWidth > element.clientWidth);
      expect(tableOverflow).toBe(false);
      await page.getByRole('searchbox', { name: 'Search by product name' }).focus();

      await page.screenshot({
        path: `${artifacts}/product-list-${width === 390 ? 'mobile' : width}.png`,
        fullPage: true
      });
    }
  });

  test('mobile actions and keyboard controls work; dark theme retains content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const search = page.getByRole('searchbox', { name: 'Search by product name' });
    await search.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Accounting classification' })).toBeFocused();
    const action = page.getByRole('link', { name: /^View product:/ }).first();
    await action.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${artifacts}/product-list-mobile-actions.png`, fullPage: true });
    await action.click();
    await expect(page).toHaveURL(/saving-products\/\d+\/general/);
    await page.goto(route);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.reload();
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('mifosx-saving-products tbody tr').first()).toBeVisible();
    await page.screenshot({ path: `${artifacts}/product-list-dark.png`, fullPage: true });
  });

  test('controlled metadata and catalog failures are explicit and retry restores real data', async ({ page }) => {
    const policies = '**/savingsproducts/policy/template';
    await page.route(policies, (request) => request.fulfill({ status: 503, body: '{}' }));
    await page.reload();
    await expect(page.getByText('Some unified policy metadata is unavailable.', { exact: false })).toBeVisible();
    await expect(page.locator('td .classification').first()).toHaveText('Classification unavailable');
    await page.screenshot({ path: `${artifacts}/product-list-metadata-error.png`, fullPage: true });
    await page.unroute(policies);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.locator('td .classification').first()).not.toHaveText('Classification unavailable');
    await page.route(policies, (request) => request.fulfill({ status: 403, body: '{}' }));
    await page.reload();
    await expect(
      page.getByText('You are not authorized to read unified policy metadata.', { exact: false })
    ).toBeVisible();
    await page.unroute(policies);
    const catalog = '**/api/v1/savingsproducts';
    await page.route(catalog, (request) => request.fulfill({ status: 503, body: '{}' }));
    await page.reload();
    await expect(page.getByRole('alert').filter({ hasText: 'Savings products could not be loaded.' })).toBeVisible();
    await page.unroute(catalog);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.locator('mifosx-saving-products tbody tr').first()).toBeVisible();
  });
});
