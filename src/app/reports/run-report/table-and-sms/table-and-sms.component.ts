/** Angular Imports */
import { Component, Input, ViewChild, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DecimalPipe } from '@angular/common';

/** Custom Servies */
import { ReportsService } from '../../reports.service';

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

  /** Paginator for run-report table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;

  /**
   * @param {ReportsService} reportsService Reports Service
   * @param {DecimalPipe} decimalPipe Decimal Pipe
   */
  constructor(private reportsService: ReportsService,
              private decimalPipe: DecimalPipe ) { }

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
    this.reportsService.getRunReportData(this.dataObject.report.name, this.dataObject.formData)
    .subscribe( (res: any) => {
      this.csvData = res.data;
      this.setOutputTable(res.data);
      res.columnHeaders.forEach((header: any) => {
        this.columnTypes.push(header.columnDisplayType);
        this.displayedColumns.push(header.columnName);
      });
      this.hideOutput = false;
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
  downloadCSV() {
    const headers = this.displayedColumns;
    let csv = this.csvData.map((object: any) => object.row.join());
    csv.unshift(`data:text/csv;charset=utf-8,${headers.join()}`);
    csv = csv.join('\r\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `${this.dataObject.report.name}.csv`);
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
