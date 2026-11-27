/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { expect, test, Page } from '@playwright/test';

/**
 * WEB-1484 Base Teller workspace.
 *
 * Every backend response is synthetic and intercepted in the browser. The suite never talks to a real Fineract
 * instance, never executes a financial transaction and never closes a real teller session: any non-GET request to a
 * Base Teller endpoint is recorded and each test asserts that none was sent.
 */
test.use({ storageState: { cookies: [], origins: [] }, timezoneId: 'UTC', locale: 'en-US' });

const BUSINESS_DATE = '2026-11-27';
const WORKSPACE = '/#/organization/base-teller';

interface Scenario {
  permissions: string[];
  staffId: number | null;
  /** Cashiers returned for teller 2. */
  cashiers: Record<string, unknown>[];
  holdings: Record<string, unknown>[];
  registerStatus: 'OPEN' | 'NOT_OPENED' | 'COMPLETED';
  history: Record<string, unknown>[];
  historyStatus: number;
  language: { name: string; code: string };
  production: boolean;
  dark: boolean;
}

let scenario: Scenario;
let writes: string[];
let requests: { path: string; search: URLSearchParams }[];

const holding = (overrides: Record<string, unknown> = {}) => ({
  businessDate: BUSINESS_DATE,
  officeId: 1,
  tellerId: 2,
  cashierId: 31,
  cashierName: 'Synthetic Cashier',
  currencyCode: 'MXN',
  openingFunds: 15000,
  inflows: 62480,
  outflows: 29230,
  settlementsAndDeposits: 0,
  currentBalance: 48250,
  status: 'OPEN',
  ...overrides
});

const historyRow = (id: number, hour: number, overrides: Record<string, unknown> = {}) => ({
  historyId: `SAVINGS_DEPOSIT:${id}`,
  transactionDate: `${BUSINESS_DATE}T${String(hour).padStart(2, '0')}:00:00Z`,
  operation: 'SAVINGS_DEPOSIT',
  inflow: 100 * id,
  outflow: 0,
  currencyCode: 'MXN',
  decimalPlaces: 2,
  concept: 'SAVINGS_DEPOSIT',
  status: 'COMPLETED',
  reference: `REF-${id}`,
  tellerId: 31,
  clientId: 9,
  ...overrides
});

const defaultHistory = () => [
  historyRow(900, 8, {
    historyId: 'CASH_ALLOCATION:5',
    transactionDate: `${BUSINESS_DATE}T08:02:00Z`,
    operation: 'ALLOCATE_CASH',
    concept: 'HEAD_CASHIER_ALLOCATION',
    inflow: 15000,
    reference: 'ALLOC-5'
  }),
  historyRow(1, 9),
  historyRow(2, 10),
  historyRow(3, 11),
  historyRow(4, 12, { historyId: 'SAVINGS_WITHDRAWAL:4', operation: 'CASH_WITHDRAWAL', inflow: 0, outflow: 40 }),
  historyRow(5, 13)
];

