/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Roles and Permissions component.
 */
@Component({
  selector: 'mifosx-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent implements OnInit {

  /** Role data. */
  roleData: any;
  /** Columns to be displayed in roles and permissions table. */
  displayedColumns: string[] = ['name', 'description', 'disabled', 'actions'];
  /** Data source for roles and permissions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for roles and permissions table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for roles and permissions table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the roles data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { roles: any }) => {
      this.roleData = data.roles;
    });
  }

  /**
   * Filters data in roles and permissions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the roles and permissions table.
   */
  ngOnInit() {
    this.setRoles();
  }

  /**
   * Stops the propagation to view roles and permissions
   * @param event Mouse Event
   */
  routeEdit(event: MouseEvent) {
    event.stopPropagation();
  }

  /**
   * Initializes the data source, paginator and sorter for roles and permissions table.
   */
  setRoles() {
    this.dataSource = new MatTableDataSource(this.roleData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
