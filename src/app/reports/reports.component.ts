/** Angular Imports */
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/**
 * Reports component.
 */
@Component({
  selector: 'mifosx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  /** Report data. */
  reportData: any;
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = ['reportName', 'reportType', 'reportCategory'];
  /** Data source for reports table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for reports table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for reports table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { reports: any }) => {
      this.reportData = data.reports;
    });
    this.route.params.subscribe((params: Params) => {
      this.filter = params['filter'];
    });
  }

  /**
   * Filters data in reports table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the reports table.
   */
  ngOnInit() {
    this.setReports();
  }

  /**
   * Initializes the data source, paginator and sorter for reports table.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