test.beforeEach(async ({ page }) => {
  writes = [];
  requests = [];
  scenario = {
    permissions: ['ALL_FUNCTIONS'],
    staffId: 7,
    cashiers: [
      { id: 31, tellerId: 2, staffId: 7, staffName: 'Synthetic Cashier' },
      { id: 32, tellerId: 2, staffId: 8, staffName: 'Another Cashier' }
    ],
    holdings: [holding()],
    registerStatus: 'OPEN',
    history: defaultHistory(),
    historyStatus: 200,
    language: { name: 'English', code: 'en' },
    production: true,
    dark: false
  };
  await page.context().addInitScript(
    ({ business }) => {
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXServerDate', business);
    },
    { business: BUSINESS_DATE }
  );
  await page.context().route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.env = { productionModeEnableRBAC: true, productionMode: ${scenario.production} };`
    })
  );
  await page.context().route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    requests.push({ path, search: url.searchParams });
    if (request.method() !== 'GET') {
      if (path.includes('/base-teller/')) writes.push(`${request.method()} ${path}`);
      await route.fulfill({ status: 405, json: { errors: [] } });
    } else if (path.endsWith('/cash-operations/holdings')) {
      await route.fulfill({ json: scenario.holdings });
    } else if (path.endsWith('/closings/context')) {
      const currency = (url.searchParams.get('currencyCode') ?? 'MXN').toUpperCase();
      await route.fulfill({
        json: {
          businessDate: BUSINESS_DATE,
          officeId: 1,
          officeName: 'Synthetic Branch',
          tellerId: 2,
          tellerName: 'Window 2',
          cashierId: Number(url.searchParams.get('cashierId')),
          cashierName: 'Synthetic Cashier',
          currencyCode: currency,
          openingBalance: 15000,
          cashInflows: 0,
          cashOutflows: 0,
          previousSettlements: 0,
          expectedAmount: 15000,
          eligibleChecks: [],
          status: scenario.registerStatus === 'COMPLETED' ? 'COMPLETED' : 'OPEN',
          registerStatus: scenario.registerStatus,
          closingId: null
        }
      });
    } else if (path.endsWith('/v2/base-teller/transaction-history')) {
      await route.fulfill({
        status: scenario.historyStatus,
        json:
          scenario.historyStatus === 200
            ? {
                items: [...scenario.history].reverse(),
                totalFilteredRecords: scenario.history.length,
                offset: 0,
                limit: 500,
                totalsByCurrency: []
              }
            : { errors: [] }
      });
    } else if (path.endsWith('/v2/base-teller/transaction-history/context')) {
      await route.fulfill({
        json: { tellers: [], currencies: [], statuses: [], types: [], operations: [], concepts: [] }
      });
    } else if (path.endsWith('/tellers/2/cashiers')) {
      await route.fulfill({
        json: {
          tellerId: 2,
          tellerName: 'Window 2',
          officeId: 1,
          officeName: 'Synthetic Branch',
          cashiers: scenario.cashiers
        }
      });
    } else if (path.endsWith('/tellers')) {
      await route.fulfill({ json: [{ id: 2, name: 'Window 2', officeId: 1 }] });
    } else if (path.includes('/configurations')) {
      await route.fulfill({ json: { enabled: false, value: 0 } });
    } else if (path.includes('/actuator/')) {
      await route.fulfill({ json: { status: 'UP' } });
    } else {
      await route.fulfill({ json: [] });
    }
  });
});

async function open(page: Page, init: { viewport?: { width: number; height: number } } = {}): Promise<void> {
  await page.addInitScript(
    ({ permissions, staffId, language, dark }) => {
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          base64EncodedAuthenticationKey: 'synthetic-key',
          permissions,
          roles: [],
          userId: 1484,
          username: 'synthetic-teller',
          officeId: 1,
          officeName: 'Synthetic Branch',
          ...(staffId === null ? {} : { staffId }),
          shouldRenewPassword: false
        })
      );
      localStorage.setItem('mifosXLanguage', JSON.stringify(language));
      localStorage.setItem('mifosXThemeDarkEnabled', JSON.stringify(dark));
    },
    {
      permissions: scenario.permissions,
      staffId: scenario.staffId,
      language: scenario.language,
      dark: scenario.dark
    }
  );
  await page.setViewportSize(init.viewport ?? { width: 1440, height: 1800 });
  // Startup resets the business date to today; keep it aligned with the fixed API context.
  await page.clock.setFixedTime(new Date(`${BUSINESS_DATE}T12:00:00Z`));
  await page.goto(WORKSPACE);
  await expect(page.locator('mifosx-base-teller')).toBeVisible();
  await expect(page.locator('.teller-workspace')).not.toHaveAttribute('aria-busy', 'true');
}

const card = (page: Page, id: string) => page.locator(`[data-operation="${id}"]`);

test.afterEach(() => {
  // No test may send a financial command; only reads are allowed.
  expect(writes).toEqual([]);
});

test.describe('session header', () => {
  test('shows the signed-in cashier session from the backend, with the cash limit marked as not configured', async ({
    page
  }, info) => {
    await open(page);

    const header = page.locator('.session-header');
    await expect(header).toContainText('Window 2');
    await expect(header).toContainText('Open since 08:02');
    await expect(header).toContainText('Synthetic Cashier');
    await expect(header).toContainText('Synthetic Branch');
    await expect(header).toContainText('Friday, Nov 27, 2026');
    await expect(header.locator('.metric-cash')).toContainText('$48,250.00');
    await expect(header.locator('.metric-cash')).toContainText('MXN');
    await expect(header.locator('.limit-text')).toHaveText('Cash limit not configured');
    await expect(page.locator('.alert-card')).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('after-open-1440.png'), fullPage: true });

    // The cashier is resolved from the signed-in staff id, and only that cashier is queried.
    const holdings = requests.find((entry) => entry.path.endsWith('/cash-operations/holdings'));
    expect(holdings?.search.get('cashierId')).toBe('31');
    expect(holdings?.search.get('businessDate')).toBe(BUSINESS_DATE);
    const history = requests.find((entry) => entry.path.endsWith('/v2/base-teller/transaction-history'));
    expect(history?.search.get('tellerId')).toBe('31');
    expect(history?.search.get('fromDate')).toBe(BUSINESS_DATE);
    expect(history?.search.get('toDate')).toBe(BUSINESS_DATE);
  });

  test('never shows another cashier session as the current user', async ({ page }) => {
    scenario.cashiers = [{ id: 32, tellerId: 2, staffId: 8, staffName: 'Another Cashier' }];
    await open(page);

    await expect(page.locator('.session-title')).toHaveText('No teller window assigned');
    await expect(page.locator('.session-header')).not.toContainText('Another Cashier');
    expect(requests.some((entry) => entry.path.endsWith('/cash-operations/holdings'))).toBe(false);
  });

  test('shows a closed register with a link to the existing opening workflow', async ({ page }, info) => {
    scenario.holdings = [];
    scenario.registerStatus = 'NOT_OPENED';
    await open(page);

    await expect(page.locator('.session-badge')).toHaveText('Register closed');
    await expect(page.locator('.session-header .metric-cash')).toContainText('No cash recorded');
    const openLink = page.getByRole('link', { name: 'Open register' });
    await expect(openLink).toHaveAttribute('href', '#/organization/base-teller/cash-allocations');
    await expect(page.locator('.closing-card[data-operation="cashRegisterClosing"] button')).toBeDisabled();
    await expect(page.locator('.closing-card[data-operation="cashRegisterClosing"]')).toContainText(
      'Open the register to continue'
    );
    await page.screenshot({ path: info.outputPath('after-closed-1440.png'), fullPage: true });
  });

  test('distinguishes a completed closing from an unopened register', async ({ page }) => {
    scenario.registerStatus = 'COMPLETED';
    await open(page);

    await expect(page.locator('.session-badge')).toHaveText('Closing completed');
    await expect(page.getByRole('link', { name: 'Open register' })).toHaveCount(0);
  });

  test('asks which window to use when the user has several, then loads only that cashier', async ({ page }) => {
    scenario.cashiers = [
      { id: 31, tellerId: 2, staffId: 7, staffName: 'Synthetic Cashier' },
      { id: 33, tellerId: 2, staffId: 7, staffName: 'Synthetic Cashier' }
    ];
    await open(page);

    await expect(page.locator('.session-title')).toHaveText('Select your teller window');
    expect(requests.some((entry) => entry.path.endsWith('/cash-operations/holdings'))).toBe(false);
    await page.locator('.session-choice').nth(1).click();
    await expect(page.locator('.session-badge')).toBeVisible();
    const holdings = requests.filter((entry) => entry.path.endsWith('/cash-operations/holdings'));
    expect(holdings.at(-1)?.search.get('cashierId')).toBe('33');
  });

  test('explains a user without a staff link and still lists permitted operations', async ({ page }) => {
    scenario.staffId = null;
    await open(page);

    await expect(page.locator('.session-title')).toHaveText('Your user is not linked to a staff member');
    await expect(card(page, 'cashExchange')).toBeVisible();
  });
});

test.describe("today's movement and recent operations", () => {
  test('reconciles with settlements and reports a difference only when the figures disagree', async ({ page }) => {
    scenario.holdings = [holding({ settlementsAndDeposits: 5000, currentBalance: 43250 })];
    await open(page);

    const movement = page.locator('[aria-labelledby="movement-title"]');
    await expect(movement).toContainText('Expected cash$43,250.00');
    await expect(movement).toContainText('Cash on hand matches the expected cash');
    await expect(movement.locator('.movement-difference')).toHaveCount(0);

    scenario.holdings = [holding({ settlementsAndDeposits: 5000, currentBalance: 43000 })];
    await page.reload();
    await expect(page.locator('.movement-difference')).toContainText('Difference of $250.00');
  });

  test('lists the five newest operations of the cashier with signed amounts and links to scoped history', async ({
    page
  }) => {
    await open(page);

    const items = page.locator('.recent-item');
    await expect(items).toHaveCount(5);
    await expect(items.first().locator('.recent-reference')).toHaveText('REF-5');
    await expect(items.nth(1).locator('.recent-amount')).toHaveText('−$40.00');
    await expect(items.first().locator('.recent-amount')).toHaveText('+$500.00');

    const link = page.getByRole('link', { name: 'View history' });
    await expect(link).toHaveAttribute(
      'href',
      `#/organization/base-teller/transaction-history?cashierId=31&date=${BUSINESS_DATE}`
    );
    await link.click();
    await expect(page).toHaveURL(/transaction-history\?cashierId=31&date=2026-11-27/);
    await expect
      .poll(() =>
        requests.some(
          (entry) =>
            entry.path.endsWith('/v2/base-teller/transaction-history') &&
            entry.search.get('tellerId') === '31' &&
            entry.search.get('fromDate') === BUSINESS_DATE &&
            entry.search.get('toDate') === BUSINESS_DATE &&
            entry.search.get('limit') === '25'
        )
      )
      .toBe(true);
  });

  test('shows an unavailable state, not fake rows, when history cannot be read', async ({ page }) => {
    scenario.historyStatus = 403;
    await open(page);

    await expect(page.locator('[aria-labelledby="recent-title"]')).toContainText('not available for your role');
    await expect(page.locator('.recent-item')).toHaveCount(0);
    await expect(page.locator('.session-header')).toContainText('Window 2');
  });
});

