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
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

/** Custom Services / Utils */
import { Dates } from 'app/core/utils/dates';
import { AlertService } from 'app/core/alert/alert.service';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';
import { resolveRecoveryPaymentErrorMessage } from 'app/loans/loans-view/working-capital/recovery-payment-error.helper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Models */
import { Currency, PaymentType } from 'app/shared/models/general.model';
import {
  WorkingCapitalPaymentDetails,
  WorkingCapitalRecoveryPaymentRequest
} from 'app/loans/models/working-capital/working-capital-loan-account.model';

/**
 * Working Capital Loan Recovery Payment action.
 *
 * Registers money collected on an already written-off loan. The loan stays in
 * CLOSED_WRITTEN_OFF and its outstanding balance stays at zero: the amount is
 * recognised as recovery income, so the only figure that moves is the recovered
 * total. Posts to
 * POST /working-capital-loans/{loanId}/transactions?command=recoveryPayment.
 *
 * The form deliberately has no classification control. A recovery has no
 * allocation, and sending classificationId makes the backend reject the call.
 */
@Component({
  selector: 'mifosx-working-capital-recovery-payment',
  templateUrl: './recovery-payment.component.html',
  styleUrl: './recovery-payment.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    MatSlideToggle,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalRecoveryPaymentComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private errorHandler = inject(ErrorHandlerService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed (business date; a recovery cannot be in the future). */
  maxDate = new Date();
  /** Whether a submit request is in flight. */
  isSubmitting = false;
  /** Whether the optional payment detail fields are visible. */
  showPaymentDetails = false;
  /** Payment type dropdown options. */
  paymentTypes: PaymentType[] = [];
  /** Loan currency, used to label the amount field. */
  currency: Currency | null = null;
  /**
   * Remaining recoverable amount, taken from the template's expectedAmount.
   * It is the client-side ceiling for the entered amount.
   */
  maxRecoverableAmount: number | null = null;

  /** Typed Recovery Payment form. */
  recoveryPaymentForm = this.formBuilder.group({
    transactionDate: this.formBuilder.control<Date | null>(null, Validators.required),
    transactionAmount: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.001)
    ]),
    paymentTypeId: this.formBuilder.control<number | null>(null),
    accountNumber: this.formBuilder.control<string>(''),
    checkNumber: this.formBuilder.control<string>(''),
    routingCode: this.formBuilder.control<string>(''),
    receiptNumber: this.formBuilder.control<string>(''),
    bankNumber: this.formBuilder.control<string>(''),
    note: this.formBuilder.control<string>('', Validators.maxLength(1000)),
    externalId: this.formBuilder.control<string>('')
  });

  /**
   * Permission gating the submit button. Held in the component so the template
   * never carries the raw permission string.
   */
  readonly requiredPermission = 'RECOVERYPAYMENT_WORKINGCAPITALLOAN';

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
    this.paymentTypes = this.dataObject?.paymentTypeOptions ?? [];
    this.currency = this.dataObject?.currency ?? null;

    // expectedAmount is the remainder still recoverable, so it doubles as the
    // prefilled amount and as the maximum the server will accept.
    const expectedAmount = Number(this.dataObject?.expectedAmount);
    if (Number.isFinite(expectedAmount) && expectedAmount > 0) {
      this.maxRecoverableAmount = expectedAmount;
      this.recoveryPaymentForm.controls.transactionAmount.addValidators(Validators.max(expectedAmount));
      this.recoveryPaymentForm.controls.transactionAmount.setValue(expectedAmount);
    }
    this.recoveryPaymentForm.controls.transactionDate.setValue(this.settingsService.businessDate);
    this.cdr.markForCheck();
  }

  /** Toggles the optional payment detail fields. */
  togglePaymentDetails(): void {
    this.showPaymentDetails = !this.showPaymentDetails;
  }

  /** Submits the recovery payment form. */
  submit(): void {
    if (this.recoveryPaymentForm.invalid || this.isSubmitting) {
      this.recoveryPaymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const formValue = this.recoveryPaymentForm.getRawValue();

    const payload: WorkingCapitalRecoveryPaymentRequest = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      transactionAmount: Number(formValue.transactionAmount),
      locale,
      dateFormat
    };
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
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'recoveryPayment')
      .pipe(
        catchError((error) => this.handleSubmitError(error)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.gotoLoanDefaultView();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Builds the nested paymentDetails block, omitting it entirely when the user
   * filled nothing in.
   */
  private buildPaymentDetails(): WorkingCapitalPaymentDetails | null {
    const formValue = this.recoveryPaymentForm.getRawValue();
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

  /**
   * Reports the failure with the backend's own rule when it is a known
   * validation, falling back to the generic handler otherwise.
   *
   * The date floor is validated server-side on purpose: today it is the last
   * transaction date and the rule is expected to be relaxed, so replicating it
   * here would only make the UI wrong twice.
   */
  private handleSubmitError(error: unknown) {
    const alert = resolveRecoveryPaymentErrorMessage(error, this.translateService);
    if (alert) {
      this.alertService.alert(alert);
      return throwError(() => error);
    }
    return this.errorHandler.handleError(error as any, 'Loan Recovery Payment');
  }
}
