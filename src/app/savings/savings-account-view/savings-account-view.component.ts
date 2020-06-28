/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { CalculateInterestDialogComponent } from './custom-dialogs/calculate-interest-dialog/calculate-interest-dialog.component';
import { PostInterestDialogComponent } from './custom-dialogs/post-interest-dialog/post-interest-dialog.component';

/** Custom Buttons Configuration */
import { SavingsButtonsConfiguration } from './savings-buttons.config';
import { SavingsService } from '../savings.service';

/**
 * Savings Account View Component
 */
@Component({
  selector: 'mifosx-savings-account-view',
  templateUrl: './savings-account-view.component.html',
  styleUrls: ['./savings-account-view.component.scss']
})
export class SavingsAccountViewComponent implements OnInit {

  /** Savings Account Data */
  savingsAccountData: any;
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Button Configurations */
  buttonConfig: SavingsButtonsConfiguration;

  /**
   * Fetches savings account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private savingsService: SavingsService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { savingsAccountData: any, savingsDatatables: any }) => {
      this.savingsAccountData = data.savingsAccountData;
      this.savingsDatatables = data.savingsDatatables;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.savingsAccountData.status.value;
    this.buttonConfig = new SavingsButtonsConfiguration(status);
    if (this.savingsAccountData.clientId) {
      this.buttonConfig.addOption({
        name: 'Transfer Funds',
        taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
      });
    }
    if (!this.savingsAccountData.fieldOfficerId) {
      this.buttonConfig.addOption({
        name: 'Assign Staff',
        taskPermissionName: 'UPDATESAVINGSOFFICER_SAVINGSACCOUNT'
      });
    } else {
      this.buttonConfig.addOption({
        name: 'Unassign Staff',
        taskPermissionName: 'REMOVESAVINGSOFFICER_SAVINGSACCOUNT'
      });
    }
    if (this.savingsAccountData.charges) {
      const charges: any[] = this.savingsAccountData.charges;
      charges.forEach((charge: any) => {
        if (charge.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Annual Fees',
            taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
          });
        }
      });
    }
    if (this.savingsAccountData.taxGroup) {
      if (this.savingsAccountData.withHoldTax) {
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

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Approve':
      case 'Reject':
      case 'Deposit':
      case 'Activate':
      case 'Undo Approval':
      case 'Post Interest As On':
      case 'Assign Staff':
      case 'Add Charge':
      case 'Unassign Staff':
      case 'Withdraw By Client':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Withdraw':
        this.router.navigate([`actions/Withdrawal`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit-savings-account'], { relativeTo: this.route });
        break;
      case 'Delete':
        this.deleteSavingsAccount();
        break;
      case 'Calculate Interest':
        this.calculateInterest();
        break;
      case 'Post Interest':
        this.postInterest();
        break;
    }
  }

  /**
   * Deletes Savings Account.
   */
  private deleteSavingsAccount() {
    const deleteSavingsAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `savings account with id: ${this.savingsAccountData.id}` }
    });
    deleteSavingsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.savingsService.deleteSavingsAccount(this.savingsAccountData.id).subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Calculates savings account's interest
   */
  private calculateInterest() {
    const calculateInterestAccountDialogRef = this.dialog.open(CalculateInterestDialogComponent);
    calculateInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountCommand(this.savingsAccountData.id, 'calculateInterest', {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Posts savings account's interest
   */
  private postInterest() {
    const postInterestAccountDialogRef = this.dialog.open(PostInterestDialogComponent);
    postInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountCommand(this.savingsAccountData.id, 'postInterest', {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.savingsAccountData.clientId;
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/savingsaccounts`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

}
