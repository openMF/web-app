/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

/** Custom Services */
import { DatePipe } from '@angular/common';

/**
 * Recurring Deposits Account Settings Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-settings-step',
  templateUrl: './recurring-deposits-account-settings-step.component.html',
  styleUrls: ['./recurring-deposits-account-settings-step.component.scss']
})
export class RecurringDepositsAccountSettingsStepComponent implements OnInit, OnChanges {

  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Recurring Deposits Account Settings Form */
  recurringDepositAccountSettingsForm: FormGroup;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Lockin Period Frequency Type Data */
  lockinPeriodFrequencyTypeData: any;
  /** Period Frequency Type Data */
  periodFrequencyTypeData: any;
  /** Preclosure Penal Interest Type on Data */
  preClosurePenalInterestOnTypeData: any;
  /** Tax Group */
  taxGroup: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: FormBuilder,
    private datePipe: DatePipe) {
    this.createRecurringDepositAccountSettingsForm();
    this.buildDependencies();
  }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.recurringDepositAccountSettingsForm.patchValue({
        'isMandatoryDeposit': this.recurringDepositsAccountProductTemplate.isMandatoryDeposit,
        'adjustAdvanceTowardsFuturePayments': this.recurringDepositsAccountProductTemplate.adjustAdvanceTowardsFuturePayments,
        'allowWithdrawal': this.recurringDepositsAccountProductTemplate.allowWithdrawal,
        'lockinPeriodFrequency': this.recurringDepositsAccountProductTemplate.lockinPeriodFrequency,
        'lockinPeriodFrequencyType': this.recurringDepositsAccountProductTemplate.lockinPeriodFrequencyType ? this.recurringDepositsAccountProductTemplate.lockinPeriodFrequencyType.id : '',
        'minDepositTerm': this.recurringDepositsAccountProductTemplate.minDepositTerm,
        'minDepositTermTypeId': this.recurringDepositsAccountProductTemplate.minDepositTermType ? this.recurringDepositsAccountProductTemplate.minDepositTermType.id : '',
        'inMultiplesOfDepositTerm': this.recurringDepositsAccountProductTemplate.inMultiplesOfDepositTerm,
        'inMultiplesOfDepositTermTypeId': this.recurringDepositsAccountProductTemplate.inMultiplesOfDepositTermType ? this.recurringDepositsAccountProductTemplate.inMultiplesOfDepositTermType.id : '',
        'maxDepositTerm': this.recurringDepositsAccountProductTemplate.maxDepositTerm,
        'maxDepositTermTypeId': this.recurringDepositsAccountProductTemplate.maxDepositTermType ? this.recurringDepositsAccountProductTemplate.maxDepositTermType.id : '',
        'preClosurePenalApplicable': this.recurringDepositsAccountProductTemplate.preClosurePenalApplicable,
        'preClosurePenalInterest': this.recurringDepositsAccountProductTemplate.preClosurePenalInterest,
        'preClosurePenalInterestOnTypeId': this.recurringDepositsAccountProductTemplate.preClosurePenalInterestOnType ? this.recurringDepositsAccountProductTemplate.preClosurePenalInterestOnType.id : '',
        'minBalanceForInterestCalculation': this.recurringDepositsAccountProductTemplate.minBalanceForInterestCalculation,
      });
      if (this.recurringDepositsAccountProductTemplate.withHoldTax) {
        this.recurringDepositAccountSettingsForm.addControl('withHoldTax', new FormControl(false));
        this.recurringDepositAccountSettingsForm.get('withHoldTax').valueChanges.subscribe((value: boolean) => {
          if (value) {
            this.recurringDepositAccountSettingsForm.addControl('taxGroupId', new FormControl({ value: '', disabled: true }));
            this.recurringDepositAccountSettingsForm.get('taxGroupId').patchValue(this.recurringDepositsAccountProductTemplate.taxGroup && this.recurringDepositsAccountProductTemplate.taxGroup.name);
          } else {
            this.recurringDepositAccountSettingsForm.removeControl('taxGroupId');
          }
        });
        this.recurringDepositAccountSettingsForm.get('withHoldTax').patchValue(this.recurringDepositsAccountTemplate.withHoldTax);
      } else {
        this.recurringDepositAccountSettingsForm.removeControl('withHoldTax');
      }
      this.taxGroup = this.recurringDepositsAccountProductTemplate.taxGroup;
      this.setOptions();
    }
  }

  ngOnInit() {
    if (this.recurringDepositsAccountTemplate) {
      this.recurringDepositAccountSettingsForm.patchValue({
        'lockinPeriodFrequency': this.recurringDepositsAccountTemplate.lockinPeriodFrequency,
        'lockinPeriodFrequencyType': this.recurringDepositsAccountTemplate.lockinPeriodFrequencyType && this.recurringDepositsAccountTemplate.lockinPeriodFrequencyType.id,
        'mandatoryRecommendedDepositAmount': this.recurringDepositsAccountTemplate.mandatoryRecommendedDepositAmount,
      });
    }
  }

  /**
   * Creates recurring deposits account terms form.
   */
  createRecurringDepositAccountSettingsForm() {
    this.recurringDepositAccountSettingsForm = this.formBuilder.group({
      'isMandatoryDeposit': [''],
      'adjustAdvanceTowardsFuturePayments': [''],
      'allowWithdrawal': [''],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'mandatoryRecommendedDepositAmount': ['', Validators.required],
      'depositPeriod': ['', Validators.required],
      'depositPeriodFrequencyId': ['', Validators.required],
      'isCalendarInherited': [''],
      'expectedFirstDepositOnDate': [''],
      'recurringFrequency': ['', Validators.required],
      'recurringFrequencyType': ['', Validators.required],
      'minDepositTerm': [{value: '', disabled: true}],
      'minDepositTermTypeId': [{ value: '', disabled: true }],
      'inMultiplesOfDepositTerm': [{ value: '', disabled: true }],
      'inMultiplesOfDepositTermTypeId': [{ value: '', disabled: true }],
      'maxDepositTerm': [{ value: '', disabled: true }],
      'maxDepositTermTypeId': [{ value: '', disabled: true }],
      'preClosurePenalApplicable': [{ value: '', disabled: true }],
      'preClosurePenalInterest': [{ value: '', disabled: true }],
      'preClosurePenalInterestOnTypeId': [{ value: '', disabled: true }],
      'minBalanceForInterestCalculation': [{ value: '', disabled: true }]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.lockinPeriodFrequencyTypeData = this.recurringDepositsAccountProductTemplate.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = this.recurringDepositsAccountProductTemplate.periodFrequencyTypeOptions;
    this.preClosurePenalInterestOnTypeData = this.recurringDepositsAccountProductTemplate.preClosurePenalInterestOnTypeOptions;
  }

  /**
   * Subscribes to value changes and sets new form controls accordingly.
   */
  buildDependencies() {
    this.recurringDepositAccountSettingsForm.get('isCalendarInherited').valueChanges.subscribe((isCalendarInherited: any) => {
      if (isCalendarInherited) {
        this.recurringDepositAccountSettingsForm.removeControl('expectedFirstDepositOnDate');
        this.recurringDepositAccountSettingsForm.removeControl('recurringFrequency');
        this.recurringDepositAccountSettingsForm.removeControl('recurringFrequencyType');
      } else {
        this.recurringDepositAccountSettingsForm.addControl('expectedFirstDepositOnDate', new FormControl());
        this.recurringDepositAccountSettingsForm.addControl('recurringFrequency', new FormControl(''));
        this.recurringDepositAccountSettingsForm.addControl('recurringFrequencyType', new FormControl(''));
      }
    });
  }

  /**
   * Returns recurring deposits account settings form value.
   */
  get recurringDepositAccountSettings() {
    return this.recurringDepositAccountSettingsForm.value;
  }

}
