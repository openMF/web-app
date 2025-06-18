/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Recurring Deposits Terms Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-terms-step',
  templateUrl: './recurring-deposits-account-terms-step.component.html',
  styleUrls: ['./recurring-deposits-account-terms-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatError,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
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
