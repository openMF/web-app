/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';
import type { Page } from '@playwright/test';
import { installIsrContracts, isrPermissions } from '../../fixtures/consolidated-isr-contract';
import { ConsolidatedIsrPage } from '../../pages/consolidated-isr.page';
import { capabilities, policy } from '../../../src/app/products/saving-products/product-editor/product-policy.fixtures';
import { feeCapabilities, feeRun } from '../../../src/app/products/saving-products/product-editor/monthly-fee.fixtures';

const matrix = {
  calculationMethod: 'UNAPPROVED',
  brackets: [{ lowerBalance: '0', upperBalance: null, annualRatePercent: '1.50' }]
};
const reference = {
  referenceId: 'FE07_CETES',
  referenceType: 'CETES',
  tenor: 'D28',
  formulaMode: 'ADDITIVE_SPREAD',
  spreadPercentagePoints: '0.10',
  multiplier: null,
  reviewFrequency: 'DAILY'
};
const readPermissions = [
  ...isrPermissions,
  'READ_SAVINGSPRODUCT',
  'READ_SAVINGS_PRODUCT_POLICY',
  'CHECK_SAVINGS_PRODUCT_POLICY',
  'READ_SAVINGS_REFERENCE_RATE',
  'READ_SAVINGS_RATE_PROPAGATION',
  'READ_SAVINGS_MONTHLY_FEE'
];
const configuration = (id: number) => ({
  savingsProductId: id,
  revision: 3,
  status: 'DRAFT',
  operational: false,
  policy: {
    ...policy,
    classification: 'INTEREST_BEARING_SIGHT',
    interestMode: id === 4 ? 'TIERED' : 'REFERENCE_RATE',
    interestMatrix: id === 4 ? matrix : null,
    referenceRate: id === 5 ? reference : null
  }
});
const native = (id: number) => ({
  id,
  name: `Synthetic ${id === 4 ? 'matrix' : 'CETES'} product`,
  shortName: `S${id}`,
  description: 'Synthetic contract fixture; rates are not financial integration evidence.',
  currency: { code: 'MXN', name: 'Mexican Peso', decimalPlaces: 2 },
  nominalAnnualInterestRate: 0,
  minRequiredOpeningBalance: 0,
  accountingRule: { id: 1, value: 'None' },
  accountingMappingOptions: {},
  charges: [],
  currencyOptions: [{ code: 'MXN', name: 'Mexican Peso', decimalPlaces: 2 }],
  interestCompoundingPeriodType: { id: 1, value: 'Daily' },
  interestPostingPeriodType: { id: 4, value: 'Monthly' },
  interestCalculationType: { id: 1, value: 'Daily Balance' },
  interestCalculationDaysInYearType: { id: 365, value: '365 Days' },
  interestCompoundingPeriodTypeOptions: [],
  interestPostingPeriodTypeOptions: [],
  interestCalculationTypeOptions: [],
  interestCalculationDaysInYearTypeOptions: [],
  lockinPeriodFrequencyTypeOptions: [],
  taxGroupOptions: [],
  chargeOptions: [],
  paymentTypeOptions: [],
  penaltyOptions: []
});

async function contracts(page: Page) {
  const evidence = await installIsrContracts(page, readPermissions);
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api\/v\d+/, '');
    if (
      !path.startsWith('/savingsproducts') &&
      !path.startsWith('/savings/monthly-fees') &&
      path !== '/charges' &&
      !path.startsWith('/businessdate')
    ) {
      await route.fallback();
      return;
    }
    if (route.request().method() !== 'GET') {
      evidence.writes.push(path);
      await route.fulfill({ status: 403, json: {} });
      return;
    }
    let data: unknown = [];
    if (path === '/savingsproducts') data = [
        native(4),
        native(5)
      ];
    else if (/^\/savingsproducts\/[45]$/.test(path)) data = native(Number(path.at(-1)));
    else if (path === '/savingsproducts/policy/template')
      data = {
        ...capabilities,
        transactionControls: {
          decisionEvaluation: true,
          depositEventVeto: 'PARTIALLY_ENFORCED',
          withdrawalEventVeto: 'PARTIALLY_ENFORCED',
          maximumBalanceEnforcement: false,
          freezingLifecycle: false,
          operationsExceptions: false,
          universalNativeCoverage: false,
          configuredActivation: false,
          blockers: ['NATIVE_ADJUSTMENT_AND_REVERSAL_HAVE_NO_VALIDATION_EVENT']
        }
      };
    else if (/^\/savingsproducts\/policy\/[45]$/.test(path)) data = configuration(Number(path.at(-1)));
    else if (path.endsWith('/active')) data = null;
    else if (path.endsWith('/versions'))
      data = [
        {
          savingsProductId: 4,
          version: 1,
          status: 'PENDING_APPROVAL',
          effectiveDate: '2026-11-12',
          makerId: 1,
          submitterId: 1,
          policy: configuration(4).policy
        }
      ];
    else if (path.endsWith('/interest-matrix'))
      data = {
        savingsProductId: 4,
        revision: 3,
        status: 'DRAFT',
        matrix,
        financialOperational: false,
        blockers: ['SLAB_CALCULATION_METHOD_UNAPPROVED']
      };
    else if (path.endsWith('/reference-rate'))
      data = {
        savingsProductId: 5,
        revision: 3,
        status: 'DRAFT',
        formula: reference,
        financialOperational: false,
        blockers: ['FINERACT_POSTING_INTEGRATION_UNVERIFIED']
      };
    else if (path === '/savingsproducts/reference-rates/template') data = { referenceTypes: ['CETES'], formulaModes: [
          'ADDITIVE_SPREAD',
          'MULTIPLICATIVE_FACTOR'
        ], reviewFrequencies: [
          'DAILY',
          'END_OF_MONTH'
        ], fixingSelection:
          'APPROVED_EFFECTIVE_DATE', reviewSchedulingOperational: false, financialOperational: false, blockers: [] };
    else if (path === '/savingsproducts/reference-rates')
      data = [
        {
          referenceId: 'FE07_CETES',
          referenceType: 'CETES',
          tenor: 'D28',
          sourceDescription: 'Synthetic benchmark only',
          revision: 1,
          makerId: 1,
          createdAt: '2026-11-12T08:00:00Z'
        }
      ];
    else if (path === '/savingsproducts/reference-rates/FE07_CETES')
      data = {
        referenceId: 'FE07_CETES',
        referenceType: 'CETES',
        tenor: 'D28',
        sourceDescription: 'Synthetic benchmark only',
        revision: 1,
        makerId: 1,
        createdAt: '2026-11-12T08:00:00Z'
      };
    else if (path.endsWith('/fixings'))
      data = [
        {
          referenceId: 'FE07_CETES',
          tenor: 'D28',
          annualRatePercent: '7.10',
          publicationDate: '2026-11-12',
          effectiveDate: '2026-11-12',
          sourceReference: 'Synthetic test publication',
          version: 1,
          revision: 1,
          status: 'DRAFT',
          makerId: 1,
          capturedAt: '2026-11-12T08:00:00Z'
        }
      ];
    else if (path === '/savingsproducts/policy/rate-propagation/template')
      data = {
        planningSupported: true,
        authorizationSupported: true,
        financialExecutionSupported: false,
        tieredFinancialExecutionSupported: false,
        referenceRateFinancialExecutionSupported: false,
        blockers: []
      };
    else if (path === '/savings/monthly-fees/template') data = feeCapabilities;
    else if (path === '/savings/monthly-fees/runs')
      data = { items: [{ ...feeRun, cutoffAccountId: '100' }], hasMore: false };
    await route.fulfill({ json: data });
  });
  return evidence;
}

