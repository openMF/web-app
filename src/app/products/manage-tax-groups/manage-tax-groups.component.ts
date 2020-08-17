/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Manage Tax Groups component.
 */
@Component({
  selector: 'mifosx-manage-tax-groups',
  templateUrl: './manage-tax-groups.component.html',
  styleUrls: ['./manage-tax-groups.component.scss']
})
export class ManageTaxGroupsComponent implements OnInit {

  /** Tax Groups data. */
  taxGroupsData: any;
  /** Columns to be displayed in tax groups table. */
  displayedColumns: string[] = ['name'];
  /** Data source for tax groups table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tax groups table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for tax groups table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the tax groups data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { taxGroups: any }) => {
      this.taxGroupsData = data.taxGroups;
    });
  }

  /**
   * Filters data in tax groups table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tax groups table.
   */
  ngOnInit() {
    this.setTaxGroups();
  }

  /**
   * Initializes the data source, paginator and sorter for tax groups table.
   */
  setTaxGroups() {
    this.dataSource = new MatTableDataSource(this.taxGroupsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
