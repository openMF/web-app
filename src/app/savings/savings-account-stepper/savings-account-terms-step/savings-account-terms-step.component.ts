/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnChanges, OnInit, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings Account Terms Step
 */
@Component({
  selector: 'mifosx-savings-account-terms-step',
  templateUrl: './savings-account-terms-step.component.html',
  styleUrls: ['./savings-account-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsAccountTermsStepComponent implements OnChanges, OnInit {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

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
  constructor() {
    this.createSavingsAccountTermsForm();
    this.buildDependencies();
  }

  ngOnChanges() {
    if (this.savingsAccountProductTemplate) {
      this.savingsAccountTermsForm.patchValue({
        currencyCode: this.savingsAccountProductTemplate.currency.code,
        decimal: this.savingsAccountProductTemplate.currency.decimalPlaces,
        minBalanceForInterestCalculation: this.savingsAccountProductTemplate.minBalanceForInterestCalculation,
        nominalAnnualInterestRate: this.savingsAccountProductTemplate.nominalAnnualInterestRate,
        interestCompoundingPeriodType: this.savingsAccountProductTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.savingsAccountProductTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.savingsAccountProductTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType: this.savingsAccountProductTemplate.interestCalculationDaysInYearType.id,
        minRequiredOpeningBalance: this.savingsAccountProductTemplate.minRequiredOpeningBalance,
        allowOverdraft: this.savingsAccountProductTemplate.allowOverdraft,
        overdraftLimit: this.savingsAccountProductTemplate.overdraftLimit,
        enforceMinRequiredBalance: this.savingsAccountProductTemplate.enforceMinRequiredBalance,
        minOverdraftForInterestCalculation: this.savingsAccountProductTemplate.minOverdraftForInterestCalculation,
        nominalAnnualInterestRateOverdraft: this.savingsAccountProductTemplate.nominalAnnualInterestRateOverdraft,
        minRequiredBalance: this.savingsAccountProductTemplate.minRequiredBalance,
        withdrawalFeeForTransfers: this.savingsAccountProductTemplate.withdrawalFeeForTransfers
      });
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.savingsAccountTemplate) {
      this.savingsAccountTermsForm.patchValue({
        nominalAnnualInterestRate: this.savingsAccountTemplate.nominalAnnualInterestRate,
        interestCompoundingPeriodType: this.savingsAccountTemplate.interestCompoundingPeriodType.id,
        interestPostingPeriodType: this.savingsAccountTemplate.interestPostingPeriodType.id,
        interestCalculationType: this.savingsAccountTemplate.interestCalculationType.id,
        interestCalculationDaysInYearType: this.savingsAccountTemplate.interestCalculationDaysInYearType.id,
        minRequiredOpeningBalance: this.savingsAccountTemplate.minRequiredOpeningBalance,
        withdrawalFeeForTransfers: this.savingsAccountTemplate.withdrawalFeeForTransfers,
        lockinPeriodFrequency: this.savingsAccountTemplate.lockinPeriodFrequency,
        lockinPeriodFrequencyType:
          this.savingsAccountTemplate.lockinPeriodFrequencyType &&
          this.savingsAccountTemplate.lockinPeriodFrequencyType.id,
        allowOverdraft: this.savingsAccountTemplate.allowOverdraft,
        enforceMinRequiredBalance: this.savingsAccountTemplate.enforceMinRequiredBalance,
        minRequiredBalance: this.savingsAccountTemplate.minRequiredBalance
      });
    }
  }

  /**
   * Creates savings account terms form.
   */
  createSavingsAccountTermsForm() {
    this.savingsAccountTermsForm = this.formBuilder.group({
      currencyCode: [{ value: '', disabled: true }],
      decimal: [{ value: '', disabled: true }],
      nominalAnnualInterestRate: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
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
      minRequiredOpeningBalance: [
        '',
        Validators.min(0)
      ],
      withdrawalFeeForTransfers: [false],
      lockinPeriodFrequency: [
        '',
        Validators.min(0)
      ],
      lockinPeriodFrequencyType: [''],
      allowOverdraft: [false],
      enforceMinRequiredBalance: [false],
      minRequiredBalance: [
        '',
        Validators.min(0)
      ],
      minBalanceForInterestCalculation: [{ value: '', disabled: true }]
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
    this.interestCalculationDaysInYearTypeData =
      this.savingsAccountProductTemplate.interestCalculationDaysInYearTypeOptions;
  }

  /**
   * Subscribes to value changes and sets new form controls accordingly.
   */
  buildDependencies() {
    const nominalInterestControl = this.savingsAccountTermsForm.get('nominalAnnualInterestRate');
    if (nominalInterestControl) {
      nominalInterestControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
        if (typeof value === 'number' && value < 0) {
          nominalInterestControl.setValue(0, { emitEvent: false });
        }
      });
    }
    this.savingsAccountTermsForm
      .get('allowOverdraft')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((allowOverdraft: any) => {
        if (allowOverdraft) {
          this.savingsAccountTermsForm.addControl(
            'minOverdraftForInterestCalculation',
            new FormControl('', Validators.min(0))
          );
          this.savingsAccountTermsForm.addControl(
            'nominalAnnualInterestRateOverdraft',
            new FormControl('', Validators.min(0))
          );
          this.savingsAccountTermsForm.addControl('overdraftLimit', new FormControl('', Validators.min(0)));
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
    delete payload.minBalanceForInterestCalculation; // Backend is not accepting minBalanceForInterestCalculation value
    return payload;
  }
}
