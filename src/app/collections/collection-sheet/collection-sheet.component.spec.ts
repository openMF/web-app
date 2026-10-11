/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faExclamationCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { of, Subject } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { CollectionSheetComponent } from './collection-sheet.component';
import { CollectionsService } from '../collections.service';
import { CentersService } from 'app/centers/centers.service';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

describe('CollectionSheetComponent', () => {
  let component: CollectionSheetComponent;
  let fixture: ComponentFixture<CollectionSheetComponent>;
  let centersService: { getAllMeetingFallCenters: jest.Mock<any> };
  let collectionsService: { generateCollectionSheetData: jest.Mock<any> };

  const center = (id: number, name: string) => ({
    id,
    name,
    totaldue: 100,
    totalOverdue: 0,
    collectionMeetingCalendar: { calendarInstanceId: id * 10 }
  });

  const jlgGroupData = {
    groups: [
      {
        groupId: 7,
        groupName: 'Group A',
        clients: [
          {
            clientName: 'Jane Doe',
            loans: [{ accountId: '000000001', productShortName: 'LN', totalDue: 50 }],
            savings: [{ accountId: '000000002', productName: 'Savings Plan', dueAmount: 10 }]
          }
        ]
      },
      {
        groupId: 8,
        groupName: 'Group B',
        clients: [{ clientName: 'John Roe', loans: [{ accountId: '000000003', productShortName: 'LN', totalDue: 20 }] }]
      }
    ]
  };

  const text = () => fixture.nativeElement.textContent as string;

  beforeEach(async () => {
    centersService = { getAllMeetingFallCenters: jest.fn() };
    collectionsService = { generateCollectionSheetData: jest.fn(() => of(jlgGroupData)) };

    await TestBed.configureTestingModule({
      imports: [
        CollectionSheetComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideNativeDateAdapter(),
        DecimalPipe,
        { provide: ActivatedRoute, useValue: { data: of({ officesData: [{ id: 1, name: 'Head Office' }] }) } },
        { provide: CentersService, useValue: centersService },
        { provide: CollectionsService, useValue: collectionsService },
        {
          provide: OrganizationService,
          useValue: { getStaffs: () => of([]), getCenters: () => of([]), getGroups: () => of([]) }
        },
        {
          provide: SettingsService,
          useValue: { maxFutureDate: new Date(), dateFormat: 'dd MMMM yyyy', language: { code: 'en' }, decimals: 2 }
        },
        { provide: Dates, useValue: { formatDate: () => '11 October 2026' } }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faExclamationCircle, faSearch);

    fixture = TestBed.createComponent(CollectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.collectionSheetForm.patchValue({ officeId: 1, staffId: 3 });
  });

  it('shows a message when no center meets on the selected date', () => {
    centersService.getAllMeetingFallCenters.mockReturnValue(of([{ meetingFallCenters: [] }]));

    component.previewCollectionSheet();
    fixture.detectChanges();

    expect(component.noMeetings).toBe(true);
    expect(collectionsService.generateCollectionSheetData).not.toHaveBeenCalled();
    expect(text()).toContain('labels.text.No meetings for collection sheet');
  });

  it('shows the collection sheet when exactly one center meets', () => {
    centersService.getAllMeetingFallCenters.mockReturnValue(of([{ meetingFallCenters: [center(5, 'Center 5')] }]));

    component.previewCollectionSheet();
    fixture.detectChanges();

    expect(collectionsService.generateCollectionSheetData).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ calendarId: 50, transactionDate: '11 October 2026' })
    );
    expect(component.collectionSheetGroups.map((group) => group.rows.length)).toEqual([
      2,
      1
    ]);
    expect(text()).toContain('Center 5');
    expect(text()).toContain('Group A');
    expect(text()).toContain('Jane Doe');
    expect(text()).toContain('Savings Plan');
  });

  it('lists the centers and waits for a choice when several centers meet', () => {
    centersService.getAllMeetingFallCenters.mockReturnValue(
      of([{ meetingFallCenters: [
            center(5, 'Center 5'),
            center(6, 'Center 6')
          ] }])
    );

    component.previewCollectionSheet();
    fixture.detectChanges();

    expect(collectionsService.generateCollectionSheetData).not.toHaveBeenCalled();
    expect(text()).toContain('Center 6');
  });

  it('uses the center and group selected in the form', () => {
    centersService.getAllMeetingFallCenters.mockReturnValue(
      of([{ meetingFallCenters: [
            center(5, 'Center 5'),
            center(6, 'Center 6')
          ] }])
    );
    component.collectionSheetForm.patchValue({ centerId: 6, groupId: 8 });

    component.previewCollectionSheet();

    expect(collectionsService.generateCollectionSheetData).toHaveBeenCalledWith(6, expect.anything());
    expect(component.collectionSheetGroups.map((group) => group.groupName)).toEqual(['Group B']);
  });

  it('shows the no-meetings message when the selected center does not meet', () => {
    centersService.getAllMeetingFallCenters.mockReturnValue(of([{ meetingFallCenters: [center(5, 'Center 5')] }]));
    component.collectionSheetForm.patchValue({ centerId: 9 });

    component.previewCollectionSheet();

    expect(component.noMeetings).toBe(true);
    expect(collectionsService.generateCollectionSheetData).not.toHaveBeenCalled();
  });

  it('shows the loading state until the request completes', () => {
    const response = new Subject<any>();
    centersService.getAllMeetingFallCenters.mockReturnValue(response);

    component.previewCollectionSheet();
    fixture.detectChanges();
    expect(component.isLoading).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).not.toBeNull();

    response.next([{ meetingFallCenters: [] }]);
    response.complete();
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
  });
});
