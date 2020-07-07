/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';

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
   * Creates the activate recurring deposits form.
   */
  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevActivatedOnDate: Date = this.activateRecurringDepositsAccountForm.value.activatedOnDate;
    this.activateRecurringDepositsAccountForm.patchValue({
      activatedOnDate: this.datePipe.transform(prevActivatedOnDate, dateFormat),
    });
    const data = {
      ...this.activateRecurringDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
