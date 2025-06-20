/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Transaction component.
 */
@Component({
  selector: 'mifosx-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatSlideToggle
  ]
})
export class EditTransactionComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Loans account transaction form. */
  editTransactionForm: UntypedFormGroup;
  /** loans account transaction payment options. */
  paymentTypeOptions: {
    id: number;
    name: string;
    description: string;
    isCashPayment: boolean;
    position: number;
  }[];
  /** Flag to enable payment details fields. */
  showPaymentDetails: Boolean = false;
  /** loan account's Id */
  loanAccountId: string;
  /** Transaction Template */
  transactionTemplateData: any;
  currency: Currency;

  /**
   * Retrieves the Loan Account transaction template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
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
    private loansService: LoansService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { loansAccountTransactionTemplate: any }) => {
      this.transactionTemplateData = data.loansAccountTransactionTemplate;
      if (data.loansAccountTransactionTemplate.currency) {
        this.currency = data.loansAccountTransactionTemplate.currency;
      }
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
      transactionDate: this.transactionTemplateData.date && new Date(this.transactionTemplateData.date),
      transactionAmount: this.transactionTemplateData.amount,
      externalId: this.transactionTemplateData.externalId,
      paymentTypeId: this.transactionTemplateData.paymentTypeId
    });
  }

  /**
   * Method to create the Loan Account Transaction Form.
   */
  createEditTransactionForm() {
    this.editTransactionForm = this.formBuilder.group({
      transactionDate: [
        '',
        Validators.required
      ],
      transactionAmount: [
        '',
        Validators.required
      ],
      externalId: [''],
      paymentTypeId: ['']
    });
  }

  /**
   * Method to add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.editTransactionForm.addControl('accountNumber', new UntypedFormControl(''));
      this.editTransactionForm.addControl('checkNumber', new UntypedFormControl(''));
      this.editTransactionForm.addControl('routingCode', new UntypedFormControl(''));
      this.editTransactionForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.editTransactionForm.addControl('bankNumber', new UntypedFormControl(''));
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
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loansService
      .executeLoansAccountTransactionsCommand(this.loanAccountId, 'modify', data, this.transactionTemplateData.id)
      .subscribe((res: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
