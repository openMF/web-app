/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/** Custom Components */
import { ReportParameterDialogComponent } from '../report-parameter-dialog/report-parameter-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Create Report Component.
 */
@Component({
  selector: 'mifosx-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss']
})
export class CreateReportComponent implements OnInit {

  /** Report Form. */
  reportForm: FormGroup;
  /** Report Template Data. */
  reportTemplateData: any;
  /** Data passed to dialog. */
  dataForDialog: { allowedParameters: any[], parameterName: string, reportParameterName: string } =
    {
      allowedParameters: undefined,
      parameterName: undefined,
      reportParameterName: undefined
    };
  /** Columns to be displayed in report parameters table. */
  displayedColumns: string[] = ['parameterName', 'parameterNamePassed', 'actions'];
  /** Data source for report parameters table. */
  dataSource: MatTableDataSource<any>;
  /** Report Parameters Data. */
  reportParametersData: any[] = [];
  /** Paginator for report parameters table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for report parameters table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the report template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog Reference.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { reportTemplate: any }) => {
      this.reportTemplateData = data.reportTemplate;
      this.dataForDialog.allowedParameters = this.reportTemplateData.allowedParameters;
    });
  }

  /**
   * Creates the report form.
   */
  ngOnInit() {
    this.createReportForm();
    this.toggleVisibility();
    this.setReportParameters();
  }

  /**
   * Initializes the data source, paginator and sorter for report parameters table.
   */
  setReportParameters() {
    this.dataSource = new MatTableDataSource(this.reportParametersData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Creates the report form.
   */
  createReportForm() {
    this.reportForm = this.formBuilder.group({
      'reportName': ['', Validators.required],
      'reportCategory': [''],
      'description': [''],
      'reportType': ['', Validators.required],
      'reportSubType': [{ value: '', disabled: true }],
      'useReport': [false],
      'reportSql': ['', Validators.required]
    });
  }

  /**
   * Adds a new report parameter.
   */
  addReportParameter() {
    this.dataForDialog.parameterName = undefined;
    this.dataForDialog.reportParameterName = undefined;
    const addReportParameterDialogRef = this.dialog.open(ReportParameterDialogComponent, {
      data: this.dataForDialog
    });
    addReportParameterDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.reportParametersData.push({ id: '',
                                         parameterName: this.reportTemplateData.allowedParameters.find((allowedParameter: any) => allowedParameter.id === response.parameterName).parameterName,
                                         parameterId: response.parameterName,
                                         reportParameterName: response.reportParameterName });
        this.dataSource.connect().next(this.reportParametersData);
      }
    });
  }

  /**
   * Edits report parameter.
   * @param {any} reportParameter Report Parameter.
   */
  editReportParameter(reportParameter: any) {
    this.dataForDialog.parameterName = reportParameter.parameterId;
    this.dataForDialog.reportParameterName = reportParameter.reportParameterName;
    const editReportParameterDialogRef = this.dialog.open(ReportParameterDialogComponent, {
      data: this.dataForDialog
    });
    editReportParameterDialogRef.afterClosed().subscribe((response: any) => {
      if (response !== '') {
        this.reportParametersData[this.reportParametersData.indexOf(reportParameter)] = { id: '',
          parameterName: this.reportTemplateData.allowedParameters.find((allowedParameter: any) => allowedParameter.id === response.parameterName).parameterName,
          parameterId: response.parameterName,
          reportParameterName: response.reportParameterName };
        this.dataSource.connect().next(this.reportParametersData);
      }
    });
  }

  /**
   * Deletes the report parameter.
   * @param {any} reportParameter Report Parameter.
   */
  deleteReportParameter(reportParameter: any) {
    const deleteReportDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `report parameter ${reportParameter.parameterName}` }
    });
    deleteReportDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.reportParametersData.splice(this.reportParametersData.indexOf(reportParameter), 1);
        this.dataSource.connect().next(this.reportParametersData);
      }
    });
  }

  /**
   * Toggles the visibility status of Report Sub Type dropdown.
   */
  toggleVisibility() {
    this.reportForm.get('reportType').valueChanges
      .subscribe(type => {
        switch (type) {
          case 'Chart':
            this.reportForm.get('reportSubType').enable();
            this.reportForm.get('reportSql').enable();
            break;
          case 'Pentaho':
            this.reportForm.get('reportSql').disable();
            this.reportForm.get('reportSubType').disable();
            break;
          default:
            this.reportForm.get('reportSql').enable();
            this.reportForm.get('reportSubType').disable();
        }
      });
  }

  /**
   * Submits the report form and creates report,
   * if successful redirects to view created report.
   */
  submit() {
    this.reportForm.value.reportParameters = this.reportParametersData.map( function(reportParameter: any) {
      reportParameter.parameterName = undefined;
      return reportParameter;
    });
    this.systemService.createReport(this.reportForm.value)
      .subscribe((response: any) => {
        // TODO: Implement Maker Checker Component.
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
      });
  }

}
