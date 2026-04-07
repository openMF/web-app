/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Cashiers component.
 */
@Component({
  selector: 'mifosx-cashiers',
  templateUrl: './cashiers.component.html',
  styleUrls: ['./cashiers.component.scss'],
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
    MatPaginator,
    DateFormatPipe,
    YesnoPipe
  ]
})
export class CashiersComponent implements OnInit {
  /** Cashiers data. */
  cashiersData: any;
  /** Columns to be displayed in cashiers table. */
  displayedColumns: string[] = [
    'period',
    'staffName',
    'isFullDay',
    'vaultActions'
  ];
  /** Data source for cashiers table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for cashiers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for cashiers table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the cashiers data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { cashiersData: any }) => {
      this.cashiersData = data.cashiersData.cashiers;
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

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}
