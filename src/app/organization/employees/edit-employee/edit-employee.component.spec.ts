/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { EditEmployeeComponent } from './edit-employee.component';

describe('EditEmployeeComponent - mobile number validation', () => {
  function createComponent(mobileNo: string = '1234567890'): EditEmployeeComponent {
    const employee = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      officeId: 1,
      isLoanOfficer: false,
      mobileNo,
      isActive: true,
      joiningDate: '2024-01-15',
      allowedOffices: [{ id: 1, name: 'Office 1' }]
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ employee }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: OrganizationService, useValue: { updateEmployee: jest.fn(() => of({})) } },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(), language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        {
          provide: Dates,
          useValue: {
            parseDate: (value: any) =>
              value instanceof Array ? new Date(value[0], value[1] - 1, value[2]) : new Date(value),
            formatDate: (date: Date, _format: string) => `${date.getDate()} January ${date.getFullYear()}`
          }
        }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditEmployeeComponent());
    component.ngOnInit();
    return component;
  }

  describe('pattern validation', () => {
    it('rejects alphabetic input', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: 'abc' });

      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(false);
    });

    it('rejects invalid special characters', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '!@#$%' });

      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(false);
    });

    it('rejects mobile numbers exceeding 25 characters', () => {
      const component = createComponent();
      const longNumber = '1'.repeat(26);

      component.editEmployeeForm.patchValue({ mobileNo: longNumber });

      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(false);
    });

    it('accepts a normal numeric mobile number', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '1234567890' });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });

    it('accepts a number with a leading plus sign', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '+1234567890' });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });

    it('accepts plus followed by 24 digits (25 characters total)', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '+' + '1'.repeat(24) });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });

    it('rejects plus followed by 25 digits (26 characters total)', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '+' + '1'.repeat(25) });

      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(false);
    });

    it('accepts supported formatting characters', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '+1 (234) 567-8901' });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });

    it('accepts periods and spaces in the number', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '123.456.7890' });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });

    it('accepts an empty mobile number (optional field)', () => {
      const component = createComponent();

      component.editEmployeeForm.patchValue({ mobileNo: '' });

      expect(component.editEmployeeForm.controls.mobileNo.valid).toBe(true);
      expect(component.editEmployeeForm.controls.mobileNo.hasError('pattern')).toBe(false);
    });
  });
});
