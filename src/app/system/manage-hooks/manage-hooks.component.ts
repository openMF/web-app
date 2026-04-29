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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Hooks Component.
 */
@Component({
  selector: 'mifosx-manage-hooks',
  templateUrl: './manage-hooks.component.html',
  styleUrls: ['./manage-hooks.component.scss'],
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
export class ManageHooksComponent implements OnInit {
  /** Hook data. */
  hookData: any;
  /** Columns to be displayed in manage hooks table. */
  displayedColumns: string[] = [
    'name',
    'displayName',
    'isActive'
  ];
  /** Data source for manage hooks table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage hooks table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage hooks table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the hooks data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { hooks: any }) => {
      this.hookData = data.hooks;
    });
  }

  /**
   * Filters data in manage data tables table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the manage hooks table.
   */
  ngOnInit() {
    this.setHooks();
  }

  /**
   * Initializes the data source, paginator and sorter for manage hooks table.
   */
  setHooks() {
    this.dataSource = new MatTableDataSource(this.hookData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
