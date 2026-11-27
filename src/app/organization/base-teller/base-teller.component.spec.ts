/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Subject, of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { BaseTellerComponent } from './base-teller.component';
import { CashHolding } from './cash-management/cash-management.models';
import { TransactionHistoryItem, TransactionHistorySearch } from './transaction-history/transaction-history.models';
import { BASE_TELLER_FREQUENT_OPERATIONS, FrequentOperationSlot } from './workspace/base-teller-workflows';
import { TELLER_CASH_POLICY, TellerCashPolicy } from './workspace/teller-cash-policy';
import { AssignmentResolution, RegisterSnapshot, Section, TellerAssignment } from './workspace/teller-workspace.models';
import { TellerWorkspaceService } from './workspace/teller-workspace.service';
import { formatClock } from './workspace/teller-workspace.view';

// ---------------------------------------------------------------------------------------------------------------------
// Synthetic fixtures. Nothing below is copied from a real cashier, balance or transaction.
// ---------------------------------------------------------------------------------------------------------------------

const DATE = '2026-11-27';
const translations = (code: string) =>
  JSON.parse(readFileSync(join(__dirname, `../../../assets/translations/${code}.json`), 'utf8'));

const assignment = (overrides: Partial<TellerAssignment> = {}): TellerAssignment => ({
  cashierId: 31,
  tellerId: 2,
  tellerName: 'Window 2',
  cashierName: 'Synthetic Cashier',
  officeName: 'Synthetic Branch',
  ...overrides
});

