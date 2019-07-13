import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-loan-product-details-step',
  templateUrl: './loan-product-details-step.component.html',
  styleUrls: ['./loan-product-details-step.component.scss']
})
export class LoanProductDetailsStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;

  loanProductDetailsForm: FormGroup;

  fundData: any;

  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  constructor(private formBuilder: FormBuilder,
              private datePipe: DatePipe) {
    this.createLoanProductDetailsForm();
  }

  ngOnInit() {
    this.fundData = this.loanProductsTemplate.fundOptions;
  }

  createLoanProductDetailsForm() {
    this.loanProductDetailsForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'shortName': ['', Validators.required],
      'description': [''],
      'fundId': [''],
      'startDate': [''],
      'closeDate': [''],
      'includeInBorrowerCycle': [false]
    });
  }

  get loanProductDetails() {
    const prevStartDate: Date = this.loanProductDetailsForm.value.startDate;
    const prevCloseDate: Date = this.loanProductDetailsForm.value.closeDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.loanProductDetailsForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat) || '',
      closeDate: this.datePipe.transform(prevCloseDate, dateFormat) || ''
    });
    return this.loanProductDetailsForm.value;
  }

}
