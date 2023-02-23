/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

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
  /** Loans account transaction form. */
  editTransactionForm: FormGroup;
  /** loans account transaction payment options. */
  paymentTypeOptions: {
    id: number,
    name: string,
    description: string,
    isCashPayment: boolean,
    position: number
  }[];
  /** Flag to enable payment details fields. */
  showPaymentDetails: Boolean = false;
  /** loan account's Id */
  loanAccountId: string;
  /** Transaction Template */
  transactionTemplateData: any;

  /**
   * Retrieves the Loan Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private loansService: LoansService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { loansAccountTransactionTemplate: any }) => {
      this.transactionTemplateData = data.loansAccountTransactionTemplate;
      this.paymentTypeOptions = this.transactionTemplateData.paymentTypeOptions;
    });
    this.loanAccountId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the Loan account transaction form when component loads.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditTransactionForm();
    this.editTransactionForm.patchValue({
      'transactionDate': this.transactionTemplateData.date && new Date(this.transactionTemplateData.date),
      'transactionAmount': this.transactionTemplateData.amount,
      'externalId': this.transactionTemplateData.externalId,
      'paymentTypeId': this.transactionTemplateData.paymentTypeId
    });
  }

  /**
   * Method to create the Loan Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group({
      'transactionDate': ['', Validators.required],
      'transactionAmount': ['', Validators.required],
      'externalId': [''],
      'paymentTypeId': [''],
    });
  }

  /**
   * Method to add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
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
    const editTransactionFormData = this.editTransactionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.editTransactionForm.value.transactionDate;
    if (editTransactionFormData.transactionDate instanceof Date) {
      editTransactionFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...editTransactionFormData,
      dateFormat,
      locale
    };
    this.loansService.executeLoansAccountTransactionsCommand(this.loanAccountId, 'modify', data, this.transactionTemplateData.id)
      .subscribe((res: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
