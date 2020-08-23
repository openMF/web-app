/** Angular Imports */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Pipes */
import { AccountsFilterPipe } from '../../pipes/accounts-filter.pipe';

@Component({
  selector: 'mifosx-share-account-table',
  templateUrl: './share-account-table.component.html',
  styleUrls: ['./share-account-table.component.scss']
})
export class ShareAccountTableComponent implements OnInit {

  /** Columns to be displayed in the share accounts table. */
  displayedColumns: string[] = ['accountNo', 'productName', 'totalApprovedShares', 'Status'];
  /** Show closed share accounts */
  showClosed = false;
  /** Data source for share account table. */
  dataSource: MatTableDataSource<any>;
  /** Share Account Data */
  accountData: any;

  /** Paginator for share account table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for share account table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** Share Account Setter */
  @Input() set shareAccountData(data: any) {
    this.accountData = data;
    const filteredAccountData = this.accountsFilterPipe.transform(data, 'share', this.showClosed ? 'closed' : 'open', 'isShare');
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
   * Toggles the share status
   */
  toggleClosed() {
    this.showClosed = !this.showClosed;
    const filteredAccountData = this.accountsFilterPipe.transform(this.accountData, 'share', this.showClosed ? 'closed' : 'open', 'isShare');
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
