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
import { EMPTY, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Premature Close Recurring Deposits Account Component
 */

@Component({
  selector: 'mifosx-premature-close-recurring-deposit-account',
  templateUrl: './premature-close-recurring-deposit-account.component.html',
  styleUrls: ['./premature-close-recurring-deposit-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrematureCloseRecurringDepositAccountComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private recurringDepositsService = inject(RecurringDepositsService);
  private dateUtils = inject(Dates);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  private changeDetector = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** premature close Recurring Deposits Account form. */
  prematureCloseRecurringDepositsAccountForm: UntypedFormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;
  /** Savings accounts the deposit can be transferred to. */
  savingsAccountsData: any[] = [];
  /** What to do with the money on closure (withdraw or transfer to savings). */
  onAccountClosureOptions: any[] = [];

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the premature close recurring deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createprematureCloseRecurringDepositsAccountForm();
    this.buildDependencies();
  }

  /**
   * Creates the premature close recurring deposits account form.
   * The closure action is required from the start, so Confirm stays disabled until a calculation has loaded the options.
   */
  createprematureCloseRecurringDepositsAccountForm() {
    this.prematureCloseRecurringDepositsAccountForm = this.formBuilder.group({
      closedOnDate: [
        '',
        Validators.required
      ],
      maturityAmount: [{ value: '', disabled: true }],
      onAccountClosureId: [
        '',
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Fetches the premature closure amount and options for the chosen date (a newer date cancels the pending request),
   * and asks for the savings account only when the money is transferred to savings.
   */
  buildDependencies() {
    const form = this.prematureCloseRecurringDepositsAccountForm;
    form
      .get('closedOnDate')
      .valueChanges.pipe(
        tap(() => this.clearCalculation()),
        // A cleared date must cancel the pending calculation too, so the check sits inside switchMap.
        switchMap((date: any) => (date instanceof Date ? this.calculatePrematureAmount(date) : EMPTY)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        this.savingsAccountsData = response.savingsAccounts || [];
        this.onAccountClosureOptions = response.onAccountClosureOptions || [];
        form.get('maturityAmount').setValue(response.maturityAmount);
        this.changeDetector.markForCheck();
      });
    form
      .get('onAccountClosureId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id: any) => {
        if (id === 200) {
          form.addControl('toSavingsAccountId', new UntypedFormControl('', Validators.required));
          form.addControl('transferDescription', new UntypedFormControl(''));
        } else {
          form.removeControl('toSavingsAccountId');
          form.removeControl('transferDescription');
        }
      });
  }

  /**
   * Gets the maturity amount, closure options and savings accounts for a premature closure on the given date.
   * A failed request leaves the closure action unavailable instead of ending the date subscription.
   * @param {Date} date Closed on date.
   */
  calculatePrematureAmount(date: Date): Observable<any> {
    const dateFormat = this.settingsService.dateFormat;
    const data = {
      closedOnDate: this.dateUtils.formatDate(date, dateFormat),
      dateFormat,
      locale: this.settingsService.language.code
    };
    return this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, 'calculatePrematureAmount', data)
      .pipe(catchError(() => EMPTY));
  }

  /**
   * Forgets the calculation of the previous date until the new one arrives.
   */
  clearCalculation() {
    this.onAccountClosureOptions = [];
    this.savingsAccountsData = [];
    this.prematureCloseRecurringDepositsAccountForm.patchValue({ maturityAmount: '', onAccountClosureId: '' });
  }

  /**
   * Submits the form and premature closes the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    if (this.prematureCloseRecurringDepositsAccountForm.invalid) {
      return;
    }
    const prematureCloseRecurringDepositsAccountFormData = this.prematureCloseRecurringDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedOnDate: Date = this.prematureCloseRecurringDepositsAccountForm.value.closedOnDate;
    if (prematureCloseRecurringDepositsAccountFormData.closedOnDate instanceof Date) {
      prematureCloseRecurringDepositsAccountFormData.closedOnDate = this.dateUtils.formatDate(
        prevClosedOnDate,
        dateFormat
      );
    }
    const data = {
      ...prematureCloseRecurringDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, 'prematureClose', data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
