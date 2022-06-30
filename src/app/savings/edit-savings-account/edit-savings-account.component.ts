/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';

/** Custom Services */
import { SavingsService } from '../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Savings Account Component
 */
@Component({
  selector: 'mifosx-edit-savings-account',
  templateUrl: './edit-savings-account.component.html',
  styleUrls: ['./edit-savings-account.component.scss']
})
export class EditSavingsAccountComponent {

  /** Savings Account Template */
  savingsAccountAndTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true }) savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true }) savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true }) savingsAccountChargesStep: SavingsAccountChargesStepComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private savingsService: SavingsService,
              private settingsService: SettingsService
              ) {
    this.route.data.subscribe((data: { savingsAccountAndTemplate: any }) => {
      this.savingsAccountAndTemplate = data.savingsAccountAndTemplate;
    });
  }

  /**
   * Sets savings account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.savingsAccountProductTemplate = $event;
  }

  /**
   * Retrieves savings account details form.
   */
  get savingsAccountDetailsForm() {
    return this.savingsAccountDetailsStep.savingsAccountDetailsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get savingsAccountTermsForm() {
    return this.savingsAccountTermsStep.savingsAccountTermsForm;
  }

  /**
   * Checks validity and pristinity of overall savings account form .
   */
  get savingsAccountFormValidAndNotPristine() {
    return (
      this.savingsAccountDetailsForm.valid &&
      this.savingsAccountTermsForm.valid &&
      (
        !this.savingsAccountDetailsForm.pristine ||
        !this.savingsAccountTermsForm.pristine ||
        !this.savingsAccountChargesStep.pristine
      )
    );
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /**
   * Creates a new share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const savingsAccount = {
      ...this.savingsAccount,
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: this.dateUtils.formatDate(charge.dueDate, dateFormat),
        feeOnMonthDay: this.dateUtils.formatDate(charge.feeOnMonthDay, dateFormat),
        feeInterval: charge.feeInterval
      })),
      submittedOnDate: this.dateUtils.formatDate(this.savingsAccount.submittedOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };
    if (this.savingsAccountAndTemplate.clientId) {
      savingsAccount.clientId = this.savingsAccountAndTemplate.clientId;
    } else {
      savingsAccount.groupId = this.savingsAccountAndTemplate.groupId;
    }
    this.savingsService.updateSavingsAccount(this.savingsAccountAndTemplate.id, savingsAccount).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
