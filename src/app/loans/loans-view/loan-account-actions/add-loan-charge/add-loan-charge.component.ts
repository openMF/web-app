/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { isDownPaymentCharge } from 'app/products/charges/models/charge.model';

/**
 * Create Add Loan Charge component.
 */
@Component({
  selector: 'mifosx-add-loan-charge',
  templateUrl: './add-loan-charge.component.html',
  styleUrls: ['./add-loan-charge.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddLoanChargeComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dateUtils = inject(Dates);
  private cdr = inject(ChangeDetectorRef);

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Loan Charge form. */
  loanChargeForm!: FormGroup;
  isSubmitting = signal(false);
  /** loan charge options. */
  loanChargeOptions: {
    id: number;
    name: string;
    amount: number;
    currency: {
      name: string;
    };
    chargeCalculationType: {
      value: any;
    };
    chargeTimeType: {
      id: number;
      value: any;
    };
  }[];
  /** Fineract accepts a down payment fee only on the due date of a down payment installment. */
  private downPaymentDates: Date[] = [];
  private downPaymentDates$?: Observable<Date[]>;

  /** Datepicker filter: only down payment installment dates for a down payment fee, any date otherwise. */
  readonly dueDateFilter = (date: Date | null): boolean =>
    this.downPaymentDates.length === 0 ||
    (date != null &&
      this.downPaymentDates.some((downPaymentDate) => downPaymentDate.toDateString() === date.toDateString()));

  /**
   * Retrieves the loan charge template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    super();
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { actionButtonData: any }) => {
      this.loanChargeOptions = data.actionButtonData.chargeOptions;
    });
    this.loanId = this.route.snapshot.params['loanId'];
  }

  get requiredPermission(): string {
    return this.isWorkingCapital ? 'CREATE_WORKINGCAPITALLOANCHARGE' : 'CREATE_LOANCHARGE';
  }

  /**
   * Creates the Loan Charge form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createLoanChargeForm();
    this.loanChargeForm.controls['chargeId'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chargeId) => {
        const chargeDetails = this.loanChargeOptions.find((option) => option.id === chargeId);
        if (chargeDetails) {
          this.downPaymentDates = [];
          if (chargeDetails.chargeTimeType.id === 2 || isDownPaymentCharge(chargeDetails)) {
            this.loanChargeForm.addControl('dueDate', new FormControl('', Validators.required));
          } else {
            this.loanChargeForm.removeControl('dueDate');
          }
          // The datepicker filter keeps its reference, so Material re-runs its validator only on request.
          this.loanChargeForm.get('dueDate')?.updateValueAndValidity();
          if (isDownPaymentCharge(chargeDetails)) {
            this.applyDownPaymentDates();
          }
          this.loanChargeForm.patchValue({
            amount: chargeDetails.amount,
            chargeCalculation: chargeDetails.chargeCalculationType.value,
            chargeTime: chargeDetails.chargeTimeType.value
          });
        }
      });
  }

  /** Restricts the due date to the down payment installments and defaults it to the latest one. */
  private applyDownPaymentDates() {
    this.downPaymentDates$ ??= this.loanService.getLoanAccountAssociationDetails(this.loanId).pipe(
      map((loan: any) =>
        (loan?.repaymentSchedule?.periods ?? [])
          .filter((period: any) => period.downPaymentPeriod && period.dueDate)
          .map((period: any) => this.dateUtils.parseDate(period.dueDate))
      ),
      catchError(() => of([])),
      shareReplay(1)
    );
    this.downPaymentDates$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((dates) => {
      const dueDate = this.loanChargeForm.get('dueDate');
      if (!dueDate || !isDownPaymentCharge(this.selectedCharge)) {
        return;
      }
      this.downPaymentDates = dates;
      // A date kept from a previously selected charge may not be a down payment installment date.
      if (dates.length > 0 && !(dueDate.value instanceof Date && this.dueDateFilter(dueDate.value))) {
        dueDate.setValue(dates[dates.length - 1]);
      } else {
        dueDate.updateValueAndValidity();
      }
      this.cdr.markForCheck();
    });
  }

  private get selectedCharge() {
    return this.loanChargeOptions.find((option) => option.id === this.loanChargeForm.controls['chargeId'].value);
  }

  /**
   * Creates the Loan Charge form.
   */
  createLoanChargeForm() {
    this.loanChargeForm = this.formBuilder.group({
      chargeId: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ],
      chargeCalculation: [{ value: '', disabled: true }],
      chargeTime: [{ value: '', disabled: true }]
    });
  }

  submit() {
    if (this.isSubmitting() || !this.loanChargeForm?.valid) return;
    this.isSubmitting.set(true);
    const loanChargeFormData = this.loanChargeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDueDate: Date = loanChargeFormData.dueDate;
    if (loanChargeFormData.dueDate instanceof Date) {
      loanChargeFormData.dueDate = this.dateUtils.formatDate(prevDueDate, dateFormat);
    }
    const data = {
      ...loanChargeFormData,
      dateFormat,
      locale
    };
    this.loanService.createLoanCharge(this.loanProductService.loanAccountPath, this.loanId, data).subscribe({
      next: () => this.gotoLoanView('charges'),
      error: () => this.isSubmitting.set(false)
    });
  }
}
