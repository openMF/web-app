// Opt-in acceptance against real local Fineract. Performs a custody transfer.
// Supply credentials via environment. No request interception, stored auth state, or traces.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.E2E_WEB_URL || 'http://127.0.0.1:4201';
const output = process.env.PICKUP_RESULTS_DIR;
const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;
const headUsername = process.env.PICKUP_HEAD_USERNAME;
const headPassword = process.env.PICKUP_HEAD_PASSWORD;
assert(output && username && password && headUsername && headPassword, 'Supply documented acceptance variables.');
const root = '/fineract-provider/api/v2/base-teller/cash-drawer-pickups';
const headers = {
  Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
  'Fineract-Platform-TenantId': 'default'
};
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript((url) => {
      localStorage.setItem('mifosXServerURL', url);
      localStorage.setItem('mifosXServers', JSON.stringify([url]));
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en-US' }));
    }, base);
    const page = await context.newPage();
    const network = [],
      logs = [];
    const devtools = await context.newCDPSession(page);
    await devtools.send('Network.enable');
    page.on('console', (m) => logs.push(m.text()));
    page.on('pageerror', (e) => logs.push(e.message));
    page.on('response', (r) => {
      if (r.url().includes('/cash-drawer-pickups'))
        network.push({ method: r.request().method(), url: r.url(), status: r.status() });
    });
    async function api(endpoint, method = 'GET', data) {
      const response = await context.request.fetch(base + endpoint, { method, headers, data });
      return { status: response.status(), body: await response.json() };
    }
    await page.goto(base + '/#/login');
    await page.locator('[formcontrolname="username"]').fill(username);
    await page.locator('[formcontrolname="password"]').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL((u) => !u.hash.includes('login'), { timeout: 60000 });
    const ctxWait = page.waitForResponse((r) => r.url().endsWith('/cash-drawer-pickups/context'));
    await page.goto(base + '/#/organization/base-teller/cash-drawer-pickup');
    const before = await (await ctxWait).json();
    await page.getByRole('heading', { name: 'Cash Drawer Pickup', exact: true }).waitFor();
    const source = before.sourceCashiers[0];
    const destination = before.destinations.find(
      (d) => d.officeId === source.officeId && d.cashierId !== source.cashierId
    );
    assert(destination, 'A funded Head Teller must be available.');
    if (before.sourceCashiers.length > 1) {
      await page.locator('mat-select[formcontrolname="cashierId"]').click();
      await page.getByRole('option').filter({ hasText: source.cashierName }).click();
    }
    await page
      .locator('mat-select[formcontrolname="destinationCashierId"]')
      .waitFor()
      .catch(async (error) => {
        console.log((await page.locator('body').innerText()).slice(-4000));
        console.log(logs.filter((l) => !l.includes(headPassword)).slice(-10));
        throw error;
      });
    const destSelect = page.locator('mat-select[formcontrolname="destinationCashierId"]');
    if (!(await destSelect.innerText()).includes(destination.cashierName)) {
      await destSelect.click();
      await page.getByRole('option').filter({ hasText: destination.cashierName }).click();
    }
    const destinationBefore = {};
    const expected = [];
    for (const currency of before.currencies) {
      const inventory = before.sourceInventory.find(
        (r) => r.cashierId === source.cashierId && r.currencyCode === currency.currencyCode
      );
      const available = inventory.denominations.filter((d) => d.availableQuantity >= 1);
      if (!available.length) continue;
      const dest = await api(
        '/fineract-provider/api/v2/base-teller/cash-exchanges/denominations?cashierId=' +
          destination.cashierId +
          '&currencyCode=' +
          currency.currencyCode
      );
      assert.equal(dest.status, 200);
      destinationBefore[currency.currencyCode] = dest.body;
      for (const d of available) {
        await page
          .locator(`[data-currency="${currency.currencyCode}"][data-denomination="${d.denominationId}"]`)
          .fill('1');
        expected.push({
          currency: currency.currencyCode,
          denomination: d.denominationId,
          sourceBefore: d.availableQuantity,
          quantity: 1
        });
      }
    }
    assert(expected.length, 'Real denomination inventory is required.');
    await page.getByRole('button', { name: /Select Checks/ }).click();
    await page.getByRole('heading', { name: 'Cash Drawer Pickup Checks', exact: true }).waitFor();
    const boxes = page.getByRole('dialog').getByRole('checkbox');
    const selectedCount = await boxes.count();
    for (let i = 0; i < selectedCount; i++) await boxes.nth(i).check();
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.screenshot({ path: path.join(output, 'pickup-desktop.png'), fullPage: true });
    const previewWait = page.waitForResponse((r) => r.url().endsWith('/cash-drawer-pickups/preview'));
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const previewResponse = await previewWait;
    assert.equal(previewResponse.status(), 200);
    const preview = await previewResponse.json();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Confirm Transaction' }).waitFor();
    assert(await dialog.getByRole('button', { name: 'Confirm', exact: true }).isDisabled());
    assert.equal(await dialog.locator('[formcontrolname="credential"]').getAttribute('type'), 'password');
    await dialog.locator('[formcontrolname="username"]').fill(headUsername);
    await dialog.locator('[formcontrolname="credential"]').fill('intentionally-invalid');
    const rejectedWait = page.waitForResponse(
      (r) => r.url().endsWith('/cash-drawer-pickups') && r.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
    assert((await rejectedWait).status() >= 400);
    await dialog.getByRole('alert').filter({ hasText: 'Invalid Authorization' }).waitFor();
    assert.equal(await dialog.locator('[formcontrolname="credential"]').inputValue(), '');
    const failedContext = await api(root + '/context');
    assert.deepStrictEqual(failedContext.body.sourceInventory, before.sourceInventory);
    await dialog.locator('[formcontrolname="credential"]').fill(headPassword);
    const completeWait = page.waitForResponse(
      (r) => r.url().endsWith('/cash-drawer-pickups') && r.request().method() === 'POST'
    );
    const refreshWait = page.waitForResponse((r) => r.url().endsWith('/cash-drawer-pickups/context'));
    const createCount = network.filter((r) => r.method === 'POST' && r.url.endsWith('/cash-drawer-pickups')).length;
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).evaluate((button) => {
      button.click();
      button.click();
    });
    const completeResponse = await completeWait;
    assert.equal(completeResponse.status(), 200);
    const result = await completeResponse.json();
    const refreshed = await (await refreshWait).json();
    await page.getByRole('heading', { name: 'Operation Successfully Executed' }).waitFor();
    assert.equal(
      network.filter((r) => r.method === 'POST' && r.url.endsWith('/cash-drawer-pickups')).length,
      createCount + 1
    );
    const inventoryResults = [];
    for (const e of expected) {
      const after = refreshed.sourceInventory
        .find((r) => r.cashierId === source.cashierId && r.currencyCode === e.currency)
        .denominations.find((d) => d.denominationId === e.denomination).availableQuantity;
      const db = destinationBefore[e.currency].denominations.find(
        (d) => d.denominationId === e.denomination
      ).availableQuantity;
      const dest = await api(
        '/fineract-provider/api/v2/base-teller/cash-exchanges/denominations?cashierId=' +
          destination.cashierId +
          '&currencyCode=' +
          e.currency
      );
      const da = dest.body.denominations.find((d) => d.denominationId === e.denomination).availableQuantity;
      assert.equal(e.sourceBefore - after, 1);
      assert.equal(da - db, 1);
      assert.equal(e.sourceBefore + db, after + da);
      inventoryResults.push({
        ...e,
        sourceAfter: after,
        destinationBefore: db,
        destinationAfter: da,
        branchValueUnchanged: true
      });
    }
    const afterChecks = await api(root + '/checks?cashierId=' + source.cashierId);
    const selected = result.currencies.flatMap((c) => c.selectedChecks);
    assert.equal(selected.length, selectedCount);
    for (const check of selected) assert(!afterChecks.body.some((c) => c.source === check.source && c.id === check.id));
    const destChecks = await api(
      '/fineract-provider/api/v2/base-teller/cash-inventory?custodianKey=TELLER%3A' +
        destination.cashierId +
        '&transactionType=CHECK'
    );
    // Retrieve backend history rather than reconstructing the receipt from mutable controls.
    const historical = await api(root + '/' + result.id);
    assert.deepStrictEqual(historical.body, result);
    let printCalls = 0;
    await page.exposeFunction('pickupPrintObserved', () => {
      printCalls++;
    });
    await page.evaluate(() => (window.print = () => window.pickupPrintObserved()));
    for (const label of [
      'Print Receipt',
      'Reprint Receipt'
    ]) {
      const receiptWait = page.waitForResponse((r) =>
        r.url().endsWith('/cash-drawer-pickups/' + result.id + '/receipt')
      );
      await page.getByRole('button', { name: label, exact: true }).click();
      assert.deepStrictEqual(await (await receiptWait).json(), result);
    }
    await page.waitForTimeout(100);
    assert.equal(printCalls, 2);
    await page.screenshot({ path: path.join(output, 'pickup-success.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(750);
    const backdrop = page.locator('.mat-drawer-backdrop.mat-drawer-shown');
    if (await backdrop.isVisible()) await backdrop.click({ position: { x: 370, y: 50 } });
    await page.screenshot({ path: path.join(output, 'pickup-mobile.png'), fullPage: true });
    const overflow = await page
      .locator('mifosx-cash-drawer-pickup')
      .evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    assert.equal(overflow, false);
    const storage = await page.evaluate(() =>
      JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } })
    );
    assert(!storage.includes(headPassword));
    assert(!logs.some((l) => l.includes(headPassword)));
    const evidence = {
      result,
      preview,
      selectedCount,
      inventoryResults,
      sourceChecksAfter: afterChecks.body,
      destinationChecks: destChecks.body,
      network,
      printCalls,
      mobileOverflow: overflow,
      authorizationAbsentFromStorageAndLogs: true,
      duplicateCreatePrevented: true
    };
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(evidence, null, 2));
    console.log(
      JSON.stringify({
        success: true,
        pickup: result.reference,
        selectedChecks: selectedCount,
        inventory: inventoryResults,
        printCalls
      })
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
