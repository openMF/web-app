/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Approve Savings Account Component
 */
@Component({
  selector: 'mifosx-approve-savings-account',
  templateUrl: './approve-savings-account.component.html',
  styleUrls: ['./approve-savings-account.component.scss']
})
export class ApproveSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Approve Savings Account form. */
  approveSavingsAccountForm: FormGroup;
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
   * Creates the approve savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createApproveSavingsAccountForm();
  }

  /**
   * Creates the approve savings account form.
   */
  createApproveSavingsAccountForm() {
    this.approveSavingsAccountForm = this.formBuilder.group({
      'approvedOnDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and approves the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    const approveSavingsAccountFormData = this.approveSavingsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevApprovedOnDate: Date = this.approveSavingsAccountForm.value.approvedOnDate;
    if (approveSavingsAccountFormData.approvedOnDate instanceof Date) {
      approveSavingsAccountFormData.approvedOnDate = this.dateUtils.formatDate(prevApprovedOnDate, dateFormat);
    }
    const data = {
      ...approveSavingsAccountFormData,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'approve', data).subscribe(() => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}
