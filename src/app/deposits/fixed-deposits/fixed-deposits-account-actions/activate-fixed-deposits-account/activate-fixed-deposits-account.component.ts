/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/**
 * Activate Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-activate-fixed-deposits-account',
  templateUrl: './activate-fixed-deposits-account.component.html',
  styleUrls: ['./activate-fixed-deposits-account.component.scss']
})
export class ActivateFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate Fixed Deposits Account form. */
  activateFixedDepositsAccountForm: FormGroup;
  /** Fixed Deposits Account Id */
  accountId: any;

  /**
   * Fixed deposits endpoint is not supported so using Savings endpoint.
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
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the activate fixed deposits form.
   */
  ngOnInit() {
    this.createActivateFixedDepositsAccountForm();
  }

  /**
   * Creates the activate fixed deposits account form.
   */
  createActivateFixedDepositsAccountForm() {
    this.activateFixedDepositsAccountForm = this.formBuilder.group({
      'activatedOnDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the fixed deposit account,
   * if successful redirects to the fixed deposit account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevActivatedOnDate: Date = this.activateFixedDepositsAccountForm.value.activatedOnDate;
    this.activateFixedDepositsAccountForm.patchValue({
      activatedOnDate: this.datePipe.transform(prevActivatedOnDate, dateFormat),
    });
    const data = {
      ...this.activateFixedDepositsAccountForm.value,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
