/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * A loan application section described as data, so a cooperative can add, change, reorder or remove fields without a
 * new frontend build. Today the sections come from the Fineract datatables a loan product requires on submission
 * (`sectionFromDatatable`); a richer source (docs/loan-management/dynamic-loan-form.md) fills the same shape.
 */
export type LoanFormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multiselect'
  | 'readonly';

export interface LoanFormOption {
  value: string | number;
  label: string;
}

/** The field shows only while another field of the section has one of these values. */
export interface LoanFormCondition {
  field: string;
  equals?: unknown;
  in?: unknown[];
}

export interface LoanFormField {
  /** Form control name; the Fineract column name for datatable fields. */
  key: string;
  label: string;
  type: LoanFormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  /** Whole numbers only. */
  integer?: boolean;
  pattern?: string;
  options?: LoanFormOption[];
  /** Currency code shown beside a `currency` field. */
  currency?: string;
  visibleWhen?: LoanFormCondition;
  /** Lower first; fields without an order keep the order they came in. */
  order?: number;
}

export interface LoanFormSection {
  key: string;
  title: string;
  description?: string;
  fields: LoanFormField[];
}
