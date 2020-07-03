/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';

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
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private fixedDepositsService: FixedDepositsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the withdraw fixed deposits form.
   */
  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevWithdrawnOnDate: Date = this.withdrawFixedDepositsAccountForm.value.withdrawnOnDate;
    this.withdrawFixedDepositsAccountForm.patchValue({
      withdrawnOnDate: this.datePipe.transform(prevWithdrawnOnDate, dateFormat),
    });
    const data = {
      ...this.withdrawFixedDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'withdrawnByApplicant', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
