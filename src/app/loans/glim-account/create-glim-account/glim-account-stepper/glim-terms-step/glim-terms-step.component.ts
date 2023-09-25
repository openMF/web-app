import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormArray } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-glim-terms-step',
  templateUrl: './glim-terms-step.component.html',
  styleUrls: ['./glim-terms-step.component.scss']
})
export class GlimTermsStepComponent implements OnInit, OnChanges {

  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Loans Account Terms Form */
  loansAccountTermsForm: UntypedFormGroup;
  /** Term Frequency Type Data */
  termFrequencyTypeData: any;
  /** Repayment Frequency Nth Day Type Data */
  repaymentFrequencyNthDayTypeData: any;
  /** Repayment Frequency Days of Week Type Data */
  repaymentFrequencyDaysOfWeekTypeData: any;
  /** Interest Type Data */
  interestTypeData: any;
  /** Amortization Type Data */
  amortizationTypeData: any;
  /** Interest Calculation Period Type Data */
  interestCalculationPeriodTypeData: any;
  /** Transaction Processing Strategy Data */
  transactionProcessingStrategyData: any;
  /** Client Active Loan Data */
  clientActiveLoanData: any;

  /**
   * Create Loans Account Terms Form
   * @param formBuilder FormBuilder
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: UntypedFormBuilder,
      private settingsService: SettingsService) {
    this.createloansAccountTermsForm();
  }
  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.loansAccountTermsForm.patchValue({
        'principal': this.loansAccountProductTemplate.principal,
        'loanTermFrequency': this.loansAccountProductTemplate.termFrequency,
        'loanTermFrequencyType': this.loansAccountProductTemplate.termPeriodFrequencyType.id,
        'numberOfRepayments': this.loansAccountProductTemplate.numberOfRepayments,
        'repaymentEvery': this.loansAccountProductTemplate.repaymentEvery,
        'repaymentFrequencyType': this.loansAccountProductTemplate.repaymentFrequencyType.id,
        'interestRatePerPeriod': this.loansAccountProductTemplate.interestRatePerPeriod,
        'interestType': this.loansAccountProductTemplate.interestType.id,
        'interestCalculationPeriodType': this.loansAccountProductTemplate.interestCalculationPeriodType.id,
        'transactionProcessingStrategyCode': this.loansAccountProductTemplate.transactionProcessingStrategyCode,
      });
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.loansAccountTemplate) {
      if (this.loansAccountTemplate.loanProductId) {
        this.loansAccountTermsForm.patchValue({
          'repaymentsStartingFromDate': this.loansAccountTemplate.expectedFirstRepaymentOnDate && new Date(this.loansAccountTemplate.expectedFirstRepaymentOnDate)
        });
      }
    }
    this.createloansAccountTermsForm();
    this.setCustomValidators();
  }

  /** Custom Validators for the form */
  setCustomValidators() {
    const repaymentFrequencyNthDayType = this.loansAccountTermsForm.get('repaymentFrequencyNthDayType');
    const repaymentFrequencyDayOfWeekType = this.loansAccountTermsForm.get('repaymentFrequencyDayOfWeekType');

    this.loansAccountTermsForm.get('repaymentFrequencyType').valueChanges
      .subscribe(repaymentFrequencyType => {

        if (repaymentFrequencyType === 2) {
          repaymentFrequencyNthDayType.setValidators([Validators.required]);
          repaymentFrequencyDayOfWeekType.setValidators([Validators.required]);
        } else {
          repaymentFrequencyNthDayType.setValidators(null);
          repaymentFrequencyDayOfWeekType.setValidators(null);
        }

        repaymentFrequencyNthDayType.updateValueAndValidity();
        repaymentFrequencyDayOfWeekType.updateValueAndValidity();
      });
  }

  /** Create Loans Account Terms Form */
  createloansAccountTermsForm() {
    this.loansAccountTermsForm = this.formBuilder.group({
      'principal': ['', Validators.required],
      'loanTermFrequency': ['', Validators.required],
      'loanTermFrequencyType': ['', Validators.required],
      'numberOfRepayments': ['', Validators.required],
      'repaymentEvery': ['', Validators.required],
      'repaymentFrequencyType': ['', Validators.required],
      'repaymentFrequencyNthDayType': [''],
      'repaymentFrequencyDayOfWeekType': [''],
      'repaymentsStartingFromDate': [''],
      'interestChargedFromDate': [''],
      'interestRatePerPeriod': [''],
      'interestType': [''],
      'interestCalculationPeriodType': [''],
      'transactionProcessingStrategyCode': ['']
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.termFrequencyTypeData = this.loansAccountProductTemplate.termFrequencyTypeOptions;
    this.repaymentFrequencyNthDayTypeData = this.loansAccountProductTemplate.repaymentFrequencyNthDayTypeOptions;
    this.repaymentFrequencyDaysOfWeekTypeData = this.loansAccountProductTemplate.repaymentFrequencyDaysOfWeekTypeOptions;
    this.interestTypeData = this.loansAccountProductTemplate.interestTypeOptions;
    this.amortizationTypeData = this.loansAccountProductTemplate.amortizationTypeOptions;
    this.interestCalculationPeriodTypeData = this.loansAccountProductTemplate.interestCalculationPeriodTypeOptions;
    this.transactionProcessingStrategyData = this.loansAccountProductTemplate.transactionProcessingStrategyOptions;
    this.clientActiveLoanData = this.loansAccountProductTemplate.clientActiveLoanOptions;
  }

  /**
   * Returns loans account terms form value.
   */
  get loansAccountTerms() {
    return this.loansAccountTermsForm.value;
  }

}
