/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { expect, Page, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

type Outcome =
  | 'confirmed'
  | 'rejected'
  | 'uncertain'
  | 'receipt-unavailable'
  | 'partial'
  | 'processing'
  | 'long-note'
  | 'offset-time';

async function openPreview(
  page: Page,
  outcome: Outcome = 'confirmed',
  options: { permissions?: string[]; missingCurrency?: boolean; failDecisionNote?: boolean } = {}
) {
  const posts: { path: string; payload: Record<string, unknown> }[] = [];
  let receiptGets = 0;
  let recoveryMatches = false;
  let currencyAvailable = !options.missingCurrency;
  const noteWrites: { note: string }[] = [];
  const notes: { id: number; createdById: number; note: string }[] = [];
  let completeDeposit!: () => void;
  const commandGate = new Promise<void>((resolve) => {
    completeDeposit = resolve;
  });
  const account = {
    id: 77,
    clientId: 10,
    accountNo: 'TEST-0077',
    productName: 'Everyday Savings',
    currency: { code: 'MXN', decimalPlaces: 2 },
    status: { active: true, value: 'Active' },
    summary: { accountBalance: 500210, availableBalance: 500000 }
  };
  await page.addInitScript(
    (permissions: string[]) => {
      const credentials = JSON.stringify({
        authenticated: true,
        userId: 1,
        username: 'fixture',
        officeId: 1,
        officeName: 'Test branch',
        permissions,
        roles: [],
        base64EncodedAuthenticationKey: 'fixture',
        rememberMe: true,
        shouldRenewPassword: false
      });
      localStorage.setItem('mifosXCredentials', credentials);
      sessionStorage.setItem('mifosXCredentials', credentials);
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    },
    options.permissions || ['ALL_FUNCTIONS']
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api\/v\d+/, '');
    if (path === '/savings/77/notes') {
      if (route.request().method() === 'GET') return route.fulfill({ json: notes });
      const payload = route.request().postDataJSON() as { note: string };
      noteWrites.push(payload);
      if (options.failDecisionNote) return route.fulfill({ status: 503, json: {} });
      notes.push({ id: 701, createdById: 1, note: payload.note });
      return route.fulfill({ json: { resourceId: 701 } });
    }
    if (route.request().method() !== 'GET') {
      posts.push({ path: path + url.search, payload: route.request().postDataJSON() });
      if (outcome === 'processing') await commandGate;
      if (outcome === 'uncertain') return route.abort('timedout');
      if (outcome === 'rejected')
        return route.fulfill({ status: 400, json: { defaultUserMessage: 'Synthetic rejection' } });
      return route.fulfill({ json: { resourceId: 24963, savingsId: 77 } });
    }
    let json: unknown = [];
    if (path === '/search')
      json = [{ entityId: 10, entityType: 'CLIENT', entityName: 'Alex Test', entityAccountNo: 'TEST-0010' }];
    else if (path === '/clients/10') json = { id: 10, accountNo: 'TEST-0010', displayName: 'Alex Test', active: true };
    else if (path === '/clients/10/accounts')
      json = { savingsAccounts: [{ ...account, ...(options.missingCurrency ? { currency: undefined } : {}) }] };
    else if (path === '/savingsaccounts/77') {
      if (!currencyAvailable) return route.fulfill({ status: 503, json: {} });
      json = account;
    } else if (path.endsWith('/transactions/template'))
      json = { paymentTypeOptions: [{ id: 1, name: 'Cash Drawer', isCashPayment: true }] };
    else if (path === '/savingsaccounts/77/transactions/24963') {
      receiptGets++;
      if (outcome === 'receipt-unavailable' && receiptGets === 1) return route.fulfill({ status: 503, json: {} });
      json =
        outcome === 'partial'
          ? { id: 24963 }
          : {
              id: 24963,
              accountId: 77,
              accountNo: 'TEST-0077',
              amount: 1000,
              runningBalance: 501210,
              cumulativeBalance: 999999,
              currency: account.currency,
              date: [
                2026,
                11,
                10
              ],
              reversed: false,
              isReversal: false,
              entryType: 'CREDIT',
              transactionType: { value: 'Deposit', deposit: true },
              paymentDetailData: {
                receiptNumber: recoveryMatches ? String(posts[0].payload.receiptNumber) : 'TEST-RECEIPT-24963',
                paymentType: { name: 'Cash Drawer' }
              },
              ...(outcome === 'long-note'
                ? {
                    note: Array.from(
                      { length: 60 },
                      (_, index) =>
                        `${index + 1}: A wrapped receipt note with enough detail to extend over several rendered lines. The entire text must remain legible across page boundaries.`
                    ).join('\n')
                  }
                : {}),
              ...(outcome === 'offset-time' ? { date: [
                      2026,
                      11,
                      11
                    ], transactionTime: '00:30:00Z' } : {}),
              ...(recoveryMatches
                ? {
                    date: (() => {
                      const date = new Date(String(posts[0].payload.transactionDate));
                      return [
                        date.getFullYear(),
                        date.getMonth() + 1,
                        date.getDate()
                      ];
                    })()
                  }
                : {})
            };
    } else if (path === '/notifications') json = { pageItems: [] };
    await route.fulfill({ json });
  });
  await page.goto('/#/organization/base-teller/savings-account-deposits');
  await page.locator('input[formcontrolname="search"]').fill('Alex');
  await page.getByRole('option', { name: /Alex Test/ }).click();
  await page.getByRole('radio', { name: /Everyday Savings/ }).check();
  await page.locator('.selection-next').click();
  await page.locator('input[formcontrolname="transactionAmount"]').fill('1000');
  if (options.missingCurrency) {
    await page.locator('input[formcontrolname="denomination"]').fill('500');
    await page.locator('input[formcontrolname="quantity"]').fill('2');
  } else {
    await page.getByRole('spinbutton', { name: 'Quantity of $500.00', exact: true }).fill('2');
    await page.locator('.details-next').click();
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Preview');
  }
  return {
    posts,
    receiptGets: () => receiptGets,
    completeDeposit,
    noteWrites,
    provideCurrency: () => {
      currencyAvailable = true;
    },
    matchRecovery: () => {
      recoveryMatches = true;
    }
  };
}