test.describe('operations, permissions and routes', () => {
  const ROUTES: [
    string,
    string
  ][] = [
    [
      'savingsDeposit',
      'savings-account-deposits'
    ],
    [
      'withdrawal',
      'withdrawals'
    ],
    [
      'loanPayment',
      'credit-payments'
    ],
    [
      'servicePayment',
      'service-payments'
    ],
    [
      'savingsOpening',
      'savings-account-openings'
    ],
    [
      'accountTransfers',
      'account-transfers'
    ],
    [
      'returnedCheck',
      'returned-check-payments'
    ],
    [
      'foreignCurrency',
      'foreign-currency'
    ],
    [
      'cashExchange',
      'cash-exchange'
    ],
    [
      'cashAllocation',
      'cash-allocations'
    ],
    [
      'cashPickup',
      'cash-drawer-pickup'
    ],
    [
      'cashOnHand',
      'cash-on-hand'
    ],
    [
      'cashTransfers',
      'cash-transfers-between-tellers'
    ],
    [
      'cashInventory',
      'cash-inventory'
    ],
    [
      'globalCashCount',
      'global-cash-count'
    ],
    [
      'vaultDeposit',
      'vault-cash-deposit'
    ],
    [
      'vaultHistory',
      'vault-cash-deposit/history'
    ],
    [
      'bankDeposit',
      'bank-deposit'
    ],
    [
      'depositInTransit',
      'deposit-in-transit'
    ],
    [
      'cashOperationHistory',
      'cash-operation-history'
    ],
    [
      'transactionHistory',
      'transaction-history'
    ],
    [
      'transactionReversal',
      'transaction-reversal'
    ],
    [
      'catalogUpdates',
      'catalog-updates'
    ]
  ];

  test('every operation is reachable from its new location without sending a write', async ({ page }) => {
    test.setTimeout(240000);
    await open(page);
    for (const [
      id,
      route
    ] of ROUTES) {
      await page.goto(WORKSPACE);
      await expect(card(page, id)).toBeVisible();
      await card(page, id).click();
      await expect(page, id).toHaveURL(new RegExp(`/organization/base-teller/${route}$`));
    }
  });

  test('closing operations open only through the confirmation dialog', async ({ page }) => {
    await open(page);
    for (const [
      id,
      route
    ] of [
      [
        'cashRegisterClosing',
        'cash-register-closing'
      ],
      [
        'endOfDayClosing',
        'end-of-day-cash-closing'
      ]
    ]) {
      await page.goto(WORKSPACE);
      await page.locator(`.closing-card[data-operation="${id}"] button`).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page).toHaveURL(new RegExp(`/organization/base-teller/${route}$`));
    }
  });

  test('hides operations without permission and shows only the permitted ones', async ({ page }) => {
    scenario.permissions = [
      'READ_BASE_TELLER_CASH_EXCHANGE',
      'DEPOSIT_SAVINGSACCOUNT',
      'READ_BASE_TELLER_END_OF_DAY_CLOSING'
    ];
    await open(page);

    const visible = await page
      .locator('[data-operation]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-operation')).sort());
    expect(visible).toEqual([
      'cashExchange',
      'endOfDayClosing',
      'savingsDeposit'
    ]);
    await expect(page.locator('.session-action-secondary')).toHaveCount(0);
  });

  test('the two history screens have distinct names and routes', async ({ page }) => {
    await open(page);

    await expect(card(page, 'cashOperationHistory').locator('.op-name')).toHaveText('Cash Operation History');
    await expect(card(page, 'transactionHistory').locator('.op-name')).toHaveText('Transaction History');
  });
});

