/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { SavingsAccountTransaction, SavingsAccountTransactionType } from 'app/savings/models/savings-account-transaction.model';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { UndoTransactionDialogComponent } from '../custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  transactionsData: SavingsAccountTransaction[] = [];
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  hideReversedParam: UntypedFormControl;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['row', 'id', 'date', 'externalId', 'transactionType', 'debit', 'credit', 'balance', 'actions'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  accountWithTransactions = false;

  accountId: string;

  /**
   * Retrieves savings account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private savingsService: SavingsService,
              private settingsService: SettingsService,
              private dialog: MatDialog,
              private dateUtils: Dates) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.transactionsData = data.savingsAccountData.transactions;
      this.status = data.savingsAccountData.status.value;
    });
    this.accountId = this.route.parent.parent.snapshot.params['savingAccountId'];
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.hideReversedParam = new UntypedFormControl(false);
    this.setTransactions();
  }

  setTransactions(): void {
    this.dataSource = new MatTableDataSource(this.transactionsData);
    this.accountWithTransactions = (this.transactionsData && this.transactionsData.length > 0);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: SavingsAccountTransactionType) {
    return transactionType.withdrawal === true || transactionType.feeDeduction === true
            || transactionType.overdraftInterest === true || transactionType.withholdTax === true;
  }

  isAccrual(transactionType: SavingsAccountTransactionType): boolean {
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
  showTransactions(transactionsData: SavingsAccountTransaction) {
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
    this.filterTransactions(this.hideReversedParam.value, !this.hideAccrualsParam.value);
  }

  hideReversed() {
    this.filterTransactions(!this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  filterTransactions(hideReversed: boolean, hideAccrual: boolean): void {
    let transactions: SavingsAccountTransaction[] = this.transactionsData;

    if (hideAccrual || hideReversed) {
      transactions = this.transactionsData.filter((t: SavingsAccountTransaction) => {
        return (!(hideReversed && t.reversed) && !(hideAccrual && t.transactionType.accrual));
      });
    }
    this.dataSource = new MatTableDataSource(transactions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  savingsTransactionColor(transaction: SavingsAccountTransaction): string {
    if (transaction.reversed) {
      return 'strike';
    } else if (transaction.transfer) {
      return 'transfer';
    } else if (transaction.transactionType.accrual) {
      return 'accrual';
    } else {
      return '';
    }
  }

  undoTransaction(transactionData: SavingsAccountTransaction): void {
    const undoTransactionAccountDialogRef = this.dialog.open(UndoTransactionDialogComponent);
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const data = {
          transactionDate: this.dateUtils.parseDate(transactionData.date),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.savingsService.executeSavingsAccountTransactionsCommand(this.accountId, 'undo', data, transactionData.id).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  private reload() {
    const clientId = this.route.parent.parent.snapshot.params['clientId'];
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/savings-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
