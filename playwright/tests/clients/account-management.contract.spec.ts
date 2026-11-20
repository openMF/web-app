/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';
import type { Page } from '@playwright/test';

const uuid = 'd4a2587e-564a-4bb8-92f8-ad15ded9a400';
const capabilities = {
  arrangementConfiguration: true,
  scheduleProjection: true,
  pocketRelationships: true,
  nativeAccountCreation: false,
  payrollExecution: false,
  contributionScheduler: false,
  frozenFundRelease: false,
  maturitySettlement: false,
  pocketTransfer: false,
  accountClosure: false,
  blockers: ['CONTRIBUTION_EXECUTION_AND_MATCHING_RULES_UNAPPROVED']
};
const decision = {
  clientId: 7,
  loanId: 31,
  savingsAccountId: 18,
  businessDate: '2026-11-12',
  currencyCode: 'USD',
  currencyDigits: 2,
  sourceCurrencyCode: 'USD',
  sourceCurrencyDigits: 2,
  nativeWithdrawableBalance: 100.25,
  availableGuaranteeFunds: null,
  requestedAmount: 5,
  loanOutstanding: 200,
  policyVersion: 2,
  state: 'BLOCKED_PENDING_POLICY',
  reasons: ['BE08_APPROVED_GUARANTEE_RELATIONSHIPS_UNAVAILABLE']
};
function native(id: number, balance: number) {
  return {
    savingsAccountId: id,
    clientId: 7,
    savingsProductId: 5,
    policyVersion: 3,
    purpose: 'POCKET',
    currency: 'USD',
    currencyDigits: 2,
    nativeStatus: 300,
    nativeSubStatus: 0,
    balance,
    withdrawableBalance: balance,
    nativeInterestEarned: 1.02,
    nativeInterestPosted: 0.5,
    interestMode: 'FIXED',
    businessDate: '2026-11-12',
    blockers: ['BE10_FINANCIAL_EXECUTION_DISABLED']
  };
}

