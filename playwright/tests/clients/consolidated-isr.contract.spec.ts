/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';
import { installIsrContracts } from '../../fixtures/consolidated-isr-contract';
import { isrEligibility, isrSources, isrWireJson } from '../../fixtures/consolidated-isr-data';
import { ConsolidatedIsrPage } from '../../pages/consolidated-isr.page';

/** Browser rendering of synthetic blocked BE-11 contracts; no financial integration claims. */
test('ISR period, eligibility, native observations, immutable history, audit and reconciliation remain read-only', async ({
  page
}, info) => {
  const { reads, writes } = await installIsrContracts(page);
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  await ui.inspect();
  await expect(ui.view.getByTestId('isr-eligible-count')).toHaveText('0');
  await expect(ui.view.getByTestId('isr-taxable-base')).toHaveText('Not established');
  await expect(ui.view.getByTestId('isr-calculated')).toHaveText('Not established');
  await expect(ui.view.getByTestId('isr-actual-withheld')).toHaveText('Not established');
  await expect(ui.view).toContainText('Policy approval required');
  await expect(ui.view).toContainText('0.25 MXN');
  await expect(ui.view).toContainText('88.25 USD');
  await expect(ui.view).toContainText('Account classification unsupported');
  await page.screenshot({ path: info.outputPath('isr-blocked-preview.png'), fullPage: true });
  await ui.openHistory();
  await ui.view.getByRole('button', { name: 'Audit history', exact: true }).click();
  await expect(ui.view).toContainText('Diagnostic assessment saved');
  await expect(ui.view).not.toContainText('sensitive-fixture-must-not-render');
  await ui.view.getByRole('button', { name: 'Check reconciliation', exact: true }).click();
  await expect(ui.view).toContainText('Reconciliation required');
  await expect(ui.view).toContainText('Source data changed');
  await expect(ui.view.getByRole('button', { name: /withhold|execute|pay tax|financial retry/i })).toHaveCount(0);
  const diagnosticReads = reads.filter((url) => /\/(eligibility|accounts|preview)$/.test(url.pathname));
  expect(diagnosticReads).toHaveLength(3);
  for (const url of diagnosticReads) {
    expect(url.searchParams.get('from')).toBe('2026-11-01');
    expect(url.searchParams.get('through')).toBe('2026-11-12');
  }
  const history = reads.find((url) => url.pathname.endsWith('/calculations'));
  expect(history?.searchParams.get('after')).toBe('0');
  expect(history?.searchParams.get('limit')).toBe('25');
  expect(writes).toEqual([]);
  await page.screenshot({ path: info.outputPath('isr-reconciliation.png'), fullPage: true });
});

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`ISR layout and keyboard date entry at ${width}px`, async ({ page }, info) => {
    await installIsrContracts(page);
    await page.setViewportSize({ width, height: 900 });
    const ui = new ConsolidatedIsrPage(page);
    await ui.open();
    await ui.inspect();
    await expect(ui.view.getByTestId('isr-taxable-base')).toHaveText('Not established');
    await ui.openHistory();
    expect(await ui.view.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await ui.view.getByRole('heading', { name: 'Consolidated ISR', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`isr-${width}.png`), fullPage: true });
  });
}

test('date editing cancels pending observations and switching customer clears history', async ({ page }) => {
  await installIsrContracts(page);
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  await ui.inspect();
  await expect(ui.view.getByTestId('isr-preview')).toBeVisible();
  await ui.view.locator('input[formControlName="from"]').fill('2026-11-02');
  await expect(ui.view.getByTestId('isr-preview')).toHaveCount(0);
  await ui.open(8);
  await expect(ui.view).toContainText('No history');
  await expect(ui.view).not.toContainText('100.25');
  await expect(ui.view).not.toContainText('d4a2587e');
});

