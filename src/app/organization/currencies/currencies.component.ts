/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Currencies component.
 */
@Component({
  selector: 'mifosx-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent implements OnInit {

  /** Currencies data. */
  currenciesData: any;
  /** Columns to be displayed in currencies table. */
  displayedColumns: string[] = ['name', 'code'];
  /** Data source for currencies table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for currencies table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for currencies table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { currencies: any }) => {
      this.currenciesData = data.currencies.selectedCurrencyOptions;
    });
  }

  /**
   * Filters data in currencies table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the currencies table.
   */
  ngOnInit() {
    this.setCurrencies();
  }

  /**
   * Initializes the data source, paginator and sorter for currencies table.
   */
  setCurrencies() {
    this.dataSource = new MatTableDataSource(this.currenciesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
