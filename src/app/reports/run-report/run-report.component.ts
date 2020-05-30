/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ReportsService } from '../reports.service';

/** Custom Models */
import { ReportParameter } from '../common-models/report-parameter.model';
import { SelectOption } from '../common-models/select-option.model';

/**
 * Run report component.
 */
@Component({
  selector: 'mifosx-run-report',
  templateUrl: './run-report.component.html',
  styleUrls: ['./run-report.component.scss']
})
export class RunReportComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Contains report specifications i.e: name, type and id */
  report: any = {};
  /** Formatted data post labeling of report parameters fetched from API */
  paramData: any = [];
  /** Array of all parent parameters */
  parentParameters: any[] = [];
  /** Parameter data to configure pentaho output */
  pentahoReportParameters: any[] = [];
  /** Data to be passed on to component selectors */
  dataObject: any;
  /** Initializes new form group 'ReportForm */
  ReportForm = new FormGroup({});
  /** Static Form control for decimal places in output */
  decimalChoice = new FormControl();
  /** Toggles Report form */
  isCollapsed = false;
  /** Toggles  Table output. */
  hideTable = true;
   /** Toggles Chart output */
  hideChart = true;
   /** Toggles Pentaho output */
  hidePentaho = true;

  /**
   * Fetches report specifications from route params and retrieves report parameters data from `resolve`.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {DomSanitizer} sanitizer DomSanitizer.
   * @param {ReportsService} reportsService ReportsService
   * @param {DatePipe} datePipe Date Pipe
   */
  constructor(private route: ActivatedRoute,
              private reportsService: ReportsService,
              private datePipe: DatePipe) {
    this.report.name = this.route.snapshot.params['report-name'];
    this.report.type = this.route.snapshot.params['report-type'];
    this.report.id = this.route.snapshot.params['report-id'];
    this.route.data.subscribe((data: any) => {
      this.paramData = data.params;
    });
  }

  /**
   * Creates and sets the run report form.
   */
  ngOnInit() {
    this.createRunReportForm();
  }

  /**
   * Establishes form controls for Report Parameter's name attribute,
   * Fetches dropdown options and builds child dependencies.
   */
  createRunReportForm() {
    this.paramData.forEach(
      (param: any) => {
        if (!param.parentParameterName) {
          this.ReportForm.addControl(param.name, new FormControl('', Validators.required));
          if (param.displayType === 'select') {
            this.fetchSelectOptions(param, param.name);
          }
        } else {
          const parent: ReportParameter = this.paramData
            .find((entry: any) => entry.name === param.parentParameterName);
          parent.childParameter = param;
          this.parentParameters.push(parent);
        }
      });
    if (this.report.type === 'Pentaho') {
      this.ReportForm.addControl('outputType', new FormControl(''));
      this.mapPentahoParams();
    }
    this.decimalChoice.patchValue('0');
    this.setChildControls();
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
    });
  }

  /**
   * Maps pentaho specific names to form-control names.
   */
  mapPentahoParams() {
    this.reportsService.getPentahoParams(this.report.id).subscribe((data: any) => {
      data.forEach((entry: any) => {
        const param: ReportParameter = this.paramData
         .find((_entry: any) => _entry.name === entry.parameterName);
        param.pentahoName = `R_${entry.reportParameterName}`;
      });
    });
  }

  /**
   * Subscribes to changes in parent parameters value, builds child parameter vis-a-vis parent's value.
   */
  setChildControls() {
    this.parentParameters.forEach((param: ReportParameter) => {
      this.ReportForm.get(param.name).valueChanges.subscribe((option: any) => {
        this.ReportForm.addControl(param.childParameter.name, new FormControl('', Validators.required));
        if (param.childParameter.displayType === 'select') {
          const inputstring = `${param.childParameter.name}?${param.inputName}=${option.id}`;
          this.fetchSelectOptions(param.childParameter, inputstring);
        }
      });
    });
  }

  /**
   * Formats user response and readies it for utilization by run report function.
   * @param {any} response Object containing formcontrol values.
   */
  formatUserResponse(response: any) {
    const formattedResponse: any = {};
    let newKey: string;
    for (const [key, value] of Object.entries(response)) {
      if (key === 'outputType') {
        formattedResponse['output-type'] = value;
        continue;
      }
      const param: ReportParameter = this.paramData
        .find((_entry: any) => _entry.name === key);
      newKey = this.report.type === 'Pentaho' ? param.pentahoName : param.inputName;
      switch (param.displayType) {
        case 'text':
          formattedResponse[newKey] = value;
          break;
        case 'select':
          formattedResponse[newKey] = value['id'];
          break;
        case 'date':
          const dateFormat = 'yyyy-MM-dd';
          formattedResponse[newKey] = this.datePipe.transform(value, dateFormat);
          break;
      }
    }
    return formattedResponse;
  }

  /**
   * Core run report functionality.
   */
  run() {
    this.isCollapsed = true;
    const userResponse = this.formatUserResponse(this.ReportForm.value);
    this.dataObject = {
      formData: userResponse,
      reportData: this.report,
      decimalChoice: this.decimalChoice.value
    };
    switch (this.report.type) {
      case 'SMS':
      case 'Table':
        this.hideTable = false;
       break;
      case 'Chart':
        this.hideChart = false;
       break;
      case 'Pentaho':
        this.hidePentaho = false;
       break;
    }
  }

}
