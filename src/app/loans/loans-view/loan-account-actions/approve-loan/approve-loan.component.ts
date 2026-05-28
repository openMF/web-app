/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Approve Loan component.
 */
@Component({
  selector: 'mifosx-approve-loan',
  templateUrl: './approve-loan.component.html',
  styleUrls: ['./approve-loan.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveLoanComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  /** Approve Loan form. */
  approveLoanForm: UntypedFormGroup;
  /** Loan data. */
  loanData: any = new Object();
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  currency: Currency;

  /**
   * @param formBuilder Form Builder.
   * @param dateUtils Date Utils.
   */
  constructor() {
    super();
    this.maxDate = this.settingsService.maxFutureDate;
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { actionButtonData: any }) => {
      this.loanData = data.actionButtonData;
      this.currency = data.actionButtonData.currency;
    });
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.setApproveLoanForm();

    // Get delinquency data for available disbursement amount with over applied
    if (this.isLoanProduct) {
      this.loanService.getLoanDelinquencyDataForTemplate(this.loanId).subscribe((delinquencyData: any) => {
        // Check if the field is at root level
        if (delinquencyData.availableDisbursementAmountWithOverApplied !== undefined) {
          this.loanData.availableDisbursementAmountWithOverApplied =
            delinquencyData.availableDisbursementAmountWithOverApplied;
        }
      });
    }
  }

  /**
   * Set Approve Loan form.
   */
  setApproveLoanForm() {
    this.approveLoanForm = this.formBuilder.group({
      approvedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      expectedDisbursementDate: [
        new Date(this.loanData.expectedDisbursementDate),
        Validators.required
      ],
      approvedLoanAmount: [
        this.loanData.approvalAmount,
        Validators.required
      ],
      note: ['']
    });
    if (this.isWorkingCapital) {
      this.approveLoanForm.addControl(
        'discountAmount',
        new UntypedFormControl({
          value: this.loanData.discountAmount,
          disabled: this.loanData.overrideDiscountDisabled
        })
      );
    }
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const approveLoanFormData = this.approveLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const approvedOnDate = this.approveLoanForm.value.approvedOnDate;
    const expectedDisbursementDate = this.approveLoanForm.value.expectedDisbursementDate;
    if (approveLoanFormData.approvedOnDate instanceof Date) {
      approveLoanFormData.approvedOnDate = this.dateUtils.formatDate(approvedOnDate, dateFormat);
    }
    if (approveLoanFormData.expectedDisbursementDate instanceof Date) {
      approveLoanFormData.expectedDisbursementDate = this.dateUtils.formatDate(expectedDisbursementDate, dateFormat);
    }
    const data = {
      ...approveLoanFormData,
      dateFormat,
      locale
    };
    const loanCommand: string = 'approve';
    const request$ = this.isLoanProduct
      ? this.loanService.loanActionButtons(this.loanId, loanCommand, data)
      : this.isWorkingCapital
        ? this.loanService.applyWorkingCapitalLoanAccountCommand(this.loanId, loanCommand, data)
        : undefined;

    if (!request$) {
      this.approveLoanForm.setErrors({ unsupportedProductType: true });
      return;
    }

    request$.subscribe({
      next: () => this.gotoLoanDefaultView(),
      error: () => this.approveLoanForm.setErrors({ submitFailed: true })
    });
  }
}
