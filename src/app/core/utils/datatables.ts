/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { CheckboxBase } from 'app/shared/form-dialog/formfield/model/checkbox-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { DateTimepickerBase } from 'app/shared/form-dialog/formfield/model/datetimepicker-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { Dates } from './dates';

@Injectable({
  providedIn: 'root'
})
export class Datatables {
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);

  systemFields: string[] = [
    'id',
    'created_at',
    'updated_at'
  ];

  entitiesIdFields: string[] = [
    'client_id',
    'savings_account_id',
    'savings_transaction_id',
    'loan_id',
    'group_id',
    'center_id',
    'office_id',
    'product_loan_id',
    'savings_product_id',
    'share_product_id'
  ];

  public getFormfields(columns: any, dateTransformColumns: string[], dataTableEntryObject: any) {
    return columns.map((column: any) => {
      const displayLabel = this.toDisplayLabel(column.columnName);
      const colName = column.columnName ? column.columnName.toLowerCase().replace(/[_\s]+/g, '') : '';
      const isMinSavingsAmount = colName.includes('minimumsavingsamountpermeeting');
      const isPriceOneShare = colName.includes('priceofoneshare');
      const isRestrictedField = [
        'mtn',
        'airtel',
        'officephone',
        'office_phone',
        'office phone'
      ].some((name) => colName.includes(name.replace(/[_\s]+/g, '')));
      switch (column.columnDisplayType) {
        case 'INTEGER':
        case 'STRING':
        case 'DECIMAL':
        case 'TEXT': {
          const inputOptions: any = {
            controlName: column.columnName,
            label: displayLabel,
            value: '',
            type: column.columnDisplayType === 'INTEGER' || column.columnDisplayType === 'DECIMAL' ? 'number' : 'text',
            required: column.isColumnNullable ? false : true
          };
          if (isMinSavingsAmount || isPriceOneShare || isRestrictedField) {
            inputOptions.min = 0;
          }
          return new InputBase(inputOptions);
        }
        case 'BOOLEAN':
          return new CheckboxBase({
            controlName: column.columnName,
            label: displayLabel,
            value: '',
            type: 'checkbox',
            required: column.isColumnNullable ? false : true
          });
        case 'CODELOOKUP':
          return new SelectBase({
            controlName: column.columnName,
            label: displayLabel,
            value: '',
            options: { label: 'value', value: 'id', data: column.columnValues },
            required: column.isColumnNullable ? false : true
          });
        case 'DATE': {
          dateTransformColumns.push(column.columnName);
          if (!dataTableEntryObject.dateFormat) {
            dataTableEntryObject.dateFormat = Dates.DEFAULT_DATEFORMAT;
          }
          return new DatepickerBase({
            controlName: column.columnName,
            label: displayLabel,
            value: '',
            maxDate: this.settingsService.maxAllowedDate,
            required: column.isColumnNullable ? false : true
          });
        }
        case 'DATETIME': {
          dateTransformColumns.push(column.columnName);
          dataTableEntryObject.dateFormat = Dates.DEFAULT_DATETIMEFORMAT;
          return new DateTimepickerBase({
            controlName: column.columnName,
            label: displayLabel,
            value: '',
            maxDate: this.settingsService.maxAllowedDate,
            required: column.isColumnNullable ? false : true
          });
        }
      }
    });
  }

  public isEntityId(columnName: string): boolean {
    return this.entitiesIdFields.includes(columnName);
  }

  public isSystemColumn(columnName: string): boolean {
    return this.systemFields.includes(columnName) || this.entitiesIdFields.includes(columnName);
  }

  public filterSystemColumns(columnHeaders: any): any {
    return columnHeaders.filter((column: any, index: number) => {
      if (!this.isSystemColumn(column.columnName)) {
        column.idx = index;
        return column;
      }
    });
  }

  public getInputName(datatableInput: any): string {
    if (datatableInput.columnName && datatableInput.columnName.includes('_cd_')) {
      return datatableInput.columnName.split('_cd_')[0];
    }
    return datatableInput.columnName;
  }

  public isNumeric(columnType: string): boolean {
    return this.isColumnType(columnType, 'INTEGER') || this.isColumnType(columnType, 'DECIMAL');
  }

  public isDate(columnType: string): boolean {
    return this.isColumnType(columnType, 'DATE') || this.isColumnType(columnType, 'DATETIME');
  }

  public isBoolean(columnType: string): boolean {
    return this.isColumnType(columnType, 'BOOLEAN');
  }

  public isDropdown(columnType: string): boolean {
    return this.isColumnType(columnType, 'CODELOOKUP');
  }

  public isString(columnType: string): boolean {
    return this.isColumnType(columnType, 'STRING');
  }

  public isText(columnType: string): boolean {
    return this.isColumnType(columnType, 'TEXT');
  }

  public isColumnType(columnType: string, expectedType: string): boolean {
    return columnType === expectedType;
  }

  public buildPayload(datatableInputs: any, datatableDataValues: any, dateFormat: string, output: any): any {
    let existDate = false;
    datatableInputs.forEach((input: any) => {
      const controlName = this.getInputName(input);
      if (this.isNumeric(input.columnDisplayType)) {
        output[input.columnName] = datatableDataValues[controlName] * 1;
      } else if (this.isDate(input.columnDisplayType)) {
        output[input.columnName] = this.dateUtils.formatDate(datatableDataValues[controlName], dateFormat);
        existDate = true;
      } else {
        output[input.columnName] = datatableDataValues[controlName];
      }
    });

    if (existDate) {
      output['dateFormat'] = dateFormat;
    }
    return output;
  }

  public isSystemDefined(attr: string): boolean {
    return this.systemFields.includes(attr);
  }

  public getName(columnName: any): string {
    if (columnName && columnName.includes('_cd_')) {
      return columnName.split('_cd_')[0];
    }
    return columnName;
  }

  public toDisplayLabel(columnName: string): string {
    if (!columnName) {
      return '';
    }

    // Handle CODELOOKUP pattern: extract the part after _cd_
    if (columnName.includes('_cd_')) {
      const parts = columnName.split('_cd_');
      // Ensure parts[1] exists and is not empty before processing
      if (parts.length > 1 && parts[1] && parts[1].trim()) {
        // Return the part after _cd_ converted to Title Case
        // Filter out standalone "cd" or "CD" words that are artifacts from naming convention
        // This only affects display, not database column names
        const displayWords = parts[1]
          .split('_')
          .filter((word) => word.trim() && word.toLowerCase() !== 'cd') // Remove empty strings and standalone "cd" artifacts
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        // Return empty string if all words were filtered out, otherwise return formatted label
        return displayWords || parts[1].trim();
      }
    }

    if (columnName.includes('_')) {
      return (
        columnName
          .split('_')
          .filter((word) => word.trim() && word.toLowerCase() !== 'cd')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ') || columnName
      );
    }
    return columnName;
  }

  public getCodeLookupValue(columnHeader: any, id: number): string {
    if (!columnHeader?.columnValues || id === null || id === undefined) {
      return '';
    }
    const codeValue = columnHeader.columnValues.find((cv: any) => cv.id === id);
    return codeValue ? codeValue.value : id.toString();
  }

  public getCodeName(columnName: string): string {
    if (columnName && columnName.includes('_cd_')) {
      return columnName.split('_cd_')[0];
    }
    return '';
  }

  public isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol.startsWith('http') || url.protocol.startsWith('https');
    } catch (e) {
      return false;
    }
  }
}
