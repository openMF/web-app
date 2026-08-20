/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { DateFormatPipe } from 'app/pipes/date-format.pipe';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatatableMultiRowComponent } from './datatable-multi-row.component';

describe('DatatableMultiRowComponent', () => {
  let fixture: ComponentFixture<DatatableMultiRowComponent>;
  let component: DatatableMultiRowComponent;
  let matDialog: { open: jest.Mock };
  let systemService: {
    getEntityDatatable: jest.Mock;
    addEntityDatatableEntry: jest.Mock;
    editEntityDatatableEntryOneToMany: jest.Mock;
    deleteDatatableContent: jest.Mock;
    deleteDatatableEntry: jest.Mock;
  };

  const row = (id: number, firstName: string, lastName: string, amount: number | null = id) => ({
    row: [
      id,
      99,
      firstName,
      lastName,
      amount,
      true,
      false,
      '2025-01-15',
      12,
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
      { columnName: 'is_active', columnDisplayType: 'BOOLEAN' },
      { columnName: 'is_verified', columnDisplayType: 'BOOLEAN' },
      { columnName: 'date_of_birth', columnDisplayType: 'DATE' },
      {
        columnName: 'Relationship_cd_Relationship Type',
        columnDisplayType: 'CODELOOKUP',
        columnValues: [
          { id: 11, value: 'Parent' },
          { id: 12, value: 'Sibling' }
        ]
      },
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

  const setDataObject = (dataObject: any) => {
    fixture.componentRef.setInput('dataObject', dataObject);
    detectChanges();
  };

  beforeEach(async () => {
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: 'en' }));
    const translations: Record<string, string> = {
      'labels.buttons.Add': 'Agregar',
      'labels.buttons.Edit': 'Editar',
      'labels.buttons.Save': 'Guardar',
      'labels.text.Client': 'Cliente',
      'labels.text.for': 'para',
      'labels.buttons.Yes': 'Sí',
      'labels.buttons.No': 'No'
    };
    const translateService = {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string) => of(translations[key] || key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

    matDialog = { open: jest.fn(() => ({ afterClosed: () => of({}) })) };
    systemService = {
      getEntityDatatable: jest.fn(() => of(createDataObject())),
      addEntityDatatableEntry: jest.fn(() => of({})),
      editEntityDatatableEntryOneToMany: jest.fn(() => of({})),
      deleteDatatableContent: jest.fn(() => of({})),
      deleteDatatableEntry: jest.fn(() => of({}))
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
        { provide: MatDialog, useValue: matDialog },
        DatePipe,
        DecimalPipe,
        DateFormatPipe,
        DatetimeFormatPipe,
        { provide: SystemService, useValue: systemService },
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

    TestBed.inject(FaIconLibrary).addIcons(faEdit, faPlus, faTrash);

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
      'Is active',
      'Is verified',
      'Date of birth',
      'Relationship',
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

  it('keeps dynamic sortable headers aligned with their data cells', () => {
    const headerCells = Array.from(
      fixture.nativeElement.querySelectorAll('th[mat-header-cell]:not(.checkbox-column):not(.actions-column)')
    ) as HTMLElement[];
    const dataCells = Array.from(fixture.nativeElement.querySelectorAll('td.responsive-data-cell')) as HTMLElement[];
    const stylesheet = readFileSync(join(__dirname, 'datatable-multi-row.component.scss'), 'utf8');

    expect(headerCells.length).toBe(dataCells.length);
    expect(stylesheet).toContain('::ng-deep .mat-mdc-header-cell.right .mat-sort-header-container');
    expect(stylesheet).toContain('justify-content: flex-end;');
    headerCells.forEach((headerCell, index) => {
      expect(headerCell.classList).toContain('right');
      expect(headerCell.querySelector('.mat-sort-header-container')).toBeTruthy();
      expect(dataCells[index].classList).toContain('right');
    });
  });

  it('preserves the existing displayed columns and desktop table structure', () => {
    const table = fixture.nativeElement.querySelector('table[mat-table]');
    const headerCells = fixture.nativeElement.querySelectorAll('th[mat-header-cell]');
    const tableScrollWrapper = fixture.nativeElement.querySelector('.table-scroll-wrapper');
    const paginator = fixture.nativeElement.querySelector('mat-paginator');

    expect(table).toBeTruthy();
    expect(table.classList).toContain('m-b-25');
    expect(tableScrollWrapper.contains(table)).toBe(true);
    expect(tableScrollWrapper.contains(paginator)).toBe(false);
    expect(component.datatableColumns).toEqual([
      'select',
      'actions',
      'id',
      'first_name',
      'last_name',
      'amount',
      'is_active',
      'is_verified',
      'date_of_birth',
      'Relationship_cd_Relationship Type',
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

  it('renders long field labels and values in wrapping multi-row cell containers', () => {
    const longColumnName = 'very_long_customer_information_field_name_that_should_wrap_completely';
    const longValue =
      'This is a very long customer information value that should wrap across multiple lines instead of being truncated or hidden.';
    setDataObject({
      columnHeaders: [
        { columnName: 'id', columnDisplayType: 'INTEGER' },
        { columnName: 'client_id', columnDisplayType: 'INTEGER' },
        { columnName: longColumnName, columnDisplayType: 'STRING' }
      ],
      data: [
        {
          row: [
            7,
            99,
            longValue
          ]
        }
      ]
    });

    const expectedLabel = 'Very long customer information field name that should wrap completely';
    const headerCells = Array.from(fixture.nativeElement.querySelectorAll('th[mat-header-cell]')) as HTMLElement[];
    const longValueCell = fixture.nativeElement.querySelector(`td[data-label="${expectedLabel}"]`) as HTMLElement;
    const mobileLabel = longValueCell.querySelector('.mobile-cell-label') as HTMLElement;
    const cellValue = longValueCell.querySelector('.cell-value') as HTMLElement;
    const stylesheet = readFileSync(join(__dirname, 'datatable-multi-row.component.scss'), 'utf8');

    expect(headerCells.some((headerCell) => headerCell.textContent.replace(/\s+/g, ' ').trim() === expectedLabel)).toBe(
      true
    );
    expect(mobileLabel.textContent.trim()).toBe(expectedLabel);
    expect(cellValue.textContent.trim()).toBe(longValue);
    expect(stylesheet).toContain('display: block;');
    expect(stylesheet).toContain('max-width: 24rem;');
    expect(stylesheet).toContain('vertical-align: top;');
  });

  it('renders boolean values as translated Yes and No labels', () => {
    const activeCell = fixture.nativeElement.querySelector('td[data-label="Is active"] .cell-value');
    const verifiedCell = fixture.nativeElement.querySelector('td[data-label="Is verified"] .cell-value');

    expect(activeCell.textContent.trim()).toBe('Sí');
    expect(verifiedCell.textContent.trim()).toBe('No');
  });

  it('keeps multi-row Code Value column labels unchanged', () => {
    expect(component.getInputName('Marital Status_cd_Estado Civil')).toBe('Marital status');
  });

  it('renders a paginator for multi row data tables', () => {
    const paginator = fixture.nativeElement.querySelector('mat-paginator');

    expect(paginator).toBeTruthy();
    expect(component.datatableData.paginator).toBe(component.paginator);
  });

  it('shows an edit action for each existing multi-row record', () => {
    setDataObject(
      createDataObject([
        row(7, 'Ada', 'Lovelace'),
        row(8, 'Grace', 'Hopper')
      ])
    );

    const editButtons = fixture.nativeElement.querySelectorAll('td.actions-cell button[mat-icon-button]');

    expect(component.datatableColumns).toContain('actions');
    expect(editButtons.length).toBe(2);
    expect(editButtons[0].getAttribute('aria-label')).toBe('Editar');
  });

  it('opens the selected multi-row record for editing with existing values prefilled', () => {
    const selectedRow = {
      row: [
        7,
        99,
        'Ada',
        'Lovelace',
        0,
        true,
        false,
        '2025-01-15',
        12,
        null
      ]
    };
    setDataObject(createDataObject([selectedRow]));

    component.edit(selectedRow);

    const dialogData = (matDialog.open.mock.calls[0][1] as any).data;
    const formfieldValues = Object.fromEntries(
      dialogData.formfields.map((formfield: any) => [
        formfield.controlName,
        formfield.value
      ])
    );

    expect(dialogData.title).toBe('Editar Client extra data para Cliente');
    expect(dialogData.layout.addButtonText).toBe('labels.buttons.Save');
    expect(formfieldValues.first_name).toBe('Ada');
    expect(formfieldValues.is_active).toBe(true);
    expect(formfieldValues.is_verified).toBe(false);
    expect(formfieldValues.amount).toBe(0);
    expect(formfieldValues.date_of_birth).toEqual(new Date(2025, 0, 15));
    expect(formfieldValues['Relationship_cd_Relationship Type']).toBe(12);
    expect(formfieldValues.empty_value).toBeNull();
  });

  it('updates the selected multi-row record without creating a duplicate row', () => {
    const selectedRow = row(7, 'Ada', 'Lovelace', 0);
    const updatedDataObject = createDataObject([row(7, 'Ada Jane', 'Lovelace', 0)]);
    const afterClosed = jest.fn(() =>
      of({
        data: {
          value: {
            first_name: 'Ada Jane',
            last_name: 'Lovelace',
            amount: 0,
            is_active: true,
            is_verified: false,
            date_of_birth: new Date(2025, 0, 16),
            'Relationship_cd_Relationship Type': 11,
            empty_value: ''
          }
        }
      })
    );
    matDialog.open.mockReturnValueOnce({
      afterClosed
    });
    const formatDateSpy = jest.spyOn((component as any).dateUtils, 'formatDate').mockReturnValue('2025-01-16');
    systemService.getEntityDatatable.mockReturnValueOnce(of(updatedDataObject));

    expect(matDialog.open).not.toHaveBeenCalled();
    component.edit(selectedRow);

    expect(matDialog.open).toHaveBeenCalled();
    expect(afterClosed).toHaveBeenCalled();
    expect(formatDateSpy).toHaveBeenCalledWith(new Date(2025, 0, 16), 'yyyy-MM-dd');
    expect(systemService.editEntityDatatableEntryOneToMany).toHaveBeenCalledWith('99', 7, 'client_extra_data', {
      first_name: 'Ada Jane',
      last_name: 'Lovelace',
      amount: 0,
      is_active: true,
      is_verified: false,
      date_of_birth: '2025-01-16',
      'Relationship_cd_Relationship Type': 11,
      empty_value: '',
      locale: 'en',
      dateFormat: 'yyyy-MM-dd'
    });
    expect(systemService.addEntityDatatableEntry).not.toHaveBeenCalled();
    expect(systemService.getEntityDatatable).toHaveBeenCalledWith('99', 'client_extra_data');
    expect(component.datatableData.data).toEqual(updatedDataObject.data);
    expect(component.datatableData.data).toHaveLength(1);
  });

  it('does not update when editing is cancelled', () => {
    matDialog.open.mockReturnValueOnce({ afterClosed: () => of({}) });

    component.edit(row(7, 'Ada', 'Lovelace'));

    expect(systemService.editEntityDatatableEntryOneToMany).not.toHaveBeenCalled();
    expect(systemService.addEntityDatatableEntry).not.toHaveBeenCalled();
  });

  it('restores loading state and preserves existing rows when update fails', () => {
    const selectedRow = row(7, 'Ada', 'Lovelace');
    const originalRows = component.datatableData.data;
    matDialog.open.mockReturnValueOnce({
      afterClosed: () =>
        of({
          data: {
            value: {
              first_name: 'Ada Jane'
            }
          }
        })
    });
    systemService.editEntityDatatableEntryOneToMany.mockReturnValueOnce(throwError(() => new Error('Update failed')));

    expect(() => component.edit(selectedRow)).not.toThrow();
    expect(systemService.editEntityDatatableEntryOneToMany).toHaveBeenCalled();
    expect(systemService.getEntityDatatable).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.datatableData.data).toBe(originalRows);
  });

  it('restores loading state and preserves existing rows when reload fails', () => {
    const originalRows = component.datatableData.data;
    systemService.getEntityDatatable.mockReturnValueOnce(throwError(() => new Error('Reload failed')));

    component.getData();

    expect(systemService.getEntityDatatable).toHaveBeenCalledWith('99', 'client_extra_data');
    expect(component.isLoading).toBe(false);
    expect(component.datatableData.data).toBe(originalRows);
  });

  it('displays the correct rows when changing pages', () => {
    setDataObject(
      createDataObject([
        row(1, 'One', 'User'),
        row(2, 'Two', 'User'),
        row(3, 'Three', 'User')
      ])
    );
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
    setDataObject(
      createDataObject([
        row(1, 'One', 'User'),
        row(2, 'Two', 'User'),
        row(3, 'Three', 'User')
      ])
    );
    component.paginator._changePageSize(2);
    detectChanges();

    expect(getRenderedRows()).toHaveLength(2);

    component.paginator._changePageSize(10);
    detectChanges();

    expect(getRenderedRows()).toHaveLength(3);
  });

  it('sorts dynamic columns ascending and descending', () => {
    setDataObject(
      createDataObject([
        row(1, 'Charlie', 'Zephyr'),
        row(2, 'Alice', 'Yellow'),
        row(3, 'Bob', 'Xavier')
      ])
    );

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
    setDataObject(
      createDataObject([
        row(1, 'Charlie', 'Zephyr'),
        row(2, 'Alice', 'Yellow'),
        row(3, 'Bob', 'Xavier')
      ])
    );
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
    setDataObject(createDataObject([]));

    expect(getRenderedRows()).toHaveLength(0);
    expect(component.datatableData.paginator).toBe(component.paginator);
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

  it('renders all rows for a dataset smaller than one page', () => {
    setDataObject(
      createDataObject([
        row(1, 'One', 'User'),
        row(2, 'Two', 'User')
      ])
    );

    expect(getRenderedRows()).toHaveLength(2);
  });

  it('keeps selection intact across pagination and sorting', () => {
    setDataObject(
      createDataObject([
        row(1, 'Charlie', 'Zephyr'),
        row(2, 'Alice', 'Yellow'),
        row(3, 'Bob', 'Xavier')
      ])
    );
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
    setDataObject(
      createDataObject([
        row(1, 'One', 'User'),
        row(2, 'Two', 'User')
      ])
    );
    const selectedRow = component.datatableData.data[0];

    component.itemToggle(selectedRow);

    expect(fixture.debugElement.query(By.css('.delete-button'))).toBeTruthy();
    expect(component.selection.selected).toEqual([selectedRow]);
  });

  it('sorts numbers and null values safely', () => {
    setDataObject(
      createDataObject([
        row(1, 'One', 'User', 30),
        row(2, 'Two', 'User', null),
        row(3, 'Three', 'User', 5)
      ])
    );

    component.sort.sort({ id: 'amount', start: 'asc', disableClear: false });
    detectChanges();

    expect(getRenderedRows()[0]).toContain('Two');
    expect(getRenderedRows()[1]).toContain('Three');
    expect(getRenderedRows()[2]).toContain('One');
    expect(component.getSortValue(row(4, 'Four', 'User', 'invalid' as any), 'amount')).toBe(Number.NEGATIVE_INFINITY);
  });
});
