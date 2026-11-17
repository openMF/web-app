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
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Premature Close Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-premature-close-fixed-deposits-account',
  templateUrl: './premature-close-fixed-deposits-account.component.html',
  styleUrls: ['./premature-close-fixed-deposits-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrematureCloseFixedDepositsAccountComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private fixedDepositsService = inject(FixedDepositsService);
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
  /** Premature Close FD Account form. */
  prematureCloseAccountForm: UntypedFormGroup;
  /** Savings Account Data */
  savingsAccountsData: any[] = [];
  /** On account Closure Options */
  onAccountClosureOptions: any[] = [];
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Whether a premature close request is in flight. */
  isSubmitting = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the premature close fd account form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createPrematureCloseAccountForm();
    this.buildDependencies();
  }

  /**
   * Creates the premature close fd account form.
   * The closure action is required from the start, so Confirm stays disabled until a calculation has loaded the options.
   */
  createPrematureCloseAccountForm() {
    this.prematureCloseAccountForm = this.formBuilder.group({
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
    const form = this.prematureCloseAccountForm;
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
   * @param {Date} date Premature Close Date
   */
  calculatePrematureAmount(date: Date): Observable<any> {
    const dateFormat = this.settingsService.dateFormat;
    const data = {
      closedOnDate: this.dateUtils.formatDate(date, dateFormat),
      dateFormat,
      locale: this.settingsService.language.code
    };
    return this.fixedDepositsService
      .executeFixedDepositsAccountCommand(this.accountId, 'calculatePrematureAmount', data)
      .pipe(catchError(() => EMPTY));
  }

  /**
   * Forgets the calculation of the previous date until the new one arrives.
   */
  clearCalculation() {
    this.onAccountClosureOptions = [];
    this.savingsAccountsData = [];
    this.prematureCloseAccountForm.patchValue({ maturityAmount: '', onAccountClosureId: '' });
  }

  /**
   * Submits the form and premature closes the fd account,
   * if successful redirects to the fd account.
   */
  submit() {
    if (this.isSubmitting || this.prematureCloseAccountForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    const prematureCloseAccountFormData = this.prematureCloseAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.prematureCloseAccountForm.value.closedOnDate;
    if (prematureCloseAccountFormData.closedOnDate instanceof Date) {
      prematureCloseAccountFormData.closedOnDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...prematureCloseAccountFormData,
      dateFormat,
      locale
    };
    this.fixedDepositsService
      .executeFixedDepositsAccountCommand(this.accountId, 'prematureClose', data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        // ErrorHandlerInterceptor already alerts the user about the failed
        // request. Handle the rejection here so it does not become an unhandled
        // RxJS error; the finalize operator resets the form so Confirm can retry.
        error: () => {
          // Intentionally no notification: the interceptor owns the message.
        }
      });
  }
}
