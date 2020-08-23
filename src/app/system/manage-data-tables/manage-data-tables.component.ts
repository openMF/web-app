/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Manage Data Tables component.
 */
@Component({
  selector: 'mifosx-manage-data-tables',
  templateUrl: './manage-data-tables.component.html',
  styleUrls: ['./manage-data-tables.component.scss']
})
export class ManageDataTablesComponent implements OnInit {

  /** Data table data. */
  dataTableData: any;
  /** Columns to be displayed in manage data tables table. */
  displayedColumns: string[] = ['registeredTableName', 'applicationTableName'];
  /** Data source for manage data tables table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage data tables table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage data tables table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the data tables data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { dataTables: any }) => {
      this.dataTableData = data.dataTables;
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
   * Sets the manage data tables table.
   */
  ngOnInit() {
    this.setDataTables();
  }

  /**
   * Initializes the data source, paginator and sorter for manage data tables table.
   */
  setDataTables() {
    this.dataSource = new MatTableDataSource(this.dataTableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
