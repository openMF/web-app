/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Manage Hooks component.
 */
@Component({
  selector: 'mifosx-manage-hooks',
  templateUrl: './manage-hooks.component.html',
  styleUrls: ['./manage-hooks.component.scss']
})
export class ManageHooksComponent implements OnInit {

  /** Hook data. */
  hookData: any;
  /** Columns to be displayed in manage hooks table. */
  displayedColumns: string[] = ['name', 'displayName', 'isActive'];
  /** Data source for manage hooks table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage hooks table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for manage hooks table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the hooks data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { hooks: any }) => {
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
