/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
import { SavingsAccountTransaction } from 'app/savings/models/savings-account-transaction.model';
import { NgClass } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { FixedDepositsService } from '../../fixed-deposits.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

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
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
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
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class TransactionsTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private fixedDepositsService = inject(FixedDepositsService);
  dialog = inject(MatDialog);

  clientId: string;
  accountId: string;
  status: any;
  /** Transactions Data */
  transactionsData: any[] = [];
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  hideReversedParam: UntypedFormControl;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = [
    'row',
    'id',
    'transactionDate',
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

  /**
   * Retrieves fixed deposits account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router
   */
  constructor() {
    this.route.parent.data.subscribe((data: { fixedDepositsAccountData: any }) => {
      this.transactionsData = data.fixedDepositsAccountData.transactions;
      this.clientId = this.route.parent.snapshot.params['clientId'];
      this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
      this.status = data.fixedDepositsAccountData.status.value;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.hideReversedParam = new UntypedFormControl(false);
    this.dataSource = new MatTableDataSource(this.transactionsData);
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
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: any) {
    return (
      transactionType.withdrawal === true ||
      transactionType.feeDeduction === true ||
      transactionType.overdraftInterest === true ||
      transactionType.withholdTax === true
    );
  }

  /**
   * Show Transactions Details
   * @param {any} transactionsData Transactions Data
   */
  showTransactions(transactionsData: any) {
    if (transactionsData.transfer) {
      this.router.navigate([`account-transfers/account-transfers/${transactionsData.transfer.id}`], {
        relativeTo: this.route
      });
    } else {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
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

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  undoTransaction(transactionData: SavingsAccountTransaction): void {
    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Undo Transaction'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want to undo this transaction ?'
        )
      }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const data = {
          transactionDate: this.dateUtils.formatDate(transactionData.date, dateFormat),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.fixedDepositsService
          .executeFixedDepositsAccountTransactionsCommand(this.accountId, 'undo', data, transactionData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  reload() {
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${this.clientId}/fixed-deposits-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  isFirstTransaction(idx: number): boolean {
    return idx + 1 === this.transactionsData.length;
  }
}
