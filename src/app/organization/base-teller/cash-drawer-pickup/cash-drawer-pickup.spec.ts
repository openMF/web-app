import { ChangeDetectorRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { CashDrawerPickupComponent } from './cash-drawer-pickup.component';
import { CashDrawerPickupService } from './cash-drawer-pickup.service';
import { PickupConfirmDialogComponent } from './pickup-confirm-dialog.component';
import { PickupChecksDialogComponent } from './pickup-checks-dialog.component';
import { PickupContext, PickupRecord, PickupRequest } from './cash-drawer-pickup.models';
import { pickupError } from './pickup-error';

const check = {
  source: 'DEPOSIT',
  id: 7,
  date: '2026-10-15',
  bank: 'Test bank',
  reference: 'check-ref',
  client: 'Client',
  currencyCode: 'AAA',
  amount: '2.25',
  status: 'PENDING_COLLECTION'
};
const cashier = {
  cashierId: 1,
  staffId: 11,
  cashierName: 'Source',
  tellerId: 4,
  tellerName: 'Base',
  officeId: 3,
  officeName: 'Office',
  closed: false
};
const context: PickupContext = {
  businessDate: '2026-10-15',
  sourceCashiers: [cashier],
  destinations: [{ ...cashier, cashierId: 2, cashierName: 'Head', staffId: 12 }],
  permissions: [
    'READ',
    'CREATE',
    'REPRINT'
  ],
  currencies: [
    { currencyCode: 'AAA', decimalPlaces: 2, denominations: [] },
    { currencyCode: 'BBB', decimalPlaces: 0, denominations: [] }
  ],
  sourceInventory: [
    {
      cashierId: 1,
      currencyCode: 'AAA',
      denominations: [
        { denominationId: 'note', type: 'NOTE', value: '0.10', availableQuantity: 4 },
        { denominationId: 'coin', type: 'COIN', value: '0.05', availableQuantity: 5 }
      ]
    },
    {
      cashierId: 1,
      currencyCode: 'BBB',
      denominations: [{ denominationId: 'other', type: 'BILL', value: '50', availableQuantity: 3 }]
    }
  ]
};
const request: PickupRequest = {
  cashierId: 1,
  destinationCashierId: 2,
  idempotencyKey: 'stable-key',
  currencies: [{ currencyCode: 'AAA', cashDenominations: [{ denominationId: 'note', quantity: 1 }], checks: [] }]
};
const preview: PickupRecord = {
  status: 'PREVIEW',
  businessDate: context.businessDate,
  officeId: 3,
  officeName: 'Office',
  sourceCashierId: 1,
  sourceName: 'Source',
  destinationCashierId: 2,
  destinationName: 'Head',
  currencies: []
};
const completed: PickupRecord = { ...preview, id: 9, reference: 'pickup-ref', status: 'COMPLETED' };

describe('pickup HTTP contract', () => {
  let service: CashDrawerPickupService;
  let http: HttpTestingController;
  let authenticated: BehaviorSubject<boolean>;
  const path = '/v2/base-teller/cash-drawer-pickups';
  beforeEach(() => {
    authenticated = new BehaviorSubject(true);
    TestBed.configureTestingModule({ providers: [
        { provide: AuthenticationService, useValue: { isAuthenticated$: authenticated.asObservable() } },
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(CashDrawerPickupService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('preserves pending pickup within a session and clears it on authentication loss', () => {
    const pending = { request, preview };
    service.pendingPickup = pending;
    authenticated.next(true);
    expect(service.pendingPickup).toBe(pending);
    authenticated.next(false);
    expect(service.pendingPickup).toBeUndefined();
    // A subsequent login must not resurrect the previous user's request/key.
    authenticated.next(true);
    expect(service.pendingPickup).toBeUndefined();
  });

  it('loads backend context and exact source-scoped checks', () => {
    service.context().subscribe((c) => expect(c.sourceCashiers[0].cashierName).toBe('Source'));
    http.expectOne(path + '/context').flush(JSON.stringify(context));
    service.checks(1).subscribe((c) => expect(c[0].id).toBe(7));
    const r = http.expectOne(path + '/checks?cashierId=1');
    expect(r.request.method).toBe('GET');
    r.flush(JSON.stringify([check]));
  });
  it('previews only selection input and preserves monetary decimals', () => {
    service.preview(request).subscribe((r) => expect(r.currencies[0].cash).toBe('0.123456789012345678'));
    const r = http.expectOne(path + '/preview');
    expect(r.request.body).toEqual(request);
    r.flush('{"currencies":[{"cash":0.123456789012345678}]}');
  });
  it('sends authorization only to create and retrieves historical receipts independently', () => {
    service.create(request, 'head-user', 'transient-test-secret').subscribe();
    const r = http.expectOne(path);
    expect(r.request.body).toEqual({
      ...request,
      authorizationUsername: 'head-user',
      authorizationCredential: 'transient-test-secret'
    });
    r.flush(JSON.stringify(completed));
    expect(request).not.toHaveProperty('authorizationCredential');
    service.retrieve(9).subscribe();
    http.expectOne(path + '/9').flush(JSON.stringify(completed));
    service.receipt(9).subscribe();
    http.expectOne(path + '/9/receipt').flush(JSON.stringify(completed));
  });
});

describe('pickup workflow', () => {
  let component: CashDrawerPickupComponent;
  let service: {
    context: jest.Mock;
    checks: jest.Mock;
    preview: jest.Mock;
    receipt: jest.Mock;
    pendingPickup?: { request: PickupRequest; preview: PickupRecord };
  };
  let dialog: { open: jest.Mock };
  beforeEach(() => {
    service = {
      context: jest.fn(() => of(context)),
      checks: jest.fn(() => of([check])),
      preview: jest.fn(() => of(preview)),
      receipt: jest.fn(() => of(completed))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(undefined) })) };
    TestBed.configureTestingModule({ providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } },
        FormBuilder,
        { provide: CashDrawerPickupService, useValue: service },
        { provide: MatDialog, useValue: dialog }
      ] });
    component = TestBed.runInInjectionContext(() => new CashDrawerPickupComponent());
    component.ngOnInit();
  });
  it('loads the source, destination, business date, currencies, and available denominations', () => {
    expect(component.sourceName).toBe('Source');
    expect(component.destinations[0].cashierName).toBe('Head');
    expect(component.context?.businessDate).toBe(context.businessDate);
    expect(component.rows.map((r) => r.currencyCode)).toEqual([
      'AAA',
      'BBB'
    ]);
    expect(component.rows[0].denominations[0].availableQuantity).toBe(4);
    expect(service.checks).toHaveBeenCalledWith(1);
  });
  it('calculates exact display totals separately by currency, bills, and coins', () => {
    const [
      a,
      b
    ] = component.rows;
    a.quantities.at(0).setValue(3);
    a.quantities.at(1).setValue(2);
    b.quantities.at(0).setValue(1);
    component.selected = [check];
    expect(component.amount(a, 0)).toBe('0.30');
    expect(component.total(a, 'BILL')).toBe('0.30');
    expect(component.total(a, 'COIN')).toBe('0.10');
    expect(component.total(a)).toBe('0.40');
    expect(component.total(a, 'CHECK')).toBe('2.25');
    expect(component.total(a, 'TOTAL')).toBe('2.65');
    expect(component.total(b)).toBe('50');
  });
  it.each([
    -1,
    1.5,
    5,
    NaN
  ])('rejects invalid or unavailable quantity %s', (quantity) => {
    component.rows[0].quantities.at(0).setValue(quantity);
    expect(component.canContinue).toBe(false);
    component.finish();
    expect(service.preview).not.toHaveBeenCalled();
  });
  it('round trips selected checks without modifying backend status', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of([check]) });
    component.selectChecks();
    expect(component.selected).toEqual([check]);
    expect(check.status).toBe('PENDING_COLLECTION');
  });
  it('previews selection with an idempotency key and blocks double continue', () => {
    const pending = new Subject<PickupRecord>();
    service.preview.mockReturnValue(pending);
    component.rows[0].quantities.at(0).setValue(2);
    component.selected = [check];
    component.finish();
    component.finish();
    expect(service.preview).toHaveBeenCalledTimes(1);
    expect(service.preview.mock.calls[0][0]).toEqual({
      cashierId: 1,
      destinationCashierId: 2,
      idempotencyKey: expect.any(String),
      currencies: [
        {
          currencyCode: 'AAA',
          cashDenominations: [{ denominationId: 'note', quantity: 2 }],
          checks: [{ source: 'DEPOSIT', id: 7 }]
        }
      ]
    });
    pending.next(preview);
    expect(dialog.open).toHaveBeenCalledWith(
      PickupConfirmDialogComponent,
      expect.objectContaining({ disableClose: true })
    );
  });
  it('shows authoritative success and reloads source inventory and checks', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of(completed) });
    component.rows[0].quantities.at(0).setValue(1);
    component.finish();
    expect(component.result).toEqual(completed);
    expect(service.context).toHaveBeenCalledTimes(2);
    expect(service.checks).toHaveBeenCalledTimes(2);
    expect(component.rows[0].quantities.at(0).value).toBe(0);
  });
  it('retrieves receipt on every print and reprint', fakeAsync(() => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    component.result = completed;
    component.printReceipt();
    tick();
    component.printReceipt();
    tick();
    expect(service.receipt).toHaveBeenNthCalledWith(1, 9);
    expect(service.receipt).toHaveBeenNthCalledWith(2, 9);
    expect(print).toHaveBeenCalledTimes(2);
    print.mockRestore();
  }));
  it('refreshes stale state when preview fails', () => {
    service.preview.mockReturnValue(
      throwError(() => ({
        status: 400,
        error: { userMessageGlobalisationCode: 'error.msg.base.teller.pickup.check.ineligible' }
      }))
    );
    component.selected = [check];
    component.finish();
    expect(component.error).toBe('cashPickup.staleChecks');
    expect(service.context).toHaveBeenCalledTimes(2);
    expect(dialog.open).not.toHaveBeenCalled();
  });
  it('retains an unresolved request/key on exit, prevents a new pickup, and resumes without preview', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of('pending') });
    component.rows[0].quantities.at(0).setValue(2);
    component.finish();
    const saved = service.pendingPickup!;
    expect(saved.request).toBe(service.preview.mock.calls[0][0]);
    expect(saved.preview).toBe(preview);
    expect(saved.request).not.toHaveProperty('authorizationCredential');
    expect(component.busy).toBe(false);
    expect(component.canContinue).toBe(false);
    component.finish();
    component.reload();
    component.selectChecks();
    expect(service.preview).toHaveBeenCalledTimes(1);
    expect(service.context).toHaveBeenCalledTimes(1);
    // The root service retains selection across route-component recreation.
    const reopened = TestBed.runInInjectionContext(() => new CashDrawerPickupComponent());
    reopened.ngOnInit();
    expect(reopened.pendingPickup).toBe(saved);
    dialog.open.mockReturnValue({ afterClosed: () => of(completed) });
    reopened.resume();
    expect(dialog.open).toHaveBeenLastCalledWith(
      PickupConfirmDialogComponent,
      expect.objectContaining({ data: { request: saved.request, preview, uncertain: true } })
    );
    expect(service.preview).toHaveBeenCalledTimes(1);
    expect(service.pendingPickup).toBeUndefined();
    expect(reopened.result).toEqual(completed);
  });

  it('requires backend CREATE and REPRINT permissions', () => {
    component.context = { ...context, permissions: ['READ'] };
    component.selected = [check];
    component.result = completed;
    expect(component.canContinue).toBe(false);
    component.printReceipt();
    expect(service.receipt).not.toHaveBeenCalled();
  });
});

