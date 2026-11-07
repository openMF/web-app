/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// Opt-in destructive acceptance: closes the real sessions supplied in EOD_FIXTURES.
// No request interception, HTTP stubs, saved authentication state, or trace payloads.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fixture = JSON.parse(fs.readFileSync(process.env.EOD_FIXTURES, 'utf8'));
const credentials = { username: process.env.E2E_USERNAME, password: process.env.E2E_PASSWORD };
const authorizationKey = process.env.EOD_AUTHORIZATION_KEY;
const baseUrl = process.env.E2E_WEB_URL || 'http://127.0.0.1:4200';
const output = process.env.EOD_RESULTS_DIR;
assert(
  credentials.username && credentials.password && authorizationKey && output,
  'Supply all documented acceptance environment variables.'
);
fs.mkdirSync(output, { recursive: true });
let phase = 'launch';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript((url) => {
    localStorage.setItem('mifosXServerURL', url);
    localStorage.setItem('mifosXServers', JSON.stringify([url]));
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en-US' }));
  }, baseUrl);
  const page = await context.newPage();
  let logs = [],
    network = [];
  const devtools = await context.newCDPSession(page);
  await devtools.send('Network.enable');
  page.on('console', (m) => logs.push(m.text()));
  page.on('pageerror', (e) => logs.push(e.message));
  page.on('response', (r) => {
    if (r.url().includes('/end-of-day-closing')) {
      network.push({ method: r.request().method(), url: r.url(), status: r.status() });
    }
  });
  await page.goto(baseUrl + '/#/login');
  await page.locator('input[formcontrolname="username"]').fill(credentials.username);
  await page.locator('input[formcontrolname="password"]').fill(credentials.password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL((u) => !u.hash.includes('login'), { timeout: 60000 });
  const evidence = [];
  for (const scenario of fixture.scenarios.filter((s) => s.name !== 'direct')) {
    await page.goto(baseUrl + '/#/organization/base-teller/end-of-day-cash-closing');
    await page.getByRole('heading', { name: 'Final Cash Closing', exact: true }).waitFor();
    phase = scenario.name;
    await page.locator('mifosx-end-of-day-closing mat-select').click();
    await page.getByRole('option').filter({ hasText: scenario.preview.cashierName }).click();
    for (const c of scenario.declaration.currencies) {
      for (const d of c.denominations)
        await page.locator(`[data-denomination="${d.denominationId}"]`).fill(String(d.quantity));
      await page.locator(`[data-vouchers="${c.currencyCode}"]`).fill(String(c.vouchers));
    }
    await page.getByRole('button', { name: 'Select Checks', exact: true }).click();
    await page.getByRole('heading', { name: 'Final Cash Closing Checks', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    const previewWait = page.waitForResponse((r) => r.url().endsWith('/end-of-day-closing/preview'));
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const preview = await (await previewWait).json();
    assert.deepStrictEqual(preview.balancesByCurrency, scenario.preview.balancesByCurrency);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Confirm Transaction' }).waitFor();
    assert(await dialog.getByRole('button', { name: 'Accept', exact: true }).isDisabled());
    await dialog.locator('[formcontrolname="username"]').fill(fixture.primaryUsername);
    if (scenario.name === 'balanced') {
      await dialog.locator('[formcontrolname="credential"]').fill(randomUUID());
      await dialog.getByRole('button', { name: 'Accept', exact: true }).click();
      await dialog.getByRole('alert').filter({ hasText: 'Invalid Authorization' }).waitFor();
      assert.equal(await dialog.locator('[formcontrolname="credential"]').inputValue(), '');
    }
    await dialog.locator('[formcontrolname="credential"]').fill(authorizationKey);
    const completedWait = page.waitForResponse(
      (r) => r.url().endsWith('/end-of-day-closing') && r.request().method() === 'POST'
    );
    const beforeComplete = network.filter((r) => r.method === 'POST' && r.url.endsWith('/end-of-day-closing')).length;
    await dialog.getByRole('button', { name: 'Accept', exact: true }).evaluate((button) => {
      button.click();
      button.click();
    });
    const completed = await (await completedWait).json();
    await page.getByRole('heading', { name: 'Operation Successfully Executed' }).waitFor();
    assert.equal(
      network.filter((r) => r.method === 'POST' && r.url.endsWith('/end-of-day-closing')).length,
      beforeComplete + 1
    );
    assert.deepStrictEqual(
      completed.balancesByCurrency.map((b) => [
        b.currencyCode,
        b.expectedTotal,
        b.declaredTotal,
        b.shortage,
        b.overage
      ]),
      preview.balancesByCurrency.map((b) => [
        b.currencyCode,
        b.expectedTotal,
        b.declaredTotal,
        b.shortage,
        b.overage
      ])
    );
    let reportWait = page.waitForResponse((r) => r.url().endsWith('/' + completed.id + '/report'));
    await page.getByRole('button', { name: 'Print Report', exact: true }).click();
    let report = await (await reportWait).json();
    assert.deepStrictEqual(report, completed);
    reportWait = page.waitForResponse((r) => r.url().endsWith('/' + completed.id + '/report'));
    await page.getByRole('button', { name: 'Reprint Report', exact: true }).click();
    assert.deepStrictEqual(await (await reportWait).json(), report);
    await page.screenshot({ path: path.join(output, scenario.name + '.png'), fullPage: true });
    const stored = await page.evaluate(() =>
      JSON.stringify([
        Object.entries(localStorage),
        Object.entries(sessionStorage)
      ])
    );
    assert(!stored.includes(authorizationKey));
    assert(!logs.some((l) => l.includes(authorizationKey)));
    evidence.push({
      scenario: scenario.name,
      completed,
      reportMatches: true,
      reprintMatches: true,
      credentialAbsentFromStorageAndConsole: true
    });
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('heading', { name: 'Final Cash Closing', exact: true }).waitFor();
  }
  fs.writeFileSync(
    path.join(output, 'browser-results.json'),
    JSON.stringify({ evidence, network, consoleErrorCount: logs.filter((l) => l.includes('ERROR')).length }, null, 2)
  );
  console.log(
    JSON.stringify({
      scenarios: evidence.map((e) => ({ name: e.scenario, id: e.completed.id, status: e.completed.status })),
      requests: network.length
    })
  );
  await browser.close();
})().catch(() => {
  console.error(
    'Real backend acceptance failed during: ' +
      phase +
      '. Inspect the browser and backend using the documented steps; sensitive error payloads are intentionally omitted.'
  );
  process.exit(1);
});
