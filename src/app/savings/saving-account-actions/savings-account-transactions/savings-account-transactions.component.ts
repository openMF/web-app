/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';

/**
 * Create savings account transactions component.
 */
@Component({
  selector: 'mifosx-savings-transactions',
  templateUrl: './savings-account-transactions.component.html',
  styleUrls: ['./savings-account-transactions.component.scss']
})
export class SavingsAccountTransactionsComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Savings account transaction form. */
  savingAccountTransactionForm: UntypedFormGroup;
  /** savings account transaction payment options. */
  paymentTypeOptions: {
    id: number;
    name: string;
    description: string;
    isCashPayment: boolean;
    position: number;
  }[];
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag: Boolean = false;
  /** transaction type flag to render required UI */
  transactionType: { deposit: boolean; withdrawal: boolean } = { deposit: false, withdrawal: false };
  /** transaction command for submit request */
  transactionCommand: string;
  /** saving account's Id */
  savingAccountId: string;
  currency: Currency | null = null;

  /**
   * Retrieves the Saving Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SavingsService} savingsService Savings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private savingsService: SavingsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.paymentTypeOptions = data.savingsAccountActionData.paymentTypeOptions;
      if (data.savingsAccountActionData.currency) {
        this.currency = data.savingsAccountActionData.currency;
      }
    });
    this.transactionCommand = this.route.snapshot.params['name'].toLowerCase();
    this.transactionType[this.transactionCommand] = true;
    this.savingAccountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the Saving account transaction form when component loads.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createSavingAccountTransactionForm();
  }

  /**
   * Method to create the Saving Account Transaction Form.
   */
  createSavingAccountTransactionForm() {
    this.savingAccountTransactionForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transactionAmount: [
        0,
        Validators.required
      ],
      paymentTypeId: [''],
      note: ['']
    });
  }

  /**
   * Method to add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.addPaymentDetailsFlag = !this.addPaymentDetailsFlag;
    if (this.addPaymentDetailsFlag) {
      this.savingAccountTransactionForm.addControl('accountNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('checkNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('routingCode', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.savingAccountTransactionForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.savingAccountTransactionForm.removeControl('accountNumber');
      this.savingAccountTransactionForm.removeControl('checkNumber');
      this.savingAccountTransactionForm.removeControl('routingCode');
      this.savingAccountTransactionForm.removeControl('receiptNumber');
      this.savingAccountTransactionForm.removeControl('bankNumber');
    }
  }

  /**
   * Method to submit the transaction details.
   */
  submit() {
    const savingAccountTransactionFormData = this.savingAccountTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.savingAccountTransactionForm.value.transactionDate;
    if (savingAccountTransactionFormData.transactionDate instanceof Date) {
      savingAccountTransactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...savingAccountTransactionFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.savingsService
      .executeSavingsAccountTransactionsCommand(this.savingAccountId, this.transactionCommand, data)
      .subscribe((res) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      });
  }
}
