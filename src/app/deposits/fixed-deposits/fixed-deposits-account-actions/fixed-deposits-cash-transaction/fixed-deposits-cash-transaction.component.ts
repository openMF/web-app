import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { FixedDepositsService } from '../../fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Currency, PaymentType } from 'app/shared/models/general.model';
import { TransactionCommand, TransactionTypeFlags } from '../../../transaction.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposits-cash-transaction',
  templateUrl: './fixed-deposits-cash-transaction.component.html',
  styleUrls: ['./fixed-deposits-cash-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle,
    CdkTextareaAutosize
  ]
})
export class FixedDepositsCashTransactionComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Savings account transaction form. */
  accountTransactionForm: UntypedFormGroup;
  /** savings account transaction payment options. */
  paymentTypeOptions: PaymentType[] = [];
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag: Boolean = false;
  /** transaction type flag to render required UI */
  transactionType: TransactionTypeFlags = { deposit: false, withdrawal: false };
  /** transaction command for submit request */
  transactionCommand: TransactionCommand;
  actionName: string;
  /** saving account's Id */
  accountId: string;
  currency: Currency;

  /**
   * Retrieves the Saving Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposit Service.
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
    private fixedDepositsService: FixedDepositsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { fixedDepositsAccountActionData: any }) => {
      this.currency = data.fixedDepositsAccountActionData.currency;
      this.paymentTypeOptions = data.fixedDepositsAccountActionData.paymentTypeOptions;
    });
    this.actionName = this.route.snapshot.params['name'];
    const lowerName = this.actionName.toLowerCase();
    if (lowerName === 'deposit' || lowerName === 'withdrawal') {
      this.transactionCommand = lowerName;
      this.transactionType[this.transactionCommand] = true;
    } else {
      throw new Error(`Invalid transaction action: ${this.actionName}`);
    }

    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
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
    this.accountTransactionForm = this.formBuilder.group({
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
      this.accountTransactionForm.addControl('accountNumber', new UntypedFormControl(''));
      this.accountTransactionForm.addControl('checkNumber', new UntypedFormControl(''));
      this.accountTransactionForm.addControl('routingCode', new UntypedFormControl(''));
      this.accountTransactionForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.accountTransactionForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.accountTransactionForm.removeControl('accountNumber');
      this.accountTransactionForm.removeControl('checkNumber');
      this.accountTransactionForm.removeControl('routingCode');
      this.accountTransactionForm.removeControl('receiptNumber');
      this.accountTransactionForm.removeControl('bankNumber');
    }
  }

  /**
   * Method to submit the transaction details.
   */
  submit() {
    const savingAccountTransactionFormData = this.accountTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.accountTransactionForm.value.transactionDate;
    if (savingAccountTransactionFormData.transactionDate instanceof Date) {
      savingAccountTransactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...savingAccountTransactionFormData,
      dateFormat,
      locale
    };
    delete data.note;
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.fixedDepositsService
      .executeFixedDepositsAccountTransactionsCommand(this.accountId, this.transactionCommand, data)
      .subscribe((res) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      });
  }
}
