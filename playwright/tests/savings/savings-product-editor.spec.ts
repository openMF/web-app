/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { mkdir, writeFile } from 'node:fs/promises';

const artifacts = 'artifacts/WEB-1350-FE02';
const root = (process.env.E2E_FINERACT_URL || 'https://localhost:8443') + '/fineract-provider/api/v1';
const username = process.env.E2E_USERNAME || 'mifos';
const password = process.env.E2E_PASSWORD || 'password';
const checker = process.env.E2E_POLICY_CHECKER;
const passwordFor = (user: string) =>
  user === checker
    ? process.env.E2E_CHECKER_PASSWORD || password
    : user === process.env.E2E_POLICY_READER
      ? process.env.E2E_READER_PASSWORD || password
      : password;
const headers = (user = username) => ({
  Authorization: 'Basic ' + Buffer.from(`${user}:${passwordFor(user)}`).toString('base64'),
  'Fineract-Platform-TenantId': process.env.E2E_TENANT || 'default'
});

async function api(request: APIRequestContext, path: string, user = username) {
  const response = await request.get(root + path, { headers: headers(user) });
  expect(response.ok()).toBeTruthy();
  return response;
}
async function tenantDate(request: APIRequestContext) {
  const config = await (await api(request, '/configurations/name/enable-business-date')).json();
  if (config.enabled) {
    const value = await (await api(request, '/businessdate/BUSINESS_DATE')).json();
    return value.date.map((part: number, index: number) => String(part).padStart(index ? 2 : 4, '0')).join('-');
  }
  const response = await api(request, '/savingsproducts/policy/template');
  return new Date(response.headers()['date']).toISOString().slice(0, 10);
}
async function login(page: Page, user = username) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAndWaitForDashboard(user, passwordFor(user));
}
async function select(page: Page, control: string, label: string) {
  await page.locator(`mat-select[formControlName="${control}"]`).click();
  await page.getByRole('option', { name: label, exact: true }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
}
async function tab(page: Page, name: string) {
  await page.getByRole('tab', { name, exact: true }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}
async function editorReady(page: Page) {
  await expect(
    page.locator('mifosx-product-editor mat-progress-bar[aria-label="Saving product configuration"]')
  ).toBeHidden();
  await expect(
    page.locator('mifosx-product-editor').getByText('Policy settings are configurable metadata.', { exact: false })
  ).toBeVisible();
}
async function fillProduct(page: Page, fixed: boolean) {
  const suffix = Date.now().toString(36).slice(-4);
  await page.goto('/#/products/saving-products/create');
  await editorReady(page);
  await page.locator('input[formControlName="name"]').fill(`FE02 ${fixed ? 'Fixed' : 'Sight'} ${Date.now()}`);
  await page.locator('input[formControlName="shortName"]').fill(suffix);
  await select(page, 'currencyCode', 'Mexican Peso');
  await page.locator('input[formControlName="digitsAfterDecimal"]').fill('2');
  await page.locator('input[formControlName="minRequiredOpeningBalance"]').fill('0');
  await select(page, 'classification', fixed ? 'Interest-bearing Sight' : 'Sight');
  await select(page, 'purpose', 'Main');
  await page.locator('input[formControlName="maximumBalance"]').fill('10000.01');
  await page.locator('input[formControlName="minimumMonthlyAverageBalance"]').fill('0');
  await tab(page, 'Interest Configuration');
  if (fixed) {
    await select(page, 'interestMode', 'Fixed rate');
    await page.locator('input[formControlName="nominalAnnualInterestRate"]').fill('4.5');
  } else await page.getByRole('button', { name: 'Set no interest and zero nominal rate' }).click();
  await page.locator('mat-select[formControlName="interestMode"]').click();
  await expect(page.getByRole('option', { name: 'Tiered interest configuration', exact: true })).toHaveAttribute(
    'aria-disabled',
    fixed ? 'false' : 'true'
  );
  await expect(page.getByRole('option', { name: 'Reference-rate configuration', exact: true })).toHaveAttribute(
    'aria-disabled',
    fixed ? 'false' : 'true'
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.screenshot({
    path: `${artifacts}/interest-configuration-desktop.png`,
    fullPage: true,
    animations: 'disabled'
  });
  await tab(page, 'Additional Rules');
  await select(page, 'multiplicity', 'Single');
  await page.locator('input[formControlName="accountDesignation"]').fill('FE02 verified account');
  await page.screenshot({ path: `${artifacts}/additional-rules-desktop.png`, fullPage: true, animations: 'disabled' });
  return suffix;
}

test('real create, partial-failure retry, edit revision/conflict, submit, independent approval and mobile', async ({
  page,
  request,
  browser
}) => {
  test.setTimeout(240000);
  expect(checker, 'Set E2E_POLICY_CHECKER to an independent authorized disposable test identity').toBeTruthy();
  await mkdir(artifacts, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const capabilities = await (await api(request, '/savingsproducts/policy/template')).json();
  expect(capabilities.activation).toBe(true);
  expect(capabilities.financialEnforcement).toBe(false);
  const serverDate = new Date((await tenantDate(request)) + 'T00:00:00Z');
  const effective = new Date(serverDate.getTime() + 2 * 86400000).toISOString().slice(0, 10);
  await login(page);
  await fillProduct(page, false);
  await tab(page, 'Basic Information');
  await page.locator('input[formControlName="maximumBalance"]').fill('-1');
  await page.locator('input[formControlName="maximumBalance"]').blur();
  await expect(page.getByRole('button', { name: 'Save as Draft', exact: true })).toBeDisabled();
  await page.screenshot({ path: `${artifacts}/validation-example.png`, fullPage: true, animations: 'disabled' });
  await page.locator('input[formControlName="maximumBalance"]').fill('10000.01');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: `${artifacts}/basic-information-desktop.png`, fullPage: true, animations: 'disabled' });
  let coreWrites = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && /\/savingsproducts$/.test(r.url())) coreWrites++;
  });
  await page.route('**/savingsproducts/policy/*', async (route) => {
    if (route.request().method() === 'PUT')
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ defaultUserMessage: 'Controlled policy-write outage for retry verification' })
      });
    else await route.continue();
  });
  const coreResponse = page.waitForResponse(
    (r) => r.request().method() === 'POST' && /\/savingsproducts$/.test(r.url())
  );
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  const productId = (await (await coreResponse).json()).resourceId;
  await expect(
    page.getByText('The core product exists, but policy saving did not complete.', { exact: false })
  ).toBeVisible();
  await page.screenshot({ path: `${artifacts}/partial-failure-recovery.png`, fullPage: true, animations: 'disabled' });
  await page.unroute('**/savingsproducts/policy/*');
  await page.getByRole('button', { name: 'Retry policy draft only' }).click();
  await expect(page).toHaveURL(new RegExp(`saving-products/${productId}/edit`));
  await editorReady(page);
  expect(coreWrites).toBe(1);
  const persisted = await (await api(request, `/savingsproducts/policy/${productId}`)).json();
  expect(persisted.revision).toBe(1);
  expect(persisted.policy.classification).toBe('SIGHT');
  await page.screenshot({ path: `${artifacts}/create-product-success.png`, fullPage: true, animations: 'disabled' });
  await tab(page, 'Additional Rules');
  await page.locator('input[formControlName="accountDesignation"]').fill('Revised exact draft');
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page.getByText('Policy draft saved. It is not an active policy.', { exact: true })).toBeVisible();
  const revision2 = await (await api(request, `/savingsproducts/policy/${productId}`)).json();
  expect(revision2.revision).toBe(2);
  // Genuine concurrent writer: the browser retains revision 2 while the API saves revision 3.
  const concurrent = await request.put(root + `/savingsproducts/policy/${productId}`, {
    headers: headers(),
    data: { expectedRevision: 2, policy: { ...revision2.policy, accountDesignation: 'Concurrent administrator' } }
  });
  expect(concurrent.status()).toBe(200);
  await page.locator('input[formControlName="accountDesignation"]').fill('Preserved unsaved local input');
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page.getByText('Revision or lifecycle conflict.', { exact: false }).first()).toBeVisible();
  await expect(page.locator('input[formControlName="accountDesignation"]')).toHaveValue(
    'Preserved unsaved local input'
  );
  await page.screenshot({ path: `${artifacts}/revision-conflict.png`, fullPage: true, animations: 'disabled' });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reload server draft (discard local policy edits)' }).click();
  await expect(page.locator('input[formControlName="accountDesignation"]')).toHaveValue('Concurrent administrator');
  await expect(page.locator('mifosx-policy-workflow').getByText('No submitted versions.')).toBeAttached();
  await page.locator('mifosx-policy-workflow input[formControlName="effectiveDate"]').fill(effective);
  await page.getByRole('button', { name: 'Submit for Approval', exact: true }).click();
  await expect(page.getByText('Independent review is pending.', { exact: false })).toBeVisible();
  await page.screenshot({ path: `${artifacts}/draft-submitted.png`, fullPage: true, animations: 'disabled' });
  const self = await request.post(root + `/savingsproducts/policy/${productId}/versions/3/approve`, {
    headers: headers(),
    data: {}
  });
  expect(self.status()).toBe(403);
  const checkerContext = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4202'
  });
  const checkerPage = await checkerContext.newPage();
  checkerPage.on('pageerror', (e) => errors.push(e.message));
  await login(checkerPage, checker);
  await checkerPage.goto(`/#/products/saving-products/${productId}/edit`);
  await editorReady(checkerPage);
  await checkerPage.getByText('Version history', { exact: true }).click();
  await checkerPage.getByRole('button', { name: 'Review version 3', exact: true }).click();
  await checkerPage.getByRole('button', { name: 'Reject policy version', exact: true }).click();
  await expect(checkerPage.locator('mifosx-policy-workflow mat-error')).toHaveText(
    'Rejection requires a reason. Use at most 1000 characters without control characters.'
  );
  // Approval has no required-reason rule, even after an empty rejection attempt.
  await checkerPage.getByRole('button', { name: 'Approve policy version', exact: true }).click();
  await expect(
    checkerPage.getByText('Applicable active version: No applicable approved policy', { exact: true })
  ).toBeVisible();
  await expect(checkerPage.getByText('Approved (effective date pending)', { exact: false })).toBeAttached();
  const historyButton = checkerPage.getByRole('button', { name: 'Version history', exact: true });
  if ((await historyButton.getAttribute('aria-expanded')) !== 'true') await historyButton.click();
  await expect(checkerPage.getByText('Approved (effective date pending)', { exact: false })).toBeVisible();
  await checkerPage.screenshot({ path: `${artifacts}/approval-status.png`, fullPage: true, animations: 'disabled' });
  const active = await api(request, `/savingsproducts/policy/${productId}/active`);
  expect(active.status()).toBe(204);
  for (const width of [
    1920,
    1366,
    768,
    390
  ]) {
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
    await page.reload();
    await editorReady(page);
    for (const name of [
      'Basic Information',
      'Interest Configuration',
      'Additional Rules'
    ]) await tab(page, name);
    expect(await page.locator('mifosx-product-editor').evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false);
    await page.screenshot({
      path: `${artifacts}/${width === 390 ? 'mobile-product-editor' : 'edit-product-' + width}.png`,
      fullPage: true,
      animations: 'disabled'
    });
  }
  await writeFile(
    `${artifacts}/live-evidence.json`,
    JSON.stringify(
      {
        productId,
        revision: 3,
        effectiveDate: effective,
        coreWrites,
        selfApprovalStatus: self.status(),
        activeStatus: active.status(),
        pageErrors: errors
      },
      null,
      2
    )
  );
  expect(errors).toEqual([]);
  await checkerContext.close();
});

