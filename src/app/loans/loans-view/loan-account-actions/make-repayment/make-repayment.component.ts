import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-make-repayment',
  templateUrl: './make-repayment.component.html',
  styleUrls: ['./make-repayment.component.scss']
})
export class MakeRepaymentComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  paymentTypes: any;
  showPenaltyPortionDisplay: boolean;
  principalPortion: any;
  interestPortion: any;
  feeChargesPortion: any;
  processDate: boolean;
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Assign loan Officer form. */
  repaymentLoanForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  /**
   * Creates the assign officer form.
   */
  ngOnInit() {
    this.createprepayLoanForm();
    // this.setPrepayLoanDetails();
  }

  /**
   * Creates the create close form.
   */
  createprepayLoanForm() {
    this.repaymentLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': '',
      'accountNumber': '',
      'chequeNumber': '',
      'routingCode': '',
      'receiptNumber': '',
      'bankNumber': '',
      'note': ''
    });
  }

  setPrepayLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.repaymentLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      transactionDate: new Date(this.dataObject.date)
    });
    if (this.dataObject.penaltyChargesPortion > 0) {
        this.showPenaltyPortionDisplay = true;
    }
    this.feeChargesPortion = this.dataObject.feeChargesPortion;
    this.processDate = true;
  }

  toggleDisplay() {
    this.showPaymentDetails = !(this.showPaymentDetails);
  }

  submit() {
    const transactionDate = this.repaymentLoanForm.value.transactionDate;
    const dateFormat = 'yyyy-MM-dd';
    this.repaymentLoanForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const repaymentForm = {
      locale: 'en',
      dateFormat: dateFormat,
      paymentTypeId: this.repaymentLoanForm.value.paymentTypeId,
      transactionDate: this.repaymentLoanForm.value.transactionDate,
      transactionAmount: this.repaymentLoanForm.value.transactionAmount
    };
    this.loanService.submitLoanActionButton(this.loanId, repaymentForm, 'repayment')
      .subscribe((response: any) => {
        this.router.navigate(['../general'], { relativeTo: this.route });
    });
  }

}
