/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
/**
 * Withdrawn by Client Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-withdraw-by-client-recurring-deposits-account',
  templateUrl: './withdraw-by-client-recurring-deposits-account.component.html',
  styleUrls: ['./withdraw-by-client-recurring-deposits-account.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class WithdrawByClientRecurringDepositsAccountComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Withdraw Recurring Deposits Account form. */
  withdrawRecurringDepositsAccountForm: UntypedFormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the withdraw recurring deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createWithdrawRecurringDepositsAccountForm();
  }

  /**
   * Creates the withdraw recurring deposits account form.
   */
  createWithdrawRecurringDepositsAccountForm() {
    this.withdrawRecurringDepositsAccountForm = this.formBuilder.group({
      withdrawnOnDate: [
        '',
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submits the form and withdraws the recurring deposit account by client,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    const withdrawRecurringDepositsAccountFormData = this.withdrawRecurringDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevWithdrawnOnDate: Date = this.withdrawRecurringDepositsAccountForm.value.withdrawnOnDate;
    if (withdrawRecurringDepositsAccountFormData.withdrawnOnDate instanceof Date) {
      withdrawRecurringDepositsAccountFormData.withdrawnOnDate = this.dateUtils.formatDate(
        prevWithdrawnOnDate,
        dateFormat
      );
    }
    const data = {
      ...withdrawRecurringDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, 'withdrawnByApplicant', data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
