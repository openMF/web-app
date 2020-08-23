/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Reports component.
 */
@Component({
  selector: 'mifosx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  /** Reports data. */
  reportsData: any;
  /** Report category filter. */
  filter: string;
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = ['reportName', 'reportType', 'reportCategory'];
  /** Data source for reports table. */
  dataSource = new MatTableDataSource();

  /** Paginator for reports table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for reports table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * Prevents reuse of route parameter `filter`.
   * @param {Router} router: Router.
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.data.subscribe(( data: { reports: any }) => {
      this.reportsData = data.reports;
    });
    this.filter = this.route.snapshot.params['filter'];
  }

  /*
   *Sets and filters the reports table by category.
   */
  ngOnInit() {
    this.setReports();
    this.filterReportsByCategory();
  }

  /**
   * Switches filterPredicate if filterValue is not null.
   * @param {string} filterValue filter string for mat-table.
   */
  applyFilter(filterValue: string) {
    if (filterValue.length) {
        this.setCustomFilterPredicate();
        this.dataSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.filterReportsByCategory();
    }
  }

  /**
   * Initializes the data source, paginator and sorter for reports table.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters the data source only for report category passed in route params.
   */
  filterReportsByCategory() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.reportCategory === filter;
    };
    this.dataSource.filter = this.filter;
  }

  /**
   *  Filters Reports for filter value string and report category.
   */
  setCustomFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
        /** Transform the data into a lowercase string of all property values. */
        const dataStr = Object.keys(data).reduce(function (currentTerm: string, key: string) {
            /** Use an obscure Unicode character to delimit the words in the concatenated string.
             * This avoids matches where the values of two columns combined will match the user's query
             */
            return currentTerm + ((/** @type {any} */ (data)))[key] + '◬';
        }, '').toLowerCase();
        /** Transform the filter by converting it to lowercase and removing whitespace. */
        const transformedFilter = filter.trim().toLowerCase();
        /* Seperates filter for All reports page.*/
        if (this.filter) {
          return dataStr.indexOf(transformedFilter) !== -1 && data.reportCategory === this.filter;
        } else {
          return dataStr.indexOf(transformedFilter) !== -1;
        }
    };
  }

}
