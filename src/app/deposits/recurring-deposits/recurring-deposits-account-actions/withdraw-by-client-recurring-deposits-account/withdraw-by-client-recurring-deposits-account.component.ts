/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';

/**
 * Withdraw By Client Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-withdraw-by-client-recurring-deposits-account',
  templateUrl: './withdraw-by-client-recurring-deposits-account.component.html',
  styleUrls: ['./withdraw-by-client-recurring-deposits-account.component.scss']
})
export class WithdrawByClientRecurringDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Withdraw Recurring Deposits Account form. */
  withdrawRecurringDepositsAccountForm: FormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router) {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the withdraw recurring deposits form.
   */
  ngOnInit() {
    this.createWithdrawRecurringDepositsAccountForm();
  }

  /**
   * Creates the withdraw recurring deposits account form.
   */
  createWithdrawRecurringDepositsAccountForm() {
    this.withdrawRecurringDepositsAccountForm = this.formBuilder.group({
      'withdrawnOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and withdraws the recurring deposit account by client,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevWithdrawnOnDate: Date = this.withdrawRecurringDepositsAccountForm.value.withdrawnOnDate;
    this.withdrawRecurringDepositsAccountForm.patchValue({
      withdrawnOnDate: this.datePipe.transform(prevWithdrawnOnDate, dateFormat),
    });
    const data = {
      ...this.withdrawRecurringDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'withdrawnByApplicant', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
