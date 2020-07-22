/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DatePipe } from '@angular/common';

/**
 * Loan Recovery Repayment Action
 */
@Component({
  selector: 'mifosx-recovery-repayment',
  templateUrl: './recovery-repayment.component.html',
  styleUrls: ['./recovery-repayment.component.scss']
})
export class RecoveryRepaymentComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Recovery Repayment Loan Form */
  recoveryRepaymentLoanForm: FormGroup;

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
   * Creates the recovery repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.createRecoveryRepaymentLoanForm();
    this.setRecoveryRepaymentLoanDetails();
  }

  /**
   * Creates the recovery repayment loan form
   */
  createRecoveryRepaymentLoanForm() {
    this.recoveryRepaymentLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': [''],
      'note': ['']
    });
  }

  /** Sets Recovery Payment Loan Details */
  setRecoveryRepaymentLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.recoveryRepaymentLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      transactionDate: new Date(this.dataObject.date)
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.recoveryRepaymentLoanForm.addControl('accountNumber', new FormControl(''));
      this.recoveryRepaymentLoanForm.addControl('checkNumber', new FormControl(''));
      this.recoveryRepaymentLoanForm.addControl('routingCode', new FormControl(''));
      this.recoveryRepaymentLoanForm.addControl('receiptNumber', new FormControl(''));
      this.recoveryRepaymentLoanForm.addControl('bankNumber', new FormControl(''));
    } else {
      this.recoveryRepaymentLoanForm.removeControl('accountNumber');
      this.recoveryRepaymentLoanForm.removeControl('checkNumber');
      this.recoveryRepaymentLoanForm.removeControl('routingCode');
      this.recoveryRepaymentLoanForm.removeControl('receiptNumber');
      this.recoveryRepaymentLoanForm.removeControl('bankNumber');
    }
  }

  /** Submits the recovery payment form */
  submit() {
    const prevTransactionDate: Date = this.recoveryRepaymentLoanForm.value.transactionDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MM-yyyy';
    this.recoveryRepaymentLoanForm.patchValue({
      transactionDate: this.datePipe.transform(prevTransactionDate, dateFormat)
    });
    const recoveryRepaymentLoanData = this.recoveryRepaymentLoanForm.value;
    recoveryRepaymentLoanData.locale = 'en';
    recoveryRepaymentLoanData.dateFormat = dateFormat;
    this.loanService.submitLoanActionButton(this.loanId, recoveryRepaymentLoanData, 'recoverypayment')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }

}
