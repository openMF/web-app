/** Angular Imports */
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Charges component.
 */
@Component({
  selector: 'mifosx-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent implements OnInit {

  /** Charge data. */
  chargeData: any;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = ['name', 'chargeAppliesTo', 'penalty', 'active'];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for charges table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for charges table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the charges data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { charges: any }) => {
      this.chargeData = data.charges;
    });
  }

  /**
   * Filters data in charges table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the charges table.
   */
  ngOnInit() {
    this.setCharges();
  }

  /**
   * Initializes the data source, paginator and sorter for charges table.
   */
  setCharges() {
    this.dataSource = new MatTableDataSource(this.chargeData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (charge: any, property: any) => {
      switch (property) {
        case 'chargeAppliesTo': return charge.chargeAppliesTo.value;
        default: return charge[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

}
