/** Angular Imports */
import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DecimalPipe, NumberSymbol, getLocaleNumberSymbol } from '@angular/common';

/** Custom Servies */
import { ReportsService } from '../../reports.service';
import { MatDialog } from '@angular/material/dialog';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { environment } from 'environments/environment';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';

/**
 * Table and SMS Component
 */
@Component({
  selector: 'mifosx-table-and-sms',
  templateUrl: './table-and-sms.component.html',
  styleUrls: ['./table-and-sms.component.scss']
})
export class TableAndSmsComponent implements OnChanges {

  /** Run Report Data */
  @Input() dataObject: any;

  /** Columns to be displayed in mat-table */
  displayedColumns: string[] = [];
  /** Data source for run-report table. */
  dataSource = new MatTableDataSource();
  /** Maps column name to type */
  columnTypes: any[] = [];
  /** substitute for resolver */
  hideOutput = true;
  /** Data to be converted into CSV file */
  csvData: any;
  notExistsReportData = false;
  toBeExportedToRepo = false;

  /** Paginator for run-report table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;

  /**
   * @param {ReportsService} reportsService Reports Service
   * @param {DecimalPipe} decimalPipe Decimal Pipe
   */
  constructor(private reportsService: ReportsService,
          public dialog: MatDialog,
          private decimalPipe: DecimalPipe,
          private progressBarService: ProgressBarService) { }

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.columnTypes = [];
    this.displayedColumns = [];
    this.getRunReportData();
  }

  getRunReportData() {
    const exportS3 = this.dataObject.formData.exportS3;
    this.reportsService.getRunReportData(this.dataObject.report.name, this.dataObject.formData)
    .subscribe( (res: any) => {
      this.toBeExportedToRepo = exportS3;
      if (!this.toBeExportedToRepo) {
        this.csvData = res.data;
        this.notExistsReportData = (res.data.length === 0);
        this.setOutputTable(res.data);
        res.columnHeaders.forEach((header: any) => {
          this.columnTypes.push(header.columnDisplayType);
          this.displayedColumns.push(header.columnName);
        });
      }
      this.hideOutput = false;
      this.progressBarService.decrease();
    });
  }

  /**
   * Sets up a dynamic Mat Table.
   * @param {any} data Mat Table data
   */
  setOutputTable(data: any) {
    this.dataSource = new MatTableDataSource(data);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Generates the CSV file dynamically for run report data.
   */
  exportFile() {
    const delimiterOptions: any[] = [
      {name: 'Comma (,)', char: ','},
      {name: 'Colon (:)', char: ':'},
      {name: 'SemiColon (;)', char: ';'},
      {name: 'Pipe (|)', char: '|'},
      {name: 'Space ( )', char: ' '},
    ];
    const fileName = `${this.dataObject.report.name}.csv`;
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'delimiter',
        label: 'Delimiter',
        value: environment.defaultCharDelimiter,
        options: { label: 'name', value: 'char', data: delimiterOptions },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'fileName',
        label: 'File Name',
        value: fileName,
        type: 'text',
        required: true,
        order: 2
      })
    ];
    const data = {
      title: 'Export data to File',
      layout: { addButtonText: 'Export to File' },
      formfields: formfields
    };
    const exportDialogRef = this.dialog.open(FormDialogComponent, { data });
    exportDialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (response.data) {
        this.downloadCSV(response.data.value.fileName, response.data.value.delimiter);
      }
    });
  }

  /**
   * Generates the CSV file dynamically for run report data.
   */
  downloadCSV(fileName: string, delimiter: string) {
    const headers = this.displayedColumns;
    let csv = this.csvData.map((object: any) => object.row.join(delimiter));
    csv.unshift(`data:text/csv;charset=utf-8,${headers.join(delimiter)}`);
    csv = csv.join('\r\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Returns number formatted as per user's decimal choice.
   * @param {number} value Value to be formatted as per decimal choice.
   */
  toDecimal(value: number) {
    const decimalChoice = this.dataObject.decimalChoice;
    return this.decimalPipe.transform(value, `1.${decimalChoice}-${decimalChoice}`);
  }

  /**
   * Checks the weather Mat-Table column has decimal display type.
   * @param {number} index Index of column.
   */
  isDecimal(index: number) {
    return this.columnTypes[index] === 'DECIMAL';
  }

}
