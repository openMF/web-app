/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { VaultCashDepositComponent } from './vault-cash-deposit.component';
import { VaultContext, VaultCurrencies, VaultDenominations } from './vault-cash-deposit.models';

const root = '/v2/base-teller/vault';
const context: VaultContext = {
  branch: { id: 31, name: 'Synthetic branch' },
  vault: { key: 'VAULT:31', officeId: 31, name: 'Synthetic vault', status: 'UNKNOWN' },
  businessDate: '2026-10-27',
  supportedCurrencies: [
    { code: 'USD', name: 'US Dollar', decimalPlaces: 2 },
    { code: 'JPY', name: 'Japanese Yen', decimalPlaces: 0 }
  ],
  capabilities: {
    viewContext: true,
    viewCurrencies: true,
    viewDenominations: true,
    viewInventory: true,
    previewDeposit: false,
    executeDeposit: false
  },
  readiness: { depositReady: false, limitations: ['VAULT_STATUS_UNKNOWN'] }
};
const currencies: VaultCurrencies = {
  vaultKey: 'VAULT:31',
  currencies: context.supportedCurrencies,
  status: 'AVAILABLE'
};
const denominations: VaultDenominations = {
  vaultKey: 'VAULT:31',
  currencyCode: 'USD',
  status: 'AVAILABLE',
  denominations: [
    {
      id: 7,
      denominationId: 'synthetic-note',
      currencyCode: 'USD',
      value: '20.000000',
      type: 'BANKNOTE',
      active: true
    },
    { id: 8, denominationId: 'synthetic-coin', currencyCode: 'USD', value: '0.010000', type: 'COIN', active: true }
  ]
};
const localeRoot = resolve(__dirname, '../../../../assets/translations');

