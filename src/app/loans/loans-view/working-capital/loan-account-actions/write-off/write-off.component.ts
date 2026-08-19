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
import { catchError } from 'rxjs';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';
import { WorkingCapitalWriteOffRequest } from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Write-off reason option (WriteOffReasons code value). */
interface WriteOffReasonOption {
  id: number;
  name: string;
}

/**
 * Working Capital Loan Write-Off action.
 *
 * Terminal action: zeroes the outstanding balance and closes the loan with
 * status CLOSED_WRITTEN_OFF. Posts to
 * POST /working-capital-loans/{loanId}/transactions?command=writeOff.
 */
@Component({
  selector: 'mifosx-working-capital-write-off',
  templateUrl: './write-off.component.html',
  styleUrl: './write-off.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalWriteOffComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private errorHandler = inject(ErrorHandlerService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed (business date; a write-off cannot be in the future). */
  maxDate = new Date();
  /** Whether a submit request is in flight. */
  isSubmitting = false;
  /** Write-off reasons dropdown options (WriteOffReasons code values). */
  writeOffReasonOptions: WriteOffReasonOption[] = [];
  /** Current outstanding amount, shown as informative (this is what will be written off). */
  outstandingAmount: number | null = null;

  /** Typed Write-Off form. */
  writeOffForm = this.formBuilder.group({
    transactionDate: this.formBuilder.control<Date | null>(null, Validators.required),
    writeoffReasonId: this.formBuilder.control<number | null>(null),
    note: this.formBuilder.control<string>('', Validators.maxLength(1000)),
    externalId: this.formBuilder.control<string>('')
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
    this.writeOffReasonOptions = this.dataObject?.writeOffReasonOptions ?? [];
    this.outstandingAmount = this.dataObject?.amount ?? null;
    // Default the write-off date to the business date; there is no template amount for WC.
    const defaultDate = this.dataObject?.date ? new Date(this.dataObject.date) : this.settingsService.businessDate;
    this.writeOffForm.controls.transactionDate.setValue(defaultDate);
    this.cdr.markForCheck();
  }

  /** Submits the write-off form. */
  submit(): void {
    if (this.writeOffForm.invalid) {
      this.writeOffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const formValue = this.writeOffForm.getRawValue();

    // The backend calculates the outstanding balance at the given date; transactionAmount is not sent.
    const payload: WorkingCapitalWriteOffRequest = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      locale,
      dateFormat
    };
    if (formValue.writeoffReasonId != null) {
      payload.writeoffReasonId = formValue.writeoffReasonId;
    }
    const note = formValue.note?.trim();
    if (note) {
      payload.note = note;
    }
    const externalId = formValue.externalId?.trim();
    if (externalId) {
      payload.externalId = externalId;
    }

    this.loanService
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'writeOff')
      .pipe(
        catchError((error) => this.errorHandler.handleError(error, 'Loan Write-Off')),
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
}
