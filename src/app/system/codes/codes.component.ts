/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./codes.component.scss']
})
export class CodesComponent implements OnInit {

  /** Codes data. */
  codesData: any;
  /** Columns to be displayed in codes table. */
  displayedColumns: string[] = ['name', 'systemDefined'];
  /** Data source for codes table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for codes table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the codes data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { codes: any }) => {
      this.codesData = data.codes;
    });
  }

  /**
   * Sets the codes table.
   */
  ngOnInit() {
    this.setCodes();
  }

  /**
   * Initializes the data source, paginator and sorter for codes table.
   */
  setCodes() {
    this.dataSource = new MatTableDataSource(this.codesData);
    console.log(this.codesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in codes table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
