/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { By } from '@angular/platform-browser';
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

  const row = (id: number, firstName: string, lastName: string, amount: number | null = id) => ({
    row: [
      id,
      99,
      firstName,
      lastName,
      amount,
      null
    ]
  });

  const createDataObject = (data: any[] = [row(7, 'Ada', 'Lovelace')]) => ({
    columnHeaders: [
      { columnName: 'id', columnDisplayType: 'INTEGER' },
      { columnName: 'client_id', columnDisplayType: 'INTEGER' },
      { columnName: 'first_name', columnDisplayType: 'STRING' },
      { columnName: 'last_name', columnDisplayType: 'STRING' },
      { columnName: 'amount', columnDisplayType: 'DECIMAL' },
      { columnName: 'empty_value', columnDisplayType: 'STRING' }
    ],
    data
  });

  const getRenderedRows = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')).map((tableRow: Element) =>
      tableRow.textContent.replace(/\s+/g, ' ').trim()
    );

  const detectChanges = () => {
    fixture.detectChanges();
    fixture.detectChanges();
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
    component.dataObject = createDataObject();
    component.entityId = '99';
    component.entityType = 'Client';
    detectChanges();
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
      'Amount',
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
      'amount',
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

  it('renders a paginator for multi row data tables', () => {
    const paginator = fixture.nativeElement.querySelector('mat-paginator');

    expect(paginator).toBeTruthy();
    expect(component.datatableData.paginator).toBe(component.paginator);
  });

  it('displays the correct rows when changing pages', () => {
    component.dataObject = createDataObject([
      row(1, 'One', 'User'),
      row(2, 'Two', 'User'),
      row(3, 'Three', 'User')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    component.paginator._changePageSize(2);
    detectChanges();

    expect(getRenderedRows()[0]).toContain('One');
    expect(getRenderedRows()[1]).toContain('Two');

    component.paginator.pageIndex = 1;
    component.paginator.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: 2,
      length: 3
    });
    detectChanges();

    expect(getRenderedRows()).toHaveLength(1);
    expect(getRenderedRows()[0]).toContain('Three');
  });

  it('updates rendered rows when page size changes', () => {
    component.dataObject = createDataObject([
      row(1, 'One', 'User'),
      row(2, 'Two', 'User'),
      row(3, 'Three', 'User')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    component.paginator._changePageSize(2);
    detectChanges();

    expect(getRenderedRows()).toHaveLength(2);

    component.paginator._changePageSize(10);
    detectChanges();

    expect(getRenderedRows()).toHaveLength(3);
  });

  it('sorts dynamic columns ascending and descending', () => {
    component.dataObject = createDataObject([
      row(1, 'Charlie', 'Zephyr'),
      row(2, 'Alice', 'Yellow'),
      row(3, 'Bob', 'Xavier')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });

    component.sort.sort({ id: 'first_name', start: 'asc', disableClear: false });
    detectChanges();

    expect(getRenderedRows()[0]).toContain('Alice');
    expect(getRenderedRows()[1]).toContain('Bob');

    component.sort.active = 'first_name';
    component.sort.direction = 'desc';
    component.sort.sortChange.emit({ active: 'first_name', direction: 'desc' });
    detectChanges();

    expect(getRenderedRows()[0]).toContain('Charlie');
    expect(getRenderedRows()[1]).toContain('Bob');
  });

  it('sorts and paginates together', () => {
    component.dataObject = createDataObject([
      row(1, 'Charlie', 'Zephyr'),
      row(2, 'Alice', 'Yellow'),
      row(3, 'Bob', 'Xavier')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    component.paginator._changePageSize(2);
    component.sort.sort({ id: 'first_name', start: 'asc', disableClear: false });
    detectChanges();

    component.paginator.pageIndex = 1;
    component.paginator.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: 2,
      length: 3
    });
    detectChanges();

    expect(getRenderedRows()).toHaveLength(1);
    expect(getRenderedRows()[0]).toContain('Charlie');
  });

  it('renders an empty data table without rows', () => {
    component.dataObject = createDataObject([]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    detectChanges();

    expect(getRenderedRows()).toHaveLength(0);
    expect(component.datatableData.paginator).toBe(component.paginator);
  });

  it('renders all rows for a dataset smaller than one page', () => {
    component.dataObject = createDataObject([
      row(1, 'One', 'User'),
      row(2, 'Two', 'User')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    detectChanges();

    expect(getRenderedRows()).toHaveLength(2);
  });

  it('keeps selection intact across pagination and sorting', () => {
    component.dataObject = createDataObject([
      row(1, 'Charlie', 'Zephyr'),
      row(2, 'Alice', 'Yellow'),
      row(3, 'Bob', 'Xavier')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    component.paginator._changePageSize(2);
    detectChanges();
    const selectedRow = component.datatableData.data[1];

    component.itemToggle(selectedRow);
    component.sort.sort({ id: 'first_name', start: 'asc', disableClear: false });
    component.paginator.pageIndex = 1;
    component.paginator.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: 2,
      length: 3
    });
    detectChanges();

    expect(component.selection.isSelected(selectedRow)).toBe(true);
    expect(component.selection.selected).toEqual([selectedRow]);
    expect(component.isSelected).toBe(true);
  });

  it('keeps delete selected behavior functional', () => {
    component.dataObject = createDataObject([
      row(1, 'One', 'User'),
      row(2, 'Two', 'User')
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });
    const selectedRow = component.datatableData.data[0];

    component.itemToggle(selectedRow);

    expect(fixture.debugElement.query(By.css('.delete-button'))).toBeTruthy();
    expect(component.selection.selected).toEqual([selectedRow]);
  });

  it('sorts numbers and null values safely', () => {
    component.dataObject = createDataObject([
      row(1, 'One', 'User', 30),
      row(2, 'Two', 'User', null),
      row(3, 'Three', 'User', 5)
    ]);
    component.ngOnChanges({ dataObject: { currentValue: component.dataObject } as any });

    component.sort.sort({ id: 'amount', start: 'asc', disableClear: false });
    detectChanges();

    expect(getRenderedRows()[0]).toContain('Two');
    expect(getRenderedRows()[1]).toContain('Three');
    expect(getRenderedRows()[2]).toContain('One');
    expect(component.getSortValue(row(4, 'Four', 'User', 'invalid' as any), 'amount')).toBe(Number.NEGATIVE_INFINITY);
  });
});
