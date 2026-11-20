/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect, APIRequestContext, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { parseExactJson } from '../../../src/app/products/saving-products/product-editor/interest-rate.model';
import type { PolicyConfiguration } from '../../../src/app/products/saving-products/product-editor/product-policy.model';
import type { MonthlyFeeRun } from '../../../src/app/products/saving-products/product-editor/monthly-fee.model';

// Role credentials must not be captured in Playwright traces.
test.use({ trace: 'off' });

// Opt-in suite: real administrative writes to an explicitly selected disposable tenant/product.
test.skip(process.env.E2E_FE04_ALLOW_WRITES !== '1', 'Set E2E_FE04_ALLOW_WRITES=1 only for disposable test data');
const root = (process.env.E2E_FINERACT_URL || 'https://localhost:8443') + '/fineract-provider/api/v1';
const username = process.env.E2E_USERNAME || 'mifos';
const password = process.env.E2E_PASSWORD || 'password';
const product = process.env.E2E_FE04_PRODUCT_ID;
const artifacts = 'artifacts/WEB-1350-FE04';
const headers = {
  Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
  'Fineract-Platform-TenantId': process.env.E2E_TENANT || 'default'
};
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Required disposable-test setting: ${name}`);
  return value;
}
async function get(request: APIRequestContext, path: string) {
  const response = await request.get(root + path, { headers });
  expect(response.status()).toBe(200);
  return response;
}
async function config(request: APIRequestContext, id = product) {
  const value = parseExactJson<PolicyConfiguration>(await (await get(request, `/savingsproducts/policy/${id}`)).text());
  if (!value.policy || value.revision == null) throw new Error('Expected a configured synthetic policy draft');
  return { ...value, policy: value.policy, revision: value.revision };
}
async function login(page: Page, id = product) {
  await new LoginPage(page).navigate();
  await new LoginPage(page).loginAndWaitForDashboard(username, password);
  await page.goto(`/#/products/saving-products/${id}/edit`);
  await expect(page.locator('input[formControlName="maximumBalance"]')).not.toHaveValue('');
  await expect(
    page.locator('mifosx-policy-workflow').getByRole('button', { name: 'Refresh authorization data' })
  ).toBeVisible();
}
async function diagnostics(page: Page) {
  const panel = page.locator('mifosx-monthly-fee-diagnostics');
  await panel.getByText('Tenant-wide monthly fee diagnostics', { exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Monthly fee capabilities', exact: true })).toBeVisible();
  return panel;
}

test.beforeAll(() => {
  expect(product, 'Set E2E_FE04_PRODUCT_ID to a configured synthetic product with advanced interest data').toMatch(
    /^\d+$/
  );
});

test('real draft financial edits preserve exact amounts, native fees and FE-03 interest state', async ({
  page,
  request
}) => {
  const before = await config(request);
  expect(before.policy.interestMatrix || before.policy.referenceRate).toBeTruthy();
  await login(page);
  await page.getByText('Financial policy overview', { exact: true }).click();
  const summary = page.locator('mifosx-financial-policy-summary');
  await expect(summary.first()).toContainText('Draft financial configuration');
  await expect(summary.last()).toContainText('Active approved financial policy');
  await expect(page.locator('mifosx-financial-capabilities')).toContainText('Partially enforced');
  await expect(page.locator('mifosx-financial-capabilities')).toContainText('Not supported');
  await page
    .locator('mat-checkbox[formControlName="withdrawalsAllowed"] input')
    .setChecked(!before.policy.withdrawalsAllowed);
  await page
    .locator('mat-checkbox[formControlName="depositsAllowed"] input')
    .setChecked(!before.policy.depositsAllowed);
  await page.locator('input[formControlName="minimumMonthlyAverageBalance"]').fill('100.01');
  await page.locator('mat-checkbox[formControlName="feeApplicable"] input').setChecked(true);
  await page.locator('mat-select[formControlName="feeChargeId"]').click();
  const option = page.getByRole('option').first();
  await expect(option).toBeVisible();
  const feeName = await option.innerText();
  await option.click();
  await expect(summary.first()).toContainText(feeName);
  const save = page.getByRole('button', { name: 'Save as Draft', exact: true });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText('Policy draft saved. It is not an active policy.', { exact: true })).toBeVisible();
  const after = await config(request);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.policy.withdrawalsAllowed).toBe(!before.policy.withdrawalsAllowed);
  expect(after.policy.depositsAllowed).toBe(!before.policy.depositsAllowed);
  expect(after.policy.minimumMonthlyAverageBalance).toBe('100.01');
  expect(after.policy.maximumBalance).toBe(before.policy.maximumBalance);
  expect(after.policy.interestMatrix).toEqual(before.policy.interestMatrix);
  expect(after.policy.referenceRate).toEqual(before.policy.referenceRate);
  expect(after.policy.feeChargeId).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator('input[formControlName="minimumMonthlyAverageBalance"]')).toHaveValue('100.01');
  await page.screenshot({ path: `${artifacts}/financial-controls-draft.png`, fullPage: true });
});

