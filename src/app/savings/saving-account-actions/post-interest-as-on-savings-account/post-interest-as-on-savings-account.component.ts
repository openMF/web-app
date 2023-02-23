/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

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
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the post interest savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const postInterestSavingsAccountFormData = this.postInterestSavingsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.postInterestSavingsAccountForm.value.transactionDate;
    if (postInterestSavingsAccountFormData.transactionDate instanceof Date) {
      postInterestSavingsAccountFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...postInterestSavingsAccountFormData,
      IsPostInterestAsOn: true,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountTransactionsCommand(this.accountId, 'postInterestAsOn', data).subscribe(() => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}
