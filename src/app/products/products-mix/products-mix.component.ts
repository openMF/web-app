/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Products Mix component.
 */
@Component({
  selector: 'mifosx-products-mix',
  templateUrl: './products-mix.component.html',
  styleUrls: ['./products-mix.component.scss']
})
export class ProductsMixComponent implements OnInit {

  /** productMix data. */
  productMixData: any;
  /** Columns to be displayed in products mix table. */
  displayedColumns: string[] = ['productName'];
  /** Data source for products mix table. */
  dataSource: MatTableDataSource<any>;
  /** Paginator for manage data tables table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for manage data tables table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { products: any }) => {
      this.productMixData = data.products;
    });
  }

  /**
   * Filters data in products mix table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the products mix table.
   */
  ngOnInit() {
    this.setProductsMix();
  }

  /**
   * Initializes the data source, paginator and sorter for products mix table.
   */
  setProductsMix() {
    this.dataSource = new MatTableDataSource(this.productMixData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
