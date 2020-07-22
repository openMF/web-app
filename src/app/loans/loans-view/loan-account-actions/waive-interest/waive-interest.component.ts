/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';

/**
 * Waive Interest component.
 */
@Component({
  selector: 'mifosx-waive-interest',
  templateUrl: './waive-interest.component.html',
  styleUrls: ['./waive-interest.component.scss']
})
export class WaiveInterestComponent implements OnInit {

  @Input() dataObject: any;

  /** Loan Interest form. */
  loanInterestForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Router} router Router.
   * @param {DatePipe} datePipe DatePipe.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private datePipe: DatePipe,
              private loanService: LoansService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.setLoanInterestForm();
  }

  /**
   * Set Loan Interest form.
   */
  setLoanInterestForm() {
    this.loanInterestForm = this.formBuilder.group({
      'transactionAmount': [this.dataObject.amount, Validators.required],
      'transactionDate': [this.dataObject.date && new Date(this.dataObject.date), Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits loan interest form.
   */
  submit() {
    const transactionDate = this.loanInterestForm.value.transactionDate;
    const transactionAmount = this.loanInterestForm.value.transactionAmount;
    const dateFormat = 'dd MMMM yyyy';
    this.loanInterestForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat),
      transactionAmount: parseInt(transactionAmount, 10)
    });
    const loanId = this.route.parent.snapshot.params['loanId'];
    const loanInterestForm = this.loanInterestForm.value;
    loanInterestForm.locale = 'en';
    loanInterestForm.dateFormat = dateFormat;
    this.loanService.submitLoanActionButton(loanId, loanInterestForm, 'waiveinterest').subscribe((response: any) => {
      this.router.navigate(['../../general'], {relativeTo: this.route});
    });
  }

}
