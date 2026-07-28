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
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { DatatableMultiRowComponent } from './datatable-multi-row.component';

describe('DatatableMultiRowComponent', () => {
  let fixture: ComponentFixture<DatatableMultiRowComponent>;
  let component: DatatableMultiRowComponent;

  const dataObject = {
    columnHeaders: [
      { columnName: 'id', columnDisplayType: 'INTEGER' },
      { columnName: 'client_id', columnDisplayType: 'INTEGER' },
      { columnName: 'first_name', columnDisplayType: 'STRING' },
      { columnName: 'last_name', columnDisplayType: 'STRING' },
      { columnName: 'notes', columnDisplayType: 'TEXT' },
      { columnName: 'empty_value', columnDisplayType: 'STRING' }
    ],
    data: [
      {
        row: [
          7,
          99,
          'Ada',
          'Lovelace',
          'A long datatable value that should remain readable when rendered in the responsive mobile row.',
          null
        ]
      }
    ]
  };

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
        DatatableMultiRowComponent,
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

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faTrash);

    fixture = TestBed.createComponent(DatatableMultiRowComponent);
    component = fixture.componentInstance;
    component.dataObject = dataObject;
    component.entityId = '99';
    component.entityType = 'Client';
    fixture.detectChanges();
  });

  it('adds responsive labels to dynamic data cells', () => {
    const dataCells = fixture.nativeElement.querySelectorAll('td.responsive-data-cell');
    const labels = Array.from(dataCells).map((cell: Element) => cell.getAttribute('data-label'));
    const mobileLabels = Array.from(dataCells).map((cell: Element) =>
      cell.querySelector('.mobile-cell-label')?.textContent?.trim()
    );

    expect(labels).toEqual([
      'Id',
      'First name',
      'Last name',
      'Notes',
      'Empty value'
    ]);
    expect(mobileLabels).toEqual(labels);
  });

  it('does not add responsive data labels to the selection column', () => {
    const selectionCell = fixture.nativeElement.querySelector('td.selection-cell');

    expect(selectionCell).toBeTruthy();
    expect(selectionCell.getAttribute('data-label')).toBeNull();
    expect(selectionCell.querySelector('.mobile-cell-label')).toBeNull();
    expect(selectionCell.querySelector('mat-checkbox')).toBeTruthy();
  });

  it('preserves the existing displayed columns and desktop table structure', () => {
    const table = fixture.nativeElement.querySelector('table[mat-table]');
    const headerCells = fixture.nativeElement.querySelectorAll('th[mat-header-cell]');

    expect(table).toBeTruthy();
    expect(component.datatableColumns).toEqual([
      'select',
      'id',
      'first_name',
      'last_name',
      'notes',
      'empty_value'
    ]);
    expect(component.datatableColumns).not.toContain('client_id');
    expect(headerCells.length).toBe(component.datatableColumns.length);
  });

  it('keeps empty values renderable inside labeled responsive cells', () => {
    const emptyValueCell = fixture.nativeElement.querySelector('td[data-label="Empty value"]');
    const emptyValue = emptyValueCell.querySelector('.cell-value');

    expect(emptyValueCell).toBeTruthy();
    expect(emptyValue).toBeTruthy();
    expect(emptyValue.textContent.trim()).toBe('');
  });
});
