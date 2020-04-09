/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Configure Maker Checker Tasks Component
 */
@Component({
  selector: 'mifosx-configure-maker-checker-tasks',
  templateUrl: './configure-maker-checker-tasks.component.html',
  styleUrls: ['./configure-maker-checker-tasks.component.scss']
})
export class ConfigureMakerCheckerTasksComponent implements OnInit {

  /** List of Maker Checker Permissions. */
  permissions: any;
  /** Columns to be displayed in Permissions table. */
  displayedColumns: string[] = ['name', 'enabled', 'action'];
  /** Data source for Permssions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for Permissions table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for Permissions table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the Permissions List from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private systemService: SystemService,
              private router: Router) {
    this.route.data.subscribe((data: { permissions: any }) => {
      this.permissions = data.permissions;
    });
  }

  /**
   * Sets the Permissions table.
   */
  ngOnInit() {
    this.setPermissions();
  }

  /**
   * Initializes the data source, paginator and sorter for Permissions table.
   */
  setPermissions() {
    this.dataSource = new MatTableDataSource(this.permissions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in Permissions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Enables/Disables respective Maker Checker Permission
   */
  toggleStatus(permission: any) {
    this.systemService.updateMakerCheckerPermission(permission.code, !permission.selected )
      .subscribe((response: any) => {
        permission.selected = response.changes.permissions[permission.code];
      });
  }

}
