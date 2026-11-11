/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { SchedulesTabComponent } from './schedules-tab.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';

describe('Office SchedulesTabComponent', () => {
  let component: SchedulesTabComponent;
  let fixture: ComponentFixture<SchedulesTabComponent>;
  let officeParams: BehaviorSubject<ParamMap>;
  let permissions: string[];
  let organizationService: jest.Mocked<OrganizationService>;

  const officeSchedule = {
    days: [
      {
        weekday: 'MONDAY',
        enabled: true,
        openingTime: '09:00',
        closingTime: '17:00'
      },
      {
        weekday: 'TUESDAY',
        enabled: false
      }
    ]
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    officeParams = new BehaviorSubject(convertToParamMap({ officeId: '1' }));
    permissions = ['UPDATE_OFFICE'];

    organizationService = {
      getOfficeSchedules: jest.fn(() => of(officeSchedule)),
      updateOfficeSchedules: jest.fn(() => of({ resourceId: 1 }))
    } as unknown as jest.Mocked<OrganizationService>;

    await TestBed.configureTestingModule({
      imports: [
        SchedulesTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { paramMap: officeParams }
          }
        },
        { provide: OrganizationService, useValue: organizationService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faSave);
    fixture = TestBed.createComponent(SchedulesTabComponent);
    component = fixture.componentInstance;
  });

  it('loads office schedules into weekday rows', () => {
    fixture.detectChanges();

    expect(organizationService.getOfficeSchedules).toHaveBeenCalledWith('1');
    expect(component.days.length).toBe(7);
    expect(component.days.at(0).getRawValue()).toEqual({
      weekday: 'MONDAY',
      weekdayLabelKey: 'labels.inputs.Monday',
      enabled: true,
      openingTime: '09:00',
      closingTime: '17:00'
    });
    expect(component.days.at(1).get('openingTime').disabled).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Monday');
  });

  it('initializes seven disabled weekdays when the backend returns an empty schedule', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ days: [] }));

    fixture.detectChanges();

    expect(component.days.length).toBe(7);
    expect(component.days.getRawValue().every((day: any) => day.enabled === false)).toBe(true);
    expect(component.days.controls.every((day) => day.get('openingTime').disabled)).toBe(true);
    expect(component.getSchedulePayload()).toEqual({
      days: [
        { weekday: 'MONDAY', enabled: false },
        { weekday: 'TUESDAY', enabled: false },
        { weekday: 'WEDNESDAY', enabled: false },
        { weekday: 'THURSDAY', enabled: false },
        { weekday: 'FRIDAY', enabled: false },
        { weekday: 'SATURDAY', enabled: false },
        { weekday: 'SUNDAY', enabled: false }
      ]
    });
  });

  it('submits the complete weekly schedule payload', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ days: [] }));
    fixture.detectChanges();

    const monday = component.days.at(0);
    monday.get('enabled').setValue(true);
    component.setDayEnabled(monday, true);
    monday.patchValue({
      openingTime: '08:30',
      closingTime: '16:30'
    });

    component.submit();

    expect(organizationService.updateOfficeSchedules).toHaveBeenCalledWith('1', {
      days: [
        {
          weekday: 'MONDAY',
          enabled: true,
          openingTime: '08:30',
          closingTime: '16:30'
        },
        { weekday: 'TUESDAY', enabled: false },
        { weekday: 'WEDNESDAY', enabled: false },
        { weekday: 'THURSDAY', enabled: false },
        { weekday: 'FRIDAY', enabled: false },
        { weekday: 'SATURDAY', enabled: false },
        { weekday: 'SUNDAY', enabled: false }
      ]
    });
  });

  it('prevents invalid submissions when opening time is not before closing time', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ days: [] }));
    fixture.detectChanges();

    const monday = component.days.at(0);
    monday.get('enabled').setValue(true);
    component.setDayEnabled(monday, true);
    monday.patchValue({
      openingTime: '17:00',
      closingTime: '09:00'
    });

    component.submit();

    expect(monday.get('closingTime').hasError('timeOrder')).toBe(true);
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it('requires both times for enabled days', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ days: [] }));
    fixture.detectChanges();

    const monday = component.days.at(0);
    monday.get('enabled').setValue(true);
    component.setDayEnabled(monday, true);
    monday.patchValue({
      openingTime: '09:00',
      closingTime: ''
    });

    component.submit();

    expect(monday.get('closingTime').hasError('required')).toBe(true);
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it('disables and clears time controls when a day is unchecked', () => {
    fixture.detectChanges();

    const monday = component.days.at(0);
    monday.get('enabled').setValue(false);
    component.setDayEnabled(monday, false);

    expect(monday.get('openingTime').disabled).toBe(true);
    expect(monday.get('closingTime').disabled).toBe(true);
    expect(monday.getRawValue()).toEqual({
      weekday: 'MONDAY',
      weekdayLabelKey: 'labels.inputs.Monday',
      enabled: false,
      openingTime: '',
      closingTime: ''
    });
    expect(monday.valid).toBe(true);
  });

  it('shows plugin unavailable state when the office schedules endpoint is not registered', () => {
    organizationService.getOfficeSchedules.mockReturnValue(
      throwError(() => ({
        status: 404,
        error: {
          error: 'Not Found'
        }
      }))
    );

    fixture.detectChanges();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.days.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain(
      'labels.text.Office Schedules management requires the Savings Plugin to be deployed'
    );
  });
  it('normalizes the backend LocalTime array before binding it to an HTML time input', () => {
    organizationService.getOfficeSchedules.mockReturnValue(
      of({ days: [
          { weekday: 'MONDAY', enabled: true, openingTime: [
              8,
              0,
              0
            ], closingTime: [
              18,
              0,
              0
            ] }
        ] })
    );
    fixture.detectChanges();
    expect(component.days.at(0).get('openingTime').value).toBe('08:00');
    expect(fixture.nativeElement.querySelector('input[formControlName="openingTime"]').value).toBe('08:00');
  });
  it('normalizes seconds and displays weekdays in order with closed weekends', () => {
    organizationService.getOfficeSchedules.mockReturnValue(
      of({
        days: component.weekdays
          .slice()
          .reverse()
          .map((day) => ({
            weekday: day.weekday.toLowerCase(),
            enabled: ![
              'SATURDAY',
              'SUNDAY'
            ].includes(day.weekday),
            openingTime: '08:00:00',
            closingTime: '18:00:00'
          }))
      })
    );
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.schedule-row');
    expect(rows.length).toBe(7);
    component.days.controls.slice(0, 5).forEach((day) => {
      expect(day.get('openingTime').value).toBe('08:00');
      expect(day.get('closingTime').value).toBe('18:00');
      expect(day.get('openingTime').enabled).toBe(true);
    });
    expect(component.days.getRawValue().map((day: any) => day.weekday)).toEqual(
      component.weekdays.map((day) => day.weekday)
    );
    expect(rows[5].textContent).toContain('Closed');
    expect(rows[6].textContent).toContain('Closed');
    expect(rows[5].querySelector('input[type=time]').disabled).toBe(true);
  });

  it.each([
    [
      null,
      '18:00'
    ],
    [
      '08:00',
      null
    ],
    [
      '',
      ''
    ],
    [
      '25:00',
      '18:00'
    ],
    [
      [
        8,
        60,
        0
      ],
      [
        18,
        0,
        0
      ]
    ]
  ])('shows incomplete configuration without inventing hours for %j to %j', (openingTime, closingTime) => {
    organizationService.getOfficeSchedules.mockReturnValue(
      of({ days: [
          { weekday: 'MONDAY', enabled: true, openingTime, closingTime }
        ] })
    );
    fixture.detectChanges();
    expect(component.hasIncompleteSchedule).toBe(true);
    expect(fixture.nativeElement.querySelector('.day-status').textContent).toContain('Not configured');
    expect(fixture.nativeElement.textContent).toContain('Enabled days need valid opening and closing times');
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBe(true);
    component.submit();
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it('distinguishes a successfully retrieved empty schedule from retrieval failure', () => {
    organizationService.getOfficeSchedules.mockReturnValue(of({ officeId: 1, days: [] }));
    fixture.detectChanges();
    expect(component.hasNoSchedule).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No configured hours');
    organizationService.getOfficeSchedules.mockReturnValue(throwError(() => ({ status: 503 })));
    component.loadOfficeSchedules();
    fixture.detectChanges();
    expect(component.hasNoSchedule).toBe(false);
    expect(component.days.length).toBe(0);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('errors.officeSchedules.loadFailed');
    component.submit();
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it.each([
    0,
    401,
    403,
    404,
    500
  ])('handles retrieval error %s without displaying an empty editable week', (status) => {
    organizationService.getOfficeSchedules.mockReturnValue(throwError(() => ({ status })));
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
    expect(component.isPluginUnavailable).toBe(false);
    expect(component.days.length).toBe(0);
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it.each([
    null,
    {},
    { days: null },
    { officeId: 2, days: [] },
    { days: [null] },
    { days: [{ weekday: 'MONDAY', enabled: 'true' }] },
    {
      days: [
        { weekday: 'MONDAY', enabled: false },
        { weekday: 'MONDAY', enabled: false }
      ]
    }
  ])('does not treat malformed response %j as an empty configuration', (response) => {
    organizationService.getOfficeSchedules.mockReturnValue(of(response));
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
    expect(component.hasNoSchedule).toBe(false);
    expect(component.days.length).toBe(0);
  });

  it.each([
    [
      '18:00',
      '18:00'
    ],
    [
      '18:00',
      '08:00'
    ],
    [
      '00:00:01',
      '00:00'
    ]
  ])('rejects invalid same-day order %s to %s', (openingTime, closingTime) => {
    fixture.detectChanges();
    const monday = component.days.at(0);
    monday.patchValue({ openingTime, closingTime });
    component.submit();
    expect(monday.hasError('timeOrder')).toBe(true);
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it('revalidates time order when the opening time changes', () => {
    fixture.detectChanges();
    const monday = component.days.at(0);
    monday.get('openingTime').setValue('19:00');
    expect(monday.get('closingTime').hasError('timeOrder')).toBe(true);
    monday.get('openingTime').setValue('00:00');
    expect(monday.get('closingTime').valid).toBe(true);
    expect(component.schedulesForm.valid).toBe(true);
  });

  it('rejects malformed times even when set programmatically', () => {
    fixture.detectChanges();
    component.days.at(0).patchValue({ openingTime: 'bad', closingTime: 'zzz' });
    component.submit();
    expect(component.days.at(0).get('openingTime').hasError('invalidTime')).toBe(true);
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('errors.validation.invalidTime');
  });

  it('preserves unrelated weekdays and nonzero seconds in the complete payload', () => {
    organizationService.getOfficeSchedules.mockReturnValue(
      of({
        days: [
          { weekday: 'MONDAY', enabled: true, openingTime: [
              0,
              0,
              1
            ], closingTime: [
              12,
              0,
              0
            ] },
          { weekday: 'TUESDAY', enabled: true, openingTime: '08:30:05', closingTime: '18:00:30' }
        ]
      })
    );
    fixture.detectChanges();
    component.days.at(0).get('closingTime').setValue('13:00');
    component.submit();
    const payload = organizationService.updateOfficeSchedules.mock.calls[0][1];
    expect(payload.days).toHaveLength(7);
    expect(payload.days[0]).toEqual({
      weekday: 'MONDAY',
      enabled: true,
      openingTime: '00:00:01',
      closingTime: '13:00'
    });
    expect(payload.days[1]).toEqual({
      weekday: 'TUESDAY',
      enabled: true,
      openingTime: '08:30:05',
      closingTime: '18:00:30'
    });
  });

  it('prevents duplicate writes and locks all controls until save and refresh complete', () => {
    const save = new Subject<any>();
    const reload = new Subject<any>();
    organizationService.updateOfficeSchedules.mockReturnValue(save);
    fixture.detectChanges();
    organizationService.getOfficeSchedules.mockReturnValue(reload);
    component.submit();
    expect(component.isSaving).toBe(true);
    expect(component.schedulesForm.disabled).toBe(true);
    component.submit();
    expect(organizationService.updateOfficeSchedules).toHaveBeenCalledTimes(1);
    save.next({ resourceId: 1 });
    save.complete();
    expect(component.isLoading).toBe(true);
    component.submit();
    expect(organizationService.updateOfficeSchedules).toHaveBeenCalledTimes(1);
    reload.next({ officeId: 1, days: [{ weekday: 'MONDAY', enabled: true, openingTime: [
            10,
            0,
            0
          ], closingTime: [
            18,
            0,
            0
          ] }] });
    reload.complete();
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(component.days.at(0).get('openingTime').value).toBe('10:00');
    expect(fixture.nativeElement.querySelector('input[type=time]').value).toBe('10:00');
    expect(component.days.at(5).get('openingTime').disabled).toBe(true);
  });

  it('reports a failed post-save read without showing stale or empty configured hours', () => {
    fixture.detectChanges();
    organizationService.getOfficeSchedules.mockReturnValue(throwError(() => ({ status: 503 })));
    component.submit();
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
    expect(component.saveError).toBe(false);
    expect(component.days.length).toBe(0);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it.each([
    0,
    403,
    500
  ])('keeps edits and permits retry after failed save %s', (status) => {
    fixture.detectChanges();
    component.days.at(0).get('openingTime').setValue('10:00');
    organizationService.updateOfficeSchedules.mockReturnValue(throwError(() => ({ status })));
    component.submit();
    fixture.detectChanges();
    expect(component.saveError).toBe(true);
    expect(component.isSaving).toBe(false);
    expect(component.days.at(0).get('openingTime').value).toBe('10:00');
    expect(component.days.at(0).get('openingTime').enabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('errors.officeSchedules.saveFailed');
    expect(organizationService.getOfficeSchedules).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['READ_OFFICE'],
    ['ALL_FUNCTIONS_READ'],
    []
  ])('provides read-only access for permissions %j', (...userPermissions) => {
    permissions = userPermissions as string[];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type=submit]')).toBeNull();
    expect(component.days.at(0).get('enabled').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('input[type=time]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('input[type=time]').value).toBe('09:00');
    component.submit();
    expect(organizationService.updateOfficeSchedules).not.toHaveBeenCalled();
  });

  it('allows ALL_FUNCTIONS users to edit and submit', () => {
    permissions = ['ALL_FUNCTIONS'];
    fixture.detectChanges();
    expect(component.days.at(0).get('enabled').enabled).toBe(true);
    component.submit();
    expect(organizationService.updateOfficeSchedules).toHaveBeenCalledTimes(1);
  });

  it('clears previous office hours and cancels stale responses on route changes', () => {
    fixture.detectChanges();
    const second = new Subject<any>();
    const third = new Subject<any>();
    organizationService.getOfficeSchedules.mockReturnValueOnce(second).mockReturnValueOnce(third);
    officeParams.next(convertToParamMap({ officeId: '2' }));
    fixture.detectChanges();
    expect(component.officeId).toBe('2');
    expect(component.days.length).toBe(0);
    expect(fixture.nativeElement.querySelector('input[type=time]')).toBeNull();
    expect(component.isLoading).toBe(true);
    officeParams.next(convertToParamMap({ officeId: '3' }));
    second.next(officeSchedule);
    second.complete();
    expect(component.days.length).toBe(0);
    third.next({ officeId: 3, days: [] });
    third.complete();
    fixture.detectChanges();
    expect(component.hasNoSchedule).toBe(true);
    expect(component.days.at(0).get('enabled').value).toBe(false);
    expect(organizationService.getOfficeSchedules).toHaveBeenLastCalledWith('3');
  });

  it('does not refresh the old office when an in-flight save finishes after navigation', () => {
    const save = new Subject<any>();
    organizationService.updateOfficeSchedules.mockReturnValue(save);
    fixture.detectChanges();
    component.submit();
    organizationService.getOfficeSchedules.mockReturnValue(of({ officeId: 2, days: [] }));
    officeParams.next(convertToParamMap({ officeId: '2' }));
    save.next({ resourceId: 1 });
    save.complete();
    expect(component.officeId).toBe('2');
    expect(component.isSaving).toBe(false);
    expect(component.days.at(0).get('enabled').value).toBe(false);
    expect(organizationService.getOfficeSchedules).toHaveBeenCalledTimes(2);
  });
});
