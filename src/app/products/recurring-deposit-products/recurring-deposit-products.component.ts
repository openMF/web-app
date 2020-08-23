/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Recurring Deposit Products component.
 */
@Component({
  selector: 'mifosx-recurring-deposit-products',
  templateUrl: './recurring-deposit-products.component.html',
  styleUrls: ['./recurring-deposit-products.component.scss']
})
export class RecurringDepositProductsComponent implements OnInit {

  /** Data table data. */
  recurringDepositProductData: any;
  /** Columns to be displayed in recurring deposit products table. */
  displayedColumns: string[] = ['name', 'shortName'];
  /** Data source for recurring deposit products table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for recurring deposit products table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for recurring deposit products table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the recurring deposit products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { recurringDepositProducts: any }) => {
      this.recurringDepositProductData = data.recurringDepositProducts;
    });
  }

  /**
   * Filters data in recurring deposit products table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the recurring deposit products table.
   */
  ngOnInit() {
    this.setRecurringDepositProducts();
  }

  /**
   * Initializes the data source, paginator and sorter for recurring deposit products table.
   */
  setRecurringDepositProducts() {
    this.dataSource = new MatTableDataSource(this.recurringDepositProductData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
