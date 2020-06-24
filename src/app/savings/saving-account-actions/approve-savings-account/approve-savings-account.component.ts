/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

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
   * Creates the approve savings form.
   */
  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevApprovedOnDate: Date = this.approveSavingsAccountForm.value.approvedOnDate;
    this.approveSavingsAccountForm.patchValue({
      approvedOnDate: this.datePipe.transform(prevApprovedOnDate, dateFormat),
    });
    const data = {
      ...this.approveSavingsAccountForm.value,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'approve', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
