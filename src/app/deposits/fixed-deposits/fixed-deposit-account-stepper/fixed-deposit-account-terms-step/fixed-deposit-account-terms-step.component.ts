/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed Deposits Terms Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-terms-step',
  templateUrl: './fixed-deposit-account-terms-step.component.html',
  styleUrls: ['./fixed-deposit-account-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
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
  fixedDepositAccountTermsForm: UntypedFormGroup;
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
  currency: Currency | null = null;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService
  ) {
    this.createFixedDepositsAccountTermsForm();
  }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.currency = this.fixedDepositsAccountProductTemplate.currency;
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.fixedDepositsAccountTemplate.id) {
      this.fixedDepositAccountTermsForm.patchValue({
        interestCompoundingPeriodType: this.fixedDepositsAccountTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.fixedDepositsAccountTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.fixedDepositsAccountTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType: this.fixedDepositsAccountTemplate.interestCalculationDaysInYearType.id,
        depositAmount: this.fixedDepositsAccountTemplate.depositAmount
          ? this.fixedDepositsAccountTemplate.depositAmount
          : 0,
        depositPeriod: this.fixedDepositsAccountTemplate.depositPeriod,
        depositPeriodFrequencyId: this.fixedDepositsAccountTemplate.depositPeriodFrequency.id
      });
    }
  }

  /**
   * Creates fixed deposits account terms form.
   */
  createFixedDepositsAccountTermsForm() {
    this.fixedDepositAccountTermsForm = this.formBuilder.group({
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
      ],
      depositAmount: [
        0,
        Validators.required
      ],
      depositPeriod: [
        '',
        Validators.required
      ],
      depositPeriodFrequencyId: [
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
      this.fixedDepositsAccountProductTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.fixedDepositsAccountProductTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.fixedDepositsAccountProductTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData =
      this.fixedDepositsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
    this.periodFrequencyTypeData = this.fixedDepositsAccountProductTemplate.periodFrequencyTypeOptions;
    if (!this.fixedDepositsAccountTemplate.id) {
      this.fixedDepositAccountTermsForm.patchValue({
        interestCompoundingPeriodType: this.fixedDepositsAccountProductTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.fixedDepositsAccountProductTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.fixedDepositsAccountProductTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType:
          this.fixedDepositsAccountProductTemplate.interestCalculationDaysInYearType.id,
        depositAmount: this.fixedDepositsAccountProductTemplate.depositAmount,
        depositPeriod: this.fixedDepositsAccountProductTemplate.minDepositTerm,
        depositPeriodFrequencyId: this.fixedDepositsAccountProductTemplate.minDepositTermType.id
      });
    }
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
