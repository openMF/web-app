/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CreateGroupComponent } from './create-group.component';
import { GroupsService } from '../groups.service';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('CreateGroupComponent', () => {
  let component: CreateGroupComponent;
  let fixture: ComponentFixture<CreateGroupComponent>;
  let groupsService: jest.Mocked<GroupsService>;
  let router: Router;
  let queryParamMap: BehaviorSubject<ParamMap>;

  const offices = [
    { id: 1, name: 'Head Office' },
    { id: 2, name: 'Branch Office' }
  ];

  const centerTemplate = {
    centerId: 7,
    centerName: 'Kampala Center',
    officeId: 2,
    staffId: 5,
    officeOptions: [{ id: 2, name: 'Branch Office' }],
    staffOptions: [
      { id: 5, displayName: 'Staff, Center' },
      { id: 6, displayName: 'Staff, Other' }
    ]
  };

  const setup = async (queryParams: Record<string, string> = {}, centerTemplate$: any = of(centerTemplate)) => {
    groupsService = {
      getStaff: jest.fn(() => of({ staffOptions: [] })),
      getCenterGroupTemplate: jest.fn(() => centerTemplate$),
      createGroup: jest.fn(() => of({ resourceId: 42 }))
    } as any;
    queryParamMap = new BehaviorSubject(convertToParamMap(queryParams));

    await TestBed.configureTestingModule({
      imports: [
        CreateGroupComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ offices }), queryParamMap } },
        { provide: GroupsService, useValue: groupsService },
        { provide: ClientsService, useValue: { getFilteredClients: jest.fn(() => of({ pageItems: [] })) } },
        {
          provide: SettingsService,
          useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy', businessDate: new Date(2026, 8, 1) }
        },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '01 September 2026') } },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const submittedPayload = (): any => groupsService.createGroup.mock.calls[0][0];

  describe('standalone', () => {
    beforeEach(() => setup());

    it('should let the user choose any office', () => {
      expect(component.centerId).toBeNull();
      expect(component.officeData).toEqual(offices);
      expect(component.groupForm.controls['officeId'].enabled).toBe(true);
      expect(groupsService.getCenterGroupTemplate).not.toHaveBeenCalled();
    });

    it('should load staff when an office is chosen', () => {
      component.groupForm.controls['officeId'].setValue(1);

      expect(groupsService.getStaff).toHaveBeenCalledWith(1);
    });

    it('should cancel back to the groups list', () => {
      expect(component.cancelRoute).toEqual(['../']);
    });

    it('should not send a centerId', () => {
      component.groupForm.patchValue({ name: 'Group A', officeId: 1 });

      component.submit();

      expect(submittedPayload().officeId).toBe(1);
      expect(submittedPayload()).not.toHaveProperty('centerId');
      expect(router.navigate).toHaveBeenCalledWith([
        '../groups',
        42,
        'general'
      ]);
    });

    it('should not send a staffId when no staff was chosen', () => {
      component.groupForm.patchValue({ name: 'Group A', officeId: 1 });

      component.submit();

      expect(submittedPayload()).not.toHaveProperty('staffId');
    });

    it('should not send a staffId when the staff field is disabled', () => {
      component.groupForm.patchValue({ name: 'Group A', officeId: 1 });
      component.groupForm.controls['staffId'].disable();

      component.submit();

      expect(submittedPayload()).not.toHaveProperty('staffId');
    });
  });

  describe('from a center', () => {
    beforeEach(() => setup({ centerId: '7' }));

    it('should load the center group template', () => {
      expect(component.centerId).toBe(7);
      expect(groupsService.getCenterGroupTemplate).toHaveBeenCalledWith(7);
      expect(component.centerName).toBe('Kampala Center');
      expect(component.staffData).toEqual(centerTemplate.staffOptions);
    });

    it("should lock the office to the center's office", () => {
      const officeId = component.groupForm.controls['officeId'];
      expect(officeId.value).toBe(2);
      expect(officeId.disabled).toBe(true);
      expect(component.officeData).toEqual(centerTemplate.officeOptions);
      expect(groupsService.getStaff).not.toHaveBeenCalled();
    });

    it("should default the staff to the center's staff", () => {
      expect(component.groupForm.controls['staffId'].value).toBe(5);
    });

    it('should cancel back to the center', () => {
      expect(component.cancelRoute).toEqual([
        '/centers',
        7
      ]);
    });

    it('should send the centerId and the center office', () => {
      component.groupForm.patchValue({ name: 'Group A' });

      component.submit();

      expect(submittedPayload().centerId).toBe(7);
      expect(submittedPayload().officeId).toBe(2);
      expect(submittedPayload().staffId).toBe(5);
      expect(submittedPayload().name).toBe('Group A');
    });

    it('should return to standalone mode when the centerId is removed', () => {
      queryParamMap.next(convertToParamMap({}));

      expect(component.centerId).toBeNull();
      expect(component.centerName).toBeUndefined();
      expect(component.officeData).toEqual(offices);
      expect(component.groupForm.controls['officeId'].enabled).toBe(true);
      expect(component.cancelRoute).toEqual(['../']);
    });
  });

  describe('from a center, before the template loads', () => {
    let template$: Subject<any>;

    beforeEach(() => {
      template$ = new Subject();
      return setup({ centerId: '7' }, template$);
    });

    it('should keep the office locked and not allow submitting', () => {
      component.groupForm.patchValue({ name: 'Group A' });

      expect(component.groupForm.controls['officeId'].disabled).toBe(true);
      expect(component.canSubmit).toBe(false);

      template$.next(centerTemplate);

      expect(component.canSubmit).toBe(true);
    });
  });

  describe('from a center whose template fails to load', () => {
    beforeEach(() =>
      setup(
        { centerId: '7' },
        throwError(() => new Error('403'))
      )
    );

    it('should stay locked and not allow submitting', () => {
      component.groupForm.patchValue({ name: 'Group A' });

      expect(component.groupForm.controls['officeId'].disabled).toBe(true);
      expect(component.canSubmit).toBe(false);
    });
  });

  describe('with an invalid centerId', () => {
    beforeEach(() => setup({ centerId: 'abc' }));

    it('should fall back to standalone mode', () => {
      expect(component.centerId).toBeNull();
      expect(groupsService.getCenterGroupTemplate).not.toHaveBeenCalled();
      expect(component.groupForm.controls['officeId'].enabled).toBe(true);
    });
  });
});
