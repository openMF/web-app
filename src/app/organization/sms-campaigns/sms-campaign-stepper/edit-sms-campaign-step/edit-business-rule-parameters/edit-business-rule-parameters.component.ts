/** Angular Imports */
import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Rxjs Imports */
import { distinctUntilChanged } from 'rxjs/operators';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';

/** Custom Models */
import { ReportParameter } from 'app/reports/common-models/report-parameter.model';
import { SelectOption } from 'app/reports/common-models/select-option.model';

/**
 * Edit Business Rule Parameters.
 */
@Component({
  selector: 'mifosx-edit-business-rule-parameters',
  templateUrl: './edit-business-rule-parameters.component.html',
  styleUrls: ['./edit-business-rule-parameters.component.scss']
})
export class EditBusinessRuleParametersComponent implements OnChanges {

  /** Run Report Parameters Data */
  @Input() paramData: any;
  /** SMS Campaign */
  @Input() smsCampaign: any;
  /** Template Parameters Event Emitter */
  @Output() templateParameters = new EventEmitter();

  /** Initializes new form group ReportForm */
  ReportForm = new FormGroup({});
  /** Array of all parent parameters */
  parentParameters: any[] = [];
  /** Displayed user choices */
  paramValue: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * @param {ReportsService} reportsService Reports Service
   */
  constructor(private reportsService: ReportsService,
              private datePipe: DatePipe) { }

  ngOnChanges() {
    if (this.paramData) {
      this.ReportForm = new FormGroup({});
      this.paramValue = JSON.parse(this.smsCampaign.paramValue);
      this.createRunReportForm();
      this.disableFormWhenValid();
      this.getResponseHeaders();
    }
  }

  /**
   * Establishes form controls for Report Parameter's name attribute,
   * Fetches dropdown options and builds child dependencies.
   */
  createRunReportForm() {
    this.paramData.forEach(
      (param: any) => {
        if (!param.parentParameterName) { // Non Child Parameter
          this.ReportForm.addControl(param.name, new FormControl('', Validators.required));
          const controlValue = this.paramValue[param.variable].toString();
          switch (param.displayType) {
            case 'text':
              this.ReportForm.get(param.name).patchValue(controlValue);
              break;
            case 'select':
              this.fetchSelectOptions(param, param.name);
              break;
            case 'date':
              const dateFormat = 'yyyy-MM-dd';
              const newControlValue = this.datePipe.transform(controlValue, dateFormat);
              this.ReportForm.get(param.name).patchValue(newControlValue);
              break;
          }
        } else { // Child Parameter
          const parent: ReportParameter = this.paramData
            .find((entry: any) => entry.name === param.parentParameterName);
            parent.childParameters.push(param);
            this.updateParentParameters(parent);
        }
      });
    this.setChildControls();
  }

  /**
   * Updates the array of parent parameters.
   * @param {ReportParameter} parent Parent report parameter
   */
  updateParentParameters(parent: ReportParameter) {
    const parentNames = this.parentParameters.map(parameter => parameter.name);
    if (!parentNames.includes(parent.name)) { // Parent's first child.
      this.parentParameters.push(parent);
    } else { // Parent already has a child
      const index = parentNames.indexOf(parent.name);
      this.parentParameters[index] = parent;
    }
  }

  /**
   * Subscribes to changes in parent parameters value, builds child parameter vis-a-vis parent's value.
   */
  setChildControls() {
    this.parentParameters.forEach((param: ReportParameter) => {
      this.ReportForm.get(param.name).valueChanges.subscribe((option: any) => {
        param.childParameters.forEach((child: ReportParameter) => {
          if (child.displayType === 'none') {
            this.ReportForm.addControl(child.name, new FormControl(child.defaultVal));
          } else {
            this.ReportForm.addControl(child.name, new FormControl('', Validators.required));
          }
          if (child.displayType === 'select') {
            const inputstring = `${child.name}?${param.inputName}=${option.id}`;
            this.fetchSelectOptions(child, inputstring);
          }
        });
      });
    });
  }

 /**
  * Fetches Select Dropdown options for param type "Select".
  * @param {ReportParameter} param Parameter for which dropdown options are required.
  * @param {string} inputstring url substring for API call.
  */
  fetchSelectOptions(param: ReportParameter, inputstring: string) {
    this.reportsService.getSelectOptions(inputstring).subscribe((options: SelectOption[]) => {
      param.selectOptions = options;
      if (param.selectAll === 'Y') {
        param.selectOptions.push({id: '-1', name: 'All'});
      }
      const optionId = this.paramValue[param.variable].toString();
      const option = options.find(entry => entry.id === optionId);
      this.ReportForm.controls[param.name].patchValue({ id: optionId, name: option.name });
    });
  }

  /**
   * Compare function for mat-select.
   * Useful in patching values if value is an object.
   * @param {any} option1 option 1
   * @param {any} option2 option 2.
   */
  compareOptions(option1: any, option2: any) {
    return option1 && option2 && option1.id === option2.id;
  }

  /**
   * Disable the Report Form once all values are patched.
   */
  disableFormWhenValid() {
    this.ReportForm.statusChanges.pipe(distinctUntilChanged()).subscribe((status: string) => {
        if (status === 'VALID') {
          this.ReportForm.disable();
        }
    });
  }

  /**
   * Formats user response and readies it for utilization by run report function.
   * @param {any} response Object containing formcontrol values.
   */
  formatUserResponse(response: any, forHeaders: boolean) {
    const formattedResponse: any = {};
    let newKey: string;
    for (const [key, value] of Object.entries(response)) {
      const param: ReportParameter = this.paramData
        .find((_entry: any) => _entry.variable === key);
      newKey = forHeaders ? param.inputName : param.variable;
      formattedResponse[newKey] = value;
    }
    return formattedResponse;
  }

  /**
   * Gets run report response headers.
   * Emits them via template parameters event emitter.
   * TODO: Replace report object with report name once reports service is refactored.
   */
  getResponseHeaders() {
    const reportName = this.paramValue.reportName;
    delete this.paramValue.reportName;
    const formattedResponse = this.formatUserResponse(this.paramValue, true);
    this.reportsService.getRunReportData(reportName, formattedResponse).subscribe(
      (response: any) => {
        this.templateParameters.emit(response.columnHeaders);
      },
      (error: any) => {
        this.templateParameters.emit(null);
        this.ReportForm.disable();
      }
    );
  }

}
