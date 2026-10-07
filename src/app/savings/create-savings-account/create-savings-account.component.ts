/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';

/** Custom Services */
import { SavingsService } from '../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SavingsAccountPreviewStepComponent } from '../savings-account-stepper/savings-account-preview-step/savings-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Savings Account Component
 */
@Component({
  selector: 'mifosx-create-savings-account',
  templateUrl: './create-savings-account.component.html',
  styleUrls: ['./create-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    SavingsAccountDetailsStepComponent,
    SavingsAccountTermsStepComponent,
    SavingsAccountChargesStepComponent,
    SavingsAccountPreviewStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSavingsAccountComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private savingsService = inject(SavingsService);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** True while the create request is in flight. */
  isSubmitting = false;
  /** Idempotency key reused if the same submission is retried. */
  submitIdempotencyKey?: string;
  /** Savings Account Template */
  savingsAccountTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true })
  savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true })
  savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true })
  savingsAccountChargesStep: SavingsAccountChargesStepComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { savingsAccountTemplate: any }) => {
      this.savingsAccountTemplate = data.savingsAccountTemplate;
    });
  }

  /**
   * Sets savings account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.savingsAccountProductTemplate = $event;
  }

  /**
   * Retrieves savings account details form.
   */
  get savingsAccountDetailsForm() {
    return this.savingsAccountDetailsStep.savingsAccountDetailsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get savingsAccountTermsForm() {
    return this.savingsAccountTermsStep.savingsAccountTermsForm;
  }

  /**
   * Checks validity of overall savings account form.
   */
  get savingsAccountFormValid() {
    return this.savingsAccountDetailsForm.valid && this.savingsAccountTermsForm.valid;
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /**
   * Creates a new share account.
   */
  submit() {
    if (!this.startSubmit()) {
      return;
    }
    // TODO: Update once language and date settings are setup
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const savingsAccount = {
      ...this.savingsAccount,
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate ? this.dateUtils.formatDate(charge.dueDate, dateFormat) : charge.dueDate,
        feeOnMonthDay: charge.feeOnMonthDay
          ? this.dateUtils.formatDate(charge.feeOnMonthDay, monthDayFormat)
          : charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      submittedOnDate: this.dateUtils.formatDate(this.savingsAccount.submittedOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };
    if (this.savingsAccountTemplate.clientId) {
      savingsAccount.clientId = this.savingsAccountTemplate.clientId;
    } else {
      savingsAccount.groupId = this.savingsAccountTemplate.groupId;
    }
    this.savingsService.createSavingsAccount(savingsAccount, this.submitIdempotencyKey).subscribe({
      next: (response: any) => {
        this.submitIdempotencyKey = undefined;
        this.router.navigate(
          [
            '../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      },
      error: () => this.submitFailed()
    });
  }

  /**
   * Marks the submission as in flight and creates its idempotency key.
   * @returns false if a submission is already in flight.
   */
  private startSubmit(): boolean {
    if (this.isSubmitting) {
      return false;
    }
    if (!this.submitIdempotencyKey) {
      this.submitIdempotencyKey =
        globalThis.crypto?.randomUUID?.() ?? `create-savings-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    this.isSubmitting = true;
    this.cdr.markForCheck();
    return true;
  }

  /** Allows submitting again after the request failed. */
  private submitFailed(): void {
    // Fineract replays the stored response for a reused key, so a corrected form needs a new key.
    this.submitIdempotencyKey = undefined;
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }
}
