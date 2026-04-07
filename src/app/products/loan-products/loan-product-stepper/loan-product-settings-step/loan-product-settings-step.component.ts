import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { LoanProducts } from '../../loan-products';
import { rangeValidator } from 'app/shared/validators/percentage.validator';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { CodeName, OptionData, StringEnumOptionData } from 'app/shared/models/option-data.model';
import { ProcessingStrategyService } from '../../services/processing-strategy.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-settings-step',
  templateUrl: './loan-product-settings-step.component.html',
  styleUrls: ['./loan-product-settings-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatCheckbox,
    MatDivider,
    MatIconButton,
    FaIconComponent,
    MatStepperPrevious,
    MatStepperNext
  ]
})
export class LoanProductSettingsStepComponent implements OnInit {
  DAYS_BEFORE_REPAYMENT_IS_DUE = LoanProducts.DAYS_BEFORE_REPAYMENT_IS_DUE;
  DAYS_AFTER_REPAYMENT_IS_OVERDUE = LoanProducts.DAYS_AFTER_REPAYMENT_IS_OVERDUE;

  @Input() toEdit: boolean;
  @Input() loanProductsTemplate: any;
  @Input() isLinkedToFloatingInterestRates: UntypedFormControl;
  @Output() advancePaymentStrategy = new EventEmitter<string>();

  loanProductSettingsForm: UntypedFormGroup;

  amortizationTypeData: any;
  interestTypeData: any;
  interestCalculationPeriodTypeData: any;
  transactionProcessingStrategyData: CodeName[] = [];
  transactionProcessingStrategyDataBase: CodeName[] = [];
  daysInYearTypeData: any;
  daysInMonthTypeData: any;
  preClosureInterestCalculationStrategyData: any;
  rescheduleStrategyTypeData: OptionData[];
  rescheduleStrategyTypeDataBase: OptionData[];
  interestRecalculationCompoundingTypeData: any;
  interestRecalculationFrequencyTypeData: any;
  interestRecalculationNthDayTypeData: any;
  interestRecalculationDayOfWeekTypeData: any;
  interestRecalculationOnDayTypeData: any;
  delinquencyBucketData: any;
  loanScheduleTypeData: OptionData[] = [];
  loanScheduleProcessingTypeData: OptionData[] = [];
  isAdvancedTransactionProcessingStrategy = false;
  advancedTransactionProcessingStrategyDisabled = true;
  useDueForRepaymentsConfigurations = false;
  rescheduleStrategyTypeDisabled = false;
  chargeOffBehaviourData: StringEnumOptionData[] = [];
  daysInYearCustomStrategyOptions: OptionData[] = [];
  useDaysInYearCustomStrategy = false;

