import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'mifosx-loan-product-settings-step',
  templateUrl: './loan-product-settings-step.component.html',
  styleUrls: ['./loan-product-settings-step.component.scss']
})
export class LoanProductSettingsStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() isLinkedToFloatingInterestRates: UntypedFormControl;
  @Input() loanProductTemplates: any;

  loanProductSettingsForm: UntypedFormGroup;

  amortizationTypeData: any;
  interestTypeData: any;
  interestCalculationPeriodTypeData: any;
  transactionProcessingStrategyData: any;
  daysInYearTypeData: any;
  daysInMonthTypeData: any;
  preClosureInterestCalculationStrategyData: any;
  rescheduleStrategyTypeData: any;
  interestRecalculationCompoundingTypeData: any;
  interestRecalculationFrequencyTypeData: any;
  interestRecalculationNthDayTypeData: any;
  interestRecalculationDayOfWeekTypeData: any;
  interestRecalculationOnDayTypeData: any;
  // terms and conditions template
  templateForTermsAndConditions: any;
  showTermsAndConditions = false;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createLoanProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.isLinkedToFloatingInterestRates.valueChanges
      .subscribe((isLinkedToFloatingInterestRates: any) => {
        if (isLinkedToFloatingInterestRates) {
          this.loanProductSettingsForm.get('isInterestRecalculationEnabled').setValue(true);
        }
    });

    this.amortizationTypeData = this.loanProductsTemplate.amortizationTypeOptions;
    this.interestTypeData = this.loanProductsTemplate.interestTypeOptions;
    this.interestCalculationPeriodTypeData = this.loanProductsTemplate.interestCalculationPeriodTypeOptions;
    this.transactionProcessingStrategyData = this.loanProductsTemplate.transactionProcessingStrategyOptions;
    this.daysInYearTypeData = this.loanProductsTemplate.daysInYearTypeOptions;
    this.daysInMonthTypeData = this.loanProductsTemplate.daysInMonthTypeOptions;
    this.preClosureInterestCalculationStrategyData = this.loanProductsTemplate.preClosureInterestCalculationStrategyOptions;
    this.rescheduleStrategyTypeData = this.loanProductsTemplate.rescheduleStrategyTypeOptions;
    this.interestRecalculationCompoundingTypeData = this.loanProductsTemplate.interestRecalculationCompoundingTypeOptions;
    this.interestRecalculationFrequencyTypeData = this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions;
    this.interestRecalculationNthDayTypeData = this.loanProductsTemplate.interestRecalculationNthDayTypeOptions;
    this.interestRecalculationNthDayTypeData.push({ 'id': -2, 'code': 'onDay', 'value': 'on day' });
    this.interestRecalculationDayOfWeekTypeData = this.loanProductsTemplate.interestRecalculationDayOfWeekTypeOptions;
    this.interestRecalculationOnDayTypeData = Array.from({ length: 28 }, (_, index) => index + 1);

    this.loanProductSettingsForm.patchValue({
      'amortizationType': this.loanProductsTemplate.amortizationType.id,
      'interestType': this.loanProductsTemplate.interestType.id,
      'isEqualAmortization': this.loanProductsTemplate.isEqualAmortization,
      'interestCalculationPeriodType': this.loanProductsTemplate.interestCalculationPeriodType.id,
      'allowPartialPeriodInterestCalcualtion': this.loanProductsTemplate.allowPartialPeriodInterestCalcualtion,
      'transactionProcessingStrategyId': this.loanProductsTemplate.transactionProcessingStrategyId || this.transactionProcessingStrategyData[0].id,
      'graceOnPrincipalPayment': this.loanProductsTemplate.graceOnPrincipalPayment,
      'graceOnInterestPayment': this.loanProductsTemplate.graceOnInterestPayment,
      'graceOnInterestCharged': this.loanProductsTemplate.graceOnInterestCharged,
      'inArrearsTolerance': this.loanProductsTemplate.inArrearsTolerance,
      'daysInYearType': this.loanProductsTemplate.daysInYearType.id,
      'daysInMonthType': this.loanProductsTemplate.daysInMonthType.id,
      'canDefineInstallmentAmount': this.loanProductsTemplate.canDefineInstallmentAmount,
      'graceOnArrearsAgeing': this.loanProductsTemplate.graceOnArrearsAgeing,
      'overdueDaysForNPA': this.loanProductsTemplate.overdueDaysForNPA,
      'accountMovesOutOfNPAOnlyOnArrearsCompletion': this.loanProductsTemplate.accountMovesOutOfNPAOnlyOnArrearsCompletion,
      'principalThresholdForLastInstallment': this.loanProductsTemplate.principalThresholdForLastInstallment,
      'allowVariableInstallments': this.loanProductsTemplate.allowVariableInstallments,
      'minimumGap': this.loanProductsTemplate.minimumGap,
      'maximumGap': this.loanProductsTemplate.maximumGap,
      'canUseForTopup': this.loanProductsTemplate.canUseForTopup,
      'isInterestRecalculationEnabled': this.loanProductsTemplate.isInterestRecalculationEnabled,
      'holdGuaranteeFunds': this.loanProductsTemplate.holdGuaranteeFunds,
      'multiDisburseLoan': this.loanProductsTemplate.multiDisburseLoan,
      'maxTrancheCount': this.loanProductsTemplate.maxTrancheCount,
      'outstandingLoanBalance': this.loanProductsTemplate.outstandingLoanBalance
    });

    if (this.loanProductsTemplate.isInterestRecalculationEnabled) {
      this.loanProductSettingsForm.patchValue({
        'preClosureInterestCalculationStrategy': this.loanProductsTemplate.interestRecalculationData.preClosureInterestCalculationStrategy.id,
        'rescheduleStrategyMethod': this.loanProductsTemplate.interestRecalculationData.rescheduleStrategyType.id,
        'interestRecalculationCompoundingMethod': this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id,
        'recalculationRestFrequencyType': this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id,
        'isArrearsBasedOnOriginalSchedule': this.loanProductsTemplate.interestRecalculationData.isArrearsBasedOnOriginalSchedule,
        'recalculationCompoundingFrequencyType': this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id,
        'recalculationCompoundingFrequencyInterval': this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyInterval,
        'recalculationRestFrequencyInterval': this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyInterval,
        'recalculationRestFrequencyNthDayType': this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 4 && this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay ?
          -2 : this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyNthDay && this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyNthDay.id,
        'recalculationCompoundingFrequencyNthDayType': this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id === 4
          && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay ? -2 : this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyNthDay
          && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyNthDay.id,
        'recalculationCompoundingFrequencyDayOfWeekType': this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id && ((this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id
          === 4 && !this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay) || this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id === 3)
          && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyWeekday && this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyWeekday.id,
        'recalculationRestFrequencyDayOfWeekType': ((this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 4 && !this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay)
          || this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 3) && this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyWeekday
          && this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyWeekday.id,
        'recalculationCompoundingFrequencyOnDayType': this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay,
        'recalculationRestFrequencyOnDayType': this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay
      });
    }

    if (this.loanProductsTemplate.holdGuaranteeFunds) {
      this.loanProductSettingsForm.patchValue({
        'mandatoryGuarantee': this.loanProductsTemplate.productGuaranteeData.mandatoryGuarantee,
        'minimumGuaranteeFromOwnFunds': this.loanProductsTemplate.productGuaranteeData.minimumGuaranteeFromOwnFunds,
        'minimumGuaranteeFromGuarantor': this.loanProductsTemplate.productGuaranteeData.minimumGuaranteeFromGuarantor
      });
    }

    if (this.loanProductsTemplate.allowAttributeOverrides) {
      this.loanProductSettingsForm.patchValue({
        'allowAttributeConfiguration': Object.values(this.loanProductsTemplate.allowAttributeOverrides).some((attribute: boolean) => attribute),
        'allowAttributeOverrides': {
          'amortizationType': this.loanProductsTemplate.allowAttributeOverrides.amortizationType,
          'interestType': this.loanProductsTemplate.allowAttributeOverrides.interestType,
          'transactionProcessingStrategyId': this.loanProductsTemplate.allowAttributeOverrides.transactionProcessingStrategyId,
          'interestCalculationPeriodType': this.loanProductsTemplate.allowAttributeOverrides.interestCalculationPeriodType,
          'inArrearsTolerance': this.loanProductsTemplate.allowAttributeOverrides.inArrearsTolerance,
          'repaymentEvery': this.loanProductsTemplate.allowAttributeOverrides.repaymentEvery,
          'graceOnPrincipalAndInterestPayment': this.loanProductsTemplate.allowAttributeOverrides.graceOnPrincipalAndInterestPayment,
          'graceOnArrearsAgeing': this.loanProductsTemplate.allowAttributeOverrides.graceOnArrearsAgeing
        }
      });
    }
  }

  createLoanProductSettingsForm() {
    this.loanProductSettingsForm = this.formBuilder.group({
      'amortizationType': ['', Validators.required],
      'interestType': ['', Validators.required],
      'isEqualAmortization': [false],
      'interestCalculationPeriodType': ['', Validators.required],
      'transactionProcessingStrategyId': ['', Validators.required],
      'graceOnPrincipalPayment': [''],
      'graceOnInterestPayment': [''],
      'graceOnInterestCharged': [''],
      'inArrearsTolerance': [''],
      'daysInYearType': ['', Validators.required],
      'daysInMonthType': ['', Validators.required],
      'canDefineInstallmentAmount': [false],
      'graceOnArrearsAgeing': [''],
      'overdueDaysForNPA': [''],
      'accountMovesOutOfNPAOnlyOnArrearsCompletion': [false],
      'principalThresholdForLastInstallment': [''],
      'allowVariableInstallments': [false],
      'canUseForTopup': [false],
      'isInterestRecalculationEnabled': [false],
      'holdGuaranteeFunds': [false],
      'multiDisburseLoan': [false],
      'allowAttributeConfiguration': [true],
      'allowAttributeOverrides': this.formBuilder.group({
        'amortizationType': [true],
        'interestType': [true],
        'transactionProcessingStrategyId': [true],
        'interestCalculationPeriodType': [true],
        'inArrearsTolerance': [true],
        'repaymentEvery': [true],
        'graceOnPrincipalAndInterestPayment': [true],
        'graceOnArrearsAgeing': [true]
      }),
      'templateForTermsAndConditions': ['']
    });
  }

  setConditionalControls() {
    const allowAttributeOverrides = this.loanProductSettingsForm.get('allowAttributeOverrides');

    this.loanProductSettingsForm.get('interestCalculationPeriodType').valueChanges
      .subscribe((interestCalculationPeriodType: any) => {
        if (interestCalculationPeriodType === 1) {
          this.loanProductSettingsForm.addControl('allowPartialPeriodInterestCalcualtion', new UntypedFormControl(false));
        } else {
          this.loanProductSettingsForm.removeControl('allowPartialPeriodInterestCalcualtion');
        }
      });

    this.loanProductSettingsForm.get('allowVariableInstallments').valueChanges
      .subscribe((allowVariableInstallments: any) => {
        if (allowVariableInstallments) {
          this.loanProductSettingsForm.addControl('minimumGap', new UntypedFormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('maximumGap', new UntypedFormControl(''));
        } else {
          this.loanProductSettingsForm.removeControl('minimumGap');
          this.loanProductSettingsForm.removeControl('maximumGap');
        }
      });

    this.loanProductSettingsForm.get('isInterestRecalculationEnabled').valueChanges
      .subscribe((isInterestRecalculationEnabled: any) => {
        if (isInterestRecalculationEnabled) {
          this.loanProductSettingsForm.addControl('preClosureInterestCalculationStrategy', new UntypedFormControl(this.preClosureInterestCalculationStrategyData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('rescheduleStrategyMethod', new UntypedFormControl(this.rescheduleStrategyTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('interestRecalculationCompoundingMethod', new UntypedFormControl(this.interestRecalculationCompoundingTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('recalculationRestFrequencyType', new UntypedFormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('isArrearsBasedOnOriginalSchedule', new UntypedFormControl(''));

          this.loanProductSettingsForm.get('interestRecalculationCompoundingMethod').valueChanges
            .subscribe((interestRecalculationCompoundingMethod: any) => {
              if (interestRecalculationCompoundingMethod !== 0) {
                this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyType', new UntypedFormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required));

                this.loanProductSettingsForm.get('recalculationCompoundingFrequencyType').valueChanges
                  .subscribe((recalculationCompoundingFrequencyType: any) => {
                    if (recalculationCompoundingFrequencyType !== 1) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyInterval', new UntypedFormControl('', Validators.required));
                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyInterval');
                    }

                    if (recalculationCompoundingFrequencyType === 3) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new UntypedFormControl(''));
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyNthDayType');
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyOnDayType');
                    } else if (recalculationCompoundingFrequencyType === 4) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyNthDayType', new UntypedFormControl(''));
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new UntypedFormControl(''));

                      this.loanProductSettingsForm.get('recalculationCompoundingFrequencyNthDayType').valueChanges
                        .subscribe((recalculationCompoundingFrequencyNthDayType: any) => {
                          if (recalculationCompoundingFrequencyNthDayType === -2) {
                            this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyOnDayType', new UntypedFormControl(''));
                            this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyDayOfWeekType');
                          } else {
                            this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new UntypedFormControl(''));
                            this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyOnDayType');
                          }
                        });
                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyNthDayType');
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyDayOfWeekType');
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyOnDayType');
                    }
                  });

              } else {
                this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyType');
              }
            });

          this.loanProductSettingsForm.get('recalculationRestFrequencyType').valueChanges
            .subscribe((recalculationRestFrequencyType: any) => {
              if (recalculationRestFrequencyType !== 1) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyInterval', new UntypedFormControl('', Validators.required));
              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyInterval');
              }

              if (recalculationRestFrequencyType === 3) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new UntypedFormControl(''));
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyNthDayType');
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyOnDayType');
              } else if (recalculationRestFrequencyType === 4) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyNthDayType', new UntypedFormControl(''));
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new UntypedFormControl(''));

                this.loanProductSettingsForm.get('recalculationRestFrequencyNthDayType').valueChanges
                  .subscribe((recalculationRestFrequencyNthDayType: any) => {
                    if (recalculationRestFrequencyNthDayType === -2) {
                      this.loanProductSettingsForm.addControl('recalculationRestFrequencyOnDayType', new UntypedFormControl(''));
                      this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDayOfWeekType');
                    } else {
                      this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new UntypedFormControl(''));
                      this.loanProductSettingsForm.removeControl('recalculationRestFrequencyOnDayType');
                    }
                  });

              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyNthDayType');
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDayOfWeekType');
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyOnDayType');
              }
            });

        } else {
          this.loanProductSettingsForm.removeControl('preClosureInterestCalculationStrategy');
          this.loanProductSettingsForm.removeControl('rescheduleStrategyMethod');
          this.loanProductSettingsForm.removeControl('interestRecalculationCompoundingMethod');
          this.loanProductSettingsForm.removeControl('recalculationRestFrequencyType');
          this.loanProductSettingsForm.removeControl('isArrearsBasedOnOriginalSchedule');
        }
      });

    this.loanProductSettingsForm.get('holdGuaranteeFunds').valueChanges
      .subscribe(holdGuaranteeFunds => {
        if (holdGuaranteeFunds) {
          this.loanProductSettingsForm.addControl('mandatoryGuarantee', new UntypedFormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('minimumGuaranteeFromOwnFunds', new UntypedFormControl(''));
          this.loanProductSettingsForm.addControl('minimumGuaranteeFromGuarantor', new UntypedFormControl(''));
        } else {
          this.loanProductSettingsForm.removeControl('mandatoryGuarantee');
          this.loanProductSettingsForm.removeControl('minimumGuaranteeFromOwnFunds');
          this.loanProductSettingsForm.removeControl('minimumGuaranteeFromGuarantor');
        }
      });

    this.loanProductSettingsForm.get('multiDisburseLoan').valueChanges
      .subscribe(multiDisburseLoan => {
        if (multiDisburseLoan) {
          this.loanProductSettingsForm.addControl('maxTrancheCount', new UntypedFormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('outstandingLoanBalance', new UntypedFormControl(''));
        } else {
          this.loanProductSettingsForm.removeControl('maxTrancheCount');
          this.loanProductSettingsForm.removeControl('outstandingLoanBalance');
        }
      });

    this.loanProductSettingsForm.get('allowAttributeConfiguration').valueChanges
      .subscribe((allowAttributeConfiguration: any) => {
        if (allowAttributeConfiguration) {
          allowAttributeOverrides.patchValue({
            'amortizationType': true,
            'interestType': true,
            'transactionProcessingStrategyId': true,
            'interestCalculationPeriodType': true,
            'inArrearsTolerance': true,
            'repaymentEvery': true,
            'graceOnPrincipalAndInterestPayment': true,
            'graceOnArrearsAgeing': true
          });
        } else {
          allowAttributeOverrides.patchValue({
            'amortizationType': false,
            'interestType': false,
            'transactionProcessingStrategyId': false,
            'interestCalculationPeriodType': false,
            'inArrearsTolerance': false,
            'repaymentEvery': false,
            'graceOnPrincipalAndInterestPayment': false,
            'graceOnArrearsAgeing': false
          });
        }
      });
  }

  toggleTermsAndConditions() {
    this.showTermsAndConditions = !this.showTermsAndConditions;
  }

  get loanProductSettings() {
    return this.loanProductSettingsForm.value;
  }

}
