/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
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
  taxGroupData: any;
  /** Columns to be displayed in tax group table. */
  displayedColumns: string[] = ['name'];
  /** Data source for tax group table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tax group table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for tax group table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the tax group data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { taxGroups: any }) => {
      this.taxGroupData = data.taxGroups;
    });
  }

  /**
   * Filters data in tax component table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tax group table.
   */
  ngOnInit() {
    this.setTaxGroups();
  }

  /**
   * Initializes the data source, paginator and sorter for tax group table.
   */
  setTaxGroups() {
    this.dataSource = new MatTableDataSource(this.taxGroupData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