test('capture original preview and completed receipt', async ({ page }, testInfo) => {
  test.skip(process.env.WEB1470_BASELINE !== '1', 'Baseline capture only');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const { posts } = await openPreview(page);
  await page.screenshot({ path: testInfo.outputPath('before-preview.png'), fullPage: true });
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-24963');
  await page.screenshot({ path: testInfo.outputPath('before-confirmed.png'), fullPage: true });
  expect(posts).toHaveLength(1);
});

for (const width of [
  390,
  768,
  1280,
  1440,
  1920
]) {
  test(`preview and confirmed receipt at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const { posts } = await openPreview(page);
    const reference = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
    await expect(page.locator('.preview-summary')).toContainText('Alex Test');
    await expect(page.locator('.preview-total')).toContainText('$1,000.00');
    await expect(page.locator('.receipt')).toHaveCount(0);
    await expect(page.getByTestId('deposit-success')).toHaveCount(0);
    expect(posts).toHaveLength(0);
    await page.screenshot({ path: testInfo.outputPath(`preview-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
    await expect(page.getByTestId('deposit-success')).toContainText('Deposit applied successfully');
    await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-24963');
    await expect(page.locator('.receipt')).toContainText('24963');
    await expect(page.locator('.receipt')).toContainText('Cash Drawer');
    await expect(page.getByTestId('confirmed-balances')).toContainText('$500,210.00');
    await expect(page.getByTestId('confirmed-balances')).toContainText('$501,210.00');
    await expect(page.locator('.receipt')).not.toContainText('999999');
    expect(posts).toHaveLength(1);
    expect(posts[0].path).toBe('/savingsaccounts/77/transactions?command=deposit');
    expect(posts[0].payload).toMatchObject({ transactionAmount: 1000, paymentTypeId: 1, receiptNumber: reference });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page
      .locator('.confirmation-layout')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 1280 ? 2 : 1);
    await page.screenshot({ path: testInfo.outputPath(`confirmed-${width}.png`), fullPage: true });
    const blue = await page
      .getByTestId('deposit-success')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const rgb = blue.match(/\d+/g)!.map(Number);
    expect(rgb[2]).toBeGreaterThan(rgb[1]);
    await page.getByRole('tab', { name: /Customer and Account/ }).click({ force: true });
    await expect(page.locator('mat-step-header[aria-selected="true"]')).toContainText('Preview');
    await page.getByRole('button', { name: 'New Deposit', exact: true }).click();
    await expect(page.locator('input[formcontrolname="search"]')).toBeFocused();
    await expect(page.getByTestId('deposit-success')).toHaveCount(0);
    expect(await page.locator('input[formcontrolname="receiptNumber"]').inputValue()).not.toBe(reference);
    expect(posts).toHaveLength(1);
  });
}

