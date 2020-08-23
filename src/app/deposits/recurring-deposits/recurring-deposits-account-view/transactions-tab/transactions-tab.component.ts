/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Transactions Tab Component.
 */
@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss']
})
export class TransactionsTabComponent implements OnInit {

  /** Recurring Deposits Account Status */
  status: any;
  /** Transactions Data */
  transactionsData: any;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['id', 'transactionDate', 'transactionType', 'debit', 'credit', 'balance'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Retrieves recurring deposits account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.parent.data.subscribe((data: { recurringDepositsAccountData: any }) => {
      this.transactionsData = data.recurringDepositsAccountData.transactions;
      this.status = data.recurringDepositsAccountData.status.value;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.transactionsData);
  }

  /**
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: any) {
    return transactionType.withdrawal === true || transactionType.feeDeduction === true
      || transactionType.overdraftInterest === true || transactionType.withholdTax === true;
  }

  /**
   * Show Transactions Details
   * @param transactionsData Transactions Data
   */
  showTransactions(transactionsData: any) {
    if (transactionsData.transfer) {
      this.router.navigate([`account-transfers/account-transfers/${transactionsData.transfer.id}`], { relativeTo: this.route });
    } else {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

}
