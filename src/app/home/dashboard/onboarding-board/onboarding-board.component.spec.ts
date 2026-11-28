/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { OnboardingTasksComponent } from './onboarding-tasks/onboarding-tasks.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { EnrollmentCase, EnrollmentCasesResponse, TasksService } from 'app/tasks/tasks.service';
import { OnboardingBoardComponent } from './onboarding-board.component';
import { environment } from 'environments/environment';

const synthetic = (id = 1): EnrollmentCase => ({
  clientId: id,
  clientName: `Synthetic client ${id}`,
  officeId: (id % 2) + 1,
  kycEvidence: { verificationId: id + 10, derivedKycStatus: 'In Review' }
});

@Component({ selector: 'mifosx-onboarding-tasks', standalone: true, template: '' })
class OnboardingTasksStubComponent {}

describe('OnboardingBoardComponent', () => {
  let fixture: ComponentFixture<OnboardingBoardComponent>;
  let component: OnboardingBoardComponent;
  let getEnrollmentCases: jest.Mock;
  let permissions: string[];
  let settings: { server: string; tenantIdentifier: string };
  const rbac = environment.productionModeEnableRBAC;
  const pipelineFlag = environment.enableEnrollmentPipeline;

  beforeEach(async () => {
    environment.productionModeEnableRBAC = true;
    environment.enableEnrollmentPipeline = true;
    permissions = ['ALL_FUNCTIONS'];
    settings = { server: 'synthetic-server', tenantIdentifier: 'tenant-a' };
    getEnrollmentCases = jest.fn((params) =>
      of({ totalFilteredRecords: 1, pageItems: [synthetic(params.clientId ?? 1)] })
    );
    await TestBed.configureTestingModule({
      imports: [
        OnboardingBoardComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: TasksService, useValue: { getEnrollmentCases } },
        { provide: SettingsService, useValue: settings },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ userId: 1, permissions }) } }
      ]
    })
      .overrideComponent(OnboardingBoardComponent, {
        remove: { imports: [OnboardingTasksComponent] },
        add: { imports: [OnboardingTasksStubComponent] }
      })
      .compileComponents();
  });
  afterEach(() => {
    environment.productionModeEnableRBAC = rbac;
    environment.enableEnrollmentPipeline = pipelineFlag;
  });
  function create(open = true) {
    fixture = TestBed.createComponent(OnboardingBoardComponent);
    component = fixture.componentInstance;
    component.offices = [
      { id: 1, name: 'Central' },
      { id: 2, name: 'East' }
    ];
    fixture.detectChanges();
    if (open) component.openPipeline();
    fixture.detectChanges();
  }

  it('renders six independent stages, one scoped count and a source-qualified summary', () => {
    create();
    expect(fixture.nativeElement.querySelectorAll('.stage-number')).toHaveLength(6);
    expect(fixture.nativeElement.querySelectorAll('.summary-card')).toHaveLength(1);
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('.summary-card strong')).map((x: HTMLElement) =>
        x.textContent?.trim()
      )
    ).toEqual(['1']);
    expect(fixture.nativeElement.querySelector('.traceability').textContent).toContain('onboardingPipeline.historyGap');
    expect(component.detail?.clientId).toBe(1);
    expect(component.attention).toHaveLength(1);
  });

  it.each([
    { allowed: ['READ_CLIENT'] },
    { allowed: ['READ_ENROLLMENT_STATUS'] },
    { allowed: [] }
  ])('requires both read permissions: $allowed', ({ allowed }) => {
    permissions = allowed;
    create();
    expect(component.canRead).toBe(false);
    expect(getEnrollmentCases).not.toHaveBeenCalled();
  });

  it.each([
    'ALL_FUNCTIONS',
    'ALL_FUNCTIONS_READ'
  ])('accepts %s without granting note writes', (permission) => {
    permissions = [permission];
    create();
    expect(component.canRead).toBe(true);
    expect(!!component.clientRoute(component.rows[0], true)).toBe(permission === 'ALL_FUNCTIONS');
  });

  it('permits the exact pair of read permissions', () => {
    permissions = [
      'READ_CLIENT',
      'READ_ENROLLMENT_STATUS'
    ];
    create();
    expect(component.canRead).toBe(true);
    expect(component.clientRoute(component.rows[0], true)).toBeNull();
  });

  it('still respects a backend denial when frontend RBAC is disabled', () => {
    environment.productionModeEnableRBAC = false;
    permissions = [];
    getEnrollmentCases.mockReturnValue(throwError(() => ({ status: 403 })));
    create();
    expect(component.error).toBe('onboardingPipeline.forbidden');
    expect(component.rows).toEqual([]);
  });

  it('keeps tasks visible without requesting an optional endpoint when the feature is disabled', () => {
    environment.enableEnrollmentPipeline = false;
    create();
    expect(fixture.nativeElement.querySelector('mifosx-onboarding-tasks')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.consultation-panel')).toBeNull();
    expect(getEnrollmentCases).not.toHaveBeenCalled();
  });

  it('recreates the task list on tenant changes to clear old tasks and subscriptions', () => {
    create(false);
    const before = fixture.debugElement.query(By.directive(OnboardingTasksStubComponent)).componentInstance;
    settings.tenantIdentifier = 'tenant-b';
    fixture.detectChanges();
    const after = fixture.debugElement.query(By.directive(OnboardingTasksStubComponent)).componentInstance;
    expect(after).not.toBe(before);
    expect(getEnrollmentCases).not.toHaveBeenCalled();
  });

  it('waits for the enabled consultation to be opened before querying enrollment', () => {
    create(false);
    expect(getEnrollmentCases).not.toHaveBeenCalled();
    expect(component.error).toBe('');
    component.openPipeline();
    expect(getEnrollmentCases).toHaveBeenCalledTimes(2);
    component.openPipeline();
    expect(getEnrollmentCases).toHaveBeenCalledTimes(2);
  });

  it('applies the same search again after a tenant scope change', fakeAsync(() => {
    getEnrollmentCases.mockImplementation((params) =>
      of({ totalFilteredRecords: params.clientId ? 1 : 2, pageItems: params.clientId ? [synthetic(params.clientId)] : [
              synthetic(1),
              synthetic(2)
            ] })
    );
    create();
    component.search.setValue('2');
    tick(300);
    expect(component.filteredRows.map((row) => row.clientId)).toEqual([2]);
    settings.tenantIdentifier = 'tenant-b';
    fixture.detectChanges();
    expect(component.search.value).toBe('');
    expect(component.filteredRows).toHaveLength(2);
    component.search.setValue('2');
    tick(300);
    expect(component.filteredRows.map((row) => row.clientId)).toEqual([2]);
    expect(component.selected?.clientId).toBe(2);
  }));

  it('uses only supported endpoint parameters', () => {
    create();
    expect(getEnrollmentCases.mock.calls[0][0]).toEqual({ view: 'enrollment', offset: 0, limit: 10 });
    expect(getEnrollmentCases.mock.calls[1][0]).toEqual({ view: 'enrollment', clientId: 1, offset: 0, limit: 1 });
  });

  it('debounces page-scoped search and synchronizes counts, selection and attention', fakeAsync(() => {
    getEnrollmentCases.mockImplementation((params) =>
      of({ totalFilteredRecords: params.clientId ? 1 : 2, pageItems: params.clientId ? [synthetic(params.clientId)] : [
              synthetic(1),
              synthetic(2)
            ] })
    );
    create();
    const calls = getEnrollmentCases.mock.calls.length;
    component.search.setValue('client 2');
    expect(component.selected).toBeNull();
    tick(299);
    expect(component.filteredRows).toHaveLength(2);
    tick(1);
    fixture.detectChanges();
    expect(component.filteredRows.map((row) => row.clientId)).toEqual([2]);
    expect(component.selected?.clientId).toBe(2);
    expect(component.attention.map((row) => row.clientId)).toEqual([2]);
    expect(getEnrollmentCases.mock.calls.length).toBe(calls + 1); // detail only; no unsupported q parameter
    component.search.setValue('absent');
    tick(300);
    expect(component.selected).toBeNull();
    expect(component.attention).toEqual([]);
  }));

  it.each([
    false,
    true
  ])('preserves selection when a page arrives before the search debounce (detail resolved: %s)', (resolveDetail) => {
    fakeAsync(() => {
      const page = new Subject<EnrollmentCasesResponse>();
      const detail = new Subject<EnrollmentCasesResponse>();
      getEnrollmentCases.mockImplementation((params) =>
        params.clientId === 2 ? detail : params.clientId ? of({ pageItems: [synthetic(params.clientId)] }) : page
      );
      create();
      component.search.setValue('client');
      tick(100);
      page.next({ totalFilteredRecords: 2, pageItems: [
          synthetic(1),
          synthetic(2)
        ] });
      component.select(component.filteredRows[1]);
      const selected = component.selected;
      if (resolveDetail) {
        detail.next({ pageItems: [synthetic(2)] });
        detail.complete();
      }
      const requestCount = getEnrollmentCases.mock.calls.length;
      tick(200);
      fixture.detectChanges();
      expect(component.selected).toBe(selected);
      expect(getEnrollmentCases).toHaveBeenCalledTimes(requestCount);
      if (resolveDetail) {
        expect(component.detail?.clientId).toBe(2);
        expect(component.detailLoading).toBe(false);
      } else {
        expect(detail.observed).toBe(true);
        expect(component.detailLoading).toBe(true);
        detail.next({ pageItems: [synthetic(2)] });
        expect(component.detail?.clientId).toBe(2);
        detail.complete();
      }
      page.complete();
    })();
  });

  it('filters branches by resolver identity on the loaded page', fakeAsync(() => {
    create();
    component.office.setValue(1);
    tick();
    expect(component.filteredRows).toEqual([]);
    component.office.setValue(2);
    tick();
    expect(component.filteredRows).toHaveLength(1);
    component.office.setValue(999);
    tick();
    expect(component.filteredRows).toHaveLength(0);
    expect(getEnrollmentCases.mock.calls.every(([params]) => !('officeId' in params))).toBe(true);
  }));

  it('clears detail immediately and cancels stale client selections', () => {
    const first = new Subject<EnrollmentCasesResponse>(),
      second = new Subject<EnrollmentCasesResponse>();
    getEnrollmentCases.mockImplementation((params) =>
      params.clientId === 1
        ? first
        : params.clientId === 2
          ? second
          : of({ totalFilteredRecords: 2, pageItems: [
                synthetic(1),
                synthetic(2)
              ] })
    );
    create();
    expect(component.detailLoading).toBe(true);
    component.select(component.rows[1]);
    expect(first.observed).toBe(false);
    expect(component.detail).toBeNull();
    first.next({ pageItems: [synthetic(1)] });
    second.next({ pageItems: [synthetic(2)] });
    fixture.detectChanges();
    expect(component.detail?.clientId).toBe(2);
  });

  it('rejects details for a different client and supports retry', () => {
    getEnrollmentCases.mockImplementation((params) =>
      of({ totalFilteredRecords: 1, pageItems: [synthetic(params.clientId ? 99 : 1)] })
    );
    create();
    expect(component.detail).toBeNull();
    expect(component.detailError).toBe('onboardingPipeline.error');
    getEnrollmentCases.mockReturnValue(of({ pageItems: [synthetic(1)] }));
    component.retryDetail();
    expect(component.detail?.clientId).toBe(1);
  });

  it.each([
    401,
    403,
    404,
    500
  ])('renders a safe error for HTTP %s', (status) => {
    getEnrollmentCases.mockReturnValue(throwError(() => ({ status })));
    create();
    expect(component.rows).toEqual([]);
    expect(component.loaded).toBe(false);
    expect(component.error).toBe(
      status === 401 || status === 403
        ? 'onboardingPipeline.forbidden'
        : status === 404
          ? 'onboardingPipeline.notSupported'
          : 'onboardingPipeline.error'
    );
  });

  it.each([
    null,
    {},
    { pageItems: null },
    { pageItems: [] },
    { pageItems: [], totalFilteredRecords: 2 },
    { pageItems: [synthetic()], totalFilteredRecords: 0 },
    { pageItems: [synthetic()], totalFilteredRecords: -1 },
    { totalFilteredRecords: 1, pageItems: [{ clientId: 'invalid' }] }
  ])('rejects malformed or contradictory success %j', (response) => {
    getEnrollmentCases.mockReturnValue(of(response));
    create();
    expect(component.loaded).toBe(false);
    expect(component.rows).toEqual([]);
    expect(component.error).toBeTruthy();
  });

  it('handles an actual empty authorized scope without claiming healthy aging', () => {
    getEnrollmentCases.mockReturnValue(of({ totalFilteredRecords: 0, pageItems: [] }));
    create();
    expect(component.loaded).toBe(true);
    expect(component.total).toBe(0);
    expect(fixture.nativeElement.querySelector('.matrix-card').textContent).toContain('onboardingPipeline.empty');
    expect(fixture.nativeElement.querySelectorAll('.summary-card strong')).toHaveLength(1);
  });

  it('counts unique clients only within the displayed page', () => {
    getEnrollmentCases.mockImplementation((params) =>
      of({ totalFilteredRecords: params.clientId ? 1 : 50, pageItems: params.clientId ? [synthetic()] : [
              synthetic(),
              synthetic()
            ] })
    );
    create();
    expect(component.rows).toHaveLength(1);
    expect(component.total).toBe(50);
    expect(fixture.nativeElement.querySelector('.summary-card strong').textContent).toContain('1');
  });

  it('recovers an out-of-range page when the authorized scope shrinks', () => {
    create();
    getEnrollmentCases.mockImplementation((params) =>
      of({ totalFilteredRecords: 11, pageItems: params.offset === 20 ? [] : [synthetic(11)] })
    );
    component.changePage({ pageIndex: 2, pageSize: 10, length: 21 });
    expect(component.pageIndex).toBe(1);
    expect(component.rows[0].clientId).toBe(11);
    expect(component.total).toBe(11);
    expect(component.loading).toBe(false);
  });

  it('cancels stale list refreshes', () => {
    const pending = new Subject<EnrollmentCasesResponse>();
    getEnrollmentCases.mockReturnValue(pending);
    create();
    getEnrollmentCases.mockReturnValue(of({ pageItems: [], totalFilteredRecords: 0 }));
    component.refresh();
    expect(pending.observed).toBe(false);
    pending.next({ pageItems: [synthetic(99)], totalFilteredRecords: 1 });
    expect(component.rows).toEqual([]);
  });

  it('discards in-flight and rendered data after a tenant or permission change', () => {
    create();
    const row = component.rows[0];
    const pending = new Subject<EnrollmentCasesResponse>();
    getEnrollmentCases.mockReturnValue(pending);
    component.refresh();
    settings.tenantIdentifier = 'tenant-b';
    permissions = [];
    fixture.detectChanges();
    expect(pending.observed).toBe(false);
    expect(component.rows).toEqual([]);
    expect(component.detail).toBeNull();
    expect(component.canRead).toBe(false);
    expect(component.clientRoute(row)).toBeNull();
  });

  it('only links notes with client-note read and create permissions', () => {
    permissions = [
      'READ_CLIENT',
      'READ_ENROLLMENT_STATUS',
      'READ_CLIENTNOTE',
      'CREATE_CLIENTNOTE'
    ];
    create();
    expect(component.clientRoute(component.rows[0], true)).toEqual([
      '/clients',
      1,
      'notes'
    ]);
    expect(fixture.nativeElement.querySelector('.actions a:last-of-type').getAttribute('href')).toContain(
      '/clients/1/notes'
    );
  });

  it('omits unsupported review and notification actions', () => {
    create();
    const buttons = fixture.nativeElement.querySelectorAll('.actions button');
    expect(buttons).toHaveLength(0);
  });

  it('cleans up list and detail subscriptions on destroy', () => {
    const pending = new Subject<EnrollmentCasesResponse>();
    getEnrollmentCases.mockReturnValue(pending);
    create();
    fixture.destroy();
    expect(pending.observed).toBe(false);
  });
});
