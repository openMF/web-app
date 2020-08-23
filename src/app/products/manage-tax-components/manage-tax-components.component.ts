/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Manage Tax Components component.
 */
@Component({
  selector: 'mifosx-manage-tax-components',
  templateUrl: './manage-tax-components.component.html',
  styleUrls: ['./manage-tax-components.component.scss']
})
export class ManageTaxComponentsComponent implements OnInit {

  /** Tax Components data. */
  taxComponentData: any;
  /** Columns to be displayed in tax component table. */
  displayedColumns: string[] = ['name', 'percentage'];
  /** Data source for tax component table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tax component table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for tax component table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the tax component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { taxComponents: any }) => {
      this.taxComponentData = data.taxComponents;
    });
  }

  /**
   * Filters data in tax component table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tax component table.
   */
  ngOnInit() {
    this.setTaxComponents();
  }

  /**
   * Initializes the data source, paginator and sorter for tax component table.
   */
  setTaxComponents() {
    this.dataSource = new MatTableDataSource(this.taxComponentData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
