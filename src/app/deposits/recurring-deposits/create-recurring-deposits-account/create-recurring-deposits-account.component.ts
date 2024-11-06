/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/** Step Components */
import { RecurringDepositsAccountDetailsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-details-step/recurring-deposits-account-details-step.component';
import { RecurringDepositsAccountTermsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-terms-step/recurring-deposits-account-terms-step.component';
import { RecurringDepositsAccountSettingsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-settings-step/recurring-deposits-account-settings-step.component';
import { RecurringDepositsAccountChargesStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-charges-step/recurring-deposits-account-charges-step.component';
import { Dates } from 'app/core/utils/dates';

/**
 * Create new recurring deposit account
 */
@Component({
  selector: 'mifosx-create-recurring-deposits-account',
  templateUrl: './create-recurring-deposits-account.component.html',
  styleUrls: ['./create-recurring-deposits-account.component.scss']
})
export class CreateRecurringDepositsAccountComponent {

  /** Imports all the step component */
  @ViewChild(RecurringDepositsAccountDetailsStepComponent, { static: true }) recurringDepositsAccountDetailsStep: RecurringDepositsAccountDetailsStepComponent;
  @ViewChild(RecurringDepositsAccountTermsStepComponent, { static: true }) recurringDepositAccountTermsStep: RecurringDepositsAccountTermsStepComponent;
  @ViewChild(RecurringDepositsAccountSettingsStepComponent, { static: true }) recurringDepositAccountSettingsStep: RecurringDepositsAccountSettingsStepComponent;
  @ViewChild(RecurringDepositsAccountChargesStepComponent, { static: true }) recurringDepositAccountChargesStep: RecurringDepositsAccountChargesStepComponent;

  /** Recurring Deposits Account Template */
  recurringDepositsAccountTemplate: any;
  /** Recurring Deposit Account Product Template */
  recurringDepositsAccountProductTemplate: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService,
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountTemplate: any }) => {
      this.recurringDepositsAccountTemplate = data.recurringDepositsAccountTemplate;
    });
  }

  /**
   * Sets recurring deposits account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.recurringDepositsAccountProductTemplate = $event;
  }

  /** Get Recurring Deposit Account Details Form Data */
  get recurringDepositAccountDetailsForm() {
    return this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetailsForm;
  }

  /** Get Recurring Deposit Account Terms Form Data */
  get recurringDepositAccountTermsForm() {
    return this.recurringDepositAccountTermsStep.recurringDepositAccountTermsForm;
  }

  /** Get Recurring Deposit Account Settings Form Data */
  get recurringDepositAccountSettingsForm() {
    return this.recurringDepositAccountSettingsStep.recurringDepositAccountSettingsForm;
  }

  /** Checks wheter all the forms in different steps are valid or not */
  get recurringDepositAccountFormValid() {
    return (
      this.recurringDepositAccountDetailsForm.valid &&
      this.recurringDepositAccountTermsForm.valid &&
      this.recurringDepositAccountSettingsForm.valid
    );
  }

  /** Retrieves Data of all the forms */
  get recurringDepositAccountData() {
    return {
      ...this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetails,
      ...this.recurringDepositAccountTermsStep.recurringDepositAccountTerms,
      ...this.recurringDepositAccountSettingsStep.recurringDepositAccountSettings,
      ...this.recurringDepositAccountChargesStep.recurringDepositAccountCharges,
    };
  }


  /** Retrieves Data of all forms except Currency to submit the data */
  get recurringDepositAccount() {
    return {
      ...this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetails,
      ...this.recurringDepositAccountTermsStep.recurringDepositAccountTerms,
      ...this.recurringDepositAccountSettingsStep.recurringDepositAccountSettings,
      ...this.recurringDepositAccountChargesStep.recurringDepositAccountCharges,
    };
  }

  /**
   * Submits the recurring deposit form to create a new recurring deposit account
   */
  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const recurringDepositAccount = {
      ...this.recurringDepositAccount,
      clientId: this.recurringDepositsAccountTemplate.clientId,
      charges: this.recurringDepositAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate && this.dateUtils.formatDate(charge.dueDate, dateFormat),
        feeOnMonthDay: charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      isCalendarInherited: this.recurringDepositAccount.recurringDepositAccount ? this.recurringDepositAccount.recurringDepositAccount : false,
      submittedOnDate: this.dateUtils.formatDate(this.recurringDepositAccount.submittedOnDate, dateFormat),
      expectedFirstDepositOnDate: this.dateUtils.formatDate(this.recurringDepositAccount.expectedFirstDepositOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };

    this.recurringDepositsService.createRecurringDepositAccount(recurringDepositAccount).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}
