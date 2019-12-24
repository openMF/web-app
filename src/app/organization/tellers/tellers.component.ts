/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Tellers component.
 */
@Component({
  selector: 'mifosx-tellers',
  templateUrl: './tellers.component.html',
  styleUrls: ['./tellers.component.scss']
})
export class TellersComponent implements OnInit {

  /** Tellers data. */
  tellersData: any;
  /** Columns to be displayed in tellers table. */
  displayedColumns: string[] = ['officeName', 'name', 'status', 'startDate', 'actions'];
  /** Data source for tellers table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tellers table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for tellers table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the tellers data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { tellers: any }) => {
      this.tellersData = data.tellers;
    });
  }

  /**
   * Filters data in tellers table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tellers table.
   */
  ngOnInit() {
    this.setTellers();
  }

  /**
   * Initializes the data source, paginator and sorter for tellers table.
   */
  setTellers() {
    this.dataSource = new MatTableDataSource(this.tellersData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