test('unavailable backend and incompatible template never become successful diagnostics', async ({ page }) => {
  await installIsrContracts(page);
  await page.route('**/savings/consolidated-isr/template', (route) => route.fulfill({ status: 404, json: {} }));
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  await expect(ui.view).toContainText('This capability endpoint is unavailable');
  await page.route('**/savings/consolidated-isr/template', (route) => route.fulfill({ json: { calculation: 'yes' } }));
  await ui.view.getByRole('button', { name: 'Reload', exact: true }).click();
  await expect(ui.view).toContainText('backend response is incompatible');
  await expect(ui.view.getByTestId('isr-preview')).toHaveCount(0);
});

test('partial capabilities and missing endpoint permissions fail closed', async ({ page }) => {
  const { reads, writes } = await installIsrContracts(page, ['READ_CONSOLIDATED_ISR_ELIGIBILITY']);
  await page.route('**/savings/consolidated-isr/template', (route) =>
    route.fulfill({ json: { eligibilityDiagnostics: true } })
  );
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  await ui.inspect();
  await expect(ui.view.getByTestId('isr-eligible-count')).toHaveText('0');
  expect(reads.some((url) => /\/(accounts|preview|calculations)$/.test(url.pathname))).toBe(false);
  await expect(ui.view.getByRole('button', { name: /Audit history|Check reconciliation/i })).toHaveCount(0);
  expect(writes).toEqual([]);
});

test('incomplete population, empty accounts, unknown diagnostics and permission errors are explicit', async ({
  page
}) => {
  await installIsrContracts(page);
  await page.route('**/consolidated-isr/clients/7/eligibility?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: isrWireJson({
        ...isrEligibility(),
        accounts: [],
        populationComplete: false,
        blockers: ['NEW_INTERNAL_REASON']
      })
    })
  );
  await page.route('**/consolidated-isr/clients/7/accounts?*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: isrWireJson({ ...isrSources(), complete: false, observations: [] })
    })
  );
  await page.route('**/consolidated-isr/clients/7/preview?*', (route) =>
    route.fulfill({ status: 403, json: { private: 'sensitive' } })
  );
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  await ui.inspect();
  await expect(ui.view.getByTestId('isr-eligible-count')).toHaveText('Not established');
  await expect(ui.view).toContainText('Incomplete account data');
  await expect(ui.view).toContainText('No accounts in the diagnostic population');
  await expect(ui.view).toContainText('Additional diagnostic information is unavailable');
  await expect(ui.view).not.toContainText('NEW_INTERNAL_REASON');
  await expect(ui.view).not.toContainText('sensitive');
  await expect(ui.view.getByTestId('isr-preview')).toHaveCount(0);
});

test('invalid reversed and future diagnostic dates cannot submit', async ({ page }) => {
  const { reads } = await installIsrContracts(page);
  const ui = new ConsolidatedIsrPage(page);
  await ui.open();
  const button = ui.view.getByRole('button', { name: 'Inspect diagnostic period', exact: true });
  await ui.view.locator('input[formControlName="from"]').fill('2026-11-12');
  await ui.view.locator('input[formControlName="through"]').fill('2026-11-01');
  await expect(button).toBeDisabled();
  await ui.view.locator('input[formControlName="through"]').fill('9999-12-31');
  await expect(button).toBeDisabled();
  expect(reads.some((url) => url.pathname.endsWith('/preview'))).toBe(false);
});

test('translated long strings and dark theme preserve the mobile layout', async ({ page }, info) => {
  await installIsrContracts(page, undefined, { name: 'Deutsch', code: 'de' });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem('mifosXThemeDarkEnabled', 'true');
  });
  await page.goto('/#/clients/7/account-management');
  const tab = page.getByRole('tab', { name: 'Konsolidierte ISR', exact: true });
  await tab.click();
  const view = page.locator('mifosx-consolidated-isr');
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  await expect(view).toContainText('Steuerregeln');
  expect(await view.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('isr-german-mobile.png'), fullPage: true });
});
