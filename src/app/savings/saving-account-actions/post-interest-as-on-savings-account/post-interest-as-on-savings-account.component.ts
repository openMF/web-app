/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/**
 * Post Interest Savings Account Component
 */
@Component({
  selector: 'mifosx-post-interest-as-on-savings-account',
  templateUrl: './post-interest-as-on-savings-account.component.html',
  styleUrls: ['./post-interest-as-on-savings-account.component.scss']
})
export class PostInterestAsOnSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Post Interest Savings Account form. */
  postInterestSavingsAccountForm: FormGroup;
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
   * Creates the post interest savings form.
   */
  ngOnInit() {
    this.createPostInterestSavingsAccountForm();
  }

  /**
   * Creates the post interest savings account form.
   */
  createPostInterestSavingsAccountForm() {
    this.postInterestSavingsAccountForm = this.formBuilder.group({
      'transactionDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and post interests of the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevTransactionDate: Date = this.postInterestSavingsAccountForm.value.transactionDate;
    this.postInterestSavingsAccountForm.patchValue({
      transactionDate: this.datePipe.transform(prevTransactionDate, dateFormat),
    });
    const data = {
      ...this.postInterestSavingsAccountForm.value,
      IsPostInterestAsOn: true,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountTransactionsCommand(this.accountId, 'postInterestAsOn', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
