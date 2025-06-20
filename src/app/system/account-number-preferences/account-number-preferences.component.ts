/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Account Number Preferences Component.
 */
@Component({
  selector: 'mifosx-account-number-preferences',
  templateUrl: './account-number-preferences.component.html',
  styleUrls: ['./account-number-preferences.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class AccountNumberPreferencesComponent implements OnInit {
  /** Account Number Preferences data. */
  accountNumberPreferencesData: any;
  /** Columns to be displayed in account number preferences table. */
  displayedColumns: string[] = ['accountType'];
  /** Data source for account number preferences table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for account number preferences table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for account number preferences table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the account number preferences data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { accountNumberPreferences: any }) => {
      this.accountNumberPreferencesData = data.accountNumberPreferences;
    });
  }

  /**
   * Sets the account number preferences table.
   */
  ngOnInit() {
    this.setAccountNumberPreferences();
  }

  /**
   * Initializes the data source, paginator, sorter and filter for account number preferences table.
   */
  setAccountNumberPreferences() {
    this.dataSource = new MatTableDataSource(this.accountNumberPreferencesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (accountNumberPreference: any, property: any) => {
      return accountNumberPreference.accountType.value;
    };
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) =>
      data.accountType.value.toLowerCase().indexOf(filter) !== -1;
  }

  /**
   * Filters data in account number preferences table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.toLowerCase().trim();
  }
}
