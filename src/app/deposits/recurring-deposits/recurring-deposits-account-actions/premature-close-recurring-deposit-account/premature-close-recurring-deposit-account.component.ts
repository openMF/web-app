/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Premature Close Recurring Deposits Account Component
 */

@Component({
  selector: 'mifosx-premature-close-recurring-deposit-account',
  templateUrl: './premature-close-recurring-deposit-account.component.html',
  styleUrls: ['./premature-close-recurring-deposit-account.component.scss']
})
export class PrematureCloseRecurringDepositAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** premature close Recurring Deposits Account form. */
  prematureCloseRecurringDepositsAccountForm: UntypedFormGroup;
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
  constructor(private formBuilder: UntypedFormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService, ) {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the premature close recurring deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createprematureCloseRecurringDepositsAccountForm();
  }

  /**
   * Creates the premature close recurring deposits account form.
   */
  createprematureCloseRecurringDepositsAccountForm() {
    this.prematureCloseRecurringDepositsAccountForm = this.formBuilder.group({
      'closedOnDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and premature closes the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    const prematureCloseRecurringDepositsAccountFormData = this.prematureCloseRecurringDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedOnDate: Date = this.prematureCloseRecurringDepositsAccountForm.value.closedOnDate;
    if (prematureCloseRecurringDepositsAccountFormData.closedOnDate instanceof Date) {
      prematureCloseRecurringDepositsAccountFormData.closedOnDate = this.dateUtils.formatDate(prevClosedOnDate, dateFormat);
    }
    const data = {
      ...prematureCloseRecurringDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'prematureClose', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