/** Explicit contract fixtures for rendering and fail-closed behavior, never financial success fixtures. */
async function installReadContracts(page: Page, permissions = ['ALL_FUNCTIONS']) {
  const writes: string[] = [];
  const auditRows: Record<string, unknown>[] = [
    {
      id: 1,
      executionId: uuid,
      actorId: 1,
      businessDate: '2026-11-12',
      event: 'MANUAL_APPLICATION_BLOCKED',
      reasonCode: 'BLOCKED_PENDING_POLICY',
      evaluation: decision,
      recordedAt: '2026-11-12T08:00:00'
    }
  ];
  await page.addInitScript(
    ({ permissions }) => {
      if (![
          'http:',
          'https:'
        ].includes(location.protocol)) return;
      const credentials = JSON.stringify({
        authenticated: true,
        userId: 1,
        username: 'contract-reader',
        officeId: 1,
        officeName: 'Fixture office',
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
    { permissions }
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname.replace(/^.*\/api\/v\d+/, '');
    if (route.request().method() !== 'GET') {
      writes.push(p);
      await route.fulfill({ status: 409, json: { reasonCode: 'REQUEST_CONFLICT' } });
      return;
    }
    let response: unknown = [];
    const client = Number(p.match(/\/clients\/(\d+)/)?.[1] || 7);
    if (p === '/clients/template') response = {};
    else if (p === '/notifications') response = { pageItems: [], totalFilteredRecords: 0 };
    else if (/^\/clients\/\d+$/.test(p))
      response = {
        id: client,
        displayName: `Fixture customer ${client}`,
        groups: [],
        accountNo: `C${client}`,
        officeId: 1,
        officeName: 'Fixture office',
        status: { id: 300, code: 'clientStatusType.active', value: 'Active' },
        active: true,
        legalForm: { id: 1 },
        timeline: { activatedOnDate: [
            2026,
            1,
            1
          ] }
      };
    else if (p.endsWith('/images')) {
      await route.fulfill({ status: 404, json: {} });
      return;
    } else if (p === '/savings/account-relationships/template')
      response = {
        mainAccountRelationships: true,
        guaranteedAccountCreation: false,
        guaranteeAllocation: false,
        guaranteeRelease: false,
        blockers: []
      };
    else if (/^\/savings\/account-relationships\/clients\/\d+\/main$/.test(p))
      response = {
        clientId: client,
        relationships:
          client === 7
            ? [
                {
                  clientId: 7,
                  savingsAccountId: 18,
                  savingsProductId: 4,
                  policyVersion: 2,
                  nativeStatus: 300,
                  active: true
                }
              ]
            : []
      };
    else if (p === '/savingsaccounts/18')
      response = {
        id: 18,
        clientId: 7,
        accountNo: 'S18',
        savingsProductId: 4,
        savingsProductName: 'Fixture Main product',
        currency: { code: 'USD', decimalPlaces: 2 },
        status: { id: 300 },
        summary: { accountBalance: 100.25, totalInterestPosted: 1.5 }
      };
    else if (p === '/savings/guarantee-sweeps/template')
      response = {
        eligibilityDiagnostics: true,
        durableDiagnosticBatch: true,
        manualSweep: false,
        guaranteeAllocation: false,
        guaranteeRelease: false,
        automaticSweep: false,
        financialEnforcement: false,
        blockers: ['NATIVE_SWEEP_ACCOUNTING_UNVERIFIED']
      };
    else if (p.endsWith('/sources'))
      response = [{ savingsAccountId: 18, purpose: 'GUARANTEED', policyVersion: 2, nativeStatus: 300 }];
    else if (p === '/savings/guarantee-sweeps/clients/7/loans')
      response = [{ loanId: 31, nativeStatus: 300, currencyCode: 'USD' }];
    else if (p === '/loans/31') response = { id: 31, clientId: 7, currency: { code: 'USD', decimalPlaces: 2 } };
    else if (p.endsWith('/preview')) {
      auditRows.push({
        ...auditRows[0],
        id: auditRows.length + 1,
        executionId: undefined,
        event: 'ELIGIBILITY_EVALUATED'
      });
      response = decision;
    } else if (p.endsWith('/release-status'))
      response = {
        state: 'BLOCKED_PENDING_POLICY',
        blockers: ['SETTLEMENT_AND_RELEASE_RULES_UNAPPROVED'],
        allocations: []
      };
    else if (p.endsWith('/loans/31/audit'))
      response = auditRows.filter((row) => Number(row['id']) > Number(url.searchParams.get('afterId') || 0));
    else if (p.endsWith('/executions/' + uuid))
      response = {
        id: uuid,
        clientId: 7,
        loanId: 31,
        savingsAccountId: 18,
        operation: 'APPLY',
        mode: 'MANUAL',
        state: 'BLOCKED_PENDING_POLICY',
        businessDate: '2026-11-12',
        requestedAmount: 5,
        appliedAmount: null,
        currencyCode: 'USD',
        actorId: 1,
        reasonCode: 'BLOCKED_PENDING_POLICY',
        evaluation: decision
      };
    else if (p.endsWith('/reconciliation')) {
      response = {
        executionId: uuid,
        status: 'NOT_ATTEMPTED',
        nativeReferencesMatch: false,
        repaymentReversed: false,
        savingsReversed: false,
        journalEntriesPresent: false,
        journalEntriesBalanced: false,
        financialRetryAllowed: false,
        nativeAccountingVerified: false
      };
      auditRows.push({
        ...auditRows[0],
        id: auditRows.length + 1,
        event: 'RECONCILIATION_EVALUATED',
        reconciliation: response
      });
    } else if (p === '/savings/planned-savings/template') response = capabilities;
    else if (p.endsWith('/arrangements'))
      response = [
        {
          id: uuid,
          clientId: 7,
          revision: 1,
          savingsAccountId: 24,
          state: 'BLOCKED_PENDING_POLICY',
          financialExecutionEnabled: false,
          blockers: [],
          configuration: {
            savingsProductId: 5,
            policyVersion: 3,
            employerClientId: 9,
            arrangementReference: 'Fixture payroll proposal',
            contributionAmount: 25,
            frequencyUnit: 'MONTHS',
            frequencyInterval: 1,
            shortMonthRule: 'LAST_DAY',
            startDate: '2026-11-12',
            termDays: 30,
            maturityDate: '2026-12-12',
            status: 'CONFIGURATION_ONLY'
          }
        }
      ];
    else if (p.endsWith('/contributions'))
      response = [
        {
          revision: 1,
          sequence: 1,
          dueDate: '2026-11-12',
          expectedAmount: 25,
          nativeTransactionId: null,
          status: 'DUE_UNVERIFIED',
          executionEnabled: false
        }
      ];
    else if (p.endsWith('/maturity'))
      response = { state: 'BEFORE_MATURITY', executionEnabled: false, blockers: ['MATURITY_NOT_REACHED'] };
    else if (p.endsWith('/accounts/24')) response = { ...native(24, 50), purpose: 'PLANNED_MAIN' };
    else if (p.endsWith('/pockets'))
      response = [
        {
          savingsAccountId: 22,
          clientId: 7,
          mainSavingsAccountId: 18,
          revision: 1,
          policyVersion: 3,
          mainPolicyVersion: 2,
          name: 'Fixture holiday pocket',
          relationshipStatus: 'LINKED',
          nativeAccount: native(22, 25.12)
        },
        {
          savingsAccountId: 23,
          clientId: 7,
          mainSavingsAccountId: 18,
          revision: 1,
          policyVersion: 3,
          mainPolicyVersion: 2,
          name: 'Fixture school pocket',
          relationshipStatus: 'LINKED',
          nativeAccount: native(23, 88.25)
        }
      ];
    else if (p.endsWith('/closure-eligibility'))
      response = { state: 'CLOSURE_BLOCKED', executionEnabled: false, blockers: ['NATIVE_CLOSURE_EXECUTION_DISABLED'] };
    else if (p.includes('/configurations/name/')) response = { enabled: false, value: 0 };
    await route.fulfill({ json: response });
  });
  return writes;
}
async function tab(page: Page, name: string) {
  const view = page.locator('mifosx-account-management');
  await view.getByRole('tab', { name, exact: true }).click();
  await expect(view.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(view.getByRole('tabpanel', { name, exact: true }).locator('.mat-mdc-tab-body-content')).toHaveCSS(
    'transform',
    'none'
  );
  await view.locator('mat-tab-group').evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined))
    );
  });
}

