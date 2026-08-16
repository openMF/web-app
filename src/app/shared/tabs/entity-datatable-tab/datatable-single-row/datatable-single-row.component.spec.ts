/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faEye, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { DatatableSingleRowComponent } from './datatable-single-row.component';

describe('DatatableSingleRowComponent', () => {
  let fixture: ComponentFixture<DatatableSingleRowComponent>;
  let component: DatatableSingleRowComponent;

  const createDataObject = () => ({
    columnHeaders: [
      { columnName: 'id', columnDisplayType: 'INTEGER' },
      {
        columnName: 'Marital Status_cd_Estado Civil',
        columnDisplayType: 'CODELOOKUP',
        columnValues: [
          { id: 11, value: 'Single' },
          { id: 12, value: 'Married' }
        ]
      },
      { columnName: 'first_name', columnDisplayType: 'STRING' }
    ],
    data: [
      {
        row: [
          7,
          12,
          'Ada'
        ]
      }
    ]
  });

  const getDataItems = (): Element[] => Array.from(fixture.nativeElement.querySelectorAll('.data-item'));

  const getDataItemText = (index: number, selector: string): string =>
    getDataItems()[index].querySelector(selector).textContent.replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    const translateService = {
      instant: jest.fn((key: string) => key),
      get: jest.fn((key: string) => of(key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

    await TestBed.configureTestingModule({
      imports: [
        DatatableSingleRowComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ datatableName: 'client_extra_data' })
          }
        },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        DatePipe,
        DecimalPipe,
        DateFormatPipe,
        DatetimeFormatPipe,
        { provide: SystemService, useValue: { getEntityDatatable: jest.fn() } },
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat: 'dd MMMM yyyy',
            datetimeFormat: 'dd MMMM yyyy HH:mm'
          }
        },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faEdit, faEye, faPlus, faTrash);

    fixture = TestBed.createComponent(DatatableSingleRowComponent);
    component = fixture.componentInstance;
    component.dataObject = createDataObject();
    component.entityId = '99';
    component.entityType = 'Client';
    fixture.detectChanges();
  });

  it('displays the configured field name for a Code Value column label', () => {
    expect(getDataItemText(1, '.data-label')).toBe('Estado Civil');
  });

  it('renders the Code Value display value', () => {
    expect(getDataItemText(1, '.data-value')).toBe('Married');
  });

  it('leaves normal single-row field labels unchanged', () => {
    expect(getDataItemText(2, '.data-label')).toBe('First Name');
    expect(getDataItemText(2, '.data-value')).toBe('Ada');
  });
});
