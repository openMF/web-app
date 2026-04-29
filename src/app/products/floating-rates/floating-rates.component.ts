/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Floating Rates Component.
 */
@Component({
  selector: 'mifosx-floating-rates',
  templateUrl: './floating-rates.component.html',
  styleUrls: ['./floating-rates.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class FloatingRatesComponent implements OnInit {
  /** Floating Rates data. */
  floatingRatesData: any;
  /** Columns to be displayed in floating rates table. */
  displayedColumns: string[] = [
    'name',
    'createdBy',
    'isBaseLendingRate',
    'isActive'
  ];
  /** Data source for floating rates table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for floating rates table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for floating rates table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the floating rates data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { floatingrates: any }) => {
      this.floatingRatesData = data.floatingrates;
    });
  }

  /**
   * Filters data in floating rates table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the floating rates table.
   */
  ngOnInit() {
    this.setFloatingRates();
  }

  /**
   * Initializes the data source, paginator and sorter for floating rates table.
   */
  setFloatingRates() {
    this.dataSource = new MatTableDataSource(this.floatingRatesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
