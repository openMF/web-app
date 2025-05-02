/** Angular Imports */
import { Component, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ActivatedRoute } from '@angular/router';

/**
 * Recurring Deposits Standing Instructions Tab
 */
@Component({
  selector: 'mifosx-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.scss']
})
export class ListTransactionsComponent {
  /** List Transactions Data */
  listTransactionData: any;
  /** Data source for instructions table. */
  dataSource = new MatTableDataSource();
  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = [
    'transactionDate',
    'amount',
    'notes',
    'reversed'
  ];

  /** Paginator for centers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /**
   * Retrieves Recurring Deposits Account Data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { listTransactionData: any }) => {
      this.listTransactionData = data.listTransactionData;
      this.dataSource = new MatTableDataSource(this.listTransactionData.transactions.pageItems);
      this.dataSource.paginator = this.paginator;
    });
  }
}
