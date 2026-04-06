/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { AlertService } from 'app/core/alert/alert.service';
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { PositiveNumberDirective } from 'app/directives/positive-number.directive';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { WorkingCapitalLoanDiscountUpdateRequest } from 'app/loans/loans.service';

/**
 * Update discount action for Working Capital Loan.
 */
@Component({
  selector: 'mifosx-update-discount',
  standalone: true,
  templateUrl: './update-discount.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    PositiveNumberDirective
  ]
})
export class UpdateDiscountComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  readonly maxNoteLength = 500;

  updateDiscountForm: UntypedFormGroup;
  isSubmitting = false;
  submitErrorMessage = '';
  discountValue = 0;

  ngOnInit(): void {
    this.discountValue = this.dataObject?.discount ?? this.dataObject?.discountAmount ?? 0;
    this.updateDiscountForm = this.formBuilder.group({
      discountAmount: [
        this.discountValue,
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
    if (!this.updateDiscountForm.valid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitErrorMessage = '';

    const formValue = this.updateDiscountForm.value;
    const payload: WorkingCapitalLoanDiscountUpdateRequest = {
      discountAmount: Number(formValue.discountAmount),
      note: formValue.note,
      locale: this.settingsService.language.code,
      dateFormat: this.settingsService.dateFormat
    };

    this.loanService.updateWorkingCapitalLoanDiscount(this.loanId, payload).subscribe({
      next: () => {
        this.alertService.alert({
          type: 'Success',
          message: this.translateService.instant('labels.messages.workingCapitalDiscountUpdated')
        });
        this.isSubmitting = false;
        this.gotoLoanDefaultView();
      },
      error: (error: HttpErrorResponse) => {
        this.submitErrorMessage = this.mapDiscountError(error);
        this.isSubmitting = false;
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
