import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

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
  hideAccrualsParam: UntypedFormControl;
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
    private dateUtils: Dates,
    private router: Router,
    private dialog: MatDialog,
    private loansService: LoansService,
    private settingsService: SettingsService) {
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.transactions = data.loanDetailsData.transactions;
      this.tempTransaction = data.loanDetailsData.transactions;
      this.status = data.loanDetailsData.status.value;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.setLoanTransactions(this.transactions);
  }

  setLoanTransactions(transactions: any) {
    this.transactions = transactions;
    this.transactions.forEach((element: any) => {
      element.date = this.dateUtils.parseDate(element.date);
    });
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
   * DOWN_PAYMENT:28
   */
  showTransactions(transactionsData: any) {
    if ([1, 2, 4, 9, 20, 21, 22, 23, 26, 28].includes(transactionsData.type.id)) {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

  allowUndoTransaction(transaction: any) {
    if (transaction.manuallyReversed) {
      return false;
    }
    return ([27].includes(transaction.type.id));
  }

  loanTransactionColor(transaction: any): string {
    if (transaction.manuallyReversed) {
      return 'strike';
    }
    if (transaction.transactionRelations && transaction.transactionRelations.length > 0) {
      return 'linked';
    }
    if (this.isAccrual(transaction.type)) {
      return 'accrual';
    }
    if (this.isChargeOff(transaction.type)) {
      return 'chargeoff';
    }
    if (this.isDownPayment(transaction.type)) {
      return 'down-payment';
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

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  undoTransaction(transaction: any, $event: MouseEvent) {
    $event.stopPropagation();
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const loanId = this.route.parent.parent.snapshot.params['loanId'];
    let command = 'undo';
    let operationDate = transaction.date;
    let payload = {};
    if (this.isChargeOff(transaction.type)) {
      command = 'undo-charge-off';
      operationDate = this.settingsService.businessDate;
      payload = {};
    } else {
      payload = {
        transactionDate: this.dateUtils.formatDate(operationDate && new Date(operationDate), dateFormat),
        transactionAmount: 0,
        dateFormat,
        locale
      };
    }

    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Undo Transaction', dialogContext: `Are you sure you want undo the transaction type ${transaction.type.value} with id ${transaction.id}` }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        let transactionId = transaction.id;
        if (this.isChargeOff(transaction.type)) {
          transactionId = null;
        }
        this.loansService.executeLoansAccountTransactionsCommand(loanId, command, payload, transactionId).subscribe((responseCmd: any) => {
          transaction.manuallyReversed = true;
          this.reload();
        });
      }
    });
  }

  private isAccrual(transactionType: any): boolean  {
    return (transactionType.accrual || transactionType.code === 'loanTransactionType.overdueCharge');
  }

  private isChargeOff(transactionType: any): boolean  {
    return (transactionType.chargeoff || transactionType.code === 'loanTransactionType.chargeOff');
  }

  private isDownPayment(transactionType: any): boolean  {
    return (transactionType.downPayment || transactionType.code === 'loanTransactionType.downPayment');
  }

  private reload() {
    const clientId = this.route.parent.parent.snapshot.params['clientId'];
    const loanId = this.route.parent.parent.snapshot.params['loanId'];
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