test('Main, guarantee diagnostics, blocked execution and persisted history', async ({ page }, testInfo) => {
  const writes = await installReadContracts(page);
  await page.goto('/#/clients/7/account-management');
  const view = page.locator('mifosx-account-management');
  await expect(view).toBeVisible();
  await expect(view).toContainText('100.25 USD');
  await tab(page, 'Guaranteed account');
  await expect(view).toContainText('Guarantee relationship not established');
  await view.getByRole('combobox', { name: /^Source account$/i }).click();
  await page.getByRole('option', { name: '18', exact: true }).click();
  await view.getByRole('combobox', { name: 'Linked loan', exact: true }).click();
  await page.getByRole('option', { name: '31 · USD', exact: true }).click();
  await view.getByRole('textbox', { name: 'Requested amount', exact: true }).fill('5.00');
  await view.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(view.locator('mifosx-guarantee-history mat-expansion-panel')).toHaveCount(2);
  await expect(view.locator('[data-testid="available-guarantee-funds"]')).toHaveText('Not established');
  await expect(view.locator('[data-testid="apply-guarantee"]')).toBeDisabled();
  await view.locator('[data-testid="available-guarantee-funds"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('guarantee-preview-blocked.png'), fullPage: true });
  await view.locator('mifosx-guarantee-history mat-expansion-panel-header').first().click();
  await view.getByRole('button', { name: 'Inspect execution' }).click();
  await expect(view).toContainText('No financial transaction occurred');
  await view.getByRole('button', { name: 'Check reconciliation' }).click();
  await expect(view).toContainText('Not attempted');
  await expect(view.locator('mifosx-guarantee-history mat-expansion-panel')).toHaveCount(3);
  await expect(view.locator('[data-testid="nativeReferencesMatch"]')).toHaveText('No');
  await expect(view.locator('[data-testid="nativeAccountingVerified"]')).toHaveText('No');
  await view.locator('mifosx-account-transaction-result').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('guarantee-no-movement.png'), fullPage: true });
  expect(writes).toEqual([]);
});

