/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Reject Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-reject-fixed-deposits-account',
  templateUrl: './reject-fixed-deposits-account.component.html',
  styleUrls: ['./reject-fixed-deposits-account.component.scss']
})
export class RejectFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Fixed Deposit Account form. */
  rejectFixedDepositsAccountForm: UntypedFormGroup;
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
  constructor(private formBuilder: UntypedFormBuilder,
              private fixedDepositsService: FixedDepositsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the reject fixed deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createRejectFixedDepositsAccountForm();
  }

  /**
   * Creates the reject fixed deposits account form.
   */
  createRejectFixedDepositsAccountForm() {
    this.rejectFixedDepositsAccountForm = this.formBuilder.group({
      'rejectedOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and rejects the fixed deposit account,
   * if successful redirects to the fixed deposit account.
   */
  submit() {
    const rejectFixedDepositsAccountFormData = this.rejectFixedDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRejectedOnDate: Date = this.rejectFixedDepositsAccountForm.value.rejectedOnDate;
    if (rejectFixedDepositsAccountFormData.rejectedOnDate instanceof Date) {
      rejectFixedDepositsAccountFormData.rejectedOnDate = this.dateUtils.formatDate(prevRejectedOnDate, dateFormat);
    }
    const data = {
      ...rejectFixedDepositsAccountFormData,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
