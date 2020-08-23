/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Employees component.
 */
@Component({
  selector: 'mifosx-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

  /** Employees data. */
  employeesData: any;
  /** Columns to be displayed in employees table. */
  displayedColumns: string[] = ['displayName', 'isLoanOfficer', 'officeName', 'isActive'];
  /** Data source for employees table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for employees table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for employees table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the employees data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { employees: any }) => {
      this.employeesData = data.employees;
    });
  }

  /**
   * Filters data in employees table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the employees table.
   */
  ngOnInit() {
    this.setEmployees();
  }

  /**
   * Initializes the data source, paginator and sorter for employees table.
   */
  setEmployees() {
    this.dataSource = new MatTableDataSource(this.employeesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
