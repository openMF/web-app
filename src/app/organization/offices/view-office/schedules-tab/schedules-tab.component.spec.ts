/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { SchedulesTabComponent } from './schedules-tab.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';

describe('Office SchedulesTabComponent', () => {
  let component: SchedulesTabComponent;
  let fixture: ComponentFixture<SchedulesTabComponent>;
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
            parent: {
              snapshot: {
                paramMap: {
                  get: jest.fn(() => '1')
                }
              }
            }
          }
        },
        { provide: OrganizationService, useValue: organizationService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['UPDATE_OFFICE'] }) } },
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
    expect(component.days.length).toBe(7);
    expect(fixture.nativeElement.textContent).toContain(
      'labels.text.Office Schedules management requires the Savings Plugin to be deployed'
    );
  });
});
