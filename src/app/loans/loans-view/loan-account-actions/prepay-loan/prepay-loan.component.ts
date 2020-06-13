import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-prepay-loan',
  templateUrl: './prepay-loan.component.html',
  styleUrls: ['./prepay-loan.component.scss']
})
export class PrepayLoanComponent implements OnInit {

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
  prepayLoanForm: FormGroup;

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
    this.setPrepayLoanDetails();
  }

  /**
   * Creates the create close form.
   */
  createprepayLoanForm() {
    this.prepayLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'principal': [{value: '', disabled: true}],
      'interestAmount': [{value: '', disabled: true}, Validators.required],
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
    this.prepayLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      principal: this.dataObject.principalPortion,
      interestAmount: this.dataObject.interestPortion,
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
    const transactionDate = this.prepayLoanForm.value.transactionDate;
    const dateFormat = 'yyyy-MM-dd';
    this.prepayLoanForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const prepayForm = {
      locale: 'en',
      dateFormat: dateFormat,
      paymentTypeId: this.prepayLoanForm.value.paymentTypeId,
      transactionDate: this.prepayLoanForm.value.transactionDate,
      transactionAmount: this.prepayLoanForm.value.transactionAmount
    };
    this.loanService.submitLoanActionButton(this.loanId, prepayForm, 'repayment')
      .subscribe((response: any) => {
        this.router.navigate(['../general'], { relativeTo: this.route });
    });
  }

}
