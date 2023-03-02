/** Angular Imports */
import { Component, OnChanges, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Savings Account Terms Step
 */
@Component({
  selector: 'mifosx-savings-account-terms-step',
  templateUrl: './savings-account-terms-step.component.html',
  styleUrls: ['./savings-account-terms-step.component.scss']
})
export class SavingsAccountTermsStepComponent implements OnChanges, OnInit {

  /** Savings Account and Product Template */
  @Input() savingsAccountProductTemplate: any;
  /** Savings Account Template */
  @Input() savingsAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Savings Account Terms Form */
  savingsAccountTermsForm: FormGroup;
  /** Lockin Period Frequency Type Data */
  lockinPeriodFrequencyTypeData: any;
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
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
    private settingsService: SettingsService) {
    this.createSavingsAccountTermsForm();
    this.buildDependencies();
  }

  ngOnChanges() {
    if (this.savingsAccountProductTemplate) {
      this.savingsAccountTermsForm.patchValue({
        'currencyCode': this.savingsAccountProductTemplate.currency.code,
        'decimal': this.savingsAccountProductTemplate.currency.decimalPlaces,
        'minBalanceForInterestCalculation': this.savingsAccountProductTemplate.minBalanceForInterestCalculation,
        'nominalAnnualInterestRate': this.savingsAccountProductTemplate.nominalAnnualInterestRate,
        'interestCompoundingPeriodType': this.savingsAccountProductTemplate.interestCompoundingPeriodType.id,
        'interestPostingPeriodType': this.savingsAccountProductTemplate.interestPostingPeriodType.id,
        'interestCalculationType': this.savingsAccountProductTemplate.interestCalculationType.id,
        'interestCalculationDaysInYearType': this.savingsAccountProductTemplate.interestCalculationDaysInYearType.id,
        'minRequiredOpeningBalance': this.savingsAccountProductTemplate.minRequiredOpeningBalance,
        'allowOverdraft': this.savingsAccountProductTemplate.allowOverdraft,
        'overdraftLimit': this.savingsAccountProductTemplate.overdraftLimit,
        'enforceMinRequiredBalance': this.savingsAccountProductTemplate.enforceMinRequiredBalance,
        'minOverdraftForInterestCalculation': this.savingsAccountProductTemplate.minOverdraftForInterestCalculation,
        'nominalAnnualInterestRateOverdraft': this.savingsAccountProductTemplate.nominalAnnualInterestRateOverdraft,
        'minRequiredBalance': this.savingsAccountProductTemplate.minRequiredBalance,
        'withdrawalFeeForTransfers': this.savingsAccountProductTemplate.withdrawalFeeForTransfers
      });
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.savingsAccountTemplate) {
      this.savingsAccountTermsForm.patchValue({
        'nominalAnnualInterestRate': this.savingsAccountTemplate.nominalAnnualInterestRate,
        'interestCompoundingPeriodType': this.savingsAccountTemplate.interestCompoundingPeriodType.id,
        'interestPostingPeriodType': this.savingsAccountTemplate.interestPostingPeriodType.id,
        'interestCalculationType': this.savingsAccountTemplate.interestCalculationType.id,
        'interestCalculationDaysInYearType': this.savingsAccountTemplate.interestCalculationDaysInYearType.id,
        'minRequiredOpeningBalance': this.savingsAccountTemplate.minRequiredOpeningBalance,
        'withdrawalFeeForTransfers': this.savingsAccountTemplate.withdrawalFeeForTransfers,
        'lockinPeriodFrequency': this.savingsAccountTemplate.lockinPeriodFrequency,
        'lockinPeriodFrequencyType': this.savingsAccountTemplate.lockinPeriodFrequencyType && this.savingsAccountTemplate.lockinPeriodFrequencyType.id,
        'allowOverdraft': this.savingsAccountTemplate.allowOverdraft,
        'enforceMinRequiredBalance': this.savingsAccountTemplate.enforceMinRequiredBalance,
        'minRequiredBalance': this.savingsAccountTemplate.minRequiredBalance,
      });
    }
  }

  /**
   * Creates savings account terms form.
   */
  createSavingsAccountTermsForm() {
    this.savingsAccountTermsForm = this.formBuilder.group({
      'currencyCode': [{value: '', disabled: true}],
      'decimal': [{value: '',  disabled: true}],
      'nominalAnnualInterestRate': ['', Validators.required],
      'interestCompoundingPeriodType': ['', Validators.required],
      'interestPostingPeriodType': ['', Validators.required],
      'interestCalculationType': ['', Validators.required],
      'interestCalculationDaysInYearType': ['', Validators.required],
      'minRequiredOpeningBalance': [''],
      'withdrawalFeeForTransfers': [false],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'allowOverdraft': [false],
      'enforceMinRequiredBalance': [false],
      'minRequiredBalance': [''],
      'minBalanceForInterestCalculation': [{value: '', disabled: true}]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.lockinPeriodFrequencyTypeData = this.savingsAccountProductTemplate.lockinPeriodFrequencyTypeOptions;
    this.interestCompoundingPeriodTypeData = this.savingsAccountProductTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.savingsAccountProductTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.savingsAccountProductTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.savingsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
  }

  /**
   * Subscribes to value changes and sets new form controls accordingly.
   */
  buildDependencies() {
    this.savingsAccountTermsForm.get('allowOverdraft').valueChanges.subscribe((allowOverdraft: any) => {
      if (allowOverdraft) {
        this.savingsAccountTermsForm.addControl('minOverdraftForInterestCalculation', new FormControl(''));
        this.savingsAccountTermsForm.addControl('nominalAnnualInterestRateOverdraft', new FormControl(''));
        this.savingsAccountTermsForm.addControl('overdraftLimit', new FormControl(''));
      } else {
        this.savingsAccountTermsForm.removeControl('minOverdraftForInterestCalculation');
        this.savingsAccountTermsForm.removeControl('nominalAnnualInterestRateOverdraft');
        this.savingsAccountTermsForm.removeControl('overdraftLimit');
      }
    });
  }

  /**
   * Returns savings account terms form value.
   */
  get savingsAccountTerms() {
    const payload = this.savingsAccountTermsForm.getRawValue();
    delete payload.currencyCode;
    delete payload.decimal;
    return payload;
  }

}
