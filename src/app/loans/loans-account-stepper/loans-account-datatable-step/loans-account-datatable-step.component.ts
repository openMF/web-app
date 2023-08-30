import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loans-account-datatable-step',
  templateUrl: './loans-account-datatable-step.component.html',
  styleUrls: ['./loans-account-datatable-step.component.scss']
})
export class LoansAccountDatatableStepComponent implements OnInit {
  /** Input Fields Data */
  @Input() datatableData: any;
  /** Create Input Form */
  datatableForm: UntypedFormGroup;

  datatableInputs: any = [];

  constructor(private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private dateUtils: Dates) { }

  ngOnInit(): void {
    this.datatableInputs = this.datatableData.columnHeaderData.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'loan_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    const inputItems: any = {};
    this.datatableInputs.forEach((input: any) => {
      input.controlName = this.getInputName(input);
      if (!input.isColumnNullable) {
        if (this.isNumeric(input.columnDisplayType)) {
          inputItems[input.controlName] = new UntypedFormControl(0, [Validators.required]);
        } else {
          inputItems[input.controlName] = new UntypedFormControl('', [Validators.required]);
        }
      } else {
        inputItems[input.controlName] = new UntypedFormControl('');
      }
    });
    this.datatableForm = this.formBuilder.group(inputItems);
  }

  getInputName(datatableInput: any): string {
    if (datatableInput.columnName && datatableInput.columnName.includes('_cd_')) {
      return datatableInput.columnName.split('_cd_')[0];
    }
    return datatableInput.columnName;
  }

  isNumeric(columnType: string) {
    return this.isColumnType(columnType, 'INTEGER') || this.isColumnType(columnType, 'DECIMAL');
  }

  isDate(columnType: string) {
    return this.isColumnType(columnType, 'DATE') || this.isColumnType(columnType, 'DATETIME');
  }

  isBoolean(columnType: string) {
    return this.isColumnType(columnType, 'BOOLEAN');
  }

  isDropdown(columnType: string) {
    return this.isColumnType(columnType, 'CODELOOKUP');
  }

  isString(columnType: string) {
    return this.isColumnType(columnType, 'STRING');
  }

  isText(columnType: string) {
    return this.isColumnType(columnType, 'TEXT');
  }

  isColumnType(columnType: string, expectedType: string) {
    return (columnType === expectedType);
  }

  get payload(): any {
    const dateFormat = this.settingsService.dateFormat;
    const datatableDataValues = this.datatableForm.value;
    const data = {
      locale: this.settingsService.language.code
    };
    let existDate = false;
    this.datatableInputs.forEach((input: any) => {
      const controlName = this.getInputName(input);
      if (this.isNumeric(input.columnDisplayType)) {
        data[input.columnName] = datatableDataValues[controlName] * 1;
      } else if (this.isDate(input.columnDisplayType)) {
        data[input.columnName] = this.dateUtils.formatDate(datatableDataValues[controlName], dateFormat);
        existDate = true;
      } else {
        data[input.columnName] = datatableDataValues[controlName];
      }
    });

    if (existDate) {
      data['dateFormat'] = dateFormat;
    }

    const payload = {
      registeredTableName: this.datatableData.registeredTableName,
      data: data
    };
    return payload;
  }

}