for (const outcome of [
  'rejected',
  'uncertain'
] as const) {
  test(`${outcome} never displays success or retries`, async ({ page }, testInfo) => {
    const { posts } = await openPreview(page, outcome);
    const reference = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
    await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
    if (outcome === 'rejected') await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.getByTestId('deposit-success')).toHaveCount(0);
    await expect(page.locator('.receipt')).toHaveCount(0);
    if (outcome === 'uncertain') {
      await expect(page.locator('.uncertain')).toContainText(reference);
      await expect(page.locator('.preview-total')).not.toContainText('has not been submitted');
      await expect(page.getByRole('button', { name: 'Confirm deposit', exact: true })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
    }
    expect(posts).toHaveLength(1);
    await page.screenshot({ path: testInfo.outputPath(`${outcome}.png`), fullPage: true });
  });
}

test('receipt recovery retains confirmed command and never posts twice', async ({ page }, testInfo) => {
  const { posts, receiptGets } = await openPreview(page, 'receipt-unavailable');
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.getByTestId('deposit-success')).toBeVisible();
  await expect(page.locator('.receipt-recovery')).toContainText('The deposit is confirmed');
  await expect(page.locator('.receipt')).toContainText('not a backend-confirmed receipt number');
  await expect(page.locator('.balance-equation')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('receipt-unavailable.png'), fullPage: true });
  await page.getByRole('button', { name: 'Retrieve receipt details', exact: true }).click();
  await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-24963');
  expect(receiptGets()).toBe(2);
  expect(posts).toHaveLength(1);
});

test('partial receipt never invents balance, timestamp, cashier, branch or sharing', async ({ page }) => {
  const { posts } = await openPreview(page, 'partial');
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.getByTestId('deposit-success')).toBeVisible();
  await expect(page.locator('.receipt-fields')).toContainText('Unavailable');
  await expect(page.locator('.receipt-fields')).not.toContainText('Test branch');
  await expect(page.locator('.receipt-fields')).not.toContainText('fixture');
  await expect(page.locator('.balance-equation, .barcode, a[href^="mailto:"]')).toHaveCount(0);
  expect(posts).toHaveLength(1);
});

test('receipt-focused print, working PDF and Finish never repeat the financial POST', async ({ page }, testInfo) => {
  const { posts } = await openPreview(page);
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-24963');
  await page.evaluate(() => {
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls = 1;
    };
  });
  await page.getByRole('button', { name: 'Print Receipt', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { printCalls: number }).printCalls)).toBe(1);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('deposit-24963.pdf');
  await download.saveAs(testInfo.outputPath('deposit-24963.pdf'));
  expect(await download.failure()).toBeNull();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.receipt')).toBeVisible();
  await expect(page.locator('.confirmation-main')).toBeHidden();
  await expect(page.locator('.confirmation-footer')).toBeHidden();
  await expect(page.locator('.receipt-actions')).toBeHidden();
  await expect(page.locator('.mat-horizontal-stepper-header-container')).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('print.png'), fullPage: true });
  await page.pdf({ path: testInfo.outputPath('printed-receipt.pdf'), format: 'A4' });
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page).toHaveURL(/#\/organization\/base-teller$/);
  expect(posts).toHaveLength(1);
});

