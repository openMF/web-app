/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';
import { SavingsService } from 'app/savings/savings.service';

/** Custom Buttons Configuration */
import { RecurringDepositsButtonsConfiguration } from './recurring-deposits-buttons.config';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { RecurringDepositConfirmationDialogComponent } from './custom-dialogs/recurring-deposit-confirmation-dialog/recurring-deposit-confirmation-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { TranslateService } from '@ngx-translate/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, NgIf, NgFor, DecimalPipe, CurrencyPipe } from '@angular/common';
import { AccountNumberComponent } from '../../../shared/account-number/account-number.component';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * RecurringDeposits Account View Component
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-view',
  templateUrl: './recurring-deposits-account-view.component.html',
  styleUrls: ['./recurring-deposits-account-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatTooltip,
    MatCardTitle,
    NgClass,
    AccountNumberComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatMenu,
    MatMenuItem,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    DecimalPipe,
    CurrencyPipe,
    StatusLookupPipe
  ]
})
export class RecurringDepositsAccountViewComponent implements OnInit {
  /** RecurringDeposits Account Data */
  recurringDepositsAccountData: any;
  /** Button Configuration */
  buttonConfig: RecurringDepositsButtonsConfiguration;
  /** Charges Data */
  charges: any;
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Is Prematured Allowed */
  isprematureAllowed: any;
  entityType: string;
  currency: Currency;
  showTransactions = false;
  /**
   * Fetches recurringDeposits account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {RecurringDepositsService} recurringDepositsService RecurringDeposits Service
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recurringDepositsService: RecurringDepositsService,
    private savingsService: SavingsService,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountData: any; savingsDatatables: any }) => {
      this.recurringDepositsAccountData = data.recurringDepositsAccountData;
      this.charges = this.recurringDepositsAccountData.charges;
      this.savingsDatatables = data.savingsDatatables;
      this.currency = this.recurringDepositsAccountData.currency;
      this.isprematureAllowed = data.recurringDepositsAccountData.maturityDate != null;
      if (this.router.url.includes('clients')) {
        this.entityType = 'Client';
      } else if (this.router.url.includes('groups')) {
        this.entityType = 'Group';
      } else if (this.router.url.includes('centers')) {
        this.entityType = 'Center';
      }
      const status: any = data.recurringDepositsAccountData.status;
      this.showTransactions = status.id >= 300;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.recurringDepositsAccountData.status.value;
    this.buttonConfig = new RecurringDepositsButtonsConfiguration(status);
    if (this.recurringDepositsAccountData.clientId && this.recurringDepositsAccountData.status.value === 'Matured') {
      this.buttonConfig.addOption({
        name: 'Transfer Funds',
        taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
      });
    }

    if (this.recurringDepositsAccountData.charges && this.recurringDepositsAccountData.status.value === 'Matured') {
      this.charges.forEach((element: any) => {
        if (element.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Annual Fees',
            taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
          });
        }
      });
    }

    if (this.recurringDepositsAccountData.clientId && this.recurringDepositsAccountData.status.value === 'Active') {
      if (this.recurringDepositsAccountData.allowWithdrawal === true) {
        this.buttonConfig.addOption({
          name: 'Withdrawal',
          taskPermissionName: 'WITHDRAW_RECURRINGDEPOSITACCOUNT'
        });
      }
      if (this.recurringDepositsAccountData.charges) {
        this.charges.forEach((element: any) => {
          if (element.name === 'Annual fee - INR') {
            this.buttonConfig.addOption({
              name: 'Apply Annual Fees',
              taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
            });
          }
        });
      }

      if (!this.isprematureAllowed) {
        this.buttonConfig.addButton({
          name: 'Close',
          icon: 'arrow-right',
          taskPermissionName: 'CLOSE_RECURRINGDEPOSITACCOUNT'
        });
      }

      if (this.recurringDepositsAccountData.taxGroup) {
        if (this.recurringDepositsAccountData.withHoldTax) {
          this.buttonConfig.addOption({
            name: 'Disable Withhold Tax',
            taskPermissionName: 'UPDATEWITHHOLDTAX_SAVINGSACCOUNT'
          });
        } else {
          this.buttonConfig.addOption({
            name: 'Enable Withhold Tax',
            taskPermissionName: 'UPDATEWITHHOLDTAX_SAVINGSACCOUNT'
          });
        }
      }
    }
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const clientId = this.recurringDepositsAccountData.clientId;
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${clientId}/recurring-deposits-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Activate':
      case 'Undo Activation':
      case 'Approve':
      case 'Reject':
      case 'Undo Approval':
      case 'Add Charge':
      case 'Withdrawn by Client':
      case 'Premature Close':
      case 'Close':
      case 'Deposit':
      case 'Withdrawal':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit-recurring-deposit-account'], { relativeTo: this.route });
        break;
      case 'Delete':
        this.deleteRecurringDepositsAccount();
        break;
      case 'Calculate Interest':
        this.calculateInterest();
        break;
      case 'Post Interest':
        this.postInterest();
        break;
      case 'Enable Withhold Tax':
        this.enableWithHoldTax();
        break;
      case 'Disable Withhold Tax':
        this.disableWithHoldTax();
        break;
    }
  }

  /**
   * Deletes Recurring Deposits Account.
   */
  private deleteRecurringDepositsAccount() {
    const deleteRecurringDepositsAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Recurring deposit account with id: ${this.recurringDepositsAccountData.id}` }
    });
    deleteRecurringDepositsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.recurringDepositsService
          .deleteRecurringDepositsAccount(this.recurringDepositsAccountData.id)
          .subscribe(() => {
            this.router.navigate(['../../'], { relativeTo: this.route });
          });
      }
    });
  }

  /**
   * Calculates savings account's interest
   */
  private calculateInterest() {
    const calculateInterestAccountDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Calculate Interest'),
        dialogContext: this.translateService.instant(
          `labels.dialogContext.Are you sure you want to calculate interest ?`
        )
      }
    });
    calculateInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.recurringDepositsService
          .executeRecurringDepositsAccountCommand(this.recurringDepositsAccountData.id, 'calculateInterest', {})
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Posts savings account's interest
   */
  private postInterest() {
    const postInterestAccountDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Post Interest'),
        dialogContext: this.translateService.instant('labels.text.Are you sure you want to post interest') + ' ?'
      }
    });
    postInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.recurringDepositsService
          .executeRecurringDepositsAccountCommand(this.recurringDepositsAccountData.id, 'postInterest', {})
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Enables withhold tax for recurring deposits account.
   * Recurring deposits endpoint is not supported so using Savings endpoint.
   */
  private enableWithHoldTax() {
    const deleteSavingsAccountDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Enable Withhold Tax'),
        dialogContext: this.translateService.instant('labels.dialogContext.Enable withhold tax for this account ?')
      }
    });
    deleteSavingsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.recurringDepositsAccountData.id, 'updateWithHoldTax', {
            withHoldTax: true
          })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Disables withhold tax for recurring deposits account
   * Recurring deposits endpoint is not supported so using Savings endpoint.
   */
  private disableWithHoldTax() {
    const disableWithHoldTaxDialogRef = this.dialog.open(RecurringDepositConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Disable Withhold Tax'),
        dialogContext: this.translateService.instant('labels.dialogContext.Disable withhold tax for this account ?')
      }
    });
    disableWithHoldTaxDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.recurringDepositsAccountData.id, 'updateWithHoldTax', {
            withHoldTax: false
          })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }
}
