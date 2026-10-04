/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import {
  WorkingCapitalUndoChargeOffDialogComponent,
  WorkingCapitalUndoChargeOffDialogResult,
  buildWorkingCapitalUndoChargeOffPayload
} from '../../working-capital/loan-account-actions/undo-charge-off-dialog/undo-charge-off-dialog.component';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { NgClass, CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { TransactionPaymentDetailComponent } from '../../../../shared/transaction-payment-detail/transaction-payment-detail.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../../loan-account-actions/loan-account-actions-base.component';
import { isAccrualKindTransaction, isDiscountFeeKindTransaction } from '../../loan-transaction-type.helper';
import {
  adjustmentReopensLoan,
  canAdjustLoanTransaction,
  canAdjustWorkingCapitalTransaction,
  canReverseLoanTransaction
} from '../../loan-transaction-adjust.helper';
import {
  appendReversalFields,
  buildReversalDialogConfig,
  REOPEN_LOAN_WARNING_KEY
} from '../../loan-transaction-reversal.helper';

/** Custom Dialogs */

/** Permission guarding the Undo button when the transaction is reversed through the adjust command. */
const DEFAULT_UNDO_PERMISSION = 'ADJUST_LOAN';

/**
 * View Transaction Component.
 * TODO: Add support for account transfers.
 */
@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    ExternalIdentifierComponent,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TransactionPaymentDetailComponent,
    CurrencyPipe,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTransactionComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private loansService = inject(LoansService);
  private dateUtils = inject(Dates);
  dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private organizationService = inject(OrganizationService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  /** Transaction data. */
  transactionData: any;
  transactionType: LoanTransactionType | null = null;
  /** True when the transaction can be re-submitted with a new date, amount and payment details. */
  allowEdition = true;
  /** Is Undoable */
  allowUndo = true;
  /** Is able to be Chargeback */
  allowChargeback = true;
  /** True when this is a Working Capital charge-off, which is undone with its own command. */
  isWorkingCapitalChargeOff = false;
  /** True when this is a Term Loan charge-off, which is undone on the loan, not on the transaction. */
  isTermLoanChargeOff = false;
  /** True when the loan is closed or overpaid, so acting on the transaction reopens it. */
  willReopenLoan = false;
  /** Permission required by the Undo button; each charge-off flavour has its own. */
  undoPermission: string = DEFAULT_UNDO_PERMISSION;
  /** Permission required by the Adjust button; each product posts its own adjust command. */
  adjustPermission: string = DEFAULT_UNDO_PERMISSION;
  existTransactionRelations = false;

  paymentTypeOptions: {}[] = [];
  transactionRelations = new MatTableDataSource();
  /** Columns to be displayed in Transaction Relations table. */
  displayedColumns: string[] = [
    'relationType',
    'toTransaction',
    'amount'
  ];
  isFullRelated = false;
  amountRelationsAllowed = 0;

  clientId: number;

  /**
   * Retrieves the Transaction data from `resolve`.
   * @param {LoansService} loansService Loans Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {Dates} dateUtils Date Utils.
   * @param {SettingsService} settingsService Settings Service
   * @param {AlertService} alertService Alert Service
   */
  constructor() {
    super();
    this.route.parent?.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanDetailsAssociationData?: any }) => {
        this.willReopenLoan = adjustmentReopensLoan(data.loanDetailsAssociationData?.status);
      });
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loansAccountTransaction: any }) => {
      this.transactionData = data.loansAccountTransaction;
      if (this.loanProductService.isWorkingCapital) {
        this.transactionData.date = this.transactionData.transactionDate;
      }
      this.transactionType = this.transactionData?.type ?? null;
      if (!this.transactionType) {
        this.allowEdition = false;
        this.allowUndo = false;
        this.allowChargeback = false;
        return;
      }
      const alreadyReversed = this.transactionData.manuallyReversed || this.transactionData.reversed;
      this.isWorkingCapitalChargeOff = this.isWorkingCapital && this.isChargeOff(this.transactionType);
      this.isTermLoanChargeOff = !this.isWorkingCapital && this.isChargeOff(this.transactionType);
      // A charge-off is undone through its dedicated command rather than the
      // adjust command, so the button is gated with the same permission the
      // account header action uses instead of the default ADJUST_LOAN.
      if (this.isWorkingCapitalChargeOff) {
        this.undoPermission = 'UNDOCHARGEOFF_WORKINGCAPITALLOAN';
      } else if (this.isTermLoanChargeOff) {
        this.undoPermission = 'UNDOCHARGEOFF_LOAN';
      } else {
        this.undoPermission = DEFAULT_UNDO_PERMISSION;
      }
      // Each product has its own adjust command and gate; Working Capital
      // keeps its own reversal rules on top of that.
      this.adjustPermission = this.isWorkingCapital ? 'ADJUST_WORKINGCAPITALLOAN' : DEFAULT_UNDO_PERMISSION;
      this.allowEdition = this.isWorkingCapital
        ? canAdjustWorkingCapitalTransaction(this.transactionType, alreadyReversed)
        : canAdjustLoanTransaction(this.transactionType, alreadyReversed);
      this.allowUndo = this.isWorkingCapital
        ? this.allowUndoTransaction(alreadyReversed, this.transactionType, !!this.transactionData.wcLoanId)
        : canReverseLoanTransaction(this.transactionType, alreadyReversed) ||
          (!alreadyReversed && this.hasDedicatedUndoCommand(this.transactionType));
      this.allowChargeback =
        this.allowChargebackTransaction(this.transactionType) && !this.transactionData.manuallyReversed;
      let transactionsChargebackRelated = false;
      if (this.transactionData.transactionRelations) {
        this.transactionRelations.data = this.transactionData.transactionRelations;
        this.existTransactionRelations = this.transactionData.transactionRelations.length > 0;
        let amountRelations = 0;
        this.transactionData.transactionRelations.forEach((relation: any) => {
          if (relation.relationType === 'CHARGEBACK') {
            amountRelations += relation.amount;
            transactionsChargebackRelated = true;
          }
        });
        this.amountRelationsAllowed = this.transactionData.amount - amountRelations;
        this.isFullRelated = this.amountRelationsAllowed === 0;
        this.allowChargeback = this.allowChargebackTransaction(this.transactionType) && !this.isFullRelated;
      }
      // A transaction linked to a chargeback is rejected by the backend in both
      // modes; re-age and re-amortize are undone from the account header.
      if (
        (this.existTransactionRelations && transactionsChargebackRelated) ||
        this.transactionType.reAge ||
        this.transactionType.reAmortize
      ) {
        this.allowUndo = false;
        this.allowEdition = false;
      }
      if (this.isWorkingCapital) {
        this.allowChargeback = false;
      }
    });
    this.clientId = this.route.snapshot.params['clientId'];
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    if (this.allowChargeback) {
      this.organizationService
        .getPaymentTypesWithCode()
        .toPromise()
        .then((data) => {
          this.paymentTypeOptions = data;
        });
    }
  }

  /**
   * Types that are not reversed through the generic adjust command but have
   * their own undo command wired in `undoTransaction()`.
   * @param transactionType Transaction type
   */
  private hasDedicatedUndoCommand(transactionType: LoanTransactionType): boolean {
    // The flags are absent from some payloads, so the result is coerced rather
    // than leaking `undefined` into the button state.
    return !!(
      this.isWriteOff(transactionType) ||
      this.isChargeOff(transactionType) ||
      transactionType.contractTermination
    );
  }

  /**
   * The adjust command reverses the transaction; the dedicated commands undo a
   * loan level action, so the button names them differently.
   */
  get undoButtonLabelKey(): string {
    return !this.transactionType || this.isWorkingCapital || this.hasDedicatedUndoCommand(this.transactionType)
      ? 'labels.buttons.Undo'
      : 'labels.buttons.Reverse';
  }

  allowChargebackTransaction(transactionType: LoanTransactionType): boolean {
    return (
      transactionType.repayment ||
      transactionType.interestPaymentWaiver ||
      transactionType.goodwillCredit ||
      transactionType.payoutRefund ||
      transactionType.merchantIssuedRefund ||
      transactionType.downPayment
    );
  }

  allowUndoTransaction(
    manuallyReversed: boolean,
    transactionType: LoanTransactionType,
    isWorkingCapital: boolean
  ): boolean {
    if (manuallyReversed) {
      return false;
    }
    return !(
      transactionType.interestRefund ||
      transactionType.id === 44 ||
      (isWorkingCapital && transactionType.disbursement)
    );
  }

  isWriteOff(transactionType: LoanTransactionType): boolean {
    return transactionType.writeOff || transactionType.code === 'loanTransactionType.writeOff';
  }

  isChargeOff(transactionType: LoanTransactionType): boolean {
    return transactionType.chargeoff || transactionType.code === 'loanTransactionType.chargeOff';
  }

  /**
   * Undo the loans transaction
   */
  undoTransaction() {
    const accountId = this.route.snapshot.params['loanId'];

    if (this.transactionType.contractTermination) {
      this.openReversalDialog('labels.heading.Undo Transaction', 'labels.buttons.Undo')
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response: any) => {
          if (!response?.data) {
            return;
          }
          const payload = {
            note: response.data.value.note,
            reversalExternalId: response.data.value.reversalExternalId
          };

          this.loansService
            .loanActionButtons(accountId, 'undoContractTermination', payload)
            .subscribe(() => this.navigateToTransactionList());
        });
    } else if (this.isWorkingCapitalChargeOff) {
      this.undoWorkingCapitalChargeOff(accountId);
    } else if (this.isTermLoanChargeOff) {
      this.undoTermLoanChargeOff(accountId);
    } else if (this.isLoanProduct && !this.isWriteOff(this.transactionType)) {
      this.reverseTermLoanTransaction(accountId);
    } else {
      const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          heading: this.translateService.instant('labels.heading.Undo Transaction'),
          dialogContext:
            this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction') +
            ' ' +
            `${this.transactionData.id}`
        }
      });
      undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
        if (response?.confirm) {
          const locale = this.settingsService.language.code;
          const dateFormat = this.settingsService.dateFormat;
          const data = this.loanProductService.isLoanProduct
            ? {
                transactionDate: this.dateUtils.formatDate(
                  this.transactionData.date && new Date(this.transactionData.date),
                  dateFormat
                ),
                transactionAmount: 0,
                dateFormat,
                locale
              }
            : {};
          const command = this.transactionType && this.isWriteOff(this.transactionType) ? 'undowriteoff' : 'undo';
          const transactionId = command === 'undowriteoff' ? null : this.transactionData.id;
          const undoRequest = this.loanProductService.isWorkingCapital
            ? this.loansService.applyWorkingCapitalLoanActionCommand(accountId, data, command, transactionId)
            : this.loansService.executeLoansAccountTransactionsCommand(accountId, command, data, transactionId);
          undoRequest.subscribe(() => this.navigateToTransactionList());
        }
      });
    }
  }

  /**
   * Opens the dialog that collects the optional note and reversal external id
   * the backend stamps on the reversed transaction.
   * @param titleKey Translation key of the dialog title
   * @param confirmButtonKey Translation key of the confirm button
   */
  private openReversalDialog(titleKey: string, confirmButtonKey: string): MatDialogRef<FormDialogComponent> {
    return this.dialog.open(
      FormDialogComponent,
      buildReversalDialogConfig(
        this.translateService,
        titleKey,
        confirmButtonKey,
        this.willReopenLoan ? REOPEN_LOAN_WARNING_KEY : undefined
      )
    );
  }

  /**
   * Reverses a Term Loan transaction through the adjust command. A zero amount
   * means reverse only: the original transaction is reversed and no replacement
   * is created.
   * @param accountId Loan id
   */
  private reverseTermLoanTransaction(accountId: string): void {
    this.openReversalDialog('labels.heading.Reverse Transaction', 'labels.buttons.Reverse')
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (!response?.data) {
          return;
        }
        const dateFormat = this.settingsService.dateFormat;
        const payload: any = {
          transactionDate: this.dateUtils.formatDate(
            this.transactionData.date && new Date(this.transactionData.date),
            dateFormat
          ),
          transactionAmount: 0,
          dateFormat,
          locale: this.settingsService.language.code
        };
        appendReversalFields(payload, response.data.value);
        this.loansService
          .executeLoansAccountTransactionsCommand(accountId, 'adjust', payload, this.transactionData.id)
          .subscribe(() => this.navigateToTransactionList());
      });
  }

  /**
   * Undoes a Term Loan charge-off. The command targets the loan, not a single
   * transaction, so it mirrors the action available on the account header
   * rather than going through the adjust command.
   * @param accountId Loan id
   */
  private undoTermLoanChargeOff(accountId: string): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: this.translateService.instant('labels.heading.Undo Transaction'),
          dialogContext:
            this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction type') +
            ' ' +
            this.translateService.instant('labels.menus.Charge-Off')
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: { confirm: boolean }) => {
        if (!response?.confirm) {
          return;
        }
        this.loansService
          .executeLoansAccountTransactionsCommand(accountId, 'undo-charge-off', {})
          .subscribe(() => this.navigateToTransactionList());
      });
  }

  /** Returns to the transaction list so every resolver refetches the rewritten loan data. */
  private navigateToTransactionList(): void {
    this.router.navigate(['../'], {
      queryParams: {
        productType: this.loanProductService.productType.value
      },
      relativeTo: this.route
    });
  }

  /**
   * Undoes a Working Capital charge-off from the transaction detail view.
   * Uses the same dialog and command as the account header action so every
   * entry point posts the same request.
   * @param accountId Loan id
   */
  private undoWorkingCapitalChargeOff(accountId: string): void {
    this.dialog
      .open<WorkingCapitalUndoChargeOffDialogComponent, unknown, WorkingCapitalUndoChargeOffDialogResult>(
        WorkingCapitalUndoChargeOffDialogComponent
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result?.confirm) {
          return;
        }
        const payload = buildWorkingCapitalUndoChargeOffPayload(result, this.settingsService.language.code);
        // The undo charge-off command targets the loan, not a single transaction.
        this.loansService
          .applyWorkingCapitalLoanActionCommand(accountId, payload, 'undoChargeOff')
          .subscribe(() => this.navigateToTransactionList());
      });
  }

  chargebackTransaction() {
    const accountId = this.route.snapshot.params['loanId'];
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'paymentTypeId',
        label: 'Payment Type',
        value: '',
        options: { label: 'name', value: 'id', data: this.paymentTypeOptions },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: this.amountRelationsAllowed,
        type: 'number',
        required: true,
        max: this.amountRelationsAllowed,
        order: 2
      })
    ];
    const data = {
      title: `Chargeback ${this.transactionType.value} Transaction`,
      layout: { addButtonText: 'Chargeback' },
      formfields: formfields
    };
    const chargebackDialogRef = this.dialog.open(FormDialogComponent, { data });
    chargebackDialogRef.afterClosed().subscribe((response: { data: any }) => {
      if (response?.data) {
        if (response.data.value.amount <= this.amountRelationsAllowed) {
          const locale = this.settingsService.language.code;
          const payload = {
            transactionAmount: response.data.value.amount,
            paymentTypeId: response.data.value.paymentTypeId,
            locale
          };
          this.loansService
            .executeLoansAccountTransactionsCommand(accountId, 'chargeback', payload, this.transactionData.id)
            .subscribe(() => {
              this.router.navigate(['../'], {
                queryParams: {
                  productType: this.loanProductService.productType.value
                },
                relativeTo: this.route
              });
            });
        } else {
          this.alertService.alert({
            type: 'BusinessRule',
            message: 'Chargeback amount must be lower or equal to: ' + this.amountRelationsAllowed
          });
        }
      }
    });
  }

  loanTransactionRelatedLink(transactionId: number) {
    return `/#/clients/${this.clientId}/loans-accounts/${this.loanId}/transactions/${transactionId}`;
  }

  loanTransactionColor(): string {
    if (this.transactionData.manuallyReversed || this.transactionData.reversed) {
      return 'undo';
    }
    if (this.existTransactionRelations) {
      return 'linked';
    }
    return 'active';
  }

  get transactionBadgeClass(): string {
    if (!this.transactionType) return 'badge-repayment';
    const t = this.transactionType;
    if (this.transactionData.manuallyReversed || this.transactionData.reversed) return 'badge-reversed';
    if (isAccrualKindTransaction(t)) return 'badge-accrual';
    if (t.disbursement) return 'badge-disbursement';
    if (t.downPayment || t.code === 'loanTransactionType.downPayment') return 'badge-downpayment';
    if (t.chargeoff || t.code === 'loanTransactionType.chargeOff') return 'badge-chargeoff';
    if (t.reAge) return 'badge-reage';
    if (t.reAmortize) return 'badge-reamortize';
    if (isDiscountFeeKindTransaction(t)) return 'badge-discount';
    if (this.existTransactionRelations) return 'badge-linked';
    return 'badge-repayment';
  }

  get transactionBorderClass(): string {
    if (!this.transactionType) return 'card-tx--repayment';
    const t = this.transactionType;
    if (this.transactionData.manuallyReversed || this.transactionData.reversed) return 'card-tx--reversed';
    if (isAccrualKindTransaction(t)) return 'card-tx--accrual';
    if (t.disbursement) return 'card-tx--disbursement';
    if (t.downPayment || t.code === 'loanTransactionType.downPayment') return 'card-tx--downpayment';
    if (t.chargeoff || t.code === 'loanTransactionType.chargeOff') return 'card-tx--chargeoff';
    if (t.reAge) return 'card-tx--reage';
    if (t.reAmortize) return 'card-tx--reamortize';
    if (isDiscountFeeKindTransaction(t)) return 'card-tx--discount';
    if (this.existTransactionRelations) return 'card-tx--linked';
    return 'card-tx--repayment';
  }
}
