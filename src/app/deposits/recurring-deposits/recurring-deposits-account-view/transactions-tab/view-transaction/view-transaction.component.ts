/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';

/** Custom Dialogs */
import { RecurringDepositConfirmationDialogComponent } from '../../custom-dialogs/recurring-deposit-confirmation-dialog/recurring-deposit-confirmation-dialog.component';

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
   * @param {RecurringDepositsService} recurringDepositsService Savings Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe DatePipe.
   */
  constructor(private recurringDepositsService: RecurringDepositsService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private router: Router,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { recurringDepositsAccountTransaction: any }) => {
      this.transactionData = data.recurringDepositsAccountTransaction;
    });
  }

  /**
   * Undo the recurring deposits transaction
   */
  undoTransaction() {
    const accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
    const undoTransactionAccountDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, { data: { heading: 'Undo Transaction', dialogContext: 'Are you sure you want to undo this transaction ?' } });
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
        this.recurringDepositsService.executeRecurringDepositsAccountTransactionsCommand(accountId, 'undo', data, this.transactionData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }

}
