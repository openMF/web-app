import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LoansService } from '../../loans.service';

@Component({
  selector: 'mifosx-make-repayments',
  templateUrl: './make-repayments.component.html',
  styleUrls: ['./make-repayments.component.scss']
})
export class MakeRepaymentsComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Repayment Form. */
  makeRepaymentForm: FormGroup;
  /** Loan Transaction Template Data. */
  loanAccountData: any;
  /** Boolean indicates if Payment Detail section is expanded or not. */
  isExpanded = false;

  constructor(private route: ActivatedRoute,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private loansService: LoansService,
    private router: Router
    ) { }

  ngOnInit() {
    /** GET loan account data and initialize repayment form */
    this.route.data.subscribe((data: { loanTransactionTemplate: any}) => {
      this.loanAccountData = data.loanTransactionTemplate;
      this.createMakeRepaymentForm(this.loanAccountData);
    });
  }
  createMakeRepaymentForm(loanAccountData: any) {
    this.makeRepaymentForm = this.formBuilder.group({
      'transactionDate': [this.datePipe.transform(loanAccountData.date, 'yyyy-MM-dd'), Validators.required],
      'transactionAmount': [loanAccountData.amount, Validators.required],
      'paymentTypeId': [loanAccountData.paymentTypeOptions[0].id],
      'accountNumber': [''],
      /** TODO: Replace check with cheque once spelling is fixed at Server End of API */
      'checkNumber': [''],
      'routingCode': [''],
      'receiptNumber': [''],
      'bankNumber': [''],
      'note': [''],
    });
  }
  submit() {
    /** Date format and locale as mentioned in API doc */
    const dateFormat = 'dd MMMM yyyy';
    const locale = 'en';
    /** Format date selected using datePicker */
    const unformattedDate = this.makeRepaymentForm.value.transactionDate;
    this.makeRepaymentForm.patchValue({
      transactionDate: this.datePipe.transform(unformattedDate, dateFormat)
    });
    /** Set final payload data */
    const makeRepaymentData = this.makeRepaymentForm.value;
    const loanId = this.route.snapshot.params.loanId;
    makeRepaymentData.locale = locale;
    makeRepaymentData.dateFormat = dateFormat;
    /** POST repayment data  and redirect to previous page on success */
    this.loansService.makeRepayment(loanId, makeRepaymentData).subscribe(res => {
    this.router.navigate(['../'], { relativeTo: this.route });
  });
  }
}
