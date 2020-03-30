/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Holidays component.
 */
@Component({
  selector: 'mifosx-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit {

  /** Holidays data. */
  holidaysData: any;
  /** Columns to be displayed in holidays table. */
  displayedColumns: string[] = ['displayName', 'startDate', 'endDate', 'repaymentScheduleTo', 'status'];
  /** Data source for holidays table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for holidays table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for holidays table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the holidays data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { holidays: any }) => {
      this.holidaysData = data.holidays;
    });
  }

  /**
   * Filters data in holidays table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the holidays table.
   */
  ngOnInit() {
    this.setHolidays();
  }

  /**
   * Initializes the data source, paginator and sorter for holidays table.
   */
  setHolidays() {
    this.dataSource = new MatTableDataSource(this.holidaysData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
