/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from '../loans.service';

/** Custom Buttons Configuration */
import { LoansAccountButtonConfiguration } from './loan-accounts-button-config';

/** Dialog Components */
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { LoanStatus } from '../models/loan-status.model';
import { Currency } from 'app/shared/models/general.model';
import { DelinquencyPausePeriod } from '../models/loan-account.model';
import { TranslateService } from '@ngx-translate/core';
import { LoanTransaction } from 'app/products/loan-products/models/loan-account.model';
import { OptionData } from 'app/shared/models/option-data.model';
import { MatCardHeader, MatCardTitleGroup, MatCardTitle } from '@angular/material/card';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, CurrencyPipe } from '@angular/common';
import { LongTextComponent } from '../../shared/long-text/long-text.component';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProducts } from 'app/products/loan-products/loan-products';

@Component({
  selector: 'mifosx-loans-view',
  templateUrl: './loans-view.component.html',
  styleUrls: ['./loans-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    SvgIconComponent,
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
    StatusLookupPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class LoansViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  loansService = inject(LoansService);
  private translateService = inject(TranslateService);
  dialog = inject(MatDialog);

  /** Loan Details Data */
  loanDetailsData: any;
  /** Loan Datatables */
  loanDatatables: any;
  /** Whether datatable filtering has completed */
  datatablesReady = false;
  /** Recalculate Interest */
  recalculateInterest: any;
  /** loan Arrears Delinquency config value */
  loanDisplayArrearsDelinquency: number;
  /** Status */
  status: string;
  entityType: string;
  /** Loan Id */
  loanId: number;
  /** Client Id */
  clientId: number;
  /** Button Configuration */
  buttonConfig: LoansAccountButtonConfiguration;
  /** Disburse Transaction number */
  disburseTransactionNo = 0;

  loanDelinquencyClassificationStyle = '';
  loanStatus: LoanStatus;
  loanSubStatus: OptionData | null = null;
  currency: Currency;
  loanReAged = false;
  loanReAmortized = false;

  constructor() {
    const loansService = this.loansService;

    this.route.data.subscribe(
      (data: { loanDetailsData: any; loanDatatables: any; loanArrearsDelinquencyConfig: any }) => {
        this.loanDetailsData = data.loanDetailsData;
        this.loanDatatables = data.loanDatatables;
        this.loanDisplayArrearsDelinquency = data.loanArrearsDelinquencyConfig.value || 0;
        this.loanStatus = this.loanDetailsData.status;
        this.loanSubStatus = this.loanDetailsData.subStatus === undefined ? null : this.loanDetailsData.subStatus;
        this.currency = this.loanDetailsData.currency;
        loansService.saveLoanDisbursementDetailsData(this.loanDetailsData.disbursementDetails);
        if (this.loanStatus.active) {
          this.loanDetailsData.transactions.forEach((lt: LoanTransaction) => {
            if (!lt.manuallyReversed) {
              if (lt.type.reAge) {
                this.loanReAged = true;
              } else if (lt.type.reAmortize) {
                this.loanReAmortized = true;
              }
            }
          });
        }
        this.setConditionalButtons();
        // Filter datatables based on entity datatable checks
        this.filterDatatablesByProduct();
      }
    );
    this.loanId = this.route.snapshot.params['loanId'];
    this.clientId = this.loanDetailsData.clientId;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (this.loanId != params['loanId']) {
        this.loanId = params['loanId'];
        this.reload();
      }
    });
    this.recalculateInterest = this.loanDetailsData.recalculateInterest || true;
    this.status = this.loanDetailsData.status.value;
    this.loanStatus = this.loanDetailsData.status;
    this.loanSubStatus = this.loanDetailsData.subStatus === undefined ? null : this.loanDetailsData.subStatus;
    if (this.loanStatus.active && this.loanDetailsData.multiDisburseLoan) {
      if (this.loanDetailsData && this.loanDetailsData.transactions) {
        this.loanDetailsData.transactions.forEach((transaction: any) => {
          if (transaction.type.disbursement) {
            this.disburseTransactionNo++;
          }
        });
      }
    }
    this.setConditionalButtons();
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
    this.loanDelinquencyClassification();
  }

  /**
   * Filter datatables based on entity datatable checks configuration.
   * Only shows datatables that are linked to the current loan's product.
   *
   * Logic:
   * - If a datatable has product-specific entity checks for ANY loan product,
   *   it is only shown for products where it is explicitly configured.
   * - If a datatable has NO product-specific entity checks at all,
   *   it is shown for all products (backward compatibility).
   */
  filterDatatablesByProduct(): void {
    this.datatablesReady = false;

    if (!this.loanDatatables || this.loanDatatables.length === 0) {
      this.datatablesReady = true;
      return;
    }

    const loanProductId = this.loanDetailsData?.loanProductId;

    if (!loanProductId || loanProductId <= 0) {
      this.datatablesReady = true;
      return; // Keep all datatables if product ID is not available or invalid
    }

    this.loansService.getEntityDataTableChecks().subscribe({
      next: (response: any) => {
        const entityChecks = response?.pageItems || [];

        // Get all entity checks for the m_loan entity
        const loanEntityChecks = entityChecks.filter((check: any) => check.entity === 'm_loan');

        if (loanEntityChecks.length === 0) {
          this.datatablesReady = true;
          return; // No entity datatable checks configured at all, keep all datatables
        }

        // Collect datatable names that have product-specific configurations (for ANY product)
        const productSpecificDatatables = new Set<string>(
          loanEntityChecks
            .filter((check: any) => check.productId && check.productId > 0)
            .map((check: any) => check.datatableName)
        );

        // Collect datatable names allowed for the current product
        const allowedForCurrentProduct = new Set<string>(
          loanEntityChecks
            .filter((check: any) => check.productId === loanProductId)
            .map((check: any) => check.datatableName)
        );

        // Filter: keep a datatable if:
        // 1. It has no product-specific configuration anywhere → show for all products
        // 2. It is explicitly configured for the current product
        this.loanDatatables = this.loanDatatables.filter((datatable: any) => {
          const tableName = datatable.registeredTableName;
          if (!productSpecificDatatables.has(tableName)) {
            return true;
          }
          return allowedForCurrentProduct.has(tableName);
        });
        this.datatablesReady = true;
      },
      error: () => {
        // If API fails, keep all datatables (fallback to current behavior)
        this.datatablesReady = true;
      }
    });
  }

  // Defines the buttons based on the status of the loan account
  setConditionalButtons() {
    this.buttonConfig = new LoansAccountButtonConfiguration(this.status, this.loanSubStatus);

    if (this.status === 'Submitted and pending approval') {
      this.buttonConfig.addOption({
        name: this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer',
        icon: 'user-tie',
        taskPermissionName: 'DISBURSE_LOAN'
      });

      if (this.loanDetailsData.isVariableInstallmentsAllowed) {
        this.buttonConfig.addOption({
          name: 'Edit Repayment Schedule',
          icon: 'edit',
          taskPermissionName: 'ADJUST_REPAYMENT_SCHEDULE'
        });
      }
    } else if (this.status === 'Approved') {
      this.buttonConfig.addButton({
        name: this.loanDetailsData.loanOfficerName ? 'Change Loan Officer' : 'Assign Loan Officer',
        icon: 'user-tie',
        taskPermissionName: 'DISBURSE_LOAN'
      });
    } else if (this.status === 'Active') {
      if (this.loanDetailsData.enableBuyDownFee) {
        this.buttonConfig.addButton({
          name: 'Buy Down Fee',
          icon: 'plus',
          taskPermissionName: 'BUYDOWNFEE_LOAN'
        });
      }
      if (this.loanDetailsData.enableIncomeCapitalization) {
        this.buttonConfig.addButton({
          name: 'Capitalized Income',
          icon: 'coins',
          taskPermissionName: 'CAPITALIZEDINCOME_LOAN'
        });
      }

      if (this.loanDetailsData.canDisburse || this.loanDetailsData.multiDisburseLoan) {
        this.buttonConfig.addButton({
          name: 'Disburse',
          icon: 'hand-holding-usd',
          taskPermissionName: 'DISBURSE_LOAN'
        });
      }
      if (this.loanDetailsData.canDisburse) {
        this.buttonConfig.addButton({
          name: 'Disburse to Savings',
          icon: 'piggy-bank',
          taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
        });
      }
      if (this.loanDetailsData.multiDisburseLoan && this.disburseTransactionNo > 1) {
        this.buttonConfig.addButton({
          name: 'Undo Last Disbursal',
          icon: 'undo',
          taskPermissionName: 'DISBURSALLASTUNDO_LOAN'
        });
      }
      if (this.recalculateInterest) {
        this.buttonConfig.addButton({
          name: 'Add Interest Pause',
          icon: 'calendar',
          taskPermissionName: 'CREATE_INTEREST_PAUSE'
        });
      }
      // loan officer not assigned to loan, below logic
      // helps to display otherwise not
      if (!this.loanDetailsData.loanOfficerName) {
        this.buttonConfig.addButton({
          name: 'Assign Loan Officer',
          icon: 'user-tie',
          taskPermissionName: 'UPDATELOANOFFICER_LOAN'
        });
      }

      if (this.recalculateInterest) {
        this.buttonConfig.addButton({
          name: 'Prepay Loan',
          icon: 'coins',
          taskPermissionName: 'REPAYMENT_LOAN'
        });
      }

      // Allow ChargeOff only If there loan is not already ChargeOff
      if (!this.loanDetailsData.chargedOff) {
        this.buttonConfig.addButton({
          name: 'Charge-Off',
          icon: 'coins',
          taskPermissionName: 'CHARGEOFF_LOAN'
        });
      } else {
        this.buttonConfig.addButton({
          name: 'Undo Charge-Off',
          icon: 'undo',
          taskPermissionName: 'UNDOCHARGEOFF_LOAN'
        });
      }

      // Allow Re-Ageing only when there is not any Re-Age transaction
      if (!this.loanReAged) {
        this.buttonConfig.addButton({
          name: 'Re-Age',
          icon: 'calendar',
          taskPermissionName: 'REAGE_LOAN'
        });
      } else {
        this.buttonConfig.addButton({
          name: 'Undo Re-Age',
          icon: 'undo',
          taskPermissionName: 'UNDO_REAGE_LOAN'
        });
      }

      if (!this.loanReAmortized) {
        this.buttonConfig.addButton({
          name: 'Re-Amortize',
          icon: 'calendar-alt',
          taskPermissionName: 'REAMORTIZE_LOAN'
        });
      } else {
        this.buttonConfig.addButton({
          name: 'Undo Re-Amortize',
          icon: 'undo',
          taskPermissionName: 'UNDO_REAMORTIZE_LOAN'
        });
      }
    } else if (this.status === 'Closed (obligations met)' || this.status === 'Overpaid') {
      if (this.loanDetailsData.multiDisburseLoan) {
        this.buttonConfig.addButton({
          name: 'Disburse',
          icon: 'hand-holding-usd',
          taskPermissionName: 'DISBURSE_LOAN'
        });
      }
      if (LoanProducts.isAdvancedPaymentAllocationStrategy(this.loanDetailsData.transactionProcessingStrategyCode)) {
        this.buttonConfig.addButton({
          name: 'Reschedule',
          icon: 'calendar',
          taskPermissionName: 'CREATE_RESCHEDULELOAN'
        });
      }
    }
  }

  loanAction(actionName: string) {
    switch (actionName) {
      case 'Recover From Guarantor':
        this.recoverFromGuarantor();
        break;
      case 'Delete':
        this.deleteLoanAccount();
        break;
      case 'Modify Application':
        this.router.navigate(['edit-loans-account'], { relativeTo: this.route });
        break;
      case 'Transfer Funds':
        const queryParams: any = { loanId: this.loanId, accountType: 'fromloans' };
        this.router.navigate(['transfer-funds/make-account-transfer'], {
          relativeTo: this.route,
          queryParams: queryParams
        });
        break;
      case 'Undo Re-Age':
      case 'Undo Re-Amortize':
      case 'Undo Charge-Off':
        this.undoLoanAction(actionName);
        break;
      default:
        const navigationExtras: NavigationExtras = {
          relativeTo: this.route,
          state: {
            data: this.loanDetailsData
          }
        };
        this.router.navigate(
          [
            'actions',
            actionName
          ],
          navigationExtras
        );
        break;
    }
  }

  /**
   * Recover from guarantor action
   */
  private recoverFromGuarantor() {
    const recoverFromGuarantorDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Recover from Guarantor'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want recover from Guarantor'
        ),
        type: 'Mild'
      }
    });
    recoverFromGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.loansService.loanActionButtons(this.loanId, 'recoverGuarantees').subscribe(() => {
          this.reload();
        });
      }
    });
  }

  loanDelinquencyClassification(): void {
    this.loanDelinquencyClassificationStyle = '';
    if (this.loanDetailsData.delinquent && this.loanDetailsData.delinquent.delinquencyPausePeriods) {
      this.loanDetailsData.delinquent.delinquencyPausePeriods.some((period: DelinquencyPausePeriod) => {
        if (period.active) {
          this.loanDelinquencyClassificationStyle = 'fa fa-stop status-pending';
        }
      });
    }
  }

  undoLoanAction(actionName: string): void {
    actionName = actionName.replace('Undo ', '');
    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Undo Transaction'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction type') +
          ' ' +
          this.translateService.instant('labels.menus.' + actionName)
      }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        let undoCommand: string = '';
        switch (actionName) {
          case 'Re-Age':
            undoCommand = 'undoReAge';
            break;
          case 'Re-Amortize':
            undoCommand = 'undoReAmortize';
            break;
          case 'Charge-Off':
            undoCommand = 'undo-charge-off';
            break;
        }
        this.loansService.executeLoansAccountTransactionsCommand(String(this.loanId), undoCommand, {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  iconLoanStatusColor() {
    if (this.loanDetailsData.chargedOff) {
      return 'loanStatusType.chargeoff';
    }
    if (this.isContractTermination(this.loanSubStatus)) {
      return 'loanSubStatusType.contractTermination';
    }
    if (this.loanDetailsData.inArrears) {
      return 'loanStatusType.activeOverdue';
    }
    return this.loanDetailsData.status.code;
  }

  loanStatusTooltip() {
    if (this.loanDetailsData.chargedOff) {
      return 'Chargeoff';
    }
    if (this.loanDetailsData.inArrears) {
      return 'activeOverdue';
    }
    return this.loanDetailsData.status.code;
  }

  loanSubStatusTooltip() {
    if (this.isContractTermination(this.loanSubStatus)) {
      return 'contractTermination';
    }
    return '';
  }

  /**
   * Delete loan Account
   */
  private deleteLoanAccount() {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `with loan id: ${this.loanId}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService.deleteLoanAccount(this.loanId).subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.clientId;
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  private isContractTermination(substatus: OptionData): boolean {
    if (substatus == null) {
      return false;
    }
    return substatus.code === 'loanSubStatus.loanSubStatusType.contractTermination';
  }
}
