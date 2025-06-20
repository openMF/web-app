/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { TransactionCommand, TransactionTypeFlags } from '../../../transaction.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Deposits Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-deposit-recurring-deposits-account',
  templateUrl: './deposit-recurring-deposits-account.component.html',
  styleUrls: ['./deposit-recurring-deposits-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle,
    CdkTextareaAutosize
  ]
})
export class DepositRecurringDepositsAccountComponent implements OnInit {
  @Input() currency: Currency;

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

  action: string;
  actionName: string;
  transactionCommand: TransactionCommand;
  transactionType: TransactionTypeFlags = { deposit: false, withdrawal: false };

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
      if (
        data.recurringDepositsAccountActionData.outstandingChargeAmount &&
        data.recurringDepositsAccountActionData.outstandingChargeAmount > 0
      ) {
        this.outstandingChargeAmount = data.recurringDepositsAccountActionData.outstandingChargeAmount;
        this.transactionAmount += this.outstandingChargeAmount;
      }
    });
    this.actionName = this.route.snapshot.params['name'];
    this.action = this.actionName.toLowerCase();
    if (this.action === 'deposit' || this.action === 'withdrawal') {
      this.transactionCommand = this.action;
      this.transactionType[this.transactionCommand] = true;
    } else {
      throw new Error(`Invalid transaction action: ${this.actionName}`);
    }

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
      transactionDate: [
        new Date(),
        Validators.required
      ],
      transactionAmount: [
        0.0,
        Validators.required
      ],
      paymentTypeId: [
        '',
        Validators.required
      ],
      note: ''
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.depositRecurringDepositForm.addControl('accountNumber', new UntypedFormControl(''));
      this.depositRecurringDepositForm.addControl('checkNumber', new UntypedFormControl(''));
      this.depositRecurringDepositForm.addControl('routingCode', new UntypedFormControl(''));
      this.depositRecurringDepositForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.depositRecurringDepositForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.depositRecurringDepositForm.removeControl('accountNumber');
      this.depositRecurringDepositForm.removeControl('checkNumber');
      this.depositRecurringDepositForm.removeControl('routingCode');
      this.depositRecurringDepositForm.removeControl('receiptNumber');
      this.depositRecurringDepositForm.removeControl('bankNumber');
    }
  }

  /**
   * Toggles the display of payment details
   */
  toggleDisplay() {
    this.showPaymentDetails = !this.showPaymentDetails;
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

    delete data['note'];
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.recurringDepositsService
      .executeRecurringDepositsAccountCommand(this.accountId, this.action, data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
