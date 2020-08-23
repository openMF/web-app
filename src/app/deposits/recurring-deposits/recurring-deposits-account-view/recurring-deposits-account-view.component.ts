/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';
import { SavingsService } from 'app/savings/savings.service';

/** Custom Buttons Configuration */
import { RecurringDepositsButtonsConfiguration } from './recurring-deposits-buttons.config';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { RecurringDepositConfirmationDialogComponent } from './custom-dialogs/recurring-deposit-confirmation-dialog/recurring-deposit-confirmation-dialog.component';


/**
 * RecurringDeposits Account View Component
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-view',
  templateUrl: './recurring-deposits-account-view.component.html',
  styleUrls: ['./recurring-deposits-account-view.component.scss']
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
  /**
   * Fetches recurringDeposits account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {RecurringDepositsService} recurringDepositsService RecurringDeposits Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private recurringDepositsService: RecurringDepositsService,
              private savingsService: SavingsService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { recurringDepositsAccountData: any, savingsDatatables: any }) => {
      this.recurringDepositsAccountData = data.recurringDepositsAccountData;
      this.charges = this.recurringDepositsAccountData.charges;
      this.savingsDatatables = data.savingsDatatables;
      this.isprematureAllowed = data.recurringDepositsAccountData.maturityDate != null;
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
      });
    }

    if (this.recurringDepositsAccountData.charges && this.recurringDepositsAccountData.status.value === 'Matured') {
      this.charges.forEach((element: any) => {
        if (element.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Annual Fees',
          });
        }
      });
    }

    if (this.recurringDepositsAccountData.clientId && this.recurringDepositsAccountData.status.value === 'Active') {
      if (this.recurringDepositsAccountData.allowWithdrawal === true) {
        this.buttonConfig.addOption({
          name: 'Withdraw'
        });
      }
      if (this.recurringDepositsAccountData.charges) {
        this.charges.forEach((element: any) => {
          if (element.name === 'Annual fee - INR') {
            this.buttonConfig.addOption({
              name: 'Apply Annual Fees',
            });
          }
        });
      }

      if (!this.isprematureAllowed) {
        this.buttonConfig.addButton({
          name: 'Close',
          icon: 'fa fa-arrow-right'
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
    this.router.navigateByUrl(`/clients/${clientId}/recurringdeposits`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Activate':
      case 'Approve':
      case 'Reject':
      case 'Undo Approval':
      case 'Add Charge':
      case 'Withdraw By Client':
      case 'Premature Close':
      case 'Close':
      case 'Deposit':
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
        this.recurringDepositsService.deleteRecurringDepositsAccount(this.recurringDepositsAccountData.id).subscribe(() => {
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
      data: { heading: 'Calculate Interest', dialogContext: `Are you sure you want to calculate interest ?` }
    });
    calculateInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.recurringDepositsAccountData.id, 'calculateInterest', {}).subscribe(() => {
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
      data: { heading: 'Post Interest', dialogContext: 'Are you sure you want to post interest ?' }
    });
    postInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.recurringDepositsAccountData.id, 'postInterest', {}).subscribe(() => {
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
      data: { heading: 'Enable Withhold Tax', dialogContext: `Enable withhold tax for this account ?` }
    });
    deleteSavingsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountUpdateCommand(this.recurringDepositsAccountData.id, 'updateWithHoldTax', { withHoldTax: true })
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
      data: { heading: 'Disable Withhold Tax', dialogContext: 'Disable withhold tax for this account ?' }
    });
    disableWithHoldTaxDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountUpdateCommand(this.recurringDepositsAccountData.id, 'updateWithHoldTax', { withHoldTax: false })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

}
