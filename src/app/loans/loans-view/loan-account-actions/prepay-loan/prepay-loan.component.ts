/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DatePipe } from '@angular/common';

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
  prepayLoanForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe.
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
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
      this.prepayLoanForm.addControl('accountNumber', new FormControl(''));
      this.prepayLoanForm.addControl('checkNumber', new FormControl(''));
      this.prepayLoanForm.addControl('routingCode', new FormControl(''));
      this.prepayLoanForm.addControl('receiptNumber', new FormControl(''));
      this.prepayLoanForm.addControl('bankNumber', new FormControl(''));
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
    const prevTransactionDate: Date = this.prepayLoanForm.value.transactionDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MM-yyyy';
    this.prepayLoanForm.patchValue({
      transactionDate: this.datePipe.transform(prevTransactionDate, dateFormat)
    });
    const prepayLoanData = this.prepayLoanForm.value;
    prepayLoanData.locale = 'en';
    prepayLoanData.dateFormat = dateFormat;
    this.loanService.submitLoanActionButton(this.loanId, prepayLoanData, 'repayment')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
