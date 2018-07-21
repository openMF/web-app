import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { MatDialog, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';

import { AccountingService } from '../accounting.service';
import { RevertTransactionComponent } from '../revert-transaction/revert-transaction.component';
import { ViewJournalEntryComponent } from '../view-journal-entry/view-journal-entry.component';

@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss']
})
export class ViewTransactionComponent implements OnInit, OnDestroy {

  // TODO: Update once language and date settings are setup
  transactionId: string;
  transactionId$: any;
  displayedColumns: string[] = ['id', 'glAccountType', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private accountingService: AccountingService,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.transactionId$ = this.route.paramMap.subscribe((params: ParamMap) => {
      this.transactionId = params.get('id');
      this.getJournalEntry();
    });
  }

  getJournalEntry() {
    this.accountingService.getJournalEntry(this.transactionId).subscribe((journalEntry: any) => {
      this.dataSource = new MatTableDataSource(journalEntry.pageItems);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (transaction: any, property: any) => {
        switch (property) {
          case 'glAccountType': return transaction.glAccountType.value;
          case 'debit': return transaction.amount;
          case 'credit': return transaction.amount;
          default: return transaction[property];
        }
      };
      this.dataSource.sort = this.sort;
    });
  }

  viewJournalEntry(journalEntry: any) {
    this.dialog.open(ViewJournalEntryComponent, {
      data: { journalEntry: journalEntry }
    });
  }

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
        this.router.navigate(['/accounting/transactions/view', transactionId]);
      }
    });
  }

  ngOnDestroy() {
    this.transactionId$.unsubscribe();
  }

}
