/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/**
 * Cashiers component.
 */
@Component({
  selector: 'mifosx-cashiers',
  templateUrl: './cashiers.component.html',
  styleUrls: ['./cashiers.component.scss']
})
export class CashiersComponent implements OnInit {

  /** Cashiers data. */
  cashiersData: any;
  /** Columns to be displayed in cashiers table. */
  displayedColumns: string[] = ['period', 'staffName', 'isFullDay', 'vaultActions'];
  /** Data source for cashiers table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for cashiers table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for cashiers table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the cashiers data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { cashiersData: any }) => {
      this.cashiersData = data.cashiersData.cashiers;
      console.log(this.cashiersData);
    });
  }

  /**
   * Filters data in cashiers table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the cashiers table.
   */
  ngOnInit() {
    this.setCashiers();
  }

  /**
   * Initializes the data source, paginator and sorter for cashiers table.
   */
  setCashiers() {
    this.dataSource = new MatTableDataSource(this.cashiersData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
