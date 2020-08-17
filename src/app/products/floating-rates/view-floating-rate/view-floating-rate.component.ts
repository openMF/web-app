/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * View Floating Rate Component.
 */
@Component({
  selector: 'mifosx-view-floating-rate',
  templateUrl: './view-floating-rate.component.html',
  styleUrls: ['./view-floating-rate.component.scss']
})
export class ViewFloatingRateComponent implements OnInit {

  /** Floating Rate Data. */
  floatingRateData: any;
  /** Columns to be displayed in floating rate periods table. */
  displayedColumns: string[] = ['fromDate', 'interestRate', 'isDifferential'];
  /** Data source for floating rate periods table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for floating rate periods table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for floating rate periods table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the floating rate data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { floatingRate: any } ) => {
      this.floatingRateData = data.floatingRate;
    });
  }

  /**
   * Sets the floating rate periods table.
   */
  ngOnInit() {
    this.setFloatingRates();
  }

  /**
   * Initializes the data source, paginator and sorter for floating rate periods table.
   */
  setFloatingRates() {
   this.dataSource = new MatTableDataSource(this.floatingRateData.ratePeriods);
   this.dataSource.paginator = this.paginator;
   this.dataSource.sort = this.sort;
  }

}