test('real fixed-interest creation preserves core rate and supports native editor and legacy product', async ({
  page,
  request
}) => {
  await login(page);
  await fillProduct(page, true);
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page).toHaveURL(/saving-products\/\d+\/edit/);
  await editorReady(page);
  const id = Number(page.url().match(/saving-products\/(\d+)/)![1]);
  const core = await (await api(request, `/savingsproducts/${id}`)).json();
  expect(core.nominalAnnualInterestRate).toBe(4.5);
  expect((await (await api(request, `/savingsproducts/policy/${id}`)).json()).policy.interestMode).toBe('FIXED');
  await page.reload();
  await editorReady(page);
  await tab(page, 'Interest Configuration');
  await expect(page.locator('input[formControlName="nominalAnnualInterestRate"]')).toHaveValue('4.5');
  await page.screenshot({ path: `${artifacts}/edit-product.png`, fullPage: true, animations: 'disabled' });
  await page.goto(`/#/products/saving-products/${id}/edit?core=1`);
  await expect(page.locator('mifosx-edit-saving-product mat-stepper')).toBeVisible();
  const products = await (await api(request, '/savingsproducts')).json();
  let legacy: number | undefined;
  for (const p of products) {
    const config = await (await api(request, `/savingsproducts/policy/${p.id}`)).json();
    if (config.status === 'UNCONFIGURED') {
      legacy = p.id;
      break;
    }
  }
  expect(legacy).toBeTruthy();
  await page.goto(`/#/products/saving-products/${legacy}/edit`);
  await editorReady(page);
  await expect(
    page.locator('mifosx-product-editor').getByText('Legacy / unconfigured', { exact: false })
  ).toBeVisible();
  await expect(page.locator('mat-select[formControlName="classification"]')).toHaveText('');
  await page.screenshot({ path: `${artifacts}/legacy-product.png`, fullPage: true, animations: 'disabled' });
});

