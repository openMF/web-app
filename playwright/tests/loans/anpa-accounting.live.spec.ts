/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';

/** Real backend only: no page.route or response substitution is used in this suite. */
test.describe('WEB-1205 live local ANPA integration', () => {
  test.skip(!process.env.E2E_ANPA_LOAN_ID, 'Set E2E_ANPA_LOAN_ID to an approved synthetic standard loan.');
  const loan = process.env.E2E_ANPA_LOAN_ID;
  const writtenOff = process.env.E2E_ANPA_WRITTEN_OFF_LOAN_ID;
  test('reads capabilities, previews and responsive evidence through the proxy', async ({ page }, testInfo) => {
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/anpa-writeoff/')) requests.push(r.url());
    });
    await page.goto(`/#/loans/${loan}/general`);
    await page.getByRole('tab', { name: 'NPA Accounting', exact: true }).click();
    const panel = page.locator('mifosx-anpa-accounting');
    await expect(panel.getByText(/Backend connected/)).toBeVisible({ timeout: 15000 });
    await expect(panel.getByText('Native Correction Unavailable', { exact: true })).toBeVisible();
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'Receivables' }).click();
    await expect(panel.locator('table').first()).toContainText('INTEREST');
    await expect(panel.locator('table').first()).toContainText('Unavailable');
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'Write-Off Preview' }).click();
    await panel.getByRole('button', { name: 'Generate Preview', exact: true }).click();
    await expect(
      panel.getByText(/INCOMPLETE_EVIDENCE|BLOCKED_PENDING_ACCOUNTING_POLICY|RECONCILIATION_REQUIRED/).first()
    ).toBeVisible();
    await expect(panel.getByRole('button', { name: /Execute Adjustment|Post Journal|Reverse Write-Off/ })).toHaveCount(
      0
    );
    for (const width of [
      390,
      768,
      1280,
      1920
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(() => panel.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await panel.getByRole('heading', { name: 'NPA Accounting', exact: true }).scrollIntoViewIfNeeded();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
        .toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`anpa-${width}.png`) });
    }
    expect(requests.length).toBeGreaterThan(5);
    expect(requests.every((url) => new URL(url).origin === 'http://localhost:4200')).toBe(true);
  });
  test('reviews written-off reconciliation and switches loans without old evidence', async ({ page }, testInfo) => {
    test.skip(!writtenOff, 'Set E2E_ANPA_WRITTEN_OFF_LOAN_ID to an existing written-off synthetic loan.');
    await page.goto(`/#/loans/${writtenOff}/anpa-accounting`);
    const panel = page.locator('mifosx-anpa-accounting');
    await expect(panel.getByText(/Backend connected/)).toBeVisible({ timeout: 15000 });
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'Write-Off Reconciliation' }).click();
    await expect(panel.getByRole('term').filter({ hasText: 'Native Write-Off Amount' })).toBeVisible();
    await expect(panel.getByText('Expected Expense Debit', { exact: true }).first()).toBeVisible();
    await panel.getByRole('term').filter({ hasText: 'Native Write-Off Amount' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('reconciliation.png') });
    await page.goto(`/#/loans/${loan}/anpa-accounting`);
    await expect(panel.getByText(/Backend connected/)).toBeVisible({ timeout: 15000 });
    await expect(panel.locator('dd').first()).toHaveText(loan!);
    await expect(panel.getByRole('term').filter({ hasText: 'Native Write-Off Amount' })).toHaveCount(0);
  });
  test('records a supported proposal and displays its blocked execution state', async ({ page }, testInfo) => {
    test.skip(process.env.E2E_ANPA_ALLOW_RECORDS !== '1', 'Explicitly opt in to synthetic plugin evidence writes.');
    await page.goto(`/#/loans/${loan}/anpa-accounting`);
    const panel = page.locator('mifosx-anpa-accounting');
    await expect(panel.getByText(/Backend connected/)).toBeVisible({ timeout: 15000 });
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'History and Audit' }).click();
    await panel.getByRole('button', { name: 'Create Adjustment Proposal', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const reference = process.env.E2E_ANPA_RECONCILIATION_ID;
    expect(reference, 'Set an actual saved reconciliation for this loan').toBeTruthy();
    await dialog.getByLabel('Reconciliation ID', { exact: true }).fill(reference!);
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /JOURNAL_ADJUSTMENT/ }).click();
    const reason = `Synthetic browser review ${Date.now()}`;
    await dialog.getByLabel('Reason', { exact: true }).fill(reason);
    await dialog.getByRole('checkbox').check();
    const response = page.waitForResponse(
      (r) => r.url().endsWith('/adjustment-proposals') && r.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
    const saved = await response;
    expect(saved.status()).toBe(200);
    const record = await saved.json();
    expect(record.result.financiallyExecutable).toBe(false);
    expect(record.result.state).toBe('ADJUSTMENT_BLOCKED');
    await expect(dialog).toHaveCount(0);
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'History and Audit' }).click();
    await expect(
      panel.getByRole('heading', { name: `Adjustment Proposals · ${record.id}`, exact: true })
    ).toBeVisible();
    await expect(panel.getByText(reason, { exact: true }).first()).toBeVisible();
    await expect(panel.getByText(/ADJUSTMENT_BLOCKED/)).toHaveText('Proposal Blocked (ADJUSTMENT_BLOCKED)');
    await panel.getByText(/ADJUSTMENT_BLOCKED/).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('proposal-blocked.png') });
  });
  test('creates an explicit policy draft and keeps maker approval hidden', async ({ page }, testInfo) => {
    test.skip(
      process.env.E2E_ANPA_ALLOW_RECORDS !== '1' ||
        !process.env.E2E_ANPA_SOURCE_ACCOUNT_ID ||
        !process.env.E2E_ANPA_EXPENSE_ACCOUNT_ID,
      'Opt in to synthetic policy records with actual fixture GL references.'
    );
    await page.goto(`/#/loans/${loan}/anpa-accounting`);
    const panel = page.locator('mifosx-anpa-accounting');
    await expect(panel.getByText(/Backend connected/)).toBeVisible();
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'Accounting Policies' }).click();
    await panel.getByRole('button', { name: 'Create Policy Draft' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Rule Version', { exact: true }).fill(String((Math.floor(Date.now() / 1000) % 999999) + 1));
    await dialog.getByLabel('Effective From', { exact: true }).fill(process.env.E2E_ANPA_BUSINESS_DATE || '2026-11-15');
    await dialog
      .getByLabel('Effective Through', { exact: true })
      .fill(process.env.E2E_ANPA_BUSINESS_DATE || '2026-11-15');
    await dialog
      .getByLabel('Approval Reference', { exact: true })
      .fill('Synthetic browser policy; no financial execution');
    await dialog.getByRole('button', { name: 'Add Rule', exact: true }).click();
    for (const [
      label,
      option
    ] of [
      [
        'Category',
        'Interest (INTEREST)'
      ],
      [
        'Historical Origin',
        'Regular Receivables (REGULAR)'
      ],
      [
        'Current Classification',
        'Regular Receivables (REGULAR)'
      ],
      [
        'Expense Eligible',
        'Yes'
      ]
    ]) {
      await dialog.getByLabel(label, { exact: true }).click();
      await page.getByRole('option', { name: option, exact: true }).click();
    }
    await dialog.getByLabel('Source GL Account ID', { exact: true }).fill(process.env.E2E_ANPA_SOURCE_ACCOUNT_ID!);
    const mappingId = process.env.E2E_ANPA_MAPPING_ID;
    if (mappingId) await dialog.getByLabel('Mapping ID', { exact: true }).fill(mappingId);
    await dialog
      .getByLabel('Destination GL Account ID', { exact: true })
      .fill(process.env.E2E_ANPA_EXPENSE_ACCOUNT_ID!);
    await dialog.getByRole('checkbox').check();
    const response = page.waitForResponse(
      (r) => r.url().endsWith('/accounting-policies') && r.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
    const saved = await response;
    expect(saved.status()).toBe(200);
    const record = await saved.json();
    await expect(dialog).toHaveCount(0);
    await panel.locator('mat-expansion-panel-header').filter({ hasText: 'History and Audit' }).click();
    await expect(panel.getByRole('heading', { name: `Accounting Policies · ${record.id}`, exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Approve Policy Draft' })).toHaveCount(0);
    await panel
      .getByRole('heading', { name: `Accounting Policies · ${record.id}`, exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('policy-draft.png') });
  });
  test('opens the unchanged native write-off form and returns to loan tabs without a transaction', async ({ page }) => {
    const nativePosts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/loans/')) nativePosts.push(r.url());
    });
    await page.goto(`/#/loans/${loan}/actions/Write%20Off?productType=loan`);
    await expect(page.locator('mifosx-write-off-page')).toBeVisible();
    await expect(page.getByLabel('Write off on', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Amount', { exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'General', exact: true })).toBeVisible();
    for (const tab of [
      'Account Details',
      'Transactions',
      'Loan Documents'
    ]) {
      await page.getByRole('tab', { name: tab, exact: true }).focus();
      await page.getByRole('tab', { name: tab, exact: true }).press('Enter');
      await expect(page).toHaveURL(
        new RegExp(
          tab === 'Account Details' ? '/accountdetail' : tab === 'Transactions' ? '/transactions' : '/loan-documents'
        )
      );
    }
    await expect(page.getByText('No documents available.', { exact: true })).toBeVisible();
    expect(nativePosts).toEqual([]);
  });
});
