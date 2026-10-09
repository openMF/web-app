/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { TranslateService } from '@ngx-translate/core';

import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { PopoverService } from 'app/configuration-wizard/popover/popover.service';
import { SystemService } from '../system.service';
import { columnTypeData } from './column-type-data';
import { ColumnDialogComponent } from './column-dialog/column-dialog.component';
import { CreateDataTableComponent } from './create-data-table/create-data-table.component';
import { EditDataTableComponent } from './edit-data-table/edit-data-table.component';

describe('Data table JSON column support', () => {
  const translateService = {
    instant: jest.fn((key: string) => key),
    get: jest.fn((key: string) => of(key))
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes JSON in the add-column type list with the exact API value', () => {
    const jsonType = columnTypeData.find((columnType) => columnType.displayValue === 'JSON');

    expect(jsonType).toEqual({ displayValue: 'JSON', value: 'json' });
  });

  it('returns type json when JSON is selected in the column dialog', () => {
    const dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { type: 'new', columnCodes: [] } },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ColumnDialogComponent());
    component.ngOnInit();

    component.columnForm.patchValue({
      name: 'profile',
      type: 'json',
      mandatory: true,
      unique: false,
      indexed: false
    });
    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'profile',
        type: 'json',
        mandatory: true,
        unique: false,
        indexed: false
      })
    );
  });

  it('recognizes both JSON metadata forms when editing an existing datatable', () => {
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              dataTable: {
                applicationTableName: 'm_client',
                registeredTableName: 'client_profile',
                entitySubType: '',
                columnHeaderData: [
                  { columnName: 'client_id', columnDisplayType: 'INTEGER' },
                  { columnName: 'profile', columnDisplayType: 'JSON' },
                  { columnName: 'profile_legacy', columnDisplayType: 'TEXT', columnType: 'JSON' }
                ]
              },
              columnCodes: []
            })
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: SystemService, useValue: { updateDataTable: jest.fn(() => of({})) } },
        { provide: TranslateService, useValue: translateService }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditDataTableComponent());
    component.ngOnInit();

    expect(component.columnData.map((column) => column.columnDisplayType)).toEqual([
      'Number',
      'json',
      'json'
    ]);
  });

  it('sends JSON column type unchanged in create and edit requests while preserving existing types', () => {
    const router = { navigate: jest.fn() };
    const createDataTable = jest.fn(() => of({ resourceIdentifier: 'client_profile' }));
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ columnCodes: [] }) } },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: SystemService, useValue: { createDataTable } },
        { provide: ConfigurationWizardService, useValue: { showDatatablesForm: false } },
        { provide: PopoverService, useValue: { open: jest.fn() } },
        { provide: TranslateService, useValue: translateService }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CreateDataTableComponent());
    component.ngOnInit();
    component.dataTableForm.patchValue({
      datatableName: 'client_profile',
      apptableName: 'm_client',
      multiRow: false
    });
    component.columnData = [
      { columnName: 'json_value', columnDisplayType: 'json' },
      { columnName: 'string_value', columnDisplayType: 'String' },
      { columnName: 'text_value', columnDisplayType: 'Text' },
      { columnName: 'number_value', columnDisplayType: 'Number' },
      { columnName: 'decimal_value', columnDisplayType: 'Decimal' },
      { columnName: 'date_value', columnDisplayType: 'Date' },
      { columnName: 'datetime_value', columnDisplayType: 'Datetime' },
      { columnName: 'dropdown_value', columnDisplayType: 'Dropdown', columnCode: 'ClientStatus' }
    ] as any;

    component.submit();

    expect(createDataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        datatableName: 'client_profile',
        apptableName: 'm_client',
        columns: [
          expect.objectContaining({ name: 'json_value', type: 'json' }),
          expect.objectContaining({ name: 'string_value', type: 'String' }),
          expect.objectContaining({ name: 'text_value', type: 'Text' }),
          expect.objectContaining({ name: 'number_value', type: 'Number' }),
          expect.objectContaining({ name: 'decimal_value', type: 'Decimal' }),
          expect.objectContaining({ name: 'date_value', type: 'Date' }),
          expect.objectContaining({ name: 'datetime_value', type: 'Datetime' }),
          expect.objectContaining({ name: 'dropdown_value', type: 'Dropdown', code: 'ClientStatus' })
        ]
      })
    );
  });

  it('adds type json to the edit-datatable payload', () => {
    const updateDataTable = jest.fn(() => of({}));
    const dialog = {
      open: jest.fn(() => ({
        afterClosed: () =>
          of({
            name: 'profile',
            type: 'json',
            mandatory: false,
            unique: false,
            indexed: false
          })
      }))
    };
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              dataTable: {
                applicationTableName: 'm_client',
                registeredTableName: 'client_profile',
                entitySubType: '',
                columnHeaderData: [{ columnName: 'client_id', columnDisplayType: 'INTEGER' }]
              },
              columnCodes: []
            })
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatDialog, useValue: dialog },
        { provide: SystemService, useValue: { updateDataTable } },
        { provide: TranslateService, useValue: translateService }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditDataTableComponent());
    component.ngOnInit();
    component.dataSource = { connect: () => ({ next: jest.fn() }) } as any;

    component.addColumn();
    component.submit();

    expect(updateDataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        addColumns: [expect.objectContaining({ name: 'profile', type: 'json' })],
        changeColumns: undefined,
        dropColumns: undefined
      }),
      'client_profile'
    );
  });
});
