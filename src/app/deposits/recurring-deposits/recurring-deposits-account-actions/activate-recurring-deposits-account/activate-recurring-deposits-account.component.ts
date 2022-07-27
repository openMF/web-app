/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Activate Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-activate-recurring-deposits-account',
  templateUrl: './activate-recurring-deposits-account.component.html',
  styleUrls: ['./activate-recurring-deposits-account.component.scss']
})
export class ActivateRecurringDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate Recurring Deposits Account form. */
  activateRecurringDepositsAccountForm: FormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {recurringDepositsService} recurringDepositsService Recurring Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SavingsService} savingsService Savings Service
   */
  constructor(private formBuilder: FormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the activate recurring deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createActivateRecurringDepositsAccountForm();
  }

  /**
   * Creates the activate recurring deposits account form.
   */
  createActivateRecurringDepositsAccountForm() {
    this.activateRecurringDepositsAccountForm = this.formBuilder.group({
      'activatedOnDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    const activateRecurringDepositsAccountFormData = this.activateRecurringDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActivatedOnDate: Date = this.activateRecurringDepositsAccountForm.value.activatedOnDate;
    if (activateRecurringDepositsAccountFormData.activatedOnDate instanceof Date) {
      activateRecurringDepositsAccountFormData.activatedOnDate = this.dateUtils.formatDate(prevActivatedOnDate, dateFormat);
    }
    const data = {
      ...activateRecurringDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
