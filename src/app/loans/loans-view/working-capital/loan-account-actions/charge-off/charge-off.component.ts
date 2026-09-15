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
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
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
  /** Whether a re-quote is in flight after a date change. */
  isQuoteLoading = false;
  /**
   * Whether the last re-quote failed, leaving an amount on screen that was quoted for a different date. Blocks submit
   * until a re-quote succeeds; picking the date again retries.
   */
  isQuoteStale = false;
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
    this.chargeOffAmount = template.expectedAmount ?? 0;
    this.currency = template.currency;
    this.chargeOffReasonOptions = template.chargeOffReasonOptions ?? [];
    this.createChargeOffForm(template);
    this.watchQuoteDate();
  }

  /**
   * Re-quotes the outstanding balance whenever the user picks a different charge-off date, since the amount charged
   * off is the balance as of that date. switchMap so a slow earlier response cannot overwrite the current one; a
   * failed re-quote leaves the amount on screen untouched but marks it stale, since it belongs to the previous date.
   * The distinct check lets the same date through again while stale, so re-picking it retries.
   */
  private watchQuoteDate(): void {
    this.chargeOffForm.controls.transactionDate.valueChanges
      .pipe(
        filter((date): date is Date => !!date),
        map((date) => this.dateUtils.formatDate(date, this.settingsService.dateFormat)),
        distinctUntilChanged((previous, current) => previous === current && !this.isQuoteStale),
        tap(() => {
          this.isQuoteLoading = true;
          this.cdr.markForCheck();
        }),
        switchMap((quoteDate) =>
          this.loanService
            .getWorkingCapitalLoanTransactionTemplate(this.loanId, 'chargeOff', quoteDate)
            .pipe(catchError(() => of(null)))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((template: WorkingCapitalChargeOffTemplate | null) => {
        this.isQuoteLoading = false;
        this.isQuoteStale = !template;
        if (template) {
          this.chargeOffAmount = template.expectedAmount ?? 0;
        }
        this.cdr.markForCheck();
      });
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
    if (this.chargeOffForm.invalid || this.isSubmitting || this.isQuoteLoading || this.isQuoteStale) {
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
