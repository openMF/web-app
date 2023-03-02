/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Close Savings Account Component
 */
@Component({
  selector: 'mifosx-close-savings-account',
  templateUrl: './close-savings-account.component.html',
  styleUrls: ['./close-savings-account.component.scss']
})
export class CloseSavingsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Savings Account form. */
  closeSavingsAccountForm: FormGroup;
  /** Savings Account Id */
  accountId: any;
  /** Flag to enable payment details fields. */
  addPaymentDetailsFlag = false;
  /** Payment Type Options */
  paymentTypeOptions: any;
  /** Transaction Amount */
  transactionAmount: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { savingsAccountActionData: any }) => {
      this.paymentTypeOptions = data.savingsAccountActionData[0].paymentTypeOptions;
      this.transactionAmount = data.savingsAccountActionData[1].summary.accountBalance;
    });
    this.accountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the close savings form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseSavingsAccountForm();
    this.buildDependencies();
  }

  /**
   * Creates the close savings account form.
   */
  createCloseSavingsAccountForm() {
    this.closeSavingsAccountForm = this.formBuilder.group({
      'closedOnDate': ['', Validators.required],
      'withdrawBalance': [false],
      'postInterestValidationOnClosure': [false],
      'note': ['']
    });
  }

  /**
   * Subscribe to value changes of withdraw balance checkbox.
   */
  buildDependencies() {
    this.closeSavingsAccountForm.get('withdrawBalance').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.closeSavingsAccountForm.addControl('amount', new FormControl({value: this.transactionAmount, disabled: true}));
        this.closeSavingsAccountForm.addControl('paymentTypeId', new FormControl(''));
      } else {
        this.closeSavingsAccountForm.removeControl('amount');
        this.closeSavingsAccountForm.removeControl('paymentTypeId');
      }
    });
  }

  /**
   * Method to add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.addPaymentDetailsFlag = !this.addPaymentDetailsFlag;
    if (this.addPaymentDetailsFlag) {
      this.closeSavingsAccountForm.addControl('accountNumber', new FormControl(''));
      this.closeSavingsAccountForm.addControl('checkNumber', new FormControl(''));
      this.closeSavingsAccountForm.addControl('routingCode', new FormControl(''));
      this.closeSavingsAccountForm.addControl('receiptNumber', new FormControl(''));
      this.closeSavingsAccountForm.addControl('bankNumber', new FormControl(''));
    } else {
      this.closeSavingsAccountForm.removeControl('accountNumber');
      this.closeSavingsAccountForm.removeControl('checkNumber');
      this.closeSavingsAccountForm.removeControl('routingCode');
      this.closeSavingsAccountForm.removeControl('receiptNumber');
      this.closeSavingsAccountForm.removeControl('bankNumber');
    }
  }

  /**
   * Submits the form and closes the saving account,
   * if successful redirects to the saving account.
   */
  submit() {
    const closeSavingsAccountFormData = this.closeSavingsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedOnDate: Date = this.closeSavingsAccountForm.value.closedOnDate;
    if (closeSavingsAccountFormData.closedOnDate instanceof Date) {
      closeSavingsAccountFormData.closedOnDate = this.dateUtils.formatDate(prevClosedOnDate, dateFormat);
    }
    const data = {
      ...closeSavingsAccountFormData,
      dateFormat,
      locale
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'close', data).subscribe(() => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}
