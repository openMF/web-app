/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import { investmentBackend, investmentSession } from '../fixtures/investment-products';
import { rateFixture } from '../../src/app/products/investment-products/investment-product.fixtures';
const root = '/#/products/investment-products';
test.describe('Investment Products — mocked backend contracts', () => {
  test('navigation, verified classifications, and unconfigured policy action', async ({ page }) => {
    await investmentSession(page);
    await investmentBackend(page);
    await page.goto('/#/products');
    await page.getByRole('link', { name: 'Investment Products', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Investment Products', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Promissory Note (Pagaré)', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CEDE — Total Investment +60', exact: true })).toBeVisible();
    await page
      .getByRole('row')
      .filter({ hasText: 'Synthetic unconfigured native product' })
      .getByRole('link', { name: 'View' })
      .click();
    await expect(page.getByText('No investment policy', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Investment Configuration', exact: true }).last().click();
    await expect(page).toHaveURL(/investment-products\/43\/edit$/);
  });
  test('validates and saves a policy draft through BE01 without changing native product', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    await page.goto(root + '/41/edit');
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
    await expect(page).toHaveURL(/investment-products\/41$/);
    expect(backend.writes.map((write) => write.path)).toEqual([
      '/investment-products/configuration/41/validate',
      '/investment-products/configuration/41'
    ]);
    await expect(page.getByText('Draft configuration', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/investment/policy-and-accounting.png', fullPage: true });
  });
  test('switches policy products only after confirming discard', async ({ page }) => {
    await investmentSession(page);
    await investmentBackend(page);
    await page.goto(root + '/41/edit');
    const minimum = page.getByLabel('Minimum Term (days)', { exact: true });
    await expect(minimum).toHaveValue('1');
    await minimum.fill('2');

    const dialog = page.getByRole('dialog');
    await page.goto(root + '/42/edit');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/investment-products\/41\/edit$/);
    await expect(minimum).toHaveValue('2');

    await page.goto(root + '/42/edit');
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page).toHaveURL(/investment-products\/42\/edit$/);
    await expect(minimum).toHaveValue('60');
    await expect(page.getByRole('link', { name: 'Interest Rate Matrix', exact: true })).toHaveAttribute(
      'href',
      /investment-products\/42\/rates$/
    );
  });
  test('waits for an in-flight rate validation before switching products', async ({ page }) => {
    await investmentSession(page);
    await investmentBackend(page);
    let finishValidation!: () => void;
    const pending = new Promise<void>((resolve) => {
      finishValidation = resolve;
    });
    await page.route('**/investment-products/41/rates/validate', async (route) => {
      await pending;
      await route.fallback();
    });
    await page.goto(root + '/41/rates');
    const validate = page.getByRole('button', { name: 'Validate', exact: true });
    await validate.click();
    try {
      await expect(validate).toBeDisabled();
      await page.goto(root + '/42/rates');
      await expect(page).toHaveURL(/investment-products\/41\/rates$/);
    } finally {
      finishValidation();
    }
    await expect(page.getByText(/Backend validation completed/)).toBeVisible();

    const loaded = page.waitForResponse((response) => response.url().endsWith('/investment-products/42/rates/draft'));
    await page.goto(root + '/42/rates');
    expect((await loaded).status()).toBe(200);
    await expect(page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Investment Configuration', exact: true })).toHaveAttribute(
      'href',
      /investment-products\/42\/edit$/
    );
  });
  test('edits the matrix, saves a draft, and does not publish', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    await page.goto(root + '/41/rates');
    await page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true }).fill('7.125');
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
    await expect(page.getByText('Draft configuration saved.', { exact: true })).toBeVisible();
    expect(backend.writes.find((write) => write.path.endsWith('/draft'))?.body).toContain('"annualRatePercent":7.125');
    expect(backend.writes.some((write) => write.path.endsWith('/publish'))).toBe(false);
  });
  test('adds and removes amount and term bands with keyboard-editable cells', async ({ page }) => {
    await investmentSession(page);
    await investmentBackend(page);
    await page.goto(root + '/41/rates');
    await page.getByRole('button', { name: 'Add Amount Band', exact: true }).click();
    await page.getByRole('button', { name: 'Add Term Band', exact: true }).click();
    const cell = page.getByLabel('Annual Interest Rate (%) [2, 2]', { exact: true });
    await cell.fill('0.1');
    await expect(cell).toHaveValue('0.1');
    await page.getByRole('button', { name: 'Remove Term Band 2', exact: true }).click();
    await page.getByRole('button', { name: 'Remove Amount Band 2', exact: true }).click();
    await expect(cell).toHaveCount(0);
  });
  test('preserves edits after revision conflicts', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    backend.conflict = true;
    await page.goto(root + '/41/rates');
    await page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true }).fill('7.125');
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Configuration changed');
    await expect(page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true })).toHaveValue('7.125');
    await expect(page.getByRole('button', { name: 'Save Draft', exact: true })).toBeDisabled();
  });
  test('reviews scheduled publication in the tenant timezone and shows backend schedule', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    backend.draft = {
      ...rateFixture,
      configuration: {
        ...rateFixture.configuration,
        effectiveValidity: { mode: 'SCHEDULED', effectiveDate: '2026-12-10' }
      }
    };
    await page.goto(root + '/41/rates');
    await expect(page.getByLabel('Effective Date', { exact: true })).toHaveValue('2026-12-10');
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('00:00');
    await expect(page.getByRole('dialog')).toContainText('America/Mexico_City');
    await page.screenshot({ path: 'test-results/investment/scheduled-publication.png', fullPage: true });
    await page.getByRole('dialog').getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(
      page.getByText('Pricing configuration published. Current rates and history have been refreshed.', { exact: true })
    ).toBeVisible();
    await page.getByRole('combobox', { name: 'Rate & Policy History', exact: true }).click();
    await page.getByRole('option', { name: 'Scheduled Versions', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'Approved — scheduled', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'View', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Matrix Version 1/ })).toBeVisible();
    await page.screenshot({ path: 'test-results/investment/rate-history.png', fullPage: true });
  });
  test('blocks the maker and unsupported campaigns', async ({ page }) => {
    await investmentSession(page, ['ALL_FUNCTIONS'], 1);
    const backend = await investmentBackend(page);
    backend.draft!.blockers = ['CAMPAIGN_APPLICABILITY_AND_PRECEDENCE_UNAPPROVED'];
    await page.goto(root + '/41/rates');
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeDisabled();
    await expect(page.getByText(/latest draft maker cannot publish/)).toBeVisible();
    await expect(page.getByText(/Campaign publication is blocked until applicability/)).toBeVisible();
  });
  test('displays publication business blockers returned with HTTP 422', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    backend.publicationBlockers = ['BUSINESS_DATE_DIFFERS_FROM_TENANT_CALENDAR_DATE'];
    await page.goto(root + '/41/rates');
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Publication is blocked');
    await expect(
      page.getByText('Business date differs from the current tenant calendar date.', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeDisabled();
  });
  test('keeps rate lookup configuration-only', async ({ page }) => {
    await investmentSession(page);
    await investmentBackend(page);
    await page.goto(root + '/41/rates');
    await page.getByLabel('Investment Amount', { exact: true }).fill('1000');
    await page.getByLabel('Days', { exact: true }).fill('60');
    await page.getByRole('button', { name: 'Rate Lookup', exact: true }).click();
    await expect(
      page.getByText('Rate selected from configuration only. Financial execution is not authorized.', { exact: true })
    ).toBeVisible();
    await expect(page.getByText(/Guaranteed Return|Expected Net Profit|Contract Approved/)).toHaveCount(0);
  });
  test('opens rates from the catalog for a rate-only reader', async ({ page }) => {
    await investmentSession(page, [
      'READ_FIXEDDEPOSITPRODUCT',
      'READ_INVESTMENT_RATE'
    ]);
    await investmentBackend(page);
    await page.goto(root);
    const row = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'Synthetic Promissory Note', exact: true }) });
    await row.getByRole('link', { name: 'View', exact: true }).click();
    await expect(page).toHaveURL(/investment-products\/41\/rates$/);
    await expect(page.getByRole('heading', { name: 'Interest Rate Matrix', exact: true })).toBeVisible();
  });
  test('read-only users cannot save or publish', async ({ page }) => {
    await investmentSession(page, [
      'READ_FIXEDDEPOSITPRODUCT',
      'READ_INVESTMENT_PRODUCT_POLICY',
      'READ_INVESTMENT_RATE'
    ]);
    await investmentBackend(page);
    await page.goto(root + '/41/rates');
    await expect(page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true })).toHaveAttribute(
      'readonly',
      'true'
    );
    await expect(page.getByRole('button', { name: 'Save Draft', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(0);
  });
  test('shows unavailable backend without fabricated success', async ({ page }) => {
    await investmentSession(page);
    const backend = await investmentBackend(page);
    backend.unavailable = true;
    await page.goto(root + '/41/rates');
    await expect(page.getByRole('alert')).toContainText('Backend unavailable');
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(0);
  });
  for (const width of [
    390,
    768,
    1280,
    1920
  ]) {
    test(`financial matrix remains usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await investmentSession(page);
      await investmentBackend(page);
      await page.goto(root + '/41/rates');
      await expect(page.getByRole('heading', { name: 'Interest Rate Matrix', exact: true })).toBeVisible();
      const input = page.getByLabel('Annual Interest Rate (%) [1, 1]', { exact: true });
      await input.fill('0.1');
      await expect(input).toHaveValue('0.1');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/investment/matrix-${width}.png`, fullPage: true });
    });
  }
});
