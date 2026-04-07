/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */

/**
 * Recurring Deposits Account Settings Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-settings-step',
  templateUrl: './recurring-deposits-account-settings-step.component.html',
  styleUrls: ['./recurring-deposits-account-settings-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    InputAmountComponent,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class RecurringDepositsAccountSettingsStepComponent implements OnInit, OnChanges {
  @Input() isNew = true;
  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Recurring Deposits Account Settings Form */
  recurringDepositAccountSettingsForm: UntypedFormGroup;
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
  currency: Currency | null = null;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService
  ) {
    this.createRecurringDepositAccountSettingsForm();
    this.buildDependencies();
  }

  ngOnChanges() {
    const recurringDepositsAccount: any = this.isNew
      ? this.recurringDepositsAccountProductTemplate
      : this.recurringDepositsAccountTemplate;
    if (recurringDepositsAccount) {
      this.currency = recurringDepositsAccount.currency;
      this.recurringDepositAccountSettingsForm.patchValue({
        isMandatoryDeposit: recurringDepositsAccount.isMandatoryDeposit,
        adjustAdvanceTowardsFuturePayments: recurringDepositsAccount.adjustAdvanceTowardsFuturePayments,
        allowWithdrawal: recurringDepositsAccount.allowWithdrawal,
        lockinPeriodFrequency: recurringDepositsAccount.lockinPeriodFrequency,
        lockinPeriodFrequencyType: recurringDepositsAccount.lockinPeriodFrequencyType
          ? recurringDepositsAccount.lockinPeriodFrequencyType.id
          : '',
        minDepositTerm: recurringDepositsAccount.minDepositTerm,
        minDepositTermTypeId: recurringDepositsAccount.minDepositTermType
          ? recurringDepositsAccount.minDepositTermType.id
          : '',
        inMultiplesOfDepositTerm: recurringDepositsAccount.inMultiplesOfDepositTerm,
        inMultiplesOfDepositTermTypeId: recurringDepositsAccount.inMultiplesOfDepositTermType
          ? recurringDepositsAccount.inMultiplesOfDepositTermType.id
          : '',
        maxDepositTerm: recurringDepositsAccount.maxDepositTerm,
        maxDepositTermTypeId: recurringDepositsAccount.maxDepositTermType
          ? recurringDepositsAccount.maxDepositTermType.id
          : '',
        preClosurePenalApplicable: recurringDepositsAccount.preClosurePenalApplicable,
        preClosurePenalInterest: recurringDepositsAccount.preClosurePenalInterest,
        preClosurePenalInterestOnTypeId: recurringDepositsAccount.preClosurePenalInterestOnType
          ? recurringDepositsAccount.preClosurePenalInterestOnType.id
          : '',
        minBalanceForInterestCalculation: recurringDepositsAccount.minBalanceForInterestCalculation,
        depositPeriod: recurringDepositsAccount.minDepositTerm,
        depositPeriodFrequencyId: recurringDepositsAccount.minDepositTermType.id,
        expectedFirstDepositOnDate:
          recurringDepositsAccount.expectedFirstDepositOnDate &&
          new Date(recurringDepositsAccount.expectedFirstDepositOnDate),
        recurringFrequency: recurringDepositsAccount.recurringFrequency,
        recurringFrequencyType: recurringDepositsAccount.recurringFrequencyType
          ? recurringDepositsAccount.recurringFrequencyType.id
          : ''
      });
      if (recurringDepositsAccount.withHoldTax) {
        this.recurringDepositAccountSettingsForm.addControl('withHoldTax', new UntypedFormControl(false));
        this.recurringDepositAccountSettingsForm.get('withHoldTax').valueChanges.subscribe((value: boolean) => {
          if (value) {
            this.recurringDepositAccountSettingsForm.addControl(
              'taxGroupId',
              new UntypedFormControl({ value: '', disabled: true })
            );
            this.recurringDepositAccountSettingsForm
              .get('taxGroupId')
              .patchValue(recurringDepositsAccount.taxGroup && recurringDepositsAccount.taxGroup.name);
          } else {
            this.recurringDepositAccountSettingsForm.removeControl('taxGroupId');
          }
        });
        this.recurringDepositAccountSettingsForm
          .get('withHoldTax')
          .patchValue(this.recurringDepositsAccountTemplate.withHoldTax);
      } else {
        this.recurringDepositAccountSettingsForm.removeControl('withHoldTax');
      }
      this.taxGroup = recurringDepositsAccount.taxGroup;
      this.setOptions(recurringDepositsAccount);
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.recurringDepositsAccountTemplate) {
      this.recurringDepositAccountSettingsForm.patchValue({
        lockinPeriodFrequency: this.recurringDepositsAccountTemplate.lockinPeriodFrequency,
        lockinPeriodFrequencyType:
          this.recurringDepositsAccountTemplate.lockinPeriodFrequencyType &&
          this.recurringDepositsAccountTemplate.lockinPeriodFrequencyType.id,
        mandatoryRecommendedDepositAmount: this.recurringDepositsAccountTemplate.mandatoryRecommendedDepositAmount
      });
    }
  }

  /**
   * Creates recurring deposits account terms form.
   */
  createRecurringDepositAccountSettingsForm() {
    this.recurringDepositAccountSettingsForm = this.formBuilder.group({
      isMandatoryDeposit: [''],
      adjustAdvanceTowardsFuturePayments: [''],
      allowWithdrawal: [''],
      lockinPeriodFrequency: [''],
      lockinPeriodFrequencyType: [''],
      mandatoryRecommendedDepositAmount: [
        '',
        Validators.required
      ],
      depositPeriod: [
        '',
        Validators.required
      ],
      depositPeriodFrequencyId: [
        '',
        Validators.required
      ],
      isCalendarInherited: [''],
      expectedFirstDepositOnDate: [''],
      recurringFrequency: [
        '',
        Validators.required
      ],
      recurringFrequencyType: [
        '',
        Validators.required
      ],
      minDepositTerm: [{ value: '', disabled: true }],
      minDepositTermTypeId: [{ value: '', disabled: true }],
      inMultiplesOfDepositTerm: [{ value: '', disabled: true }],
      inMultiplesOfDepositTermTypeId: [{ value: '', disabled: true }],
      maxDepositTerm: [{ value: '', disabled: true }],
      maxDepositTermTypeId: [{ value: '', disabled: true }],
      preClosurePenalApplicable: [{ value: '', disabled: true }],
      preClosurePenalInterest: [{ value: '', disabled: true }],
      preClosurePenalInterestOnTypeId: [{ value: '', disabled: true }],
      minBalanceForInterestCalculation: [{ value: '', disabled: true }]
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions(recurringDepositsAccount: any) {
    this.lockinPeriodFrequencyTypeData = recurringDepositsAccount.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = recurringDepositsAccount.periodFrequencyTypeOptions;
    this.preClosurePenalInterestOnTypeData = recurringDepositsAccount.preClosurePenalInterestOnTypeOptions;
  }

  /**
   * Subscribes to value changes and sets new form controls accordingly.
   */
  buildDependencies() {
    this.recurringDepositAccountSettingsForm
      .get('isCalendarInherited')
      .valueChanges.subscribe((isCalendarInherited: any) => {
        if (isCalendarInherited) {
          this.recurringDepositAccountSettingsForm.removeControl('expectedFirstDepositOnDate');
          this.recurringDepositAccountSettingsForm.removeControl('recurringFrequency');
          this.recurringDepositAccountSettingsForm.removeControl('recurringFrequencyType');
        } else {
          this.recurringDepositAccountSettingsForm.addControl('expectedFirstDepositOnDate', new UntypedFormControl());
          this.recurringDepositAccountSettingsForm.addControl('recurringFrequency', new UntypedFormControl(''));
          this.recurringDepositAccountSettingsForm.addControl('recurringFrequencyType', new UntypedFormControl(''));
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
