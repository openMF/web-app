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
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { CodeValue, Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../../loan-account-actions/loan-account-actions-base.component';
import { canAdjustWorkingCapitalDiscountFee } from '../../loan-transaction-adjust.helper';

/** Shape of the discount fee adjustment form. */
interface DiscountFeeAdjustmentForm {
  transactionDate: FormControl<Date | null>;
  transactionAmount: FormControl<number | null>;
  classificationId: FormControl<number | null>;
  externalId: FormControl<string | null>;
  note: FormControl<string | null>;
  paymentTypeId: FormControl<number | null>;
  accountNumber: FormControl<string | null>;
  checkNumber: FormControl<string | null>;
  routingCode: FormControl<string | null>;
  receiptNumber: FormControl<string | null>;
  bankNumber: FormControl<string | null>;
}

/**
 * Smallest amount the command accepts. The backend validates the amount as a
 * positive one, and the bound matches the six decimals the shared amount
 * validator allows.
 */
const MIN_ADJUSTMENT_AMOUNT = 0.000001;

/** Longest note the backend stores. */
const MAX_NOTE_LENGTH = 500;

/** Longest external id the backend accepts. */
const MAX_EXTERNAL_ID_LENGTH = 100;

/** Longest value each payment detail string field accepts. */
const MAX_PAYMENT_DETAIL_LENGTH = 50;

/** Payment detail controls, shown and cleared as a single block. */
const PAYMENT_DETAIL_CONTROLS = [
  'accountNumber',
  'checkNumber',
  'routingCode',
  'receiptNumber',
  'bankNumber'
] as const;

/**
 * Working Capital Discount Fee Adjustment component.
 *
 * Posts `POST /working-capital-loans/{loanId}/transactions/{transactionId}?command=discountFeeAdjustment`,
 * which books a new DISCOUNT_FEE_ADJUSTMENT transaction drawing the remaining
 * discount pool down by the submitted amount. Nothing is reversed, so unlike
 * the adjust form this one neither carries a reversal external id nor leaves
 * the original transaction behind as reversed: the discount fee stays active
 * and can be drawn down again while the pool lasts.
 *
 * The transaction being adjusted is named in the URL, so `relatedResourceId`
 * is deliberately absent from the payload - the backend rejects the body that
 * carries both.
 */
@Component({
  selector: 'mifosx-discount-fee-adjustment',
  templateUrl: './discount-fee-adjustment.component.html',
  styleUrls: ['./discount-fee-adjustment.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscountFeeAdjustmentComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  /** Discount fee adjustment form. */
  discountFeeAdjustmentForm: FormGroup<DiscountFeeAdjustmentForm>;
  /** The discount fee transaction being drawn down. */
  discountFeeTransaction: any;
  /** Currency of the loan, used to format the amount input. */
  currency: Currency | null = null;
  /** Classification options served by the discount fee adjustment template. */
  classificationOptions: CodeValue[] = [];
  /** Payment type options, taken from the repayment template. */
  paymentTypeOptions: { id: number; name: string }[] = [];
  /** What is left of the discount pool, which the adjustment may not exceed. */
  remainingDiscount = 0;
  /** Smallest amount accepted by the form. */
  readonly minAmount = MIN_ADJUSTMENT_AMOUNT;
  /** Earliest date accepted: the adjustment may not predate the discount fee. */
  minDate = new Date(2000, 0, 1);
  /** Latest date accepted: the adjustment may not be in the future. */
  maxDate = new Date();
  readonly maxNoteLength = MAX_NOTE_LENGTH;
  readonly maxExternalIdLength = MAX_EXTERNAL_ID_LENGTH;
  /** Flag to enable payment details fields. */
  showPaymentDetails = false;
  /** Message of the last rejected submission, shown above the actions. */
  submitErrorMessage = '';
  isSubmitting = false;

  /** Status of the loan the transaction belongs to, read from the parent route. */
  private loanStatus: { active?: boolean } | null = null;
  /** Id of the discount fee transaction, which names the command's target. */
  private transactionId: string;

  constructor() {
    super();
    this.route.parent?.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanDetailsAssociationData?: any }) => {
        this.loanStatus = data.loanDetailsAssociationData?.status ?? null;
        // The live discount pool, which the backend decrements on every
        // adjustment and restores when one is undone, so it already accounts
        // for the adjustments booked before this one.
        this.remainingDiscount = Number(data.loanDetailsAssociationData?.discountFee ?? 0);
      });
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { discountFeeAdjustmentTemplate: any }) => {
        const template = data.discountFeeAdjustmentTemplate;
        this.discountFeeTransaction = template?.transaction;
        this.currency = template?.currency ?? null;
        this.classificationOptions = template?.classificationOptions ?? [];
        this.paymentTypeOptions = template?.paymentTypeOptions ?? [];
      });
    this.transactionId = this.route.snapshot.params['id'] ?? this.route.parent?.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
    // A discount fee that is already exhausted, reversed or sits on a loan that
    // is no longer open is rejected by the backend, so the form is never
    // reachable for it even when the route is opened directly.
    if (!this.isAdjustable()) {
      this.gotoLoanView('transactions');
      return;
    }
    const discountFeeDate = this.dateUtils.parseDate(this.discountFeeTransaction.transactionDate);
    this.minDate = discountFeeDate;
    this.createDiscountFeeAdjustmentForm();
    // The adjustment defaults to the discount fee's own date, which is what the
    // backend falls back to when the date is left out of the payload.
    this.discountFeeAdjustmentForm.patchValue({ transactionDate: discountFeeDate });
  }

  /** True when the loaded transaction accepts the discount fee adjustment command. */
  private isAdjustable(): boolean {
    const transaction = this.discountFeeTransaction;
    return (
      !!transaction?.type &&
      canAdjustWorkingCapitalDiscountFee(
        transaction.type,
        transaction.manuallyReversed || transaction.reversed,
        this.loanStatus
      ) &&
      this.remainingDiscount > 0
    );
  }

  /** Builds the form, bounding the amount by what is left of the discount pool. */
  private createDiscountFeeAdjustmentForm(): void {
    this.discountFeeAdjustmentForm = this.formBuilder.group<DiscountFeeAdjustmentForm>({
      transactionDate: new FormControl<Date | null>(null, Validators.required),
      transactionAmount: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(MIN_ADJUSTMENT_AMOUNT),
        Validators.max(this.remainingDiscount)
      ]),
      classificationId: new FormControl<number | null>(null),
      externalId: new FormControl<string | null>(null, Validators.maxLength(MAX_EXTERNAL_ID_LENGTH)),
      note: new FormControl<string | null>(null, Validators.maxLength(MAX_NOTE_LENGTH)),
      paymentTypeId: new FormControl<number | null>(null),
      accountNumber: new FormControl<string | null>(null, Validators.maxLength(MAX_PAYMENT_DETAIL_LENGTH)),
      checkNumber: new FormControl<string | null>(null, Validators.maxLength(MAX_PAYMENT_DETAIL_LENGTH)),
      routingCode: new FormControl<string | null>(null, Validators.maxLength(MAX_PAYMENT_DETAIL_LENGTH)),
      receiptNumber: new FormControl<string | null>(null, Validators.maxLength(MAX_PAYMENT_DETAIL_LENGTH)),
      bankNumber: new FormControl<string | null>(null, Validators.maxLength(MAX_PAYMENT_DETAIL_LENGTH))
    });
  }

  /**
   * Shows or hides the payment detail fields. Collapsing the section clears
   * them so a value typed and then hidden never reaches the payload.
   */
  addPaymentDetails(): void {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (!this.showPaymentDetails) {
      PAYMENT_DETAIL_CONTROLS.forEach((controlName) =>
        this.discountFeeAdjustmentForm.controls[controlName].reset(null)
      );
    }
  }

  /** Assembles the payload and posts the discount fee adjustment. */
  submit(): void {
    if (!this.discountFeeAdjustmentForm.valid || this.isSubmitting) {
      return;
    }
    this.submitErrorMessage = '';
    this.isSubmitting = true;

    const formValue = this.discountFeeAdjustmentForm.getRawValue();
    const dateFormat = this.settingsService.dateFormat;
    const payload: { [key: string]: any } = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      transactionAmount: Number(formValue.transactionAmount),
      dateFormat,
      locale: this.settingsService.language.code
    };
    // The backend parses every parameter present in the body against a strict
    // whitelist, so an empty optional is dropped rather than sent blank.
    Object.assign(
      payload,
      this.filledIn({
        classificationId: formValue.classificationId,
        externalId: formValue.externalId,
        note: formValue.note
      })
    );
    const paymentDetails = this.filledIn({
      paymentTypeId: formValue.paymentTypeId,
      accountNumber: formValue.accountNumber,
      checkNumber: formValue.checkNumber,
      routingCode: formValue.routingCode,
      receiptNumber: formValue.receiptNumber,
      bankNumber: formValue.bankNumber
    });
    if (Object.keys(paymentDetails).length > 0) {
      payload.paymentDetails = paymentDetails;
    }

    this.loanService
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'discountFeeAdjustment', this.transactionId)
      .subscribe({
        // The transactions tab, not the transaction detail: it sits under the
        // loan route, which is re-activated and therefore refetches the
        // account, the schedule and the balances the adjustment rewrote, and
        // it is where the new adjustment row is visible next to its discount
        // fee.
        next: () => this.gotoLoanView('transactions'),
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.submitErrorMessage = this.mapAdjustmentError(error);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Keeps the fields that carry a value, trimmed.
   * @param fields Optional fields as read from the form
   */
  private filledIn(fields: { [key: string]: string | number | null }): { [key: string]: string | number } {
    const filledIn: { [key: string]: string | number } = {};
    Object.entries(fields).forEach(
      ([
        controlName,
        value
      ]) => {
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        if (trimmedValue !== null && trimmedValue !== undefined && trimmedValue !== '') {
          filledIn[controlName] = trimmedValue;
        }
      }
    );
    return filledIn;
  }

  /** Surfaces the backend's own message, which names the rule that rejected the amount or the date. */
  private mapAdjustmentError(error: HttpErrorResponse): string {
    const backendError = error?.error?.errors?.[0];
    return (
      backendError?.defaultUserMessage ||
      error?.error?.defaultUserMessage ||
      this.translateService.instant('labels.messages.unableToAdjustDiscountFee')
    );
  }
}
