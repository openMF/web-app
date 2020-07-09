/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';

/**
 * Edit Transaction component.
 */
@Component({
  selector: 'mifosx-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss']
})
export class EditTransactionComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Recurring Deposits transaction form. */
  editTransactionForm: FormGroup;
  /** Recurring Deposits transaction payment options. */
  paymentTypeOptions: {
    id: number,
    name: string,
    description: string,
    isCashPayment: boolean,
    position: number
  }[];
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag: Boolean = false;
  /** Recurring deposit account's Id */
  recurringDepositAccountId: string;
  /** Transaction Template */
  transactionTemplateData: any;

  /**
   * Retrieves the Recurring Deposit Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe DatePipe.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private recurringDepositsService: RecurringDepositsService) {
    this.route.data.subscribe((data: { recurringDepositsAccountTransactionTemplate: any }) => {
      this.transactionTemplateData = data.recurringDepositsAccountTransactionTemplate;
      this.paymentTypeOptions = this.transactionTemplateData.paymentTypeOptions;
    });
    this.recurringDepositAccountId = this.route.parent.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the Recurring Deposits account transaction form when component loads.
   */
  ngOnInit() {
    this.createEditTransactionForm();
    this.editTransactionForm.patchValue({
      'transactionDate': this.transactionTemplateData.date && new Date(this.transactionTemplateData.date),
      'transactionAmount': this.transactionTemplateData.amount,
      'paymentTypeId': this.transactionTemplateData.paymentTypeId
    });
  }

  /**
   * Create Edit Recurring Deposit Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group({
      'transactionDate': ['', Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': [''],
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.addPaymentDetailsFlag = !this.addPaymentDetailsFlag;
    if (this.addPaymentDetailsFlag) {
      this.editTransactionForm.addControl('accountNumber', new FormControl(''));
      this.editTransactionForm.addControl('checkNumber', new FormControl(''));
      this.editTransactionForm.addControl('routingCode', new FormControl(''));
      this.editTransactionForm.addControl('receiptNumber', new FormControl(''));
      this.editTransactionForm.addControl('bankNumber', new FormControl(''));
    } else {
      this.editTransactionForm.removeControl('accountNumber');
      this.editTransactionForm.removeControl('checkNumber');
      this.editTransactionForm.removeControl('routingCode');
      this.editTransactionForm.removeControl('receiptNumber');
      this.editTransactionForm.removeControl('bankNumber');
    }
  }

  /**
   * Submit the transaction details.
   */
  submit() {
    const prevTransactionDate: Date = this.editTransactionForm.value.transactionDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MM-yyyy';
    this.editTransactionForm.patchValue({
      transactionDate: this.datePipe.transform(prevTransactionDate, dateFormat)
    });
    const transactionData = this.editTransactionForm.value;
    transactionData.locale = 'en';
    transactionData.dateFormat = dateFormat;
    this.recurringDepositsService.executeRecurringDepositsAccountTransactionsCommand(this.recurringDepositAccountId, 'modify', transactionData, this.transactionTemplateData.id)
      .subscribe(res => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
