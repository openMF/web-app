/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-floating-rates',
  templateUrl: './floating-rates.component.html',
  styleUrls: ['./floating-rates.component.scss']
})
export class FloatingRatesComponent implements OnInit {

  /** Floating Rates data. */
  floatingRatesData: any;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = ['name', 'createdBy', 'isBaseLendingRate', 'active'];
  /** Data source for floating-rates table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for floating-rates table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for floating-rates table. */
  @ViewChild(MatSort) sort: MatSort;

   /**
    * Retrieves the floating rates data from `resolve`.
    * @param {ActivatedRoute} route Activated Route.
    */
    constructor(private route: ActivatedRoute) {
      this.route.data.subscribe(( data: { floatingRates: any }) => {
        this.floatingRatesData = data.floatingRates;
      });
    }

  /**
   * Filters data in floating rates table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.setFloatingRates();
  }

  /**
   * Initializes the data source, paginator and sorter for floating rates table.
   */
  setFloatingRates() {
    this.dataSource = new MatTableDataSource(this.floatingRatesData);
    this.dataSource.paginator = this.paginator;
  }
}