test('blue branding and readable receipt in dark mode', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPreview(page);
  await page.evaluate(() => document.body.classList.add('dark-theme'));
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.receipt')).toContainText('TEST-RECEIPT-24963');
  await page.screenshot({ path: testInfo.outputPath('confirmed-dark.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('processing locks confirmation and destination until the command completes', async ({ page }) => {
  const { posts, completeDeposit } = await openPreview(page, 'processing');
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.preview-notice')).toContainText('Processing deposit');
  await expect(page.locator('.preview-total')).not.toContainText('has not been submitted');
  await expect(page.getByRole('button', { name: 'Confirm deposit', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
  await expect(page.getByTestId('deposit-success')).toHaveCount(0);
  await expect(page.locator('.receipt')).toHaveCount(0);
  await expect.poll(() => posts.length).toBe(1);
  completeDeposit();
  await expect(page.getByTestId('deposit-success')).toBeVisible();
  expect(posts).toHaveLength(1);
});

test('uncertain deposit remains blocked after Review History, Back and reload; verification only uses GET', async ({
  page
}, testInfo) => {
  const { posts, matchRecovery } = await openPreview(page, 'uncertain');
  const reference = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.uncertain')).toContainText(reference);
  await page.getByRole('link', { name: 'Review account history', exact: true }).click();
  await expect(page).toHaveURL(/#\/clients\/10\/savings-accounts\/77\/transactions$/);
  await page.goBack();
  await expect(page.locator('.uncertain')).toContainText(reference);
  await expect(page.getByRole('button', { name: 'Confirm deposit', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.locator('.uncertain')).toContainText(reference);
  await expect(page.locator('input[formcontrolname="receiptNumber"]')).toHaveValue(reference);
  await page.getByRole('textbox', { name: 'Transaction Id', exact: true }).fill('24963');
  await page.getByRole('button', { name: 'Verify existing transaction', exact: true }).click();
  await expect(page.locator('.deposit-recovery-controls [role="alert"]')).toContainText('remains blocked');
  await expect(page.getByTestId('deposit-success')).toHaveCount(0);
  matchRecovery();
  await page.getByRole('button', { name: 'Verify existing transaction', exact: true }).click();
  await expect(page.getByTestId('deposit-success')).toBeVisible();
  await expect(page.locator('.receipt')).toContainText(reference);
  expect(posts).toHaveLength(1);
  await page.screenshot({ path: testInfo.outputPath('reconciled-deposit.png'), fullPage: true });
  await page.reload();
  await expect(page.locator('.selection-next')).toBeVisible();
  expect(posts).toHaveLength(1);
});

test.describe('ledger calendar date', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });
  test('does not move the transaction date into the previous day when an offset time is supplied', async ({ page }) => {
    const { posts } = await openPreview(page, 'offset-time');
    await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
    await expect(page.locator('.receipt-fields')).toContainText('Nov 11, 2026');
    await expect(page.locator('.receipt-fields')).toContainText('00:30:00Z');
    await expect(page.locator('.receipt-fields')).not.toContainText('Nov 10, 2026');
    expect(posts).toHaveLength(1);
  });
});

test('exports a wrapped multi-page note using measured row and line breaks', async ({ page }, testInfo) => {
  const { posts } = await openPreview(page, 'long-note');
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.receipt-fields')).toContainText('60: A wrapped receipt note');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
  const download = await downloadEvent;
  const path = testInfo.outputPath('long-note.pdf');
  await download.saveAs(path);
  const pdf = await readFile(path);
  const pageCount = /\/Count\s+(\d+)/.exec(pdf.toString('latin1'));
  expect(Number(pageCount?.[1])).toBeGreaterThan(1);
  expect(await download.failure()).toBeNull();
  expect(posts).toHaveLength(1);
});

test('missing currency blocks submission until original account metadata is retrieved, then recovery matches', async ({
  page
}) => {
  const { posts, provideCurrency, matchRecovery } = await openPreview(page, 'uncertain', { missingCurrency: true });
  await expect(page.locator('.details-next')).toBeDisabled();
  await expect(page.locator('.deposit-sidebar')).toContainText('Account currency and decimal precision are required');
  expect(posts).toHaveLength(0);
  provideCurrency();
  await page.getByTestId('retry-deposit-currency').click();
  await expect(page.locator('.cash-row')).toHaveCount(11);
  await page.getByRole('spinbutton', { name: 'Quantity of $500.00', exact: true }).fill('2');
  await page.locator('.details-next').click();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.uncertain')).toBeVisible();
  matchRecovery();
  await page.getByRole('textbox', { name: 'Transaction Id', exact: true }).fill('24963');
  await page.getByRole('button', { name: 'Verify existing transaction', exact: true }).click();
  await expect(page.getByTestId('deposit-success')).toBeVisible();
  expect(posts).toHaveLength(1);
});

async function fillNonPostingDecision(page: Page, reference: string) {
  await page.locator('[formcontrolname="outcome"]').click();
  await page.getByRole('option', { name: 'Confirmed not posted', exact: true }).click();
  await page.getByRole('textbox', { name: 'Repeat the original request reference', exact: true }).fill(reference);
  await page.getByRole('textbox', { name: 'Evidence or case reference', exact: true }).fill('CASE-1470');
  await page
    .getByRole('textbox', { name: 'Reason and reconciliation findings', exact: true })
    .fill('Bank operations independently confirmed the original request never reached posting.');
  await page.getByRole('checkbox', { name: /I independently verified/ }).check();
}

test('authorized non-posting adjudication saves a real account note, releases the lock, and never retries money movement', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  const { posts, noteWrites } = await openPreview(page, 'uncertain');
  const reference = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.non-posting-reconciliation')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Record reconciliation decision', exact: true })).toBeDisabled();
  await fillNonPostingDecision(page, reference);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Record reconciliation decision', exact: true }).click();
  await expect(page.locator('.decision-recorded')).toContainText(reference);
  await expect(page.locator('.decision-recorded')).toContainText('701');
  await expect(page.getByTestId('deposit-success')).toHaveCount(0);
  await expect(page.locator('.receipt')).toHaveCount(0);
  expect(noteWrites).toHaveLength(1);
  expect(JSON.parse(noteWrites[0].note)).toMatchObject({
    outcome: 'NOT_POSTED',
    requestReference: reference,
    reviewerId: 1,
    evidence: 'CASE-1470'
  });
  expect(posts).toHaveLength(1);
  await page.screenshot({ path: testInfo.outputPath('non-posting-decision.png'), fullPage: true });
  await page.getByRole('button', { name: 'New Deposit', exact: true }).click();
  await expect(page.locator('input[formcontrolname="search"]')).toBeFocused();
  expect(await page.locator('input[formcontrolname="receiptNumber"]').inputValue()).not.toBe(reference);
  expect(posts).toHaveLength(1);
});

test('failed decision persistence leaves the unresolved request blocked across reloads', async ({ page }) => {
  const { posts } = await openPreview(page, 'uncertain', { failDecisionNote: true });
  const reference = await page.locator('input[formcontrolname="receiptNumber"]').inputValue();
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await fillNonPostingDecision(page, reference);
  await page.getByRole('button', { name: 'Record reconciliation decision', exact: true }).click();
  await expect(page.locator('.deposit-recovery-controls [role="alert"]')).toContainText('remains blocked');
  await expect(page.locator('.decision-recorded')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.uncertain')).toContainText(reference);
  await expect(page.getByRole('button', { name: 'Confirm deposit', exact: true })).toBeDisabled();
  expect(posts).toHaveLength(1);
});

test('ordinary tellers cannot record a non-posting decision', async ({ page }) => {
  const { posts, noteWrites } = await openPreview(page, 'uncertain', { permissions: [
      'DEPOSIT_SAVINGSACCOUNT',
      'READ_SAVINGSACCOUNT'
    ] });
  await page.getByRole('button', { name: 'Confirm deposit', exact: true }).click();
  await expect(page.locator('.uncertain')).toBeVisible();
  await expect(page.locator('.non-posting-reconciliation')).toHaveCount(0);
  expect(noteWrites).toHaveLength(0);
  expect(posts).toHaveLength(1);
});
