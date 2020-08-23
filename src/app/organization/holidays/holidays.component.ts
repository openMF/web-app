/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

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

  /** Office selector. */
  officeSelector = new FormControl();
  /** Holidays data. */
  holidaysData: any;
  /** Offices data. */
  officeData: any;
  /** Columns to be displayed in holidays table. */
  displayedColumns: string[] = ['name', 'fromDate', 'toDate', 'repaymentsRescheduledTo', 'status'];
  /** Data source for holidays table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for holidays table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for holidays table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { offices: any }) => {
      this.officeData = data.offices;
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
   * Retrieves holidays data on changing office.
   */
  ngOnInit() {
    this.onChangeOffice();
  }

  /**
   * Retrieves the holidays data on changing office and sets the holidays table.
   */
  onChangeOffice() {
    this.officeSelector.valueChanges.subscribe((officeId = this.officeSelector.value) => {
      this.holidaysData = [];
      this.organizationService.getHolidays(officeId).subscribe((holidays: any) => {
        this.holidaysData = holidays.filter((holiday: any) => holiday.status.value !== 'Deleted');
        this.setHolidays();
      });
    });
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