test('real diagnostic creation, bounded assessment, cursor pages and read-only reconciliation', async ({
  page,
  request
}) => {
  const posts: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/savings/monthly-fees/')) posts.push(r.url());
  });
  await login(page);
  const panel = await diagnostics(page);
  expect(posts).toHaveLength(0);
  await expect(panel).toContainText('Financial fee posting');
  await expect(panel).toContainText('Not supported');
  const business = await (await get(request, '/businessdate/BUSINESS_DATE')).json();
  const [
    year,
    month
  ] = business.date as number[];
  const period = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
  await panel.locator('input[formControlName="period"]').fill(period);
  page.once('dialog', (dialog) => dialog.accept());
  await panel.getByRole('button', { name: 'Create diagnostic run', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Selected diagnostic run', exact: true })).toBeVisible();
  expect(posts).toHaveLength(1);
  const history = await (await get(request, '/savings/monthly-fees/runs')).json();
  const run: MonthlyFeeRun = history.items.find((item: MonthlyFeeRun) => item.period === period);
  expect(run.id).toBeTruthy();
  if (run.status === 'READY' || run.status === 'IN_PROGRESS') {
    await panel.locator('input[formControlName="limit"]').fill('100');
    page.once('dialog', (dialog) => dialog.accept());
    await panel.getByRole('button', { name: 'Process diagnostic batch', exact: true }).click();
    await expect(panel.getByRole('heading', { name: 'Assessment records', exact: true })).toBeVisible();
    await expect(panel.getByRole('table', { name: 'Assessment records' }).getByRole('row')).not.toHaveCount(1);
  }
  await expect(panel).toContainText('Financial execution not attempted');
  await expect(panel).toContainText('Native accounting not verified');
  const first = await (await get(request, `/savings/monthly-fees/runs/${run.id}/assessments?limit=20`)).json();
  if (first.hasMore) {
    const nextResponse = page.waitForResponse(
      (r) => r.url().includes(`/runs/${run.id}/assessments?`) && r.url().includes(`afterId=${first.nextAfterId}`)
    );
    await panel.getByRole('button', { name: 'Next assessment page', exact: true }).click();
    await nextResponse;
    const next = await (
      await get(request, `/savings/monthly-fees/runs/${run.id}/assessments?afterId=${first.nextAfterId}&limit=20`)
    ).json();
    await expect(panel.getByRole('table', { name: 'Assessment records' })).toContainText(
      String(next.items[0].accountId)
    );
  }
  expect(posts.every((url) => /\/runs(?:\?period=|\/[^/]+\/assess\?limit=)/.test(url))).toBe(true);
  await expect(
    panel.getByRole('button', { name: /collect fees|post fees|retry financial|unfreeze|override/i })
  ).toHaveCount(0);
  await panel.getByRole('button', { name: 'Reload diagnostic history', exact: true }).click();
  await panel.getByRole('button', { name: run.id, exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Read-only reconciliation evidence' })).toBeVisible();
  await page.screenshot({ path: `${artifacts}/monthly-fee-real-evidence.png`, fullPage: true });
});

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`real financial controls and diagnostic layout at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 1000 });
    await login(page);
    await page.getByText('Financial policy overview', { exact: true }).click();
    const panel = await diagnostics(page);
    const history = await (await get(request, '/savings/monthly-fees/runs')).json();
    expect(history.items.length).toBeGreaterThan(0);
    await panel.getByRole('button', { name: history.items[0].id, exact: true }).click();
    await expect(panel.getByRole('heading', { name: 'Read-only reconciliation evidence' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width <= 768) {
      await expect(panel.locator('tr.mat-mdc-header-row').first()).toBeHidden();
      expect(
        await panel
          .locator('tr.mat-mdc-row')
          .first()
          .evaluate((row) => {
            const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.getBoundingClientRect());
            return cells.every((cell, index) => index === 0 || cell.top >= cells[index - 1].bottom);
          })
      ).toBe(true);
    }
    await page.screenshot({ path: `${artifacts}/financial-controls-${width}.png`, fullPage: true });
  });
}

test('real read-only and denied monthly fee permissions survive direct editor navigation', async ({
  browser,
  request
}) => {
  const reader = requiredEnv('E2E_FE04_READER');
  const denied = requiredEnv('E2E_FE04_DENIED');
  const rolePassword = (user: string) =>
    requiredEnv(user === reader ? 'E2E_FE04_READER_PASSWORD' : 'E2E_FE04_DENIED_PASSWORD');
  expect(reader, 'Provide a monthly-fee reader identity').toBeTruthy();
  expect(denied, 'Provide an identity with editor read access but no monthly-fee access').toBeTruthy();
  expect(rolePassword(reader)).toBeTruthy();
  expect(rolePassword(denied)).toBeTruthy();
  for (const [
    user,
    allowed
  ] of [
    [
      reader,
      true
    ],
    [
      denied,
      false
    ]
  ] as const) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200'
    });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/savings/monthly-fees/')) requests.push(r.method());
    });
    await new LoginPage(page).navigate();
    await new LoginPage(page).loginAndWaitForDashboard(user, rolePassword(user));
    await page.goto(`/#/products/saving-products/${product}/edit`);
    await expect(page.getByRole('heading', { name: 'Edit Savings Product', exact: true })).toBeVisible();
    const panel = page.locator('mifosx-monthly-fee-diagnostics');
    if (allowed) {
      await panel.getByText('Tenant-wide monthly fee diagnostics', { exact: true }).click();
      await expect(panel.getByRole('heading', { name: 'Monthly fee capabilities', exact: true })).toBeVisible();
      await expect(panel.getByRole('button', { name: 'Create diagnostic run', exact: true })).toHaveCount(0);
      await expect(panel.getByRole('button', { name: 'Process diagnostic batch', exact: true })).toHaveCount(0);
    } else {
      await expect(panel.locator('mat-expansion-panel')).toHaveCount(0);
      expect(requests).toHaveLength(0);
    }
    const direct = await request.post(root + '/savings/monthly-fees/runs?period=2026-10', {
      headers: { ...headers, Authorization: 'Basic ' + Buffer.from(`${user}:${rolePassword(user)}`).toString('base64') }
    });
    expect(direct.status()).toBe(403);
    expect(requests).not.toContain('POST');
    await context.close();
  }
});

