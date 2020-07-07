/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';

/**
 * Approve Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-approve-recurring-deposits-account',
  templateUrl: './approve-recurring-deposits-account.component.html',
  styleUrls: ['./approve-recurring-deposits-account.component.scss']
})
export class ApproveRecurringDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Approve Recurring Deposits Account form. */
  approveRecurringDepositsAccountForm: FormGroup;
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
   * Creates the approve recurring deposits form.
   */
  ngOnInit() {
    this.createApproveRecurringDepositsAccountForm();
  }

  /**
   * Creates the approve recurring deposits account form.
   */
  createApproveRecurringDepositsAccountForm() {
    this.approveRecurringDepositsAccountForm = this.formBuilder.group({
      'approvedOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and approves the recurring deposit account,
   * if successful redirects to the recurring deposit account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevApprovedOnDate: Date = this.approveRecurringDepositsAccountForm.value.approvedOnDate;
    this.approveRecurringDepositsAccountForm.patchValue({
      approvedOnDate: this.datePipe.transform(prevApprovedOnDate, dateFormat),
    });
    const data = {
      ...this.approveRecurringDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'approve', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
