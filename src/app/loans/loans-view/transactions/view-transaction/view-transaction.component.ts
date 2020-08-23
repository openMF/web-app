/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Dialogs */

/**
 * View Transaction Component.
 * TODO: Add support for account transfers.
 */
@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss']
})
export class ViewTransactionComponent {

  /** Transaction data. */
  transactionData: any;

  /**
   * Retrieves the Transaction data from `resolve`.
   * @param {LoansService} loansService Loans Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe DatePipe.
   */
  constructor(private loansService: LoansService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { loansAccountTransaction: any }) => {
      this.transactionData = data.loansAccountTransaction;
    });
  }

  /**
   * Undo the loans transaction
   */
  undoTransaction() {
    const accountId = this.route.parent.parent.parent.snapshot.params['loanId'];
    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Undo Transaction', dialogContext: `Are you sure you want undo the transaction ${this.transactionData.id}` }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const data = {
          transactionDate: this.datePipe.transform(this.transactionData.date && new Date(this.transactionData.date), dateFormat),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.loansService.executeLoansAccountTransactionsCommand(accountId, 'undo', data, this.transactionData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }

}
