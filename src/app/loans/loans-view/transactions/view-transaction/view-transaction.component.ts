/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
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
import { NgIf, NgClass, CurrencyPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { TransactionPaymentDetailComponent } from '../../../../shared/transaction-payment-detail/transaction-payment-detail.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Dialogs */

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
  ]
})
export class ViewTransactionComponent implements OnInit {
  /** Transaction data. */
  transactionData: any;
  transactionType: LoanTransactionType;
  /** Is Editable */
  allowEdition = true;
  /** Is Undoable */
  allowUndo = true;
  /** Is able to be Chargeback */
  allowChargeback = true;
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
  loanId: number;

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
  constructor(
    private loansService: LoansService,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private settingsService: SettingsService,
    private organizationService: OrganizationService,
    private alertService: AlertService
  ) {
    this.route.data.subscribe((data: { loansAccountTransaction: any }) => {
      this.transactionData = data.loansAccountTransaction;
      this.transactionType = this.transactionData.type;
      this.allowEdition =
        !this.transactionData.manuallyReversed && !this.allowTransactionEdition(this.transactionData.type.id);
      this.allowUndo = this.allowUndoTransaction(this.transactionData.manuallyReversed, this.transactionType);
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
      if (!this.allowChargeback) {
        this.allowEdition = false;
      }
      if (
        (this.existTransactionRelations && transactionsChargebackRelated) ||
        this.transactionType.reAge ||
        this.transactionType.reAmortize
      ) {
        this.allowUndo = false;
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
   * Allow edit, undo and chargeback actions
   */
  allowTransactionEdition(transactionType: number): boolean {
    return (
      transactionType === 20 ||
      transactionType === 21 ||
      transactionType === 22 ||
      transactionType === 23 ||
      transactionType === 28
    );
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

  allowUndoTransaction(manuallyReversed: boolean, transactionType: LoanTransactionType): boolean {
    if (manuallyReversed) {
      return false;
    }
    if (transactionType.interestRefund) {
      return false;
    }
    return true;
  }

  /**
   * Undo the loans transaction
   */
  undoTransaction() {
    const accountId = this.route.snapshot.params['loanId'];

    if (this.transactionType.contractTermination) {
      const formfields: FormfieldBase[] = [
        new InputBase({
          controlName: 'note',
          label: 'Note',
          value: '',
          type: 'text',
          required: false,
          order: 1
        }),
        new InputBase({
          controlName: 'reversalExternalId',
          label: 'externalId',
          value: '',
          type: 'text',
          required: false,
          order: 2
        })

      ];
      const data = {
        title: this.translateService.instant('labels.heading.Undo Transaction'),
        layout: { addButtonText: 'Undo' },
        formfields: formfields,
        pristine: false
      };
      const undoTransactionAccountDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
      undoTransactionAccountDialogRef.afterClosed().subscribe((response: any) => {
        if (response.data) {
          const payload = {
            note: response.data.value.note,
            reversalExternalId: response.data.value.reversalExternalId
          };

          this.loansService.loanActionButtons(accountId, 'undoContractTermination', payload).subscribe(() => {
            this.router.navigate(['../'], { relativeTo: this.route });
          });
        }
      });
    } else {
      const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          heading: this.translateService.instant('labels.heading.Undo Transaction'),
          dialogContext:
            this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction') +
            `${this.transactionData.id}`
        }
      });
      undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
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
          this.loansService
            .executeLoansAccountTransactionsCommand(accountId, 'undo', data, this.transactionData.id)
            .subscribe(() => {
              this.router.navigate(['../'], { relativeTo: this.route });
            });
        }
      });
    }
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
      if (response.data) {
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
              this.router.navigate(['../'], { relativeTo: this.route });
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
    if (this.transactionData.manuallyReversed) {
      return 'undo';
    }
    if (this.existTransactionRelations) {
      return 'linked';
    }
    return 'active';
  }
}
