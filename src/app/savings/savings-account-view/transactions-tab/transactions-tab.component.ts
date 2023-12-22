/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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

  /** Savings Account Status */
  status: any;
  /** Transactions Data */
  transactionsData: any;
  /** Temporary Transaction Data */
  tempTransaction: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['id', 'date', 'transactionType', 'debit', 'credit', 'balance', 'actions'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  accountWithTransactions = false;

  /**
   * Retrieves savings account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.transactionsData = data.savingsAccountData.transactions?.filter((transaction: any) => !transaction.reversed);
      this.tempTransaction = this.transactionsData;
      this.status = data.savingsAccountData.status.value;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.setTransactions();
  }

  setTransactions(): void {
    this.dataSource = new MatTableDataSource(this.transactionsData);
    this.accountWithTransactions = (this.transactionsData && this.transactionsData.length > 0);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.tempTransaction.forEach((element: any) => {
      if (this.isAccrual(element.transactionType)) {
        this.tempTransaction = this.removeItem(this.tempTransaction, element);
      }
    });
  }

  private removeItem(arr: any, item: any) {
    return arr.filter((f: any) => f !== item);
  }

  /**
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: any) {
    return transactionType.withdrawal === true || transactionType.feeDeduction === true
            || transactionType.overdraftInterest === true || transactionType.withholdTax === true;
  }

  isAccrual(transactionType: any): boolean {
    return (transactionType.accrual || transactionType.code === 'savingsAccountTransactionType.accrual');
  }

  /**
   * Checks transaction status.
   */
  checkStatus() {
    if (this.status === 'Active' || this.status === 'Closed' || this.status === 'Transfer in progress' ||
       this.status === 'Transfer on hold' || this.status === 'Premature Closed' || this.status === 'Matured') {
      return true;
    }
    return false;
  }

  /**
   * Show Transactions Details
   * @param transactionsData Transactions Data
   */
  showTransactions(transactionsData: any) {
    if (transactionsData.transfer) {
      this.router.navigate([`../transfer-funds/account-transfers/${transactionsData.transfer.id}`], { relativeTo: this.route });
    } else {
      this.router.navigate([transactionsData.id, 'general'], { relativeTo: this.route });
    }
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  hideAccruals() {
    if (!this.hideAccrualsParam.value) {
      this.dataSource = new MatTableDataSource(this.tempTransaction);
    } else {
      this.dataSource = new MatTableDataSource(this.transactionsData);
    }
  }

}