test('real active policy, rejection, denied writes, read-only form and unsaved navigation', async ({
  page,
  request
}) => {
  const reader = process.env.E2E_POLICY_READER;
  expect(reader, 'Set E2E_POLICY_READER to an authorized read-only disposable identity').toBeTruthy();
  expect(checker).toBeTruthy();
  await login(page);
  await fillProduct(page, false);
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page).toHaveURL(/saving-products\/\d+\/edit/);
  await editorReady(page);
  const id = Number(page.url().match(/saving-products\/(\d+)/)![1]);
  const today = await tenantDate(request);
  const submit = await request.post(root + `/savingsproducts/policy/${id}/submit`, {
    headers: headers(),
    data: { expectedRevision: 1, effectiveDate: today }
  });
  expect(submit.status()).toBe(200);
  const approve = await request.post(root + `/savingsproducts/policy/${id}/versions/1/approve`, {
    headers: headers(checker),
    data: { reason: 'Independent current-date review' }
  });
  expect(approve.status()).toBe(200);
  expect((await approve.json()).status).toBe('ACTIVE');
  expect((await (await api(request, `/savingsproducts/policy/${id}/active`)).json()).version).toBe(1);
  await page.reload();
  await editorReady(page);
  await expect(page.getByText(`Applicable active version: 1 · ${today}`, { exact: true })).toBeVisible();
  await tab(page, 'Additional Rules');
  await page.locator('input[formControlName="accountDesignation"]').fill('Reviewable second draft');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('link', { name: 'Savings Products', exact: true }).last().click();
  await expect(page).toHaveURL(new RegExp(`saving-products/${id}/edit`));
  await expect(page.locator('input[formControlName="accountDesignation"]')).toHaveValue('Reviewable second draft');
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page.getByText('Policy draft saved. It is not an active policy.', { exact: true })).toBeVisible();
  const config = await (await api(request, `/savingsproducts/policy/${id}`)).json();
  expect(config.revision).toBe(2);
  const denied = await request.put(root + `/savingsproducts/policy/${id}`, {
    headers: headers(reader),
    data: { expectedRevision: 2, policy: config.policy }
  });
  expect(denied.status()).toBe(403);
  const deniedSubmit = await request.post(root + `/savingsproducts/policy/${id}/submit`, {
    headers: headers(reader),
    data: { expectedRevision: 2, effectiveDate: today }
  });
  expect(deniedSubmit.status()).toBe(403);
  const submitted = await request.post(root + `/savingsproducts/policy/${id}/submit`, {
    headers: headers(),
    data: { expectedRevision: 2, effectiveDate: today }
  });
  expect(submitted.status()).toBe(200);
  const rejected = await request.post(root + `/savingsproducts/policy/${id}/versions/2/reject`, {
    headers: headers(checker),
    data: { reason: 'Independent rejection test' }
  });
  expect(rejected.status()).toBe(200);
  expect((await rejected.json()).status).toBe('REJECTED');
  await page.reload();
  await editorReady(page);
  await page.getByText('Version history', { exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Version history', exact: true })
      .getByText('Independent rejection test', { exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: `${artifacts}/active-and-rejected-policy.png`,
    fullPage: true,
    animations: 'disabled'
  });
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.removeItem('mifosXCredentials');
    sessionStorage.removeItem('mifosXCredentials');
  });
  await login(page, reader);
  await page.goto(`/#/products/saving-products/${id}/edit`);
  await editorReady(page);
  await expect(page.locator('mat-select[formControlName="classification"]')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Save as Draft', exact: true })).toBeDisabled();
  await page.screenshot({ path: `${artifacts}/read-only-editor.png`, fullPage: true, animations: 'disabled' });
  await writeFile(
    `${artifacts}/additional-live-evidence.json`,
    JSON.stringify(
      {
        productId: id,
        activeVersion: 1,
        rejectedVersion: 2,
        readerWriteStatus: denied.status(),
        readerSubmitStatus: deniedSubmit.status()
      },
      null,
      2
    )
  );
});

