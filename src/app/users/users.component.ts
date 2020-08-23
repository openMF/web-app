/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Users component.
 */
@Component({
  selector: 'mifosx-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  /** Users data. */
  usersData: any;
  /** Columns to be displayed in users table. */
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'officeName'];
  /** Data source for users table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for users table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for users table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the users data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { users: any }) => {
      this.usersData = data.users;
    });
  }

  /**
   * Filters data in users table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the users table.
   */
  ngOnInit() {
    this.setUsers();
  }

  /**
   * Initializes the data source, paginator and sorter for users table.
   */
  setUsers() {
    this.dataSource = new MatTableDataSource(this.usersData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
