/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'mifosx-member-groups',
  templateUrl: './member-groups.component.html',
  styleUrls: ['./member-groups.component.scss']
})
export class MemberGroupsComponent implements OnInit {

  /** Columns to be displayed in the member groups table. */
  displayedColumns: string[] = ['accountNo', 'name'];
  /** Data source for member groups table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for member groups table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for member groups table. */
  @ViewChild(MatSort) sort: MatSort;

  /** Member Group Data Setter */
  @Input() set memberGroupData(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor() { }

  /**
   * Filters data in member groups table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() { }

}
