/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Disburse Loan Option
 */
@Component({
  selector: 'mifosx-disburse',
  templateUrl: './disburse.component.html',
  styleUrls: ['./disburse.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle,
    CdkTextareaAutosize,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisburseComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);

  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Prevents multiple form submissions */
  isSubmitting = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan Form */
  disbursementLoanForm!: UntypedFormGroup;
  currency!: Currency;
  readonly maxExternalIdLength = 100;

  constructor() {
    super();
  }

  /**
   * Creates the disbursement loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createDisbursementLoanForm();
    this.setDisbursementLoanDetails();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  /**
   * Creates the disbursement loan form.
   */
  createDisbursementLoanForm() {
    this.disbursementLoanForm = this.formBuilder.group({
      actualDisbursementDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transactionAmount: [
        '',
        Validators.required
      ],
      externalId: '',
      paymentTypeId: '',
      note: ''
    });
    if (this.isWorkingCapital) {
      this.disbursementLoanForm.addControl(
        'discountAmount',
        new UntypedFormControl({
          value: this.dataObject.discountAmount,
          disabled: this.dataObject.overrideDiscountDisabled
        })
      );
      this.disbursementLoanForm.addControl(
        'discountExternalId',
        new UntypedFormControl('', Validators.maxLength(this.maxExternalIdLength))
      );
      this.disbursementLoanForm.setValidators((group) => {
        const a = group.get('externalId')?.value;
        const b = group.get('discountExternalId')?.value;
        return a && b && a === b ? { discountExternalIdEqualsExternalId: true } : null;
      });
      this.disbursementLoanForm
        .get('discountAmount')!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          if (value == null || value === '' || Number(value) <= 0) {
            this.disbursementLoanForm.get('discountExternalId')!.setValue('');
          }
        });
    }
  }

  setDisbursementLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.disbursementLoanForm.patchValue({
      transactionAmount: this.dataObject.amount || this.dataObject.expectedAmount
      // actualDisbursementDate: new Date(this.dataObject.date)
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.disbursementLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.disbursementLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.disbursementLoanForm.removeControl('accountNumber');
      this.disbursementLoanForm.removeControl('checkNumber');
      this.disbursementLoanForm.removeControl('routingCode');
      this.disbursementLoanForm.removeControl('receiptNumber');
      this.disbursementLoanForm.removeControl('bankNumber');
    }
  }

  /** Submits the disbursement form */
  submit() {
    const disbursementLoanFormData = this.disbursementLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementLoanForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(
        prevActualDisbursementDate,
        dateFormat
      );
    }
    const payload = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    payload['transactionAmount'] = payload['transactionAmount'] * 1;
    if (this.isWorkingCapital) {
      const paymentDetails: Record<string, any> = {};
      if (payload['paymentTypeId']) {
        paymentDetails['paymentTypeId'] = payload['paymentTypeId'];
      }
      if (this.showPaymentDetails) {
        if (payload['accountNumber']) paymentDetails['accountNumber'] = payload['accountNumber'];
        if (payload['checkNumber']) paymentDetails['checkNumber'] = payload['checkNumber'];
        if (payload['routingCode']) paymentDetails['routingCode'] = payload['routingCode'];
        if (payload['receiptNumber']) paymentDetails['receiptNumber'] = payload['receiptNumber'];
        if (payload['bankNumber']) paymentDetails['bankNumber'] = payload['bankNumber'];
      }
      if (Object.keys(paymentDetails).length > 0) {
        payload['paymentDetails'] = paymentDetails;
      }
      delete payload['paymentTypeId'];
      delete payload['accountNumber'];
      delete payload['checkNumber'];
      delete payload['routingCode'];
      delete payload['receiptNumber'];
      delete payload['bankNumber'];
    }

    const loanCommand: string = 'disburse';
    const request$ = this.isLoanProduct
      ? this.loanService.loanActionButtons(this.loanId, loanCommand, payload)
      : this.isWorkingCapital
        ? this.loanService.applyWorkingCapitalLoanAccountCommand(this.loanId, loanCommand, payload)
        : undefined;

    if (!request$) {
      this.disbursementLoanForm.setErrors({ unsupportedProductType: true });
      return;
    }

    this.isSubmitting = true;
    request$.subscribe({
      next: () => this.gotoLoanDefaultView(),
      error: () => {
        this.disbursementLoanForm.setErrors({ submitFailed: true });
        this.isSubmitting = false;
      }
    });
  }
}
