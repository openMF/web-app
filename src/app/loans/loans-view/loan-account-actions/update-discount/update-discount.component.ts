/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { AlertService } from 'app/core/alert/alert.service';
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';
import { WorkingCapitalLoanDiscountUpdateRequest } from 'app/loans/models/working-capital/working-capital-loan-account.model';

/**
 * Discount Fee action for Working Capital Loan.
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
  private formBuilder = inject(FormBuilder);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  readonly maxNoteLength = 500;
  readonly maxExternalIdLength = 100;

  currency: Currency | null = null;
  disbursementTransactionId: number = 0;

  constructor() {
    super();
  }

  updateDiscountForm!: FormGroup;
  submitErrorMessage = '';
  isSubmitting = false;

  ngOnInit(): void {
    if (this.dataObject?.content && this.dataObject?.content.length > 0) {
      const disburseTransaction = this.dataObject?.content[0];
      this.currency = disburseTransaction.currency;
      this.disbursementTransactionId = disburseTransaction.id;
    }
    this.updateDiscountForm = this.formBuilder.group({
      transactionAmount: [
        this.dataObject?.discount ?? this.dataObject?.transactionAmount ?? '',
        [
          Validators.required,
          Validators.min(0),
          amountValueValidator()
        ]
      ],
      externalId: [
        '',
        Validators.maxLength(this.maxExternalIdLength)
      ],
      note: [
        '',
        Validators.maxLength(this.maxNoteLength)
      ]
    });
  }

  submit(): void {
    if (this.updateDiscountForm == null || !this.updateDiscountForm.valid || this.isSubmitting) {
      return;
    }

    this.submitErrorMessage = '';
    this.isSubmitting = true;

    const formValue = this.updateDiscountForm.value;
    const payload: WorkingCapitalLoanDiscountUpdateRequest = {
      transactionAmount: Number(formValue.transactionAmount),
      relatedResourceId: this.disbursementTransactionId,
      externalId: formValue.externalId || undefined,
      note: formValue.note || undefined,
      locale: this.settingsService.language.code,
      dateFormat: this.settingsService.dateFormat
    };

    this.loanService.applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'discountFee').subscribe({
      next: () => {
        this.alertService.alert({
          type: 'Success',
          message: this.translateService.instant('labels.messages.workingCapitalDiscountUpdated')
        });
        this.gotoLoanDefaultView();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
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
