/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { CalculateInterestDialogComponent } from './custom-dialogs/calculate-interest-dialog/calculate-interest-dialog.component';
import { PostInterestDialogComponent } from './custom-dialogs/post-interest-dialog/post-interest-dialog.component';
import { ToggleWithholdTaxDialogComponent } from './custom-dialogs/toggle-withhold-tax-dialog/toggle-withhold-tax-dialog.component';

/** Custom Buttons Configuration */
import { SavingsButtonsConfiguration } from './savings-buttons.config';
import { SavingsService } from '../savings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { TranslateService } from '@ngx-translate/core';

/** Environment Configuration */
import { environment } from '../../../environments/environment';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf, NgClass, NgFor, CurrencyPipe } from '@angular/common';
import { LongTextComponent } from '../../shared/long-text/long-text.component';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings Account View Component
 */
@Component({
  selector: 'mifosx-savings-account-view',
  templateUrl: './savings-account-view.component.html',
  styleUrls: ['./savings-account-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatTooltip,
    MatCardTitle,
    NgClass,
    LongTextComponent,
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
    CurrencyPipe,
    StatusLookupPipe
  ]
})
export class SavingsAccountViewComponent implements OnInit {
  /** Savings Account Data */
  savingsAccountData: any;
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Button Configurations */
  buttonConfig: SavingsButtonsConfiguration;
  /** Entity Type */
  entityType: string;

  isActive = false;
  currency: Currency;

  /**
   * Fetches savings account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savingsService: SavingsService,
    private translateService: TranslateService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { savingsAccountData: any; savingsDatatables: any }) => {
      this.savingsAccountData = data.savingsAccountData;
      this.currency = this.savingsAccountData.currency;
      this.savingsDatatables = data.savingsDatatables;
    });
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.savingsAccountData.status.value;
    this.isActive = status === 'Active';
    const subStatus = this.savingsAccountData.subStatus;
    this.buttonConfig = new SavingsButtonsConfiguration(status, subStatus);
    if (this.savingsAccountData.clientId) {
      this.buttonConfig.addOption({
        name: 'Transfer Funds',
        taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
      });
    }
    if (this.savingsAccountData.externalId && environment.interbankTransfers) {
      this.buttonConfig.addOption({
        name: 'Interbank Transfer',
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
   * Refetches data foe the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const url: string = this.router.url;
    const refreshUrl: string = this.router.url.slice(
      0,
      this.router.url.indexOf('savings-accounts') + 'savings-accounts'.length
    );
    this.router.navigateByUrl(refreshUrl, { skipLocationChange: true }).then(() => this.router.navigate([url]));
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
      case 'Close':
      case 'Undo Approval':
      case 'Post Interest As On':
      case 'Assign Staff':
      case 'Add Charge':
      case 'Hold Amount':
      case 'Block Account':
      case 'Block Deposit':
      case 'Block Withdrawal':
      case 'Unassign Staff':
      case 'Withdrawn by Client':
      case 'Apply Annual Fees':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Withdrawal':
        this.router.navigate([`actions/Withdrawal`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit'], { relativeTo: this.route });
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
      case 'Enable Withhold Tax':
        this.enableWithHoldTax();
        break;
      case 'Disable Withhold Tax':
        this.disableWithHoldTax();
        break;
      case 'Transfer Funds':
        const queryParams: any = {
          interbank: false,
          savingsId: this.savingsAccountData.id,
          accountType: 'fromsavings'
        };
        this.router.navigate(['transfer-funds/make-account-transfer'], {
          relativeTo: this.route,
          queryParams: queryParams,
          state: { balance: this.savingsAccountData.summary.availableBalance }
        });
        break;
      case 'Interbank Transfer': {
        const queryParams: any = { interbank: true, savingsId: this.savingsAccountData.id, accountType: 'interbank' };
        this.router.navigate(['transfer-funds/make-account-transfer'], {
          relativeTo: this.route,
          queryParams: queryParams,
          state: { balance: this.savingsAccountData.summary.availableBalance }
        });
        break;
      }
      case 'Unblock Account':
      case 'Unblock Deposit':
      case 'Unblock Withdrawal':
        this.unblockSavingsAccount(name);
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
        this.savingsService
          .executeSavingsAccountCommand(this.savingsAccountData.id, 'calculateInterest', {})
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
    const postInterestAccountDialogRef = this.dialog.open(PostInterestDialogComponent);
    postInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountCommand(this.savingsAccountData.id, 'postInterest', {})
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Enables withhold tax for savings account.
   */
  private enableWithHoldTax() {
    const deleteSavingsAccountDialogRef = this.dialog.open(ToggleWithholdTaxDialogComponent, {
      data: { isEnable: true }
    });
    deleteSavingsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.savingsAccountData.id, 'updateWithHoldTax', { withHoldTax: true })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Disables withhold tac for savings account
   */
  private disableWithHoldTax() {
    const disableWithHoldTaxDialogRef = this.dialog.open(ToggleWithholdTaxDialogComponent, {
      data: { isEnable: false }
    });
    disableWithHoldTaxDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.savingsAccountData.id, 'updateWithHoldTax', { withHoldTax: false })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Unblock Savings Account.
   */
  private unblockSavingsAccount(action: string) {
    const unblockSavingsAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Savings Account'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want') +
          action +
          this.translateService.instant('this Savings Account')
      }
    });
    let command = 'unblock';
    if (action === 'Unblock Deposit') {
      command = 'unblockCredit';
    }
    if (action === 'Unblock Withdrawal') {
      command = 'unblockDebit';
    }
    unblockSavingsAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountCommand(this.savingsAccountData.id, command, {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }
}