test('real eligible fees, conditional-field clearing, backend validation, keyboard and dark theme', async ({
  page,
  request
}) => {
  const feeName = `FE02 fee ${Date.now()}`;
  const charge = await request.post(root + '/charges', {
    headers: headers(),
    data: {
      name: feeName,
      currencyCode: 'MXN',
      amount: 10,
      chargeAppliesTo: 2,
      chargeTimeType: 2,
      chargeCalculationType: 1,
      active: true,
      penalty: false,
      locale: 'en'
    }
  });
  expect(charge.status()).toBe(200);
  const chargeId = (await charge.json()).resourceId;
  await login(page);
  await fillProduct(page, false);
  await tab(page, 'Basic Information');
  await select(page, 'purpose', 'Guaranteed');
  await page.locator('mat-checkbox[formControlName="liquidGuarantee"] input').check();
  await page.locator('mat-checkbox[formControlName="feeApplicable"] input').check();
  await select(page, 'feeChargeId', feeName);
  await page.getByRole('tab', { name: 'Basic Information', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Interest Configuration', exact: true })).toBeVisible();
  await tab(page, 'Additional Rules');
  await select(page, 'freezing', 'Fixed term');
  await page.locator('input[formControlName="freezingTermDays"]').fill('30');
  await select(page, 'freezing', 'No resource freezing');
  await expect(page.locator('input[formControlName="freezingTermDays"]')).toHaveCount(0);
  await page.locator('mat-checkbox[formControlName="additionalPaymentReference"] input').check();
  await page.locator('input[formControlName="paymentReferencePartner"]').fill('Test partner');
  await page.locator('mat-checkbox[formControlName="additionalPaymentReference"] input').uncheck();
  await expect(page.locator('input[formControlName="paymentReferencePartner"]')).toHaveCount(0);
  await page.locator('mat-checkbox[formControlName="directDebitForLoanPayment"] input').check();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({ path: `${artifacts}/additional-rules-dark.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click();
  await expect(page).toHaveURL(/saving-products\/\d+\/edit/);
  await editorReady(page);
  const id = Number(page.url().match(/saving-products\/(\d+)/)![1]);
  const config = await (await api(request, `/savingsproducts/policy/${id}`)).json();
  expect(config.policy.feeChargeId).toBe(chargeId);
  expect(config.policy.directDebitForLoanPayment).toBe(true);
  expect(config.policy.freezingTermDays ?? null).toBeNull();
  expect(config.policy.paymentReferencePartner ?? null).toBeNull();
  const invalidMoney = await request.put(root + `/savingsproducts/policy/${id}`, {
    headers: headers(),
    data: { expectedRevision: 1, policy: { ...config.policy, maximumBalance: -1 } }
  });
  expect(invalidMoney.status()).toBe(400);
  const invalidFee = await request.put(root + `/savingsproducts/policy/${id}`, {
    headers: headers(),
    data: { expectedRevision: 1, policy: { ...config.policy, feeChargeId: 999999999 } }
  });
  expect(invalidFee.status()).toBe(400);
  expect((await (await api(request, `/savingsproducts/policy/${id}`)).json()).revision).toBe(1);
  await writeFile(
    `${artifacts}/conditional-live-evidence.json`,
    JSON.stringify(
      {
        productId: id,
        chargeId,
        invalidMoneyStatus: invalidMoney.status(),
        invalidFeeStatus: invalidFee.status(),
        revision: 1
      },
      null,
      2
    )
  );
});

test('native create and edit preserve unsaved changes on Return Unified', async ({ page, request }) => {
  await login(page);
  const products = await (await api(request, '/savingsproducts')).json();
  const id = products[0].id;
  for (const route of [
    '/products/saving-products/create?core=1',
    `/products/saving-products/${id}/edit?core=1`
  ]) {
    await page.goto('/#' + route);
    await expect(
      page.locator('mifosx-core-create-saving-product mat-stepper, mifosx-core-edit-saving-product mat-stepper')
    ).toBeVisible();
    const name = page.locator('input[formControlName="name"]');
    const changed = `Unsaved core ${Date.now()}`;
    await name.fill(changed);
    const url = page.url();
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('link', { name: 'Return to unified policy editor', exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(name).toHaveValue(changed);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('link', { name: 'Return to unified policy editor', exact: true }).click();
    await expect(page).not.toHaveURL(/core=1/);
    await editorReady(page);
  }
});
