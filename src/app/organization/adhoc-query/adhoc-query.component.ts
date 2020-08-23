/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Adhoc Query component.
 */
@Component({
  selector: 'mifosx-adhoc-query',
  templateUrl: './adhoc-query.component.html',
  styleUrls: ['./adhoc-query.component.scss']
})
export class AdhocQueryComponent implements OnInit {

  /** Adhoc Queries data. */
  adhocQueriesData: any;
  /** Columns to be displayed in adhoc queries table. */
  displayedColumns: string[] = ['name', 'query', 'tableName', 'email', 'reportRunFrequency', 'isActive', 'createdBy'];
  /** Data source for adhoc queries table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for adhoc queries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for adhoc queries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the adhoc queries data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { adhocQueries: any }) => {
      this.adhocQueriesData = data.adhocQueries;
    });
  }

  /**
   * Filters data in adhoc queries table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the adhoc queries table.
   */
  ngOnInit() {
    this.setAdhocQueries();
    this.setReportRunFrequency();
  }

  /**
   * Sets report run frequency to its corresponding values
   */
  setReportRunFrequency() {
    for (let i = 0; i < this.adhocQueriesData.length; i++) {
      for (let j = 0; j < this.adhocQueriesData[i].reportRunFrequencies.length; j++) {
        if (this.adhocQueriesData[i].reportRunFrequencies[j].id === this.adhocQueriesData[i].reportRunFrequency) {
          this.adhocQueriesData[i].reportRunFrequency = this.adhocQueriesData[i].reportRunFrequencies[j].value;
        }
      }
    }
  }

  /**
   * Initializes the data source, paginator and sorter for adhoc queries table.
   */
  setAdhocQueries() {
    this.dataSource = new MatTableDataSource(this.adhocQueriesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
