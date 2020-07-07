/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';


/**
 * Reject Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-reject-recurring-deposits-account',
  templateUrl: './reject-recurring-deposits-account.component.html',
  styleUrls: ['./reject-recurring-deposits-account.component.scss']
})
export class RejectRecurringDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Recurring Deposits Account form. */
  rejectRecurringDepositsAccountForm: FormGroup;
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
   * Creates the reject recurring deposits form.
   */
  ngOnInit() {
    this.createRejectRecurringDepositsAccountForm();
  }

  /**
   * Creates the reject recurring deposits account form.
   */
  createRejectRecurringDepositsAccountForm() {
    this.rejectRecurringDepositsAccountForm = this.formBuilder.group({
      'rejectedOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and rejects the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevRejectedOnDate: Date = this.rejectRecurringDepositsAccountForm.value.rejectedOnDate;
    this.rejectRecurringDepositsAccountForm.patchValue({
      rejectedOnDate: this.datePipe.transform(prevRejectedOnDate, dateFormat),
    });
    const data = {
      ...this.rejectRecurringDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
