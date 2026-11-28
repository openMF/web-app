/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DatePipe } from '@angular/common';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationStart, Router, provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from '../../system.service';
import { auditDetail } from './audit-detail';
import { AuditTrailResolver, auditScope } from './audit-trail.resolver';
import { ViewAuditComponent } from './view-audit.component';
import en from '../../../../assets/translations/en-US.json';
const record = (id = 12, extra: Record<string, unknown> = {}) => ({
  id,
  entityName: 'OFFICE',
  resourceId: 3,
  actionName: 'UPDATE',
  maker: 'synthetic-maker',
  madeOnDate: [
    2026,
    11,
    12,
    12,
    59,
    45
  ],
  processingResult: 'Processed',
  commandAsJson:
    '{"name":"Synthetic office","parentId":1,"externalId":"003","locale":"en","dateFormat":"dd MMMM yyyy","password":"SECRET"}',
  ...extra
});

describe('ViewAuditComponent', () => {
  let fixture: ComponentFixture<ViewAuditComponent>, component: ViewAuditComponent;
  let routeData: BehaviorSubject<unknown>, routerEvents: Subject<unknown>;
  let credentials = { authenticated: true, username: 'operator', userId: 5, permissions: ['ALL_FUNCTIONS'] };
  const auth = { getCredentials: () => credentials, isAuthenticated$: new Subject<boolean>() };
  const settings = { serverUrl: 'fixture', tenantIdentifier: 'one', language: { code: 'en' } };
  const system = { getAuditTrails: jest.fn(), getAuditTrail: jest.fn() };
  const organization = { getOffice: jest.fn() };
  const older = record(11, { actionName: 'CREATE', madeOnDate: [
      2026,
      11,
      12,
      12,
      54,
      6
    ], commandAsJson: '{"name":"Earlier office"}' });
  const resolve = (data = record()) => ({
    auditTrail: {
      state: 'ready',
      scope: auditScope(auth as never, settings as never),
      detail: auditDetail(data, String(data.id))
    }
  });

  beforeEach(() => {
    credentials = { authenticated: true, username: 'operator', userId: 5, permissions: ['ALL_FUNCTIONS'] };
    settings.tenantIdentifier = 'one';
    system.getAuditTrails.mockReturnValue(
      of({ totalFilteredRecords: 3, pageItems: [
          record(),
          older,
          record(10, { entityName: 'CLIENT' })
        ] })
    );
    system.getAuditTrail.mockReturnValue(of(older));
    organization.getOffice.mockReturnValue(of({ id: 1, name: 'Current parent' }));
    routeData = new BehaviorSubject(resolve());
    routerEvents = new Subject();
    TestBed.configureTestingModule({
      imports: [
        ViewAuditComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideRouter([]),
        AuditTrailResolver,
        { provide: ActivatedRoute, useValue: { data: routeData, snapshot: {} } },
        { provide: AuthenticationService, useValue: auth },
        { provide: SettingsService, useValue: settings },
        { provide: SystemService, useValue: system },
        { provide: OrganizationService, useValue: organization }
      ]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'events', 'get').mockReturnValue(routerEvents as never);
    fixture = TestBed.createComponent(ViewAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture.destroy();
  });

  it('renders a descriptive heading, dynamic badges, five metadata columns and safe fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1').textContent).toBe('Synthetic office');
    expect(element.querySelectorAll('.metadata > div')).toHaveLength(5);
    expect(element.querySelector('.badges').textContent).toContain('Processed');
    expect(element.querySelector('.metadata').textContent).toContain('synthetic-maker');
    expect(element.textContent).not.toContain('SECRET');
    expect(component.formatFields.map((field) => field.key)).toEqual([
      'locale',
      'dateFormat'
    ]);
    expect(component.fields.some((field) => field.key === 'locale')).toBe(false);
    expect(component.date(component.event.timestamp)).toContain('12:59:45');
  });
  it('shows missing checker and IP without inferring direct processing', () => {
    expect(component.checkerStatus).toBe('missingChecker');
    expect(fixture.nativeElement.textContent).toContain('None recorded');
    expect(fixture.nativeElement.textContent).not.toContain('Processed without checker');
  });
  it('uses resource fallback and pending workflow classification', () => {
    routeData.next(resolve(record(13, { commandAsJson: '{}', processingResult: 'awaiting.approval' })));
    fixture.detectChanges();
    expect(component.heading).toBe('Office #3');
    expect(component.checkerStatus).toBe('pending');
  });
  it('resolves a bounded parent lookup with a current-name label and retains the submitted ID', () => {
    expect(organization.getOffice).toHaveBeenCalledWith('1');
    expect(component.parentName).toBe('Current parent');
    expect(component.fields.find((field) => field.key === 'parentId').value).toBe('1');
    expect(fixture.nativeElement.textContent).toContain('Current name: Current parent');
  });
  it('preserves the parent ID when a lookup fails', () => {
    organization.getOffice.mockReturnValue(throwError(() => ({ status: 403 })));
    routeData.next(resolve());
    expect(component.parentName).toBe('');
    expect(component.state).toBe('ready');
  });
  it('uses exact resource identity, highlights selection and navigates only to known events', () => {
    expect(component.history.map((event) => event.id)).toEqual([
      '12',
      '11'
    ]);
    expect(fixture.nativeElement.querySelector('.selected [aria-current="page"]')).toBeTruthy();
    expect(system.getAuditTrails).toHaveBeenCalledWith(
      [
        { type: 'entityName', value: 'OFFICE' },
        { type: 'resourceId', value: '3' }
      ],
      'id',
      'DESC',
      0,
      25
    );
    expect(component.previous.id).toBe('11');
    expect(component.next).toBeUndefined();
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.navigate(component.previous);
    expect(navigate.mock.calls[0][0]).toEqual([
      '../',
      '11'
    ]);
  });
  it('deduplicates across pages and does not show server prefix total as exact history count', () => {
    system.getAuditTrails.mockReturnValue(
      of({ totalFilteredRecords: 5, pageItems: [
          older,
          record(9)
        ] })
    );
    component.loadHistory();
    expect(component.history.map((event) => event.id)).toEqual([
      '12',
      '9',
      '11'
    ]);
    expect(component.hasMore).toBe(false);
  });
  it('shows pagination failure without erasing validated history', () => {
    system.getAuditTrails.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loadHistory();
    expect(component.historyError).toBe(true);
    expect(component.history.length).toBe(2);
  });
  it('compares authorized same-resource submitted values and derives observations from records', () => {
    component.compare();
    expect(component.comparisonState).toBe('ready');
    expect(component.comparison[0].previous).toBe('"Earlier office"');
    expect(component.minutesAfterCreation).toBe(6);
  });
  it('rejects a different-resource comparison response', () => {
    system.getAuditTrail.mockReturnValue(of({ ...older, entityName: 'CLIENT' }));
    component.compare();
    expect(component.comparisonState).toBe('error');
    expect(component.comparison).toEqual([]);
  });
  it('clears details immediately on navigation and cancels obsolete history/comparison requests', () => {
    const pending = new Subject();
    system.getAuditTrail.mockReturnValue(pending);
    component.compare();
    expect(pending.observed).toBe(true);
    routerEvents.next(new NavigationStart(2, '/system/audit-trails/11'));
    expect(pending.observed).toBe(false);
    expect(component.detail).toBeUndefined();
    routeData.next(resolve(older));
    expect(component.event.id).toBe('11');
    expect(component.comparison).toEqual([]);
  });
  it('cancels stale history when resolver data changes on the reused route', () => {
    const pending = new Subject();
    system.getAuditTrails.mockReturnValue(pending);
    component.loadHistory();
    expect(pending.observed).toBe(true);
    system.getAuditTrails.mockReturnValue(of({ totalFilteredRecords: 0, pageItems: [] }));
    routeData.next(resolve(older));
    expect(pending.observed).toBe(false);
    pending.next({ totalFilteredRecords: 1, pageItems: [record(99)] });
    expect(component.history).toEqual([]);
  });
  it('clears all data on authorization failures', () => {
    system.getAuditTrail.mockReturnValue(throwError(() => ({ status: 403 })));
    component.compare();
    expect(component.state).toBe('forbidden');
    expect(component.detail).toBeUndefined();
    expect(component.history).toEqual([]);
  });
  it('clears tenant data and cancels work after a scope change', fakeAsync(() => {
    fixture.destroy();
    fixture = TestBed.createComponent(ViewAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    settings.tenantIdentifier = 'two';
    tick(500);
    expect(component.state).toBe('forbidden');
    expect(component.detail).toBeUndefined();
    fixture.destroy();
  }));
  it.each([
    'tenant',
    'credentials',
    'both'
  ])('accepts a freshly resolved audit after a %s scope change on the reused component', (change) => {
    const pending = new Subject();
    system.getAuditTrails.mockReturnValue(pending);
    component.loadHistory();
    expect(pending.observed).toBe(true);
    if (change !== 'credentials') settings.tenantIdentifier = 'two';
    if (change !== 'tenant') credentials = { ...credentials, userId: 6, username: 'second-operator' };
    auth.isAuthenticated$.next(true);
    expect(component.state).toBe('forbidden');
    expect(pending.observed).toBe(false);
    system.getAuditTrails.mockReturnValue(of({ totalFilteredRecords: 0, pageItems: [] }));
    routeData.next(resolve(record(13, { commandAsJson: '{"name":"Second scope office"}' })));
    expect(component.state).toBe('ready');
    expect(component.event.id).toBe('13');
    expect(component.heading).toBe('Second scope office');
    expect(component.history).toEqual([]);
    expect(component.comparison).toEqual([]);
    pending.next({ totalFilteredRecords: 1, pageItems: [record(99)] });
    expect(component.history).toEqual([]);
  });
  it('rejects an old-scope resolution after a scope change, then accepts a verified current-scope resolution', () => {
    const stale = resolve(record(13, { commandAsJson: '{"name":"Stale scope office"}' }));
    settings.tenantIdentifier = 'two';
    routeData.next(stale);
    expect(component.state).toBe('forbidden');
    expect(component.detail).toBeUndefined();
    routeData.next(resolve(record(14, { commandAsJson: '{"name":"Current scope office"}' })));
    expect(component.state).toBe('ready');
    expect(component.heading).toBe('Current scope office');
  });
  it('does not accept a fresh resolution when current credentials lack audit-read permission', () => {
    credentials.permissions = ['READ_CLIENT'];
    routeData.next(resolve(record(13)));
    expect(component.state).toBe('forbidden');
    expect(component.detail).toBeUndefined();
  });
  it('checks permissions even when copy/export are invoked programmatically', async () => {
    const writeText = jest.fn();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    credentials.permissions = ['READ_CLIENT'];
    await component.copy();
    component.exportJson();
    expect(writeText).not.toHaveBeenCalled();
  });
  it('copies only safe data and reports clipboard failures', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    await component.copy();
    expect(writeText.mock.calls[0][0]).not.toContain('SECRET');
    expect(component.feedback).toBe('copied');
    writeText.mockRejectedValue(new Error());
    await component.copy();
    expect(component.feedback).toBe('copyFailed');
  });
  it('downloads a safe Blob with descriptive filename and releases its object URL', () => {
    URL.createObjectURL = jest.fn(() => 'blob:fixture');
    URL.revokeObjectURL = jest.fn();
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    component.exportJson();
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fixture');
    click.mockRestore();
  });
  it('cancels an in-flight resolver request when the authenticated scope changes', () => {
    const pending = new Subject();
    system.getAuditTrail.mockReturnValue(pending);
    const resolver = TestBed.inject(AuditTrailResolver);
    const received: string[] = [];
    resolver.resolve({ paramMap: { get: () => '12' } } as never).subscribe((value) => received.push(value.state));
    expect(pending.observed).toBe(true);
    credentials.userId = 6;
    auth.isAuthenticated$.next(true);
    expect(pending.observed).toBe(false);
    expect(received).toEqual(['forbidden']);
  });
  it('bounds history to 500 API records even when the server reports more', () => {
    system.getAuditTrails.mockClear();
    system.getAuditTrails.mockImplementation((_filters, _order, _sort, offset: number) =>
      of({
        totalFilteredRecords: 1000,
        pageItems: Array.from({ length: 25 }, (_, index) => record(1000 - offset - index))
      })
    );
    routeData.next(resolve());
    for (let page = 1; page < 20; page++) component.loadHistory();
    expect(component.atLimit).toBe(true);
    expect(component.hasMore).toBe(false);
    component.loadHistory();
    expect(system.getAuditTrails).toHaveBeenCalledTimes(20);
    // Reset the test double for subsequent tests as Jest only clears calls by default.
    system.getAuditTrails.mockReset();
  });
  it('does not fetch details for unauthorized or invalid resolver requests', () => {
    system.getAuditTrail.mockClear();
    const resolver = TestBed.inject(AuditTrailResolver);
    credentials.permissions = ['READ_CLIENT'];
    resolver
      .resolve({ paramMap: { get: () => '12' } } as never)
      .subscribe((value) => expect(value.state).toBe('forbidden'));
    credentials.permissions = ['READ_AUDIT'];
    resolver
      .resolve({ paramMap: { get: () => '../1' } } as never)
      .subscribe((value) => expect(value.state).toBe('invalid'));
    expect(system.getAuditTrail).not.toHaveBeenCalled();
  });
});
