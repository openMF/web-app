import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatCellDef,
  MatCell,
  MatHeaderCellDef,
  MatHeaderCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { LoanTransaction } from 'app/products/loan-products/models/loan-account.model';
import { LoanTransactionType } from 'app/loans/models/loan-transaction-type.model';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { AlertService } from 'app/core/alert/alert.service';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { NgClass } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatTable,
    MatSort,
    MatColumnDef,
    MatCellDef,
    MatCell,
    NgClass,
    ExternalIdentifierComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    FaIconComponent,
    MatHeaderCellDef,
    MatHeaderCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class TransactionsTabComponent implements OnInit {
  /** Loan Details Data */
  transactionsData: LoanTransaction[] = [];
  loanDetailsData: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: UntypedFormControl;
  hideReversedParam: UntypedFormControl;
  /** Stores the status of the loan account */
  status: string;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = [
    'row',
    'id',
    'office',
    'externalId',
    'date',
    'transactionType',
    'amount',
    'principal',
    'interest',
    'fee',
    'penalties',
    'loanBalance',
    'actions'
  ];
  displayedHeader1Columns: string[] = [
    'h1-row',
    'h1-id',
    'h1-office',
    'h1-external-id',
    'h1-transaction-date',
    'h1-transaction-type',
    'h1-space',
    'h1-breakdown',
    'h1-loan-balance',
    'h1-actions'
  ];
  displayedHeader2Columns: string[] = [
    'h2-space',
    'h2-amount',
    'h2-principal',
    'h2-interest',
    'h2-fees',
    'h2-penalties',
    'h2-action'
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  loanId: number;
  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    private dialog: MatDialog,
    private loansService: LoansService,
    private translateService: TranslateService,
    private settingsService: SettingsService,
    private alertService: AlertService
  ) {
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetailsData = data.loanDetailsData;
      this.status = data.loanDetailsData.status.value;
    });
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.transactionsData = this.loanDetailsData.transactions;
    this.hideAccrualsParam = new UntypedFormControl(false);
    this.hideReversedParam = new UntypedFormControl(false);
    this.setLoanTransactions();
  }

  setLoanTransactions() {
    this.transactionsData.forEach((element: any) => {
      element.date = this.dateUtils.parseDate(element.date);
    });
    this.dataSource = new MatTableDataSource(this.transactionsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Checks Status of the loan account
   */
  checkStatus() {
    if (
      this.status === 'Active' ||
      this.status === 'Closed (obligations met)' ||
      this.status === 'Overpaid' ||
      this.status === 'Closed (rescheduled)' ||
      this.status === 'Closed (written off)'
    ) {
      return true;
    }
    return false;
  }

  hideAccruals() {
    this.filterTransactions(this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  hideReversed() {
    this.filterTransactions(this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  filterTransactions(hideReversed: boolean, hideAccrual: boolean): void {
    let transactions: LoanTransaction[] = this.transactionsData;

    if (hideAccrual || hideReversed) {
      transactions = this.transactionsData.filter((t: LoanTransaction) => {
        return (
          !(hideReversed && t.manuallyReversed) &&
          !(hideAccrual && (t.type.accrual || t.type.capitalizedIncomeAmortization))
        );
      });
    }
    this.dataSource = new MatTableDataSource(transactions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  removeItem(arr: any, item: any) {
    return arr.filter((f: any) => f !== item);
  }

  /**
   * Show Transactions Details
   * @param transactionsData Transactions Data
   */
  showTransactions(transactionsData: LoanTransaction) {
    if (this.showTransaction(transactionsData)) {
      this.router.navigate([transactionsData.id], { relativeTo: this.route });
    }
  }

  /**
   * Show Transaction Details
   * @param transactionsData Transaction Data
   * DISBURSEMENT:1
   * REPAYMENT:2
   * WAIVE_INTEREST:4
   * WAIVE_CHARGES:9
   * ACCRUAL:10
   * REFUND:16
   * CHARGE_PAYMENT:17
   * REFUND_FOR_ACTIVE_LOAN:18
   * INCOME_POSTING: 19
   * CREDIT_BALANCE_REFUND:20
   * MERCHANT_ISSUED_REFUND:21
   * PAYOUT_REFUND:22
   * GOODWILL_CREDIT:23
   * CHARGE_REFUND:24
   * CHARGEBACK:25
   * CHARGE_ADJUSTMENT:26
   * CHARGE_OFF:27
   * DOWN_PAYMENT:28
   * REAGE:29
   * REAMORTIZE:30
   * INTEREST REFUND:33
   * CAPITALIZED INCOME:35
   * CAPITALIZED INCOME ADJUSTMENT:37
   * CONTRACT_TERMINATION:38
   * BUY_DOWN_FEE:40
   * BUY_DOWN_FEE_ADJUSTMENT:41
   */
  showTransaction(transactionsData: LoanTransaction): boolean {
    return [
      1,
      2,
      4,
      9,
      20,
      21,
      22,
      23,
      26,
      28,
      29,
      30,
      31,
      33,
      35,
      37,
      38,
      40,
      41
    ].includes(transactionsData.type.id);
  }

  allowUndoTransaction(transaction: LoanTransaction) {
    if (transaction.manuallyReversed) {
      return false;
    }
    return !(
      transaction.type.disbursement ||
      transaction.type.chargeoff ||
      this.isReAgoeOrReAmortize(transaction.type) ||
      transaction.type.interestRefund ||
      transaction.type.contractTermination
    );
  }

  loanTransactionColor(transaction: LoanTransaction): string {
    if (transaction.manuallyReversed) {
      return 'strike';
    }
    if (transaction.transactionRelations && transaction.transactionRelations.length > 0) {
      return 'linked';
    }
    if (this.isAccrual(transaction.type) || this.isCapitalizedIncomeAmortization(transaction.type)) {
      return 'accrual';
    }
    if (this.isChargeOff(transaction.type)) {
      return 'chargeoff';
    }
    if (this.isDownPayment(transaction.type)) {
      return 'down-payment';
    }
    if (this.isReAge(transaction.type)) {
      return 'reage';
    }
    if (this.isReAmortize(transaction.type)) {
      return 'reamortize';
    }
    return '';
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  undoTransaction(transaction: LoanTransaction, $event: MouseEvent) {
    $event.stopPropagation();
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const loanId = this.route.parent.parent.snapshot.params['loanId'];
    let command = 'undo';
    let operationDate = this.dateUtils.parseDate(transaction.date);
    let payload = {};
    if (this.isChargeOff(transaction.type)) {
      command = 'undo-charge-off';
      operationDate = this.settingsService.businessDate;
      payload = {};
    } else {
      payload = {
        transactionDate: this.dateUtils.formatDate(operationDate && new Date(operationDate), dateFormat),
        transactionAmount: 0,
        dateFormat,
        locale
      };
    }

    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Undo Transaction'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction type') +
          `${transaction.type.value}` +
          this.translateService.instant('labels.dialogContext.with id') +
          `${transaction.id}`
      }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        let transactionId = transaction.id;
        if (this.isChargeOff(transaction.type)) {
          transactionId = null;
        }
        this.loansService
          .executeLoansAccountTransactionsCommand(loanId, command, payload, transactionId)
          .subscribe((responseCmd: any) => {
            transaction.manuallyReversed = true;
            this.reload();
          });
      }
    });
  }

  undoReAgeOrReAmortize(transaction: LoanTransaction): void {
    const actionName = transaction.type.reAmortize ? 'Re-Amortize' : 'Re-Age';
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
        const undoCommand = actionName === 'Re-Age' ? 'undoReAge' : 'undoReAmortize';
        this.loansService.executeLoansAccountTransactionsCommand(String(this.loanId), undoCommand, {}).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  private isAccrual(transactionType: LoanTransactionType): boolean {
    return transactionType.accrual || transactionType.code === 'loanTransactionType.overdueCharge';
  }

  private isChargeOff(transactionType: LoanTransactionType): boolean {
    return transactionType.chargeoff || transactionType.code === 'loanTransactionType.chargeOff';
  }

  private isDownPayment(transactionType: LoanTransactionType): boolean {
    return transactionType.downPayment || transactionType.code === 'loanTransactionType.downPayment';
  }

  private isReAge(transactionType: LoanTransactionType): boolean {
    return transactionType.reAge || transactionType.code === 'loanTransactionType.reAge';
  }

  private isReAmortize(transactionType: LoanTransactionType): boolean {
    return transactionType.reAmortize || transactionType.code === 'loanTransactionType.reAmortize';
  }

  private isCapitalizedIncome(transactionType: LoanTransactionType): boolean {
    return transactionType.capitalizedIncome || transactionType.code === 'loanTransactionType.capitalizedIncome';
  }

  private isCapitalizedIncomeAmortization(transactionType: LoanTransactionType): boolean {
    return (
      transactionType.capitalizedIncomeAmortization ||
      transactionType.code === 'loanTransactionType.capitalizedIncomeAmortization'
    );
  }

  private isReAgoeOrReAmortize(transactionType: LoanTransactionType): boolean {
    return this.isReAmortize(transactionType) || this.isReAge(transactionType);
  }

  isBuyDownFee(transactionType: LoanTransactionType): boolean {
    return transactionType.buyDownFee || transactionType.code === 'loanTransactionType.buyDownFee';
  }

  viewJournalEntry(transactionType: LoanTransactionType): boolean {
    return !(this.isReAmortize(transactionType) || this.isReAge(transactionType));
  }

  canCreateInterestRefund(transaction: LoanTransaction): boolean {
    const type = transaction?.type?.code?.toLowerCase() || '';
    const isRefundType = type.includes('payoutrefund') || type.includes('merchantissuedrefund');
    if (!isRefundType) return false;
    if (transaction.manuallyReversed) return false;
    if (
      transaction.transactionRelations &&
      transaction.transactionRelations.some((r) => r.relationType === 'INTEREST_REFUND')
    )
      return false;
    return true;
  }

  openInterestRefundDialog(transaction: LoanTransaction) {
    const loanId = this.loanId;
    this.loansService
      .getLoanTransactionActionTemplate(String(loanId), 'interest-refund', String(transaction.id))
      .subscribe((template: any) => {
        const paymentTypeField = new FormfieldBase({
          controlType: 'select',
          controlName: 'paymentTypeId',
          label: this.translateService.instant('labels.inputs.Payment Type'),
          value: template.paymentTypeId || '',
          required: true,
          order: 2
        });
        (paymentTypeField as any).options = {
          data: template.paymentTypeOptions || [],
          value: 'id',
          label: 'name'
        };
        const formfields: FormfieldBase[] = [
          new InputBase({
            controlName: 'amount',
            label: this.translateService.instant('labels.inputs.Amount'),
            value: template.amount,
            type: 'number',
            required: true,
            readonly: true,
            order: 1
          }),
          paymentTypeField,
          new InputBase({
            controlName: 'externalId',
            label: this.translateService.instant('labels.inputs.External Id'),
            value: '',
            type: 'text',
            required: false,
            order: 3
          }),
          new InputBase({
            controlName: 'note',
            label: this.translateService.instant('labels.inputs.Note'),
            value: '',
            type: 'text',
            required: false,
            order: 4
          })

        ];
        const data = {
          title: this.translateService.instant('labels.buttons.Create Interest Refund'),
          layout: { addButtonText: this.translateService.instant('labels.buttons.Create Interest Refund') },
          formfields: formfields
        };
        const dialogRef = this.dialog.open(FormDialogComponent, { data });
        dialogRef.afterClosed().subscribe((response: { data: any }) => {
          if (response?.data) {
            const { amount, transactionDate, ...rest } = response.data.value;
            const payload = {
              ...rest,
              transactionAmount: amount,
              locale: this.settingsService.language.code,
              dateFormat: this.settingsService.dateFormat
            };
            this.loansService
              .executeLoansAccountTransactionsCommand(
                String(loanId),
                'interest-refund',
                payload,
                String(transaction.id)
              )
              .subscribe(() => {
                this.reload();
              });
          }
        });
      });
  }

  private reload() {
    const clientId = this.route.parent.parent.snapshot.params['clientId'];
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients`, { skipLocationChange: true }).then(() => this.router.navigate([url]));
  }

  displaySubMenu(transaction: LoanTransaction): boolean {
    if (this.isReAgoeOrReAmortize(transaction.type) && transaction.manuallyReversed) {
      return false;
    }
    return true;
  }

  capitalizedIncomeAdjustmentTransaction(transaction: LoanTransaction) {
    const accountId = `${this.loanId}`;
    this.loansService
      .getLoanTransactionActionTemplate(accountId, 'capitalizedIncomeAdjustment', `${transaction.id}`)
      .subscribe((response: any) => {
        const transactionDate = response.date || transaction.date;
        if (response.amount == 0) {
          this.displayAlertMessage('Capitalized Income amount adjusted already adjusted', transaction.amount);
        } else {
          const transactionAmount = response.amount || transaction.amount;
          const formfields: FormfieldBase[] = [
            new DatepickerBase({
              controlName: 'transactionDate',
              label: 'Date',
              value: this.dateUtils.parseDate(transactionDate),
              type: 'datetime-local',
              required: true,
              minDate: this.dateUtils.parseDate(transaction.date),
              order: 1
            }),
            new InputBase({
              controlName: 'amount',
              label: 'Amount',
              value: transactionAmount,
              type: 'number',
              required: true,
              min: 0.001,
              max: transactionAmount,
              validators: [
                Validators.min(0.001),
                Validators.max(transactionAmount)],
              order: 2
            })

          ];
          const data = {
            title: `Adjustment ${transaction.type.value} Transaction`,
            layout: { addButtonText: 'Adjustment' },
            formfields: formfields,
            pristine: false
          };
          const chargebackDialogRef = this.dialog.open(FormDialogComponent, { data });
          chargebackDialogRef.afterClosed().subscribe((response: { data: any }) => {
            if (response.data) {
              const dateFormat = this.settingsService.dateFormat;

              if (response.data.value.amount <= transactionAmount) {
                const locale = this.settingsService.language.code;
                const payload = {
                  transactionDate: this.dateUtils.formatDate(response.data.value.transactionDate, dateFormat),
                  transactionAmount: response.data.value.amount,
                  locale,
                  dateFormat
                };
                this.loansService
                  .executeLoansAccountTransactionsCommand(
                    accountId,
                    'capitalizedIncomeAdjustment',
                    payload,
                    transaction.id
                  )
                  .subscribe(() => {
                    this.reload();
                  });
              } else {
                this.displayAlertMessage(
                  'Capitalized Income Adjustment amount must be lower or equal to',
                  transactionAmount
                );
              }
            }
          });
        }
      });
  }

  buyDownFeeAdjustmentTransaction(transaction: LoanTransaction) {
    const accountId = `${this.loanId}`;
    this.loansService
      .getLoanTransactionActionTemplate(accountId, 'buyDownFeeAdjustment', `${transaction.id}`)
      .subscribe((response: any) => {
        const transactionDate = response.date || transaction.date;
        if (response.amount == 0) {
          this.displayAlertMessage('Buy Down Fee amount already adjusted', transaction.amount);
        } else {
          const transactionAmount = response.amount || transaction.amount;
          const formfields: FormfieldBase[] = [
            new DatepickerBase({
              controlName: 'transactionDate',
              label: 'Date',
              value: this.dateUtils.parseDate(transactionDate),
              type: 'datetime-local',
              required: true,
              minDate: this.dateUtils.parseDate(transaction.date),
              order: 1
            }),
            new InputBase({
              controlName: 'amount',
              label: 'Amount',
              value: transactionAmount,
              type: 'number',
              required: true,
              min: 0.001,
              max: transactionAmount,
              validators: [
                Validators.min(0.001),
                Validators.max(transactionAmount)],
              order: 2
            })

          ];
          const data = {
            title: `Adjustment ${transaction.type.value} Transaction`,
            layout: { addButtonText: 'Adjustment' },
            formfields: formfields,
            pristine: false
          };
          const chargebackDialogRef = this.dialog.open(FormDialogComponent, { data });
          chargebackDialogRef.afterClosed().subscribe((response: { data: any }) => {
            if (response.data) {
              const dateFormat = this.settingsService.dateFormat;

              if (response.data.value.amount <= transactionAmount) {
                const locale = this.settingsService.language.code;
                const payload = {
                  transactionDate: this.dateUtils.formatDate(response.data.value.transactionDate, dateFormat),
                  transactionAmount: response.data.value.amount,
                  locale,
                  dateFormat
                };
                this.loansService
                  .executeLoansAccountTransactionsCommand(accountId, 'buyDownFeeAdjustment', payload, transaction.id)
                  .subscribe(() => {
                    this.reload();
                  });
              } else {
                this.displayAlertMessage('Buy Down Fee Adjustment amount must be lower or equal to', transactionAmount);
              }
            }
          });
        }
      });
  }

  private displayAlertMessage(label: string, amount: number): void {
    let message: string = this.translateService.instant('errors.' + label);
    if (amount) {
      message = message + ': ' + amount;
    }
    this.alertService.alert({
      type: 'BusinessRule',
      message: message
    });
  }
}
