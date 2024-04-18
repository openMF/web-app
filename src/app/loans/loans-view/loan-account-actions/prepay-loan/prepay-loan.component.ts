/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';


/**
 * Loan Prepay Loan Option
 */
@Component({
  selector: 'mifosx-prepay-loan',
  templateUrl: './prepay-loan.component.html',
  styleUrls: ['./prepay-loan.component.scss']
})
export class PrepayLoanComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Types */
  paymentTypes: any;
  /** Principal Portion */
  principalPortion: any;
  /** Interest Portion */
  interestPortion: any;
  /** Show Payment Details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Prepay Loan form. */
  prepayLoanForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  /**
   * Creates the prepay loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.createprepayLoanForm();
    this.setPrepayLoanDetails();
  }

  /**
   * Creates the prepay loan form.
   */
  createprepayLoanForm() {
    this.prepayLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'principal': [{value: '', disabled: true}],
      'interestAmount': [{value: '', disabled: true}, Validators.required],
      'paymentTypeId': [''],
      'note': ['']
    });
  }

  /**
   * Sets the value in the prepay loan form
   */
  setPrepayLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.prepayLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      principal: this.dataObject.principalPortion,
      interestAmount: this.dataObject.interestPortion,
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.prepayLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.prepayLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.prepayLoanForm.removeControl('accountNumber');
      this.prepayLoanForm.removeControl('checkNumber');
      this.prepayLoanForm.removeControl('routingCode');
      this.prepayLoanForm.removeControl('receiptNumber');
      this.prepayLoanForm.removeControl('bankNumber');
    }
  }

  /**
   * Submits the prepay loan form
   */
  submit() {
    const prepayLoanFormData = this.prepayLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.prepayLoanForm.value.transactionDate;
    if (prepayLoanFormData.transactionDate instanceof Date) {
      prepayLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...prepayLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'repayment')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
