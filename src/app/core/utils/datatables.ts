import { Injectable } from '@angular/core';
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

  systemFields: string[] = ['id', 'created_at', 'updated_at'];

  entitiesIdFields: string[] = ['client_id', 'savings_account_id',
    'loan_id', 'group_id', 'center_id', 'office_id', 'product_loan_id', 'savings_product_id', 'share_product_id'];

  constructor(private dateUtils: Dates,
    private settingsService: SettingsService) { }

  public getFormfields(columns: any, dateTransformColumns: string[], dataTableEntryObject: any) {
    return columns.map((column: any) => {
      switch (column.columnDisplayType) {
        case 'INTEGER':
        case 'STRING':
        case 'DECIMAL':
        case 'TEXT': return new InputBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: (column.columnDisplayType === 'INTEGER' || column.columnDisplayType === 'DECIMAL') ? 'number' : 'text',
          required: (column.isColumnNullable) ? false : true
        });
        case 'BOOLEAN': return new CheckboxBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          type: 'checkbox',
          required: (column.isColumnNullable) ? false : true
        });
        case 'CODELOOKUP': return new SelectBase({
          controlName: column.columnName,
          label: column.columnName,
          value: '',
          options: { label: 'value', value: 'id', data: column.columnValues },
          required: (column.isColumnNullable) ? false : true
        });
        case 'DATE': {
          dateTransformColumns.push(column.columnName);
          if (!dataTableEntryObject.dateFormat) {
            dataTableEntryObject.dateFormat = Dates.DEFAULT_DATEFORMAT;
          }
          return new DatepickerBase({
            controlName: column.columnName,
            label: column.columnName,
            value: '',
            maxDate: this.settingsService.maxAllowedDate,
            required: (column.isColumnNullable) ? false : true
          });
        }
        case 'DATETIME': {
          dateTransformColumns.push(column.columnName);
          dataTableEntryObject.dateFormat = Dates.DEFAULT_DATETIMEFORMAT;
          return new DateTimepickerBase({
            controlName: column.columnName,
            label: column.columnName,
            value: '',
            maxDate: this.settingsService.maxAllowedDate,
            required: (column.isColumnNullable) ? false : true
          });
        }
      }
    });
  }

  public isEntityId(columnName: string): boolean {
    return (this.entitiesIdFields.includes(columnName));
  }

  public isSystemColumn(columnName: string): boolean {
    return (this.systemFields.includes(columnName) || this.entitiesIdFields.includes(columnName));
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
    return (columnType === expectedType);
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

  public isValidUrl(urlString: string): boolean {
      try {
        return Boolean(new URL(urlString));
      } catch (e) {
        return false;
      }
  }

}
