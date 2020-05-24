 /** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/**
 * Dividends component.
 */
@Component({
  selector: 'mifosx-dividends-share-product',
  templateUrl: './dividends.component.html',
  styleUrls: ['./dividends.component.scss']
})
export class ShareProductsDividendsComponent implements OnInit {

  /** Dividends data. */
  dividendData: any;
  /** Columns to be displayed in dividends table. */
  displayedColumns: string[] = ['name', 'dividendPeriodStartDate', 'dividendPeriodEndDate', 'amount', 'status'];
  /** Data source for accounting rules table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for dividends table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for dividends table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the dividends data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: {dividends: any}) => {
      this.dividendData = data.dividends.pageItems;
    });
   }

  /**
   * Sets the dividends table.
   */
  ngOnInit() {
    this.setDividends();
  }

  /**
   * Initializes the data source, paginator and sorter for dividends table.
   */
  setDividends() {
    this.dataSource = new MatTableDataSource(this.dividendData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in dividends table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
