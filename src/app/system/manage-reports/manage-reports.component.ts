/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Manage Reports component.
 */
@Component({
  selector: 'mifosx-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss']
})
export class ManageReportsComponent implements OnInit {

  /** Reports data. */
  reportData: any;
  /** Columns to be displayed in manage reports table. */
  displayedColumns: string[] = ['reportName', 'reportType', 'reportSubType', 'reportCategory', 'coreReport', 'useReport'];
  /** Data source for manage reports table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage reports table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for manage reports table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { reports: any }) => {
      this.reportData = data.reports;
    });
  }

  /**
   * Filters data in manage reports table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the manage reports table.
   */
  ngOnInit() {
    this.setReports();
  }

  /**
   * Initializes the data source, paginator and sorter for manage reports table.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