test('real Mexican Spanish diagnostics and restriction labels remain localized on mobile', async ({
  page,
  request
}) => {
  await login(page);
  await page.evaluate(() => localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'Español', code: 'es' })));
  await page.reload();
  await page.setViewportSize({ width: 390, height: 1000 });
  const panel = page.locator('mifosx-monthly-fee-diagnostics');
  await expect(panel).toContainText('Diagnósticos de comisiones mensuales de toda la entidad');
  await panel.getByText('Diagnósticos de comisiones mensuales de toda la entidad', { exact: true }).click();
  await expect(panel).toContainText('Capacidades de comisiones mensuales');
  const history = await (await get(request, '/savings/monthly-fees/runs')).json();
  await panel.getByRole('button', { name: history.items[0].id, exact: true }).click();
  await expect(panel).toContainText('Contabilidad nativa no verificada');
  await expect(panel).not.toContainText('FinancialControls.');
  await page.screenshot({ path: `${artifacts}/financial-controls-es-MX-390.png`, fullPage: true });
});

test('real native account status and rejected deposit retain backend authority', async ({ page, request }) => {
  const accountId = process.env.E2E_FE04_ACCOUNT_ID;
  expect(
    accountId,
    'Provide a synthetic account already bound to a configured policy; the backend must reject deposits'
  ).toMatch(/^\d+$/);
  const account = await (await get(request, `/savingsaccounts/${accountId}`)).json();
  expect(account.clientId).toBeGreaterThan(0);
  await login(page);
  const route = `/#/clients/${account.clientId}/savings-accounts/${accountId}`;
  await page.goto(route + '/general');
  await expect(page.getByText(`Native account status: ${account.status.value}`, { exact: true })).toBeVisible();
  await expect(
    page.getByText(`Native account restriction status: ${account.subStatus.value}`, { exact: true })
  ).toBeVisible();
  await page.goto(route + '/actions/Deposit');
  const amount = page.locator('mifosx-input-amount input');
  await amount.fill('1');
  await page.locator('mat-select[formControlName="paymentTypeId"]').click();
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const responsePromise = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().includes(`/savingsaccounts/${accountId}/transactions`)
  );
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(400);
  const body = await response.json();
  const codes = [
    body.userMessageGlobalisationCode,
    ...(body.errors || []).map((item: { userMessageGlobalisationCode?: string }) => item.userMessageGlobalisationCode)
  ];
  expect(codes.some((code) => code?.startsWith('error.msg.savings.product.transaction.'))).toBe(true);
  await expect(page.locator('mifosx-savings-transactions [role="alert"]')).toContainText(
    'Transaction execution for this product purpose is unsupported.'
  );
  await expect(
    page.locator('mat-snack-bar-container').filter({
      hasText: 'Transaction execution for this product purpose is unsupported.'
    })
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
  const after = await (await get(request, `/savingsaccounts/${accountId}`)).json();
  expect(after.summary.accountBalance).toBe(account.summary.accountBalance);
  await page.screenshot({ path: `${artifacts}/transaction-policy-rejection.png`, fullPage: true });
});

test('real maximum monetary precision survives a reference-rate financial draft edit', async ({ page, request }) => {
  const id = process.env.E2E_FE04_VARIABLE_PRODUCT_ID;
  expect(id, 'Provide a synthetic REFERENCE_RATE product').toMatch(/^\d+$/);
  const before = await config(request, id);
  expect(before.policy.referenceRate).toBeTruthy();
  await login(page, id);
  await page.locator('input[formControlName="maximumBalance"]').fill('9999999999999.99');
  await page.locator('input[formControlName="minimumMonthlyAverageBalance"]').fill('1234.56');
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page.getByText('Policy draft saved. It is not an active policy.', { exact: true })).toBeVisible();
  const after = await config(request, id);
  expect(after.policy.maximumBalance).toBe('9999999999999.99');
  expect(after.policy.minimumMonthlyAverageBalance).toBe('1234.56');
  expect(after.policy.referenceRate).toEqual(before.policy.referenceRate);
  expect(after.policy.interestMatrix).toEqual(before.policy.interestMatrix);
  await page.reload();
  await expect(page.locator('input[formControlName="maximumBalance"]')).toHaveValue('9999999999999.99');
});
