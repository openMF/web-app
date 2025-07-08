import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewJournalEntryComponent } from '../view-journal-entry/view-journal-entry.component';
import { RevertTransactionComponent } from 'app/accounting/revert-transaction/revert-transaction.component';
import { AccountingService } from 'app/accounting/accounting.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
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
import { Location, NgIf } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { YesnoPipe } from '@pipes/yesno.pipe';

@Component({
  selector: 'mifosx-view-journal-entry-transaction',
  templateUrl: './view-journal-entry-transaction.component.html',
  styleUrls: ['./view-journal-entry-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class ViewJournalEntryTransactionComponent implements OnInit {
  title: string;
  journalEntriesData: any[];
  /** Transaction data.  */
  transaction: any;
  /** Transaction ID. */
  transactionId: string;
  /** Columns to be displayed in transaction table. */
  displayedColumns: string[] = [
    'id',
    'glAccountType',
    'glAccountCode',
    'glAccountName',
    'debit',
    'credit'
  ];
  /** Data source for transaction table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for transaction table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for transaction table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isJournalEntryLoaded = false;

  isManualJournalEntry = false;

  /**
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private accountingService: AccountingService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private location: Location
  ) {}

  /**
   * Retrieves the transaction data from `resolve` and sets the transaction table.
   */
  ngOnInit() {
    this.route.data.subscribe((data: { title: string; transaction: any; transferJournalEntryData: any }) => {
      this.title = data.title;
      this.isJournalEntryLoaded = false;
      if (this.isViewTransaction()) {
        this.transaction = data.transaction;
        if (data.transaction.pageItems.length > 0) {
          this.isJournalEntryLoaded = true;
          this.transactionId = data.transaction.pageItems[0].transactionId;
          this.isManualJournalEntry = data.transaction.pageItems[0].manualEntry;
        }
      } else if (this.isViewTransfer()) {
        this.journalEntriesData = data.transferJournalEntryData.journalEntryData.content;
        this.isJournalEntryLoaded = true;
      }
      this.setTransaction();
    });
  }

  isViewTransaction(): boolean {
    return this.title === 'View Transaction';
  }

  isViewTransfer(): boolean {
    return this.title === 'View Transfer';
  }

  /**
   * Initializes the data source for transaction table with journal entries, paginator and sorter.
   */
  setTransaction() {
    if (this.journalEntriesData != null) {
      this.dataSource = new MatTableDataSource(this.journalEntriesData);
    } else {
      this.dataSource = new MatTableDataSource(this.transaction.pageItems);
      this.dataSource.sortingDataAccessor = (transaction: any, property: any) => {
        switch (property) {
          case 'glAccountType':
            return transaction.glAccountType.value;
          case 'debit':
            return transaction.amount;
          case 'credit':
            return transaction.amount;
          default:
            return transaction[property];
        }
      };
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * View details of selected journal entry.
   * @param {any} journalEntry Selected journal entry.
   */
  viewJournalEntry(journalEntry: any) {
    this.dialog.open(ViewJournalEntryComponent, {
      data: { journalEntry: journalEntry }
    });
  }

  /**
   * Reverts the given transaction and redirects to reverted transaction.
   * @param {transactionId} transactionId Transaction ID of transaction to be reverted.
   */
  revertTransaction(transactionId?: string) {
    const revertTransactionDialogRef = this.dialog.open(RevertTransactionComponent, {
      data: { reverted: this.dataSource.data[0].reversed, transactionId: transactionId }
    });
    revertTransactionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.revert) {
        this.accountingService
          .revertTransaction(this.transactionId, response.comments)
          .subscribe((reversedTransaction: any) => {
            this.dataSource.data[0].reversed = true;
            this.revertTransaction(reversedTransaction.transactionId);
          });
      } else if (response.redirect) {
        this.router.navigate(
          [
            '../',
            transactionId
          ],
          { relativeTo: this.route }
        );
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  journalEntryColor(): string {
    if (this.isManualJournalEntry) {
      return 'manual-entry';
    }
    return '';
  }
}
