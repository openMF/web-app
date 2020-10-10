/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/** Step Components */
import { RecurringDepositsAccountDetailsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-details-step/recurring-deposits-account-details-step.component';
import { RecurringDepositsAccountTermsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-terms-step/recurring-deposits-account-terms-step.component';
import { RecurringDepositsAccountCurrencyStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-currency-step/recurring-deposits-account-currency-step.component';
import { RecurringDepositsAccountSettingsStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-settings-step/recurring-deposits-account-settings-step.component';
import { RecurringDepositsAccountChargesStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-charges-step/recurring-deposits-account-charges-step.component';

/**
 * Edit new recurring deposit account
 */
@Component({
  selector: 'mifosx-edit-recurring-deposit-account',
  templateUrl: './edit-recurring-deposit-account.component.html',
  styleUrls: ['./edit-recurring-deposit-account.component.scss']
})
export class EditRecurringDepositAccountComponent implements OnInit {

  /** Imports all the step component */
  @ViewChild(RecurringDepositsAccountDetailsStepComponent, { static: true }) recurringDepositsAccountDetailsStep: RecurringDepositsAccountDetailsStepComponent;
  @ViewChild(RecurringDepositsAccountCurrencyStepComponent, { static: true }) recurringDepositAccountCurrencyStep: RecurringDepositsAccountCurrencyStepComponent;
  @ViewChild(RecurringDepositsAccountTermsStepComponent, { static: true }) recurringDepositAccountTermsStep: RecurringDepositsAccountTermsStepComponent;
  @ViewChild(RecurringDepositsAccountSettingsStepComponent, { static: true }) recurringDepositAccountSettingsStep: RecurringDepositsAccountSettingsStepComponent;
  @ViewChild(RecurringDepositsAccountChargesStepComponent, { static: true }) recurringDepositAccountChargesStep: RecurringDepositsAccountChargesStepComponent;

  /** Recurring Deposits Account And Template */
  recurringDepositsAccountAndTemplate: any;
  /** Recurring Deposit Account Product Template */
  recurringDepositsAccountProductTemplate: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService,
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountAndTemplate: any }) => {
      this.recurringDepositsAccountAndTemplate = data.recurringDepositsAccountAndTemplate;
    });
  }

  /**
   * Sets recurring deposits account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.recurringDepositsAccountProductTemplate = $event;
  }

  ngOnInit() {
  }

  /** Get Recurring Deposit Account Details Form Data */
  get recurringDepositAccountDetailsForm() {
    return this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetailsForm;
  }

  /** Get Recurring Deposit Account Currency Form Data */
  get recurringDepositAccountCurrencyForm() {
    return this.recurringDepositAccountCurrencyStep.recurringDepositAccountCurrencyForm;
  }

  /** Get Recurring Deposit Account Terms Form Data */
  get recurringDepositAccountTermsForm() {
    return this.recurringDepositAccountTermsStep.recurringDepositAccountTermsForm;
  }

  /** Get Recurring Deposit Account Settings Form Data */
  get recurringDepositAccountSettingsForm() {
    return this.recurringDepositAccountSettingsStep.recurringDepositAccountSettingsForm;
  }

  // Checks if stepper is valid and not pristine.
  get recurringDepositAccountFormValidAndNotPristine() {
    return (
      this.recurringDepositAccountDetailsForm.valid &&
      this.recurringDepositAccountTermsForm.valid &&
      this.recurringDepositAccountSettingsForm.valid &&
      (
        !this.recurringDepositAccountDetailsForm.pristine ||
        !this.recurringDepositAccountTermsForm.pristine ||
        !this.recurringDepositAccountSettingsForm.pristine ||
        !this.recurringDepositAccountChargesStep.pristine
      )
    );
  }

  /** Retrieves Data of all the forms */
  get recurringDepositAccountData() {
    return {
      ...this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetails,
      ...this.recurringDepositAccountCurrencyStep.recurringDepositAccountCurrency,
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
      clientId: this.recurringDepositsAccountAndTemplate.clientId,
      charges: this.recurringDepositAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate && this.datePipe.transform(charge.dueDate, dateFormat),
        feeOnMonthDay: charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      isCalendarInherited: this.recurringDepositAccount.recurringDepositAccount ? this.recurringDepositAccount.recurringDepositAccount : false,
      submittedOnDate: this.datePipe.transform(this.recurringDepositAccount.submittedOnDate, dateFormat),
      expectedFirstDepositOnDate: this.datePipe.transform(this.recurringDepositAccount.expectedFirstDepositOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };

    this.recurringDepositsService.updateRecurringDepositAccount(this.recurringDepositsAccountAndTemplate.id, recurringDepositAccount).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
