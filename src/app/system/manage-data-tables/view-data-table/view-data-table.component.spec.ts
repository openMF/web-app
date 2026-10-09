/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faEdit, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { SystemService } from 'app/system/system.service';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ViewDataTableComponent } from './view-data-table.component';

describe('ViewDataTableComponent', () => {
  let fixture: ComponentFixture<ViewDataTableComponent>;

  const longFieldName = 'This is a very long customer information field name that should wrap completely';
  const columnHeaderData = [
    { columnName: 'id', columnDisplayType: 'INTEGER' },
    {
      columnName: longFieldName,
      columnDisplayType: 'TEXT',
      columnLength: 500,
      columnCode: '',
      isColumnNullable: true,
      isColumnUnique: false,
      isColumnIndexed: false
    }
  ];

  beforeEach(async () => {
    const translations: Record<string, string> = {
      'labels.buttons.Edit': 'Edit',
      'labels.buttons.Delete': 'Delete',
      'labels.inputs.Associated With': 'Associated With',
      'labels.inputs.Field Name': 'Field Name',
      'labels.inputs.Type': 'Type',
      'labels.inputs.Length': 'Length',
      'labels.inputs.Code': 'Code',
      'labels.text.Mandatory': 'Mandatory',
      'labels.inputs.Unique': 'Unique',
      'labels.inputs.Indexed': 'Indexed'
    };
    const translateService = {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string) => of(translations[key] || key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

    await TestBed.configureTestingModule({
      imports: [
        ViewDataTableComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              dataTable: {
                applicationTableName: 'm_client',
                registeredTableName: 'client_information',
                columnHeaderData: columnHeaderData.map((column) => ({ ...column }))
              }
            })
          }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: SystemService, useValue: { deleteDataTable: jest.fn(() => of({})) } },
        DatePipe,
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

    TestBed.inject(FaIconLibrary).addIcons(faCheckCircle, faEdit, faTimesCircle, faTrash);

    fixture = TestBed.createComponent(ViewDataTableComponent);
    fixture.detectChanges();
  });

  it('renders long Field Name values in wrapping table cells', () => {
    const fieldNameCell = fixture.nativeElement.querySelector('td.mat-column-columnName') as HTMLElement;
    const stylesheet = readFileSync(join(__dirname, 'view-data-table.component.scss'), 'utf8');

    expect(fieldNameCell.textContent.replace(/\s+/g, ' ').trim()).toBe(longFieldName);
    expect(stylesheet).toContain('td.mat-mdc-cell:first-child');
    expect(stylesheet).toContain('overflow-wrap: anywhere;');
    expect(stylesheet).toContain('white-space: normal;');
    expect(stylesheet).not.toContain('text-overflow: ellipsis;');
    expect(stylesheet).not.toContain('white-space: nowrap;');
    expect(stylesheet).not.toContain('overflow: hidden;');
  });
});
