/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { PendingProspectsResponse, TasksService } from '../../tasks.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { PendingProspectsComponent } from './pending-prospects.component';

describe('PendingProspectsComponent', () => {
  let component: PendingProspectsComponent;
  let fixture: ComponentFixture<PendingProspectsComponent>;
  let tasksService: jest.Mocked<TasksService>;
  let routerNavigate: jest.SpyInstance;

  const page: PendingProspectsResponse = {
    totalFilteredRecords: 2,
    pageItems: [
      {
        prospectId: 1,
        externalRef: 'EXT-1',
        displayName: 'Acme Prospect',
        clientId: 42,
        registrationStatus: 'IN_PROGRESS',
        createdAt: '2026-01-01',
        lastUpdatedAt: '2026-01-02',
        currentStage: 'COMMERCIAL_REGISTRATION',
        lastCompletedStage: 'KYC_LEVEL_1',
        stoppedAtStage: 'UNKNOWN',
        pendingCreditCount: 0
      },
      {
        prospectId: 2,
        displayName: 'Pre Client Prospect',
        registrationStatus: 'PENDING',
        currentStage: null as any,
        pendingCreditCount: 3
      }
    ]
  };

  function createComponent(pendingProspectsResponse = of(page)) {
    TestBed.resetTestingModule();
    tasksService = {
      getPendingProspects: jest.fn(() => pendingProspectsResponse)
    } as any;

    TestBed.configureTestingModule({
      imports: [
        PendingProspectsComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [
                'READ_PROSPECT',
                'READ_CLIENT'
              ] }) } },
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`,
            isAfter: (date1: Date, date2: Date) => date1.getTime() > date2.getTime(),
            angularToMomentFormat: () => 'YYYY-MM-DD',
            getMomentLocale: () => 'en'
          }
        },
        { provide: SettingsService, useValue: { dateFormat: 'yyyy-MM-dd', language: { code: 'en' } } },
        { provide: TasksService, useValue: tasksService },
        provideNativeDateAdapter(),
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(PendingProspectsComponent);
    component = fixture.componentInstance;
    routerNavigate = jest.spyOn((component as any).router, 'navigate');
    fixture.detectChanges();
  }

  beforeEach(() => {
    createComponent();
    tasksService.getPendingProspects.mockClear();
  });

  it('loads pending prospects on init with default server paging and sorting', () => {
    createComponent();

    expect(tasksService.getPendingProspects).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 0,
        limit: 10,
        orderBy: 'lastUpdatedAt',
        sortOrder: 'DESC'
      })
    );
    expect(component.dataSource.data).toHaveLength(2);
    expect(component.totalFilteredRecords).toBe(2);
  });

  it('applies filters with ISO dates and resets pagination', () => {
    component.pageIndex = 2;
    component.pendingProspectsForm.patchValue({
      createdFrom: new Date(2026, 0, 1),
      createdTo: new Date(2026, 0, 31),
      registrationStatus: 'IN_PROGRESS'
    });

    component.applyFilters();

    expect(component.pageIndex).toBe(0);
    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({
        createdFrom: '2026-01-01',
        createdTo: '2026-01-31',
        registrationStatus: 'IN_PROGRESS',
        offset: 0
      })
    );
  });

  it('blocks invalid reversed date range', () => {
    component.pendingProspectsForm.patchValue({
      createdFrom: new Date(2026, 0, 31),
      createdTo: new Date(2026, 0, 1)
    });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.From Date cannot be after To Date');
    expect(tasksService.getPendingProspects).not.toHaveBeenCalled();
  });

  it('preserves filters when changing pages', () => {
    component.pendingProspectsForm.patchValue({ registrationStatus: 'PENDING' });
    component.applyFilters();
    tasksService.getPendingProspects.mockClear();

    component.changePaging({ pageIndex: 2, pageSize: 25, length: 100 });

    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({
        registrationStatus: 'PENDING',
        offset: 50,
        limit: 25
      })
    );
  });

  it('uses backend sort fields and resets pagination', () => {
    component.pageIndex = 3;

    component.sortData({ active: 'createdAt', direction: 'asc' });

    expect(component.pageIndex).toBe(0);
    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({
        orderBy: 'createdAt',
        sortOrder: 'ASC',
        offset: 0
      })
    );
  });

  it('falls back to default sorting for unsupported sort fields', () => {
    component.sortData({ active: 'unsupported', direction: 'asc' });

    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({
        orderBy: 'lastUpdatedAt',
        sortOrder: 'ASC'
      })
    );
  });

  it('shows loading, empty, and error states', () => {
    const pendingResponse = new Subject<PendingProspectsResponse>();
    createComponent(pendingResponse.asObservable());

    expect(component.loading).toBe(true);
    pendingResponse.next({ totalFilteredRecords: 0, pageItems: [] });
    pendingResponse.complete();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('labels.text.No pending prospects found');

    createComponent(throwError(() => new Error('failed')));
    expect(component.loadError).toBe('labels.text.Unable to load pending prospects');
    expect(component.dataSource.data).toEqual([]);
  });

  it('renders UNKNOWN and null stages as Unknown and formats stage codes', () => {
    expect(component.stageLabel('UNKNOWN')).toBe('pendingProspects.stageUnavailable');
    expect(component.stageLabel(null as any)).toBe('pendingProspects.stageUnavailable');
    expect(component.stageLabel('COMMERCIAL_REGISTRATION')).toBe('Commercial Registration');
    expect(component.stageLabel('KYC_LEVEL_1')).toBe('KYC Level 1');
  });

  it('displays pending credit count exactly as returned with zero visible', () => {
    expect(component.pendingCreditCount({ pendingCreditCount: 0 })).toBe(0);
    expect(component.pendingCreditCount({ pendingCreditCount: 3 })).toBe(3);
  });

  it('only navigates to a client when clientId exists', () => {
    component.viewClient({ clientId: 42 });
    expect(routerNavigate).toHaveBeenCalledWith([
      '/clients',
      42,
      'general'
    ]);

    routerNavigate.mockClear();
    component.viewClient({});
    expect(routerNavigate).not.toHaveBeenCalled();
    expect(component.hasClientLink({})).toBe(false);
  });
  it('renders exactly the story filters and Advanced Search', () => {
    expect(fixture.nativeElement.querySelector('[formControlName="createdFrom"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[formControlName="createdTo"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[formControlName="registrationStatus"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[formControlName="q"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('labels.buttons.Advanced Search');
    expect(fixture.nativeElement.textContent).toContain('pendingProspects.pendingStep');
  });

  it.each([
    'createdFrom',
    'createdTo'
  ] as const)('supports a single %s boundary', (field) => {
    component.pendingProspectsForm.controls[field].setValue(new Date(2026, 8, 12));
    component.applyFilters();
    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({ [field]: '2026-09-12' })
    );
  });

  it('accepts a same-day interval and serializes the local calendar without timezone conversion', () => {
    component.pendingProspectsForm.patchValue({
      createdFrom: new Date(2026, 8, 12, 0, 1),
      createdTo: new Date(2026, 8, 12, 23, 59)
    });
    component.applyFilters();
    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({ createdFrom: '2026-09-12', createdTo: '2026-09-12' })
    );
  });

  it('blocks invalid date values and datepicker parse errors', () => {
    component.pendingProspectsForm.controls.createdFrom.setValue(new Date('invalid'));
    component.applyFilters();
    expect(component.filterError).toBe('pendingProspects.invalidDate');
    expect(tasksService.getPendingProspects).not.toHaveBeenCalled();
    component.pendingProspectsForm.reset();
    component.pendingProspectsForm.controls.createdFrom.setErrors({ matDatepickerParse: true });
    component.applyFilters();
    expect(tasksService.getPendingProspects).not.toHaveBeenCalled();
  });

  it('rejects a status outside the verified registration domain', () => {
    component.pendingProspectsForm.controls.registrationStatus.setValue('ACTIVE');
    component.applyFilters();
    expect(component.filterError).toBe('pendingProspects.invalidFilters');
    expect(tasksService.getPendingProspects).not.toHaveBeenCalled();
  });

  it('clears status and dates, resets paging and loads unfiltered results', () => {
    component.pendingProspectsForm.patchValue({
      registrationStatus: 'IN_PROGRESS',
      createdFrom: new Date(2026, 8, 12)
    });
    component.applyFilters();
    component.pageIndex = 2;
    component.clearFilters();
    const query = tasksService.getPendingProspects.mock.calls.at(-1)[0];
    expect(query.registrationStatus).toBeUndefined();
    expect(query.createdFrom).toBeUndefined();
    expect(query.offset).toBe(0);
  });

  it('uses only submitted filters when paging after the form has been edited', () => {
    component.pendingProspectsForm.controls.registrationStatus.setValue('PENDING');
    component.applyFilters();
    component.pendingProspectsForm.controls.registrationStatus.setValue('REJECTED');
    component.changePaging({ pageIndex: 1, pageSize: 10, length: 30 });
    expect(tasksService.getPendingProspects).toHaveBeenLastCalledWith(
      expect.objectContaining({ registrationStatus: 'PENDING', offset: 10 })
    );
  });

  it('cancels stale searches so older results cannot overwrite a newer query', () => {
    const old = new Subject<PendingProspectsResponse>();
    const newer = new Subject<PendingProspectsResponse>();
    tasksService.getPendingProspects.mockReturnValueOnce(old).mockReturnValueOnce(newer);
    component.applyFilters();
    component.pendingProspectsForm.controls.registrationStatus.setValue('IN_PROGRESS');
    component.applyFilters();
    newer.next(page);
    old.next({ totalFilteredRecords: 1, pageItems: [{ displayName: 'Stale' }] });
    expect(component.dataSource.data).toEqual(page.pageItems);
    expect(component.totalFilteredRecords).toBe(2);
  });

  it('keeps unknown-stage records and prospect records without a client or loan', () => {
    expect(component.dataSource.data).toHaveLength(2);
    expect(component.pendingStepLabel({ registrationStatus: 'PENDING' })).toBe('pendingProspects.stepUnavailable');
    expect(component.progress({ registrationStatus: 'COMPLETED' }).currentStage).toBeUndefined();
    expect(
      component.progress({
        currentStage: 'KYC_LEVEL_1',
        lastCompletedStage: 'COMMERCIAL_REGISTRATION',
        stoppedAtStage: 'KYC_LEVEL_1'
      })
    ).toEqual({
      currentStage: 'KYC_LEVEL_1',
      lastCompletedStage: 'COMMERCIAL_REGISTRATION',
      pendingStep: 'KYC_LEVEL_1'
    });
  });

  it('shows the searched UTC registration date rather than shifting it into another date', () => {
    expect(component.registrationDate({ createdAt: '2026-09-12T23:59:59Z' })).toBe('2026-09-12');
  });

  it.each([
    [
      403,
      'pendingProspects.permissionDenied'
    ],
    [
      400,
      'pendingProspects.invalidFilters'
    ],
    [
      0,
      'labels.text.Unable to load pending prospects'
    ]
  ])('distinguishes HTTP %s errors from empty results', (status, message) => {
    tasksService.getPendingProspects.mockReturnValue(
      throwError(() => ({ status, error: { developerMessage: 'SQL details' } }))
    );
    component.applyFilters();
    fixture.detectChanges();
    expect(component.loadError).toBe(message);
    expect(fixture.nativeElement.textContent).not.toContain('labels.text.No pending prospects found');
    expect(fixture.nativeElement.textContent).not.toContain('SQL details');
  });

  it('times out a search and leaves a recoverable error state', () => {
    jest.useFakeTimers();
    const pending = new Subject<PendingProspectsResponse>();
    tasksService.getPendingProspects.mockReturnValue(pending);
    component.applyFilters();
    expect(component.loading).toBe(true);
    jest.advanceTimersByTime(30001);
    expect(component.loading).toBe(false);
    expect(component.loadError).toBe('pendingProspects.timeout');
    jest.useRealTimers();
  });

  it('requires client read permission for record navigation', () => {
    const previous = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = true;
    jest
      .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
      .mockReturnValue({ permissions: ['READ_PROSPECT'] } as never);
    component.viewClient({ clientId: 42 });
    expect(routerNavigate).not.toHaveBeenCalled();
    environment.productionModeEnableRBAC = previous;
  });
});
