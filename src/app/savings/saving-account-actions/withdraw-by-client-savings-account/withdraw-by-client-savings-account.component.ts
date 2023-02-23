/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Withdraw By Client Savings Account Component
 */
@Component({
  selector: 'mifosx-withdraw-by-client-savings-account',
  templateUrl: './withdraw-by-client-savings-account.component.html',
  styleUrls: ['./withdraw-by-client-savings-account.component.scss']
})
export class WithdrawByClientSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Withdraw Savings Account form. */
  withdrawSavingsAccountForm: FormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the withdraw savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createWithdrawSavingsAccountForm();
  }

  /**
   * Creates the withdraw savings account form.
   */
  createWithdrawSavingsAccountForm() {
    this.withdrawSavingsAccountForm = this.formBuilder.group({
      'withdrawnOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and withdraws the saving account by client,
   * if successful redirects to the saving account.
   */
  submit() {
    const withdrawSavingsAccountFormData = this.withdrawSavingsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevWithdrawnOnDate: Date = this.withdrawSavingsAccountForm.value.withdrawnOnDate;
    if (withdrawSavingsAccountFormData.withdrawnOnDate instanceof Date) {
      withdrawSavingsAccountFormData.withdrawnOnDate = this.dateUtils.formatDate(prevWithdrawnOnDate, dateFormat);
    }
    const data = {
      ...withdrawSavingsAccountFormData,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'withdrawnByApplicant', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
