import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { FormBuilder } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter, ROUTES, Route } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ForeignCurrencyService } from './foreign-currency.service';
import { FxRatesComponent } from './fx-rates.component';
import { FxTellerComponent } from './fx-teller.component';
import { fxRateGuard, fxTellerGuard, hasFxPermission } from './foreign-currency.guard';
import { fxError } from './foreign-currency-error';
import {
  fxJson,
  validFxDecimal,
  FxCapabilities,
  FxDraft,
  FxRateContext,
  FxTellerContext,
  FxTradeRequest,
  FxTradePreview
} from './foreign-currency.models';
import { BaseTellerComponent } from '../base-teller/base-teller.component';
import { OrganizationRoutingModule } from '../organization-routing.module';
import { WithdrawalMoneyPipe } from '../base-teller/withdrawals/withdrawal-money.pipe';

const caps: FxCapabilities = {
  publicationEnabled: false,
  executionEnabled: false,
  checksSupported: false,
  vouchersSupported: false,
  blockers: ['NATIONAL_CURRENCY_NOT_VERIFIED']
};
const draft: FxDraft = {
  id: 11,
  officeId: 1,
  officeName: 'Synthetic branch',
  effectiveDate: '2026-10-22',
  baseCurrency: 'USD',
  quoteCurrency: 'EUR',
  dailyBaseRate: '2.340000000001',
  buyPoints: '-1',
  sellPoints: '2',
  version: 2,
  status: 'DRAFT',
  createdBy: 1,
  createdAt: '2026-10-22T00:00:00Z'
};
const currencies = [
  { code: 'USD', name: 'Dollar', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', decimalPlaces: 2 }
];
const admin: FxRateContext = {
  operatorId: 1,
  businessDate: draft.effectiveDate,
  branches: [{ id: 1, name: draft.officeName }],
  currencies,
  nationalCurrency: null,
  rateConvention: 'UNCONFIRMED',
  pointsConvention: 'UNINTERPRETED_DRAFT_VALUES',
  capabilities: caps
};
const cashier = {
  cashierId: 1,
  staffId: 1,
  cashierName: 'Synthetic Staff',
  closed: false,
  tellerId: 1,
  tellerName: 'Synthetic Window',
  officeId: 1,
  officeName: draft.officeName
};
const teller: FxTellerContext = {
  operatorId: 2,
  businessDate: draft.effectiveDate,
  cashier,
  currencies,
  nationalCurrency: null,
  rateDrafts: [draft],
  permissions: [
    'READ_BASE_TELLER_FX',
    'CREATE_BASE_TELLER_FX_PURCHASE',
    'CREATE_BASE_TELLER_FX_SALE'
  ],
  capabilities: caps
};
const customer = { id: 1, number: '0001', displayName: 'Synthetic Customer', officeId: 1, active: true };
const denominations = [{ id: 'usd-10', currencyCode: 'USD', type: 'BANKNOTE', value: '10.00', availableQuantity: 5 }];
const request: FxTradeRequest = {
  clientId: 1,
  identifierId: 1,
  reference: 'Synthetic preview',
  quoteCurrency: 'EUR',
  usdAmount: '10.00',
  rateDraftId: 11,
  rateVersion: 2,
  usdDenominations: [{ denominationId: 'usd-10', quantity: 1 }],
  quoteDenominations: [{ denominationId: 'eur-10', quantity: 1 }]
};
const trade: FxTradePreview = {
  operation: 'PURCHASE',
  status: 'INCOMPLETE_PREVIEW',
  executable: false,
  valuationValidated: false,
  customer,
  identifierId: 1,
  reference: request.reference,
  cashier,
  businessDate: draft.effectiveDate,
  quotedAt: '2026-10-22T00:00:00Z',
  usdAmount: '10.00',
  quoteCurrency: 'EUR',
  nationalCurrency: null,
  appliedRate: null,
  calculatedNationalAmount: null,
  candidateRateDraft: draft,
  usdCash: { currencyCode: 'USD', direction: 'INFLOW', denominationTotal: '10.00', denominations: [] },
  quoteCash: { currencyCode: 'EUR', direction: 'OUTFLOW', denominationTotal: '10.00', denominations: [] },
  capabilities: caps
};
const rateRequest = {
  effectiveDate: draft.effectiveDate,
  baseCurrency: 'USD' as const,
  quoteCurrency: 'EUR',
  dailyBaseRate: '2.340000000001',
  branches: [{ officeId: 1, expectedVersion: 2, buyPoints: '-1', sellPoints: '2' }]
};

describe('FX exact request contracts', () => {
  let api: ForeignCurrencyService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    api = TestBed.inject(ForeignCurrencyService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    jest.useRealTimers();
    http.verify();
  });
  it('preserves exact rate tokens and rejects malformed decimals', () => {
    expect(fxJson({ ...rateRequest, dailyBaseRate: '12345678901234567890.123456789012' })).toContain(
      '"dailyBaseRate":12345678901234567890.123456789012'
    );
    for (const v of [
      '1e4',
      'NaN',
      '1.2345678901234',
      '1,20',
      '-1',
      '0'
    ]) expect(validFxDecimal(v, true)).toBe(false);
    expect(() => fxJson({ ...request, usdAmount: '1e4' })).toThrow();
  });
  it('retrieves real rate context and history parameters', () => {
    api.getAdminContext().subscribe((v) => expect(v.rateConvention).toBe('UNCONFIRMED'));
    http.expectOne('/v2/foreign-currency/rates/context').flush(JSON.stringify(admin));
    api.getRateDrafts(1, draft.effectiveDate, 100).subscribe();
    const r = http.expectOne((r) => r.url === '/v2/foreign-currency/rates');
    expect(r.request.params.get('offset')).toBe('100');
    expect(r.request.params.get('officeId')).toBe('1');
    r.flush('[]');
  });
  it('round trips immutable draft, audit and preview-token confirmation', () => {
    api.getRateDraft(11).subscribe((v) => expect(v.dailyBaseRate).toBe('2.340000000001'));
    http
      .expectOne('/v2/foreign-currency/rates/11')
      .flush(JSON.stringify(draft).replace('"2.340000000001"', '2.340000000001'));
    api.getRateAudit(11).subscribe();
    http.expectOne('/v2/foreign-currency/rates/11/audit').flush('[]');
    api.previewRateDraft(rateRequest).subscribe();
    const p = http.expectOne('/v2/foreign-currency/rates/preview');
    expect(p.request.method).toBe('POST');
    expect(JSON.parse(p.request.body).branches[0].expectedVersion).toBe(2);
    p.flush('{}');
    api.createRateDraft({ ...rateRequest, previewToken: 'server-token' }).subscribe();
    const s = http.expectOne('/v2/foreign-currency/rates');
    expect(JSON.parse(s.request.body).previewToken).toBe('server-token');
    s.flush('[]');
  });
  it('loads teller context, scoped customer search and denomination catalog', () => {
    api.getTellerContext().subscribe();
    http.expectOne('/v2/base-teller/foreign-currency/context').flush('{}');
    api.searchCustomers('clientNumber', '0001').subscribe();
    const c = http.expectOne((r) => r.url.endsWith('/customers'));
    expect(c.request.params.get('clientNumber')).toBe('0001');
    expect(c.request.params.has('officeId')).toBe(false);
    c.flush('{}');
    api.getDenominations('USD').subscribe();
    const d = http.expectOne((r) => r.url.endsWith('/denominations'));
    expect(d.request.params.get('currencyCode')).toBe('USD');
    d.flush('[]');
  });
  it.each([
    'PURCHASE',
    'SALE'
  ] as const)('only posts read-only %s previews', (op) => {
    api.preview(op, request).subscribe((v) => expect(v.executable).toBe(false));
    const r = http.expectOne(
      '/v2/base-teller/foreign-currency/' + (op === 'PURCHASE' ? 'purchases' : 'sales') + '/preview'
    );
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toContain('"usdAmount":10.00');
    r.flush(JSON.stringify(trade));
  });
  it('times out without retrying a write', () => {
    jest.useFakeTimers();
    let error = '';
    api.createRateDraft(rateRequest).subscribe({ error: (e) => (error = e.name) });
    http.expectOne('/v2/foreign-currency/rates');
    jest.advanceTimersByTime(30001);
    expect(error).toBe('TimeoutError');
  });
});

