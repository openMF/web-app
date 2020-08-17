/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Fixed Deposit Products component.
 */
@Component({
  selector: 'mifosx-fixed-deposit-products',
  templateUrl: './fixed-deposit-products.component.html',
  styleUrls: ['./fixed-deposit-products.component.scss']
})
export class FixedDepositProductsComponent implements OnInit {

  /** Fixed deposit products data. */
  fixedDepositProductData: any;
  /** Columns to be displayed in fixed deposit products table. */
  displayedColumns: string[] = ['name', 'shortName'];
  /** Data source for fixed deposit products table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for fixed deposit products table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for fixed deposit products table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the fixed deposit products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { fixedDepositProducts: any }) => {
      this.fixedDepositProductData = data.fixedDepositProducts;
    });
  }

  /**
   * Filters data in fixed deposit products table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the fixed deposit products table.
   */
  ngOnInit() {
    this.setFixedDepositProducts();
  }

  /**
   * Initializes the data source, paginator and sorter for fixed deposit products table.
   */
  setFixedDepositProducts() {
    this.dataSource = new MatTableDataSource(this.fixedDepositProductData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