test('unified catalog, policy review, matrix, financial controls and fee history connect to customer ISR', async ({
  page
}, info) => {
  const { writes } = await contracts(page);
  await page.goto('/#/products/saving-products');
  const catalog = page.locator('mifosx-saving-products');
  await expect(catalog).toContainText('Synthetic matrix product');
  await expect(catalog).toContainText(/Interest-bearing sight/i);
  await catalog.locator('input').first().fill('matrix');
  await expect(catalog).not.toContainText('Synthetic CETES product');
  await catalog.getByRole('link', { name: 'Edit product: Synthetic matrix product', exact: true }).click();
  const editor = page.locator('mifosx-product-editor');
  await expect(editor).toContainText('Synthetic matrix product');
  await expect(editor.locator('mifosx-policy-workflow')).toContainText('approval');
  const saveDraft = editor.getByRole('button', { name: 'Save as Draft', exact: true });
  // RBAC removes this command; compatibility mode keeps it disabled for this reader.
  await expect.poll(async () => (await saveDraft.count()) === 0 || (await saveDraft.isDisabled())).toBe(true);
  await page.getByRole('tab', { name: 'Interest Configuration', exact: true }).click();
  await expect(editor.locator('input[formControlName="annualRatePercent"]').first()).toHaveValue('1.50');
  await expect(editor).toContainText('configuration');
  await page.getByText('Financial policy overview', { exact: true }).click();
  await expect(editor.locator('mifosx-financial-capabilities')).toContainText('Partially enforced');
  await expect(editor.locator('mifosx-financial-capabilities')).toContainText('Not supported');
  const fees = editor.locator('mifosx-monthly-fee-diagnostics');
  await fees.getByText('Tenant-wide monthly fee diagnostics', { exact: true }).click();
  await expect(fees).toContainText('2026-10');
  await expect(fees).toContainText('Not supported');
  await page.screenshot({ path: info.outputPath('unified-product-financial-controls.png'), fullPage: true });
  const isr = new ConsolidatedIsrPage(page);
  await isr.open();
  await isr.inspect();
  await expect(isr.view.getByTestId('isr-calculated')).toHaveText('Not established');
  expect(writes).toEqual([]);
});

test('CETES definitions, formula and draft history stay separate from posted interest', async ({ page }, info) => {
  const { writes } = await contracts(page);
  await page.goto('/#/products/saving-products/5/edit');
  const editor = page.locator('mifosx-product-editor');
  await expect(editor).toContainText('Synthetic CETES product');
  await page.getByRole('tab', { name: 'Interest Configuration', exact: true }).click();
  await expect(editor.locator('input[formControlName="spreadPercentagePoints"]')).toHaveValue('0.10');
  const benchmarks = editor.locator('mifosx-benchmark-management');
  await editor.getByText('CETES definitions and manual benchmark management', { exact: true }).click();
  await expect(benchmarks).toContainText('Synthetic benchmark only');
  await benchmarks.locator('mat-select[formControlName="referenceId"]').click();
  await page.getByRole('option', { name: 'FE07_CETES · D28', exact: true }).click();
  await expect(benchmarks).toContainText('2026-11-12');
  await expect(
    benchmarks.getByRole('button', { name: /^(Approve benchmark fixing|Capture benchmark fixing draft)$/i })
  ).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('cetes-draft-history.png'), fullPage: true });
  expect(writes).toEqual([]);
});