test.describe('search and keyboard', () => {
  test('filters by name, description and synonym, and Enter opens the first result without a write', async ({
    page
  }) => {
    await open(page);
    const search = page.getByRole('searchbox', { name: 'Search operations' });

    await search.fill('dollar');
    await expect(page.locator('.results [data-operation]')).toHaveCount(1);
    await expect(card(page, 'foreignCurrency')).toBeVisible();
    await search.fill('receive');
    await expect(card(page, 'cashTransfers')).toBeVisible();
    await search.fill('zzzz');
    await expect(page.locator('.empty-state')).toContainText('No operations match');

    await search.fill('foreign');
    await search.press('Enter');
    await expect(page).toHaveURL(/base-teller\/foreign-currency$/);
  });

  test('matches Spanish terms regardless of accents', async ({ page }) => {
    scenario.language = { name: 'Español', code: 'es' };
    await open(page);

    await expect(page.getByText('Más usadas')).toBeVisible();
    const search = page.getByRole('searchbox');
    await search.fill('DEPOSITO');
    await expect(card(page, 'savingsDeposit')).toBeVisible();
    await expect(card(page, 'vaultDeposit')).toBeVisible();
    await search.fill('divisas');
    await expect(card(page, 'foreignCurrency')).toBeVisible();
    await search.fill('retiro');
    await expect(card(page, 'cashPickup')).toBeVisible();
    await expect(card(page, 'withdrawal')).toBeVisible();
  });

  test('Enter on a closing result asks for confirmation instead of opening it', async ({ page }) => {
    await open(page);
    const search = page.getByRole('searchbox', { name: 'Search operations' });
    await search.fill('end of day');
    await search.press('Enter');

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL(/base-teller$/);
  });

  test('Ctrl+K focuses the operation search', async ({ page }) => {
    await open(page);
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Control+K');

    await expect(page.getByRole('searchbox', { name: 'Search operations' })).toBeFocused();
  });

  for (const [
    key,
    route
  ] of [
    [
      'F2',
      'savings-account-deposits'
    ],
    [
      'F3',
      'withdrawals'
    ],
    [
      'F4',
      'credit-payments'
    ],
    [
      'F5',
      'service-payments'
    ]
  ]) {
    test(`${key} opens the frequent operation without running it`, async ({ page }) => {
      await open(page);
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      await page.keyboard.press(key);

      await expect(page).toHaveURL(new RegExp(`/organization/base-teller/${route}$`));
    });
  }

  test('shortcuts are ignored while typing', async ({ page }) => {
    await open(page);
    await page.getByRole('searchbox', { name: 'Search operations' }).focus();
    await page.keyboard.press('F2');
    await page.keyboard.press('F3');

    await expect(page).toHaveURL(/base-teller$/);
  });

  test('a shortcut for an operation the user cannot use does nothing', async ({ page }) => {
    scenario.permissions = ['DEPOSIT_SAVINGSACCOUNT'];
    await open(page);
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('F3');

    await expect(page).toHaveURL(/base-teller$/);
    await expect(page.locator('.tile')).toHaveCount(1);
  });

  test('tiles and cards are keyboard reachable with a visible focus indicator', async ({ page }) => {
    await open(page);
    await page.locator('.tile').first().focus();

    await expect(page.locator('.tile').first()).toBeFocused();
    const outline = await page
      .locator('.tile')
      .first()
      .evaluate((node) => getComputedStyle(node).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/savings-account-deposits$/);
  });
});

