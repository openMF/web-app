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
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatatableSingleRowComponent } from './datatable-single-row.component';

describe('DatatableSingleRowComponent', () => {
  let fixture: ComponentFixture<DatatableSingleRowComponent>;
  let component: DatatableSingleRowComponent;
  let matDialog: { open: jest.Mock };

  const createDataObject = () => ({
    columnHeaders: [
      { columnName: 'id', columnDisplayType: 'INTEGER' },
      { columnName: 'is_active', columnDisplayType: 'BOOLEAN' },
      { columnName: 'is_verified', columnDisplayType: 'BOOLEAN' },
      {
        columnName: 'Marital Status_cd_Estado Civil',
        columnDisplayType: 'CODELOOKUP',
        columnValues: [
          { id: 11, value: 'Single' },
          { id: 12, value: 'Married' }
        ]
      },
      { columnName: 'first_name', columnDisplayType: 'STRING' },
      { columnName: 'created_at', columnDisplayType: 'DATETIME', columnType: 'created_at' },
      { columnName: 'updated_at', columnDisplayType: 'DATETIME', columnType: 'updated_at' }
    ],
    data: [
      {
        row: [
          7,
          true,
          false,
          12,
          'Ada',
          '2025-01-15T12:30:00Z',
          '2025-01-16T13:45:00Z'
        ]
      }
    ]
  });

  const getDataItems = (): Element[] => Array.from(fixture.nativeElement.querySelectorAll('.data-item'));

  const getDataItemText = (index: number, selector: string): string =>
    getDataItems()[index].querySelector(selector).textContent.replace(/\s+/g, ' ').trim();

  const setDataObject = (dataObject: any) => {
    fixture.componentRef.setInput('dataObject', dataObject);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    const translations: Record<string, string> = {
      'labels.buttons.Add': 'Agregar',
      'labels.text.Client': 'Cliente',
      'labels.text.for': 'para',
      'labels.buttons.Yes': 'Sí',
      'labels.buttons.No': 'No',
      'labels.inputs.Created At': 'Creado en',
      'labels.inputs.Updated At': 'Actualizado en'
    };
    const translateService = {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string) => of(translations[key] || key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

    matDialog = { open: jest.fn(() => ({ afterClosed: () => of({}) })) };

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
        { provide: MatDialog, useValue: matDialog },
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
    expect(getDataItemText(3, '.data-label')).toBe('Estado Civil');
  });

  it('renders the Code Value display value', () => {
    expect(getDataItemText(3, '.data-value')).toBe('Married');
  });

  it('renders boolean values as translated Yes and No labels', () => {
    expect(getDataItemText(1, '.data-value')).toBe('Sí');
    expect(getDataItemText(2, '.data-value')).toBe('No');
  });

  it('leaves normal single-row field labels unchanged', () => {
    expect(getDataItemText(4, '.data-label')).toBe('First Name');
    expect(getDataItemText(4, '.data-value')).toBe('Ada');
  });

  it('renders long field labels and text values in wrapping containers', () => {
    const longFieldName = 'custom_field_name_with_a_very_long_unbroken_label_for_wrapping';
    const longValue = 'averylongunbrokenfieldvaluethatshouldwrapandremainfullyvisible';
    setDataObject({
      columnHeaders: [{ columnName: longFieldName, columnDisplayType: 'TEXT' }],
      data: [{ row: [longValue] }]
    });

    const dataItem = getDataItems()[0];
    const label = dataItem.querySelector('.data-label') as HTMLElement;
    const value = dataItem.querySelector('.data-value') as HTMLElement;
    const longText = dataItem.querySelector('.long-text') as HTMLElement;

    expect(label.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'Custom Field Name With A Very Long Unbroken Label For Wrapping'
    );
    expect(value.textContent.trim()).toBe(longValue);
    expect(longText.textContent.trim()).toBe(longValue);
  });

  it('translates single-row system timestamp labels', () => {
    expect(getDataItemText(5, '.data-label')).toBe('Creado en');
    expect(getDataItemText(6, '.data-label')).toBe('Actualizado en');
  });

  it('translates the Add dialog title while preserving the Data Table name', () => {
    component.add();

    expect(matDialog.open).toHaveBeenCalledWith(FormDialogComponent, {
      data: expect.objectContaining({
        title: 'Agregar Client extra data para Cliente'
      }),
      width: '50rem'
    });
  });
});
