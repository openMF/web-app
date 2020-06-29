/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

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
  /** Savings account transaction form. */
  editTransactionForm: FormGroup;
  /** savings account transaction payment options. */
  paymentTypeOptions: {
    id: number,
    name: string,
    description: string,
    isCashPayment: boolean,
    position: number
  }[];
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag: Boolean = false;
  /** saving account's Id */
  savingAccountId: string;
  /** Transaction Template */
  transactionTemplateData: any;

  /**
   * Retrieves the Saving Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SavingsService} savingsService Savings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe DatePipe.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private savingsService: SavingsService) {
    this.route.data.subscribe((data: { savingsAccountTransactionTemplate: any }) => {
      this.transactionTemplateData = data.savingsAccountTransactionTemplate;
      this.paymentTypeOptions = this.transactionTemplateData.paymentTypeOptions;
    });
    this.savingAccountId = this.route.parent.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the Saving account transaction form when component loads.
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
   * Method to create the Saving Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group({
      'transactionDate': ['', Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': [''],
    });
  }

  /**
   * Method to add payment detail fields to the UI.
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
   * Method to submit the transaction details.
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
    this.savingsService.executeSavingsAccountTransactionsCommand(this.savingAccountId, 'modify', transactionData, this.transactionTemplateData.id)
      .subscribe(res => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
