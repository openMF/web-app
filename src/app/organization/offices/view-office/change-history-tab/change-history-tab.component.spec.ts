/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { environment } from 'environments/environment';
import { ChangeHistoryTabComponent } from './change-history-tab.component';
import { officeAuditGuard } from './office-audit.guard';

const record = (id = 12, overrides: any = {}) => ({
  id,
  resourceId: 4,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  maker: 'recorded-user',
  madeOnDate: [
    2026,
    10,
    2,
    16,
    5
  ],
  processingResult: 'Processed',
  ...overrides
});

describe('Branch change history integration', () => {
  let fixture: ComponentFixture<ChangeHistoryTabComponent>;
  let component: ChangeHistoryTabComponent;
  let params: BehaviorSubject<any>;
  let api: any;
  let credentials: any;

  beforeEach(async () => {
    credentials = { authenticated: true, permissions: [
        'READ_OFFICE',
        'READ_AUDIT'
      ] };
    params = new BehaviorSubject(convertToParamMap({ officeId: '4' }));
    api = {
      getAuditTrails: jest.fn(() => of({ pageItems: [record()], totalFilteredRecords: 1 })),
      getAuditTrail: jest.fn(() =>
        of({ ...record(), commandAsJson: '{"name":"Submitted office","password":"secret"}' })
      ),
      getAuditTrailSearchTemplate: jest.fn(() => of({ appUsers: [{ id: 3, username: 'recorded-user' }] }))
    };
    await TestBed.configureTestingModule({
      imports: [
        ChangeHistoryTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { parent: { paramMap: params } } },
        { provide: SystemService, useValue: api },
        { provide: AuthenticationService, useValue: { getCredentials: () => credentials } },
        { provide: SettingsService, useValue: { datetimeFormat: 'dd MMMM yyyy HH:mm', language: { code: 'en-US' } } }
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', {
      branchHistory: { title: 'Change history', noBeforeValues: 'Previous values unavailable' }
    });
    translate.use('en-US');
    fixture = TestBed.createComponent(ChangeHistoryTabComponent);
    component = fixture.componentInstance;
  });

  const start = () => fixture.detectChanges();

  it('loads a bounded branch-scoped page and template; no eager command requests', () => {
    start();
    expect(api.getAuditTrails).toHaveBeenCalledWith(
      expect.arrayContaining([
        { type: 'entityName', value: 'OFFICE' },
        { type: 'resourceId', value: '4' }
      ]),
      'madeOnDate',
      'DESC',
      0,
      25
    );
    expect(api.getAuditTrailSearchTemplate).toHaveBeenCalledTimes(1);
    expect(api.getAuditTrail).not.toHaveBeenCalled();
    expect(component.visibleEvents.map((event) => event.id)).toEqual(['12']);
  });

  it('discards cross-office and same-number unrelated or prefix-matching entities', () => {
    api.getAuditTrails.mockReturnValue(
      of({ pageItems: [
          record(),
          record(13, { resourceId: 5 }),
          record(14, { entityName: 'OFFICETRANSACTION' }),
          record(15, { entityName: 'ADDRESS' })
        ], totalFilteredRecords: 4 })
    );
    start();
    expect(component.events.map((event) => event.id)).toEqual(['12']);
    expect(component.actorCount).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('OFFICETRANSACTION');
    // The prefix-matching server total is deliberately absent from summary state.
    expect(component.visibleEvents.length).toBe(1);
  });

  it('denies data, details and export to office readers even with legacy RBAC disabled', () => {
    const rbac = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = false;
    credentials.permissions = ['READ_OFFICE'];
    try {
      start();
      expect(component.state).toBe('forbidden');
      component.exportCsv();
      component.toggleDetail(record() as any);
      expect(api.getAuditTrails).not.toHaveBeenCalled();
      expect(api.getAuditTrailSearchTemplate).not.toHaveBeenCalled();
      expect(api.getAuditTrail).not.toHaveBeenCalled();
    } finally {
      environment.productionModeEnableRBAC = rbac;
    }
  });

  it.each([
    401,
    403
  ])('keeps a backend %s distinct from an empty audit log', (status) => {
    api.getAuditTrails.mockReturnValue(throwError(() => ({ status })));
    start();
    expect(component.state).toBe('forbidden');
    expect(component.events).toEqual([]);
  });

  it('distinguishes network errors and invalid response formats', () => {
    api.getAuditTrails.mockReturnValue(throwError(() => ({ status: 500 })));
    start();
    expect(component.state).toBe('error');
    api.getAuditTrails.mockReturnValue(of([]));
    component.reload();
    expect(component.state).toBe('invalid');
  });

  it('clears previous office data, cache and filters and cancels pending requests after navigation', () => {
    const pending = new Subject<any>();
    api.getAuditTrails.mockReturnValue(pending);
    start();
    expect(pending.observed).toBe(true);
    const current = new Subject<any>();
    api.getAuditTrails.mockReturnValue(current);
    params.next(convertToParamMap({ officeId: '5' }));
    expect(pending.observed).toBe(false);
    pending.next({ pageItems: [record()], totalFilteredRecords: 1 });
    current.next({ pageItems: [record(20, { resourceId: 5 })], totalFilteredRecords: 1 });
    expect(component.events.map((event) => event.id)).toEqual(['20']);
    expect(component.officeId).toBe('5');
  });

  it('cancels detail requests when the office or applied filters change', () => {
    start();
    const pending = new Subject<any>();
    api.getAuditTrail.mockReturnValue(pending);
    component.toggleDetail(component.events[0]);
    params.next(convertToParamMap({ officeId: '5' }));
    expect(pending.observed).toBe(false);
    expect(component.details.size).toBe(0);
  });

  it('does not apply a debounced search from the previous office', fakeAsync(() => {
    start();
    component.filters.controls.search.setValue('previous-office-search');
    params.next(convertToParamMap({ officeId: '5' }));
    api.getAuditTrails.mockReturnValue(of({ pageItems: [record(20, { resourceId: 5 })], totalFilteredRecords: 1 }));
    component.reload();
    tick(300);
    expect(component.visibleEvents).toHaveLength(1);
    expect(component.filters.controls.search.value).toBe('');
  }));

  it('applies the same settled search again immediately after changing offices', fakeAsync(() => {
    api.getAuditTrails.mockReturnValue(
      of({ pageItems: [
          record(),
          record(11, { maker: 'other-user' })
        ], totalFilteredRecords: 2 })
    );
    start();
    component.filters.controls.search.setValue('recorded-user');
    tick(300);
    expect(component.visibleEvents.map((event) => event.id)).toEqual(['12']);

    api.getAuditTrails.mockReturnValue(
      of({ pageItems: [
          record(20, { resourceId: 5 }),
          record(19, { resourceId: 5, maker: 'other-user' })
        ], totalFilteredRecords: 2 })
    );
    params.next(convertToParamMap({ officeId: '5' }));
    expect(component.visibleEvents).toHaveLength(2);
    component.filters.controls.search.setValue('recorded-user');
    tick(300);

    expect(component.visibleEvents.map((event) => event.id)).toEqual(['20']);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(2);
  }));

  it('cancels an older filter response before accepting the newer result', () => {
    const old = new Subject<any>();
    api.getAuditTrails.mockReturnValue(old);
    start();
    const current = new Subject<any>();
    api.getAuditTrails.mockReturnValue(current);
    component.filters.controls.makerId.setValue('3');
    expect(old.observed).toBe(false);
    current.next({ pageItems: [record(20)], totalFilteredRecords: 1 });
    old.next({ pageItems: [record(10)], totalFilteredRecords: 1 });
    expect(component.events.map((event) => event.id)).toEqual(['20']);
  });

  it('stops at a fixed page budget instead of fetching an unlimited history', () => {
    api.getAuditTrails.mockImplementation((_filters: any, _order: string, _sort: string, offset: number) =>
      of({
        pageItems: Array.from({ length: 25 }, (_, index) => record(1000 - offset - index)),
        totalFilteredRecords: 1000
      })
    );
    start();
    for (let index = 0; index < 25; index++) component.loadMore();
    expect(api.getAuditTrails).toHaveBeenCalledTimes(20);
    expect(component.events).toHaveLength(500);
    expect(component.atLimit).toBe(true);
    expect(component.hasMore).toBe(false);
    expect(api.getAuditTrail).not.toHaveBeenCalled();
  });

  it('requests only the remaining budget after a short nonterminal page', () => {
    api.getAuditTrails.mockImplementation(
      (_filters: unknown, _order: string, _sort: string, offset: number, limit: number) =>
        of({
          pageItems: Array.from({ length: offset === 0 ? 24 : limit }, (_, index) => record(2000 - offset - index)),
          totalFilteredRecords: 1000
        })
    );
    start();
    for (let index = 0; index < 19; index++) component.loadMore();
    expect(component.events).toHaveLength(499);
    expect(component.hasMore).toBe(true);

    component.loadMore();
    expect(api.getAuditTrails.mock.calls.at(-1).slice(1)).toEqual([
      'madeOnDate',
      'DESC',
      499,
      1
    ]);
    expect(component.events).toHaveLength(500);
    expect(component.atLimit).toBe(true);
    expect(component.hasMore).toBe(false);
    component.loadMore();
    expect(api.getAuditTrails).toHaveBeenCalledTimes(21);
  });

  it('rejects a response exceeding the remaining budget instead of retaining extra rows', () => {
    api.getAuditTrails.mockImplementation((_filters: unknown, _order: string, _sort: string, offset: number) =>
      of({
        pageItems: Array.from({ length: offset === 0 ? 24 : 25 }, (_, index) => record(2000 - offset - index)),
        totalFilteredRecords: 1000
      })
    );
    start();
    for (let index = 0; index < 20; index++) component.loadMore();
    expect(component.events).toHaveLength(499);
    expect(component.pageError).toBe(true);
    expect(component.loadingMore).toBe(false);
  });

  it('treats a denied search template as permission failure and keeps network failure separate', () => {
    api.getAuditTrailSearchTemplate.mockReturnValue(throwError(() => ({ status: 403 })));
    start();
    expect(component.state).toBe('forbidden');
    expect(api.getAuditTrails).not.toHaveBeenCalled();
    api.getAuditTrailSearchTemplate.mockReturnValue(throwError(() => ({ status: 503 })));
    params.next(convertToParamMap({ officeId: '5' }));
    expect(component.state).toBe('ready');
    expect(component.templateError).toBe(true);
    expect(component.filters.controls.makerId.disabled).toBe(true);
  });

  it('paginates by received rows and merges/deduplicates month groups', () => {
    api.getAuditTrails.mockReturnValue(
      of({ pageItems: [
          record(),
          record(13, { entityName: 'OFFICETRANSACTION' })
        ], totalFilteredRecords: 4 })
    );
    start();
    api.getAuditTrails.mockReturnValue(
      of({
        pageItems: [
          record(),
          record(10, { madeOnDate: [
              2026,
              9,
              1
            ] })
        ],
        totalFilteredRecords: 4
      })
    );
    component.loadMore();
    expect(api.getAuditTrails.mock.calls[1].slice(1)).toEqual([
      'madeOnDate',
      'DESC',
      2,
      25
    ]);
    expect(component.groups.map((group) => group.key)).toEqual([
      '2026-10',
      '2026-09'
    ]);
    expect(component.events).toHaveLength(2);
    expect(component.hasMore).toBe(false);
  });

  it('preserves loaded events on a failed next page and disables export until retry succeeds', () => {
    api.getAuditTrails.mockReturnValue(of({ pageItems: [record()], totalFilteredRecords: 2 }));
    start();
    api.getAuditTrails.mockReturnValue(throwError(() => ({ status: 503 })));
    component.loadMore();
    expect(component.state).toBe('ready');
    expect(component.pageError).toBe(true);
    expect(component.events).toHaveLength(1);
    api.getAuditTrails.mockReturnValue(of({ pageItems: [record(11)], totalFilteredRecords: 2 }));
    component.loadMore();
    expect(component.pageError).toBe(false);
    expect(component.events).toHaveLength(2);
  });

  it('clears all loaded metadata when a subsequent page or detail returns 403', () => {
    start();
    api.getAuditTrail.mockReturnValue(throwError(() => ({ status: 403 })));
    component.toggleDetail(component.events[0]);
    expect(component.state).toBe('forbidden');
    expect(component.groups).toEqual([]);
    expect(component.details.size).toBe(0);
    component.reload();
    expect(api.getAuditTrails).toHaveBeenCalledTimes(1);
  });

  it('uses stable maker IDs and resets pagination and detail caches for server filters', () => {
    start();
    component.toggleDetail(component.events[0]);
    component.filters.controls.makerId.setValue('3');
    expect(api.getAuditTrails).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { type: 'makerId', value: '3' },
        { type: 'resourceId', value: '4' }
      ]),
      'madeOnDate',
      'DESC',
      0,
      25
    );
    expect(component.details.size).toBe(0);
  });

  it('validates date ranges and uses explicit local wall-clock API date formatting', () => {
    start();
    component.filters.patchValue({ from: '2026-10-02T12:00:00', to: '2026-10-01T23:59:59' }, { emitEvent: false });
    component.reload();
    expect(component.rangeInvalid).toBe(true);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(1);
    component.filters.controls.from.setValue('2026-10-01T00:00:00');
    expect(api.getAuditTrails).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { type: 'makerDateTimeFrom', value: '2026-10-01 00:00:00' },
        { type: 'makerDateTimeTo', value: '2026-10-01 23:59:59' },
        { type: 'dateFormat', value: 'yyyy-MM-dd HH:mm:ss' }
      ]),
      'madeOnDate',
      'DESC',
      0,
      25
    );
  });

  it.each([
    'from',
    'to'
  ] as const)('reapplies the same %s date after clearing both date controls', (controlName) => {
    api.getAuditTrails.mockReturnValue(
      of({
        pageItems: [
          record(),
          record(11, { madeOnDate: [
              2026,
              9,
              30
            ] })
        ],
        totalFilteredRecords: 2
      })
    );
    start();
    const control = component.filters.controls[controlName];
    const date = '2026-10-01T00:00';
    control.setValue(date);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(2);

    component.clearDates();
    expect(component.filters.controls.from.value).toBe('');
    expect(component.filters.controls.to.value).toBe('');
    expect(component.visibleEvents).toHaveLength(2);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(3);

    control.setValue(date);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(4);
    expect(api.getAuditTrails).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { type: controlName === 'from' ? 'makerDateTimeFrom' : 'makerDateTimeTo', value: '2026-10-01 00:00:00' }
      ]),
      'madeOnDate',
      'DESC',
      0,
      25
    );
    expect(component.visibleEvents.map((event) => event.id)).toEqual([controlName === 'from' ? '12' : '11']);
  });

  it.each([
    'from',
    'to'
  ] as const)('reapplies the same %s date after navigating to another office', (controlName) => {
    start();
    const date = '2026-10-01T00:00';
    component.filters.controls[controlName].setValue(date);
    api.getAuditTrails.mockReturnValue(of({ pageItems: [record(20, { resourceId: 5 })], totalFilteredRecords: 1 }));
    params.next(convertToParamMap({ officeId: '5' }));
    expect(component.filters.controls[controlName].value).toBe('');

    component.filters.controls[controlName].setValue(date);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(4);
    expect(api.getAuditTrails).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { type: 'resourceId', value: '5' },
        { type: controlName === 'from' ? 'makerDateTimeFrom' : 'makerDateTimeTo', value: '2026-10-01 00:00:00' }
      ]),
      'madeOnDate',
      'DESC',
      0,
      25
    );
  });

  it('debounces metadata search locally and searches only explicitly opened safe fields', fakeAsync(() => {
    start();
    component.filters.controls.search.setValue('Submitted office');
    tick(300);
    expect(component.visibleEvents).toEqual([]);
    expect(api.getAuditTrails).toHaveBeenCalledTimes(1);
    expect(api.getAuditTrail).not.toHaveBeenCalled();
    component.toggleDetail(component.events[0]);
    expect(component.visibleEvents).toHaveLength(1);
    component.filters.controls.search.setValue('secret');
    tick(300);
    expect(component.visibleEvents).toEqual([]);
  }));

  it('filters sections locally and uses loaded matching scope for all metrics', () => {
    api.getAuditTrails.mockReturnValue(
      of({ pageItems: [
          record(),
          record(11),
          record(10, { maker: null })
        ], totalFilteredRecords: 100 })
    );
    start();
    component.filters.controls.section.setValue('general');
    expect(api.getAuditTrails).toHaveBeenCalledTimes(1);
    expect(component.visibleEvents.length).toBe(3);
    expect(component.actorCount).toBe(1);
    expect(component.latest.id).toBe('12');
    expect(component.hasMore).toBe(true);
    expect(fixture.nativeElement.querySelector('.section-track span').style.width).toBe('100%');
    expect(fixture.nativeElement.querySelector('.summary-card').textContent).not.toContain('100');
  });

  it('verifies the detail office and ID before parsing a command', () => {
    start();
    api.getAuditTrail.mockReturnValue(of({ ...record(), resourceId: 5, commandAsJson: '{"name":"Other office"}' }));
    component.toggleDetail(component.events[0]);
    expect(component.details.get('12').state).toBe('error');
    expect(component.details.get('12').fields).toEqual([]);
  });

  it('renders submitted HTML as text, never fabricates before values and caches opened details', () => {
    api.getAuditTrail.mockReturnValue(
      of({ ...record(), commandAsJson: '{"name":"<img src=x onerror=alert(1)>","token":"secret"}' })
    );
    start();
    component.toggleDetail(component.events[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.submitted-fields').textContent).toContain(
      '<img src=x onerror=alert(1)>'
    );
    expect(fixture.nativeElement.querySelector('.submitted-fields').textContent).toContain(
      'Previous values unavailable'
    );
    expect(fixture.nativeElement.querySelectorAll('.submitted-fields img')).toHaveLength(0);
    expect(fixture.nativeElement.textContent).not.toContain('secret');
    expect(fixture.nativeElement.querySelectorAll('del')).toHaveLength(0);
    component.toggleDetail(component.events[0]);
    component.toggleDetail(component.events[0]);
    expect(api.getAuditTrail).toHaveBeenCalledTimes(1);
  });

  it('renders pre-2001 dates without letting the shared pipe reinterpret milliseconds as seconds', () => {
    api.getAuditTrails.mockReturnValue(
      of({
        pageItems: [
          record(10, { madeOnDate: [
              2000,
              1,
              1,
              9,
              0
            ] })
        ],
        totalFilteredRecords: 1
      })
    );
    start();
    expect(fixture.nativeElement.querySelector('.month-heading').textContent).toContain('January 2000');
    expect(fixture.nativeElement.querySelector('time').textContent).toContain('01 January 2000 09:00');
  });

  it('creates only a loaded-record metadata CSV and checks permissions again at invocation', () => {
    start();
    const create = jest.fn(() => 'blob:office-audit');
    Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), configurable: true });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    component.exportCsv();
    expect(create).toHaveBeenCalledTimes(1);
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe('office-4-loaded-audit.csv');
    expect(api.getAuditTrails).toHaveBeenCalledTimes(1);
    expect(api.getAuditTrail).not.toHaveBeenCalled();
    credentials.permissions = ['READ_OFFICE'];
    component.exportCsv();
    expect(create).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('reports CSV creation failure without claiming success', () => {
    start();
    Object.defineProperty(URL, 'createObjectURL', {
      value: () => {
        throw new Error('unavailable');
      },
      configurable: true
    });
    component.exportCsv();
    expect(component.exportError).toBe(true);
  });

  it('guards direct route entry without relying on the optional menu RBAC flag', () => {
    const route = { parent: { paramMap: convertToParamMap({ officeId: '4' }) } } as any;
    credentials.permissions = ['READ_OFFICE'];
    const denied = TestBed.runInInjectionContext(() => officeAuditGuard(route, {} as any));
    expect(TestBed.inject(Router).serializeUrl(denied as any)).toBe('/organization/offices/4/general');
    credentials.permissions = ['READ_AUDIT'];
    expect(TestBed.runInInjectionContext(() => officeAuditGuard(route, {} as any))).toBe(true);
  });
});
