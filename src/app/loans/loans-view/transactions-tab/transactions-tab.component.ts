/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSlideToggle,
    MatTable,
    MatSort,
    MatColumnDef,
    MatCellDef,
    MatCell,
    NgClass,
    ExternalIdentifierComponent,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsTabComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  private loansService = inject(LoansService);
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Loan Details Data */
  transactionsData: LoanTransaction[] = [];
  loanDetailsData: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: FormControl<boolean>;
  hideReversedParam: FormControl<boolean>;
  /** Stores the status of the loan account */
  status: string;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = [];
  groupHeaderColumns: string[] = [];
  breakdownColspan = 0;

  dataSource: MatTableDataSource<any>;
  totalTransactions = 0;
  totalPages = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  loanId: number;
  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    super();
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];
    this.route.parent.parent.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanDetailsData: any }) => {
        this.loanDetailsData = data.loanDetailsData;
        this.status = data.loanDetailsData.status.value;
      });
    if (this.loanProductService.isWorkingCapital) {
      this.loanDetailsData.transactions = [];
      this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanTransactionData: any }) => {
        this.loanDetailsData.transactions = data.loanTransactionData.content ?? [];
        this.totalTransactions = data.loanTransactionData.totalElements ?? 0;
        this.totalPages = data.loanTransactionData.totalPages ?? 0;
        this.cdr.markForCheck();
      });
    }
  }

  ngOnInit() {
    if (this.loanProductService.isLoanProduct) {
      this.displayedColumns = [
        'row',
        'id',
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
      this.breakdownColspan = 5; // amount, principal, interest, fee, penalties
      this.groupHeaderColumns = [
        'group-row',
        'group-id',
        'group-externalId',
        'group-date',
        'group-transactionType',
        'group-breakdown',
        'group-loanBalance',
        'group-actions'
      ];
    } else {
      this.displayedColumns = [
        'row',
        'id',
        'externalId',
        'date',
        'transactionType',
        'amount',
        'principal',
        'fee',
        'penalties',
        'actions'
      ];
      this.breakdownColspan = 4; // amount, principal, fee, penalties
      this.groupHeaderColumns = [
        'group-row',
        'group-id',
        'group-externalId',
        'group-date',
        'group-transactionType',
        'group-breakdown',
        'group-actions'
      ];
    }
    this.transactionsData = this.loanDetailsData.transactions;
    this.hideAccrualsParam = new FormControl<boolean>(true, { nonNullable: true });
    this.hideReversedParam = new FormControl<boolean>(false, { nonNullable: true });
    this.setLoanTransactions();
    if (this.loanProductService.isWorkingCapital) {
      this.paginator.length = this.totalTransactions;
      this.paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        this.loadWorkingCapitalTransactions(event.pageIndex, event.pageSize);
      });
    }
  }

  setLoanTransactions() {
    this.transactionsData.forEach((element: any) => {
      if (!(element.date instanceof Date)) {
        element.date = this.dateUtils.parseDate(element.date);
      }
    });
    this.dataSource = new MatTableDataSource(this.transactionsData);
    if (this.loanProductService.isLoanProduct) {
      this.dataSource.paginator = this.paginator;
    }
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

  onFilterChange() {
    this.filterTransactions(this.hideReversedParam.value, this.hideAccrualsParam.value);
  }

  filterTransactions(hideReversed: boolean, hideAccrual: boolean): void {
    let transactions: LoanTransaction[] = this.transactionsData;

    if (hideAccrual || hideReversed) {
      transactions = this.transactionsData.filter((t: LoanTransaction) => {
        return !(hideReversed && (t.manuallyReversed || t.reversed)) && !(hideAccrual && this.isAccrualKindOf(t.type));
      });
    }
    this.dataSource = new MatTableDataSource(transactions);
    if (this.loanProductService.isLoanProduct) {
      this.dataSource.paginator = this.paginator;
    }
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
      this.router.navigate([transactionsData.id], {
        queryParams: {
          productType: this.loanProductService.productType.value
        },
        relativeTo: this.route
      });
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
   * CAPITALIZED_INCOME_AMORTIZATION:36
   * CAPITALIZED INCOME ADJUSTMENT:37
   * CONTRACT_TERMINATION:38
   * BUY_DOWN_FEE:40
   * BUY_DOWN_FEE_ADJUSTMENT:41
   * BUY_DOWN_FEE_AMORTIZATION:42
   * DISCOUNT_FEE:44
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
      32,
      33,
      35,
      36,
      37,
      38,
      40,
      41,
      42,
      44
    ].includes(transactionsData.type.id);
  }

  allowUndoTransaction(transaction: LoanTransaction) {
    if (transaction.manuallyReversed || transaction.reversed) {
      return false;
    }
    return !(
      transaction.type.disbursement ||
      transaction.type.chargeoff ||
      this.isReAgoeOrReAmortize(transaction.type) ||
      transaction.type.interestRefund ||
      this.isDiscountFee(transaction.type) ||
      transaction.type.contractTermination
    );
  }

  loanTransactionBadgeClass(transaction: LoanTransaction): string {
    if (transaction.manuallyReversed || transaction.reversed) return 'badge-reversed';
    if (this.isAccrualKindOf(transaction.type)) return 'badge-accrual';
    if (transaction.type.disbursement) return 'badge-disbursement';
    if (this.isDownPayment(transaction.type)) return 'badge-downpayment';
    if (this.isChargeOff(transaction.type)) return 'badge-chargeoff';
    if (this.isReAge(transaction.type)) return 'badge-reage';
    if (this.isReAmortize(transaction.type)) return 'badge-reamortize';
    if (transaction.transactionRelations?.length > 0) return 'badge-linked';
    return 'badge-repayment';
  }

  loanTransactionColor(transaction: LoanTransaction): string {
    if (transaction.manuallyReversed || transaction.reversed) {
      return 'strike';
    }
    if (this.isAccrualKindOf(transaction.type)) {
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
    if (transaction.transactionRelations && transaction.transactionRelations.length > 0) {
      return 'linked';
    }
    return '';
  }

  loanTransactionBorderClass(transaction: LoanTransaction): string {
    if (transaction.manuallyReversed || transaction.reversed) {
      return 'row-reversed';
    }
    if (this.isAccrualKindOf(transaction.type)) {
      return 'row-accrual';
    }
    if (transaction.type.disbursement) {
      return 'row-disbursement';
    }
    if (this.isDownPayment(transaction.type)) {
      return 'row-down-payment';
    }
    if (this.isChargeOff(transaction.type)) {
      return 'row-chargeoff';
    }
    if (this.isReAge(transaction.type)) {
      return 'row-reage';
    }
    if (this.isReAmortize(transaction.type)) {
      return 'row-reamortize';
    }
    if (transaction.transactionRelations && transaction.transactionRelations.length > 0) {
      return 'row-linked';
    }
    return 'row-repayment';
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
    } else if (this.isWriteOff(transaction.type)) {
      command = 'undowriteoff';
      payload = {
        transactionDate: this.dateUtils.formatDate(operationDate && new Date(operationDate), dateFormat),
        transactionAmount: 0,
        dateFormat,
        locale
      };
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
        if (this.isChargeOff(transaction.type) || command === 'undowriteoff' || this.isWriteOff(transaction.type)) {
          transactionId = null;
        }
        if (this.loanProductService.isLoanProduct) {
          this.loansService
            .executeLoansAccountTransactionsCommand(loanId, command, payload, transactionId)
            .subscribe((responseCmd: any) => {
              transaction.manuallyReversed = true;
              this.reload();
            });
        } else {
          this.loansService
            .applyWorkingCapitalLoanActionCommand(loanId, payload, command, transactionId)
            .subscribe((responseCmd: any) => {
              transaction.reversed = true;
              this.reload();
            });
        }
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

  isWriteOff(transactionType: LoanTransactionType): boolean {
    return transactionType.writeOff || transactionType.code === 'loanTransactionType.writeOff';
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

  private isBuyDownFeeAmortization(transactionType: LoanTransactionType): boolean {
    return (
      transactionType.buyDownFeeAmortizationAdjustment ||
      transactionType.code === 'loanTransactionType.buyDownFeeAmortizationAdjustment'
    );
  }

  private isAccrualKindOf(transactionType: LoanTransactionType): boolean {
    return (
      this.isAccrual(transactionType) ||
      this.isCapitalizedIncomeAmortization(transactionType) ||
      this.isBuyDownFeeAmortization(transactionType)
    );
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

  private isDiscountFee(transactionType: LoanTransactionType): boolean {
    return transactionType.discountFee || transactionType.code === 'loanTransactionType.discountFee';
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
          this.displayAlertMessage(this.translateService.instant('errors.loans.alreadyAdjusted'), transaction.amount);
        } else {
          const transactionAmount = response.amount || transaction.amount;
          const formfields: FormfieldBase[] = [
            new DatepickerBase({
              controlName: 'transactionDate',
              label: this.translateService.instant('labels.inputs.Date'),
              value: this.dateUtils.parseDate(transactionDate),
              type: 'datetime-local',
              required: true,
              minDate: this.dateUtils.parseDate(transaction.date),
              order: 1
            }),
            new InputBase({
              controlName: 'amount',
              label: this.translateService.instant('labels.inputs.Amount'),
              value: transactionAmount,
              type: 'number',
              required: true,
              min: 0.001,
              max: transactionAmount,
              validators: [
                Validators.min(0.001),
                Validators.max(transactionAmount)
              ],
              order: 2
            })
          ];
          const data = {
            title: this.translateService.instant('errors.loans.adjustment', {
              type: this.translateService.instant('labels.catalogs.' + transaction.type.value)
            }),
            layout: { addButtonText: this.translateService.instant('labels.buttons.Adjustment') },
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
                  this.translateService.instant('errors.loans.capitalizedIncomeLimit'),
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
          this.displayAlertMessage(
            this.translateService.instant('errors.loans.buyDownFeeAdjusted'),
            transaction.amount
          );
        } else {
          const transactionAmount = response.amount || transaction.amount;
          const formfields: FormfieldBase[] = [
            new DatepickerBase({
              controlName: 'transactionDate',
              label: this.translateService.instant('labels.inputs.Date'),
              value: this.dateUtils.parseDate(transactionDate),
              type: 'datetime-local',
              required: true,
              minDate: this.dateUtils.parseDate(transaction.date),
              order: 1
            }),
            new InputBase({
              controlName: 'amount',
              label: this.translateService.instant('labels.inputs.Amount'),
              value: transactionAmount,
              type: 'number',
              required: true,
              min: 0.001,
              max: transactionAmount,
              validators: [
                Validators.min(0.001),
                Validators.max(transactionAmount)
              ],
              order: 2
            })
          ];
          const data = {
            title: this.translateService.instant('errors.loans.adjustment', {
              type: this.translateService.instant('labels.catalogs.' + transaction.type.value)
            }),
            layout: { addButtonText: this.translateService.instant('labels.buttons.Adjustment') },
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
                this.displayAlertMessage(
                  this.translateService.instant('errors.loans.buyDownFeeLimit'),
                  transactionAmount
                );
              }
            }
          });
        }
      });
  }

  private loadWorkingCapitalTransactions(page: number, size: number): void {
    this.loansService
      .getWorkingCapitalTransactions(String(this.loanId), page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.transactionsData = response.content ?? [];
        this.totalTransactions = response.totalElements ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.paginator.length = this.totalTransactions;
        this.setLoanTransactions();
        this.cdr.markForCheck();
      });
  }

  private displayAlertMessage(label: string, amount: number): void {
    let message: string = label;
    if (amount) {
      message = this.translateService.instant('errors.loans.alertWithAmount', { label, amount });
    }
    this.alertService.alert({
      type: this.translateService.instant('errors.loans.businessRule'),
      message: message
    });
  }
}
