/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
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
 * Approve Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-approve-recurring-deposits-account',
  templateUrl: './approve-recurring-deposits-account.component.html',
  styleUrls: ['./approve-recurring-deposits-account.component.scss'],
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
export class ApproveRecurringDepositsAccountComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Approve Recurring Deposits Account form. */
  approveRecurringDepositsAccountForm: UntypedFormGroup;
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
   * Creates the approve recurring deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createApproveRecurringDepositsAccountForm();
  }

  /**
   * Creates the approve recurring deposits account form.
   */
  createApproveRecurringDepositsAccountForm() {
    this.approveRecurringDepositsAccountForm = this.formBuilder.group({
      approvedOnDate: [
        '',
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submits the form and approves the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    const approveRecurringDepositsAccountFormData = this.approveRecurringDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevApprovedOnDate: Date = this.approveRecurringDepositsAccountForm.value.approvedOnDate;
    if (approveRecurringDepositsAccountFormData.approvedOnDate instanceof Date) {
      approveRecurringDepositsAccountFormData.approvedOnDate = this.dateUtils.formatDate(
        prevApprovedOnDate,
        dateFormat
      );
    }
    const data = {
      ...approveRecurringDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, 'approve', data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