describe('pickup authorization', () => {
  let component: PickupConfirmDialogComponent;
  let pending: Subject<PickupRecord>;
  let create: jest.Mock;
  let close: jest.Mock;
  beforeEach(() => {
    pending = new Subject();
    create = jest.fn(() => pending);
    close = jest.fn();
    TestBed.configureTestingModule({ providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } },
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { request, preview } },
        { provide: MatDialogRef, useValue: { close } },
        { provide: CashDrawerPickupService, useValue: { create } }
      ] });
    component = TestBed.runInInjectionContext(() => new PickupConfirmDialogComponent());
  });
  it('requires both authorization fields', () => {
    component.confirm();
    expect(create).not.toHaveBeenCalled();
    component.form.controls.username.setValue('head');
    component.confirm();
    expect(create).not.toHaveBeenCalled();
  });
  it('clears credentials immediately, prevents duplicate create and pending cancellation', () => {
    component.form.setValue({ username: 'head', credential: 'transient-test-secret' });
    component.confirm();
    component.confirm();
    component.cancel();
    expect(create).toHaveBeenCalledTimes(1);
    expect(component.form.controls.credential.value).toBe('');
    expect(close).not.toHaveBeenCalled();
    pending.next(completed);
    expect(close).toHaveBeenCalledWith(completed);
  });
  it('never stores or logs the authorization value', () => {
    const storage = jest.spyOn(Storage.prototype, 'setItem');
    const logs = [
      jest.spyOn(console, 'log'),
      jest.spyOn(console, 'error'),
      jest.spyOn(console, 'warn')
    ];
    component.form.setValue({ username: 'head', credential: 'transient-test-secret' });
    component.confirm();
    pending.next(completed);
    component.ngOnDestroy();
    expect(storage).not.toHaveBeenCalled();
    logs.forEach((log) => {
      expect(log).not.toHaveBeenCalled();
      log.mockRestore();
    });
    storage.mockRestore();
    expect(component.form.controls.credential.value).toBe('');
    expect(component.data.request).not.toHaveProperty('authorizationCredential');
  });
  it('allows fresh authorization after invalid authorization without saving the password', () => {
    component.form.setValue({ username: 'head', credential: 'bad' });
    component.confirm();
    pending.error({ status: 400, error: { userMessageGlobalisationCode: 'authorization.invalid' } });
    expect(component.error).toBe('cashPickup.invalidAuthorization');
    expect(component.stale).toBe(false);
    expect(component.form.controls.credential.value).toBe('');
    create.mockReturnValue(of(completed));
    component.form.controls.credential.setValue('fresh');
    component.confirm();
    expect(create).toHaveBeenLastCalledWith(request, 'head', 'fresh');
  });
  it('retries an unknown outcome with the identical key and selection', () => {
    component.form.setValue({ username: 'head', credential: 'secret' });
    component.confirm();
    pending.error({ status: 0 });
    expect(component.uncertain).toBe(true);
    create.mockReturnValue(of(completed));
    component.form.controls.credential.setValue('new-secret');
    component.confirm();
    expect(create.mock.calls[0][0]).toBe(create.mock.calls[1][0]);
  });
  it('keeps an earlier unknown outcome locked when retry authorization fails', () => {
    component.form.setValue({ username: 'head', credential: 'secret' });
    component.confirm();
    pending.error({ status: 0 });
    create.mockReturnValue(
      throwError(() => ({ status: 400, error: { userMessageGlobalisationCode: 'authorization.invalid' } }))
    );
    component.form.controls.credential.setValue('bad-retry');
    component.confirm();
    component.cancel();
    expect(component.uncertain).toBe(true);
    expect(close).toHaveBeenCalledWith('pending');
  });

  it('preserves uncertain status when reopening and clears entered credentials on exit', () => {
    component.data.uncertain = true;
    const reopened = TestBed.runInInjectionContext(() => new PickupConfirmDialogComponent());
    expect(reopened.uncertain).toBe(true);
    reopened.form.setValue({ username: 'head', credential: 'never-retain' });
    reopened.cancel();
    expect(close).toHaveBeenCalledWith('pending');
    expect(reopened.form.controls.credential.value).toBe('');
    delete component.data.uncertain;
  });

  it('requires a new preview after a stale check or insufficient inventory', () => {
    component.form.setValue({ username: 'head', credential: 'secret' });
    component.confirm();
    pending.error({ status: 400, error: { userMessageGlobalisationCode: 'check.ineligible' } });
    expect(component.stale).toBe(true);
    component.form.controls.credential.setValue('secret');
    component.confirm();
    expect(create).toHaveBeenCalledTimes(1);
    component.cancel();
    expect(close).toHaveBeenCalled();
  });
});

