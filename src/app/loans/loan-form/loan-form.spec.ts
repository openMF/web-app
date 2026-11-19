/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { LoanFormSection } from './loan-form.model';
import { applyVisibility, buildFormGroup, orderedFields, sectionFromDatatable, toDatatablePayload } from './loan-form';

const label = (name: string) => `L:${name}`;

const column = (columnName: string, columnDisplayType: string, extra: object = {}) => ({
  columnName,
  columnDisplayType,
  isColumnNullable: true,
  ...extra
});

/** As `GET /loans/template?productId=` returns a datatable the product requires on submission. */
const financials = (columns: object[]) => ({
  registeredTableName: 'loan_financials',
  columnHeaderData: [
    column('id', 'INTEGER'),
    column('loan_id', 'INTEGER'),
    ...columns,
    column('created_at', 'DATETIME'),
    column('updated_at', 'DATETIME')
  ]
});

describe('sectionFromDatatable', () => {
  const section = sectionFromDatatable(
    financials([
      column('business_name', 'STRING', { isColumnNullable: false, columnLength: 100 }),
      column('notes', 'TEXT'),
      column('employees', 'INTEGER'),
      column('monthly_income', 'DECIMAL'),
      column('visit_date', 'DATE'),
      column('visited_at', 'DATETIME'),
      column('insured', 'BOOLEAN', { isColumnNullable: false }),
      column('sector_cd_sector', 'CODELOOKUP', { columnValues: [{ id: 7, value: 'Agriculture' }] }),
      column('grade', 'CODEVALUE', { columnValues: [{ id: 3, value: 'A' }] }),
      column('scan', 'BINARY')
    ]),
    label
  );
  const field = (key: string) => section.fields.find((f) => f.key === key);

  it('names the section and its fields, leaving out the columns Fineract fills itself', () => {
    expect(section.key).toBe('loan_financials');
    expect(section.title).toBe('L:loan_financials');
    expect(section.fields.map((f) => f.key)).toEqual([
      'business_name',
      'notes',
      'employees',
      'monthly_income',
      'visit_date',
      'visited_at',
      'insured',
      'sector_cd_sector',
      'grade'
    ]);
    expect(field('business_name')!.label).toBe('L:business_name');
  });

  it('maps each column type to a field type and skips types it cannot enter', () => {
    expect(section.fields.map((f) => f.type)).toEqual([
      'text',
      'textarea',
      'number',
      'number',
      'date',
      'datetime',
      'checkbox',
      'select',
      'select'
    ]);
  });

  it('takes mandatory, length and whole numbers from the column', () => {
    expect(field('business_name')).toMatchObject({ required: true, maxLength: 100 });
    expect(field('notes')!.required).toBe(false);
    expect(field('employees')!.integer).toBe(true);
    expect(field('monthly_income')!.integer).toBeUndefined();
  });

  it('never requires a mandatory checkbox to be ticked: false is a value', () => {
    expect(field('insured')!.required).toBe(false);
  });

  it("offers a code lookup's ids and a code value's text", () => {
    expect(field('sector_cd_sector')!.options).toEqual([{ value: 7, label: 'Agriculture' }]);
    expect(field('grade')!.options).toEqual([{ value: 'A', label: 'A' }]);
  });

  it('follows the datatable as the cooperative changes it, with no code change', () => {
    const before = sectionFromDatatable(financials([column('income', 'DECIMAL')]), label);
    const after = sectionFromDatatable(
      financials([
        column('income', 'DECIMAL', { isColumnNullable: false }),
        column('guarantor_name', 'STRING')
      ]),
      label
    );
    expect(buildFormGroup(before).valid).toBe(true);
    expect(after.fields.map((f) => f.key)).toEqual([
      'income',
      'guarantor_name'
    ]);
    expect(buildFormGroup(after).valid).toBe(false);
  });
});