  /** Values to Days for Repayments */
  defaultConfigValues: GlobalConfiguration[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private processingStrategyService: ProcessingStrategyService
  ) {
    this.createLoanProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.defaultConfigValues = this.loanProductsTemplate['itemsByDefault'];
    this.isLinkedToFloatingInterestRates.valueChanges.subscribe((isLinkedToFloatingInterestRates: any) => {
      if (isLinkedToFloatingInterestRates) {
        this.loanProductSettingsForm.get('isInterestRecalculationEnabled').setValue(true);
        this.loanProductSettingsForm.get('allowPartialPeriodInterestCalculation').setValue(true);
      }
    });

    this.amortizationTypeData = this.loanProductsTemplate.amortizationTypeOptions;
    this.interestTypeData = this.loanProductsTemplate.interestTypeOptions;
    this.interestCalculationPeriodTypeData = this.loanProductsTemplate.interestCalculationPeriodTypeOptions;
    this.transactionProcessingStrategyData = this.loanProductsTemplate.transactionProcessingStrategyOptions;
    this.transactionProcessingStrategyDataBase = this.loanProductsTemplate.transactionProcessingStrategyOptions;
    this.daysInYearTypeData = this.loanProductsTemplate.daysInYearTypeOptions;
    this.daysInMonthTypeData = this.loanProductsTemplate.daysInMonthTypeOptions;
    this.preClosureInterestCalculationStrategyData =
      this.loanProductsTemplate.preClosureInterestCalculationStrategyOptions;
    this.rescheduleStrategyTypeData = this.loanProductsTemplate.rescheduleStrategyTypeOptions;
    this.rescheduleStrategyTypeDataBase = this.loanProductsTemplate.rescheduleStrategyTypeOptions;
    this.interestRecalculationCompoundingTypeData =
      this.loanProductsTemplate.interestRecalculationCompoundingTypeOptions;
    this.interestRecalculationFrequencyTypeData = this.loanProductsTemplate.interestRecalculationFrequencyTypeOptions;
    this.interestRecalculationNthDayTypeData = this.loanProductsTemplate.interestRecalculationNthDayTypeOptions;
    this.interestRecalculationNthDayTypeData.push({ id: -2, code: 'onDay', value: 'on day' });
    this.interestRecalculationDayOfWeekTypeData = this.loanProductsTemplate.interestRecalculationDayOfWeekTypeOptions;
    this.interestRecalculationOnDayTypeData = Array.from({ length: 28 }, (_, index) => index + 1);
    this.delinquencyBucketData = this.loanProductsTemplate.delinquencyBucketOptions;
    this.loanScheduleTypeData = this.loanProductsTemplate.loanScheduleTypeOptions;
    this.loanScheduleProcessingTypeData = this.loanProductsTemplate.loanScheduleProcessingTypeOptions;
    this.chargeOffBehaviourData = this.loanProductsTemplate.chargeOffBehaviourOptions;
    this.daysInYearCustomStrategyOptions = this.loanProductsTemplate.daysInYearCustomStrategyOptions;

    const transactionProcessingStrategyCode: string =
      this.loanProductsTemplate.transactionProcessingStrategyCode || this.transactionProcessingStrategyData[0].code;
    this.loanProductSettingsForm.patchValue({
      amortizationType: this.loanProductsTemplate.amortizationType.id,
      interestType: this.loanProductsTemplate.interestType.id,
      isEqualAmortization: this.loanProductsTemplate.isEqualAmortization,
      interestCalculationPeriodType: this.loanProductsTemplate.interestCalculationPeriodType.id,
      allowPartialPeriodInterestCalculation: this.loanProductsTemplate.allowPartialPeriodInterestCalculation,
      transactionProcessingStrategyCode: transactionProcessingStrategyCode,
      graceOnPrincipalPayment: this.loanProductsTemplate.graceOnPrincipalPayment,
      graceOnInterestPayment: this.loanProductsTemplate.graceOnInterestPayment,
      graceOnInterestCharged: this.loanProductsTemplate.graceOnInterestCharged,
      inArrearsTolerance: this.loanProductsTemplate.inArrearsTolerance,
      daysInYearType: this.loanProductsTemplate.daysInYearType.id,
      daysInMonthType: this.loanProductsTemplate.daysInMonthType.id,
      canDefineInstallmentAmount: this.loanProductsTemplate.canDefineInstallmentAmount,
      graceOnArrearsAgeing: this.loanProductsTemplate.graceOnArrearsAgeing,
      overdueDaysForNPA: this.loanProductsTemplate.overdueDaysForNPA,
      accountMovesOutOfNPAOnlyOnArrearsCompletion:
        this.loanProductsTemplate.accountMovesOutOfNPAOnlyOnArrearsCompletion,
      principalThresholdForLastInstallment: this.loanProductsTemplate.principalThresholdForLastInstallment,
      allowVariableInstallments: this.loanProductsTemplate.allowVariableInstallments,
      disallowExpectedDisbursements: this.loanProductsTemplate.disallowExpectedDisbursements,
      minimumGap: this.loanProductsTemplate.minimumGap,
      maximumGap: this.loanProductsTemplate.maximumGap,
      canUseForTopup: this.loanProductsTemplate.canUseForTopup,
      isInterestRecalculationEnabled: this.loanProductsTemplate.isInterestRecalculationEnabled,
      holdGuaranteeFunds: this.loanProductsTemplate.holdGuaranteeFunds,
      multiDisburseLoan: this.loanProductsTemplate.multiDisburseLoan,
      maxTrancheCount: this.loanProductsTemplate.maxTrancheCount,
      outstandingLoanBalance: this.loanProductsTemplate.outstandingLoanBalance,
      enableDownPayment: this.loanProductsTemplate.enableDownPayment,
      enableInstallmentLevelDelinquency: this.loanProductsTemplate.enableInstallmentLevelDelinquency,
      loanScheduleType: this.loanProductsTemplate.loanScheduleType.code,
      useDueForRepaymentsConfigurations: this.loanProductsTemplate.useDueForRepaymentsConfigurations,
      allowAccrualPostingInArrears: this.loanProductsTemplate.allowAccrualPostingInArrears,
      chargeOffBehaviour: this.loanProductsTemplate.chargeOffBehaviour.id
    });

    this.isAdvancedTransactionProcessingStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(
      transactionProcessingStrategyCode
    );
    this.processingStrategyService.initialize(this.isAdvancedTransactionProcessingStrategy);
    this.validateAdvancedPaymentStrategyControls();

    if (
      this.loanProductsTemplate.dueDaysForRepaymentEvent != null &&
      this.loanProductsTemplate.overDueDaysForRepaymentEvent != null
    ) {
      this.loanProductSettingsForm.patchValue({
        useDueForRepaymentsConfigurations: false,
        dueDaysForRepaymentEvent: this.loanProductsTemplate.dueDaysForRepaymentEvent,
        overDueDaysForRepaymentEvent: this.loanProductsTemplate.overDueDaysForRepaymentEvent
      });
    } else {
      this.loanProductSettingsForm.patchValue({
        useDueForRepaymentsConfigurations: true,
        dueDaysForRepaymentEvent: null,
        overDueDaysForRepaymentEvent: null
      });
    }

    if (this.loanProductsTemplate.delinquencyBucket) {
      this.loanProductSettingsForm.patchValue({
        delinquencyBucketId:
          this.loanProductsTemplate.delinquencyBucket.id > 0 ? this.loanProductsTemplate.delinquencyBucket.id : null
      });
    }

    if (this.loanProductsTemplate.enableDownPayment) {
      this.loanProductSettingsForm.patchValue({
        disbursedAmountPercentageForDownPayment: this.loanProductsTemplate.disbursedAmountPercentageForDownPayment || 0,
        enableAutoRepaymentForDownPayment: this.loanProductsTemplate.enableAutoRepaymentForDownPayment || false
      });
    }

    if (this.loanProductsTemplate.isInterestRecalculationEnabled) {
      this.loanProductSettingsForm.patchValue({
        preClosureInterestCalculationStrategy:
          this.loanProductsTemplate.interestRecalculationData.preClosureInterestCalculationStrategy.id,
        rescheduleStrategyMethod: this.loanProductsTemplate.interestRecalculationData.rescheduleStrategyType.id,
        interestRecalculationCompoundingMethod:
          this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id,
        recalculationRestFrequencyType:
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id,
        isArrearsBasedOnOriginalSchedule:
          this.loanProductsTemplate.interestRecalculationData.isArrearsBasedOnOriginalSchedule,
        recalculationCompoundingFrequencyType:
          this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id &&
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id,
        recalculationCompoundingFrequencyInterval:
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyInterval,
        recalculationRestFrequencyInterval:
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyInterval,
        recalculationRestFrequencyNthDayType:
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 4 &&
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay
            ? -2
            : this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyNthDay &&
              this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyNthDay.id,
        recalculationCompoundingFrequencyNthDayType:
          this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id &&
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id === 4 &&
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay
            ? -2
            : this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyNthDay &&
              this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyNthDay.id,
        recalculationCompoundingFrequencyDayOfWeekType:
          this.loanProductsTemplate.interestRecalculationData.interestRecalculationCompoundingType.id &&
          ((this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id === 4 &&
            !this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay) ||
            this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyType.id === 3) &&
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyWeekday &&
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyWeekday.id,
        recalculationRestFrequencyDayOfWeekType:
          ((this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 4 &&
            !this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay) ||
            this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyType.id === 3) &&
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyWeekday &&
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyWeekday.id,
        recalculationCompoundingFrequencyOnDayType:
          this.loanProductsTemplate.interestRecalculationData.recalculationCompoundingFrequencyOnDay,
        recalculationRestFrequencyOnDayType:
          this.loanProductsTemplate.interestRecalculationData.recalculationRestFrequencyOnDay
      });
    }

    if (this.loanProductsTemplate.holdGuaranteeFunds) {
      this.loanProductSettingsForm.patchValue({
        mandatoryGuarantee: this.loanProductsTemplate.productGuaranteeData.mandatoryGuarantee,
        minimumGuaranteeFromOwnFunds: this.loanProductsTemplate.productGuaranteeData.minimumGuaranteeFromOwnFunds,
        minimumGuaranteeFromGuarantor: this.loanProductsTemplate.productGuaranteeData.minimumGuaranteeFromGuarantor
      });
    }

    if (this.loanProductsTemplate.allowAttributeOverrides) {
      this.loanProductSettingsForm.patchValue({
        allowAttributeConfiguration: Object.values(this.loanProductsTemplate.allowAttributeOverrides).some(
          (attribute: boolean) => attribute
        ),
        allowAttributeOverrides: {
          amortizationType: this.loanProductsTemplate.allowAttributeOverrides.amortizationType,
          interestType: this.loanProductsTemplate.allowAttributeOverrides.interestType,
          transactionProcessingStrategyCode:
            this.loanProductsTemplate.allowAttributeOverrides.transactionProcessingStrategyCode,
          interestCalculationPeriodType:
            this.loanProductsTemplate.allowAttributeOverrides.interestCalculationPeriodType,
          inArrearsTolerance: this.loanProductsTemplate.allowAttributeOverrides.inArrearsTolerance,
          repaymentEvery: this.loanProductsTemplate.allowAttributeOverrides.repaymentEvery,
          graceOnPrincipalAndInterestPayment:
            this.loanProductsTemplate.allowAttributeOverrides.graceOnPrincipalAndInterestPayment,
          graceOnArrearsAgeing: this.loanProductsTemplate.allowAttributeOverrides.graceOnArrearsAgeing
        }
      });
    }
  }

