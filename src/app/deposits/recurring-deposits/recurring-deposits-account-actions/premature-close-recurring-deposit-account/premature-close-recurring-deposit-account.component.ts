/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';

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
  prematureCloseRecurringDepositsAccountForm: FormGroup;
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
   * Creates the premature close recurring deposits form.
   */
  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedOnDate: Date = this.prematureCloseRecurringDepositsAccountForm.value.closedOnDate;
    this.prematureCloseRecurringDepositsAccountForm.patchValue({
      closedOnDate: this.datePipe.transform(prevClosedOnDate, dateFormat),
    });
    const data = {
      ...this.prematureCloseRecurringDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'prematureClose', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
