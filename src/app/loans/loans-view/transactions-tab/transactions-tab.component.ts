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
import { TranslateService } from '@ngx-translate/core';
import { LoanTransaction } from 'app/products/loan-products/models/loan-account.model';
import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';

@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss']
})
export class TransactionsTabComponent implements OnInit {

  /** Loan Details Data */
  transactionsData: LoanTransaction[] = [];
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  hideReversedParam: UntypedFormControl;
  /** Stores the status of the loan account */
  status: string;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = ['row', 'id', 'office', 'externalId', 'date', 'transactionType', 'amount', 'principal', 'interest', 'fee', 'penalties', 'loanBalance', 'actions'];
  displayedHeader1Columns: string[] = ['h1-row', 'h1-id', 'h1-office', 'h1-external-id', 'h1-transaction-date', 'h1-transaction-type', 'h1-space', 'h1-breakdown', 'h1-loan-balance', 'h1-actions'];
  displayedHeader2Columns: string[] = ['h2-space', 'h2-amount', 'h2-principal', 'h2-interest', 'h2-fees', 'h2-penalties', 'h2-action'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  loanId: number;
  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    private dialog: MatDialog,
    private loansService: LoansService,
    private translateService: TranslateService,
    private settingsService: SettingsService) {
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.transactionsData = data.loanDetailsData.transactions;
      this.status = data.loanDetailsData.status.value;
    });
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.hideReversedParam = new UntypedFormControl(false);
    this.setLoanTransactions();
  }

  setLoanTransactions() {
    this.transactionsData.forEach((element: any) => {
      element.date = this.dateUtils.parseDate(element.date);
    });
    this.dataSource = new MatTableDataSource(this.transactionsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    this.filterTransactions(this.hideReversedParam.value, !this.hideAccrualsParam.value);
  }

  hideReversed() {
    this.filterTransactions(!this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  filterTransactions(hideReversed: boolean, hideAccrual: boolean): void {
    let transactions: LoanTransaction[] = this.transactionsData;

    if (hideAccrual || hideReversed) {
      transactions = this.transactionsData.filter((t: LoanTransaction) => {
        return (!(hideReversed && t.manuallyReversed) && !(hideAccrual && t.type.accrual));
      });
    }
    this.dataSource = new MatTableDataSource(transactions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
   * REFUND:16
   * CHARGE_PAYMENT:17
   * REFUND_FOR_ACTIVE_LOAN:18
   * INCOME_POSTING: 19
   * CREDIT_BALANCE_REFUND:20
   * MERCHANT_ISSUED_REFUND:21
   * PAYOUT_REFUND:22
   * GOODWILL_CREDIT:23
   * CHARGE_REFUND:24
   * CHARGEBACK:25
   * CHARGE_ADJUSTMENT:26
   * CHARGE_OFF:27
   * DOWN_PAYMENT:28
   * REAGE:29
   * REAMORTIZE:30
   */
  showTransactions(transactionsData: LoanTransaction) {
    if ([1, 2, 4, 9, 20, 21, 22, 23, 26, 28, 29, 30, 31].includes(transactionsData.type.id)) {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

  allowUndoTransaction(transaction: LoanTransaction) {
    if (transaction.manuallyReversed) {
      return false;
    }
    return !(transaction.type.disbursement || transaction.type.chargeoff || this.isReAgoeOrReAmortize(transaction.type) );
  }

  loanTransactionColor(transaction: LoanTransaction): string {
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
    if (this.isReAge(transaction.type)) {
      return 'reage';
    }
    if (this.isReAmortize(transaction.type)) {
      return 'reamortize';
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
  undoTransaction(transaction: LoanTransaction, $event: MouseEvent) {
    $event.stopPropagation();
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const loanId = this.route.parent.parent.snapshot.params['loanId'];
    let command = 'undo';
    let operationDate = this.dateUtils.parseDate(transaction.date);
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
      data: { heading: this.translateService.instant('labels.heading.Undo Transaction'),
      dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction type') + `${transaction.type.value}` + this.translateService.instant('labels.dialogContext.with id') + `${transaction.id}`
      }
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

  undoReAgeOrReAmortize(transaction: LoanTransaction): void {
    const actionName = transaction.type.reAmortize ? 'Re-Amortize' : 'Re-Age';
    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Undo Transaction'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction type') + ' ' + this.translateService.instant('labels.menus.' + actionName)
      }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const undoCommand = actionName === 'Re-Age' ? 'undoReAge' : 'undoReAmortize';
        this.loansService.executeLoansAccountTransactionsCommand(String(this.loanId), undoCommand, {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  private isAccrual(transactionType: LoanTransactionType): boolean {
    return (transactionType.accrual || transactionType.code === 'loanTransactionType.overdueCharge');
  }

  private isChargeOff(transactionType: LoanTransactionType): boolean {
    return (transactionType.chargeoff || transactionType.code === 'loanTransactionType.chargeOff');
  }

  private isDownPayment(transactionType: LoanTransactionType): boolean {
    return (transactionType.downPayment || transactionType.code === 'loanTransactionType.downPayment');
  }

  private isReAge(transactionType: LoanTransactionType): boolean {
    return (transactionType.reAge || transactionType.code === 'loanTransactionType.reAge');
  }

  private isReAmortize(transactionType: LoanTransactionType): boolean {
    return (transactionType.reAmortize || transactionType.code === 'loanTransactionType.reAmortize');
  }

  private isReAgoeOrReAmortize(transactionType: LoanTransactionType): boolean {
    return this.isReAmortize(transactionType) || this.isReAge(transactionType);
  }

  viewJournalEntry(transactionType: LoanTransactionType): boolean {
    return !(this.isReAmortize(transactionType) || this.isReAge(transactionType));
  }

  private reload() {
    const clientId = this.route.parent.parent.snapshot.params['clientId'];
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  displaySubMenu(transaction: LoanTransaction): boolean {
    if (this.isReAgoeOrReAmortize(transaction.type) && transaction.manuallyReversed) {
      return false;
    }
    return true;
  }

}
