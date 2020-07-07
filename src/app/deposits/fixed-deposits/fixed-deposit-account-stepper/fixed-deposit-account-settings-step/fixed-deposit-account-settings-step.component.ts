/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

/**
 * Fixed Deposits Account Settings Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-settings-step',
  templateUrl: './fixed-deposit-account-settings-step.component.html',
  styleUrls: ['./fixed-deposit-account-settings-step.component.scss']
})
export class FixedDepositAccountSettingsStepComponent implements OnInit, OnChanges {

  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Fixed Deposits Account Settings Form */
  fixedDepositAccountSettingsForm: FormGroup;
  /** Lockin Period Frequency Type Data */
  lockinPeriodFrequencyTypeData: any;
  /** Period Frequency Type Data */
  periodFrequencyTypeData: any;
  /** Pre Closure Penal Data */
  preClosurePenalInterestOnTypeData: any;
  /** Savings Accounts Data */
  savingsAccountsData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositAccountSettingsForm();
    this.buildDependencies();
  }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.fixedDepositAccountSettingsForm.patchValue({
        'minDepositTerm': this.fixedDepositsAccountProductTemplate.minDepositTerm,
        'minDepositTermTypeId': this.fixedDepositsAccountProductTemplate.minDepositTermType ? this.fixedDepositsAccountProductTemplate.minDepositTermType.id : '',
        'inMultiplesOfDepositTerm': this.fixedDepositsAccountProductTemplate.inMultiplesOfDepositTerm,
        'inMultiplesOfDepositTermTypeId': this.fixedDepositsAccountProductTemplate.inMultiplesOfDepositTermType ? this.fixedDepositsAccountProductTemplate.inMultiplesOfDepositTermType.id : '',
        'maxDepositTerm': this.fixedDepositsAccountProductTemplate.maxDepositTerm,
        'maxDepositTermTypeId': this.fixedDepositsAccountProductTemplate.maxDepositTermType ? this.fixedDepositsAccountProductTemplate.maxDepositTermType.id : '',
        'preClosurePenalApplicable': this.fixedDepositsAccountProductTemplate.preClosurePenalApplicable,
        'preClosurePenalInterest': this.fixedDepositsAccountProductTemplate.preClosurePenalInterest,
        'preClosurePenalInterestOnTypeId': this.fixedDepositsAccountProductTemplate.preClosurePenalInterestOnType ? this.fixedDepositsAccountProductTemplate.preClosurePenalInterestOnType.id : ''
      });
      if (this.fixedDepositsAccountProductTemplate.withHoldTax) {
        this.fixedDepositAccountSettingsForm.addControl('withHoldTax', new FormControl(false));
        this.fixedDepositAccountSettingsForm.get('withHoldTax').valueChanges.subscribe((value: boolean) => {
          if (value) {
            this.fixedDepositAccountSettingsForm.addControl('taxGroupId', new FormControl({ value: '', disabled: true }));
            this.fixedDepositAccountSettingsForm.get('taxGroupId').patchValue(this.fixedDepositsAccountProductTemplate.taxGroup && this.fixedDepositsAccountProductTemplate.taxGroup.name);
          } else {
            this.fixedDepositAccountSettingsForm.removeControl('taxGroupId');
          }
        });
        this.fixedDepositAccountSettingsForm.get('withHoldTax').patchValue(this.fixedDepositsAccountTemplate.withHoldTax);
      } else {
        this.fixedDepositAccountSettingsForm.removeControl('withHoldTax');
      }
      this.setOptions();
    }
  }

  ngOnInit() {
    if (this.fixedDepositsAccountTemplate) {
      this.fixedDepositAccountSettingsForm.patchValue({
        'lockinPeriodFrequency': this.fixedDepositsAccountTemplate.lockinPeriodFrequency,
        'lockinPeriodFrequencyType': this.fixedDepositsAccountTemplate.lockinPeriodFrequencyType && this.fixedDepositsAccountTemplate.lockinPeriodFrequencyType.id,
        'transferInterestToSavings': this.fixedDepositsAccountTemplate.transferInterestToSavings
      });
    }
  }

  /**
   * Creates fixed deposits account terms form.
   */
  createFixedDepositAccountSettingsForm() {
    this.fixedDepositAccountSettingsForm = this.formBuilder.group({
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'minDepositTerm': [{value: '', disabled: true}],
      'minDepositTermTypeId': [{ value: '', disabled: true }],
      'inMultiplesOfDepositTerm': [{ value: '', disabled: true }],
      'inMultiplesOfDepositTermTypeId': [{ value: '', disabled: true }],
      'maxDepositTerm': [{ value: '', disabled: true }],
      'maxDepositTermTypeId': [{ value: '', disabled: true }],
      'transferInterestToSavings': [false],
      'preClosurePenalApplicable': [{ value: '', disabled: true }],
      'preClosurePenalInterest': [{ value: '', disabled: true }],
      'preClosurePenalInterestOnTypeId': [{ value: '', disabled: true }]
    });
  }

  /**
   * Subscribes to value changes and sets new form controls accordingly.
   */
  buildDependencies() {
    this.fixedDepositAccountSettingsForm.get('transferInterestToSavings').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.fixedDepositAccountSettingsForm.addControl('linkAccountId', new FormControl('', Validators.required));
        this.fixedDepositAccountSettingsForm.get('linkAccountId').patchValue(this.fixedDepositsAccountTemplate.linkedAccount && this.fixedDepositsAccountTemplate.linkedAccount.id);
      } else {
        this.fixedDepositAccountSettingsForm.removeControl('linkAccountId');
      }
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.lockinPeriodFrequencyTypeData = this.fixedDepositsAccountProductTemplate.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = this.fixedDepositsAccountProductTemplate.periodFrequencyTypeOptions;
    this.savingsAccountsData = this.fixedDepositsAccountProductTemplate.savingsAccounts;
    this.preClosurePenalInterestOnTypeData = this.fixedDepositsAccountProductTemplate.preClosurePenalInterestOnTypeOptions;
  }

  /**
   * Returns fixed deposits account settings form value.
   */
  get fixedDepositAccountSettings() {
    const fixedDepositAccountSettings = this.fixedDepositAccountSettingsForm.getRawValue();
    for (const key in fixedDepositAccountSettings) {
      if (fixedDepositAccountSettings[key] === '' || key === 'taxGroupId') {
        delete fixedDepositAccountSettings[key];
      }
    }
    return fixedDepositAccountSettings;
  }

}
