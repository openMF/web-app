/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';

/**
 * Fixed Deposits Terms Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-terms-step',
  templateUrl: './fixed-deposit-account-terms-step.component.html',
  styleUrls: ['./fixed-deposit-account-terms-step.component.scss']
})
export class FixedDepositAccountTermsStepComponent implements OnInit, OnChanges {

  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Fixed Deposits Account Terms Form */
  fixedDepositAccountTermsForm: FormGroup;
  /** Interest Compounding Period Type Data */
  interestCompoundingPeriodTypeData: any;
  /** Interest Posting Period Type Data */
  interestPostingPeriodTypeData: any;
  /** Interest Calculation Type Data */
  interestCalculationTypeData: any;
  /** Interest Calculation Days in Year Data */
  interestCalculationDaysInYearTypeData: any;
   /** Period Frequency Type Data */
  periodFrequencyTypeData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositsAccountTermsForm();
  }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.setOptions();
    }
  }

  ngOnInit() {
    if (this.fixedDepositsAccountTemplate.interestCompoundingPeriodType) {
      this.fixedDepositAccountTermsForm.patchValue({
        'interestCompoundingPeriodType': this.fixedDepositsAccountTemplate.interestCompoundingPeriodType.id,
        'interestPostingPeriodType': this.fixedDepositsAccountTemplate.interestPostingPeriodType.id,
        'interestCalculationType': this.fixedDepositsAccountTemplate.interestCalculationType.id,
        'interestCalculationDaysInYearType': this.fixedDepositsAccountTemplate.interestCalculationDaysInYearType.id,
        'depositAmount': this.fixedDepositsAccountTemplate.depositAmount,
        'depositPeriod': this.fixedDepositsAccountTemplate.depositPeriod,
        'depositPeriodFrequencyId': this.fixedDepositsAccountTemplate.depositPeriodFrequency.id,
      });
    }
  }

  /**
   * Creates fixed deposits account terms form.
   */
  createFixedDepositsAccountTermsForm() {
    this.fixedDepositAccountTermsForm = this.formBuilder.group({
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required],
      'depositAmount': ['', Validators.required],
      'depositPeriod': ['', Validators.required],
      'depositPeriodFrequencyId': ['', Validators.required]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.interestCompoundingPeriodTypeData = this.fixedDepositsAccountProductTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.fixedDepositsAccountProductTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.fixedDepositsAccountProductTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.fixedDepositsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
    this.periodFrequencyTypeData = this.fixedDepositsAccountProductTemplate.periodFrequencyTypeOptions;
  }

  /**
   * Returns fixed deposits account terms form value.
   */
  get fixedDepositAccountTerms() {
    const fixedDepositAccountTerms = this.fixedDepositAccountTermsForm.value;
    for (const key in fixedDepositAccountTerms) {
      if (fixedDepositAccountTerms[key] === '') {
        delete fixedDepositAccountTerms[key];
      }
    }
    return fixedDepositAccountTerms;
  }

}
