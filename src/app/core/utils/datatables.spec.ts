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

import { SettingsService } from 'app/settings/settings.service';
import { Datatables } from './datatables';

describe('Datatables JSON support', () => {
  let datatables: Datatables;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatePipe,
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
            instant: jest.fn((key: string) => (key === 'labels.inputs.Invalid JSON' ? 'Enter valid JSON.' : key)),
            get: jest.fn((key: string) => of(key))
          }
        }
      ]
    });
    datatables = TestBed.inject(Datatables);
  });

  it('creates textarea form fields for both Fineract JSON metadata forms', () => {
    const formfields = datatables.getFormfields(
      [
        { columnName: 'json_display_type', columnDisplayType: 'JSON', isColumnNullable: false },
        { columnName: 'json_column_type', columnDisplayType: 'TEXT', columnType: 'JSON', isColumnNullable: true }
      ],
      [],
      {}
    );

    expect(formfields.map((field: any) => field.controlType)).toEqual([
      'textarea',
      'textarea'
    ]);
    expect(formfields[0].required).toBe(true);
    expect(formfields[1].required).toBe(false);
  });

  it('keeps existing non-JSON datatable field types unchanged', () => {
    const dateTransformColumns: string[] = [];
    const entryObject: any = {};
    const formfields = datatables.getFormfields(
      [
        { columnName: 'number_value', columnDisplayType: 'INTEGER', isColumnNullable: false },
        { columnName: 'decimal_value', columnDisplayType: 'DECIMAL', isColumnNullable: true },
        { columnName: 'string_value', columnDisplayType: 'STRING', isColumnNullable: true },
        { columnName: 'text_value', columnDisplayType: 'TEXT', isColumnNullable: true },
        { columnName: 'date_value', columnDisplayType: 'DATE', isColumnNullable: true },
        { columnName: 'datetime_value', columnDisplayType: 'DATETIME', isColumnNullable: true },
        {
          columnName: 'status_cd_Status',
          columnDisplayType: 'CODELOOKUP',
          isColumnNullable: true,
          columnValues: [{ id: 1, value: 'Active' }]
        },
        { columnName: 'boolean_value', columnDisplayType: 'BOOLEAN', isColumnNullable: true }
      ],
      dateTransformColumns,
      entryObject
    );

    expect(formfields.map((field: any) => field.controlType)).toEqual([
      'input',
      'input',
      'input',
      'input',
      'datepicker',
      'datetimepicker',
      'select',
      'checkbox'
    ]);
    expect(dateTransformColumns).toEqual([
      'date_value',
      'datetime_value'
    ]);
  });

  it.each([
    [
      'nested object',
      '{"customerType":"business","risk":{"score":12}}'
    ],
    [
      'array',
      '["priority","verified"]'
    ],
    [
      'JSON string',
      '"plain string"'
    ],
    [
      'number',
      '12'
    ],
    [
      'boolean',
      'true'
    ],
    [
      'null',
      'null'
    ],
    [
      'empty object',
      '{}'
    ],
    [
      'empty array',
      '[]'
    ]
  ])('accepts valid JSON values: %s', (_label, value) => {
    expect(datatables.jsonValidator({ value } as any)).toBeNull();
  });

  it('rejects malformed JSON but allows nullable empty values', () => {
    expect(datatables.jsonValidator({ value: '{"name":"John",}' } as any)).toEqual({ json: true });
    expect(datatables.jsonValidator({ value: '' } as any)).toBeNull();
    expect(datatables.jsonValidator({ value: null } as any)).toBeNull();
  });

  it('formats JSON safely without rendering object values as [object Object]', () => {
    expect(datatables.formatJsonValue({ customerType: 'business', risk: { score: 12 } })).toContain(
      '"customerType": "business"'
    );
    expect(datatables.formatJsonValue(['priority'])).toContain('"priority"');
    expect(datatables.formatJsonValue('{"customerType":"business"}')).toBe('{\n  "customerType": "business"\n}');
    expect(datatables.formatJsonValue('legacy malformed {')).toBe('legacy malformed {');
    expect(datatables.formatJsonValue({ customerType: 'business' })).not.toContain('[object Object]');
  });

  it('submits JSON field values as JSON text, matching the current Fineract datatable entry contract', () => {
    const jsonText = '{\n  "customerType": "business",\n  "risk": {\n    "score": 12\n  }\n}';
    const payload = datatables.buildPayload(
      [{ columnName: 'profile', columnDisplayType: 'JSON' }],
      { profile: jsonText },
      'yyyy-MM-dd',
      { locale: 'en' }
    );

    expect(payload).toEqual({ locale: 'en', profile: jsonText });
    expect(typeof payload.profile).toBe('string');
    expect(JSON.parse(payload.profile)).toEqual({ customerType: 'business', risk: { score: 12 } });
  });
});
