/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

/**
 * Recurring Deposits Terms Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-terms-step',
  templateUrl: './recurring-deposits-account-terms-step.component.html',
  styleUrls: ['./recurring-deposits-account-terms-step.component.scss']
})
export class RecurringDepositsAccountTermsStepComponent implements OnInit, OnChanges {

  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Recurring Deposits Account Terms Form */
  recurringDepositAccountTermsForm: FormGroup;
  /** Interest Compounding Period Type Data */
  interestCompoundingPeriodTypeData: any;
  /** Interest Posting Period Type Data */
  interestPostingPeriodTypeData: any;
  /** Interest Calculation Type Data */
  interestCalculationTypeData: any;
  /** Interest Calculation Days in Year Data */
  interestCalculationDaysInYearTypeData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: FormBuilder) {
    this.createRecurringDepositsAccountTermsForm();
  }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.setOptions();
    }
  }

  ngOnInit() {
    if (this.recurringDepositsAccountTemplate.interestCompoundingPeriodType) {
      this.recurringDepositAccountTermsForm.patchValue({
        'interestCompoundingPeriodType': this.recurringDepositsAccountTemplate.interestCompoundingPeriodType.id,
        'interestPostingPeriodType': this.recurringDepositsAccountTemplate.interestPostingPeriodType.id,
        'interestCalculationType': this.recurringDepositsAccountTemplate.interestCalculationType.id,
        'interestCalculationDaysInYearType': this.recurringDepositsAccountTemplate.interestCalculationDaysInYearType.id,
      });
    }
  }

  /**
   * Creates recurring deposits account terms form.
   */
  createRecurringDepositsAccountTermsForm() {
    this.recurringDepositAccountTermsForm = this.formBuilder.group({
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required],
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.interestCompoundingPeriodTypeData = this.recurringDepositsAccountProductTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.recurringDepositsAccountProductTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.recurringDepositsAccountProductTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.recurringDepositsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
  }

  /**
   * Returns recurring deposits account terms form value.
   */
  get recurringDepositAccountTerms() {
    return this.recurringDepositAccountTermsForm.value;
  }

}
