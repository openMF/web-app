/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UndoTransactionDialogComponent } from 'app/savings/savings-account-view/custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { NgIf, NgClass, CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TransactionPaymentDetailComponent } from '../../../../shared/transaction-payment-detail/transaction-payment-detail.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Transaction Component.
 */
@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    TransactionPaymentDetailComponent,
    CurrencyPipe,
    DateFormatPipe
  ]
})
export class ViewTransactionComponent {
  accountId: string;
  transactionId: string;
  /** Transaction data. */
  transactionData: any;

  /**
   */
  constructor(
    private savingsService: SavingsService,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    public dialog: MatDialog,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { fixedDepositsAccountTransaction: any }) => {
      this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
      this.transactionData = data.fixedDepositsAccountTransaction;
    });
  }

  transactionColor(): string {
    if (this.transactionData.manuallyReversed) {
      return 'undo';
    }
    return 'active';
  }

  allowUndo(): boolean {
    return false;
  }

  undoTransaction(): void {
    const undoTransactionAccountDialogRef = this.dialog.open(UndoTransactionDialogComponent);
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const data = {
          transactionDate: this.dateUtils.formatDate(
            this.transactionData.date && new Date(this.transactionData.date),
            dateFormat
          ),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.savingsService
          .executeSavingsAccountTransactionsCommand(this.accountId, 'undo', data, this.transactionData.id)
          .subscribe(() => {
            this.router.navigate(['../'], { relativeTo: this.route });
          });
      }
    });
  }
}
