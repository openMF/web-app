/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/**
 * Reject Savings Account Component
 */
@Component({
  selector: 'mifosx-reject-savings-account',
  templateUrl: './reject-savings-account.component.html',
  styleUrls: ['./reject-savings-account.component.scss']
})
export class RejectSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Saving Account form. */
  rejectSavingsAccountForm: FormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the reject savings form.
   */
  ngOnInit() {
    this.createRejectSavingsAccountForm();
  }

  /**
   * Creates the reject savings account form.
   */
  createRejectSavingsAccountForm() {
    this.rejectSavingsAccountForm = this.formBuilder.group({
      'rejectedOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and rejects the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevRejectedOnDate: Date = this.rejectSavingsAccountForm.value.rejectedOnDate;
    this.rejectSavingsAccountForm.patchValue({
      rejectedOnDate: this.datePipe.transform(prevRejectedOnDate, dateFormat),
    });
    const data = {
      ...this.rejectSavingsAccountForm.value,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
