// Opt-in real local Fineract acceptance. Posts four account transfers using backend-discovered accounts.
// Credentials and client search terms are supplied via environment; no interception or stored auth state.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseAccountResponse, toMinorUnits } = require('./acceptance-money.cjs');
const base = process.env.E2E_WEB_URL || 'http://127.0.0.1:4200';
const output = process.env.TRANSFER_RESULTS_DIR;
const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;
const orderingQuery = process.env.TRANSFER_ORDERING_QUERY;
const beneficiaryQuery = process.env.TRANSFER_BENEFICIARY_QUERY;
assert(output && username && password && orderingQuery && beneficiaryQuery, 'Supply documented acceptance variables.');
const root = '/fineract-provider/api/v2/base-teller/account-transfers';
const headers = {
  Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
  'Fineract-Platform-TenantId': 'default'
};
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = { network: [], flows: [] };
  let debugPage;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await context.addInitScript((url) => {
      localStorage.setItem('mifosXServerURL', url);
      localStorage.setItem('mifosXServers', JSON.stringify([url]));
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en-US' }));
      window.receiptPrintEvents = 0;
      window.receiptPrintCalls = 0;
      // Observe printing while forwarding every invocation to the native browser implementation.
      const nativePrint = window.print.bind(window);
      window.print = () => {
        window.receiptPrintCalls++;
        return nativePrint();
      };
      window.addEventListener('beforeprint', () => window.receiptPrintEvents++);
    }, base);
    const page = await context.newPage();
    debugPage = page;
    const errors = [];
    page.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('PAGEERROR', e.message);
    });
    const devtools = await context.newCDPSession(page);
    await devtools.send('Network.enable');
    page.on('response', (r) => {
      if (r.url().includes('/account-transfers'))
        results.network.push({
          method: r.request().method(),
          url: r.url(),
          status: r.status(),
          body: r.request().postData()
        });
    });
    async function api(endpoint, method = 'GET', data, parseResponse = JSON.parse) {
      const response = await context.request.fetch(base + endpoint, { method, headers, data });
      const body = parseResponse(await response.text());
      const details = endpoint.endsWith('/users') ? 'User creation failed' : JSON.stringify(body);
      assert.equal(response.status(), 200, endpoint + ': ' + details);
      return body;
    }
    const ordering = (
      await api(root + '/clients?name=' + encodeURIComponent(orderingQuery) + '&limit=10')
    ).pageItems.find((c) => c.active);
    const beneficiary = (
      await api(root + '/clients?name=' + encodeURIComponent(beneficiaryQuery) + '&limit=10')
    ).pageItems.find((c) => c.active && c.clientId !== ordering?.clientId);
    assert(ordering && beneficiary, 'Provide two visible active clients.');
    const sources = await api(root + '/clients/' + ordering.clientId + '/source-accounts');
    const source = sources.find((a) => a.canDebit && Number(a.withdrawableBalance) > 10);
    assert(source, 'A funded source is required.');
    const own = (
      await api(
        root +
          '/clients/' +
          ordering.clientId +
          '/destination-accounts?sourceAccountId=' +
          source.accountId +
          '&operationType=BETWEEN_MY_ACCOUNTS'
      )
    ).find((a) => a.accountType === 'SAVINGS');
    const third = (
      await api(
        root +
          '/clients/' +
          ordering.clientId +
          '/destination-accounts?sourceAccountId=' +
          source.accountId +
          '&operationType=TO_THIRD_PARTY&beneficiaryClientId=' +
          beneficiary.clientId
      )
    ).find((a) => a.accountType === 'SAVINGS');
    assert(own && third, 'Eligible own and third-party savings destinations are required.');
    async function balances(target) {
      const a = await api(
        '/fineract-provider/api/v1/savingsaccounts/' + source.accountId,
        'GET',
        undefined,
        parseAccountResponse
      );
      const b = await api(
        '/fineract-provider/api/v1/savingsaccounts/' + target.accountId,
        'GET',
        undefined,
        parseAccountResponse
      );
      return { source: a.summary.accountBalance, target: b.summary.accountBalance };
    }
    const inventory = async () =>
      (await api('/fineract-provider/api/v2/base-teller/cash-inventory')).map(({ asOf, ...row }) => row);
    const inventoryBefore = await inventory();
    const closingBefore = await api('/fineract-provider/api/v2/base-teller/end-of-day-closing/context');
    await page.goto(base + '/#/login');
    await page.locator('[formcontrolname="username"]').fill(username);
    await page.locator('[formcontrolname="password"]').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL((u) => !u.hash.includes('login'), { timeout: 60000 });
    await page.goto(base + '/#/organization/base-teller');
    await page.getByRole('heading', { name: 'Other Operations', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Transfers Between Accounts', exact: true }).click();
    await page.getByRole('heading', { name: 'Transfers Between Accounts', exact: true }).waitFor();
    async function select(control, text) {
      await page.locator('mat-select[formcontrolname="' + control + '"]').click();
      await page.getByRole('option').filter({ hasText: text }).first().click();
    }
    async function selectOrdering(byName) {
      const search = page.locator('mifosx-transfer-client-search').first();
      if (byName) {
        await search.locator('mat-select').click();
        await page.getByRole('option', { name: 'Client Name', exact: true }).click();
      }
      await search.locator('input').fill(byName ? ordering.displayName : ordering.clientNumber);
      await search.getByRole('button', { name: 'Search Client', exact: true }).click();
      await search
        .getByRole('button', { name: ordering.clientNumber + ' · ' + ordering.displayName, exact: true })
        .click();
      await select('operation', 'Between My Accounts');
      await select('source', source.accountNo);
    }
    for (const method of [
      'own',
      'accountNumber',
      'clientNumber',
      'name'
    ]) {
      const target = method === 'own' ? own : third;
      console.log('Checking flow:', method);
      await selectOrdering(method === 'name');
      if (method !== 'own') {
        await select('operation', 'To Third Parties');
        if (method === 'accountNumber') {
          await page.locator('input').filter({ visible: true }).count();
          await page.getByLabel('Account Number', { exact: true }).fill(third.accountNo);
          await page.getByRole('button', { name: 'Search Beneficiary', exact: true }).click();
          await page.locator('mat-select[formcontrolname="target"]').waitFor();
        } else {
          await select('method', method === 'clientNumber' ? 'Third-Party Client Number' : 'Third-Party Name');
          const search = page.locator('mifosx-transfer-client-search');
          await search
            .locator('input')
            .fill(method === 'clientNumber' ? beneficiary.clientNumber : beneficiary.displayName);
          await search.getByRole('button', { name: 'Search Client', exact: true }).click();
          await search
            .getByRole('button', { name: beneficiary.clientNumber + ' · ' + beneficiary.displayName, exact: true })
            .click();
          await select('target', third.accountNo);
        }
      } else await select('target', own.accountNo);
      await page.locator('[formcontrolname="amount"]').fill('1');
      const before = await balances(target);
      await page.locator('.mat-mdc-select-panel').waitFor({ state: 'hidden' });
      await page.screenshot({ path: path.join(output, method + '-form.png'), fullPage: true, animations: 'disabled' });
      const previewResponse = page.waitForResponse((r) => r.url().endsWith('/account-transfers/preview'));
      await page.getByRole('button', { name: 'Preview Transfer', exact: true }).click();
      const preview = await (await previewResponse).json();
      await page.getByRole('heading', { name: 'General Transaction', exact: true }).waitFor();
      assert.equal(preview.balanced, true);
      const summaryText = await page.locator('mifosx-transfer-summary').innerText();
      for (const value of [
        preview.orderingClient.displayName,
        preview.beneficiaryClient.displayName,
        source.accountNo,
        target.accountNo,
        source.currencyCode
      ]) assert(summaryText.includes(value));
      assert.deepEqual(preview.inflowsByCurrency, preview.outflowsByCurrency);
      await page.getByRole('heading', { name: 'Outflows', exact: true }).waitFor();
      await page.getByRole('heading', { name: 'Inflows', exact: true }).waitFor();
      assert.deepEqual(await balances(target), before, 'Preview must not mutate balances');
      await page.screenshot({ path: path.join(output, method + '-preview.png'), fullPage: true });
      const start = results.network.filter((n) => n.method === 'POST' && n.url.endsWith('/account-transfers')).length;
      const createResponse = page.waitForResponse(
        (r) => r.url().endsWith('/account-transfers') && r.request().method() === 'POST'
      );
      await page.getByRole('button', { name: 'Confirm Transfer', exact: true }).evaluate((button) => {
        button.click();
        button.click();
      });
      const created = await createResponse;
      assert.equal(created.status(), 200);
      const receipt = await created.json();
      const submitted = JSON.parse(created.request().postData());
      assert.deepEqual(
        Object.keys(submitted).sort(),
        [
          'amount',
          'idempotencyKey',
          'operationType',
          'orderingClientId',
          'sourceAccountId',
          'targetAccountId',
          'targetAccountType'
        ].sort()
      );
      assert.equal(submitted.amount, 1);
      await page.getByRole('heading', { name: 'Operation Successfully Executed', exact: true }).waitFor();
      assert.equal(
        results.network.filter((n) => n.method === 'POST' && n.url.endsWith('/account-transfers')).length,
        start + 1
      );
      const after = await balances(target);
      assert.equal(
        toMinorUnits(after.source, source.decimalPlaces),
        toMinorUnits(before.source, source.decimalPlaces) - toMinorUnits(String(submitted.amount), source.decimalPlaces)
      );
      assert.equal(
        toMinorUnits(after.target, target.decimalPlaces),
        toMinorUnits(before.target, target.decimalPlaces) + toMinorUnits(String(submitted.amount), target.decimalPlaces)
      );
      const duplicate = await api(root, 'POST', JSON.parse(created.request().postData()));
      assert.equal(duplicate.transferId, receipt.transferId);
      assert.deepEqual(await balances(target), after);
      const printResponse = page.waitForResponse((r) => r.url().endsWith('/' + receipt.transferId + '/receipt'));
      await page.getByRole('button', { name: 'Print Receipt', exact: true }).click();
      await printResponse;
      await page.getByRole('button', { name: 'Reprint Receipt', exact: true }).waitFor();
      const reprintResponse = page.waitForResponse((r) => r.url().endsWith('/' + receipt.transferId + '/receipt'));
      await page.getByRole('button', { name: 'Reprint Receipt', exact: true }).click();
      await reprintResponse;
      if (method === 'own')
        await page.pdf({ path: path.join(output, 'backend-receipt.pdf'), format: 'A4', printBackground: true });
      const history = await api(
        '/fineract-provider/api/v2/base-teller/transaction-history?operation=ACCOUNT_TRANSFER&reference=' +
          receipt.reference
      );
      assert.equal(history.totalFilteredRecords, 1);
      await page.screenshot({ path: path.join(output, method + '-success.png'), fullPage: true });
      results.flows.push({
        method,
        before,
        after,
        preview,
        receipt,
        duplicateTransferId: duplicate.transferId,
        historyOperations: history.totalFilteredRecords
      });
      await page.getByRole('button', { name: 'New Transfer', exact: true }).click();
    }
    assert(
      await page.evaluate(() => window.receiptPrintCalls >= 8),
      'Print and reprint must call the native browser print implementation'
    );
    const historical = results.flows[0].receipt;
    await page.getByLabel('Transfer Reference', { exact: true }).fill(String(historical.transferId));
    await page.getByRole('button', { name: 'Transfer Receipt', exact: true }).click();
    await page.getByRole('heading', { name: 'Transfer Receipt', exact: true }).waitFor();
    assert((await page.locator('mifosx-transfer-summary').innerText()).includes(historical.source.accountNo));
    await page.getByRole('button', { name: 'New Transfer', exact: true }).click();
    results.historicalReceiptRetrieved = true;
    // Client search empty states, amount precision, same-account exclusion and insufficient funds in the UI.
    await selectOrdering(false);
    await page.locator('mat-select[formcontrolname="target"]').click();
    assert.equal(await page.getByRole('option').filter({ hasText: source.accountNo }).count(), 0);
    await page.getByRole('option').filter({ hasText: own.accountNo }).click();
    const amount = page.locator('[formcontrolname="amount"]');
    for (const value of [
      '0',
      '-1',
      '1.001'
    ]) {
      await amount.fill(value);
      await amount.blur();
      assert(await page.getByRole('button', { name: 'Preview Transfer', exact: true }).isDisabled());
    }
    const beforeRejected = await balances(own);
    await amount.fill('9999999999999');
    const rejected = page.waitForResponse((r) => r.url().endsWith('/account-transfers/preview'));
    await page.getByRole('button', { name: 'Preview Transfer', exact: true }).click();
    assert((await rejected).status() >= 400);
    await page.getByRole('alert').filter({ hasText: 'Insufficient transferable funds' }).waitFor();
    assert.deepEqual(await balances(own), beforeRejected, 'Rejected preview must not change either account');
    results.insufficientFunds = true;
    results.sameAccountExcluded = true;
    await page.setViewportSize({ width: 390, height: 844 });
    const backdrop = page.locator('.mat-drawer-backdrop.mat-drawer-shown');
    if (await backdrop.isVisible()) await backdrop.click();
    await page.locator('.mat-drawer-backdrop.mat-drawer-shown').waitFor({ state: 'hidden' });
    await page.locator('mifosx-account-transfers h2').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true, animations: 'disabled' });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      'Mobile must not overflow'
    );
    assert.deepEqual(await inventory(), inventoryBefore);
    assert.deepEqual(await api('/fineract-provider/api/v2/base-teller/end-of-day-closing/context'), closingBefore);
    results.cashInventoryUnchanged = true;
    results.closingContextUnchanged = true;
    const suffix = require('node:crypto').randomBytes(6).toString('hex');
    const role = await api('/fineract-provider/api/v1/roles', 'POST', {
      name: 'WEB1261 read-denied ' + suffix,
      description: 'Disposable local browser permission validation'
    });
    let restrictedUser;
    try {
      await api('/fineract-provider/api/v1/roles/' + role.resourceId + '/permissions', 'PUT', {
        permissions: { READ_CLIENT: true }
      });
      const restrictedName = 'web1261denied' + suffix;
      let restrictedPassword;
      do {
        restrictedPassword = require('node:crypto').randomBytes(24).toString('base64url') + 'Aa1!';
      } while (/(.)\1/.test(restrictedPassword));
      restrictedUser = await api('/fineract-provider/api/v1/users', 'POST', {
        username: restrictedName,
        firstname: 'Permission',
        lastname: 'Test',
        email: restrictedName + '@example.invalid',
        officeId: ordering.officeId,
        roles: [role.resourceId],
        sendPasswordToEmail: false,
        password: restrictedPassword,
        repeatPassword: restrictedPassword,
        passwordNeverExpires: true
      });
      const deniedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await deniedContext.addInitScript((url) => {
        localStorage.setItem('mifosXServerURL', url);
        localStorage.setItem('mifosXServers', JSON.stringify([url]));
      }, base);
      const deniedPage = await deniedContext.newPage();
      await deniedPage.goto(base + '/#/login');
      await deniedPage.locator('[formcontrolname="username"]').fill(restrictedName);
      await deniedPage.locator('[formcontrolname="password"]').fill(restrictedPassword);
      await deniedPage.getByRole('button', { name: 'Login', exact: true }).click();
      await deniedPage.waitForURL((u) => !u.hash.includes('login'), { timeout: 60000 });
      await deniedPage.goto(base + '/#/organization/base-teller');
      await deniedPage.getByRole('heading', { name: 'Base Teller', exact: true }).waitFor();
      assert.equal(await deniedPage.getByRole('link', { name: 'Transfers Between Accounts', exact: true }).count(), 0);
      await deniedPage.goto(base + '/#/organization/base-teller/account-transfers');
      await deniedPage.waitForURL((u) => u.hash === '#/organization/base-teller');
      const deniedResponse = await deniedContext.request.get(base + root + '/context', {
        headers: {
          Authorization: 'Basic ' + Buffer.from(restrictedName + ':' + restrictedPassword).toString('base64'),
          'Fineract-Platform-TenantId': 'default'
        }
      });
      assert.equal(deniedResponse.status(), 403);
      results.permissionChecks = { cardHidden: true, directRouteRedirected: true, backendDenied: 403 };
      await deniedContext.close();
    } finally {
      if (restrictedUser)
        assert(
          (
            await context.request.delete(base + '/fineract-provider/api/v1/users/' + restrictedUser.resourceId, {
              headers
            })
          ).ok()
        );
      assert(
        (await context.request.delete(base + '/fineract-provider/api/v1/roles/' + role.resourceId, { headers })).ok()
      );
    }
    results.browserErrors = errors;
    assert.equal(errors.length, 0, JSON.stringify(errors));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(
      JSON.stringify(
        {
          flows: results.flows.map((f) => ({
            method: f.method,
            transferId: f.receipt.transferId,
            before: f.before,
            after: f.after
          })),
          networkRequests: results.network.length,
          cashInventoryUnchanged: true,
          closingContextUnchanged: true,
          browserErrors: errors
        },
        null,
        2
      )
    );
  } catch (e) {
    console.log('FAILURE NETWORK', JSON.stringify(results.network));
    if (debugPage) {
      console.log('FAILURE PAGE', await debugPage.locator('body').innerText());
      await debugPage.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    }
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