describe('a section described with more than Fineract gives today', () => {
  const section: LoanFormSection = {
    key: 'collateral',
    title: 'Collateral',
    fields: [
      { key: 'notes', label: 'Notes', type: 'textarea', order: 3 },
      { key: 'kind', label: 'Kind', type: 'radio', required: true, order: 1, options: [] },
      {
        key: 'land_area',
        label: 'Area',
        type: 'number',
        required: true,
        min: 1,
        max: 500,
        order: 2,
        visibleWhen: { field: 'kind', equals: 'LAND' }
      },
      { key: 'plot_no', label: 'Plot', type: 'text', required: true, visibleWhen: { field: 'land_area', in: [
            10,
            20
          ] } },
      { key: 'code', label: 'Code', type: 'text', minLength: 3, maxLength: 5, pattern: '^[A-Z]+$' },
      { key: 'consent', label: 'Consent', type: 'checkbox', required: true },
      { key: 'rate', label: 'Rate', type: 'percentage', defaultValue: 12 },
      { key: 'ref', label: 'Ref', type: 'readonly', defaultValue: 'R-1' }
    ]
  };

  it('puts fields in their order, keeping the given order for the rest', () => {
    expect(orderedFields(section).map((f) => f.key)).toEqual([
      'plot_no',
      'code',
      'consent',
      'rate',
      'ref',
      'kind',
      'land_area',
      'notes'
    ]);
  });

  it('hides a field until its condition holds, and hides what depends on a hidden field', () => {
    const form = buildFormGroup(section);
    expect(form.controls['land_area'].enabled).toBe(false);
    expect(form.controls['plot_no'].enabled).toBe(false);

    form.controls['kind'].setValue('LAND');
    // The section component reapplies visibility on every change, as here.
    applyVisibility(section, form);
    expect(form.controls['land_area'].enabled).toBe(true);
    expect(form.controls['plot_no'].enabled).toBe(false);

    form.controls['land_area'].setValue(10);
    applyVisibility(section, form);
    expect(form.controls['plot_no'].enabled).toBe(true);

    form.controls['kind'].setValue('VEHICLE');
    applyVisibility(section, form);
    expect(form.controls['land_area'].enabled).toBe(false);
    expect(form.controls['plot_no'].enabled).toBe(false);
  });

  it('checks only the fields that are shown', () => {
    const form = buildFormGroup(section);
    form.patchValue({ kind: 'VEHICLE', consent: true });
    applyVisibility(section, form);
    expect(form.valid).toBe(true);

    form.patchValue({ kind: 'LAND' });
    applyVisibility(section, form);
    expect(form.controls['land_area'].hasError('required')).toBe(true);
  });

  it('applies the configured rules', () => {
    const form = buildFormGroup(section);
    form.patchValue({ kind: 'LAND' });
    applyVisibility(section, form);
    const area = form.controls['land_area'];
    area.setValue(0);
    expect(area.hasError('min')).toBe(true);
    area.setValue(501);
    expect(area.hasError('max')).toBe(true);
    area.setValue(250);
    expect(area.valid).toBe(true);

    const code = form.controls['code'];
    code.setValue('AB');
    expect(code.hasError('minlength')).toBe(true);
    code.setValue('ABCDEF');
    expect(code.hasError('maxlength')).toBe(true);
    code.setValue('abc');
    expect(code.hasError('pattern')).toBe(true);
    code.setValue('ABC');
    expect(code.valid).toBe(true);

    expect(form.controls['consent'].hasError('required')).toBe(true);
  });

  it('starts from the defaults and keeps a read-only field out of editing', () => {
    const form = buildFormGroup(section);
    expect(form.controls['rate'].value).toBe(12);
    expect(form.controls['ref'].disabled).toBe(true);
    expect(form.getRawValue()['ref']).toBe('R-1');
  });

  it('shows a field whose condition names a value picked in a multi-select', () => {
    const multi: LoanFormSection = {
      key: 's',
      title: 's',
      fields: [
        { key: 'purposes', label: 'Purposes', type: 'multiselect' },
        { key: 'crop', label: 'Crop', type: 'text', visibleWhen: { field: 'purposes', equals: 'AGRI' } }
      ]
    };
    const form = buildFormGroup(multi);
    form.controls['purposes'].setValue([
      'TRADE',
      'AGRI'
    ]);
    applyVisibility(multi, form);
    expect(form.controls['crop'].enabled).toBe(true);
  });
});

describe('toDatatablePayload', () => {
  const section = sectionFromDatatable(
    financials([
      column('business_name', 'STRING'),
      column('employees', 'INTEGER'),
      column('visit_date', 'DATE'),
      column('visited_at', 'DATETIME'),
      column('insured', 'BOOLEAN'),
      column('notes', 'TEXT')
    ]),
    label
  );
  const format = {
    locale: 'en',
    dateFormat: 'dd MMMM yyyy',
    dateTimeFormat: 'yyyy-MM-dd HH:mm',
    formatDate: (value: unknown, f: string) => `${String(value)}|${f}`
  };

  it('sends numbers as numbers, dates in their formats, and leaves out what was not filled in', () => {
    const form = buildFormGroup(section);
    form.patchValue({
      business_name: 'Tea shop',
      employees: '4',
      visit_date: '2026-11-19',
      visited_at: '2026-11-19T10:30',
      notes: ''
    });
    expect(toDatatablePayload(section, form, format)).toEqual({
      registeredTableName: 'loan_financials',
      data: {
        locale: 'en',
        business_name: 'Tea shop',
        employees: 4,
        visit_date: '2026-11-19|dd MMMM yyyy',
        dateFormat: 'dd MMMM yyyy',
        visited_at: '2026-11-19T10:30|yyyy-MM-dd HH:mm',
        dateTimeFormat: 'yyyy-MM-dd HH:mm',
        insured: false
      }
    });
  });

  it('leaves out a hidden field', () => {
    const conditional: LoanFormSection = {
      key: 't',
      title: 't',
      fields: [
        { key: 'a', label: 'a', type: 'checkbox' },
        { key: 'b', label: 'b', type: 'text', visibleWhen: { field: 'a', equals: true }, defaultValue: 'x' }
      ]
    };
    const form = buildFormGroup(conditional);
    expect(toDatatablePayload(conditional, form, format).data).toEqual({ locale: 'en', a: false });
  });
});
