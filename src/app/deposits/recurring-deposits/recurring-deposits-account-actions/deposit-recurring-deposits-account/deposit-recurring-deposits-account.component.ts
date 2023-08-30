/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Deposits Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-deposit-recurring-deposits-account',
  templateUrl: './deposit-recurring-deposits-account.component.html',
  styleUrls: ['./deposit-recurring-deposits-account.component.scss']
})
export class DepositRecurringDepositsAccountComponent implements OnInit {

  /** Transactions Amount */
  transactionAmount: any;
  /** Outstanding Charge Amount */
  outstandingChargeAmount: any;
  /** Payment Types */
  paymentTypes: any;
  /** Account Id */
  accountId: string;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Deposits Recurring Deposit Account form. */
  depositRecurringDepositForm: UntypedFormGroup;

  /**
   * Retrieves action details transactions template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private recurringDepositsService: RecurringDepositsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { recurringDepositsAccountActionData: any }) => {
      this.transactionAmount = data.recurringDepositsAccountActionData.amount;
      this.paymentTypes = data.recurringDepositsAccountActionData.paymentTypeOptions;
      if (data.recurringDepositsAccountActionData.outstandingChargeAmount && data.recurringDepositsAccountActionData.outstandingChargeAmount > 0) {
        this.outstandingChargeAmount = data.recurringDepositsAccountActionData.outstandingChargeAmount;
        this.transactionAmount = this.transactionAmount + this.outstandingChargeAmount;
      }
    });
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createdepositRecurringDepositForm();
  }

  /**
   * Creates the deposits form.
   */
  createdepositRecurringDepositForm() {
    this.depositRecurringDepositForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': [this.transactionAmount, Validators.required],
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
   * Submits the deposits recurring deposit form
   */
  submit() {
    const depositRecurringDepositFormData = this.depositRecurringDepositForm.value;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const prevTransactionDate = this.depositRecurringDepositForm.value.transactionDate;
    if (depositRecurringDepositFormData.transactionDate instanceof Date) {
      depositRecurringDepositFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...depositRecurringDepositFormData,
      dateFormat,
      locale
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'deposit', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
