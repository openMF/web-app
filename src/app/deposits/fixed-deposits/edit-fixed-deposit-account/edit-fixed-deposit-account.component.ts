/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { FixedDepositsService } from '../fixed-deposits.service';

/** Custom Components */
import { FixedDepositAccountDetailsStepComponent } from '../fixed-deposit-account-stepper/fixed-deposit-account-details-step/fixed-deposit-account-details-step.component';
import { FixedDepositAccountCurrencyStepComponent } from '../fixed-deposit-account-stepper/fixed-deposit-account-currency-step/fixed-deposit-account-currency-step.component';
import { FixedDepositAccountTermsStepComponent } from '../fixed-deposit-account-stepper/fixed-deposit-account-terms-step/fixed-deposit-account-terms-step.component';
import { FixedDepositAccountSettingsStepComponent } from '../fixed-deposit-account-stepper/fixed-deposit-account-settings-step/fixed-deposit-account-settings-step.component';
import { FixedDepositAccountChargesStepComponent } from '../fixed-deposit-account-stepper/fixed-deposit-account-charges-step/fixed-deposit-account-charges-step.component';

/**
 * Edit Fixed Deposit Account Component
 */
@Component({
  selector: 'mifosx-edit-fixed-deposit-account',
  templateUrl: './edit-fixed-deposit-account.component.html',
  styleUrls: ['./edit-fixed-deposit-account.component.scss']
})
export class EditFixedDepositAccountComponent {

  /** Fixed Deposits Account Details Step */
  @ViewChild(FixedDepositAccountDetailsStepComponent, { static: true }) fixedDepositsAccountDetailsStep: FixedDepositAccountDetailsStepComponent;
  /** Fixed Deposits Account Currency Step */
  @ViewChild(FixedDepositAccountCurrencyStepComponent, { static: true }) fixedDepositAccountCurrencyStep: FixedDepositAccountCurrencyStepComponent;
  /** Fixed Deposits Account Terms Step */
  @ViewChild(FixedDepositAccountTermsStepComponent, { static: true }) fixedDepositAccountTermsStep: FixedDepositAccountTermsStepComponent;
  /** Fixed Deposits Account Settings Step */
  @ViewChild(FixedDepositAccountSettingsStepComponent, { static: true }) fixedDepositAccountSettingsStep: FixedDepositAccountSettingsStepComponent;
  /** Fixed Deposits Account Charges Step */
  @ViewChild(FixedDepositAccountChargesStepComponent, { static: true }) fixedDepositAccountChargesStep: FixedDepositAccountChargesStepComponent;

  /** Fixed Deposits Account Template */
  fixedDepositsAccountAndTemplate: any;
  /** Fixed Deposit Account Product Template */
  fixedDepositsAccountProductTemplate: any;

  /**
   * Fetches FD account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {DatePipe} datePipe Date Pipe
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private fixedDepositsService: FixedDepositsService) {
    this.route.data.subscribe((data: { fixedDepositsAccountAndTemplate: any }) => {
      this.fixedDepositsAccountAndTemplate = data.fixedDepositsAccountAndTemplate;
    });
  }

  /**
   * Sets fixed deposits account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.fixedDepositsAccountProductTemplate = $event;
  }

  /**
   * Retrieves Fixed Deposit Account Details Form Data
   */
  get fixedDepositAccountDetailsForm() {
    return this.fixedDepositsAccountDetailsStep.fixedDepositAccountDetailsForm;
  }

  /**
   * Retrieves Fixed Deposit Account Currency Form Data
   */
  get fixedDepositAccountCurrencyForm() {
    return this.fixedDepositAccountCurrencyStep.fixedDepositAccountCurrencyForm;
  }

  /**
   * Retrieves Fixed Deposit Account Terms Form Data
   */
  get fixedDepositAccountTermsForm() {
    return this.fixedDepositAccountTermsStep.fixedDepositAccountTermsForm;
  }

  /**
   * Retrieves Fixed Deposit Account Settings Form Data
   */
  get fixedDepositAccountSettingsForm() {
    return this.fixedDepositAccountSettingsStep.fixedDepositAccountSettingsForm;
  }

  /**
   * Checks if stepper is valid and not pristine.
   */
  get fixedDepositAccountFormValidAndNotPristine() {
    return (
      this.fixedDepositAccountDetailsForm.valid &&
      this.fixedDepositAccountTermsForm.valid &&
      this.fixedDepositAccountSettingsForm.valid &&
      (
        !this.fixedDepositAccountDetailsForm.pristine ||
        !this.fixedDepositAccountTermsForm.pristine ||
        !this.fixedDepositAccountSettingsForm.pristine ||
        !this.fixedDepositAccountChargesStep.pristine
      )
    );
  }

  /**
   * Creates the fixed deposit account object.
   */
  get fixedDepositAccount() {
    return {
      ...this.fixedDepositsAccountDetailsStep.fixedDepositAccountDetails,
      ...this.fixedDepositAccountTermsStep.fixedDepositAccountTerms,
      ...this.fixedDepositAccountSettingsStep.fixedDepositAccountSettings,
      ...this.fixedDepositAccountChargesStep.fixedDepositAccountCharges,
    };
  }

  /**
   * Submits the fixed deposit form and creates a new fixed deposit account
   */
  submit() {
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const monthDayFormat = 'dd MMMM';
    const fixedDepositAccount = {
      ...this.fixedDepositAccount,
      clientId: this.fixedDepositsAccountAndTemplate.clientId,
      charges: this.fixedDepositAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate && this.datePipe.transform(charge.dueDate, dateFormat),
        feeOnMonthDay: charge.feeOnMonthDay && this.datePipe.transform([2000].concat(charge.feeOnMonthDay), monthDayFormat),
        feeInterval: charge.feeInterval
      })),
      submittedOnDate: this.datePipe.transform(this.fixedDepositAccount.submittedOnDate, dateFormat),
      charts: [{chartSlabs: this.fixedDepositsAccountProductTemplate.accountChart.chartSlabs}],
      dateFormat,
      monthDayFormat,
      locale
    };
    this.fixedDepositsService.updateFixedDepositAccount(this.fixedDepositsAccountAndTemplate.id, fixedDepositAccount).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
