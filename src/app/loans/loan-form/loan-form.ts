/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { LoanFormField, LoanFormFieldType, LoanFormSection } from './loan-form.model';

/** Columns Fineract fills itself on a loan datatable. */
const SYSTEM_COLUMNS = [
  'id',
  'loan_id',
  'created_at',
  'updated_at'
];

/** Fineract `columnDisplayType` → field type; a column of any other type is not shown. */
const DATATABLE_TYPES: Record<string, LoanFormFieldType> = {
  STRING: 'text',
  TEXT: 'textarea',
  INTEGER: 'number',
  DECIMAL: 'number',
  FLOAT: 'number',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  BOOLEAN: 'checkbox',
  CODELOOKUP: 'select',
  CODEVALUE: 'select'
};

/**
 * One section from a Fineract datatable (`GET /loans/template` → `datatables[]`). The datatable carries name, type,
 * length, mandatory and dropdown values only, so that is all a section from it has.
 */
export function sectionFromDatatable(datatable: any, labelOf: (name: string) => string): LoanFormSection {
  return {
    key: datatable.registeredTableName,
    title: labelOf(datatable.registeredTableName),
    fields: (datatable.columnHeaderData ?? [])
      .filter((column: any) => !SYSTEM_COLUMNS.includes(column.columnName) && DATATABLE_TYPES[column.columnDisplayType])
      .map((column: any): LoanFormField => {
        const type = DATATABLE_TYPES[column.columnDisplayType];
        return {
          key: column.columnName,
          label: labelOf(column.columnName),
          type,
          // A checkbox always has a value (false), which is all a NOT NULL boolean column needs.
          required: !column.isColumnNullable && type !== 'checkbox',
          integer: column.columnDisplayType === 'INTEGER' || undefined,
          maxLength: column.columnDisplayType === 'STRING' && column.columnLength ? column.columnLength : undefined,
          // CODELOOKUP stores the code value's id, CODEVALUE its text.
          options:
            type === 'select'
              ? (column.columnValues ?? []).map((code: any) => ({
                  value: column.columnDisplayType === 'CODELOOKUP' ? code.id : code.value,
                  label: code.value
                }))
              : undefined
        };
      })
  };
}

export function orderedFields(section: LoanFormSection): LoanFormField[] {
  // Array.prototype.sort is stable, so fields without an order keep theirs.
  return [...section.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function validatorsFor(field: LoanFormField): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (field.required) {
    validators.push(field.type === 'checkbox' ? Validators.requiredTrue : Validators.required);
  }
  if (field.min != null) validators.push(Validators.min(field.min));
  if (field.max != null) validators.push(Validators.max(field.max));
  if (field.minLength != null) validators.push(Validators.minLength(field.minLength));
  if (field.maxLength != null) validators.push(Validators.maxLength(field.maxLength));
  if (field.integer) validators.push(Validators.pattern(/^-?\d+$/));
  if (field.pattern) validators.push(Validators.pattern(field.pattern));
  return validators;
}

export function isVisible(field: LoanFormField, values: Record<string, unknown>): boolean {
  const condition = field.visibleWhen;
  if (!condition) return true;
  const value = values[condition.field];
  const wanted = condition.in ?? [condition.equals];
  return Array.isArray(value) ? value.some((v) => wanted.includes(v)) : wanted.includes(value);
}

function emptyValue(field: LoanFormField): unknown {
  if (field.type === 'checkbox') return false;
  if (field.type === 'multiselect') return [];
  return null;
}

export function buildFormGroup(section: LoanFormSection): FormGroup {
  const controls: Record<string, FormControl> = {};
  section.fields.forEach((field) => {
    controls[field.key] = new FormControl(
      { value: field.defaultValue ?? emptyValue(field), disabled: field.type === 'readonly' },
      validatorsFor(field)
    );
  });
  const group = new FormGroup(controls);
  applyVisibility(section, group);
  return group;
}

/**
 * Hidden fields are disabled, so they are not validated and not submitted. A hidden field's value is left out of
 * `group.value`, so a field that depends on it hides too; repeated until nothing changes.
 */
export function applyVisibility(section: LoanFormSection, group: FormGroup): void {
  let changed = true;
  while (changed) {
    changed = false;
    section.fields
      .filter((field) => field.visibleWhen && field.type !== 'readonly')
      .forEach((field) => {
        const control = group.controls[field.key];
        const visible = isVisible(field, group.value);
        if (visible === control.enabled) return;
        visible ? control.enable({ emitEvent: false }) : control.disable({ emitEvent: false });
        changed = true;
      });
  }
}

export interface PayloadFormat {
  locale: string;
  dateFormat: string;
  dateTimeFormat: string;
  formatDate: (value: unknown, format: string) => string;
}

/**
 * The `{ registeredTableName, data }` entry Fineract takes in `POST /loans` → `datatables[]`. Empty and hidden
 * fields are left out, so Fineract stores null rather than '' or 0.
 */
export function toDatatablePayload(section: LoanFormSection, group: FormGroup, format: PayloadFormat) {
  const data: Record<string, unknown> = { locale: format.locale };
  const values = group.value;
  section.fields.forEach((field) => {
    const value = values[field.key];
    if (value === undefined || value === null || value === '') return;
    switch (field.type) {
      case 'number':
      case 'currency':
      case 'percentage':
        data[field.key] = Number(value);
        break;
      case 'date':
        data[field.key] = format.formatDate(value, format.dateFormat);
        data['dateFormat'] = format.dateFormat;
        break;
      case 'datetime':
        data[field.key] = format.formatDate(value, format.dateTimeFormat);
        data['dateTimeFormat'] = format.dateTimeFormat;
        break;
      default:
        data[field.key] = value;
    }
  });
  return { registeredTableName: section.key, data };
}
