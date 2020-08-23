/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Pipes */
import { AccountsFilterPipe } from '../../pipes/accounts-filter.pipe';

@Component({
  selector: 'mifosx-loan-account-table',
  templateUrl: './loan-account-table.component.html',
  styleUrls: ['./loan-account-table.component.scss']
})
export class LoanAccountTableComponent implements OnInit {

  /** Columns to be displayed in the loan accounts table. */
  displayedColumns: string[] = ['accountNo', 'productName', 'Type', 'Status'];
  /** Show closed loan accounts */
  showClosed = false;
  /** Data source for loan account table. */
  dataSource: MatTableDataSource<any>;
  /** Loan Account Data */
  accountData: any;

  /** Paginator for loan accounts table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for loan accounts table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** Loan Account Setter */
  @Input() set loanAccountData(data: any) {
    this.accountData = data;
    const filteredAccountData = this.accountsFilterPipe.transform(data, 'loan', this.showClosed ? 'closed' : 'open', 'isLoan');
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
   * Toggles the loan status
   */
  toggleClosed() {
    this.showClosed = !this.showClosed;
    const filteredAccountData = this.accountsFilterPipe.transform(this.accountData, 'loan', this.showClosed ? 'closed' : 'open', 'isLoan');
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
