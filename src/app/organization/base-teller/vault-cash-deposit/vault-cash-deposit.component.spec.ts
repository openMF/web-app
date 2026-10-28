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
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { VaultCashDepositComponent } from './vault-cash-deposit.component';
import { VaultContext, VaultCurrencies, VaultDenominations, VaultDepositPreview } from './vault-cash-deposit.models';

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
    expect(text()).toContain('financial execution is not enabled');
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

  const previewPath = '/v2/base-teller/vault-cash-deposits/preview';
  function entry() {
    start({ ...context, capabilities: { ...context.capabilities, previewDeposit: true } });
    finish();
    component.quantities.at(0).setValue('2');
    component.quantities.at(1).setValue('3');
    fixture.detectChanges();
  }
  function serverPreview(): VaultDepositPreview {
    const unsupported: { supported: boolean; amount: null } = { supported: false, amount: null };
    return {
      operationType: 'VAULT_CASH_DEPOSIT',
      validationStatus: 'VALID_PREVIEW',
      movementStatus: 'PROPOSED',
      branch: context.branch,
      vault: context.vault,
      businessDate: context.businessDate,
      correlationReference: null,
      currencies: [
        {
          currencyCode: 'USD',
          decimalPlaces: 2,
          banknotes: [{ denominationId: 'synthetic-note', value: '20.00', quantity: 2, subtotal: '40.00' }],
          coins: [{ denominationId: 'synthetic-coin', value: '0.01', quantity: 3, subtotal: '0.03' }],
          banknotesTotal: '40.00',
          coinsTotal: '0.03',
          totalCash: '40.03',
          generalTransaction: {
            perspective: 'VAULT',
            inflows: { cash: '40.03', checks: unsupported, vouchers: unsupported },
            outflows: { cash: '0.00', checks: unsupported, vouchers: unsupported }
          }
        }
      ],
      executionReadiness: {
        executionAllowed: false,
        status: 'BLOCKED_BY_POLICY',
        sourcePolicy: 'UNAVAILABLE',
        accountingPolicy: 'UNAVAILABLE',
        blockers: [
          'SOURCE_POLICY_UNAVAILABLE',
          'ACCOUNTING_POLICY_UNAVAILABLE',
          'VAULT_STATUS_UNKNOWN',
          'EXECUTION_NOT_IMPLEMENTED'
        ].map((code) => ({ code, message: 'server diagnostic must not be rendered' }))
      }
    };
  }
  const overlayText = () => {
    for (const dialog of TestBed.inject(MatDialog).openDialogs) dialog.componentRef?.changeDetectorRef.detectChanges();
    return TestBed.inject(OverlayContainer).getContainerElement().textContent ?? '';
  };
  const previewButton = () =>
    fixture.nativeElement.querySelector('button[aria-describedby="vault-processing-explanation"]') as HTMLButtonElement;

  it('calculates exact banknote and coin estimates from accessible quantity inputs', () => {
    entry();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    inputs[0].value = '4';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '7';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.estimate()).toMatchObject({ subtotals: [
        '80.00',
        '0.07'
      ], banknotesTotal: '80.00', coinsTotal: '0.07', totalCash: '80.07' });
    expect(inputs[0].getAttribute('aria-label')).toContain('Banknotes');
    expect(inputs[1].getAttribute('aria-label')).toContain('Coins');
    expect(previewButton().disabled).toBe(false);
  });

  it.each([
    '-1',
    '1.5',
    '',
    '1000000001',
    'NaN',
    'Infinity',
    '1e3',
    '2x',
    ' 2'
  ])('rejects invalid typed or pasted quantity %s', (value) => {
    entry();
    const input = fixture.nativeElement.querySelector('input');
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.quantities.at(0).invalid).toBe(true);
    expect(component.estimate()).toBeNull();
    expect(previewButton().disabled).toBe(true);
    expect(text()).toContain('Enter a whole number');
    component.previewTransaction();
    http.expectNone(previewPath);
  });

  it('requires a positive quantity and respects the backend preview capability', () => {
    start();
    finish();
    expect(component.canPreview).toBe(false);
    component.quantities.at(0).setValue('1');
    component.previewTransaction();
    http.expectNone(previewPath);
    expect(component.canPreview).toBe(false);
  });

  it('disables preview when all quantities are zero', () => {
    entry();
    component.quantities.setValue([
      '0',
      '0'
    ]);
    fixture.detectChanges();
    expect(previewButton().disabled).toBe(true);
    expect(text()).toContain('at least one positive');
  });

  it('submits only the current business date and catalog identifiers with integer quantities', () => {
    entry();
    component.previewTransaction();
    const request = http.expectOne(previewPath);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      businessDate: context.businessDate,
      currencies: [
        {
          currencyCode: 'USD',
          denominations: [
            { denominationId: 'synthetic-note', quantity: 2 },
            { denominationId: 'synthetic-coin', quantity: 3 }
          ]
        }
      ]
    });
    expect(request.request.responseType).toBe('text');
    request.flush(serverPreview());
    fixture.detectChanges();
    expect(overlayText()).toContain('General Transaction');
    expect(overlayText()).toContain('40.03');
    expect(overlayText()).toContain('Proposed Vault Inflow');
    expect(overlayText()).toContain('Proposed Vault Outflow');
    expect(overlayText()).toContain('Source outflow is unavailable');
    expect(overlayText()).toContain('blocked by policy');
    expect(overlayText()).toContain('Missing approved deposit accounting');
    expect(overlayText()).toContain('Unavailable');
    expect(overlayText()).not.toContain('server diagnostic');
    expect(overlayText()).not.toContain('vaultDeposit.');
    const dialog = TestBed.inject(MatDialog).openDialogs[0];
    expect(dialog._containerInstance._config.ariaLabelledBy).toBe('vault-preview-title');
    expect(dialog._containerInstance._config.restoreFocus).toBe(true);
    expect(TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('button')).toHaveLength(2);
    expect(overlayText()).not.toMatch(/Confirm Deposit|Receipt|Successfully Completed/);
    dialog.close();
    expect(component.quantities.getRawValue()).toEqual([
      '2',
      '3'
    ]);
    http.expectNone(() => true);
  });

  it('prevents duplicate preview requests while loading', () => {
    entry();
    component.previewTransaction();
    component.previewTransaction();
    fixture.detectChanges();
    expect(component.previewLoading()).toBe(true);
    expect(previewButton().disabled).toBe(true);
    expect(text()).toContain('Loading Preview');
    const requests = http.match(previewPath);
    expect(requests).toHaveLength(1);
    requests[0].flush(serverPreview());
    expect(component.previewLoading()).toBe(false);
  });

  it.each([
    'quantity',
    'currency',
    'context'
  ])('cancels stale previews on %s change', (change) => {
    entry();
    component.previewTransaction();
    const stale = http.expectOne(previewPath);
    if (change === 'quantity') component.quantities.at(0).setValue('7');
    if (change === 'currency') {
      component.currencyControl.setValue('JPY');
      finish('JPY', { ...denominations, currencyCode: 'JPY', denominations: [] });
    }
    if (change === 'context') {
      component.reload();
      http.expectOne(root + '/context').flush(context);
      http.expectOne(root + '/currencies').flush(currencies);
      finish();
    }
    expect(stale.cancelled).toBe(true);
    expect(component.previewLoading()).toBe(false);
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });

  it('closes an existing dialog when the form changes and keeps the next response current', () => {
    entry();
    component.previewTransaction();
    http.expectOne(previewPath).flush(serverPreview());
    const dialog = TestBed.inject(MatDialog).openDialogs[0];
    const close = jest.spyOn(dialog, 'close');
    component.quantities.at(0).setValue('9');
    expect(close).toHaveBeenCalled();
    component.previewTransaction();
    const stale = http.expectOne(previewPath);
    component.quantities.at(0).setValue('2');
    expect(stale.cancelled).toBe(true);
    component.previewTransaction();
    http.expectOne(previewPath).flush(serverPreview());
    expect(TestBed.inject(MatDialog).openDialogs.at(-1)?.componentInstance.data.mismatch).toBe(false);
  });

  it('resets quantities and validation on currency switching', () => {
    entry();
    component.quantities.at(0).setValue('-1');
    component.currencyControl.setValue('JPY');
    expect(component.quantities.length).toBe(0);
    expect(component.estimate()).toBeNull();
    finish('JPY', { ...denominations, currencyCode: 'JPY', denominations: [] });
    component.currencyControl.setValue('USD');
    finish();
    expect(component.quantities.getRawValue()).toEqual([
      '0',
      '0'
    ]);
    expect(component.quantities.valid).toBe(true);
  });

  it.each([
    'total',
    'quantity',
    'line',
    'duplicate'
  ])('flags backend %s disagreement without replacing server amounts', (change) => {
    entry();
    component.previewTransaction();
    const preview = serverPreview();
    if (change === 'total') preview.currencies[0].totalCash = '900.01';
    if (change === 'quantity') preview.currencies[0].banknotes[0].quantity = 3;
    if (change === 'line') preview.currencies[0].banknotes[0].value = '10.00';
    if (change === 'duplicate') preview.currencies[0].banknotes.push(preview.currencies[0].banknotes[0]);
    http.expectOne(previewPath).flush(preview);
    fixture.detectChanges();
    expect(overlayText()).toContain('differs from the client estimate');
    if (change === 'total') expect(overlayText()).toContain('900.01');
    expect(overlayText()).not.toContain('Confirm Deposit');
  });

  it('keeps execution unavailable even if a future server reports readiness', () => {
    entry();
    component.previewTransaction();
    const preview = serverPreview();
    preview.executionReadiness.executionAllowed = true;
    preview.executionReadiness.blockers = [];
    http.expectOne(previewPath).flush(preview);
    fixture.detectChanges();
    expect(overlayText()).toContain('financial execution is not enabled');
    expect(overlayText()).not.toContain('Confirm Deposit');
    http.expectNone(() => true);
  });

  it('rejects a preview belonging to another vault', () => {
    entry();
    component.previewTransaction();
    const preview = serverPreview();
    preview.vault = { ...preview.vault, key: 'VAULT:999' };
    http.expectOne(previewPath).flush(preview);
    expect(component.previewError()).toBe('vaultDeposit.errors.configuration');
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });

  it.each([
    0,
    400,
    401,
    403,
    404,
    409,
    422,
    500
  ])('renders safe preview failures and supports retry (HTTP %s)', (status) => {
    entry();
    component.previewTransaction();
    http.expectOne(previewPath).flush('private SQL stack token', { status, statusText: 'Failure' });
    fixture.detectChanges();
    expect(component.previewError()).toBeTruthy();
    expect(component.previewLoading()).toBe(false);
    expect(text()).not.toContain('private SQL');
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    const errorAction = fixture.nativeElement.querySelector('p.message.error + button') as HTMLButtonElement;
    expect(errorAction.textContent?.trim()).toBe(status === 409 ? 'Refresh' : 'Retry');
    component.previewTransaction();
    http.expectOne(previewPath).flush(serverPreview());
    expect(component.previewError()).toBe('');
  });

  it.each([
    [
      0,
      'vaultDeposit.errors.unavailable'
    ],
    [
      500,
      'vaultDeposit.errors.unavailable'
    ],
    [
      503,
      'vaultDeposit.errors.unavailable'
    ],
    [
      200,
      'vaultDeposit.preview.failed'
    ]
  ])('retries a transient preview failure without clearing the form (HTTP %s)', (status, key) => {
    entry();
    const quantities = component.quantities.getRawValue();
    const currency = component.currencyControl.value;
    const estimate = component.estimate();
    component.previewTransaction();
    const original = http.expectOne(previewPath);
    original.flush('invalid preview response', { status: Number(status), statusText: 'Failure' });
    fixture.detectChanges();
    expect(component.previewError()).toBe(key);
    const retry = fixture.nativeElement.querySelector('p.message.error + button') as HTMLButtonElement;
    expect(retry.textContent?.trim()).toBe('Retry');
    expect(retry.disabled).toBe(false);
    retry.click();
    retry.click();
    fixture.detectChanges();
    expect(component.previewLoading()).toBe(true);
    expect(component.previewError()).toBe('');
    expect(component.quantities.getRawValue()).toEqual(quantities);
    expect(component.currencyControl.value).toBe(currency);
    expect(component.estimate()).toBe(estimate);
    http.expectNone((request) => request.method === 'GET');
    const retries = http.match(previewPath);
    expect(retries).toHaveLength(1);
    expect(retries[0].request.body).toEqual(original.request.body);
    retries[0].flush(serverPreview());
    expect(overlayText()).toContain('40.03');
  });

  it.each([
    [
      409,
      '',
      'vaultDeposit.preview.conflict'
    ],
    [
      400,
      'business.date.invalid',
      'vaultDeposit.preview.businessDateChanged'
    ],
    [
      400,
      'denomination.unsupported',
      'vaultDeposit.preview.catalogChanged'
    ]
  ])('refreshes context only for a context-changing preview error %s / %s', (status, code, key) => {
    entry();
    component.previewTransaction();
    http
      .expectOne(previewPath)
      .flush(
        { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.vault.preview.' + code }] },
        { status: Number(status), statusText: 'Stale context' }
      );
    fixture.detectChanges();
    expect(component.previewError()).toBe(key);
    const refresh = fixture.nativeElement.querySelector('p.message.error + button') as HTMLButtonElement;
    expect(refresh.textContent?.trim()).toBe('Refresh');
    refresh.click();
    expect(component.quantities.length).toBe(0);
    expect(component.estimate()).toBeNull();
    expect(component.previewError()).toBe('');
    http.expectNone(previewPath);
    http.expectOne(root + '/context').flush({ ...context, businessDate: '2026-10-28' });
    http.expectOne(root + '/currencies').flush(currencies);
    finish();
    expect(component.context()?.businessDate).toBe('2026-10-28');
    expect(component.quantities.getRawValue()).toEqual([
      '0',
      '0'
    ]);
  });

  it('disables the retry action when backend field validation fails', () => {
    entry();
    component.previewTransaction();
    http
      .expectOne(previewPath)
      .flush(
        { errors: [{ parameterName: 'currencies[0].denominations[0].quantity' }] },
        { status: 400, statusText: 'Invalid quantity' }
      );
    fixture.detectChanges();
    const retry = fixture.nativeElement.querySelector('p.message.error + button') as HTMLButtonElement;
    expect(retry.textContent?.trim()).toBe('Retry');
    expect(retry.disabled).toBe(true);
    retry.click();
    http.expectNone(previewPath);
    expect(component.quantities.getRawValue()).toEqual([
      '2',
      '3'
    ]);
  });

  it('maps textual structured field errors and clears them on an edit', () => {
    entry();
    component.previewTransaction();
    http.expectOne(previewPath).flush(
      JSON.stringify({
        errors: [
          {
            parameterName: 'currencies[0].denominations[1].quantity',
            userMessageGlobalisationCode: 'error.msg.base.teller.vault.preview.field.invalid'
          }
        ]
      }),
      { status: 400, statusText: 'Invalid' }
    );
    fixture.detectChanges();
    expect(component.quantities.at(1).hasError('backend')).toBe(true);
    expect(component.canPreview).toBe(false);
    component.quantities.at(0).setValue('3');
    expect(component.quantities.at(1).valid).toBe(true);
    expect(component.previewError()).toBe('');
  });

  it.each([
    [
      'currency.unsupported',
      'vaultDeposit.errors.unsupportedCurrency'
    ],
    [
      'business.date.invalid',
      'vaultDeposit.preview.businessDateChanged'
    ],
    [
      'denomination.unsupported',
      'vaultDeposit.preview.catalogChanged'
    ],
    [
      'amount.out.of.range',
      'vaultDeposit.preview.amountRange'
    ]
  ])('maps backend validation code %s', (code, key) => {
    entry();
    component.previewTransaction();
    http
      .expectOne(previewPath)
      .flush(
        { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.vault.preview.' + code }] },
        { status: 400, statusText: 'Invalid' }
      );
    expect(component.previewError()).toBe(key);
  });

  it('rejects a duplicate catalog without generating duplicate payload entries', () => {
    start();
    finish('USD', { ...denominations, denominations: [
        ...denominations.denominations,
        denominations.denominations[0]
      ] });
    expect(component.catalogValid()).toBe(false);
    expect(component.canPreview).toBe(false);
    expect(component.denominationsError()).toBe('vaultDeposit.errors.configuration');
  });

  it.each(readdirSync(localeRoot).filter((file) => file.endsWith('.json')))(
    'covers all preview labels in %s',
    (locale) => {
      const data = JSON.parse(readFileSync(resolve(localeRoot, locale), 'utf8'));
      const english = JSON.parse(readFileSync(resolve(localeRoot, 'en-US.json'), 'utf8'));
      expect(Object.keys(data.vaultDeposit.preview)).toEqual(Object.keys(english.vaultDeposit.preview));
      for (const label of Object.values(data.vaultDeposit.preview))
        expect(typeof label === 'string' && label.length > 0).toBe(true);
      const translate = TestBed.inject(TranslateService);
      translate.setTranslation(locale, data);
      translate.use(locale);
      entry();
      component.previewTransaction();
      http.expectOne(previewPath).flush(serverPreview());
      fixture.detectChanges();
      expect(overlayText()).toContain(data.vaultDeposit.preview.generalTransaction);
      expect(overlayText()).not.toContain('vaultDeposit.');
    }
  );

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
