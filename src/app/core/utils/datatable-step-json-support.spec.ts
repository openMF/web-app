/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { TranslateService } from '@ngx-translate/core';

import { ClientDatatableStepComponent } from 'app/clients/client-stepper/client-datatable-step/client-datatable-step.component';
import { Datatables } from 'app/core/utils/datatables';
import { Dates } from 'app/core/utils/dates';
import { LoansAccountDatatableStepComponent } from 'app/loans/loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';
import { SettingsService } from 'app/settings/settings.service';

describe.each([
  {
    label: 'client',
    componentClass: ClientDatatableStepComponent,
    registeredTableName: 'client_profile',
    systemColumn: 'client_id'
  },
  {
    label: 'loan',
    componentClass: LoansAccountDatatableStepComponent,
    registeredTableName: 'loan_profile',
    systemColumn: 'loan_id'
  }
])('$label datatable step JSON support', ({ componentClass, registeredTableName, systemColumn }) => {
  let component: ClientDatatableStepComponent | LoansAccountDatatableStepComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatePipe,
        Datatables,
        Dates,
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat: 'yyyy-MM-dd',
            maxAllowedDate: new Date(2030, 0, 1)
          }
        },
        {
          provide: TranslateService,
          useValue: {
            instant: jest.fn((key: string) => key),
            get: jest.fn((key: string) => of(key))
          }
        }
      ]
    });
    component = TestBed.runInInjectionContext(() => new componentClass());
    component.datatableData = {
      registeredTableName,
      columnHeaderData: [
        { columnName: systemColumn, columnDisplayType: 'INTEGER' },
        { columnName: 'profile', columnDisplayType: 'JSON', isColumnNullable: false },
        { columnName: 'legacy_profile', columnDisplayType: 'TEXT', columnType: 'JSON', isColumnNullable: true }
      ]
    };
    component.ngOnInit();
  });

  it('validates required and nullable JSON fields from both metadata forms', () => {
    const profile = component.datatableForm.get('profile');
    const legacyProfile = component.datatableForm.get('legacy_profile');

    expect(profile.hasError('required')).toBe(true);
    expect(legacyProfile.valid).toBe(true);

    profile.setValue('{bad}');
    legacyProfile.setValue('[object Object]');

    expect(profile.hasError('json')).toBe(true);
    expect(legacyProfile.hasError('json')).toBe(true);
  });

  it('keeps JSON values as text in the datatable payload', () => {
    const jsonText = '{"risk":{"score":12}}';
    component.datatableForm.patchValue({
      profile: jsonText,
      legacy_profile: '["verified"]'
    });

    expect(component.payload).toEqual({
      registeredTableName,
      data: {
        locale: 'en',
        profile: jsonText,
        legacy_profile: '["verified"]'
      }
    });
    expect(typeof component.payload.data.profile).toBe('string');
  });
});
