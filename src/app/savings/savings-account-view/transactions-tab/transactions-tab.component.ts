/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import {
  SavingsAccountTransaction,
  SavingsAccountTransactionType
} from 'app/savings/models/savings-account-transaction.model';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { UndoTransactionDialogComponent } from '../custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgIf, NgClass } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Transactions Tab Component.
 */
@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    NgClass,
    ExternalIdentifierComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DateFormatPipe,
    FormatNumberPipe
  ]
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
  displayedColumns: string[] = [
    'row',
    'id',
    'date',
    'externalId',
    'transactionType',
    'debit',
    'credit',
    'balance',
    'actions'
  ];
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savingsService: SavingsService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private dateUtils: Dates
  ) {
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
    this.accountWithTransactions = this.transactionsData && this.transactionsData.length > 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: SavingsAccountTransactionType) {
    return (
      transactionType.withdrawal === true ||
      transactionType.feeDeduction === true ||
      transactionType.overdraftInterest === true ||
      transactionType.withholdTax === true
    );
  }

  isAccrual(transactionType: SavingsAccountTransactionType): boolean {
    return transactionType.accrual || transactionType.code === 'savingsAccountTransactionType.accrual';
  }

  /**
   * Checks transaction status.
   */
  checkStatus() {
    if (
      this.status === 'Active' ||
      this.status === 'Closed' ||
      this.status === 'Transfer in progress' ||
      this.status === 'Transfer on hold' ||
      this.status === 'Premature Closed' ||
      this.status === 'Matured'
    ) {
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
      this.router.navigate([`../transfer-funds/account-transfers/${transactionsData.transfer.id}`], {
        relativeTo: this.route
      });
    } else {
      this.router.navigate(
        [
          transactionsData.id,
          'general'
        ],
        { relativeTo: this.route }
      );
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
    this.filterTransactions(this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  hideReversed() {
    this.filterTransactions(this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  filterTransactions(hideReversed: boolean, hideAccrual: boolean): void {
    let transactions: SavingsAccountTransaction[] = this.transactionsData;

    if (hideAccrual || hideReversed) {
      transactions = this.transactionsData.filter((t: SavingsAccountTransaction) => {
        return !(hideReversed && t.reversed) && !(hideAccrual && t.transactionType.accrual);
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
        this.savingsService
          .executeSavingsAccountTransactionsCommand(this.accountId, 'undo', data, transactionData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  private reload() {
    const clientId = this.route.parent.parent.snapshot.params['clientId'];
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${clientId}/savings-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
