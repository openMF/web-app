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
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RecurringDepositsAccountInterestRateChartStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-interest-rate-chart-step/recurring-deposits-account-interest-rate-chart-step.component';
import { RecurringDepositsAccountPreviewStepComponent } from '../recurring-deposits-account-stepper/recurring-deposits-account-preview-step/recurring-deposits-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit new recurring deposit account
 */
@Component({
  selector: 'mifosx-edit-recurring-deposit-account',
  templateUrl: './edit-recurring-deposit-account.component.html',
  styleUrls: ['./edit-recurring-deposit-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    RecurringDepositsAccountDetailsStepComponent,
    RecurringDepositsAccountTermsStepComponent,
    RecurringDepositsAccountSettingsStepComponent,
    RecurringDepositsAccountInterestRateChartStepComponent,
    RecurringDepositsAccountChargesStepComponent,
    RecurringDepositsAccountPreviewStepComponent
  ]
})
export class EditRecurringDepositAccountComponent {
  /** Imports all the step component */
  @ViewChild(RecurringDepositsAccountDetailsStepComponent, { static: true })
  recurringDepositsAccountDetailsStep: RecurringDepositsAccountDetailsStepComponent;
  @ViewChild(RecurringDepositsAccountTermsStepComponent, { static: true })
  recurringDepositAccountTermsStep: RecurringDepositsAccountTermsStepComponent;
  @ViewChild(RecurringDepositsAccountSettingsStepComponent, { static: true })
  recurringDepositAccountSettingsStep: RecurringDepositsAccountSettingsStepComponent;
  @ViewChild(RecurringDepositsAccountChargesStepComponent, { static: true })
  recurringDepositAccountChargesStep: RecurringDepositsAccountChargesStepComponent;

  /** Recurring Deposits Account And Template */
  recurringDepositsAccountAndTemplate: any;
  /** Recurring Deposit Account Product Template */
  recurringDepositsAccountProductTemplate: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService
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

  // Checks if stepper is valid and not pristine.
  get recurringDepositAccountFormValidAndNotPristine() {
    return (
      this.recurringDepositAccountDetailsForm.valid &&
      this.recurringDepositAccountTermsForm.valid &&
      this.recurringDepositAccountSettingsForm.valid &&
      (!this.recurringDepositAccountDetailsForm.pristine ||
        !this.recurringDepositAccountTermsForm.pristine ||
        !this.recurringDepositAccountSettingsForm.pristine ||
        !this.recurringDepositAccountChargesStep.pristine)
    );
  }

  /** Retrieves Data of all the forms */
  get recurringDepositAccountData() {
    return {
      ...this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetails,
      ...this.recurringDepositAccountTermsStep.recurringDepositAccountTerms,
      ...this.recurringDepositAccountSettingsStep.recurringDepositAccountSettings,
      ...this.recurringDepositAccountChargesStep.recurringDepositAccountCharges
    };
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get recurringDepositAccount() {
    return {
      ...this.recurringDepositsAccountDetailsStep.recurringDepositAccountDetails,
      ...this.recurringDepositAccountTermsStep.recurringDepositAccountTerms,
      ...this.recurringDepositAccountSettingsStep.recurringDepositAccountSettings,
      ...this.recurringDepositAccountChargesStep.recurringDepositAccountCharges
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
        dueDate: charge.dueDate && this.dateUtils.formatDate(charge.dueDate, dateFormat),
        feeOnMonthDay: charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      isCalendarInherited: this.recurringDepositAccount.recurringDepositAccount
        ? this.recurringDepositAccount.recurringDepositAccount
        : false,
      submittedOnDate: this.dateUtils.formatDate(this.recurringDepositAccount.submittedOnDate, dateFormat),
      expectedFirstDepositOnDate: this.dateUtils.formatDate(
        this.recurringDepositAccount.expectedFirstDepositOnDate,
        dateFormat
      ),
      dateFormat,
      monthDayFormat,
      locale
    };

    this.recurringDepositsService
      .updateRecurringDepositAccount(this.recurringDepositsAccountAndTemplate.id, recurringDepositAccount)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
