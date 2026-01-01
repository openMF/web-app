/** Angular Imports */
import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatCheckbox,
    CdkTextareaAutosize,
    FormatNumberPipe
  ]
})
export class MakeRepaymentComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private loanService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private penaltyManagementService = inject(PenaltyManagementService);

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Waive Penalties toggle */
  waivePenalties = false;
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
  repaymentLoanForm: UntypedFormGroup;
  currency: Currency | null = null;

  command: string | null = null;

  classificationOptions: any[] = [];

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.command = this.dataObject.type.code.split('.')[1];
    this.maxDate = this.settingsService.businessDate;
    this.createRepaymentLoanForm();
    this.setRepaymentLoanDetails();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
    this.loadPenalties();
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
      externalId: '',
      paymentTypeId: '',
      note: '',
      skipInterestRefund: [false]
    });

    if (this.isCapitalizedIncome()) {
      this.repaymentLoanForm.addControl('transactionAmount', new UntypedFormControl('', []));
      this.updateTransactionAmountValidators(false);
    } else {
      this.repaymentLoanForm.addControl('transactionAmount', new UntypedFormControl('', []));
      this.updateTransactionAmountValidators(false);
    }
    if (this.isCapitalizedIncome() || this.isBuyDownFee()) {
      this.repaymentLoanForm.addControl('classificationId', new UntypedFormControl(''));
    }
  }

  setRepaymentLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.classificationOptions = this.dataObject.classificationOptions;
    this.repaymentLoanForm.patchValue({
      transactionAmount: this.dataObject.amount
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.repaymentLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.repaymentLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.repaymentLoanForm.removeControl('accountNumber');
      this.repaymentLoanForm.removeControl('checkNumber');
      this.repaymentLoanForm.removeControl('routingCode');
      this.repaymentLoanForm.removeControl('receiptNumber');
      this.repaymentLoanForm.removeControl('bankNumber');
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
    this.penaltyManagementService.loadPenalties(this.loanId).subscribe({
      next: (penalties: any[]) => {
        this.penalties = penalties;
      },
      error: (error: any) => {
        console.error('Error loading penalties:', error);
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
    const currentAmountValue = this.repaymentLoanForm.value.transactionAmount;
    const currentAmount =
      currentAmountValue !== undefined && currentAmountValue !== null
        ? Number(currentAmountValue)
        : Number(this.dataObject.amount ?? 0);
    const baseAmount = isNaN(currentAmount) ? Number(this.dataObject.amount ?? 0) : currentAmount;

    if (!this.waivePenalties || this.selectedPenalties.length === 0) {
      // Reset to original amount if no penalties selected
      this.repaymentLoanForm.patchValue(
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

    this.repaymentLoanForm.patchValue(
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
      Validators.min(allowZero ? 0 : 0.001)
    ];
    if (this.isCapitalizedIncome()) {
      validators.push(Validators.max(this.dataObject.amount));
    }
    this.repaymentLoanForm.controls.transactionAmount.setValidators(validators);
    this.repaymentLoanForm.controls.transactionAmount.updateValueAndValidity({ emitEvent: false });
  }

  /** Submits the repayment form */
  submit() {
    const repaymentLoanFormData = this.repaymentLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.repaymentLoanForm.value.transactionDate;
    if (repaymentLoanFormData.transactionDate instanceof Date) {
      repaymentLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data: any = {
      ...repaymentLoanFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    if (repaymentLoanFormData.skipInterestRefund) {
      data.interestRefundCalculation = false;
    }
    delete data.skipInterestRefund;

    // Waive penalties first if selected, then submit repayment
    if (this.waivePenalties && this.selectedPenalties.length > 0) {
      this.penaltyManagementService.waivePenalties(this.loanId, this.selectedPenalties).subscribe({
        next: () => {
          this.submitRepayment(data);
        },
        error: (error: any) => {
          console.error('Error waiving penalties:', error);
          // Continue with repayment even if waive fails
          this.submitRepayment(data);
        }
      });
    } else {
      this.submitRepayment(data);
    }
  }

  /** Submit the repayment after penalties are waived */
  private submitRepayment(data: any) {
    this.loanService.submitLoanActionButton(this.loanId, data, this.command).subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}
