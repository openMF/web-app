import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { ReleaseAmountDialogComponent } from 'app/savings/savings-account-view/custom-dialogs/release-amount-dialog/release-amount-dialog.component';
import { UndoTransactionDialogComponent } from 'app/savings/savings-account-view/custom-dialogs/undo-transaction-dialog/undo-transaction-dialog.component';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { NgIf, NgClass, CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TransactionPaymentDetailComponent } from '../../../../../shared/transaction-payment-detail/transaction-payment-detail.component';
import { DateFormatPipe } from '../../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-savings-transaction-general-tab',
  templateUrl: './savings-transaction-general-tab.component.html',
  styleUrls: ['./savings-transaction-general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    TransactionPaymentDetailComponent,
    CurrencyPipe,
    DateFormatPipe
  ]
})
export class SavingsTransactionGeneralTabComponent {
  accountId: string;
  transactionId: string;
  transactionData: any;

  constructor(
    private savingsService: SavingsService,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    public dialog: MatDialog,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountTransaction: any }) => {
      this.accountId = this.route.parent.snapshot.params['savingAccountId'];
      this.transactionData = data.savingsAccountTransaction;
    });
  }

  allowUndo(): boolean {
    if (this.transactionData.reversed && this.transactionData.transactionType.amountHold) {
      return false;
    }
    return !this.transactionData.reversed;
  }

  releaseAmount(): void {
    const releaseAmountDialogRef = this.dialog.open(ReleaseAmountDialogComponent);
    releaseAmountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        const data = {};
        this.savingsService
          .executeSavingsAccountTransactionsCommand(this.accountId, 'releaseAmount', data, this.transactionData.id)
          .subscribe(() => {
            this.router.navigate(['../..'], { relativeTo: this.route });
          });
      }
    });
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
            this.router.navigate(['../..'], { relativeTo: this.route });
          });
      }
    });
  }

  transactionColor(): string {
    if (this.transactionData.reversed) {
      return 'undo';
    }
    return 'active';
  }
}
