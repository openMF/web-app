/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DatePipe } from '@angular/common';

/**
 * Withdrawn By Applicant Loan Form
 */
@Component({
  selector: 'mifosx-withdrawn-by-client',
  templateUrl: './withdrawn-by-client.component.html',
  styleUrls: ['./withdrawn-by-client.component.scss']
})
export class WithdrawnByClientComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Withdrawn By Applicant Loan Form */
  withdrawnByClientLoanForm: FormGroup;

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
   * Creates the withdraw by Applicant loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.createWithdrawnByClientLoanForm();
  }

  /**
   * Creates the create withdraw by applicant form.
   */
  createWithdrawnByClientLoanForm() {
    this.withdrawnByClientLoanForm = this.formBuilder.group({
      'withdrawnOnDate': [new Date(), Validators.required],
      'note': ''
    });
  }

  /** Submits the withdraw by appplicant form */
  submit() {
    const prevTransactionDate: Date = this.withdrawnByClientLoanForm.value.withdrawnOnDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MM-yyyy';
    this.withdrawnByClientLoanForm.patchValue({
      withdrawnOnDate: this.datePipe.transform(prevTransactionDate, dateFormat)
    });
    const WithdrawnByClientLoanData = this.withdrawnByClientLoanForm.value;
    WithdrawnByClientLoanData.locale = 'en';
    WithdrawnByClientLoanData.dateFormat = dateFormat;
    this.loanService.loanActionButtons(this.loanId, 'withdrawnByApplicant', WithdrawnByClientLoanData)
      .subscribe((response: any) => {
        this.router.navigate(['../../../general'], { relativeTo: this.route });
      });
  }

}
