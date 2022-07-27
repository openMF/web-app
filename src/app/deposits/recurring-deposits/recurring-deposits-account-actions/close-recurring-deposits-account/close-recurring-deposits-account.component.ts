/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Close Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-close-recurring-deposits-account',
  templateUrl: './close-recurring-deposits-account.component.html',
  styleUrls: ['./close-recurring-deposits-account.component.scss']
})
export class CloseRecurringDepositsAccountComponent implements OnInit {

  /** Maturity Amount */
  maturityAmount: any;
  /** On Account Closure Options */
  onAccountClosureOptions: any;
  /** Payment Types */
  paymentTypes: any;
  /** Title */
  title: string;
  /** Account Id */
  accountId: string;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Close Recurring Deposit Account form. */
  closeRecurringDepositForm: FormGroup;

  /**
   * Retrieves action details template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountActionData: any }) => {
      this.maturityAmount = data.recurringDepositsAccountActionData.maturityAmount;
      this.onAccountClosureOptions = data.recurringDepositsAccountActionData.onAccountClosureOptions;
      this.paymentTypes = data.recurringDepositsAccountActionData.paymentTypeOptions;
      if (data.recurringDepositsAccountActionData.maturityAmount) {
        this.title = 'Recurring Deposit Closure on Maturity';
      } else {
        this.title = 'Recurring Deposit Closure';
      }
    });
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createcloseRecurringDepositForm();
  }

  /**
   * Creates the close form.
   */
  createcloseRecurringDepositForm() {
    this.closeRecurringDepositForm = this.formBuilder.group({
      'closedOnDate': [new Date(), Validators.required],
      'maturityAmount': [{ value: this.maturityAmount, disabled: true}],
      'onAccountClosureId': ['', Validators.required],
      'paymentTypeId': ['', Validators.required],
      'accountNumber': '',
      'chequeNumber': '',
      'routingCode': '',
      'receiptNumber': '',
      'bankNumber': '',
      'note': ''
    });
  }

  /**
   * Toggles the display of payment details
   */
  toggleDisplay() {
    this.showPaymentDetails = !(this.showPaymentDetails);
  }

  /**
   * Submits the close recurring deposit form
   */
  submit() {
    const closeRecurringDepositFormData = this.closeRecurringDepositForm.value;
    const closedOnDate = this.closeRecurringDepositForm.value.closedOnDate;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    if (closeRecurringDepositFormData.closedOnDate instanceof Date) {
      closeRecurringDepositFormData.closedOnDate = this.dateUtils.formatDate(closedOnDate, dateFormat);
    }
    const data = {
      ...closeRecurringDepositFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