  createLoanProductSettingsForm() {
    this.loanProductSettingsForm = this.formBuilder.group({
      amortizationType: [
        '',
        Validators.required
      ],
      interestType: [
        '',
        Validators.required
      ],
      isEqualAmortization: [false],
      interestCalculationPeriodType: [
        '',
        Validators.required
      ],
      transactionProcessingStrategyCode: [
        '',
        Validators.required
      ],
      graceOnPrincipalPayment: [''],
      graceOnInterestPayment: [''],
      graceOnInterestCharged: [''],
      inArrearsTolerance: [''],
      daysInYearType: [
        '',
        Validators.required
      ],
      daysInMonthType: [
        '',
        Validators.required
      ],
      canDefineInstallmentAmount: [false],
      graceOnArrearsAgeing: [''],
      overdueDaysForNPA: [''],
      accountMovesOutOfNPAOnlyOnArrearsCompletion: [false],
      principalThresholdForLastInstallment: [''],
      allowVariableInstallments: [false],
      disallowExpectedDisbursements: [false],
      canUseForTopup: [false],
      isInterestRecalculationEnabled: [false],
      holdGuaranteeFunds: [false],
      multiDisburseLoan: [false],
      allowAttributeConfiguration: [true],
      allowPartialPeriodInterestCalculation: [false],
      allowAttributeOverrides: this.formBuilder.group({
        amortizationType: [true],
        interestType: [true],
        transactionProcessingStrategyCode: [true],
        interestCalculationPeriodType: [true],
        inArrearsTolerance: [true],
        repaymentEvery: [true],
        graceOnPrincipalAndInterestPayment: [true],
        graceOnArrearsAgeing: [true]
      }),
      delinquencyBucketId: [''],
      enableDownPayment: [false],
      enableInstallmentLevelDelinquency: [false],
      useDueForRepaymentsConfigurations: [false],
      dueDaysForRepaymentEvent: [''],
      overDueDaysForRepaymentEvent: [''],
      loanScheduleType: [
        LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE,
        Validators.required
      ],
      allowAccrualPostingInArrears: [false]
    });
  }

