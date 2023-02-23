import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss']
})
export class TransactionsTabComponent implements OnInit {

  /** Loan Details Data */
  transactions: any;
  /** Temporary Transaction Data */
  tempTransaction: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: FormControl;
  /** Stores the status of the loan account */
  status: string;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = ['id', 'office', 'externalId', 'date', 'transactionType', 'amount', 'principal', 'interest', 'fee', 'penalties', 'loanBalance', 'actions'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.transactions = data.loanDetailsData.transactions;
      this.tempTransaction = data.loanDetailsData.transactions;
      this.status = data.loanDetailsData.status.value;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new FormControl(false);
    this.dataSource = new MatTableDataSource(this.transactions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.tempTransaction.forEach((element: any) => {
      if (this.isAccrual(element.type)) {
        this.tempTransaction = this.removeItem(this.tempTransaction, element);
      }
    });
  }

  /**
   * Checks Status of the loan account
   */
  checkStatus() {
    if (this.status === 'Active' || this.status === 'Closed (obligations met)' || this.status === 'Overpaid' ||
      this.status === 'Closed (rescheduled)' || this.status === 'Closed (written off)') {
      return true;
    }
    return false;
  }

  hideAccruals() {
    if (!this.hideAccrualsParam.value) {
      this.dataSource = new MatTableDataSource(this.tempTransaction);
    } else {
      this.dataSource = new MatTableDataSource(this.transactions);
    }
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  removeItem(arr: any, item: any) {
    return arr.filter((f: any) => f !== item);
  }

  /**
   * Show Transactions Details
   * @param transactionsData Transactions Data
   * DISBURSEMENT:1
   * REPAYMENT:2
   * WAIVE_INTEREST:4
   * WAIVE_CHARGES:9
   * ACCRUAL:10
   * CREDIT_BALANCE_REFUND:20
   * MERCHANT_ISSUED_REFUND:21
   * PAYOUT_REFUND:22
   * GOODWILL_CREDIT:23
   * CHARGE_ADJUSTMENT:26
   */
  showTransactions(transactionsData: any) {
    if ([1, 2, 4, 9, 20, 21, 22, 23, 26].includes(transactionsData.type.id)) {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

  loanTransactionColor(loanTransaction: any): string {
    if (loanTransaction.manuallyReversed) {
      return 'strike';
    }
    if (loanTransaction.transactionRelations && loanTransaction.transactionRelations.length > 0) {
      return 'linked';
    }
    if (this.isAccrual(loanTransaction.type)) {
      return 'accrual';
    }
    return '';
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  private isAccrual(transactionType: any): boolean  {
    return (transactionType.accrual || transactionType.code === 'loanTransactionType.overdueCharge');
  }

}
