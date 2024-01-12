/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
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

  status: any;
  /** Transactions Data */
  transactionsData: any;
  /** Temporary Transaction Data */
  tempTransaction: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['id', 'transactionDate', 'transactionType', 'debit', 'credit', 'balance', 'actions'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Retrieves fixed deposits account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.parent.data.subscribe((data: { fixedDepositsAccountData: any }) => {
      this.transactionsData = data.fixedDepositsAccountData.transactions;
      this.tempTransaction = this.transactionsData;
      this.status = data.fixedDepositsAccountData.status.value;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.dataSource = new MatTableDataSource(this.transactionsData);
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
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: any) {
    return transactionType.withdrawal === true || transactionType.feeDeduction === true
            || transactionType.overdraftInterest === true || transactionType.withholdTax === true;
  }

  /**
   * Show Transactions Details
   * @param {any} transactionsData Transactions Data
   */
  showTransactions(transactionsData: any) {
    if (transactionsData.transfer) {
      this.router.navigate([`account-transfers/account-transfers/${transactionsData.transfer.id}`], { relativeTo: this.route });
    } else {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

  transactionColor(transaction: any): string {
    if (transaction.reversed) {
      return 'strike';
    }
    if (this.isAccrual(transaction.transactionType)) {
      return 'accrual';
    }
    return '';
  }

  private isAccrual(transactionType: any): boolean  {
    return (transactionType.accrual);
  }

  hideAccruals() {
    if (!this.hideAccrualsParam.value) {
      this.dataSource = new MatTableDataSource(this.tempTransaction);
    } else {
      this.dataSource = new MatTableDataSource(this.transactionsData);
    }
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

}