test.describe('closing confirmation', () => {
  test('cancel sends nothing, keeps the page, and focuses the safe choice', async ({ page }) => {
    await open(page);
    await page.locator('.closing-card[data-operation="cashRegisterClosing"] button').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Start Cash Register Closing?');
    await expect(dialog).toContainText('Window 2');
    await expect(dialog).toContainText('Synthetic Cashier');
    await expect(dialog).toContainText('Nothing is closed from this page');
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/base-teller$/);
  });

  test('end-of-day closing keeps its supervisor requirement visible', async ({ page }) => {
    await open(page);
    await page.locator('.closing-card[data-operation="endOfDayClosing"] button').click();

    await expect(page.getByRole('dialog')).toContainText('supervisor authorization');
  });
});

test.describe('responsive layout and themes', () => {
  const VIEWPORTS = [
    { width: 390, height: 844, columns: 1 },
    { width: 768, height: 1024, columns: 2 },
    { width: 1280, height: 900, columns: 3 },
    { width: 1920, height: 1080, columns: 3 }
  ];

  for (const viewport of VIEWPORTS) {
    test(`renders without horizontal overflow at ${viewport.width}px`, async ({ page }, info) => {
      await open(page, { viewport });

      const overflow = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        workspace:
          (document.querySelector('mifosx-base-teller') as HTMLElement).scrollWidth -
          (document.querySelector('mifosx-base-teller') as HTMLElement).clientWidth
      }));
      expect(overflow.page).toBeLessThanOrEqual(1);
      expect(overflow.workspace).toBeLessThanOrEqual(1);
      await expect(page.getByRole('searchbox', { name: 'Search operations' })).toBeVisible();
      await expect(page.locator('.closing-card button').first()).toBeVisible();

      const columns = await page
        .locator('.card-grid')
        .first()
        .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(viewport.columns);
      await page.screenshot({ path: info.outputPath(`after-${viewport.width}.png`), fullPage: true });
    });
  }

  test('supports the dark theme without changing the primary brand colour', async ({ page }, info) => {
    scenario.dark = true;
    await open(page);

    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    const colours = await page.evaluate(() => {
      const bg = (selector: string) =>
        getComputedStyle(document.querySelector(selector) as HTMLElement).backgroundColor;
      return { header: bg('.session-header'), card: bg('.op-card'), page: bg('body') };
    });
    expect(colours.header).toBe('rgb(13, 43, 94)');
    expect(colours.card).not.toBe('rgb(255, 255, 255)');
    expect(colours.card).not.toBe(colours.header);
    // Mifos blue stays the accent: the operation icon uses the blue token, never green.
    const icon = await page
      .locator('.op-icon')
      .first()
      .evaluate((node) => getComputedStyle(node).color);
    const [
      red,
      green,
      blue
    ] = (icon.match(/\d+/g) ?? []).map(Number);
    expect(blue).toBeGreaterThan(green);
    expect(blue).toBeGreaterThan(red);
    await page.screenshot({ path: info.outputPath('after-dark-1440.png'), fullPage: true });
  });
});
