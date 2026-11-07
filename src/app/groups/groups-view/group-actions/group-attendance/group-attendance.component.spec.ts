/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GroupAttendanceComponent } from './group-attendance.component';
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

registerLocaleData(localeEN);

describe('GroupAttendanceComponent', () => {
  let component: GroupAttendanceComponent;
  let fixture: ComponentFixture<GroupAttendanceComponent>;
  let mockGroupsService: jest.Mocked<GroupsService>;

  const groupActionData = {
    id: 2,
    clientMembers: [{ id: 5, displayName: 'Asha Attendance' }],
    collectionMeetingCalendar: {
      id: 3,
      recurringDates: [
        [
          2026,
          9,
          7
        ],
        [
          2026,
          9,
          14
        ],
        [
          2026,
          9,
          21
        ],
        [
          2026,
          9,
          28
        ]
      ],
      nextTenRecurringDates: [[
          2026,
          9,
          21
        ]]
    }
  };

  beforeEach(async () => {
    mockGroupsService = {
      getMeetingsTemplate: jest.fn(() => of({ attendanceTypeOptions: [] })),
      assignGroupAttendance: jest.fn(() => of({ resourceId: 1 }))
    } as unknown as jest.Mocked<GroupsService>;

    await TestBed.configureTestingModule({
      imports: [
        GroupAttendanceComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ groupActionData }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        {
          provide: SettingsService,
          useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy', businessDate: new Date(2026, 8, 14) }
        },
        Dates,
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupAttendanceComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should list the meeting dates up to the business date', () => {
    expect(component.meetingDates).toEqual([
      [
        2026,
        9,
        7
      ],
      [
        2026,
        9,
        14
      ]
    ]);
  });

  it('should send the attendance type as an object with an id', () => {
    const formatDate = jest.spyOn(TestBed.inject(Dates), 'formatDate').mockReturnValue('14 September 2026');
    component.meetingDate.setValue([
      2026,
      9,
      14
    ]);
    component.dataSource = [{ clientId: 5, attendanceType: 2 }];

    component.submit();

    expect(formatDate).toHaveBeenCalledWith(new Date(2026, 8, 14), 'dd MMMM yyyy');
    expect(mockGroupsService.assignGroupAttendance).toHaveBeenCalledWith(
      2,
      3,
      expect.objectContaining({
        meetingDate: '14 September 2026',
        calendarId: 3,
        clientsAttendance: [{ clientId: 5, attendanceType: { id: 2 } }],
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      })
    );
  });
});
