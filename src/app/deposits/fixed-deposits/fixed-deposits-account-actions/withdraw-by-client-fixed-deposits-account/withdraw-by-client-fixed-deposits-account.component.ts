/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Withdraw By Client Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-withdraw-by-client-fixed-deposits-account',
  templateUrl: './withdraw-by-client-fixed-deposits-account.component.html',
  styleUrls: ['./withdraw-by-client-fixed-deposits-account.component.scss']
})
export class WithdrawByClientFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Withdraw Fixed Deposits Account form. */
  withdrawFixedDepositsAccountForm: FormGroup;
  /** Fixed Deposits Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
              private fixedDepositsService: FixedDepositsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the withdraw fixed deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createWithdrawFixedDepositsAccountForm();
  }

  /**
   * Creates the withdraw fixed deposits account form.
   */
  createWithdrawFixedDepositsAccountForm() {
    this.withdrawFixedDepositsAccountForm = this.formBuilder.group({
      'withdrawnOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and withdraws the fixed deposit account by client,
   * if successful redirects to the fixed deposit account.
   */
  submit() {
    const withdrawFixedDepositsAccountFormData = this.withdrawFixedDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevWithdrawnOnDate: Date = this.withdrawFixedDepositsAccountForm.value.withdrawnOnDate;
    if (withdrawFixedDepositsAccountFormData.withdrawnOnDate instanceof Date) {
      withdrawFixedDepositsAccountFormData.withdrawnOnDate = this.dateUtils.formatDate(prevWithdrawnOnDate, dateFormat);
    }
    const data = {
      ...withdrawFixedDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'withdrawnByApplicant', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
