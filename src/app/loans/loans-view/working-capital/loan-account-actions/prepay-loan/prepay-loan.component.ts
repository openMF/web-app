/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';

/** Custom Services / Utils */
import { Dates } from 'app/core/utils/dates';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Models */
import { Currency, PaymentType } from 'app/shared/models/general.model';
import {
  WorkingCapitalClassificationOption,
  WorkingCapitalPaymentDetails,
  WorkingCapitalPrepaymentRequest,
  WorkingCapitalPrepaymentTemplate
} from 'app/loans/models/working-capital/working-capital-loan-account.model';

/**
 * Working Capital Loan Prepay Loan action.
 *
 * Closes an active loan by repaying the whole outstanding balance. The payoff amount
 * comes from GET /working-capital-loans/{loanId}/transactions/template?command=prepayLoan
 * and is posted back through the ordinary repayment command
 * (POST /working-capital-loans/{loanId}/transactions?command=repayment), because a
 * prepayment is a plain repayment for the full balance - same allocation strategy,
 * same accounting treatment, and reversible the same way.
 *
 * The breakdown is display-only: the portions are derived from the loan balance, so
 * letting them be edited would only let the user contradict the server. The total
 * stays editable, matching the Prepay Loan screen for progressive loans.
 *
 * Unlike that screen, changing the transaction date does not re-fetch the quote. A
 * progressive loan accrues interest per day, so its payoff moves with the date; a
 * Working Capital loan accrues nothing over time, so the quote is identical for every
 * date and a refetch would only cost a request.
 */
@Component({
  selector: 'mifosx-working-capital-prepay-loan',
  templateUrl: './prepay-loan.component.html',
  styleUrl: './prepay-loan.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    MatSlideToggle,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalPrepayLoanComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed (business date; a prepayment cannot be in the future). */
  maxDate = new Date();
  /** Whether a submit request is in flight. */
  isSubmitting = false;
  /** Whether the optional payment detail fields are visible. */
  showPaymentDetails = false;
  /** Payment type dropdown options. */
  paymentTypes: PaymentType[] = [];
  /** Repayment classification dropdown options. */
  classificationOptions: WorkingCapitalClassificationOption[] = [];
  /** Loan currency, used to label the amount field. */
  currency: Currency | null = null;

  /** Outstanding principal portion of the payoff amount. */
  principalPortion = 0;
  /** Outstanding fee portion of the payoff amount. */
  feeChargesPortion = 0;
  /** Outstanding penalty portion of the payoff amount. */
  penaltyChargesPortion = 0;
  /** The quoted payoff total, kept so the template can show what was quoted. */
  payoffAmount = 0;

  /** Typed Prepay Loan form. */
  prepayLoanForm = this.formBuilder.group({
    transactionDate: this.formBuilder.control<Date | null>(null, Validators.required),
    transactionAmount: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.001)
    ]),
    paymentTypeId: this.formBuilder.control<number | null>(null),
    classificationId: this.formBuilder.control<number | null>(null),
    accountNumber: this.formBuilder.control<string>(''),
    checkNumber: this.formBuilder.control<string>(''),
    routingCode: this.formBuilder.control<string>(''),
    receiptNumber: this.formBuilder.control<string>(''),
    bankNumber: this.formBuilder.control<string>(''),
    note: this.formBuilder.control<string>('', Validators.maxLength(1000)),
    externalId: this.formBuilder.control<string>('')
  });

  /**
   * Permission gating the submit button. A prepayment is posted as a repayment, so
   * it is the repayment permission that applies.
   */
  readonly requiredPermission = 'REPAYMENT_WORKINGCAPITALLOAN';

  constructor() {
    super();
  }

  ngOnInit(): void {
    const template = (this.dataObject || {}) as WorkingCapitalPrepaymentTemplate;
    this.maxDate = this.settingsService.businessDate;
    this.paymentTypes = template.paymentTypeOptions ?? [];
    this.classificationOptions = template.classificationOptions ?? [];
    this.currency = template.currency ?? null;

    this.principalPortion = this.toAmount(template.principalPortion);
    this.feeChargesPortion = this.toAmount(template.feeChargesPortion);
    this.penaltyChargesPortion = this.toAmount(template.penaltyChargesPortion);
    this.payoffAmount = this.toAmount(template.transactionAmount);

    this.prepayLoanForm.controls.transactionAmount.setValue(this.payoffAmount);
    this.prepayLoanForm.controls.transactionDate.setValue(this.settingsService.businessDate);
    this.cdr.markForCheck();
  }

  /** Toggles the optional payment detail fields. */
  togglePaymentDetails(): void {
    this.showPaymentDetails = !this.showPaymentDetails;
  }

  /** Submits the prepayment as a repayment for the quoted payoff amount. */
  submit(): void {
    if (this.prepayLoanForm.invalid || this.isSubmitting) {
      this.prepayLoanForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const formValue = this.prepayLoanForm.getRawValue();

    const payload: WorkingCapitalPrepaymentRequest = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      transactionAmount: Number(formValue.transactionAmount),
      locale,
      dateFormat
    };
    if (formValue.classificationId != null) {
      payload.classificationId = formValue.classificationId;
    }
    const note = formValue.note?.trim();
    if (note) {
      payload.note = note;
    }
    const externalId = formValue.externalId?.trim();
    if (externalId) {
      payload.externalId = externalId;
    }
    const paymentDetails = this.buildPaymentDetails();
    if (paymentDetails) {
      payload.paymentDetails = paymentDetails;
    }

    this.loanService
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'repayment')
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

  /**
   * Builds the nested paymentDetails block Working Capital expects, omitting it
   * entirely when the user filled nothing in.
   */
  private buildPaymentDetails(): WorkingCapitalPaymentDetails | null {
    const formValue = this.prepayLoanForm.getRawValue();
    const paymentDetails: WorkingCapitalPaymentDetails = {};
    if (formValue.paymentTypeId != null) {
      paymentDetails.paymentTypeId = formValue.paymentTypeId;
    }
    if (this.showPaymentDetails) {
      const fields: [
        keyof WorkingCapitalPaymentDetails,
        string | null
      ][] = [
        [
          'accountNumber',
          formValue.accountNumber
        ],
        [
          'checkNumber',
          formValue.checkNumber
        ],
        [
          'routingCode',
          formValue.routingCode
        ],
        [
          'receiptNumber',
          formValue.receiptNumber
        ],
        [
          'bankNumber',
          formValue.bankNumber
        ]
      ];
      fields.forEach(
        ([
          field,
          value
        ]) => {
          const trimmed = value?.trim();
          if (trimmed) {
            (paymentDetails as Record<string, unknown>)[field] = trimmed;
          }
        }
      );
    }
    return Object.keys(paymentDetails).length > 0 ? paymentDetails : null;
  }

  /** Reads a template amount, treating anything missing or unparseable as zero. */
  private toAmount(value: unknown): number {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }
}
