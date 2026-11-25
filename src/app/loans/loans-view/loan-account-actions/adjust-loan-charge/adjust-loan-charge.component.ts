/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { OrganizationService } from 'app/organization/organization.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';

@Component({
  selector: 'mifosx-adjust-loan-charge',
  templateUrl: './adjust-loan-charge.component.html',
  styleUrls: ['./adjust-loan-charge.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSlideToggle,
    CdkTextareaAutosize,
    InputAmountComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustLoanChargeComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private cdr = inject(ChangeDetectorRef);

  /** Loan Id */
  loanId: string;
  chargeId: string;

  /** Payment Type Options */
  paymentTypes: any = [];
  chargeData: any = [];
  loanDetailsData: any = [];

  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Repayment Loan Form */
  adjustLoanChargeForm: UntypedFormGroup;
  /** Whether the adjustment request is in flight. */
  isSubmitting = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    super();
    this.chargeId = this.route.snapshot.params['id'];
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loansAccountCharge: any; loanDetailsData: any }) => {
        this.chargeData = data.loansAccountCharge;
        this.loanDetailsData = data.loanDetailsData;
      });
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createAdjustLoanChargeForm();
    this.setRepaymentLoanDetails();
  }

  /**
   * Creates the create close form.
   */
  createAdjustLoanChargeForm() {
    this.adjustLoanChargeForm = this.formBuilder.group({
      amount: [
        this.chargeData.amount,
        Validators.required
      ],
      externalId: '',
      paymentTypeId: '',
      note: ''
    });
  }

  setRepaymentLoanDetails() {
    this.organizationService.getPaymentTypes().subscribe((paymentTypes: any) => {
      this.paymentTypes = paymentTypes;
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.adjustLoanChargeForm.addControl('accountNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('checkNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('routingCode', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.adjustLoanChargeForm.removeControl('accountNumber');
      this.adjustLoanChargeForm.removeControl('checkNumber');
      this.adjustLoanChargeForm.removeControl('routingCode');
      this.adjustLoanChargeForm.removeControl('receiptNumber');
      this.adjustLoanChargeForm.removeControl('bankNumber');
    }
  }

  /** Submits the repayment form */
  submit() {
    if (this.adjustLoanChargeForm.invalid || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.cdr.markForCheck();

    const adjustLoanChargeFormData = this.adjustLoanChargeForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...adjustLoanChargeFormData,
      locale
    };
    const command = 'adjustment';
    this.loanService
      .executeLoansAccountChargesCommand(
        this.loanProductService.loanAccountPath,
        this.loanId,
        command,
        data,
        this.chargeId
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.gotoLoanChargesView();
        },
        error: () => {
          // ErrorHandlerInterceptor already alerts the user about the failed request. Handle the
          // rejection here so it does not become an unhandled RxJS error; finalize resets the
          // submitting state so the user can retry.
        }
      });
  }

  gotoLoanChargesView(): void {
    this.gotoLoanView('charges');
  }
}