describe('FX authorization and safe errors', () => {
  let permissions: string[] = [];
  beforeEach(() => {
    permissions = [];
    TestBed.configureTestingModule({ providers: [
        provideRouter([]),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ] });
  });
  it('protects admin and teller direct routes independently', () => {
    permissions = ['READ_BASE_TELLER_FX'];
    expect(TestBed.runInInjectionContext(() => fxTellerGuard(null, null))).toBe(true);
    expect(TestBed.runInInjectionContext(() => fxRateGuard(null, null))).not.toBe(true);
    permissions = ['READ_BASE_TELLER_FX_RATE'];
    expect(TestBed.runInInjectionContext(() => fxRateGuard(null, null))).toBe(true);
    expect(TestBed.runInInjectionContext(() => fxTellerGuard(null, null))).not.toBe(true);
    expect(hasFxPermission(['ALL_FUNCTIONS_READ'], 'READ_BASE_TELLER_FX_RATE')).toBe(false);
  });
  it('adds FX only to authorized Other Operations navigation', () => {
    const component = TestBed.runInInjectionContext(() => new BaseTellerComponent());
    expect(component.otherOperations.some((w) => w.label === 'fx.title')).toBe(false);
    permissions = ['READ_BASE_TELLER_FX'];
    expect(component.otherOperations.some((w) => w.label === 'fx.title')).toBe(true);
    expect(component.workflows.some((w) => w.label === 'fx.title')).toBe(false);
  });
  it.each([
    [
      401,
      'fx.unauthenticated'
    ],
    [
      403,
      'fx.forbidden'
    ],
    [
      404,
      'fx.notFound'
    ],
    [
      409,
      'fx.stale'
    ],
    [
      422,
      'fx.invalidRequest'
    ],
    [
      500,
      'fx.unavailable'
    ],
    [
      0,
      'fx.unavailable'
    ]
  ])('localizes HTTP %s without exposing internals', (status, key) => {
    expect(fxError({ status: status as number, error: { developerMessage: 'SQL secret stack trace' } })).toBe(key);
  });
  it.each([
    [
      'cashier.assignment',
      'fx.drawerRequired'
    ],
    [
      'rate.stale',
      'fx.stale'
    ],
    [
      'quantity.invalid',
      'fx.invalidCash'
    ],
    [
      'operation.unsupported',
      'fx.executionUnavailable'
    ],
    [
      'identification.invalid',
      'fx.identificationInvalid'
    ]
  ])('localizes actual domain code %s', (code, key) => {
    expect(
      fxError({
        status: 403,
        error: JSON.stringify({ errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.fx.' + code }] })
      })
    ).toBe(key);
  });
  it('registers FX routes with guards under shell authentication', () => {
    TestBed.configureTestingModule({ imports: [OrganizationRoutingModule] });
    function flatten(routes: Route[]): Route[] {
      return routes.flatMap((r) => [
        r,
        ...flatten(r.children ?? [])
      ]);
    }
    const routes = flatten(TestBed.inject(ROUTES).flat());
    expect(routes.find((r) => r.path === 'foreign-currency/rates')?.canActivate).toContain(fxRateGuard);
    expect(routes.find((r) => r.path === 'foreign-currency/rates')?.data?.breadcrumb).toBe('fx.title');
    expect(routes.find((r) => r.path === 'base-teller/foreign-currency')?.canActivate).toContain(fxTellerGuard);
  });
});

describe('FX guarded components', () => {
  let api: Record<string, jest.Mock>, permissions: string[];
  beforeEach(() => {
    jest.spyOn(FxRatesComponent.prototype, 'ngOnInit').mockImplementation(() => {});
    jest.spyOn(FxTellerComponent.prototype, 'ngOnInit').mockImplementation(() => {});
    permissions = ['ALL_FUNCTIONS'];
    api = {
      getAdminContext: jest.fn(() => of(admin)),
      getRateDrafts: jest.fn(() => of([draft])),
      getRateDraft: jest.fn(() => of(draft)),
      getRateAudit: jest.fn(() =>
        of([
          {
            id: 1,
            draftId: 11,
            previousDraftId: null,
            operatorId: 1,
            action: 'DRAFT_CONFIRMED',
            recordedAt: draft.createdAt,
            previous: null,
            proposed: draft
          }
        ])
      ),
      previewRateDraft: jest.fn(() =>
        of({
          ...rateRequest,
          operatorId: 1,
          previewToken: 'server-token',
          status: 'DRAFT_PREVIEW',
          capabilities: caps,
          changes: [{ branch: admin.branches[0], previous: draft, proposed: rateRequest.branches[0] }]
        })
      ),
      createRateDraft: jest.fn(() => of([draft])),
      getTellerContext: jest.fn(() => of(teller)),
      getDenominations: jest.fn((code: string) =>
        of(denominations.map((d) => ({ ...d, id: code.toLowerCase() + '-10', currencyCode: code })))
      ),
      searchCustomers: jest.fn(() => of({ pageItems: [customer], totalFilteredRecords: 1 })),
      preview: jest.fn(() => of(trade))
    };
    TestBed.configureTestingModule({ imports: [
        TranslateModule.forRoot(),
        FxRatesComponent,
        FxTellerComponent
      ], providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: ForeignCurrencyService, useValue: api }
      ] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', {
      fx: {
        title: 'Foreign Currency',
        executionUnavailable: 'Execution unavailable',
        incompletePreview: 'Incomplete preview'
      }
    });
    translate.use('en-US');
  });
  it('presents persisted admin draft and audit on initial load without writing', async () => {
    const c = TestBed.createComponent(FxRatesComponent).componentInstance;
    await c.reload();
    expect(c.form.getRawValue()).toMatchObject({
      quoteCurrency: 'EUR',
      dailyBaseRate: String(draft.dailyBaseRate),
      buyPoints: '-1',
      sellPoints: '2'
    });
    expect(c.selected?.id).toBe(draft.id);
    expect(c.audit).toHaveLength(1);
    expect(api.previewRateDraft).not.toHaveBeenCalled();
    expect(api.createRateDraft).not.toHaveBeenCalled();
  });
  it('populates only a unique backend candidate and renders the native cashier name', async () => {
    const f = TestBed.createComponent(FxTellerComponent),
      c = f.componentInstance;
    await c.reload();
    expect(c.candidate?.id).toBe(draft.id);
    expect(c.form.controls.quoteCurrency.value).toBe('EUR');
    expect(c.quote[0].currencyCode).toBe('EUR');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Synthetic Staff');
    expect(api.preview).not.toHaveBeenCalled();
  });
  it('confirms exact reviewed drafts, retrieves persisted version and audit', async () => {
    const f = TestBed.createComponent(FxRatesComponent),
      c = f.componentInstance;
    await c.reload();
    c.form.patchValue({ quoteCurrency: 'EUR', dailyBaseRate: '2.34' });
    await c.previewDraft();
    expect(c.preview?.previewToken).toBe('server-token');
    await c.confirmDraft();
    expect(api.createRateDraft.mock.calls[0][0].previewToken).toBe('server-token');
    expect(c.selected?.version).toBe(2);
    expect(c.audit).toHaveLength(1);
    jest.spyOn(c, 'ngOnInit').mockImplementation(() => {});
    f.detectChanges();
    expect(f.nativeElement.querySelector('[disabled]')).toBeTruthy();
  });
  it.each([
    'getRateDrafts',
    'getRateDraft',
    'getRateAudit'
  ])('retains successful draft confirmation if %s refresh fails', async (method) => {
    const f = TestBed.createComponent(FxRatesComponent),
      c = f.componentInstance;
    await c.reload();
    await c.previewDraft();
    api[method].mockReturnValue(throwError(() => ({ status: 500, error: 'SQL secret' })));
    await c.confirmDraft();
    expect(c.saved).toBe(true);
    expect(c.error).toBe('fx.draftRefreshFailed');
    expect(c.preview).toBeUndefined();
    jest.spyOn(c, 'ngOnInit').mockImplementation(() => {});
    f.detectChanges();
    expect(f.nativeElement.querySelector('.fx-success')).toBeTruthy();
    expect(f.nativeElement.querySelector('[role="alert"]').textContent).toContain('fx.draftRefreshFailed');
    expect(f.nativeElement.textContent).not.toContain('SQL secret');
    await c.confirmDraft();
    expect(api.createRateDraft).toHaveBeenCalledTimes(1);
  });
  it('retains saved state when a successful write returns no draft details', async () => {
    const c = TestBed.createComponent(FxRatesComponent).componentInstance;
    await c.reload();
    await c.previewDraft();
    api.createRateDraft.mockReturnValue(of([]));
    api.getRateDraft.mockClear();
    api.getRateAudit.mockClear();
    await c.confirmDraft();
    expect(c.saved).toBe(true);
    expect(c.error).toBe('fx.draftRefreshFailed');
    expect(api.getRateDraft).not.toHaveBeenCalled();
    expect(api.getRateAudit).not.toHaveBeenCalled();
    await c.confirmDraft();
    expect(api.createRateDraft).toHaveBeenCalledTimes(1);
  });
  it('keeps failed writes distinct from saved drafts', async () => {
    const c = TestBed.createComponent(FxRatesComponent).componentInstance;
    await c.reload();
    await c.previewDraft();
    api.createRateDraft.mockReturnValue(throwError(() => ({ status: 500 })));
    await c.confirmDraft();
    expect(c.saved).toBe(false);
    expect(c.error).toBe('fx.unavailable');
  });
  it('invalidates preview on edits and refuses unauthorized draft writes', async () => {
    const c = TestBed.createComponent(FxRatesComponent).componentInstance;
    await c.reload();
    c.form.patchValue({ quoteCurrency: 'EUR', dailyBaseRate: '2.34' });
    await c.previewDraft();
    c.form.controls.buyPoints.setValue('3');
    expect(c.preview).toBeUndefined();
    await c.confirmDraft();
    expect(api.createRateDraft).not.toHaveBeenCalled();
    permissions = ['READ_BASE_TELLER_FX_RATE'];
    await c.previewDraft();
    expect(api.previewRateDraft).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid draft fields before API calls and renders safe errors', async () => {
    const f = TestBed.createComponent(FxRatesComponent),
      c = f.componentInstance;
    await c.reload();
    c.form.controls.dailyBaseRate.setValue('-1');
    await c.previewDraft();
    expect(api.previewRateDraft).not.toHaveBeenCalled();
    api.getRateDrafts.mockReturnValue(throwError(() => ({ status: 500, error: 'SQL secret' })));
    await c.load();
    jest.spyOn(c, 'ngOnInit').mockImplementation(() => {});
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role="alert"]').textContent).toContain('fx.unavailable');
    expect(f.nativeElement.textContent).not.toContain('SQL secret');
  });
  it('shows drawer requirements when context is rejected', async () => {
    api.getTellerContext.mockReturnValue(
      throwError(() => ({
        status: 403,
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.fx.cashier.assignment' }] }
      }))
    );
    const f = TestBed.createComponent(FxTellerComponent),
      c = f.componentInstance;
    await c.reload();
    jest.spyOn(c, 'ngOnInit').mockImplementation(() => {});
    f.detectChanges();
    expect(c.error).toBe('fx.drawerRequired');
    expect(f.nativeElement.querySelector('a[href="/organization/base-teller/cash-allocations"]')).toBeTruthy();
    expect(api.getDenominations).not.toHaveBeenCalled();
  });
  async function ready() {
    const f = TestBed.createComponent(FxTellerComponent),
      c = f.componentInstance;
    await c.reload();
    await c.searchCustomers();
    c.search.controls.value.setValue('0001');
    await c.searchCustomers();
    c.selectCustomer(customer);
    c.form.patchValue({ rateDraftId: 11, reference: 'Synthetic preview', usdAmount: '10.00', identifierId: '1' });
    await c.selectRate();
    c.form.controls.usdDenominations.at(0).setValue(1);
    c.form.controls.quoteDenominations.at(0).setValue(1);
    return { f, c };
  }
  it('searches customers, loads denominations and switches purchase/sale preview directions', async () => {
    const { f, c } = await ready();
    await c.previewTrade();
    expect(api.preview.mock.calls[0][0]).toBe('PURCHASE');
    expect(api.preview.mock.calls[0][1]).toEqual(request);
    c.switchMode(1);
    expect(c.preview).toBeUndefined();
    await c.previewTrade();
    expect(api.preview.mock.calls[1][0]).toBe('SALE');
    jest.spyOn(c, 'ngOnInit').mockImplementation(() => {});
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Incomplete preview');
    const buttons = Array.from(f.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.find((b) => b.textContent.includes('fx.execute'))?.disabled).toBe(true);
  });
  it.each([
    '   ',
    '\t\n'
  ])('rejects whitespace-only customer searches before calling the API', async (value) => {
    const c = TestBed.createComponent(FxTellerComponent).componentInstance;
    c.search.controls.value.setValue(value);
    expect(c.search.invalid).toBe(true);
    await c.searchCustomers();
    expect(api.searchCustomers).not.toHaveBeenCalled();
  });
  it('disables the known-failing name lookup and blocks programmatic name searches', async () => {
    const { f, c } = await ready();
    f.detectChanges();
    const select = f.debugElement
      .queryAll(By.directive(MatSelect))
      .find((element) => element.componentInstance.ngControl?.name === 'field')!.componentInstance as MatSelect;
    expect(select.options.find((option) => option.value === 'name')?.disabled).toBe(true);
    api.searchCustomers.mockClear();
    c.search.controls.field.setValue('name');
    expect(c.search.invalid).toBe(true);
    await c.searchCustomers();
    expect(api.searchCustomers).not.toHaveBeenCalled();
  });
  it('names cash regions and quantity controls using their actual currency and denomination', async () => {
    const { f } = await ready();
    f.detectChanges();
    const regions = Array.from(f.nativeElement.querySelectorAll('.fx-table[role="region"]')) as HTMLElement[];
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'fx.denominations USD',
      'fx.denominations EUR'
    ]);
    const labels = Array.from(f.nativeElement.querySelectorAll('.fx-table mat-label')) as HTMLElement[];
    expect(labels.map((label) => label.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
      'fx.quantity · 10.00 USD',
      'fx.quantity · 10.00 EUR'
    ]);
  });
  it('rejects negative and fractional denomination quantities and clears stale previews', async () => {
    const { c } = await ready();
    for (const q of [
      -1,
      0.5
    ]) {
      c.form.controls.usdDenominations.at(0).setValue(q);
      await c.previewTrade();
    }
    expect(api.preview).not.toHaveBeenCalled();
    c.form.controls.usdDenominations.at(0).setValue(1);
    await c.previewTrade();
    c.form.controls.reference.setValue('Changed');
    expect(c.preview).toBeUndefined();
  });
  it('does not retain a preview response after mode changes during the request', async () => {
    const pending = new Subject<FxTradePreview>();
    api.preview.mockReturnValue(pending);
    const { c } = await ready();
    const waiting = c.previewTrade();
    c.switchMode(1);
    pending.next(trade);
    pending.complete();
    await waiting;
    expect(c.preview).toBeUndefined();
  });
  it('formats exact amounts using locale separators without floating-point rounding', () => {
    const t = TestBed.inject(TranslateService);
    t.use('de-DE');
    const pipe = TestBed.runInInjectionContext(() => new WithdrawalMoneyPipe());
    expect(pipe.transform('12345678901234567890.12', 2)).toBe('12.345.678.901.234.567.890,12');
    expect(pipe.transform(null, 2)).toBe('—');
  });
});

describe('FX translations', () => {
  function flatten(value: Record<string, unknown>, prefix = ''): Record<string, string> {
    return Object.fromEntries(
      Object.entries(value).flatMap(
        ([
          key,
          item
        ]) => (typeof item === 'string' ? [[
                  prefix + key,
                  item
                ]] : Object.entries(flatten(item as Record<string, unknown>, prefix + key + '.')))
      )
    );
  }
  const folder = join(process.cwd(), 'src/assets/translations');
  const english = flatten(JSON.parse(readFileSync(join(folder, 'en-US.json'), 'utf8')).fx);
  it.each(readdirSync(folder).filter((name) => name.endsWith('.json')))(
    'has complete nonempty FX translations in %s',
    (name) => {
      const translated = flatten(JSON.parse(readFileSync(join(folder, name), 'utf8')).fx);
      expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
      expect(Object.values(translated).every((value) => value.trim().length > 0 && !value.startsWith('fx.'))).toBe(
        true
      );
      if (!name.startsWith('en-')) expect(translated.executionUnavailable).not.toBe(english.executionUnavailable);
    }
  );
});