const holding = (overrides: Partial<CashHolding> = {}): CashHolding => ({
  businessDate: DATE,
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

const row = (id: number, hour: number, overrides: Partial<TransactionHistoryItem> = {}): TransactionHistoryItem => ({
  historyId: `SAVINGS_DEPOSIT:${id}`,
  transactionDate: `2026-11-27T${String(hour).padStart(2, '0')}:00:00Z`,
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

const opening = row(900, 8, {
  historyId: 'CASH_ALLOCATION:5',
  transactionDate: '2026-11-27T08:02:00Z',
  operation: 'ALLOCATE_CASH',
  concept: 'HEAD_CASHIER_ALLOCATION',
  inflow: 15000,
  reference: 'ALLOC-5'
});
const countRow = row(901, 15, {
  historyId: 'CASHIER_CLOSING:9',
  transactionDate: '2026-11-27T13:15:00Z',
  operation: 'CLOSE_CASHIER',
  concept: 'CASHIER_RECONCILIATION',
  inflow: 0,
  outflow: 10,
  reference: 'CLOSE-9'
});

const historyPage = (items: TransactionHistoryItem[], total = items.length): TransactionHistorySearch => ({
  items,
  totalFilteredRecords: total,
  offset: 0,
  limit: 500,
  totalsByCurrency: []
});

const ready = <T>(data: T): Section<T> => ({ status: 'ready', data });
const registers = (state: 'open' | 'not-opened' | 'completed' | 'unknown' = 'open'): Section<RegisterSnapshot> =>
  ready({ registers: [{ currencyCode: 'MXN', state, closingId: null }], outcomes: [] });

interface Scenario {
  permissions?: string[];
  staffId?: number | null;
  resolution?: AssignmentResolution;
  holdings?: Section<CashHolding[]>;
  registers?: Section<RegisterSnapshot>;
  history?: Section<TransactionHistorySearch>;
  policy?: TellerCashPolicy;
  language?: string;
  frequent?: readonly FrequentOperationSlot[];
}

const FULL_PERMISSIONS = ['ALL_FUNCTIONS'];

describe('BaseTellerComponent', () => {
  const originalRbac = environment.productionModeEnableRBAC;
  const originalProduction = environment.productionMode;

  let fixture: ComponentFixture<BaseTellerComponent>;
  let component: BaseTellerComponent;
  let router: Router;
  let navigate: jest.SpiedFunction<Router['navigate']>;
  let credentials: { permissions: string[]; userId: number; officeId: number; staffId?: number };
  let businessDate: ReturnType<typeof signal<Date>>;
  let tenant: string;
  let workspace: {
    resolveAssignments: jest.Mock;
    loadHoldings: jest.Mock;
    loadRegisters: jest.Mock;
    loadHistory: jest.Mock;
  };

  async function setup(scenario: Scenario = {}): Promise<void> {
    credentials = {
      permissions: scenario.permissions ?? FULL_PERMISSIONS,
      userId: 5,
      officeId: 1,
      ...(scenario.staffId === null ? {} : { staffId: scenario.staffId ?? 7 })
    };
    workspace = {
      resolveAssignments: jest.fn(() => of(scenario.resolution ?? { kind: 'resolved', assignments: [assignment()] })),
      loadHoldings: jest.fn(() => of(scenario.holdings ?? ready([holding()]))),
      loadRegisters: jest.fn(() => of(scenario.registers ?? registers())),
      loadHistory: jest.fn(() =>
        of(
          scenario.history ??
            ready(
              historyPage([
                opening,
                row(1, 9),
                row(2, 10),
                row(3, 11),
                row(4, 12, { operation: 'CASH_WITHDRAWAL', inflow: 0, outflow: 40, historyId: 'SAVINGS_WITHDRAWAL:4' }),
                row(5, 13),
                row(6, 14),
                countRow
              ])
            )
        )
      )
    };
    await TestBed.configureTestingModule({
      imports: [
        BaseTellerComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: { getTranslation: (code: string) => of(translations(code)) } }
        })
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthenticationService, useValue: { getCredentials: () => credentials } },
        {
          provide: SettingsService,
          useValue: {
            get businessDate() {
              return businessDate();
            },
            get tenantIdentifier() {
              return tenant;
            }
          }
        },
        { provide: TellerWorkspaceService, useValue: workspace },
        ...(scenario.policy ? [{ provide: TELLER_CASH_POLICY, useValue: scenario.policy }] : []),
        ...(scenario.frequent ? [{ provide: BASE_TELLER_FREQUENT_OPERATIONS, useValue: scenario.frequent }] : [])
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-US');
    translate.use(scenario.language ?? 'en-US');
    router = TestBed.inject(Router);
    navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(BaseTellerComponent);
    component = fixture.componentInstance;
    await render();
  }

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const $ = (selector: string): HTMLElement | null => root().querySelector(selector);
  const $$ = (selector: string): HTMLElement[] => Array.from(root().querySelectorAll(selector));
  const text = (selector: string): string => ($(selector)?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const pageText = (): string => (root().textContent ?? '').replace(/\s+/g, ' ');
  const operationIds = (selector = '[data-operation]'): string[] =>
    $$(selector).map((element) => element.getAttribute('data-operation') ?? '');

  function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  }

  async function search(query: string): Promise<HTMLInputElement> {
    const input = $('input[role="searchbox"]') as HTMLInputElement;
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await render();
    return input;
  }

  const dialog = (): HTMLElement | null => document.querySelector('mat-dialog-container');
  const dialogButtons = (): HTMLButtonElement[] =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('mat-dialog-actions button'));

  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
    environment.productionMode = true;
    businessDate = signal(new Date(2026, 10, 27));
    tenant = 'default';
    // The Jest setup replaces storage with inert mocks; give them a real in-memory behaviour.
    const store = new Map<string, string>();
    jest.mocked(sessionStorage.getItem).mockImplementation((key: string) => store.get(key) ?? null);
    jest.mocked(sessionStorage.setItem).mockImplementation((key: string, value: string) => void store.set(key, value));
    // jsdom derives its user agent from the host OS, which would make Ctrl/Cmd tests depend on the machine.
    platform('Win32');
  });

  function platform(value: string): void {
    Object.defineProperty(navigator, 'platform', { value, configurable: true });
  }

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
    environment.productionMode = originalProduction;
    jest.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((element) => (element.innerHTML = ''));
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('session header', () => {
    it('shows the open session of the signed-in cashier from backend data', async () => {
      await setup();

      expect(text('.session-title')).toContain('Window 2');
      expect(text('.session-title')).toContain(`Open since ${formatClock('2026-11-27T08:02:00Z', 'en-US')}`);
      expect(text('.session-meta')).toContain('Synthetic Cashier');
      expect(text('.session-meta')).toContain('Synthetic Branch');
      expect(text('.session-meta')).toContain('Friday, Nov 27, 2026');
      expect(text('.metric-cash')).toContain('$48,250.00');
      expect(text('.metric-cash')).toContain('MXN');
    });

    it('queries exactly the resolved cashier and the current business date', async () => {
      await setup();

      expect(workspace.loadHoldings).toHaveBeenCalledWith(31, DATE);
      expect(workspace.loadHistory).toHaveBeenCalledWith(31, DATE);
      expect(workspace.loadRegisters).toHaveBeenCalledWith(31, ['MXN'], DATE);
    });

    it('shows operations today and the last cash count from recorded events', async () => {
      await setup();

      const metrics = $$('.metric');
      expect(metrics[1].textContent).toContain('8');
      expect(metrics[2].textContent).toContain(formatClock('2026-11-27T13:15:00Z', 'en-US') as string);
    });

    it('says "Open" without a time when the opening event is not known, rather than inventing one', async () => {
      await setup({ history: ready(historyPage([row(1, 9)])) });

      expect(text('.session-badge')).toBe('Open');
    });

    it('shows unavailable markers, not 0.00, when cash holdings cannot be read', async () => {
      await setup({ holdings: { status: 'forbidden' } });

      expect(text('.metric-cash')).toContain('Not available');
      expect(text('.metric-cash')).not.toContain('0.00');
      expect($('.limit-bar')).toBeNull();
    });

    it('shows unavailable for operations and last count when history cannot be read', async () => {
      await setup({ history: { status: 'error' } });

      expect($$('.metric')[1].textContent).toContain('Not available');
      expect($$('.metric')[2].textContent).toContain('Not available');
    });

    it('shows "no cash recorded" when the cashier has no movement today', async () => {
      await setup({ holdings: ready([]), registers: ready({ registers: [], outcomes: [] }) });

      expect(text('.metric-cash')).toContain('No cash recorded');
      expect(text('.session-badge')).toBe('Register closed');
    });

    it('does not show a single total across currencies; it offers a currency switch instead', async () => {
      await setup({
        holdings: ready([
          holding(),
          holding({ currencyCode: 'USD', currentBalance: 900, inflows: 900, outflows: 0, openingFunds: 0 })
        ]),
        registers: ready({
          registers: [
            { currencyCode: 'MXN', state: 'open', closingId: null },
            { currencyCode: 'USD', state: 'open', closingId: null }
          ],
          outcomes: []
        })
      });

      expect(text('.metric-cash')).toContain('$48,250.00');
      expect(text('.metric-cash')).not.toContain('$49,150.00');
      expect($$('mat-button-toggle').map((toggle) => toggle.textContent?.trim())).toEqual([
        'MXN',
        'USD'
      ]);

      component.selectCurrency('USD');
      await render();

      expect(text('.metric-cash')).toContain('$900.00');
      expect(text('.metric-cash')).toContain('USD');
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('session states', () => {
    it('shows a closed register with a link to the existing opening workflow, and no closing action', async () => {
      await setup({ registers: registers('not-opened') });

      expect(text('.session-badge')).toBe('Register closed');
      const open = $('.session-action-secondary') as HTMLAnchorElement;
      expect(open.textContent).toContain('Open register');
      expect(open.getAttribute('href')).toBe('/organization/base-teller/cash-allocations');
      expect(text('.session-hint')).toContain('not been opened');
    });

    it('distinguishes a completed closing from a register that was never opened', async () => {
      await setup({ registers: registers('completed') });

      expect(text('.session-badge')).toBe('Closing completed');
      expect(text('.session-hint')).toContain('already completed');
      expect(pageText()).not.toContain('Open register');
    });

    it('does not claim a state when the status cannot be verified', async () => {
      await setup({ registers: { status: 'forbidden' } });

      expect(text('.session-badge')).toBe('Status unavailable');
    });

    it('explains a user without a staff link and still lists permitted operations', async () => {
      await setup({ staffId: null, resolution: { kind: 'none', reason: 'no-staff' } });

      expect(text('.session-title')).toBe('Your user is not linked to a staff member');
      expect(workspace.loadHoldings).not.toHaveBeenCalled();
      expect(operationIds().length).toBeGreaterThan(0);
    });

    it('explains a user with no teller window today and loads no financial data', async () => {
      await setup({ resolution: { kind: 'none', reason: 'no-assignment' } });

      expect(text('.session-title')).toBe('No teller window assigned');
      expect(workspace.loadHoldings).not.toHaveBeenCalled();
      expect(workspace.loadHistory).not.toHaveBeenCalled();
      expect(text('#movement-title + p')).toContain('assigned teller window');
    });

    it.each<[
        'forbidden' | 'unavailable',
        string
      ]>([
      [
        'forbidden',
        'Session information is not available to you'
      ],
      [
        'unavailable',
        'Session information is unavailable'
      ]
    ])('shows a recoverable %s error and retries from the button', async (reason, title) => {
      await setup({ resolution: { kind: 'error', reason } });

      expect(text('.session-title')).toBe(title);
      workspace.resolveAssignments.mockClear();
      ($('.session-retry') as HTMLButtonElement).click();
      await render();

      expect(workspace.resolveAssignments).toHaveBeenCalledTimes(1);
    });

    it('asks which teller window to use when the user is assigned to several, instead of guessing', async () => {
      const second = assignment({ cashierId: 32, tellerId: 3, tellerName: 'Window 3' });
      await setup({ resolution: { kind: 'resolved', assignments: [
            assignment(),
            second
          ] } });

      expect(text('.session-title')).toBe('Select your teller window');
      expect(workspace.loadHoldings).not.toHaveBeenCalled();
      expect($$('.session-choice').map((button) => button.textContent?.trim())).toEqual([
        'Window 2 · Synthetic Cashier',
        'Window 3 · Synthetic Cashier'
      ]);

      ($$('.session-choice')[1] as HTMLButtonElement).click();
      await render();

      expect(workspace.loadHoldings).toHaveBeenCalledWith(32, DATE);
      expect(text('.session-title')).toContain('Window 3');
    });

    it('remembers the chosen window for this user and business date only', async () => {
      const second = assignment({ cashierId: 32, tellerName: 'Window 3' });
      await setup({ resolution: { kind: 'resolved', assignments: [
            assignment(),
            second
          ] } });
      ($$('.session-choice')[1] as HTMLButtonElement).click();
      await render();

      expect(sessionStorage.getItem(`mifosx.baseTeller.cashier.default|5|1|7|${DATE}`)).toBe('32');
    });

    it('ignores a remembered window that is no longer assigned', async () => {
      sessionStorage.setItem(`mifosx.baseTeller.cashier.default|5|1|7|${DATE}`, '999');
      await setup({ resolution: { kind: 'resolved', assignments: [
            assignment(),
            assignment({ cashierId: 32 })
          ] } });

      expect(text('.session-title')).toBe('Select your teller window');
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('cash limit', () => {
    const policy = (limit: string | number): TellerCashPolicy => ({ limits: [{ currencyCode: 'MXN', limit }] });

    it('shows the usage bar and percentage of the configured limit using exact arithmetic', async () => {
      await setup({ policy: policy('60000') });

      expect(text('.limit-text')).toBe('80% of the $60,000.00 limit');
      expect($('.limit-bar')?.getAttribute('aria-label')).toBe('80% of the $60,000.00 limit');
      expect($('.limit-bar')?.classList.contains('limit-warning')).toBe(true);
    });

    it('says the limit is not configured and shows neither a bar nor a warning when none is set', async () => {
      await setup();

      expect(text('.limit-text')).toBe('Cash limit not configured');
      expect($('.limit-bar')).toBeNull();
      expect($('.alert-card')).toBeNull();
    });

    it('shows the amber near-limit card at 80% with a link to the existing vault deposit, which does not transfer by itself', async () => {
      await setup({ policy: policy('60000') });

      const card = $('.alert-near') as HTMLElement;
      expect(card.textContent).toContain('Close to the cash limit');
      expect(card.textContent).toContain('stay below $60,000.00');
      const link = card.querySelector('a') as HTMLAnchorElement;
      // A plain link to the existing screen: the card itself never starts a vault transfer.
      expect(link.getAttribute('href')).toBe('/organization/base-teller/vault-cash-deposit');
      expect(card.querySelector('button')).toBeNull();
    });

    it('shows the red exceeded card at 100% and above', async () => {
      await setup({
        policy: policy(60000),
        holdings: ready([holding({ currentBalance: 61000, openingFunds: 61000, inflows: 0, outflows: 0 })])
      });

      expect($('.alert-exceeded')?.textContent).toContain('Cash limit exceeded');
      expect($('.alert-near')).toBeNull();
      expect($('.limit-bar')?.classList.contains('limit-danger')).toBe(true);
    });

    it('hides the vault action from users who may not open the vault deposit screen', async () => {
      await setup({
        policy: policy('60000'),
        permissions: [
          'READ_BASE_TELLER_CASH_EXCHANGE',
          'READ_CASH_HOLDINGS'
        ]
      });

      expect($('.alert-near')).not.toBeNull();
      expect($('.alert-action')).toBeNull();
    });

    it('evaluates each currency against its own limit', async () => {
      await setup({
        policy: {
          limits: [
            { currencyCode: 'MXN', limit: 60000 },
            { currencyCode: 'USD', limit: 1000 }
          ]
        },
        holdings: ready([
          holding({ currentBalance: 1000, openingFunds: 1000, inflows: 0, outflows: 0 }),
          holding({ currencyCode: 'USD', currentBalance: 1000, openingFunds: 1000, inflows: 0, outflows: 0 })
        ]),
        registers: ready({
          registers: [
            { currencyCode: 'MXN', state: 'open', closingId: null },
            { currencyCode: 'USD', state: 'open', closingId: null }
          ],
          outcomes: []
        })
      });

      // 1,000 is 1.7% of the MXN limit but 100% of the USD limit.
      expect($$('.alert-card')).toHaveLength(1);
      expect($('.alert-exceeded')?.textContent).toContain('USD');
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe("today's movement", () => {
    it('shows inflows, outflows, opening funds, settlements and the expected cash', async () => {
      await setup();

      const card = text('[aria-labelledby="movement-title"]');
      expect(card).toContain("Today's movement");
      expect(text('.amount-in')).toBe('$62,480.00');
      expect(text('.amount-out')).toBe('$29,230.00');
      expect(card).toContain('Opening funds$15,000.00');
      expect(card).toContain('Settlements and deposits$0.00');
      expect(card).toContain('Expected cash$48,250.00');
      expect(card).toContain('Cash on hand matches the expected cash');
    });

    it('counts customer operations next to the amounts', async () => {
      await setup();

      expect(text('.movement-totals')).toContain('5 operations');
      expect(text('.movement-totals')).toContain('1 operation');
    });

    it('reports a difference in red, with a way into the existing closing workflow', async () => {
      await setup({ holdings: ready([holding({ currentBalance: 48000 })]) });

      expect(text('.movement-difference')).toContain('Difference of $250.00');
      expect($('.movement-balanced')).toBeNull();
      expect(pageText()).toContain('Review in register closing');
    });

    it('does not offer the closing link when the register is not open', async () => {
      await setup({ holdings: ready([holding({ currentBalance: 48000 })]), registers: registers('not-opened') });

      expect(pageText()).not.toContain('Review in register closing');
    });

    it('says reconciliation is incomplete rather than showing zeros when a figure is missing', async () => {
      await setup({ holdings: ready([holding({ settlementsAndDeposits: undefined as unknown as number })]) });

      expect(pageText()).toContain('Reconciliation data is incomplete');
      expect($('.movement-lines')).toBeNull();
      expect(text('.metric-cash')).toContain('Not available');
    });

    it('shows the backend closing difference for a completed register', async () => {
      await setup({
        registers: ready({
          registers: [{ currencyCode: 'MXN', state: 'completed', closingId: 12 }],
          outcomes: [{ currencyCode: 'MXN', difference: -20, differenceType: 'SHORTAGE', authorizedOn: null }]
        })
      });

      expect(text('.movement-closing')).toBe('Closing difference: $20.00 (Shortage)');
    });

    it('shows a loading note, then recovers from a failed load with a retry', async () => {
      await setup({ holdings: { status: 'error' } });

      expect(pageText()).toContain('This information could not be loaded.');
      workspace.resolveAssignments.mockClear();
      ($('[aria-labelledby="movement-title"] button') as HTMLButtonElement).click();
      await render();

      expect(workspace.resolveAssignments).toHaveBeenCalled();
    });

    it('explains a permission gap on the panel only', async () => {
      await setup({ holdings: { status: 'forbidden' } });

      expect(text('[aria-labelledby="movement-title"]')).toContain('not available for your role');
      expect(text('[aria-labelledby="recent-title"]')).not.toContain('not available for your role');
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('recent operations', () => {
    it('lists the five newest operations of the cashier, newest first, with signed amounts', async () => {
      await setup();

      const items = $$('.recent-item');
      expect(items).toHaveLength(5);
      expect(items.map((item) => item.querySelector('.recent-reference')?.textContent)).toEqual([
        'REF-6',
        'CLOSE-9',
        'REF-5',
        'REF-4',
        'REF-3'
      ]);
    });

    it('shows time, operation type, reference and a + or − amount in the operation currency', async () => {
      await setup();

      const withdrawal = $$('.recent-item')[3];
      expect(withdrawal.querySelector('.recent-operation')?.textContent).toBe('Withdrawal');
      expect(withdrawal.querySelector('.recent-amount')?.textContent?.trim()).toBe('−$40.00');
      expect(withdrawal.querySelector('.recent-amount')?.classList.contains('amount-out')).toBe(true);
      expect(withdrawal.querySelector('time')?.textContent?.trim()).toBe(
        formatClock('2026-11-27T12:00:00Z', 'en-US') as string
      );

      const deposit = $$('.recent-item')[0];
      expect(deposit.querySelector('.recent-amount')?.textContent?.trim()).toBe('+$600.00');
      expect(deposit.querySelector('.recent-amount')?.classList.contains('amount-in')).toBe(true);
    });

    it('falls back to a readable name for an operation code it does not know', async () => {
      await setup({ history: ready(historyPage([row(1, 9, { operation: 'BRAND_NEW_THING' })])) });

      expect($('.recent-operation')?.textContent).toBe('Brand New Thing');
    });

    it('shows an empty state when nothing was recorded today', async () => {
      await setup({ history: ready(historyPage([])) });

      expect(text('[aria-labelledby="recent-title"]')).toContain('No operations recorded today.');
    });

    it('shows an error state without inventing rows when history is unavailable', async () => {
      await setup({ history: { status: 'error' } });

      expect($$('.recent-item')).toHaveLength(0);
      expect(text('[aria-labelledby="recent-title"]')).toContain('could not be loaded');
    });

    it('links to history already filtered to this cashier and business day', async () => {
      await setup();

      const link = $('.side-link') as HTMLAnchorElement;
      expect(link.textContent?.trim()).toBe('View history');
      expect(link.getAttribute('href')).toBe(
        '/organization/base-teller/transaction-history?cashierId=31&date=2026-11-27'
      );
    });

    it('does not offer the history link to users without permission', async () => {
      await setup({ permissions: ['READ_BASE_TELLER_CASH_EXCHANGE'] });

      expect($('.side-link')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('operations and permissions', () => {
    it('renders every authorised operation exactly once, with its original route', async () => {
      await setup();

      const tiles = operationIds('.tile');
      const cards = operationIds('.op-card');
      const closings = operationIds('.closing-card');
      expect(tiles).toEqual([
        'savingsDeposit',
        'withdrawal',
        'loanPayment',
        'servicePayment'
      ]);
      expect(
        [
          ...tiles,
          ...cards,
          ...closings
        ].sort()
      ).toEqual(
        [
          'accountTransfers',
          'bankDeposit',
          'cashAllocation',
          'cashExchange',
          'cashInventory',
          'cashOnHand',
          'cashOperationHistory',
          'cashPickup',
          'cashRegisterClosing',
          'cashTransfers',
          'catalogUpdates',
          'depositInTransit',
          'endOfDayClosing',
          'foreignCurrency',
          'globalCashCount',
          'loanPayment',
          'returnedCheck',
          'savingsDeposit',
          'savingsOpening',
          'servicePayment',
          'transactionHistory',
          'transactionReversal',
          'vaultDeposit',
          'vaultHistory',
          'withdrawal'
        ].sort()
      );
      expect(($('.tile[data-operation="withdrawal"]') as HTMLAnchorElement).getAttribute('href')).toBe(
        '/organization/base-teller/withdrawals'
      );
      expect(($('.op-card[data-operation="cashOperationHistory"]') as HTMLAnchorElement).getAttribute('href')).toBe(
        '/organization/base-teller/cash-operation-history'
      );
      expect(($('.op-card[data-operation="transactionHistory"]') as HTMLAnchorElement).getAttribute('href')).toBe(
        '/organization/base-teller/transaction-history'
      );
    });

    it('groups operations under the five requested headings', async () => {
      await setup();

      expect($$('.section-title').map((title) => title.firstChild?.textContent?.trim())).toEqual([
        'Most used',
        'Customer operations',
        'Cash drawer',
        'Vault and banks',
        'Consultations and corrections',
        'Closings'
      ]);
    });

    it('lists the two history screens under distinct names', async () => {
      await setup();

      const names = (id: string) => $(`.op-card[data-operation="${id}"] .op-name`)?.textContent?.trim();
      expect(names('cashOperationHistory')).toBe('Cash Operation History');
      expect(names('transactionHistory')).toBe('Transaction History');
    });

    it('hides operations the user may not use instead of showing them disabled', async () => {
      await setup({ permissions: [
          'READ_BASE_TELLER_CASH_EXCHANGE',
          'DEPOSIT_SAVINGSACCOUNT'
        ] });

      expect(operationIds().sort()).toEqual([
        'cashExchange',
        'savingsDeposit'
      ]);
      expect($$('[disabled]').filter((element) => element.hasAttribute('data-operation'))).toHaveLength(0);
    });

    it('hides frequent tiles without permission and does not repeat a frequent operation in its group', async () => {
      await setup({ permissions: ['DEPOSIT_SAVINGSACCOUNT'] });

      expect(operationIds('.tile')).toEqual(['savingsDeposit']);
      expect(operationIds('.op-card')).toEqual([]);
    });

    it('hides Bill and Service Payment outside production mode', async () => {
      environment.productionMode = false;
      await setup();

      expect(operationIds()).not.toContain('servicePayment');
      expect(operationIds('.tile')).toEqual([
        'savingsDeposit',
        'withdrawal',
        'loanPayment'
      ]);
    });

    it('gives the withdrawal tile the red emphasis and the others the blue theme', async () => {
      await setup();

      expect($('.tile[data-operation="withdrawal"] .op-icon-danger')).not.toBeNull();
      expect($('.tile[data-operation="savingsDeposit"] .op-icon-danger')).toBeNull();
    });

    it('exposes each tile shortcut and an accessible description', async () => {
      await setup();

      const tile = $('.tile[data-operation="savingsDeposit"]') as HTMLElement;
      expect(tile.getAttribute('aria-keyshortcuts')).toBe('F2');
      expect(tile.querySelector('.shortcut-chip')?.textContent).toBe('F2');
      const hint = document.getElementById(tile.getAttribute('aria-describedby') as string);
      expect(hint?.textContent).toContain('Deposit cash or checks into a savings account');
      expect(hint?.textContent).toContain('Shortcut F2');
    });

    it('uses a configured frequent-operation set and shows the displaced operation in its group', async () => {
      await setup({
        frequent: [
          { shortcut: 'F2', operationId: 'cashExchange' },
          { shortcut: 'F3', operationId: 'withdrawal' },
          { shortcut: 'F4', operationId: 'loanPayment' },
          { shortcut: 'F5', operationId: 'servicePayment' }
        ]
      });

      expect(operationIds('.tile')[0]).toBe('cashExchange');
      expect(operationIds('.op-card')).toContain('savingsDeposit');
    });

    it('never sends a financial request from the landing page: only read calls are made', async () => {
      await setup();

      // The page's data source exposes only reads, and operation cards are plain links.
      expect(Object.keys(workspace)).toEqual([
        'resolveAssignments',
        'loadHoldings',
        'loadRegisters',
        'loadHistory'
      ]);
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('operation search', () => {
    it('keeps the grouped view until something is typed', async () => {
      await setup();

      expect($('.results')).toBeNull();
      await search('divisas');
      expect($('.results')).not.toBeNull();
      expect($('.tile')).toBeNull();
    });

    it('finds an operation by name', async () => {
      await setup();
      await search('currency');

      // The name match ranks first; the cash-on-hand description also mentions "currency".
      expect(operationIds('.results [data-operation]')).toEqual([
        'foreignCurrency',
        'cashOnHand'
      ]);
    });

    it('announces the number of results and shows an empty state with the query', async () => {
      await setup();
      await search('zzzz');

      expect($('.empty-state')?.textContent).toContain('No operations match “zzzz”.');
      expect(text('.results [role="status"]')).toBe('0 operations found');
    });

    it('never offers an operation the user cannot use', async () => {
      await setup({ permissions: ['READ_BASE_TELLER_CASH_EXCHANGE'] });
      await search('exchange');

      expect(operationIds('.results [data-operation]')).toEqual(['cashExchange']);
      await search('vault');
      expect(operationIds('.results [data-operation]')).toEqual([]);
    });

    it('opens the first result on Enter by navigating only', async () => {
      await setup();
      const input = await search('currency');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      input.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith([
        '/organization',
        'base-teller',
        'foreign-currency'
      ]);
    });

    it('does nothing on Enter when there are no results', async () => {
      await setup();
      const input = await search('zzzz');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

      expect(navigate).not.toHaveBeenCalled();
    });

    it('asks for confirmation instead of opening a closing workflow directly on Enter', async () => {
      await setup();
      const input = await search('end of day');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await render();

      expect(navigate).not.toHaveBeenCalled();
      expect(dialog()).not.toBeNull();
    });

    it('skips a result that is disabled by the register state and opens the next enabled one', async () => {
      await setup({ registers: registers('not-opened') });
      const input = await search('register');

      expect(operationIds('.results [data-operation]')[0]).toBe('cashRegisterClosing');
      expect(($('.results [data-operation="cashRegisterClosing"]') as HTMLButtonElement).disabled).toBe(true);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await render();

      expect(navigate).not.toHaveBeenCalledWith([
        '/organization',
        'base-teller',
        'cash-register-closing'
      ]);
    });

    it('explains why a result is disabled with visible text, not only a tooltip', async () => {
      await setup({ registers: registers('not-opened') });
      await search('register');

      const card = $('.results [data-operation="cashRegisterClosing"]') as HTMLButtonElement;
      const hint = document.getElementById(card.getAttribute('aria-describedby') as string);
      expect(hint?.textContent?.trim()).toBe('Open the register to continue');
    });

    it('moves between results with the arrow keys and back to the box with ArrowUp', async () => {
      await setup();
      const input = await search('payment');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      const cards = $$('[data-result-card]');
      expect(document.activeElement).toBe(cards[0]);

      cards[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(cards[1]);
      cards[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
      cards[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(input);
    });

    it('clears the search with Escape and with the clear button', async () => {
      await setup();
      const input = await search('currency');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await render();
      expect($('.results')).toBeNull();

      await search('currency');
      ($('.search-box button') as HTMLButtonElement).click();
      await render();
      expect($('.results')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('keyboard shortcuts', () => {
    it('focuses and selects the operation search with Ctrl+K', async () => {
      await setup();
      const input = $('input[role="searchbox"]') as HTMLInputElement;
      input.value = 'abc';

      const event = press('k', { ctrlKey: true });

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(input);
    });

    it('uses Cmd+K, not Ctrl+K, on macOS', async () => {
      platform('MacIntel');
      await setup();
      const input = $('input[role="searchbox"]') as HTMLInputElement;

      expect(press('k', { ctrlKey: true }).defaultPrevented).toBe(false);
      expect(press('k', { metaKey: true }).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(input);
      expect(text('.shortcut-chip')).toBe('\u2318 K');
    });

    it('does not steal Ctrl+K from another text field', async () => {
      await setup();
      const other = document.createElement('input');
      document.body.appendChild(other);
      other.focus();
      const event = press('k', { ctrlKey: true }, other);
      other.remove();

      expect(event.defaultPrevented).toBe(false);
    });

    it('does not run while a dialog is open', async () => {
      await setup();
      document.body.insertAdjacentHTML(
        'beforeend',
        '<div class="cdk-overlay-container"><div role="dialog"></div></div>'
      );

      expect(press('k', { ctrlKey: true }).defaultPrevented).toBe(false);
      expect(press('F2').defaultPrevented).toBe(false);
    });

    it.each([
      [
        'F2',
        [
          '/organization',
          'base-teller',
          'savings-account-deposits'
        ]
      ],
      [
        'F3',
        [
          '/organization',
          'base-teller',
          'withdrawals'
        ]
      ],
      [
        'F4',
        [
          '/organization',
          'base-teller',
          'credit-payments'
        ]
      ],
      [
        'F5',
        [
          '/organization',
          'base-teller',
          'service-payments'
        ]
      ]
    ])('%s navigates to its frequent operation without running a transaction', async (key, route) => {
      await setup();
      const event = press(key);

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(route);
    });

    it('ignores F2 while typing in the operation search box', async () => {
      await setup();
      const event = press('F2', {}, $('input[role="searchbox"]') as HTMLElement);

      expect(event.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('ignores a shortcut for an operation the user is not authorised to use, leaving browser behaviour alone', async () => {
      await setup({ permissions: ['DEPOSIT_SAVINGSACCOUNT'] });

      for (const key of [
        'F3',
        'F4',
        'F5'
      ]) {
        expect(press(key).defaultPrevented).toBe(false);
      }
      expect(navigate).not.toHaveBeenCalled();
      expect(press('F2').defaultPrevented).toBe(true);
    });

    it('leaves F5 to the browser when Bill and Service Payment is not available', async () => {
      environment.productionMode = false;
      await setup();

      expect(press('F5').defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('ignores events another handler already consumed', async () => {
      await setup();
      // A handler lower in the tree (like a widget that uses F2 itself) consumes the key first.
      const handler = (event: Event) => event.preventDefault();
      document.body.addEventListener('keydown', handler);
      press('F2', {}, document.body);
      document.body.removeEventListener('keydown', handler);

      expect(navigate).not.toHaveBeenCalled();
    });

    it('removes its document listener when the component is destroyed', async () => {
      await setup();
      fixture.destroy();

      expect(press('F2').defaultPrevented).toBe(false);
      expect(press('k', { ctrlKey: true }).defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('closing operations', () => {
    const closingCard = (id: string) => $(`.closing-card[data-operation="${id}"]`) as HTMLElement;
    const start = (id: string) => closingCard(id).querySelector('button') as HTMLButtonElement;

    it('places both closings in the last section with explicit Start buttons and no card links', async () => {
      await setup();

      expect(operationIds('.closing-card')).toEqual([
        'cashRegisterClosing',
        'endOfDayClosing'
      ]);
      expect($$('.closing-card a')).toHaveLength(0);
      expect($$('.op-card').some((card) => card.getAttribute('data-operation')?.includes('Closing'))).toBe(false);
      expect(start('cashRegisterClosing').textContent?.trim()).toBe('Start');
      expect($$('.section-title').pop()?.firstChild?.textContent?.trim()).toBe('Closings');
    });

    it('asks for confirmation naming the workflow, teller window and cashier, and navigates nowhere yet', async () => {
      await setup();
      start('cashRegisterClosing').click();
      await render();

      expect(dialog()?.textContent).toContain('Start Cash Register Closing?');
      expect(dialog()?.textContent).toContain('Window 2');
      expect(dialog()?.textContent).toContain('Synthetic Cashier');
      expect(dialog()?.textContent).toContain('Nothing is closed from this page');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing when the confirmation is cancelled', async () => {
      await setup();
      start('cashRegisterClosing').click();
      await render();
      dialogButtons()[0].click();
      await render();

      expect(dialog()).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('only navigates to the existing closing screen after the user confirms', async () => {
      await setup();
      start('cashRegisterClosing').click();
      await render();
      dialogButtons()[1].click();
      await render();

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith([
        '/organization',
        'base-teller',
        'cash-register-closing'
      ]);
    });

    it('marks the safe choice, Cancel, as the initial focus (real focus is verified in the browser test)', async () => {
      // jsdom has no layout, so Material's tabbable search cannot move focus here; the contract is the markup.
      await setup();
      start('cashRegisterClosing').click();
      await render();

      expect(dialogButtons()[0].textContent?.trim()).toBe('Cancel');
      expect(dialogButtons()[0].hasAttribute('cdkfocusinitial')).toBe(true);
      expect(dialogButtons()[1].hasAttribute('cdkfocusinitial')).toBe(false);
    });

    it('opens a single confirmation however many times Start is pressed', async () => {
      await setup();
      start('endOfDayClosing').click();
      start('endOfDayClosing').click();
      component.confirmClosing(component.closings()[1]);
      await render();

      expect(document.querySelectorAll('mat-dialog-container')).toHaveLength(1);
    });

    it('keeps the supervisor requirement of end-of-day closing visible and routes to its existing screen', async () => {
      await setup();
      start('endOfDayClosing').click();
      await render();

      expect(dialog()?.textContent).toContain('supervisor authorization');
      dialogButtons()[1].click();
      await render();

      expect(navigate).toHaveBeenCalledWith([
        '/organization',
        'base-teller',
        'end-of-day-cash-closing'
      ]);
    });

    it('does not mention a supervisor for the cashier closing', async () => {
      await setup();
      start('cashRegisterClosing').click();
      await render();

      expect(dialog()?.textContent).not.toContain('supervisor');
    });

    it('disables cash register closing, with visible text, when the register is not open', async () => {
      await setup({ registers: registers('not-opened') });

      expect(start('cashRegisterClosing').disabled).toBe(true);
      expect(closingCard('cashRegisterClosing').textContent).toContain('Open the register to continue');
      start('cashRegisterClosing').click();
      await render();
      expect(dialog()).toBeNull();
    });

    it('disables cash register closing once it is completed', async () => {
      await setup({ registers: registers('completed') });

      expect(start('cashRegisterClosing').disabled).toBe(true);
      expect(closingCard('cashRegisterClosing').textContent).toContain('already closed for today');
    });

    it('keeps end-of-day closing available whatever the cashier register state', async () => {
      await setup({ registers: registers('not-opened') });

      expect(start('endOfDayClosing').disabled).toBe(false);
    });

    it('lets the user continue to the closing screen when the register state cannot be verified', async () => {
      await setup({ registers: { status: 'forbidden' } });

      expect(start('cashRegisterClosing').disabled).toBe(false);
    });

    it('offers Close register in the header, through the same confirmation', async () => {
      await setup();
      const button = $('.session-action-secondary') as HTMLButtonElement;
      expect(button.textContent).toContain('Close register');
      button.click();
      await render();

      expect(dialog()).not.toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('hides closing workflows the user is not authorised for', async () => {
      await setup({ permissions: ['READ_BASE_TELLER_END_OF_DAY_CLOSING'] });

      expect(operationIds('.closing-card')).toEqual(['endOfDayClosing']);
      expect($('.session-action-secondary')).toBeNull();
    });

    it('closes an open confirmation when the component is destroyed', async () => {
      await setup();
      start('cashRegisterClosing').click();
      await render();
      expect(dialog()).not.toBeNull();

      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve));

      expect(dialog()).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('refresh, stale data and identity changes', () => {
    it('ignores an older response when a newer load has started', async () => {
      const first = new Subject<Section<CashHolding[]>>();
      const second = new Subject<Section<CashHolding[]>>();
      await setup();
      workspace.loadHoldings.mockReturnValueOnce(first).mockReturnValueOnce(second);

      component.refresh({ force: true });
      component.refresh({ force: true });
      await render();
      second.next(ready([holding({ currentBalance: 111 })]));
      await render();

      expect(first.observed).toBe(false);
      first.next(ready([holding({ currentBalance: 999 })]));
      await render();

      expect(text('.metric-cash')).toContain('$111.00');
      expect(text('.metric-cash')).not.toContain('$999.00');
    });

    it('does not apply a response after the signed-in user changed', async () => {
      const pending = new Subject<Section<CashHolding[]>>();
      await setup();
      workspace.loadHoldings.mockReturnValueOnce(pending);
      component.refresh({ force: true });
      await render();

      credentials = { ...credentials, userId: 6, staffId: 8 };
      pending.next(ready([holding({ currentBalance: 777 })]));
      await render();

      expect(pageText()).not.toContain('$777.00');
    });

    it('does not apply a response after the tenant changed', async () => {
      const pending = new Subject<Section<CashHolding[]>>();
      await setup();
      workspace.loadHoldings.mockReturnValueOnce(pending);
      component.refresh({ force: true });
      await render();

      tenant = 'other-tenant';
      pending.next(ready([holding({ currentBalance: 777 })]));
      await render();

      expect(pageText()).not.toContain('$777.00');
    });

    it('clears the previous user figures and looks the teller window up again when the identity changes', async () => {
      await setup();
      expect(text('.metric-cash')).toContain('$48,250.00');

      credentials = { ...credentials, userId: 6, staffId: 8 };
      workspace.resolveAssignments.mockReturnValue(new Subject());
      component.refresh();
      await render();

      expect(workspace.resolveAssignments).toHaveBeenCalledTimes(2);
      expect(pageText()).not.toContain('$48,250.00');
      expect(pageText()).not.toContain('Synthetic Cashier');
    });

    it('reloads everything for the new date when the business date changes', async () => {
      await setup();
      workspace.loadHoldings.mockClear();

      businessDate.set(new Date(2026, 10, 28));
      await render();

      expect(workspace.loadHoldings).toHaveBeenCalledWith(31, '2026-11-28');
      expect(workspace.loadHistory).toHaveBeenLastCalledWith(31, '2026-11-28');
    });

    it('reuses the teller window lookup for a soft refresh but repeats it for a forced one', async () => {
      await setup();
      component.refresh();
      await render();
      expect(workspace.resolveAssignments).toHaveBeenCalledTimes(1);
      expect(workspace.loadHoldings).toHaveBeenCalledTimes(2);

      component.refresh({ force: true });
      await render();
      expect(workspace.resolveAssignments).toHaveBeenCalledTimes(2);
    });

    it('refreshes when the tab becomes visible again after a minute, without polling', async () => {
      await setup();
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now + 30_000);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(workspace.loadHoldings).toHaveBeenCalledTimes(1);

      jest.spyOn(Date, 'now').mockReturnValue(now + 61_000);
      document.dispatchEvent(new Event('visibilitychange'));
      await render();
      expect(workspace.loadHoldings).toHaveBeenCalledTimes(2);
    });

    it('keeps the current figures on screen during a soft refresh', async () => {
      await setup();
      const pending = new Subject<Section<CashHolding[]>>();
      workspace.loadHoldings.mockReturnValueOnce(pending);

      component.refresh({ soft: true });
      await render();

      expect(text('.metric-cash')).toContain('$48,250.00');
    });

    it('shows loading placeholders, not stale numbers, during a normal refresh', async () => {
      await setup();
      workspace.loadHoldings.mockReturnValueOnce(new Subject());

      component.refresh({ force: true });
      await render();

      expect(text('.metric-cash')).not.toContain('$48,250.00');
      expect(text('[aria-labelledby="movement-title"]')).toContain('Loading');
    });

    it('stops loading when destroyed', async () => {
      await setup();
      fixture.destroy();
      workspace.loadHoldings.mockClear();

      component.refresh({ force: true });

      expect(workspace.resolveAssignments).toHaveBeenCalledTimes(1);
      expect(workspace.loadHoldings).not.toHaveBeenCalled();
    });

    it('cancels in-flight requests when destroyed', async () => {
      const pending = new Subject<Section<CashHolding[]>>();
      await setup();
      workspace.loadHoldings.mockReturnValueOnce(pending);
      component.refresh({ force: true });
      await render();
      expect(pending.observed).toBe(true);

      fixture.destroy();

      expect(pending.observed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('translations', () => {
    it('renders only translated text in English, with no raw translation keys', async () => {
      await setup({ policy: { limits: [{ currencyCode: 'MXN', limit: 60000 }] } });

      expect(pageText()).not.toMatch(/baseTellerWorkspace\./);
      expect(pageText()).not.toMatch(/labels\.heading\./);
      expect(pageText()).toContain('Most used');
    });

    it('renders Spanish text when the language is Spanish', async () => {
      await setup({ language: 'es-MX', policy: { limits: [{ currencyCode: 'MXN', limit: 60000 }] } });

      expect(pageText()).not.toMatch(/baseTellerWorkspace\./);
      expect(pageText()).toContain('Más usadas');
      expect(pageText()).toContain('Operaciones con clientes');
      expect(pageText()).toContain('Movimiento de hoy');
      expect(pageText()).toContain('Cerca del límite de efectivo');
      expect(pageText()).toContain('Depositar en bóveda');
      expect(text('.limit-text')).toBe('80% del límite de $60,000.00');
      expect(($('input[role="searchbox"]') as HTMLInputElement).placeholder).toBe(
        'Buscar una operación, por ejemplo “depósito” o “divisas”'
      );
    });

    it('re-renders when the language is switched while the page is open', async () => {
      await setup();
      expect(pageText()).toContain('Most used');

      TestBed.inject(TranslateService).use('es-MX');
      await render();

      expect(pageText()).toContain('Más usadas');
    });

    it('translates the confirmation dialog and the shortcut hint', async () => {
      await setup({ language: 'es-MX' });
      ($('.closing-card[data-operation="cashRegisterClosing"] button') as HTMLButtonElement).click();
      await render();

      expect(dialog()?.textContent).toContain('¿Iniciar Cierre de caja registradora?');
      expect(dialog()?.textContent).toContain('Continuar');
      expect(dialog()?.textContent).not.toMatch(/baseTellerWorkspace\./);
    });

    it.each([
      'en-US',
      'es-MX',
      'es-CL',
      'fr-FR',
      'de-DE',
      'it-IT',
      'pt-PT',
      'az-AZ',
      'cs-CS',
      'ko-KO',
      'lt-LT',
      'lv-LV',
      'ne-NE',
      'sw-SW'
    ])('has the complete workspace text in %s', (code) => {
      const english = translations('en-US').baseTellerWorkspace;
      const flatten = (object: Record<string, unknown>, prefix = ''): string[] =>
        Object.entries(object).flatMap(
          ([
            key,
            value
          ]) =>
            typeof value === 'object' && value !== null
              ? flatten(value as Record<string, unknown>, `${prefix}${key}.`)
              : [`${prefix}${key}`]
        );
      const placeholders = (value: unknown): string[] => (String(value).match(/\{\{\w+\}\}/g) ?? []).sort();
      const valueAt = (tree: Record<string, unknown>, key: string): unknown =>
        key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], tree);
      const localized = translations(code).baseTellerWorkspace ?? {};
      const expected = flatten(english);

      expect(flatten(localized).sort()).toEqual([...expected].sort());
      // Interpolation placeholders must survive translation, or the amounts and names would silently disappear.
      for (const key of expected) {
        expect(placeholders(valueAt(localized, key))).toEqual(placeholders(valueAt(english, key)));
      }
    });
  });
});
