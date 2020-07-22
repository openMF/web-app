import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-foreclosure',
  templateUrl: './foreclosure.component.html',
  styleUrls: ['./foreclosure.component.scss']
})
export class ForeclosureComponent implements OnInit {


  loanId: any;
  foreclosureForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  foreclosuredata: any;
  paymentTypes: any;


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

  ngOnInit() {
    this.createforeclosureForm();
    this.onChanges();
  }

  createforeclosureForm() {
    this.foreclosureForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'outstandingPrincipalPortion': [{value: '', disabled: true}],
      'outstandingInterestPortion': [{value: '', disabled: true}],
      'outstandingFeeChargesPortion': [{value: '', disabled: true}],
      'outstandingPenaltyChargesPortion': [{value: '', disabled: true}],
      'transactionAmount': [{value: '', disabled: true}],
      'interestAccruedAfterDeath': '',
      'note': ''
    });
  }

  onChanges(): void {
    this.foreclosureForm.get('transactionDate').valueChanges.subscribe(val => {
      this.retrieveLoanForeclosureTemplate(val);
    });

  }

  retrieveLoanForeclosureTemplate(val: any) {
    const dateFormat = 'dd MMMM yyyy';
    const transactionDateFormatted = this.datePipe.transform(val, dateFormat);
    const data = {
      command: 'foreclosure',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      transactionDate: transactionDateFormatted
    };
    this.loanService.getForeclosureData(this.loanId, data)
    .subscribe((response: any) => {
      this.foreclosuredata = response;

      this.foreclosureForm.patchValue({
        outstandingPrincipalPortion: this.foreclosuredata.principalPortion,
        outstandingInterestPortion: this.foreclosuredata.interestPortion,
        outstandingFeeChargesPortion: this.foreclosuredata.feeChargesPortion,
        outstandingPenaltyChargesPortion: this.foreclosuredata.penaltyChargesPortion,
        foreClosureChargesPortion: this.foreclosuredata.foreClosureChargesPortion
      });
      if (this.foreclosuredata.unrecognizedIncomePortion) {
        this.foreclosureForm.patchValue({
          interestAccruedAfterDeath: this.foreclosuredata.unrecognizedIncomePortion
        });
      }
      this.calculateTransactionAmount();
      this.paymentTypes = this.foreclosuredata.paymentTypeOptions;
    });
  }

  calculateTransactionAmount() {
    let transactionAmount = 0;
    transactionAmount += parseFloat(this.foreclosuredata.principalPortion);
    transactionAmount += parseFloat(this.foreclosuredata.interestPortion);
    transactionAmount += parseFloat(this.foreclosuredata.feeChargesPortion);
    transactionAmount += parseFloat(this.foreclosuredata.penaltyChargesPortion);
    this.foreclosureForm.patchValue({
      transactionAmount: transactionAmount
    });
  }

  submit() {
    const transactionDate = this.foreclosureForm.value.transactionDate;
    const dateFormat = 'yyyy-MM-dd';
    this.foreclosureForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const formData = {
      transactionDate: this.foreclosureForm.value.transactionDate,
      locale: 'en',
      dateFormat: dateFormat,
      note: this.foreclosureForm.value.note
    };

    this.loanService.loanForclosureData(this.loanId, formData)
      .subscribe((response: any) => {
        this.router.navigate([`../../general`], { relativeTo: this.route });
      });
    }

}
