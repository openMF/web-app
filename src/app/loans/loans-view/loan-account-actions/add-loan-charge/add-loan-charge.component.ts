/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

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
          if (chargeDetails.chargeTimeType.id === 2) {
            this.loanChargeForm.addControl('dueDate', new FormControl('', Validators.required));
          } else {
            this.loanChargeForm.removeControl('dueDate');
          }
          this.loanChargeForm.patchValue({
            amount: chargeDetails.amount,
            chargeCalculation: chargeDetails.chargeCalculationType.value,
            chargeTime: chargeDetails.chargeTimeType.value
          });
        }
      });
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
