import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-saving-product-terms-step',
  templateUrl: './saving-product-terms-step.component.html',
  styleUrls: ['./saving-product-terms-step.component.scss']
})
export class SavingProductTermsStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;

  savingProductTermsForm: FormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createSavingProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.savingProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.savingProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.savingProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.savingProductsTemplate.interestCalculationDaysInYearTypeOptions;

    this.savingProductTermsForm.patchValue({
      'nominalAnnualInterestRate': this.savingProductsTemplate.nominalAnnualInterestRate,
      'interestCompoundingPeriodType': this.savingProductsTemplate.interestCompoundingPeriodType.id,
      'interestPostingPeriodType': this.savingProductsTemplate.interestPostingPeriodType.id,
      'interestCalculationType': this.savingProductsTemplate.interestCalculationType.id,
      'interestCalculationDaysInYearType': this.savingProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createSavingProductTermsForm() {
    this.savingProductTermsForm = this.formBuilder.group({
      'nominalAnnualInterestRate': ['', Validators.required],
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required]
    });
  }

  get savingProductTerms() {
    return this.savingProductTermsForm.value;
  }

}
