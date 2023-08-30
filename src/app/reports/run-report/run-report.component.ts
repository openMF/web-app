/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

/** Custom Services */
import { ReportsService } from '../reports.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { ReportParameter } from '../common-models/report-parameter.model';
import { SelectOption } from '../common-models/select-option.model';
import { Dates } from 'app/core/utils/dates';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';

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
  paramData: ReportParameter[] = [];
  /** Array of all parent parameters */
  parentParameters: any[] = [];
  /** Parameter data to configure pentaho output */
  pentahoReportParameters: any[] = [];
  /** Data to be passed on to component selectors */
  dataObject: any;

  /** Initializes new form group eportForm */
  reportForm = new UntypedFormGroup({});
  /** Static Form control for decimal places in output */
  decimalChoice = new UntypedFormControl();

  /** Toggles Report form */
  isCollapsed = false;
  /** Toggles  Table output. */
  hideTable = true;
   /** Toggles Chart output */
  hideChart = true;
   /** Toggles Pentaho output */
  hidePentaho = true;
  /** Report uses dates */
  reportUsesDates = false;
  exportToS3Allowed = false;
  reportToBeExportedInRepository: any;
  exportToS3Repository: string;
  outputTypeOptions: any[] = [];

  /**
   * Fetches report specifications from route params and retrieves report parameters data from `resolve`.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {ReportsService} reportsService ReportsService
   * @param {SettingsService} settingsService Settings Service
   * @param {Dates} dateUtils Date Utils
   */
  constructor(private route: ActivatedRoute,
              private reportsService: ReportsService,
              private settingsService: SettingsService,
              private dateUtils: Dates,
              private progressBarService: ProgressBarService) {
    this.report.name = this.route.snapshot.params['name'];
    this.route.queryParams.subscribe((queryParams: { type: any, id: any }) => {
      this.report.type = queryParams.type;
      this.report.id = queryParams.id;
    });
    this.route.data.subscribe((data: { reportParameters: ReportParameter[], configurations: any }) => {
      this.paramData = data.reportParameters;
      if (this.isTableReport()) {
        data.configurations.globalConfiguration.forEach((config: GlobalConfiguration) => {
          if (config.name === 'report-export-s3-folder-name') {
            this.exportToS3Allowed = config.enabled;
            this.exportToS3Repository = config.stringValue;
          }
        });
      }
    });
  }

  isTableReport(): boolean {
    return (this.report.type === 'Table');
  }

  isPentahoReport(): boolean {
    return (this.report.type === 'Pentaho');
  }

  /**
   * Creates and sets the run report form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createRunReportForm();
  }

  /**
   * Establishes form controls for Report Parameter's name attribute,
   * Fetches dropdown options and builds child dependencies.
   */
  createRunReportForm() {
    this.paramData.forEach(
      (param: ReportParameter) => {
        if (!param.parentParameterName) { // Non Child Parameter
          this.reportForm.addControl(param.name, new UntypedFormControl('', Validators.required));
          if (param.displayType === 'select') {
            this.fetchSelectOptions(param, param.name);
          }
        } else { // Child Parameter
          const parent: ReportParameter = this.paramData
            .find((entry: any) => entry.name === param.parentParameterName);
          parent.childParameters.push(param);
          this.updateParentParameters(parent);
        }
      });
    if (this.isPentahoReport()) {
      this.reportForm.addControl('outputType', new UntypedFormControl('', Validators.required));
      this.outputTypeOptions = [
        { 'name': 'PDF format', 'value': 'PDF' },
        { 'name': 'Normal format', 'value': 'HTML' },
        { 'name': 'Excel format', 'value': 'XLS' },
        { 'name': 'Excel 2007 format', 'value': 'XLSX' },
        { 'name': 'CSV format', 'value': 'CSV' }
      ];
      this.mapPentahoParams();
    }
    if (this.exportToS3Allowed) {
      this.reportForm.addControl('exportOutputToS3', new UntypedFormControl(false));
    }
    this.decimalChoice.patchValue('0');
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
      this.reportForm.get(param.name).valueChanges.subscribe((option: any) => {
        param.childParameters.forEach((child: ReportParameter) => {
          if (child.displayType === 'none') {
            this.reportForm.addControl(child.name, new UntypedFormControl(child.defaultVal));
          } else {
            this.reportForm.addControl(child.name, new UntypedFormControl('', Validators.required));
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
    });
  }

  /**
   * Formats user response and readies it for utilization by run report function.
   * @param {any} response Object containing formcontrol values.
   */
  formatUserResponse(response: any) {
    const formattedResponse: any = {};
    let newKey: string;
    this.reportToBeExportedInRepository = false;
    for (const [key, value] of Object.entries(response)) {
      if (key === 'outputType') {
        formattedResponse['output-type'] = value;
        continue;
      } else if (key === 'exportOutputToS3') {
        this.reportToBeExportedInRepository = value;
        continue;
      }

      const param: ReportParameter = this.paramData
        .find((_entry: any) => _entry.name === key);
      newKey = this.isPentahoReport() ? param.pentahoName : param.inputName;
      switch (param.displayType) {
        case 'text':
          formattedResponse[newKey] = value;
          break;
        case 'select':
          formattedResponse[newKey] = value['id'];
          break;
        case 'date':
          if (this.isTableReport()) {
            formattedResponse[newKey] = this.dateUtils.formatDate(value, Dates.DEFAULT_DATEFORMAT);
          } else {
            formattedResponse[newKey] = this.dateUtils.formatDate(value, this.settingsService.dateFormat);
          }
          this.reportUsesDates = true;
          break;
        case 'none':
          formattedResponse[newKey] = value;
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
    const userResponseValues = this.formatUserResponse(this.reportForm.value);
    let formData = {
      ...userResponseValues,
    };
    if (this.reportUsesDates) {
      let dateFormat = this.settingsService.dateFormat;
      if (this.isTableReport()) {
        dateFormat = Dates.DEFAULT_DATEFORMAT;
      }
      formData = {
        ...userResponseValues,
        locale: this.settingsService.language.code,
        dateFormat: dateFormat
      };
    }
    if (this.reportToBeExportedInRepository) {
      formData['exportS3'] = true;
    }
    this.dataObject = {
      formData: formData,
      report: this.report,
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
