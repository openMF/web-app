/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';

/** Custom Dialogs */
import { UndoTransactionDialogComponent } from '../../custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';

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
   * @param {FixedDepositsService} fixedDepositsService Savings Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe DatePipe.
   */
  constructor(private fixedDepositsService: FixedDepositsService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { fixedDepositsAccountTransaction: any }) => {
      this.transactionData = data.fixedDepositsAccountTransaction;
    });
  }

  /**
   * Undo the savings transaction
   */
  undoTransaction() {
    const accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
    const undoTransactionAccountDialogRef = this.dialog.open(UndoTransactionDialogComponent);
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const data = {
          transactionDate: this.datePipe.transform(this.transactionData.date && new Date(this.transactionData.date), dateFormat),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.fixedDepositsService.executeFixedDepositsAccountTransactionsCommand(accountId, 'undo', data, this.transactionData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }

}
