/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Service. */
import { LoansService } from 'app/loans/loans.service';

/**
 * Disburse To Savings component.
 */
@Component({
  selector: 'mifosx-disburse-loan-account',
  templateUrl: './disburse-loan-account.component.html',
  styleUrls: ['./disburse-loan-account.component.scss']
})
export class DisburseLoanAccountComponent implements OnInit {

  @Input() dataObject: any;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan form. */
  disbursementForm: FormGroup;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder FormBuilder.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {DatePipe} datePipe DatePipe.
   * @param {LoansService} loanService Loan Service.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private loanService: LoansService) { }

  ngOnInit() {
    this.setDisbursementToSavingsForm();
  }

  /**
   * Set Disbursement Loan form.
   */
  setDisbursementToSavingsForm() {
    this.disbursementForm = this.formBuilder.group({
      'actualDisbursementDate': [new Date(), Validators.required],
      'transactionAmount': [this.dataObject.amount, Validators.required],
      'note': ['', Validators.required]
    });
    if (this.dataObject.fixedEmiAmount !== null || this.dataObject.fixedEmiAmount !== undefined) {
      this.disbursementForm.addControl('fixedEmiAmount', new FormControl(this.dataObject.fixedEmiAmount, [Validators.required]));
    }
  }

  /**
   * Submit Disburse Form.
   */
  submit() {
    const actualDisbursementDate = this.disbursementForm.value.actualDisbursementDate;
    const dateFormat = 'dd MMMM yyyy';
    this.disbursementForm.patchValue({
      actualDisbursementDate: this.datePipe.transform(actualDisbursementDate, dateFormat)
    });
    const loanId = this.route.parent.snapshot.params['loanId'];
    const disbursementForm = this.disbursementForm.value;
    disbursementForm.locale = 'en';
    disbursementForm.dateFormat = dateFormat;
    this.loanService.loanActionButtons(loanId, 'disbursetosavings', disbursementForm).subscribe((response: any) => {
      this.router.navigate(['../../general'], {relativeTo: this.route});
    });
  }

}