describe('check selection dialog', () => {
  it('supports selecting and unselecting distinct source/id checks', () => {
    const close = jest.fn();
    const checks = [
      check,
      { ...check, source: 'OPENING' }
    ];
    TestBed.configureTestingModule({ providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } },
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { checks, selected: [check], sourceName: 'Source' } },
        { provide: MatDialogRef, useValue: { close } }
      ] });
    const component = TestBed.runInInjectionContext(() => new PickupChecksDialogComponent());
    expect(component.selections.value).toEqual([
      true,
      false
    ]);
    component.selections.at(0).setValue(false);
    component.selections.at(1).setValue(true);
    component.accept();
    expect(close).toHaveBeenCalledWith([checks[1]]);
  });
});

describe('safe pickup errors', () => {
  it.each([
    [
      'authorization.invalid',
      'invalidAuthorization'
    ],
    [
      'inventory.insufficient',
      'insufficient'
    ],
    [
      'check.duplicate',
      'staleChecks'
    ],
    [
      'destination.invalid',
      'invalidDestination'
    ],
    [
      'source.forbidden',
      'invalidSource'
    ],
    [
      'idempotency.conflict',
      'duplicate'
    ]
  ])('maps %s', (code, label) => {
    expect(
      pickupError({
        status: 400,
        error: JSON.stringify({
          errors: [{ userMessageGlobalisationCode: code, developerMessage: 'SQL and credential must not appear' }]
        })
      })
    ).toBe('cashPickup.' + label);
  });
  it('uses safe messages for malformed bodies, conflicts, and forbidden requests', () => {
    expect(pickupError({ status: 500, error: '<Java exception>' })).toBe('cashPickup.unavailable');
    expect(pickupError({ status: 403 })).toBe('cashPickup.forbidden');
    expect(pickupError({ status: 409 })).toBe('cashPickup.conflict');
  });
});

describe('pickup rendered screen', () => {
  it('renders backend source/destination, currency tables, availability, and quantity errors', async () => {
    TestBed.configureTestingModule({
      imports: [
        CashDrawerPickupComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: CashDrawerPickupService, useValue: { context: () => of(context), checks: () => of([check]) } },
        { provide: MatDialog, useValue: { open: jest.fn() } }
      ]
    });
    const fixture = TestBed.createComponent(CashDrawerPickupComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const screen = fixture.nativeElement as HTMLElement;
    expect(screen.textContent).toContain('Source');
    expect(screen.textContent).toContain('Head');
    expect(screen.querySelectorAll('mat-table')).toHaveLength(2);
    expect(screen.querySelectorAll('mat-row')).toHaveLength(3);
    const input = screen.querySelector('[data-denomination="note"]') as HTMLInputElement;
    expect(input.max).toBe('4');
    expect(input.getAttribute('data-currency')).toBe('AAA');
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.canContinue).toBe(false);
    expect(screen.querySelector('mat-error')?.textContent).toContain('cashPickup.invalidQuantity');
  });
});
