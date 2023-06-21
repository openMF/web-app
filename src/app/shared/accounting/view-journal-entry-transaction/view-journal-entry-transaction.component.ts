import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ViewJournalEntryComponent } from '../view-journal-entry/view-journal-entry.component';
import { RevertTransactionComponent } from 'app/accounting/revert-transaction/revert-transaction.component';
import { AccountingService } from 'app/accounting/accounting.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';

@Component({
  selector: 'mifosx-view-journal-entry-transaction',
  templateUrl: './view-journal-entry-transaction.component.html',
  styleUrls: ['./view-journal-entry-transaction.component.scss']
})
export class ViewJournalEntryTransactionComponent implements OnInit {

  title: string;
  journalEntriesData: any[];
  /** Transaction data.  */
  transaction: any;
  /** Transaction ID. */
  transactionId: string;
  /** Columns to be displayed in transaction table. */
  displayedColumns: string[] = ['id', 'glAccountType', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  /** Data source for transaction table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for transaction table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for transaction table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              private location: Location) {  }

  /**
   * Retrieves the transaction data from `resolve` and sets the transaction table.
   */
  ngOnInit() {
    this.route.data.subscribe((data: { title: string, transaction: any, transferJournalEntryData: any }) => {
      this.title = data.title;
      if (this.isViewTransaction()) {
        this.transaction = data.transaction;
        this.transactionId = data.transaction.pageItems[0].transactionId;
      } else if (this.isViewTransfer()) {
        this.journalEntriesData = data.transferJournalEntryData.journalEntryData.content;
      }
      this.setTransaction();
    });
  }

  isViewTransaction(): boolean {
    return (this.title === 'View Transaction');
  }

  isViewTransfer(): boolean {
    return (this.title === 'View Transfer');
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
          case 'glAccountType': return transaction.glAccountType.value;
          case 'debit': return transaction.amount;
          case 'credit': return transaction.amount;
          default: return transaction[property];
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
        this.accountingService.revertTransaction(this.transactionId, response.comments).subscribe((reversedTransaction: any) => {
          this.dataSource.data[0].reversed = true;
          this.revertTransaction(reversedTransaction.transactionId);
        });
      } else if (response.redirect) {
        this.router.navigate(['../', transactionId], { relativeTo: this.route });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
