/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { Currency, PaymentType } from 'app/shared/models/general.model';
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { AlertService } from 'app/core/alert/alert.service';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Loan Make Repayment Component
 */
@Component({
  selector: 'mifosx-make-repayment',
  templateUrl: './make-repayment.component.html',
  styleUrls: ['./make-repayment.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MakeRepaymentComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private penaltyManagementService = inject(PenaltyManagementService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);

  /** Payment Type Options */
  paymentTypes: PaymentType[] = [];
  /** Show payment details */
  showPaymentDetails = false;
  /** Waive Penalties toggle */
  waivePenalties = false;
  /** Prevents duplicate submissions */
  isSubmitting = false;
  /** Penalties list */
  penalties: any[] = [];
  /** Selected penalty IDs */
  selectedPenalties: number[] = [];
  /** Select all penalties checkbox */
  selectAllPenalties = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Repayment Loan Form */
  repaymentLoanForm: FormGroup | null = null;
  currency: Currency | null = null;
  command = '';
  classificationOptions: any[] = [];
  private originalAmount = 0;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    super();
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.command = this.resolveCommandFromActionName(this.dataObject.actionName);
    this.maxDate = this.settingsService.businessDate;
    this.createRepaymentLoanForm();
    this.setRepaymentLoanDetails();
    if (this.dataObject?.currency) {
      this.currency = this.dataObject.currency;
    }
    if (this.loanProductService.isLoanProduct && this.isRepayment()) {
      this.loadPenalties();
    }
  }

  get requiredPermission(): string {
    const map: Record<string, string> = {
      repayment: 'REPAYMENT_LOAN',
      goodwillCredit: 'CREATE_GOODWILL_TRANSACTION',
      interestPaymentWaiver: 'CREATE_INTERESTPAYMENTWAIVER_TRANSACTION',
      payoutRefund: 'CREATE_PAYOUT_REFUND',
      merchantIssuedRefund: 'CREATE_MERCHANT_ISSUED_REFUND',
      buyDownFee: 'BUYDOWNFEE_LOAN',
      capitalizedIncome: 'CAPITALIZEDINCOME_LOAN'
    };
    return map[this.command] ?? 'REPAYMENT_LOAN';
  }

  private resolveCommandFromActionName(actionName: string | undefined): string {
    const map: Record<string, string> = {
      'Make Repayment': 'repayment',
      'Capitalized Income': 'capitalizedIncome',
      'Goodwill Credit': 'goodwillCredit',
      'Buy Down Fee': 'buyDownFee',
      'Interest Payment Waiver': 'interestPaymentWaiver',
      'Payout Refund': 'payoutRefund',
      'Merchant Issued Refund': 'merchantIssuedRefund'
    };
    return actionName ? (map[actionName] ?? '') : '';
  }

  /**
   * Creates the create close form.
   */
  createRepaymentLoanForm() {
    this.repaymentLoanForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      externalId: null,
      paymentTypeId: null,
      note: '',
      skipInterestRefund: [false]
    });

    this.repaymentLoanForm.addControl('transactionAmount', new FormControl(0, []));
    this.updateTransactionAmountValidators(false);
    if (this.isCapitalizedIncome() || this.isBuyDownFee()) {
      this.repaymentLoanForm.addControl('classificationId', new FormControl(null));
    }
  }

  setRepaymentLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.classificationOptions = this.dataObject.classificationOptions;
    this.originalAmount = Number(this.dataObject.amount) || 0;
    if (this.repaymentLoanForm) {
      this.repaymentLoanForm.patchValue({
        transactionAmount: this.originalAmount
      });
    }
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.repaymentLoanForm) {
      if (this.showPaymentDetails) {
        this.repaymentLoanForm.addControl('accountNumber', new FormControl(''));
        this.repaymentLoanForm.addControl('checkNumber', new FormControl(''));
        this.repaymentLoanForm.addControl('routingCode', new FormControl(''));
        this.repaymentLoanForm.addControl('receiptNumber', new FormControl(''));
        this.repaymentLoanForm.addControl('bankNumber', new FormControl(''));
      } else {
        this.repaymentLoanForm.removeControl('accountNumber');
        this.repaymentLoanForm.removeControl('checkNumber');
        this.repaymentLoanForm.removeControl('routingCode');
        this.repaymentLoanForm.removeControl('receiptNumber');
        this.repaymentLoanForm.removeControl('bankNumber');
      }
    }
  }

  showDetails(): boolean {
    return !this.isCapitalizedIncome() && !this.isBuyDownFee();
  }

  isCapitalizedIncome(): boolean {
    return [
      'capitalizedIncome',
      'capitalizedIncomeAdjustment'
    ].includes(this.command);
  }

  isBuyDownFee(): boolean {
    return [
      'buyDownFee'
    ].includes(this.command);
  }

  isRepayment(): boolean {
    return [
      'repayment'
    ].includes(this.command);
  }

  showInterestRefundCheckbox(): boolean {
    const code = this.dataObject?.type?.code?.toLowerCase() || '';
    return code.includes('merchantissuedrefund') || code.includes('payoutrefund');
  }

  /**
   * Load penalties for the loan
   * Penalties are charges calculated for installments in the payment schedule.
   * Each penalty charge has a dueDate that corresponds to an installment due date.
   */
  loadPenalties() {
    this.penaltyManagementService
      .loadPenalties(this.loanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (penalties: any[]) => {
          this.penalties = penalties;
        },
        error: () => {
          this.penalties = [];
        }
      });
  }

  /**
   * Toggle waive penalties
   * Following the addPaymentDetails() pattern
   */
  toggleWaivePenalties() {
    this.waivePenalties = !this.waivePenalties;
    if (!this.waivePenalties) {
      // Reset selections when toggling off
      this.selectedPenalties = [];
      this.selectAllPenalties = false;
      this.updateTransactionAmountValidators(false);
      this.recalculateTransactionAmount();
    } else {
      this.recalculateTransactionAmount();
    }
  }

  /**
   * Toggle select all penalties
   * Following the toggleSelects() pattern from loans-active-client-members
   */
  toggleSelectAllPenalties() {
    const result = this.penaltyManagementService.toggleSelectAllPenalties(this.selectAllPenalties, this.penalties);
    this.selectAllPenalties = result.selectAllPenalties;
    this.selectedPenalties = result.selectedPenalties;
    this.recalculateTransactionAmount();
  }

  /**
   * Toggle individual penalty selection
   * Following the toggleSelect() pattern from loans-active-client-members
   */
  togglePenaltySelection(penaltyId: number) {
    const result = this.penaltyManagementService.togglePenaltySelection(
      penaltyId,
      this.selectedPenalties,
      this.penalties
    );
    this.selectedPenalties = result.selectedPenalties;
    this.selectAllPenalties = result.selectAllPenalties;
    this.recalculateTransactionAmount();
  }

  /**
   * Check if penalty is selected
   */
  isPenaltySelected(penaltyId: number): boolean {
    return this.penaltyManagementService.isPenaltySelected(penaltyId, this.selectedPenalties);
  }

  /**
   * Get penalty display key or plain text for translation/output
   * Normalizes common backend values (like MORA / labels.inputs.*) to translation keys
   */
  getPenaltyDisplayKey(penalty: any): string {
    return this.penaltyManagementService.getPenaltyDisplayKey(penalty);
  }

  /**
   * Recalculate transaction amount when penalties are waived
   */
  recalculateTransactionAmount() {
    const baseAmount = this.originalAmount;

    if (!this.waivePenalties || this.selectedPenalties.length === 0) {
      this.repaymentLoanForm?.patchValue(
        {
          transactionAmount: baseAmount
        },
        { emitEvent: false }
      );
      return;
    }

    // Calculate total waived amount
    let totalWaived = 0;
    this.selectedPenalties.forEach((penaltyId: number) => {
      const penalty = this.penalties.find((p: any) => p.id === penaltyId);
      if (penalty) {
        totalWaived += penalty.amountOutstanding || penalty.amount || 0;
      }
    });

    // Calculate new transaction amount
    const newAmount = Math.max(0, baseAmount - totalWaived);

    // Allow zero when fully waived
    this.updateTransactionAmountValidators(this.waivePenalties && newAmount === 0);

    this.repaymentLoanForm?.patchValue(
      {
        transactionAmount: newAmount
      },
      { emitEvent: false }
    );
  }

  /**
   * Update transaction amount validators to allow or disallow zero
   */
  private updateTransactionAmountValidators(allowZero: boolean) {
    const validators = [
      Validators.required,
      ...(allowZero ? [] : [Validators.min(0.001)])
    ];
    if (this.isCapitalizedIncome()) {
      validators.push(Validators.max(this.dataObject.amount));
    }
    this.repaymentLoanForm?.controls.transactionAmount.setValidators(validators);
    this.repaymentLoanForm?.controls.transactionAmount.updateValueAndValidity({ emitEvent: false });
  }

  /** Submits the repayment form */
  submit() {
    if (this.repaymentLoanForm?.invalid || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.cdr.markForCheck();

    const repaymentLoanFormData: any = this.repaymentLoanForm?.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.repaymentLoanForm?.value.transactionDate;
    if (repaymentLoanFormData.transactionDate instanceof Date) {
      repaymentLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const payload: any = {
      ...repaymentLoanFormData,
      dateFormat,
      locale
    };
    payload['transactionAmount'] = payload['transactionAmount'] * 1;
    if (repaymentLoanFormData.skipInterestRefund) {
      payload.interestRefundCalculation = false;
    }
    delete payload.skipInterestRefund;

    if (this.loanProductService.isWorkingCapital) {
      if (payload['paymentTypeId'] === null) {
        delete payload['paymentTypeId'];
      } else {
        if ('paymentDetails' in payload) {
          payload['paymentDetails']['paymentTypeId'] = payload['paymentTypeId'];
        } else {
          payload['paymentDetails'] = {
            paymentTypeId: payload['paymentTypeId']
          };
        }
        delete payload['paymentTypeId'];
      }
    }

    if (this.loanProductService.isLoanProduct && this.isRepayment()) {
      // Waive penalties first if selected, then submit repayment
      if (this.waivePenalties && this.selectedPenalties.length > 0) {
        this.penaltyManagementService
          .waivePenalties(this.loanProductService.loanAccountPath, this.loanId, this.selectedPenalties)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.submitCommandAction(payload);
            },
            error: () => {
              this.alertService.alert({
                type: 'Warning',
                message: 'Some penalties could not be waived. Proceeding with repayment.'
              });
            }
          });
      } else {
        this.submitCommandAction(payload);
      }
    } else {
      this.submitCommandAction(payload);
    }
  }

  private submitCommandAction(payload: any) {
    if (this.loanProductService.isLoanProduct) {
      this.loanService
        .submitLoanActionButton(this.loanId, payload, this.command)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.gotoLoanView('transactions');
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.loanService
        .applyWorkingCapitalLoanActionCommand(this.loanId, payload, this.command)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.gotoLoanView('transactions');
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
    }
  }
}
