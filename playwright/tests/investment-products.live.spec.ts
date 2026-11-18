/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
/** Explicit opt-in: only use disposable synthetic native products in a local tenant. */
const productIds = (process.env.INVESTMENT_LIVE_PRODUCT_IDS ?? '').split(',').filter(Boolean).map(Number);
test.describe('Investment Products — live local Fineract', () => {
  test.skip(
    process.env.INVESTMENT_LIVE !== '1' || productIds.length < 3,
    'Requires local BE01 and three explicitly supplied synthetic native product IDs.'
  );
  test('saves independent Promissory Note and CEDE policies through the real proxy', async ({ page, request }) => {
    const authentication = await request.post('/fineract-provider/api/v1/authentication', {
      headers: { 'Fineract-Platform-TenantId': process.env.INVESTMENT_LIVE_TENANT ?? 'default' },
      data: { username: process.env.E2E_USERNAME ?? 'mifos', password: process.env.E2E_PASSWORD ?? 'password' }
    });
    expect(authentication.status()).toBe(200);
    const credentials = await authentication.json();
    await page.addInitScript(
      ({ credentials, tenant }) => {
        localStorage.setItem('mifosXCredentials', JSON.stringify({ ...credentials, rememberMe: true }));
        localStorage.setItem('mifosXServerURL', location.origin);
        localStorage.setItem('mifosXTenantIdentifier', tenant);
        localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
      },
      { credentials, tenant: process.env.INVESTMENT_LIVE_TENANT ?? 'default' }
    );
    const responses: { method: string; path: string; status: number }[] = [];
    page.on('response', (response) => {
      if (/\/(fixeddepositproducts|investment-products)(\/|$)/.test(new URL(response.url()).pathname))
        responses.push({
          method: response.request().method(),
          path: new URL(response.url()).pathname,
          status: response.status()
        });
    });
    for (const [
      index,
      type
    ] of [
      'Promissory Note (Pagaré)',
      'CEDE — Total Investment +60'
    ].entries()) {
      const id = productIds[index];
      await page.goto(`/#/products/investment-products/${id}/edit`);
      await page.getByRole('combobox', { name: 'Investment Type', exact: true }).click();
      await page.getByRole('option', { name: type, exact: true }).click();
      await page.getByLabel('Minimum Term (days)', { exact: true }).fill(index ? '60' : '1');
      await page.getByLabel('Maximum Term (days)', { exact: true }).fill(index ? '1800' : '1825');
      await page.getByLabel('Term Increment (days)', { exact: true }).fill(index ? '30' : '1');
      await page.getByRole('heading', { name: 'Investment Configuration', exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/investment/live-policy-editor-${id}.png`, fullPage: true });
      const validated = page.waitForResponse((response) =>
        response.url().endsWith(`/investment-products/configuration/${id}/validate`)
      );
      await page.getByRole('button', { name: 'Validate', exact: true }).click();
      expect((await validated).status()).toBe(200);
      await expect(
        page.getByText('Backend validation completed. Review capabilities and blockers before publication.', {
          exact: true
        })
      ).toBeVisible();
      const saved = page.waitForResponse(
        (response) =>
          response.url().endsWith(`/investment-products/configuration/${id}`) && response.request().method() === 'PUT'
      );
      await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
      expect((await saved).status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`investment-products/${id}$`));
      await expect(page.getByText('Draft configuration', { exact: true })).toBeVisible();
      await expect(page.getByText('Financial execution is unavailable.', { exact: true })).toBeVisible();
      await page.screenshot({ path: `test-results/investment/live-policy-${id}.png`, fullPage: true });
    }
    const catalogResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith('/fixeddepositproducts')
    );
    await page.goto('/#/products/investment-products');
    const catalog = await catalogResponse;
    expect(catalog.status()).toBe(200);
    const products: { id: number; name: string }[] = await catalog.json();
    for (const [
      index,
      expected
    ] of [
      'Promissory Note (Pagaré)',
      'CEDE — Total Investment +60',
      'No investment policy'
    ].entries()) {
      const product = products.find((item) => item.id === productIds[index]);
      expect(product).toBeDefined();
      await page.getByRole('textbox', { name: 'Search products', exact: true }).fill(product!.name);
      const row = page.getByRole('row').filter({
        has: page.getByRole('cell', { name: product!.name, exact: true })
      });
      await expect(row.getByRole('cell', { name: expected, exact: true })).toBeVisible();
    }
    await page.screenshot({ path: 'test-results/investment/live-product-list.png', fullPage: true });
    const historyResponse = page.waitForResponse((response) =>
      response.url().includes(`/configuration/${productIds[0]}/history`)
    );
    await page.goto(`/#/products/investment-products/${productIds[0]}/history`);
    await page.getByRole('combobox', { name: 'Rate & Policy History', exact: true }).click();
    await page.getByRole('option', { name: 'Policy Audit Log', exact: true }).click();
    expect((await historyResponse).status()).toBe(200);
    await expect(page.getByRole('columnheader', { name: 'Revision', exact: true }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/investment/live-policy-history.png', fullPage: true });
    fs.mkdirSync('test-results/investment', { recursive: true });
    fs.writeFileSync('test-results/investment/live-network.json', JSON.stringify(responses, null, 2));
  });
});
