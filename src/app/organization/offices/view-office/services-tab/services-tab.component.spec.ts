/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash, faExchange, faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ServicesTabComponent } from './services-tab.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OfficeDetailsSummary } from '../office-details-summary';
import { environment } from '../../../../../environments/environment';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { OrganizationService } from 'app/organization/organization.service';

describe('Office ServicesTabComponent', () => {
  let component: ServicesTabComponent;
  let fixture: ComponentFixture<ServicesTabComponent>;
  let organizationService: jest.Mocked<OrganizationService>;
  let dialog: jest.Mocked<MatDialog>;

  let officeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let permissions: string[];

  const officeService = {
    officeServiceId: 7,
    officeId: 1,
    serviceName: 'Cash Deposit',
    serviceExternalId: 'cash-deposit',
    workingHours: '09:00-17:00'
  };

  function dialogRefWithValue(value: any) {
    return {
      afterClosed: () => of({ data: { value } })
    } as any;
  }

  function dialogRefWithDelete() {
    return {
      afterClosed: () => of({ delete: true })
    } as any;
  }

  function endpointNotFoundError() {
    return {
      status: 404,
      error: {
        error: 'Not Found',
        path: '/fineract-provider/api/v2/offices/1/services'
      }
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    officeParams = new BehaviorSubject(convertToParamMap({ officeId: '1' }));
    permissions = ['ALL_FUNCTIONS'];

    organizationService = {
      getOfficeSchedules: jest.fn(() =>
        of({
          officeId: 1,
          days: [
            { weekday: 'MONDAY', enabled: true, openingTime: '08:00', closingTime: '18:00' },
            { weekday: 'SUNDAY', enabled: false }
          ]
        })
      ),
      getOfficeServices: jest.fn(() => of([officeService])),
      createOfficeService: jest.fn(() => of({ entityId: 10 })),
      updateOfficeService: jest.fn(() => of({ entityId: 7 })),
      deleteOfficeService: jest.fn(() => of({ entityId: 7 }))
    } as unknown as jest.Mocked<OrganizationService>;

    dialog = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [
        ServicesTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              paramMap: officeParams,
              snapshot: {
                data: { office: { name: 'Test branch' } },
                paramMap: {
                  get: jest.fn(() => '1')
                }
              }
            }
          }
        },
        { provide: OrganizationService, useValue: organizationService },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        OfficeDetailsSummary,
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faEdit, faTrash, faExchange, faSearch);
    fixture = TestBed.createComponent(ServicesTabComponent);
    component = fixture.componentInstance;
  });

  it('shows actual service working hours without management controls in the summary', () => {
    component.readOnly = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cash Deposit');
    expect(fixture.nativeElement.textContent).toContain('09:00-17:00');
    expect(fixture.nativeElement.querySelectorAll('button')).toHaveLength(0);
    component.addService();
    component.editService(officeService);
    component.deleteService(officeService);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it.each([
    '9-5',
    '09:00-17:00, 18:00-20:00',
    '22:00-06:00',
    '24:00-25:00',
    '09:60-17:00',
    '',
    null
  ])('keeps unsupported service hours as text without a timeline: %s', (value) => {
    expect(component.getDailyInterval(value)).toBeNull();
  });

  it('renders a daily timeline only for a single explicit increasing interval', () => {
    const interval = component.getDailyInterval('09:00 – 17:30');
    expect(interval.start).toBe(9 * 3600);
    expect(interval.end).toBe(17.5 * 3600);
    component.readOnly = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.daily-timeline')).not.toBeNull();
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(1);
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
  });

  it('loads and renders office services', () => {
    fixture.detectChanges();

    expect(organizationService.getOfficeServices).toHaveBeenCalledWith('1');
    expect(component.officeServices).toEqual([officeService]);
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Cash Deposit');
    expect(fixture.nativeElement.textContent).toContain('cash-deposit');
    expect(fixture.nativeElement.textContent).toContain('09:00-17:00');
  });

  it('shows an empty state when the office has no services', () => {
    organizationService.getOfficeServices.mockReturnValue(of([]));

    fixture.detectChanges();

    expect(component.officeServices).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No data found');
  });

  it('shows plugin unavailable state when the office services endpoint is not registered', () => {
    organizationService.getOfficeServices.mockReturnValue(throwError(() => endpointNotFoundError()));

    fixture.detectChanges();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeServices).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(
      'labels.text.Office Services management requires the Savings Plugin to be deployed'
    );
  });

  it('shows an error state when office services loading fails for non-404 errors', () => {
    organizationService.getOfficeServices.mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isPluginUnavailable).toBe(false);
    expect(component.officeServices).toEqual([]);
  });

  it('does not open dialogs or call service endpoints when the plugin is unavailable', () => {
    component.isPluginUnavailable = true;

    component.addService();
    component.editService(officeService);
    component.deleteService(officeService);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.createOfficeService).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('creates an office service through the plugin endpoint service method', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'ATM',
        serviceExternalId: 'atm',
        workingHours: '24 hours'
      })
    );

    component.addService();

    expect(organizationService.createOfficeService).toHaveBeenCalledWith('1', {
      serviceName: 'ATM',
      serviceExternalId: 'atm',
      workingHours: '24 hours'
    });
  });

  it('updates an existing office service by office service id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'Updated Cash Deposit',
        serviceExternalId: 'updated-cash-deposit',
        workingHours: '10:00-16:00'
      })
    );

    component.editService(officeService);

    expect(organizationService.updateOfficeService).toHaveBeenCalledWith('1', '7', {
      serviceName: 'Updated Cash Deposit',
      serviceExternalId: 'updated-cash-deposit',
      workingHours: '10:00-16:00'
    });
  });

  it('deletes an existing office service by office service id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithDelete());

    component.deleteService(officeService);

    expect(organizationService.deleteOfficeService).toHaveBeenCalledWith('1', '7');
  });

  it('handles office services without ids without throwing', () => {
    const serviceWithoutId: any = {
      ...officeService,
      officeServiceId: undefined,
      id: undefined,
      serviceId: undefined
    };

    fixture.detectChanges();
    dialog.open.mockClear();

    expect(component.getOfficeServiceId(serviceWithoutId)).toBe('');
    expect(component.getOfficeServiceId(serviceWithoutId, 3)).toBe('office-service-3');
    expect(() => component.editService(serviceWithoutId)).not.toThrow();
    expect(() => component.deleteService(serviceWithoutId)).not.toThrow();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('shows plugin unavailable state when create returns endpoint not found', () => {
    fixture.detectChanges();
    organizationService.createOfficeService.mockReturnValue(throwError(() => endpointNotFoundError()));
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'ATM',
        serviceExternalId: 'atm',
        workingHours: '24 hours'
      })
    );

    component.addService();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeServices).toEqual([officeService]);
  });

  it('keeps the catalog honest and the full workspace separate from the summary', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.services-dashboard')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.catalog-unavailable').textContent).toContain(
      'branchServices.catalogUnavailable'
    );
    expect(fixture.nativeElement.querySelector('.services-sidebar').querySelectorAll('a, button')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.add-service')).not.toBeNull();
    expect(organizationService.getOfficeSchedules).toHaveBeenCalledWith('1');
    expect(fixture.nativeElement.querySelector('.coverage-context').textContent).toContain('branchServices.timezone');
    expect(fixture.nativeElement.querySelectorAll('.current-time, .weekday-badge')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.coverage-note').textContent).toContain('branchServices.verification');
  });

  it('does not fetch schedules or render the dashboard in the General summary', () => {
    component.readOnly = true;
    fixture.detectChanges();
    expect(organizationService.getOfficeSchedules).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.services-dashboard')).toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it.each([
    'cash',
    'CASH',
    'deposit',
    'CASH-DEPOSIT',
    '09:00'
  ])('filters locally by name, ID and hours: %s', (query) => {
    fixture.detectChanges();
    component.search.setValue(query);
    expect(component.filteredServices).toEqual([officeService]);
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(OfficeDetailsSummary).serviceCount()).toBe(1);
  });

  it('normalizes accents, handles no matches and resets without changing total counts', () => {
    organizationService.getOfficeServices.mockReturnValue(of([{ ...officeService, serviceName: 'Dépósitos' }]));
    fixture.detectChanges();
    component.search.setValue('DEPOSITOS');
    expect(component.filteredServices).toHaveLength(1);
    component.search.setValue('missing');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(component.filteredServices).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('branchServices.noMatches');
    expect(TestBed.inject(OfficeDetailsSummary).serviceCount()).toBe(1);
    component.search.setValue('');
    expect(component.filteredServices).toHaveLength(1);
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(1);
  });

  it('renders missing names and hours without inventing descriptions or daily bars', () => {
    organizationService.getOfficeServices.mockReturnValue(of([{ id: 3 }]));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('labels.inputs.Not Provided');
    expect(fixture.nativeElement.textContent).toContain('branchServices.hoursUnavailable');
    expect(component.timedServices).toHaveLength(0);
    expect(component.duration(undefined)).toBe('');
    expect(TestBed.inject(OfficeDetailsSummary).serviceCount()).toBe(1);
  });

  it('positions actual intervals against the shared 06:00–22:00 axis', () => {
    fixture.detectChanges();
    expect(component.axisTicks).toHaveLength(9);
    expect(component.barPosition(component.branchInterval)).toEqual({ start: 12.5, width: 62.5 });
    expect(component.barPosition(component.getDailyInterval(officeService.workingHours))).toEqual({
      start: 18.75,
      width: 50
    });
    expect(component.duration('09:00–17:30')).toBe('8 hr 30 min');
  });

  it('extends the axis for early and late hours without clipping seconds', () => {
    organizationService.getOfficeServices.mockReturnValue(of([{ id: 1, workingHours: '00:15:05–23:59:59' }]));
    fixture.detectChanges();
    expect(component.axisStart).toBe(0);
    expect(component.axisEnd).toBe(86400);
    const interval = component.getDailyInterval('00:15:05–23:59:59');
    expect(interval.start).toBe(905);
    expect(interval.end).toBe(86399);
    expect(component.barPosition(interval).width).toBeCloseTo((86399 - 905) / 864);
    expect(component.duration('08:00:05–08:00:10')).toBe('0 hr 5 sec');
  });

  it('includes branch hours in the dynamic axis and distinguishes closed from unconfigured days', () => {
    organizationService.getOfficeSchedules.mockReturnValue(
      of({
        days: [
          { weekday: 'MONDAY', enabled: true, openingTime: [
              4,
              30,
              5
            ], closingTime: [
              23,
              30,
              0
            ] },
          { weekday: 'SUNDAY', enabled: false }
        ]
      })
    );
    fixture.detectChanges();
    expect(component.axisStart).toBe(4 * 3600);
    expect(component.axisEnd).toBe(86400);
    expect(component.branchHours).toBe('04:30:05 – 23:30');
    component.selectedWeekday.setValue('SUNDAY');
    expect(component.branchDay.enabled).toBe(false);
    expect(component.branchInterval).toBeNull();
    component.selectedWeekday.setValue('TUESDAY');
    expect(component.branchDay).toBeUndefined();
    expect(component.branchInterval).toBeNull();
  });

  it.each([
    { days: [{ weekday: 'MONDAY', enabled: true, openingTime: '18:00', closingTime: '08:00' }] },
    { days: [{ weekday: 'MONDAY', enabled: true, openingTime: 'broken', closingTime: '18:00' }] },
    { days: [{ weekday: 'INVALID', enabled: false }] },
    { days: [{ weekday: 'MONDAY', enabled: 'true' }] },
    {
      days: [
        { weekday: 'MONDAY', enabled: false },
        { weekday: 'MONDAY', enabled: false }
      ]
    },
    { officeId: 2, days: [] },
    {}
  ])('rejects malformed schedules without affecting services: %j', (response) => {
    organizationService.getOfficeSchedules.mockReturnValue(of(response));
    fixture.detectChanges();
    expect(component.scheduleState).toBe('invalid');
    expect(component.branchInterval).toBeNull();
    expect(component.officeServices).toEqual([officeService]);
    expect(component.hasError).toBe(false);
  });

  it('handles an empty branch schedule independently of services', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ days: [] }));
    fixture.detectChanges();
    expect(component.scheduleState).toBe('empty');
    expect(component.officeServices).toEqual([officeService]);
  });

  it.each([
    404,
    500
  ])('preserves service management when schedules fail: %s', (status) => {
    organizationService.getOfficeSchedules.mockReturnValue(
      throwError(() => ({ status, error: { error: 'Not Found' } }))
    );
    fixture.detectChanges();
    expect(component.scheduleState).toBe(status === 404 ? 'unavailable' : 'error');
    expect(fixture.nativeElement.querySelector('.branch-row')).toBeNull();
    expect(component.officeServices).toEqual([officeService]);
    dialog.open.mockReturnValue(dialogRefWithValue({ serviceName: 'New' }));
    component.addService();
    expect(organizationService.createOfficeService).toHaveBeenCalledWith('1', {
      serviceName: 'New',
      serviceExternalId: '',
      workingHours: ''
    });
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(2);
  });

  it('keeps free-form hours editable and round-trips the exact text', () => {
    fixture.detectChanges();
    const workingHours = ' Mon–Thu 09:00-17:00; Fri by appointment ';
    dialog.open.mockReturnValue(dialogRefWithValue({ ...officeService, workingHours }));
    component.editService({ ...officeService, workingHours });
    expect(dialog.open).toHaveBeenCalledWith(
      FormDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          formfields: expect.arrayContaining([
            expect.objectContaining({ controlName: 'workingHours', value: workingHours })
          ])
        })
      })
    );
    expect(organizationService.updateOfficeService).toHaveBeenCalledWith(
      '1',
      '7',
      expect.objectContaining({ workingHours })
    );
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(2);
  });

  it('uses backend id rather than the office id or external id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue(officeService));
    component.editService({ id: 83, serviceExternalId: 'external' });
    expect(organizationService.updateOfficeService).toHaveBeenCalledWith('1', '83', expect.anything());
    expect(component.getOfficeServiceId({ serviceId: 12 })).toBe('12');
  });

  it('requires an explicit confirmation before deleting and reloads only after success', () => {
    const confirmed = new Subject<any>();
    const deleted = new Subject<any>();
    fixture.detectChanges();
    dialog.open.mockReturnValue({ afterClosed: () => confirmed } as any);
    organizationService.deleteOfficeService.mockReturnValue(deleted);
    component.deleteService(officeService);
    expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, expect.anything());
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
    confirmed.next({ delete: true });
    expect(organizationService.deleteOfficeService).toHaveBeenCalledWith('1', '7');
    expect(component.officeServices).toEqual([officeService]);
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(1);
    deleted.next({});
    deleted.complete();
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(2);
  });

  it('does not delete when confirmation is dismissed', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue({ afterClosed: () => of({ delete: false }) } as any);
    component.deleteService(officeService);
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('prevents duplicate dialogs and submissions while a write is pending', () => {
    fixture.detectChanges();
    const closed = new Subject<any>();
    const saved = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => closed, close: jest.fn() } as any);
    organizationService.createOfficeService.mockReturnValue(saved);
    component.addService();
    component.addService();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    closed.next({ data: { value: officeService } });
    closed.next({ data: { value: officeService } });
    component.addService();
    component.editService(officeService);
    component.deleteService(officeService);
    expect(organizationService.createOfficeService).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBe(true);
    saved.next({});
    saved.complete();
    expect(component.isSaving).toBe(false);
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(2);
  });

  it.each([
    'createOfficeService',
    'updateOfficeService',
    'deleteOfficeService'
  ] as const)('retains authoritative records after %s fails without retrying writes', (method) => {
    fixture.detectChanges();
    organizationService[method].mockReturnValue(throwError(() => ({ status: 500 })));
    dialog.open.mockReturnValue(
      method === 'deleteOfficeService' ? dialogRefWithDelete() : dialogRefWithValue(officeService)
    );
    if (method === 'createOfficeService') component.addService();
    else if (method === 'updateOfficeService') component.editService(officeService);
    else component.deleteService(officeService);
    expect(component.officeServices).toEqual([officeService]);
    expect(component.saveError).toBe(true);
    expect(organizationService[method]).toHaveBeenCalledTimes(1);
    expect(organizationService.getOfficeServices).toHaveBeenCalledTimes(1);
  });

  it.each([
    {},
    [[]],
    [null],
    [42]
  ])('rejects malformed service responses: %j', (response) => {
    organizationService.getOfficeServices.mockReturnValue(of(response));
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
    expect(TestBed.inject(OfficeDetailsSummary).serviceCount()).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
  });

  it('cancels old service and schedule requests when the office changes', () => {
    const services = new Subject<any>();
    const schedules = new Subject<any>();
    organizationService.getOfficeServices.mockReturnValueOnce(services);
    organizationService.getOfficeSchedules
      .mockReturnValueOnce(schedules)
      .mockReturnValueOnce(
        of({ officeId: 2, days: [{ weekday: 'MONDAY', enabled: true, openingTime: '10:00', closingTime: '16:00' }] })
      );
    fixture.detectChanges();
    expect(component.isLoading).toBe(true);
    expect(component.scheduleState).toBe('loading');
    officeParams.next(convertToParamMap({ officeId: '2' }));
    services.next([{ id: 999 }]);
    schedules.next({ days: [] });
    expect(component.officeId).toBe('2');
    expect(component.scheduleState).toBe('ready');
    expect(component.branchHours).toBe('10:00 – 16:00');
    expect(component.officeServices).toEqual([officeService]);
    expect(organizationService.getOfficeServices).toHaveBeenLastCalledWith('2');
    expect(organizationService.getOfficeSchedules).toHaveBeenLastCalledWith('2');
  });

  it.each([
    'add',
    'edit',
    'delete'
  ])('closes a pending %s dialog on office navigation', (action) => {
    const closed = new Subject<any>();
    fixture.detectChanges();
    const close = jest.fn(() => closed.next({ data: { value: officeService }, delete: true }));
    dialog.open.mockReturnValue({ afterClosed: () => closed, close } as any);
    if (action === 'edit') component.editService(officeService);
    else if (action === 'delete') component.deleteService(officeService);
    else component.addService();
    officeParams.next(convertToParamMap({ officeId: '2' }));
    closed.next({ data: { value: officeService } });
    expect(close).toHaveBeenCalledTimes(1);
    expect(organizationService.createOfficeService).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('enforces existing CRUD permissions with RBAC enabled', () => {
    const previous = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = true;
    permissions = ['READ_OFFICE'];
    try {
      fixture.detectChanges();
      component.addService();
      component.editService(officeService);
      component.deleteService(officeService);
      expect(dialog.open).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelectorAll('.add-service, .row-actions button')).toHaveLength(0);
    } finally {
      environment.productionModeEnableRBAC = previous;
    }
  });
  it('hides stale configured rows after a successful delete followed by a failed refresh, then restores them on Retry', () => {
    fixture.detectChanges();
    organizationService.getOfficeServices.mockReturnValueOnce(throwError(() => ({ status: 500 })));
    dialog.open.mockReturnValue(dialogRefWithDelete());
    component.deleteService(officeService);
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
    expect(component.saveError).toBe(false);
    expect(fixture.nativeElement.querySelector('.services-table')).toBeNull();
    organizationService.getOfficeServices.mockReturnValueOnce(of([]));
    component.loadOfficeServices();
    fixture.detectChanges();
    expect(component.officeServices).toEqual([]);
    expect(component.hasError).toBe(false);
  });

  it('hides Add guidance when loading, saving or unavailable', () => {
    fixture.detectChanges();
    expect(component.canAddService).toBe(true);
    component.isSaving = true;
    expect(component.canAddService).toBe(false);
    component.isSaving = false;
    component.isPluginUnavailable = true;
    expect(component.canAddService).toBe(false);
  });
});
