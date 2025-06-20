/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Recurring Deposits Terms Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-terms-step',
  templateUrl: './recurring-deposits-account-terms-step.component.html',
  styleUrls: ['./recurring-deposits-account-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class RecurringDepositsAccountTermsStepComponent implements OnInit, OnChanges {
  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Recurring Deposits Account Terms Form */
  recurringDepositAccountTermsForm: UntypedFormGroup;
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
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService
  ) {
    this.createRecurringDepositsAccountTermsForm();
  }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.recurringDepositsAccountTemplate.id) {
      this.recurringDepositAccountTermsForm.patchValue({
        interestCompoundingPeriodType: this.recurringDepositsAccountTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.recurringDepositsAccountTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.recurringDepositsAccountTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType: this.recurringDepositsAccountTemplate.interestCalculationDaysInYearType.id
      });
    }
  }

  /**
   * Creates recurring deposits account terms form.
   */
  createRecurringDepositsAccountTermsForm() {
    this.recurringDepositAccountTermsForm = this.formBuilder.group({
      interestCompoundingPeriodType: [
        '',
        Validators.required
      ],
      interestPostingPeriodType: [
        '',
        Validators.required
      ],
      interestCalculationType: [
        '',
        Validators.required
      ],
      interestCalculationDaysInYearType: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.interestCompoundingPeriodTypeData =
      this.recurringDepositsAccountProductTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.recurringDepositsAccountProductTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.recurringDepositsAccountProductTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData =
      this.recurringDepositsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
    if (!this.recurringDepositsAccountTemplate.id) {
      this.recurringDepositAccountTermsForm.patchValue({
        interestCompoundingPeriodType: this.recurringDepositsAccountProductTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.recurringDepositsAccountProductTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.recurringDepositsAccountProductTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType:
          this.recurringDepositsAccountProductTemplate.interestCalculationDaysInYearType.id
      });
    }
  }

  /**
   * Returns recurring deposits account terms form value.
   */
  get recurringDepositAccountTerms() {
    return this.recurringDepositAccountTermsForm.value;
  }
}
