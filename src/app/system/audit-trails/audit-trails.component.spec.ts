/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from '../system.service';
import { AuditTrailsComponent } from './audit-trails.component';
import { auditEvent } from './audit-presentation';
const row = (id = 12, extra = {}) => ({
  id,
  resourceId: 3,
  entityName: 'OFFICE',
  maker: 'fixture',
  actionName: 'UPDATE',
  processingResult: 'Processed',
  commandAsJson: '{"name":"new","password":"SECRET"}',
  ...extra
});
const template = { appUsers: [
    { id: 5, username: 'fixture' },
    { username: 'invalid' }
  ], actionNames: [
    'UPDATE',
    'CREATE'
  ], entityNames: ['OFFICE'], statuses: [{ id: 1, processingResult: 'Processed' }] };
describe('audit workspace', () => {
  let fixture: ComponentFixture<AuditTrailsComponent>;
  let component: AuditTrailsComponent;
  let service: any;
  let credentials: any;
  let settings: any;
  let authState: BehaviorSubject<boolean>;
  beforeEach(async () => {
    authState = new BehaviorSubject(true);
    credentials = { authenticated: true, userId: 5, username: 'fixture', permissions: ['READ_AUDIT'] };
    settings = { serverUrl: 'server', tenantIdentifier: 'tenant', language: { code: 'en' } };
    service = {
      getAuditTrails: jest.fn().mockReturnValue(of({ pageItems: [row()], totalFilteredRecords: 1 })),
      getAuditTrail: jest.fn().mockImplementation((id) => of(row(Number(id))))
    };
    await TestBed.configureTestingModule({
      imports: [
        AuditTrailsComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => credentials, isAuthenticated$: authState }
        },
        { provide: SettingsService, useValue: settings },
        { provide: SystemService, useValue: service },
        { provide: ActivatedRoute, useValue: { data: of({ auditTrailSearchTemplate: template }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AuditTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  function query() {
    return Object.fromEntries(
      service.getAuditTrails.mock.calls.at(-1)[0].map((item: any) => [
        item.type,
        item.value
      ])
    );
  }
  it('loads initially with bounded newest-first paging and authorized template users', () => {
    expect(service.getAuditTrails).toHaveBeenCalledWith(expect.any(Array), 'id', 'desc', 0, 25);
    expect(component.rows[0].id).toBe('12');
    expect(component.template.appUsers).toHaveLength(1);
  });
  it('uses authoritative pagination and resets page on sorting', () => {
    component.page({ pageIndex: 2, pageSize: 50, length: 200 });
    expect(service.getAuditTrails.mock.calls.at(-1).slice(3)).toEqual([
      100,
      50
    ]);
    component.sort({ active: 'maker', direction: 'asc' });
    expect(service.getAuditTrails.mock.calls.at(-1).slice(1)).toEqual([
      'maker',
      'asc',
      0,
      50
    ]);
  });
  it('uses only exact authorized trail lookup and clears incompatible filters', () => {
    component.filters.patchValue({ search: '12', entityName: 'OFFICE' });
    component.apply();
    expect(service.getAuditTrail).toHaveBeenCalledWith('12');
    expect(component.total).toBe(1);
    expect(component.filters.value.entityName).toBe('');
    expect(component.detail?.id).toBe('12');
  });
  it('does not submit arbitrary text, ambiguous numbers or undefined user IDs', () => {
    const before = service.getAuditTrails.mock.calls.length;
    component.filters.patchValue({ search: 'someone' });
    component.apply();
    expect(component.invalid).toBe(true);
    expect(service.getAuditTrails).toHaveBeenCalledTimes(before);
    component.filters.patchValue({ mode: 'user', search: 'invalid' });
    component.apply();
    expect(component.invalid).toBe(true);
  });
  it('searches resource and validated username using supported fields', () => {
    component.filters.patchValue({ mode: 'resource', search: '3' });
    component.apply();
    expect(query().resourceId).toBe('3');
    component.filters.patchValue({ mode: 'user', search: 'fixture' });
    component.apply();
    expect(query().makerId).toBe('5');
  });
  it('retains entity, action, status, maker, checker and checker-date filtering', () => {
    component.filters.patchValue({
      entityName: 'OFFICE',
      actionName: 'CREATE',
      processingResult: '1',
      makerId: '5',
      checkerId: '5',
      from: '2026-11-12T10:00',
      to: '2026-11-12T11:00',
      checkedFrom: '2026-11-13T10:00'
    });
    component.apply();
    expect(query()).toMatchObject({
      entityName: 'OFFICE',
      actionName: 'CREATE',
      processingResult: '1',
      status: '1',
      makerId: '5',
      checkerId: '5',
      makerDateTimeFrom: '2026-11-12 10:00:00',
      checkerDateTimeFrom: '2026-11-13 10:00:00',
      dateFormat: 'yyyy-MM-dd HH:mm:ss'
    });
  });
  it('blocks invalid date requests and clears all filters with one reload', () => {
    const before = service.getAuditTrails.mock.calls.length;
    component.filters.patchValue({ from: '2026-11-12T25:00' });
    component.apply();
    expect(component.invalid).toBe(true);
    expect(service.getAuditTrails).toHaveBeenCalledTimes(before);
    component.clear();
    expect(service.getAuditTrails).toHaveBeenCalledTimes(before + 1);
    expect(query().makerDateTimeFrom).toBeUndefined();
  });
  it('saves, validates, restores and deletes view-scoped named filters', () => {
    component.filters.patchValue({ entityName: 'OFFICE', makerId: '5' });
    component.presetName.setValue('Office');
    component.savePreset();
    component.clear();
    component.restore(component.presets[0]);
    expect(query().makerId).toBe('5');
    expect(component.activePreset).toBe('Office');
    component.restore({ name: 'Corrupt', filters: { ...component.filters.getRawValue(), makerId: 'undefined' } });
    expect(component.activePreset).toBe('Office');
    component.deletePreset(component.presets[0]);
    expect(component.presets).toEqual([]);
  });
  it('cancels stale selection and verifies identity before displaying details', () => {
    const old = new Subject<any>();
    const current = new Subject<any>();
    service.getAuditTrail.mockReturnValueOnce(old).mockReturnValueOnce(current);
    component.select(auditEvent(row(12)));
    component.select(auditEvent(row(13)));
    expect(old.observed).toBe(false);
    current.next(row(14));
    expect(component.detail).toBeUndefined();
    expect(component.detailError).toBe(true);
  });
  it('renders redacted submitted changes, unknown checker and missing IP', () => {
    component.select(auditEvent(row()));
    fixture.detectChanges();
    expect(component.command.json).not.toContain('SECRET');
    expect(component.detail.ip).toBe('');
    expect(fixture.nativeElement.querySelector('.submitted-fields').textContent).toContain('new');
    expect(fixture.nativeElement.querySelector('.processing-timeline').textContent).toContain(
      'auditRedesign.missingChecker'
    );
    expect(fixture.nativeElement.querySelector('.missing-ip')).toBeTruthy();
  });
  it('opens exact entity/resource history and restores original selection', () => {
    component.select(auditEvent(row()));
    component.resourceHistory();
    expect(query()).toMatchObject({ entityName: 'OFFICE', resourceId: '3' });
    component.backToEvent();
    expect(query().resourceId).toBeUndefined();
    expect(component.selected.id).toBe('12');
  });
  it('clears audit data and presets on tenant or permission change', fakeAsync(() => {
    component.select(auditEvent(row()));
    component.presetName.setValue('test');
    component.savePreset();
    settings.tenantIdentifier = 'other';
    authState.next(true);
    expect(component.rows).toEqual([]);
    expect(component.detail).toBeUndefined();
    expect(component.presets).toEqual([]);
    expect(component.canRead).toBe(false);
  }));
  it('rejects responses when permission changes before the poll', () => {
    const response = new Subject<any>();
    service.getAuditTrail.mockReturnValue(response);
    component.select(auditEvent(row()));
    credentials.permissions = [];
    response.next(row());
    expect(component.detail).toBeUndefined();
    expect(component.rows).toEqual([]);
  });
  it('cleans up pending detail requests on destruction', () => {
    const response = new Subject<any>();
    service.getAuditTrail.mockReturnValue(response);
    component.select(auditEvent(row()));
    fixture.destroy();
    expect(response.observed).toBe(false);
  });
  it('provides clipboard success only after completion and reports failures', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error()) }
    });
    component.select(auditEvent(row()));
    await component.copy();
    expect(component.feedback).toBe('copyFailed');
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
    await component.copy();
    expect(component.feedback).toBe('copied');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.not.stringContaining('SECRET'));
  });
  it('exports the complete filtered population in bounded pages', async () => {
    const create = jest.fn().mockReturnValue('blob:test');
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
    component.filters.patchValue({ entityName: 'OFFICE' });
    component.apply();
    service.getAuditTrails.mockClear();
    service.getAuditTrails
      .mockReturnValueOnce(of({ pageItems: [row(2)], totalFilteredRecords: 2 }))
      .mockReturnValueOnce(of({ pageItems: [row(1)], totalFilteredRecords: 2 }));
    await component.downloadCSV();
    expect(service.getAuditTrails.mock.calls.map((call: any) => call.slice(3))).toEqual([
      [
        0,
        200
      ],
      [
        1,
        200
      ]
    ]);
    expect(create).toHaveBeenCalledTimes(1);
    expect(component.feedback).toBe('exportDone');
    expect(query().entityName).toBe('OFFICE');
    click.mockRestore();
  });
  it.each([
    'empty',
    'changed',
    'oversize',
    'duplicate'
  ])('refuses incomplete export: %s', async (kind) => {
    const create = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
    const first = { pageItems: [row()], totalFilteredRecords: kind === 'oversize' ? 10001 : 2 };
    const second = { pageItems: kind === 'empty' ? [] : [row()], totalFilteredRecords: kind === 'changed' ? 3 : 2 };
    service.getAuditTrails.mockReturnValueOnce(of(first)).mockReturnValueOnce(of(second));
    await component.downloadCSV();
    expect(create).not.toHaveBeenCalled();
    expect(component.feedback).toBe('exportFailed');
  });
  it('does not let a cancelled export overwrite a newer export lifecycle', async () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    service.getAuditTrails.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const firstExport = component.downloadCSV();
    component.cancelExport();
    const secondExport = component.downloadCSV();
    await firstExport;
    expect(component.exporting).toBe(true);
    expect(first.observed).toBe(false);
    component.cancelExport();
    await secondExport;
    expect(second.observed).toBe(false);
    expect(component.feedback).toBe('');
  });
  it('synchronizes validated user search with maker controls and honors a new maker selection', () => {
    component.filters.patchValue({ mode: 'user', search: 'fixture' });
    component.apply();
    expect(component.filters.value.makerId).toBe('5');
    component.filters.patchValue({ makerId: '' });
    component.apply('makerId');
    expect(query().makerId).toBeUndefined();
    expect(component.filters.value.search).toBe('');
  });
  it('preserves unknown backend action and status names rather than exposing translation keys', () => {
    expect(component.label('CUSTOM_ACTION', 'actions')).toBe('CUSTOM_ACTION');
    expect(component.label('Unknown outcome', 'statuses')).toBe('Unknown outcome');
  });
});
