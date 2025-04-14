/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Dialogs */
import { RecurringDepositConfirmationDialogComponent } from '../../custom-dialogs/recurring-deposit-confirmation-dialog/recurring-deposit-confirmation-dialog.component';
import { Dates } from 'app/core/utils/dates';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

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
   * @param {Dates} dateUtils Date Utils.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private recurringDepositsService: RecurringDepositsService,
    private route: ActivatedRoute,
    private location: Location,
    private dateUtils: Dates,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountTransaction: any }) => {
      this.transactionData = data.recurringDepositsAccountTransaction;
    });
  }

  /**
   * Undo the recurring deposits transaction
   */
  undoTransaction() {
    const accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
    const undoTransactionAccountDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, {
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
          transactionDate: this.dateUtils.formatDate(
            this.transactionData.date && new Date(this.transactionData.date),
            dateFormat
          ),
          transactionAmount: 0,
          dateFormat,
          locale
        };
        this.recurringDepositsService
          .executeRecurringDepositsAccountTransactionsCommand(accountId, 'undo', data, this.transactionData.id)
          .subscribe(() => {
            this.router.navigate(['../'], { relativeTo: this.route });
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

  goBack(): void {
    this.location.back();
  }
}
