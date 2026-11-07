/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Opt-in acceptance against real Fineract. Executes one physical cash transfer.
// Credentials come from environment; requests are never intercepted or mocked.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.E2E_WEB_URL || 'http://127.0.0.1:4200';
const output = process.env.CASH_TRANSFER_RESULTS_DIR;
const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;
const destinationUsername = process.env.CASH_TRANSFER_DESTINATION_USERNAME;
const destinationPassword = process.env.CASH_TRANSFER_DESTINATION_PASSWORD;
assert(
  output && username && password && destinationUsername && destinationPassword,
  'Supply the documented acceptance variables.'
);
const root = '/fineract-provider/api/v2/base-teller/cash-transfers';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let activePage;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript((url) => {
      localStorage.setItem('mifosXServerURL', url);
      localStorage.setItem('mifosXServers', JSON.stringify([url]));
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en-US' }));
    }, base);
    async function api(endpoint, method = 'GET', data, destination = false) {
      const response = await context.request.fetch(base + endpoint, {
        method,
        data,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              (destination ? destinationUsername : username) + ':' + (destination ? destinationPassword : password)
            ).toString('base64'),
          'Fineract-Platform-TenantId': 'default'
        }
      });
      console.log(method, endpoint, response.status());
      return { status: response.status(), body: await response.json() };
    }
    const page = await context.newPage();
    activePage = page;
    console.log('Browser started');
    const network = [],
      errors = [];
    const devtools = await context.newCDPSession(page);
    await devtools.send('Network.enable');
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.url().includes('/cash-transfers'))
        network.push({
          method: response.request().method(),
          path: new URL(response.url()).pathname,
          status: response.status()
        });
    });
    await page.goto(base + '/#/login');
    await page.locator('[formcontrolname="username"]').fill(username);
    await page.locator('[formcontrolname="password"]').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    console.log('Login submitted');
    await page.waitForURL((url) => !url.hash.includes('login'), { timeout: 60000 });
    console.log('Login completed');
    await page.goto(base + '/#/organization/base-teller');
    await page.getByRole('link', { name: /Cash Transfers Between Tellers/ }).click();
    const heading = page.getByRole('heading', { name: 'Cash Transfers Between Tellers', exact: true });
    await heading.waitFor();
    await page.locator('mat-select[formcontrolname="destinationCashierId"]').waitFor();
    const before = await api(root + '/context');
    assert.equal(before.status, 200);
    const destBefore = await api(root + '/context', 'GET', undefined, true);
    assert.equal(destBefore.status, 200);
    async function snapshot(tellerContext, destination = false) {
      const inventory = await api(
        '/fineract-provider/api/v2/base-teller/cash-inventory',
        'GET',
        undefined,
        destination
      );
      assert.equal(inventory.status, 200);
      const ctx = tellerContext.body;
      const closing = await api(
        '/fineract-provider/api/v2/base-teller/end-of-day-closing/preview',
        'POST',
        {
          cashierId: ctx.source.cashierId,
          businessDate: ctx.businessDate,
          currencies: ctx.currencies.map((c) => ({
            currencyCode: c.currencyCode,
            denominations: c.denominations.map((d) => ({
              denominationId: d.denominationId,
              quantity: d.availableQuantity
            })),
            vouchers: 0,
            checks: []
          }))
        },
        destination
      );
      assert.equal(closing.status, 200);
      return { inventory: inventory.body, closing: closing.body };
    }
    const sourceIntegrationBefore = await snapshot(before);
    const destinationIntegrationBefore = await snapshot(destBefore, true);
    const destination = before.body.destinations.find((d) => d.cashierId === destBefore.body.source.cashierId);
    assert(destination, 'A legitimate funded destination is required.');
    assert(!before.body.destinations.some((d) => d.cashierId === before.body.source.cashierId));
    assert(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled());
    await page.locator('mat-select[formcontrolname="destinationCashierId"]').click();
    await page.getByRole('option').filter({ hasText: destination.cashierName }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const expected = [];
    for (const currency of before.body.currencies) {
      const lines = currency.denominations.filter((d) => d.availableQuantity > 0);
      const selected = [
        lines.find((d) => d.denominationType !== 'COIN'),
        lines.find((d) => d.denominationType === 'COIN')
      ].filter(Boolean);
      for (const line of selected) {
        const input = page.locator(
          `[data-currency="${currency.currencyCode}"][data-denomination="${line.denominationId}"]`
        );
        await input.fill(String(line.availableQuantity + 1));
        await input.blur();
        assert(await page.getByRole('button', { name: 'Continue to Confirmation', exact: true }).isDisabled());
        await page.getByText('Insufficient cash available for this denomination.', { exact: true }).first().waitFor();
        await input.fill('1');
        expected.push({
          currency: currency.currencyCode,
          denomination: line.denominationId,
          sourceBefore: line.availableQuantity,
          quantity: 1
        });
      }
    }
    assert(expected.length, 'Real physical denomination inventory is required.');
    await page.screenshot({ path: path.join(output, 'entry-desktop.png'), fullPage: true });
    await page.locator('mifosx-toolbar button').first().click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    if (await page.locator('mat-sidenav').isVisible()) await page.locator('mifosx-toolbar button').first().click();
    await page.locator('mat-sidenav').waitFor({ state: 'hidden' });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      'No mobile horizontal overflow'
    );
    await page.screenshot({ path: path.join(output, 'entry-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    const waitPreview = page.waitForResponse((r) => r.url().endsWith('/cash-transfers/preview'));
    await page.getByRole('button', { name: 'Continue to Confirmation', exact: true }).click();
    const previewResponse = await waitPreview;
    assert.equal(previewResponse.status(), 200);
    const preview = await previewResponse.json();
    await page.getByRole('heading', { name: 'General Transaction', exact: true }).waitFor();
    assert.equal(preview.balanced, true);
    assert.deepEqual(preview.inflowsByCurrency, preview.outflowsByCurrency);
    assert.deepEqual((await api(root + '/context')).body, before.body);
    assert.deepEqual((await api(root + '/context', 'GET', undefined, true)).body, destBefore.body);
    await page.screenshot({ path: path.join(output, 'confirmation.png'), fullPage: true });
    const waitCreate = page.waitForResponse(
      (r) => r.url().endsWith('/cash-transfers') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Confirm Transfer', exact: true }).evaluate((button) => {
      button.click();
      button.click();
    });
    const createResponse = await waitCreate;
    assert.equal(createResponse.status(), 200);
    const createdRequest = createResponse.request().postDataJSON();
    const result = await createResponse.json();
    assert.equal(result.status, 'COMPLETED');
    assert(result.id && result.reference);
    fs.writeFileSync(path.join(output, 'created.json'), JSON.stringify(result, null, 2));
    await page.getByRole('heading', { name: 'Transfer Completed Successfully', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Refreshed Source Inventory', exact: true }).waitFor();
    const after = await api(root + '/context');
    const destAfter = await api(root + '/context', 'GET', undefined, true);
    const sourceIntegrationAfter = await snapshot(after);
    const destinationIntegrationAfter = await snapshot(destAfter, true);
    for (const currency of result.currencies) {
      for (const [
        initial,
        final,
        direction
      ] of [
        [
          sourceIntegrationBefore,
          sourceIntegrationAfter,
          -1
        ],
        [
          destinationIntegrationBefore,
          destinationIntegrationAfter,
          1
        ]
      ]) {
        const balance = (data) =>
          data.closing.balancesByCurrency.find((c) => c.currencyCode === currency.currencyCode).expectedCash;
        assert.equal(Number(balance(final)) - Number(balance(initial)), direction * Number(currency.total));
        const inventoryBalance = (data) =>
          data.inventory.find((c) => c.currencyCode === currency.currencyCode && c.inventoryType === 'CASH').balance;
        assert.equal(
          Number(inventoryBalance(final)) - Number(inventoryBalance(initial)),
          direction * Number(currency.total)
        );
      }
    }
    for (const line of expected) {
      const find = (body) =>
        body.currencies
          .find((c) => c.currencyCode === line.currency)
          .denominations.find((d) => d.denominationId === line.denomination);
      assert.equal(find(after.body).availableQuantity, line.sourceBefore - line.quantity);
      const initialDestination = find(destBefore.body).availableQuantity;
      assert.equal(find(destAfter.body).availableQuantity, initialDestination + line.quantity);
      line.sourceAfter = find(after.body).availableQuantity;
      line.destinationBefore = initialDestination;
      line.destinationAfter = find(destAfter.body).availableQuantity;
      assert.equal(line.sourceBefore + line.destinationBefore, line.sourceAfter + line.destinationAfter);
    }
    assert.equal(network.filter((r) => r.path.endsWith('/cash-transfers') && r.method === 'POST').length, 1);
    const replay = await api(root, 'POST', createdRequest);
    assert.equal(replay.status, 200);
    assert.deepEqual(replay.body, result);
    assert.deepEqual((await api(root + '/context')).body, after.body);
    const details = await api(root + '/' + result.id);
    assert.deepEqual(details.body, result);
    const invalidQuantity = structuredClone(createdRequest);
    invalidQuantity.idempotencyKey = 'invalid-' + createdRequest.idempotencyKey;
    invalidQuantity.currencies[0].denominations[0].quantity = Number.MAX_SAFE_INTEGER;
    const invalid = await api(root, 'POST', invalidQuantity);
    assert(invalid.status >= 400);
    const invalidDest = await api(root, 'POST', {
      ...createdRequest,
      idempotencyKey: 'self-' + createdRequest.idempotencyKey,
      destinationCashierId: before.body.source.cashierId
    });
    assert(invalidDest.status >= 400);
    const missingDest = await api(root + '/preview', 'POST', { currencies: createdRequest.currencies });
    assert(missingDest.status >= 400);
    assert.deepEqual((await api(root + '/context')).body, after.body);
    assert.deepEqual((await api(root + '/context', 'GET', undefined, true)).body, destAfter.body);
    const history = await api(
      '/fineract-provider/api/v2/base-teller/transaction-history?reference=' + encodeURIComponent(result.reference)
    );
    assert.equal(history.status, 200);
    assert.equal(history.body.totalFilteredRecords, 1);
    const destHistory = await api(
      '/fineract-provider/api/v2/base-teller/transaction-history?reference=' + encodeURIComponent(result.reference),
      'GET',
      undefined,
      true
    );
    assert.equal(destHistory.body.totalFilteredRecords, 1);
    // Count print invocations while exercising actual persisted receipt retrieval.
    await page.evaluate(() => {
      window.__receiptPrints = 0;
      window.print = () => window.__receiptPrints++;
    });
    for (const label of [
      'Print Receipt',
      'Reprint Receipt'
    ]) {
      const waitReceipt = page.waitForResponse((r) => r.url().endsWith('/cash-transfers/' + result.id + '/receipt'));
      await page.getByRole('button', { name: label, exact: true }).click();
      assert.deepEqual(await (await waitReceipt).json(), result);
      await page.waitForFunction(() => window.__receiptPrints > 0);
    }
    await page.pdf({ path: path.join(output, 'receipt.pdf'), format: 'A4', printBackground: true });
    await page.screenshot({ path: path.join(output, 'completed.png'), fullPage: true });
    await page.goto(base + '/#/organization/base-teller/cash-transfers-between-tellers?transferId=' + result.id);
    await page.getByRole('heading', { name: 'Transfer Completed Successfully', exact: true }).waitFor();
    const historical = page.waitForResponse((r) => r.url().endsWith('/cash-transfers/' + result.id + '/receipt'));
    await page.getByRole('button', { name: 'Print Receipt', exact: true }).click();
    assert.deepEqual(await (await historical).json(), result);
    fs.writeFileSync(
      path.join(output, 'results.json'),
      JSON.stringify(
        {
          result,
          preview,
          expected,
          sourceBefore: before.body,
          sourceAfter: after.body,
          destinationBefore: destBefore.body,
          destinationAfter: destAfter.body,
          history: history.body,
          destinationHistory: destHistory.body,
          sourceIntegrationBefore,
          sourceIntegrationAfter,
          destinationIntegrationBefore,
          destinationIntegrationAfter,
          invalidQuantity: invalid.status,
          invalidDestination: invalidDest.status,
          missingDestination: missingDest.status,
          duplicateReplay: replay.status,
          network,
          errors
        },
        null,
        2
      )
    );
    assert.equal(errors.length, 0, JSON.stringify(errors));
    console.log(
      'PASS: real browser transfer',
      result.reference,
      'currencies:',
      result.currencies.map((c) => c.currencyCode).join(', ')
    );
  } catch (error) {
    if (activePage) {
      await activePage.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
      fs.writeFileSync(path.join(output, 'failure.txt'), await activePage.locator('body').innerText());
    }
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
