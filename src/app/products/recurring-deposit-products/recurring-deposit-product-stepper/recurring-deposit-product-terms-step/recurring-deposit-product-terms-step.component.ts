import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-recurring-deposit-product-terms-step',
  templateUrl: './recurring-deposit-product-terms-step.component.html',
  styleUrls: ['./recurring-deposit-product-terms-step.component.scss']
})
export class RecurringDepositProductTermsStepComponent implements OnInit {

  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductTermsForm: FormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createrecurringDepositProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.recurringDepositProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.recurringDepositProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.recurringDepositProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.recurringDepositProductsTemplate.interestCalculationDaysInYearTypeOptions;

    this.recurringDepositProductTermsForm.patchValue({
      'interestCompoundingPeriodType': this.recurringDepositProductsTemplate.interestCompoundingPeriodType.id,
      'interestPostingPeriodType': this.recurringDepositProductsTemplate.interestPostingPeriodType.id,
      'interestCalculationType': this.recurringDepositProductsTemplate.interestCalculationType.id,
      'interestCalculationDaysInYearType': this.recurringDepositProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createrecurringDepositProductTermsForm() {
    this.recurringDepositProductTermsForm = this.formBuilder.group({
      'minDepositAmount': [''],
      'depositAmount': ['', Validators.required],
      'maxDepositAmount': [''],
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required]
    });
  }

  get recurringDepositProductTerms() {
    const recurringDepositProductTerms = this.recurringDepositProductTermsForm.value;
    for (const key in recurringDepositProductTerms) {
      if (recurringDepositProductTerms[key] === '') {
        delete recurringDepositProductTerms[key];
      }
    }
    return recurringDepositProductTerms;
  }

}