test('planned projections, independent native pocket balances and disabled financial workflows at all sizes', async ({
  page
}, testInfo) => {
  const writes = await installReadContracts(page);
  for (const width of [
    390,
    768,
    1280,
    1920
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/clients/7/account-management');
    await page.reload();
    const view = page.locator('mifosx-account-management');
    await expect(view).toContainText('100.25 USD');
    await page.screenshot({ path: testInfo.outputPath(`main-${width}.png`), fullPage: true });
    await tab(page, 'Guaranteed account');
    await expect(view.locator('[data-testid="apply-guarantee"]')).toBeDisabled();
    expect(await view.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`guarantee-${width}.png`), fullPage: true });
    await tab(page, 'Planned main account');
    await view.getByRole('button', { name: /Fixture payroll proposal/ }).click();
    await expect(view).toContainText('Due; payment unverified');
    await expect(view).toContainText('Projected contributions are not deposits');
    await page.screenshot({ path: testInfo.outputPath(`planned-${width}.png`), fullPage: true });
    await tab(page, 'Savings pocket');
    await expect(view).toContainText('25.12 USD');
    await expect(view).toContainText('88.25 USD');
    await expect(view.locator('[data-testid="create-pocket"]')).toBeDisabled();
    await expect(view.locator('[data-testid="transfer-pocket"]')).toBeDisabled();
    await view
      .getByRole('button', { name: 'Fixture holiday pocket Persisted pocket relationship', exact: true })
      .click();
    await view.getByRole('button', { name: 'Check closure eligibility' }).first().click();
    await expect(view.locator('[data-testid="pocket-native-account-id"]').first()).toHaveText('22');
    await expect(view.locator('a[href*="savings-accounts/22"], a[href*="savings-accounts/23"]')).toHaveCount(0);
    await expect(view.locator('[data-testid="close-pocket"]').first()).toBeDisabled();
    expect(await view.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`pockets-${width}.png`), fullPage: true });
  }
  expect(writes).toEqual([]);
});

test('route changes clear customer data and missing BE-10 is explicit', async ({ page }) => {
  await installReadContracts(page);
  await page.goto('/#/clients/7/account-management');
  const view = page.locator('mifosx-account-management');
  await expect(view).toContainText('100.25 USD');
  await page.goto('/#/clients/8/account-management');
  await expect(view).toContainText('No Main account relationship');
  await expect(view).not.toContainText('100.25 USD');
  await page.route('**/savings/planned-savings/template', (route) => route.fulfill({ status: 404, json: {} }));
  await tab(page, 'Planned main account');
  await expect(view).toContainText('This capability endpoint is unavailable');
  await expect(view.getByRole('button', { name: 'Configure planned arrangement' })).toHaveCount(0);
});

test('resource-specific permission hides commands and unauthorized sections', async ({ page }) => {
  const writes = await installReadContracts(page, ['READ_GUARANTEE_SWEEP']);
  await page.goto('/#/clients/7/account-management');
  const view = page.locator('mifosx-account-management');
  await expect(view).toBeVisible();
  await expect(view.getByRole('tab')).toHaveCount(1);
  await expect(view.locator('[data-testid="apply-guarantee"]')).toHaveCount(0);
  await expect(view).toContainText('Loan read permission is required');
  expect(writes).toEqual([]);
});