describe('VaultCashDepositComponent (mocked HTTP)', () => {
  let fixture: ComponentFixture<VaultCashDepositComponent>;
  let component: VaultCashDepositComponent;
  let http: HttpTestingController;
  let permissions: string[];
  let authenticated: boolean;

  beforeEach(async () => {
    permissions = ['READ_BASE_TELLER_CASH_INVENTORY'];
    authenticated = true;
    await TestBed.configureTestingModule({
      imports: [
        VaultCashDepositComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated: () => authenticated, getCredentials: () => ({ permissions }) }
        }
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', JSON.parse(readFileSync(resolve(localeRoot, 'en-US.json'), 'utf8')));
    translate.use('en-US');
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VaultCashDepositComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
  });

  function start(ctx = context, catalog = currencies) {
    fixture.detectChanges();
    http.expectOne(root + '/context').flush(ctx);
    if (ctx.capabilities.viewContext && ctx.capabilities.viewCurrencies)
      http.expectOne(root + '/currencies').flush(catalog);
    fixture.detectChanges();
  }
  function finish(code = 'USD', response = denominations) {
    http.expectOne(root + '/denominations?currencyCode=' + code).flush(response);
    http
      .expectOne(root + '/inventory?currencyCode=' + code)
      .flush({ vaultKey: 'VAULT:31', currencyCode: code, status: 'UNAVAILABLE', balances: [] });
    fixture.detectChanges();
  }
  const text = () => fixture.nativeElement.textContent as string;

  it('renders translated title and read-only explanation before loading', () => {
    fixture.detectChanges();
    expect(text()).toContain('Cash Deposit into Vault');
    expect(text()).toContain('transaction validation and financial execution');
    expect(component.contextLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    http.expectOne(root + '/context').flush(context);
    http.expectOne(root + '/currencies').flush(currencies);
    finish();
  });

  it.each([
    false,
    true
  ])('blocks unauthorized initialization (authenticated=%s)', (isAuthenticated) => {
    authenticated = isAuthenticated;
    permissions = [];
    fixture.detectChanges();
    expect(text()).toContain(isAuthenticated ? 'Permission Denied' : 'sign in again');
    http.expectNone(() => true);
  });

  it('displays server branch, vault, unknown status and currency choices', () => {
    start();
    finish();
    expect(text()).toContain('Synthetic branch');
    expect(text()).toContain('Synthetic vault');
    expect(text()).toContain('Unknown');
    expect(component.currencies().map((c) => c.code)).toEqual([
      'USD',
      'JPY'
    ]);
    expect(component.currencyControl.enabled).toBe(true);
  });

  it('renders separate banknote and coin tables with correct precision', () => {
    start();
    finish();
    const tables = fixture.nativeElement.querySelectorAll('table');
    expect(tables).toHaveLength(2);
    expect(tables[0].textContent).toContain('20.00');
    expect(tables[1].textContent).toContain('0.01');
    expect(text()).not.toContain('vaultDeposit.');
  });

  it('clears stale denomination and inventory data immediately when switching currency', () => {
    start();
    finish();
    component.currencyControl.setValue('JPY');
    fixture.detectChanges();
    expect(component.banknotes()).toEqual([]);
    expect(component.coins()).toEqual([]);
    expect(component.balances()).toEqual([]);
    expect(component.denominationsLoading()).toBe(true);
    expect(text()).not.toContain('20.00');
    finish('JPY', { vaultKey: 'VAULT:31', currencyCode: 'JPY', denominations: [], status: 'UNAVAILABLE' });
    expect(text()).toContain('No Denominations Available');
  });

  it('cancels requests on rapid currency changes and ignores stale responses', () => {
    start();
    const oldCatalog = http.expectOne(root + '/denominations?currencyCode=USD');
    const oldInventory = http.expectOne(root + '/inventory?currencyCode=USD');
    component.currencyControl.setValue('JPY');
    expect(oldCatalog.cancelled).toBe(true);
    expect(oldInventory.cancelled).toBe(true);
    finish('JPY', { vaultKey: 'VAULT:31', currencyCode: 'JPY', denominations: [], status: 'UNAVAILABLE' });
    expect(component.banknotes()).toEqual([]);
  });

  it('cancels outstanding HTTP requests on destruction', () => {
    start();
    const catalog = http.expectOne(root + '/denominations?currencyCode=USD');
    const inventory = http.expectOne(root + '/inventory?currencyCode=USD');
    fixture.destroy();
    expect(catalog.cancelled).toBe(true);
    expect(inventory.cancelled).toBe(true);
  });

  it('handles an empty currency catalog and sends no denomination or inventory request', () => {
    start(context, { ...currencies, currencies: [], status: 'UNAVAILABLE' });
    expect(text()).toContain('No currencies are configured');
    expect(component.currencyControl.disabled).toBe(true);
    http.expectNone((r) => /denominations|inventory/.test(r.url));
  });

  it('rejects arbitrary currency selection without querying the backend', () => {
    start();
    finish();
    component.currencyControl.setValue('ZZZ');
    fixture.detectChanges();
    expect(text()).toContain('This currency is not supported');
    expect(component.banknotes()).toEqual([]);
    http.expectNone(() => true);
  });

  it.each([
    401,
    403,
    404,
    500,
    0
  ])('renders safe context failures for HTTP %s and can retry', (status) => {
    fixture.detectChanges();
    http.expectOne(root + '/context').flush('sensitive SQL stack or credential', { status, statusText: 'failure' });
    fixture.detectChanges();
    expect(component.contextLoading()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(text()).not.toContain('sensitive');
    component.reload();
    http.expectOne(root + '/context').flush(context);
    http.expectOne(root + '/currencies').flush(currencies);
    finish();
    expect(component.contextError()).toBe('');
  });

  it('handles supported-currency endpoint failure without retaining context or enabling selection', () => {
    fixture.detectChanges();
    http.expectOne(root + '/context').flush(context);
    http.expectOne(root + '/currencies').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(component.context()).toBeNull();
    expect(component.currencyControl.disabled).toBe(true);
    expect(component.contextError()).toBe('vaultDeposit.errors.unavailable');
  });

  it('handles a denomination failure independently of optional inventory', () => {
    start();
    http
      .expectOne(root + '/denominations?currencyCode=USD')
      .flush(
        { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.vault.currency.unsupported' }] },
        { status: 400, statusText: 'Unsupported' }
      );
    http.expectOne(root + '/inventory?currencyCode=USD').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(component.denominationsError()).toBe('vaultDeposit.errors.unsupportedCurrency');
    expect(component.inventoryError()).toBe('vaultDeposit.errors.unavailable');
    expect(component.denominationsLoading()).toBe(false);
    expect(component.inventoryLoading()).toBe(false);
  });

  it('never infers zero inventory from unavailable balances', () => {
    start();
    finish();
    expect(component.balances()).toEqual([]);
    expect(text()).toContain('An unknown balance is not zero');
  });

  it.each([
    '1234.50',
    null
  ])('displays recorded inventory without inventing unknown balances: %s', (balance) => {
    start();
    http.expectOne(root + '/denominations?currencyCode=USD').flush(denominations);
    http.expectOne(root + '/inventory?currencyCode=USD').flush({
      vaultKey: 'VAULT:31',
      currencyCode: 'USD',
      status: 'AVAILABLE',
      balances: [
        {
          custodianKey: 'VAULT:31',
          currencyCode: 'USD',
          inventoryType: 'CASH',
          decimalPlaces: 2,
          balance,
          asOf: '2026-10-27T06:00:00Z'
        },
        {
          custodianKey: 'VAULT:999',
          currencyCode: 'USD',
          inventoryType: 'CASH',
          decimalPlaces: 2,
          balance: '999999',
          asOf: '2026-10-27T06:00:00Z'
        }
      ]
    });
    fixture.detectChanges();
    expect(component.balances()).toHaveLength(1);
    expect(text()).toContain(balance === null ? 'Unavailable' : '1,234.50');
    expect(text()).not.toContain('999999');
    expect(text()).toContain('Last Updated');
  });

  it('does not mislabel a generic validation error as an unsupported currency', () => {
    fixture.detectChanges();
    http
      .expectOne(root + '/context')
      .flush(
        { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.vault.office.invalid' }] },
        { status: 400, statusText: 'Invalid' }
      );
    expect(component.contextError()).toBe('vaultDeposit.errors.configuration');
  });

  it('respects server capabilities and never enables later-phase actions', () => {
    start({
      ...context,
      capabilities: {
        ...context.capabilities,
        viewDenominations: false,
        viewInventory: false,
        previewDeposit: true,
        executeDeposit: true
      },
      readiness: { depositReady: true, limitations: [] }
    });
    expect(text()).toContain('Permission Denied');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    expect(text()).not.toContain('Confirm Deposit');
    expect(text()).not.toContain('Preview Transaction');
    expect(text()).not.toContain('Print Receipt');
    http.expectNone((r) => r.method !== 'GET' || /denominations|inventory/.test(r.url));
  });

  it('honors a denied context capability without fetching more resources', () => {
    start({ ...context, capabilities: { ...context.capabilities, viewContext: false } });
    expect(component.context()).toBeNull();
    expect(text()).toContain('Permission Denied');
    http.expectNone(() => true);
  });

  it('rejects a currency response for another vault', () => {
    start(context, { ...currencies, vaultKey: 'VAULT:999' });
    expect(component.contextError()).toBe('vaultDeposit.errors.configuration');
    expect(component.currencies()).toEqual([]);
    http.expectNone(() => true);
  });

  it('rejects mismatched vault catalogs and balances', () => {
    start();
    http.expectOne(root + '/denominations?currencyCode=USD').flush({ ...denominations, vaultKey: 'VAULT:999' });
    http
      .expectOne(root + '/inventory?currencyCode=USD')
      .flush({ vaultKey: 'VAULT:999', currencyCode: 'USD', status: 'AVAILABLE', balances: [] });
    expect(component.banknotes()).toEqual([]);
    expect(component.balances()).toEqual([]);
    expect(component.denominationsError()).toBe('vaultDeposit.errors.configuration');
    expect(component.inventoryError()).toBe('vaultDeposit.errors.configuration');
  });

  it('reloads the context and cancels pending currency reads', () => {
    start();
    const catalog = http.expectOne(root + '/denominations?currencyCode=USD');
    const inventory = http.expectOne(root + '/inventory?currencyCode=USD');
    component.reload();
    expect(catalog.cancelled).toBe(true);
    expect(inventory.cancelled).toBe(true);
    http.expectOne(root + '/context').flush(context);
    http.expectOne(root + '/currencies').flush(currencies);
    finish();
  });

  it.each(readdirSync(localeRoot).filter((f) => f.endsWith('.json')))(
    'has complete translations and renders translated labels in %s',
    (locale) => {
      const data = JSON.parse(readFileSync(resolve(localeRoot, locale), 'utf8'));
      const translation = TestBed.inject(TranslateService);
      translation.setTranslation(locale, data);
      translation.use(locale);
      start();
      finish();
      expect(text()).toContain(data.vaultDeposit.title);
      expect(text()).toContain(data.vaultDeposit.processingExplanation);
      expect(text()).toContain(data.vaultDeposit.banknotes);
      expect(text()).toContain(data.vaultDeposit.coins);
      expect(text()).not.toContain('vaultDeposit.');
      expect(Object.keys(data.vaultDeposit)).toEqual(
        Object.keys(JSON.parse(readFileSync(resolve(localeRoot, 'en-US.json'), 'utf8')).vaultDeposit)
      );
      expect(Object.keys(data.vaultDeposit.errors)).toHaveLength(6);
    }
  );
});
