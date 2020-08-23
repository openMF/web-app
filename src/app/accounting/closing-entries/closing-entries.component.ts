/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { startWith, map } from 'rxjs/operators';

/**
 * Closing entries component.
 */
@Component({
  selector: 'mifosx-closing-entries',
  templateUrl: './closing-entries.component.html',
  styleUrls: ['./closing-entries.component.scss']
})
export class ClosingEntriesComponent implements OnInit {

  /** Columns to be displayed in closing entries table. */
  displayedColumns: string[] = ['officeName', 'closingDate', 'comments', 'createdByUsername'];
  /** Data source for closing entries table. */
  dataSource: MatTableDataSource<any>;
  /** Office name filter form control. */
  officeName = new FormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** GL Account closure data. */
  glAccountClosureData: any;

  /** Paginator for closing entries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for closing entries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the offices and gl account closures data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: {
      offices: any,
      glAccountClosures: any
    }) => {
      this.officeData = data.offices;
      this.glAccountClosureData = data.glAccountClosures;
    });
  }

  /**
   * Sets the filter and closing entries table.
   */
  ngOnInit() {
    this.applyFilter();
    this.setFilteredOffices();
    this.setAccountingClosures();
  }

  /**
   * Filters data in closing entries table based on office name.
   */
  applyFilter() {
    this.officeName.valueChanges.subscribe((filterValue: string) => {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    });
  }

  /**
   * Initializes the data source, paginator and sorter for closing entries table.
   */
  setAccountingClosures() {
    this.dataSource = new MatTableDataSource(this.glAccountClosureData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Sets filtered offices for autocomplete.
   */
  setFilteredOffices() {
    this.filteredOfficeData = this.officeName.valueChanges
    .pipe(
      startWith(''),
      map((office: any) => typeof office === 'string' ? office : office.name),
      map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData)
    );
  }

  /**
   * Filters offices.
   * @param {string} officeName Office name to filter office by.
   * @returns {any} Filtered offices.
   */
  private filterOfficeAutocompleteData(officeName: string): any {
    return this.officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

}
