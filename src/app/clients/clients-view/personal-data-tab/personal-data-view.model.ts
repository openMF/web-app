/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface PersonalDataField {
  label: string;
  columnName?: string;
  value: any;
  date?: boolean;
  className?: string;
  rawLabel?: boolean;
}

export interface PersonalDataTableColumn {
  columnName: string;
  columnDisplayType?: string;
  columnType?: string;
  columnValues?: any[];
  isColumnNullable?: boolean;
  mandatory?: boolean;
  label: string;
  idx: number;
}

export interface PersonalDataTableRecord {
  id?: string | number;
  fields: PersonalDataField[];
}

export interface PersonalDataTableSection {
  key: string;
  title: string;
  sourceName: string;
  columns: PersonalDataTableColumn[];
  isMultiRow: boolean;
  records: PersonalDataTableRecord[];
}

export interface PersonalDataViewModel {
  addresses: any[];
  addressTemplate?: any;
  familyMembers: any[];
  identifiers: any[];
  documents: any[];
  datatableSections: Record<string, PersonalDataTableSection[]>;
}
