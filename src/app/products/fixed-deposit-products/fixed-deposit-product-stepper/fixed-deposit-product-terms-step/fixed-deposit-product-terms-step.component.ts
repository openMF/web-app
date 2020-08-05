import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-fixed-deposit-product-terms-step',
  templateUrl: './fixed-deposit-product-terms-step.component.html',
  styleUrls: ['./fixed-deposit-product-terms-step.component.scss']
})
export class FixedDepositProductTermsStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductTermsForm: FormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.fixedDepositProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.fixedDepositProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.fixedDepositProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.fixedDepositProductsTemplate.interestCalculationDaysInYearTypeOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductTermsForm.patchValue({
        'minDepositAmount': this.fixedDepositProductsTemplate.minDepositAmount,
        'depositAmount': this.fixedDepositProductsTemplate.depositAmount,
        'maxDepositAmount': this.fixedDepositProductsTemplate.maxDepositAmount,
      });
    }

    this.fixedDepositProductTermsForm.patchValue({
      'interestCompoundingPeriodType': this.fixedDepositProductsTemplate.interestCompoundingPeriodType.id,
      'interestPostingPeriodType': this.fixedDepositProductsTemplate.interestPostingPeriodType.id,
      'interestCalculationType': this.fixedDepositProductsTemplate.interestCalculationType.id,
      'interestCalculationDaysInYearType': this.fixedDepositProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createFixedDepositProductTermsForm() {
    this.fixedDepositProductTermsForm = this.formBuilder.group({
      'minDepositAmount': [''],
      'depositAmount': ['', Validators.required],
      'maxDepositAmount': [''],
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required]
    });
  }

  get fixedDepositProductTerms() {
    const fixedDepositProductTerms = this.fixedDepositProductTermsForm.value;
    for (const key in fixedDepositProductTerms) {
      if (fixedDepositProductTerms[key] === '') {
        delete fixedDepositProductTerms[key];
      }
    }
    return fixedDepositProductTerms;
  }

}
