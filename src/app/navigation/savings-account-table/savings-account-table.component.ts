/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Pipes */
import { AccountsFilterPipe } from '../../pipes/accounts-filter.pipe';

@Component({
  selector: 'mifosx-savings-account-table',
  templateUrl: './savings-account-table.component.html',
  styleUrls: ['./savings-account-table.component.scss']
})
export class SavingsAccountTableComponent implements OnInit {

  /** Columns to be displayed in the savings accounts table. */
  displayedColumns: string[] = ['accountNo', 'productName', 'accountBalance', 'Status'];
  /** Show closed saving accounts */
  showClosed = false;
  /** Data source for savings account table. */
  dataSource: MatTableDataSource<any>;
  /** Savings Account Data */
  accountData: any;

  /** Paginator for savings account table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for savings account table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** Savings Account Setter */
  @Input() set savingsAccountData(data: any) {
    this.accountData = data;
    const filteredAccountData = this.accountsFilterPipe.transform(data, 'saving', this.showClosed ? 'closed' : 'open', 'isSavings');
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * @param {AccountsFilterPipe} accountsFilterPipe Accounts Filter Pipe.
   */
  constructor(private accountsFilterPipe: AccountsFilterPipe) { }

  /**
   * Filters data in users table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
  }

  /**
   * Toggles the savings status
   */
  toggleClosed() {
    this.showClosed = !this.showClosed;
    const filteredAccountData = this.accountsFilterPipe.transform(this.accountData, 'saving', this.showClosed ? 'closed' : 'open', 'isSavings');
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
