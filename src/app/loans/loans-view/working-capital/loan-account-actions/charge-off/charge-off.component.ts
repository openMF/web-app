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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

/** Custom Services / Utils */
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';

/** Custom Models */
import { Currency } from 'app/shared/models/general.model';
import {
  WorkingCapitalChargeOffReasonOption,
  WorkingCapitalChargeOffRequest,
  WorkingCapitalChargeOffTemplate
} from 'app/loans/models/working-capital/working-capital-loan-account.model';

/** Typed controls of the Working Capital charge-off reactive form. */
interface ChargeOffFormControls {
  transactionDate: FormControl<Date | null>;
  chargeOffReasonId: FormControl<number | null>;
  externalId: FormControl<string | null>;
  note: FormControl<string | null>;
}

/**
 * Working Capital Loan charge-off action.
 *
 * Mirrors the regular loan charge-off form but targets the
 * /working-capital-loans resource (command=chargeOff) and exposes the
 * read-only outstanding amount prefilled from the template.
 */
@Component({
  selector: 'mifosx-wc-charge-off',
  templateUrl: './charge-off.component.html',
  styleUrls: ['./charge-off.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalChargeOffComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Minimum selectable charge-off date. */
  minDate = new Date(2000, 0, 1);
  /** Maximum selectable charge-off date (future dates are not allowed). */
  maxDate = new Date();
  /** Outstanding balance to be charged off (read-only, from template). */
  chargeOffAmount = 0;
  /** Currency used to render the read-only charge-off amount. */
  currency: Currency;
  /** Options for the charge-off reason dropdown. */
  chargeOffReasonOptions: WorkingCapitalChargeOffReasonOption[] = [];
  /** Guards against duplicate submissions. */
  isSubmitting = false;
  /** Permission required to charge off a Working Capital loan. */
  readonly chargeOffPermission = 'CHARGEOFF_WORKINGCAPITALLOAN';

  /** Typed charge-off form. */
  chargeOffForm: FormGroup<ChargeOffFormControls>;

  constructor() {
    super();
  }

  ngOnInit(): void {
    const template = (this.dataObject || {}) as WorkingCapitalChargeOffTemplate;
    this.maxDate = this.settingsService.businessDate;
    this.chargeOffAmount = template.chargeOffAmount ?? 0;
    this.currency = template.currency;
    this.chargeOffReasonOptions = template.chargeOffReasonOptions ?? [];
    this.createChargeOffForm(template);
  }

  /** Builds the typed form pre-filled from the template values. */
  private createChargeOffForm(template: WorkingCapitalChargeOffTemplate): void {
    // The backend default charge-off date equals the current business date.
    const defaultDate = template.chargeOffDate
      ? this.dateUtils.parseDate(template.chargeOffDate)
      : this.settingsService.businessDate;
    this.chargeOffForm = this.formBuilder.group<ChargeOffFormControls>({
      transactionDate: new FormControl(defaultDate, { validators: Validators.required }),
      chargeOffReasonId: new FormControl(null),
      externalId: new FormControl(null),
      note: new FormControl(null)
    });
  }

  submit(): void {
    if (this.chargeOffForm.invalid || this.isSubmitting) {
      this.chargeOffForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const formValue = this.chargeOffForm.getRawValue();
    // Only send the parameters supported by the backend; it rejects unsupported ones.
    const payload: WorkingCapitalChargeOffRequest = {
      transactionDate: this.dateUtils.formatDate(formValue.transactionDate, dateFormat),
      locale,
      dateFormat
    };
    if (formValue.chargeOffReasonId != null) {
      payload.chargeOffReasonId = formValue.chargeOffReasonId;
    }
    if (formValue.externalId) {
      payload.externalId = formValue.externalId;
    }
    if (formValue.note) {
      payload.note = formValue.note;
    }
    this.loanService
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'chargeOff')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.gotoLoanDefaultView(),
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }
}
