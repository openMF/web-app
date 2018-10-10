import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'mifosx-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./codes.component.scss']
})
export class CodesComponent implements OnInit {

  /** Codes data. */
  codesData: any;
  /** Columns to be displayed in codes table. */
  displayedColumns: string[] = ['codeName', 'systemDefined'];
  /** Data source for codes table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for codes table. */
  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  ngOnInit() {
  }

}