  setConditionalControls() {
    const allowAttributeOverrides = this.loanProductSettingsForm.get('allowAttributeOverrides');

    this.loanProductSettingsForm.get('daysInYearType').valueChanges.subscribe((daysInYearType: any) => {
      if (this.isAdvancedTransactionProcessingStrategy) {
        this.useDaysInYearCustomStrategy = daysInYearType == 1;
        if (this.useDaysInYearCustomStrategy) {
          const daysInYearCustomStrategy: string = this.loanProductsTemplate.daysInYearCustomStrategy?.id
            ? this.loanProductsTemplate.daysInYearCustomStrategy.id
            : this.daysInYearCustomStrategyOptions[0].id;
          this.loanProductSettingsForm.addControl(
            'daysInYearCustomStrategy',
            new UntypedFormControl(daysInYearCustomStrategy, Validators.required)
          );
        } else {
          this.loanProductSettingsForm.removeControl('daysInYearCustomStrategy');
        }
      }
    });

    this.loanProductSettingsForm
      .get('interestCalculationPeriodType')
      .valueChanges.subscribe((interestCalculationPeriodType: any) => {
        if (interestCalculationPeriodType === 0) {
          this.loanProductSettingsForm.patchValue({ allowPartialPeriodInterestCalculation: false });
        }
      });

    this.loanProductSettingsForm
      .get('allowVariableInstallments')
      .valueChanges.subscribe((allowVariableInstallments: any) => {
        if (allowVariableInstallments) {
          this.loanProductSettingsForm.addControl('minimumGap', new UntypedFormControl('', Validators.required));
          this.loanProductSettingsForm.addControl('maximumGap', new UntypedFormControl('', Validators.required));
        } else {
          this.loanProductSettingsForm.removeControl('minimumGap');
          this.loanProductSettingsForm.removeControl('maximumGap');
        }
      });

    this.loanProductSettingsForm
      .get('isInterestRecalculationEnabled')
      .valueChanges.subscribe((isInterestRecalculationEnabled: any) => {
        if (isInterestRecalculationEnabled) {
          this.loanProductSettingsForm.addControl(
            'preClosureInterestCalculationStrategy',
            new UntypedFormControl(this.preClosureInterestCalculationStrategyData[0].id, Validators.required)
          );
          this.loanProductSettingsForm.addControl(
            'rescheduleStrategyMethod',
            new UntypedFormControl(this.rescheduleStrategyTypeData[0].id, Validators.required)
          );
          this.loanProductSettingsForm.addControl(
            'interestRecalculationCompoundingMethod',
            new UntypedFormControl(this.interestRecalculationCompoundingTypeData[0].id, Validators.required)
          );
          this.loanProductSettingsForm.addControl(
            'recalculationRestFrequencyType',
            new UntypedFormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required)
          );
          this.loanProductSettingsForm.addControl('isArrearsBasedOnOriginalSchedule', new UntypedFormControl(''));
          if (this.loanProductSettingsForm.value.isInterestRecalculationEnabled) {
            this.setRescheduleStrategies();
          }
          this.loanProductSettingsForm
            .get('interestRecalculationCompoundingMethod')
            .valueChanges.subscribe((interestRecalculationCompoundingMethod: any) => {
              if (interestRecalculationCompoundingMethod !== 0) {
                this.loanProductSettingsForm.addControl(
                  'recalculationCompoundingFrequencyType',
                  new UntypedFormControl(this.interestRecalculationFrequencyTypeData[0].id, Validators.required)
                );

                this.loanProductSettingsForm
                  .get('recalculationCompoundingFrequencyType')
                  .valueChanges.subscribe((recalculationCompoundingFrequencyType: any) => {
                    if (recalculationCompoundingFrequencyType !== 1) {
                      this.loanProductSettingsForm.addControl(
                        'recalculationCompoundingFrequencyInterval',
                        new UntypedFormControl('', Validators.required)
                      );
                    } else {
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyInterval');
                    }

                    if (recalculationCompoundingFrequencyType === 3) {
                      this.loanProductSettingsForm.addControl(
                        'recalculationCompoundingFrequencyDayOfWeekType',
                        new UntypedFormControl('')
                      );
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyNthDayType');
                      this.loanProductSettingsForm.removeControl('recalculationCompoundingFrequencyOnDayType');
                    } else if (recalculationCompoundingFrequencyType === 4) {
                      this.loanProductSettingsForm.addControl(
                        'recalculationCompoundingFrequencyNthDayType',
                        new UntypedFormControl('')
                      );
                      this.loanProductSettingsForm.addControl(
                        'recalculationCompoundingFrequencyDayOfWeekType',
                        new UntypedFormControl('')
                      );

                      this.loanProductSettingsForm
                        .get('recalculationCompoundingFrequencyNthDayType')
                        .valueChanges.subscribe((recalculationCompoundingFrequencyNthDayType: any) => {
                          if (recalculationCompoundingFrequencyNthDayType === -2) {
                            this.loanProductSettingsForm.addControl(
                              'recalculationCompoundingFrequencyOnDayType',
                              new UntypedFormControl('')
                            );
                            this.loanProductSettingsForm.removeControl(
                              'recalculationCompoundingFrequencyDayOfWeekType'
                            );
                          } else {
                            this.loanProductSettingsForm.addControl(
                              'recalculationCompoundingFrequencyDayOfWeekType',
                              new UntypedFormControl('')
                            );
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

          this.loanProductSettingsForm
            .get('recalculationRestFrequencyType')
            .valueChanges.subscribe((recalculationRestFrequencyType: any) => {
              if (recalculationRestFrequencyType !== 1) {
                this.loanProductSettingsForm.addControl(
                  'recalculationRestFrequencyInterval',
                  new UntypedFormControl('', Validators.required)
                );
              } else {
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyInterval');
              }

              if (recalculationRestFrequencyType === 3) {
                this.loanProductSettingsForm.addControl(
                  'recalculationRestFrequencyDayOfWeekType',
                  new UntypedFormControl('')
                );
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyNthDayType');
                this.loanProductSettingsForm.removeControl('recalculationRestFrequencyOnDayType');
              } else if (recalculationRestFrequencyType === 4) {
                this.loanProductSettingsForm.addControl(
                  'recalculationRestFrequencyNthDayType',
                  new UntypedFormControl('')
                );
                this.loanProductSettingsForm.addControl(
                  'recalculationRestFrequencyDayOfWeekType',
                  new UntypedFormControl('')
                );

                this.loanProductSettingsForm
                  .get('recalculationRestFrequencyNthDayType')
                  .valueChanges.subscribe((recalculationRestFrequencyNthDayType: any) => {
                    if (recalculationRestFrequencyNthDayType === -2) {
                      this.loanProductSettingsForm.addControl(
                        'recalculationRestFrequencyOnDayType',
                        new UntypedFormControl('')
                      );
                      this.loanProductSettingsForm.removeControl('recalculationRestFrequencyDayOfWeekType');
                    } else {
                      this.loanProductSettingsForm.addControl(
                        'recalculationRestFrequencyDayOfWeekType',
                        new UntypedFormControl('')
                      );
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
        this.enableFieldsWhenScheduleTypeIsProgressiveAndInterestRateRecalculationEnabled();
      });

    this.loanProductSettingsForm.get('holdGuaranteeFunds').valueChanges.subscribe((holdGuaranteeFunds) => {
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

    this.loanProductSettingsForm.get('multiDisburseLoan').valueChanges.subscribe((multiDisburseLoan) => {
      if (multiDisburseLoan) {
        this.loanProductSettingsForm.addControl('maxTrancheCount', new UntypedFormControl('', Validators.required));
        this.loanProductSettingsForm.addControl('outstandingLoanBalance', new UntypedFormControl(''));
      } else {
        this.loanProductSettingsForm.removeControl('maxTrancheCount');
        this.loanProductSettingsForm.removeControl('outstandingLoanBalance');
        this.loanProductSettingsForm.patchValue({ disallowExpectedDisbursements: false });
      }
    });

    this.loanProductSettingsForm.get('enableDownPayment').valueChanges.subscribe((enableDownPayment) => {
      if (enableDownPayment) {
        this.loanProductSettingsForm.addControl(
          'disbursedAmountPercentageForDownPayment',
          new UntypedFormControl(0, [
            Validators.required,
            rangeValidator(0, 100)])
        );
        this.loanProductSettingsForm.addControl('enableAutoRepaymentForDownPayment', new UntypedFormControl(false, []));
      } else {
        this.loanProductSettingsForm.removeControl('disbursedAmountPercentageForDownPayment');
        this.loanProductSettingsForm.removeControl('enableAutoRepaymentForDownPayment');
      }
    });

    this.loanProductSettingsForm
      .get('transactionProcessingStrategyCode')
      .valueChanges.subscribe((transactionProcessingStrategyCode: string) => {
        this.advancePaymentStrategy.emit(transactionProcessingStrategyCode);
        this.isAdvancedTransactionProcessingStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(
          transactionProcessingStrategyCode
        );
        this.processingStrategyService.initialize(this.isAdvancedTransactionProcessingStrategy);
        this.validateAdvancedPaymentStrategyControls();
      });

    this.loanProductSettingsForm
      .get('allowAttributeConfiguration')
      .valueChanges.subscribe((allowAttributeConfiguration: any) => {
        if (allowAttributeConfiguration) {
          allowAttributeOverrides.patchValue({
            amortizationType: true,
            interestType: true,
            transactionProcessingStrategyCode: true,
            interestCalculationPeriodType: true,
            inArrearsTolerance: true,
            repaymentEvery: true,
            graceOnPrincipalAndInterestPayment: true,
            graceOnArrearsAgeing: true
          });
        } else {
          allowAttributeOverrides.patchValue({
            amortizationType: false,
            interestType: false,
            transactionProcessingStrategyCode: false,
            interestCalculationPeriodType: false,
            inArrearsTolerance: false,
            repaymentEvery: false,
            graceOnPrincipalAndInterestPayment: false,
            graceOnArrearsAgeing: false
          });
        }
      });

    this.loanProductSettingsForm
      .get('useDueForRepaymentsConfigurations')
      .valueChanges.subscribe((useDueForRepaymentsConfigurations: boolean) => {
        if (useDueForRepaymentsConfigurations) {
          this.loanProductSettingsForm.patchValue({
            dueDaysForRepaymentEvent: null,
            overDueDaysForRepaymentEvent: null
          });
        } else {
          this.loanProductSettingsForm.patchValue({
            dueDaysForRepaymentEvent: this.getGlobalConfigValue(LoanProducts.DAYS_BEFORE_REPAYMENT_IS_DUE),
            overDueDaysForRepaymentEvent: this.getGlobalConfigValue(LoanProducts.DAYS_AFTER_REPAYMENT_IS_OVERDUE)
          });
        }
      });

    this.loanProductSettingsForm.get('loanScheduleType').valueChanges.subscribe((loanScheduleType: string) => {
      this.transactionProcessingStrategyData = [];
      if (loanScheduleType === LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
        // Filter Advanced Payment Allocation Strategy
        this.transactionProcessingStrategyData = this.transactionProcessingStrategyDataBase.filter(
          (cn: CodeName) => !LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)
        );
        if (
          LoanProducts.isAdvancedPaymentAllocationStrategy(
            this.loanProductSettingsForm.value.transactionProcessingStrategyCode
          )
        ) {
          this.loanProductSettingsForm.patchValue({
            transactionProcessingStrategyCode: this.transactionProcessingStrategyData[0].code
          });
        }
        this.advancedTransactionProcessingStrategyDisabled = false;
        this.isAdvancedTransactionProcessingStrategy = false;
        this.loanProductSettingsForm.removeControl('chargeOffBehaviour');
      } else {
        // Only Advanced Payment Allocation Strategy
        this.transactionProcessingStrategyDataBase.some((cn: CodeName) => {
          if (LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)) {
            this.transactionProcessingStrategyData.push(cn);
          }
        });
        this.advancedTransactionProcessingStrategyDisabled = true;
        this.loanProductSettingsForm.patchValue({
          transactionProcessingStrategyCode: this.transactionProcessingStrategyData[0].code
        });
        this.isAdvancedTransactionProcessingStrategy = true;
        this.loanProductSettingsForm.addControl(
          'chargeOffBehaviour',
          new UntypedFormControl(this.loanProductsTemplate.chargeOffBehaviour.id)
        );
        this.validateAdvancedPaymentStrategyControls();
      }
      if (this.loanProductSettingsForm.value.isInterestRecalculationEnabled) {
        this.setRescheduleStrategies();
      }
      this.processingStrategyService.initialize(this.isAdvancedTransactionProcessingStrategy);
      this.enableFieldsWhenScheduleTypeIsProgressiveAndInterestRateRecalculationEnabled();
    });
  }

  private enableFieldsWhenScheduleTypeIsProgressiveAndInterestRateRecalculationEnabled() {
    const isProgressiveLoan =
      this.loanProductSettingsForm.get('loanScheduleType').value === LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE;
    const isInterestRecalculationEnabled =
      this.loanProductSettingsForm.get('isInterestRecalculationEnabled').value == true;
    const shouldControlExists = isProgressiveLoan && isInterestRecalculationEnabled;
    const isControlExists = this.loanProductSettingsForm.contains('disallowInterestCalculationOnPastDue');

    if (shouldControlExists && !isControlExists) {
      this.loanProductSettingsForm.addControl('disallowInterestCalculationOnPastDue', new UntypedFormControl(''));
      this.loanProductSettingsForm.patchValue({
        disallowInterestCalculationOnPastDue:
          this.loanProductsTemplate.interestRecalculationData?.disallowInterestCalculationOnPastDue ?? false
      });
    } else if (isControlExists && !shouldControlExists) {
      this.loanProductSettingsForm.patchValue({ disallowInterestCalculationOnPastDue: undefined });
      this.loanProductSettingsForm.removeControl('disallowInterestCalculationOnPastDue');
    }
  }

  private setRescheduleStrategies() {
    if (this.advancedTransactionProcessingStrategyDisabled) {
      this.rescheduleStrategyTypeData = this.rescheduleStrategyTypeDataBase.filter((o: OptionData) => o.id > 3);
      this.loanProductSettingsForm.patchValue({
        rescheduleStrategyMethod: this.rescheduleStrategyTypeData[0].id
      });
      this.rescheduleStrategyTypeDisabled = true;
    } else {
      this.rescheduleStrategyTypeData = this.rescheduleStrategyTypeDataBase.filter((o: OptionData) => o.id < 4);
      this.loanProductSettingsForm.patchValue({
        rescheduleStrategyMethod: this.rescheduleStrategyTypeData[0].id
      });
      this.rescheduleStrategyTypeDisabled = false;
    }
  }

  private getGlobalConfigValue(configName: string): number {
    let value: number | null = null;
    this.defaultConfigValues.forEach((config: GlobalConfiguration) => {
      if (config.name === configName) {
        value = config.value;
      }
    });
    return value;
  }

  clearProperty($event: Event, propertyName: string): void {
    if (propertyName === 'delinquencyBucketId') {
      this.loanProductSettingsForm.patchValue({
        delinquencyBucketId: '',
        enableInstallmentLevelDelinquency: false
      });
    }
    this.loanProductSettingsForm.markAsDirty();
    $event.stopPropagation();
  }

  get loanProductSettings() {
    const productSettings = this.loanProductSettingsForm.value;
    if (this.loanProductSettingsForm.value.useDueForRepaymentsConfigurations) {
      productSettings['dueDaysForRepaymentEvent'] = null;
      productSettings['overDueDaysForRepaymentEvent'] = null;
    }
    if (productSettings['delinquencyBucketId'] === '') {
      productSettings['delinquencyBucketId'] = null;
    }
    return productSettings;
  }

  private validateAdvancedPaymentStrategyControls(): void {
    if (this.isAdvancedTransactionProcessingStrategy) {
      const daysInYearType: any = this.loanProductSettingsForm.get('daysInYearType').value;
      this.loanProductSettingsForm.addControl(
        'loanScheduleProcessingType',
        new UntypedFormControl(
          this.loanProductsTemplate.loanScheduleProcessingType.code ||
            LoanProducts.LOAN_SCHEDULE_PROCESSING_TYPE_HORIZONTAL,
          [Validators.required]
        )
      );
      this.useDaysInYearCustomStrategy = daysInYearType === 1;
      if (this.useDaysInYearCustomStrategy) {
        const daysInYearCustomStrategy: string = this.loanProductsTemplate.daysInYearCustomStrategy?.id
          ? this.loanProductsTemplate.daysInYearCustomStrategy.id
          : this.daysInYearCustomStrategyOptions[0].id;
        this.loanProductSettingsForm.addControl(
          'daysInYearCustomStrategy',
          new UntypedFormControl(daysInYearCustomStrategy, Validators.required)
        );
      }
    } else {
      this.useDaysInYearCustomStrategy = false;
      this.loanProductSettingsForm.removeControl('loanScheduleProcessingType');
      this.loanProductSettingsForm.removeControl('daysInYearCustomStrategy');
    }
  }
}
