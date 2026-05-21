/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { AlertService } from 'app/core/alert/alert.service';
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { WorkingCapitalLoanDiscountUpdateRequest } from 'app/loans/loans.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';

/**
 * Update discount action for Working Capital Loan.
 */
@Component({
  selector: 'mifosx-update-discount',
  standalone: true,
  templateUrl: './update-discount.component.html',
  styleUrls: ['./update-discount.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    InputAmountComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateDiscountComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  readonly maxNoteLength = 500;

  currency: Currency | null = null;
  disbursementTransactionId: number = 0;

  constructor() {
    super();
  }

  updateDiscountForm: UntypedFormGroup | null = null;
  submitErrorMessage = '';

  ngOnInit(): void {
    this.currency = this.dataObject?.currency;
    if (this.dataObject?.transactions && this.dataObject?.transactions.length > 0) {
      this.disbursementTransactionId = this.dataObject?.transactions?.[0].id;
    }
    this.updateDiscountForm = this.formBuilder.group({
      transactionAmount: [
        this.dataObject?.discount ?? this.dataObject?.discountAmount ?? '',
        [
          Validators.required,
          Validators.min(0),
          amountValueValidator()
        ]
      ],
      note: [
        '',
        Validators.maxLength(this.maxNoteLength)
      ]
    });
  }

  submit(): void {
    if (this.updateDiscountForm == null || !this.updateDiscountForm.valid) {
      return;
    }

    this.submitErrorMessage = '';

    const formValue = this.updateDiscountForm.value;
    const payload: WorkingCapitalLoanDiscountUpdateRequest = {
      transactionAmount: Number(formValue.transactionAmount),
      relatedResourceId: this.disbursementTransactionId,
      note: formValue.note,
      locale: this.settingsService.language.code,
      dateFormat: this.settingsService.dateFormat
    };

    this.loanService.applyWorkingCapitalLoanAccountCommand(this.loanId, 'discountfee', payload).subscribe({
      next: () => {
        this.alertService.alert({
          type: 'Success',
          message: this.translateService.instant('labels.messages.workingCapitalDiscountUpdated')
        });
        this.gotoLoanDefaultView();
      },
      error: (error: HttpErrorResponse) => {
        this.submitErrorMessage = this.mapDiscountError(error);
      }
    });
  }

  private mapDiscountError(error: HttpErrorResponse): string {
    const backendError = error?.error?.errors?.[0];
    return (
      backendError?.defaultUserMessage ||
      error?.error?.defaultUserMessage ||
      this.translateService.instant('labels.messages.unableToUpdateDiscount')
    );
  }
}
