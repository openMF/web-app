import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-loan-product-settings-step',
  templateUrl: './loan-product-settings-step.component.html',
  styleUrls: ['./loan-product-settings-step.component.scss']
})
export class LoanProductSettingsStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() isLinkedToFloatingInterestRates: FormControl;

  loanProductSettingsForm: FormGroup;

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

  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  constructor(private formBuilder: FormBuilder,
              private datePipe: DatePipe) {
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
      'amortizationType': this.amortizationTypeData[0].id,
      'interestType': this.interestTypeData[0].id,
      'interestCalculationPeriodType': this.interestCalculationPeriodTypeData[0].id,
      'transactionProcessingStrategyId': this.transactionProcessingStrategyData[0].id,
      'daysInYearType': this.daysInYearTypeData[0].id,
      'daysInMonthType': this.daysInMonthTypeData[0].id,
    });
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
      })
    });
  }

  setConditionalControls() {
    const allowAttributeOverrides = this.loanProductSettingsForm.get('allowAttributeOverrides');

    this.loanProductSettingsForm.get('interestCalculationPeriodType').valueChanges
      .subscribe((interestCalculationPeriodType: any) => {
        if (interestCalculationPeriodType === 1) {
          this.loanProductSettingsForm.addControl('allowPartialPeriodInterestCalcualtion', new FormControl(false));
        } else {
          this.loanProductSettingsForm.removeControl('allowPartialPeriodInterestCalcualtion');
        }
      });

    this.loanProductSettingsForm.get('allowVariableInstallments').valueChanges
      .subscribe((allowVariableInstallments: any) => {
        if (allowVariableInstallments) {
          this.loanProductSettingsForm.addControl('minimumGap', new FormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('maximumGap', new FormControl(''));
        } else {
          this.loanProductSettingsForm.removeControl('minimumGap');
          this.loanProductSettingsForm.removeControl('maximumGap');
        }
      });

    this.loanProductSettingsForm.get('isInterestRecalculationEnabled').valueChanges
      .subscribe((isInterestRecalculationEnabled: any) => {
        if (isInterestRecalculationEnabled) {
          this.loanProductSettingsForm.addControl('preClosureInterestCalculationStrategy', new FormControl(this.preClosureInterestCalculationStrategyData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('rescheduleStrategyMethod', new FormControl(this.rescheduleStrategyTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('interestRecalculationCompoundingMethod', new FormControl(this.interestRecalculationCompoundingTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('recalculationRestFrequencyType', new FormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required));
          this.loanProductSettingsForm.addControl('isArrearsBasedOnOriginalSchedule', new FormControl(''));

          // interestRecalculationCompoundingMethod (initially 0)
          this.loanProductSettingsForm.get('interestRecalculationCompoundingMethod').valueChanges
            .subscribe((interestRecalculationCompoundingMethod: any) => {
              if (interestRecalculationCompoundingMethod !== 0) {
                this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyType', new FormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required));

                // recalculationCompoundingFrequencyType (initially 1)
                this.loanProductSettingsForm.get('recalculationCompoundingFrequencyType').valueChanges
                  .subscribe((recalculationCompoundingFrequencyType: any) => {
                    if (recalculationCompoundingFrequencyType !== 1) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyInterval', new FormControl('', Validators.required));
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDate', new FormControl(''));
                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyInterval');
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyDate');
                    }

                    if (recalculationCompoundingFrequencyType === 3) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new FormControl(''));
                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyDayOfWeekType');
                    }

                    if (recalculationCompoundingFrequencyType === 4) {
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyNthDayType', new FormControl(''));
                      this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new FormControl(''));

                      // recalculationCompoundingFrequencyNthDayType
                      this.loanProductSettingsForm.get('recalculationCompoundingFrequencyNthDayType').valueChanges
                        .subscribe((recalculationCompoundingFrequencyNthDayType: any) => {
                          if (recalculationCompoundingFrequencyNthDayType === -2) {
                            this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyOnDayType', new FormControl(''));
                            this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyDayOfWeekType');
                          } else {
                            this.loanProductSettingsForm.addControl('recalculationCompoundingFrequencyDayOfWeekType', new FormControl(''));
                            this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyOnDayType');
                          }
                        });

                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyNthDayType');
                    }
                  });

              } else {
                this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyType');
              }
            });

          // recalculationRestFrequencyType
          this.loanProductSettingsForm.get('recalculationRestFrequencyType').valueChanges
            .subscribe((recalculationRestFrequencyType: any) => {
              if (recalculationRestFrequencyType !== 1) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyInterval', new FormControl('', Validators.required));
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyDate', new FormControl(''));
              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyInterval');
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDate');
              }

              if (recalculationRestFrequencyType === 3) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new FormControl(''));
              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDayOfWeekType');
              }

              if (recalculationRestFrequencyType === 4) {
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyNthDayType', new FormControl(''));
                this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new FormControl(''));

                // recalculationRestFrequencyNthDayType
                this.loanProductSettingsForm.get('recalculationRestFrequencyNthDayType').valueChanges
                  .subscribe((recalculationRestFrequencyNthDayType: any) => {
                    if (recalculationRestFrequencyNthDayType === -2) {
                      this.loanProductSettingsForm.addControl('recalculationRestFrequencyOnDayType', new FormControl(''));
                      this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDayOfWeekType');
                    } else {
                      this.loanProductSettingsForm.addControl('recalculationRestFrequencyDayOfWeekType', new FormControl(''));
                      this.loanProductSettingsForm.removeControl('recalculationRestFrequencyOnDayType');
                    }
                  });

              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyNthDayType');
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
          this.loanProductSettingsForm.addControl('mandatoryGuarantee', new FormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('minimumGuaranteeFromOwnFunds', new FormControl(''));
          this.loanProductSettingsForm.addControl('minimumGuaranteeFromGuarantor', new FormControl(''));
        } else {
          this.loanProductSettingsForm.removeControl('mandatoryGuarantee');
          this.loanProductSettingsForm.removeControl('minimumGuaranteeFromOwnFunds');
          this.loanProductSettingsForm.removeControl('minimumGuaranteeFromGuarantor');
        }
      });

    this.loanProductSettingsForm.get('multiDisburseLoan').valueChanges
      .subscribe(multiDisburseLoan => {
        if (multiDisburseLoan) {
          this.loanProductSettingsForm.addControl('maxTrancheCount', new FormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('outstandingLoanBalance', new FormControl(''));
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

  get loanProductSettings() {
    const prevCompoundingFrequencyDate: Date = this.loanProductSettingsForm.value.recalculationCompoundingFrequencyDate;
    const prevRestFrequencyDate: Date = this.loanProductSettingsForm.value.recalculationRestFrequencyDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    if (prevCompoundingFrequencyDate) {
      this.loanProductSettingsForm.patchValue({
        recalculationCompoundingFrequencyDate: this.datePipe.transform(prevCompoundingFrequencyDate, dateFormat)
      });
    }
    if (prevRestFrequencyDate) {
      this.loanProductSettingsForm.patchValue({
        recalculationRestFrequencyDate: this.datePipe.transform(prevRestFrequencyDate, dateFormat)
      });
    }
    return this.loanProductSettingsForm.value;
  }

}
